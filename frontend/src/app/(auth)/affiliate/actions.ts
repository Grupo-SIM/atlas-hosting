"use server";

import { and, eq, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgAffiliateCommission, pgWithdrawalRequests } from "@/lib/db/schema";
import simpayApi from "@/lib/server/apis/simpay";

function getMinWithdrawal() {
  return Number(process.env.AFFILIATE_MIN_WITHDRAWAL) || 100;
}

function getWithdrawalFee() {
  return Number(process.env.AFFILIATE_WITHDRAWAL_FEE) || 2;
}

export async function getAffiliateBalance(userId: string): Promise<{
  available: number;
  pendingWithdrawals: number;
}> {
  // Ensure callers can only query their own balance
  const user = await getUser();
  if (user.id !== userId) {
    return { available: 0, pendingWithdrawals: 0 };
  }

  const [commissionsRow] = await db
    .select({ total: sum(pgAffiliateCommission.commissionAmount) })
    .from(pgAffiliateCommission)
    .where(
      and(
        eq(pgAffiliateCommission.affiliateUserId, userId),
        eq(pgAffiliateCommission.status, "available")
      )
    );

  const [pendingRow] = await db
    .select({ total: sum(pgWithdrawalRequests.amount) })
    .from(pgWithdrawalRequests)
    .where(
      and(
        eq(pgWithdrawalRequests.userId, userId),
        eq(pgWithdrawalRequests.status, "pending")
      )
    );

  const totalAvailableCommissions = Number(commissionsRow?.total ?? 0);
  const pendingWithdrawals = Number(pendingRow?.total ?? 0);

  return {
    available: Math.max(0, totalAvailableCommissions - pendingWithdrawals),
    pendingWithdrawals,
  };
}

export async function requestWithdrawal(
  amount: number,
  pixKey: string
): Promise<{ error?: string; success?: boolean }> {
  const user = await getUser();
  const minWithdrawal = getMinWithdrawal();
  const fee = getWithdrawalFee();

  if (amount < minWithdrawal) {
    return {
      error: `Valor mínimo para saque é R$${minWithdrawal.toFixed(2)}`,
    };
  }

  const trimmedPix = pixKey?.trim();
  if (!trimmedPix || trimmedPix.length < 5) {
    return { error: "Chave PIX inválida" };
  }

  const cpf = user.billingDocument?.replace(/\D/g, "") ?? "";
  if (cpf.length !== 11) {
    return {
      error:
        "CPF do afiliado nao encontrado. Atualize seus dados de faturamento antes de solicitar saque.",
    };
  }

  const { available } = await getAffiliateBalance(user.id);
  if (amount > available) {
    return { error: "Saldo insuficiente" };
  }

  let simpayWithdrawalId: string;

  // Submit to simpay (non-blocking — withdrawal record already created)
  try {
    const result = await simpayApi.requestWithdrawal({
      amount,
      cpf,
      email: user.email,
      pixKey: trimmedPix,
    });

    simpayWithdrawalId = result.id;
  } catch (err) {
    console.error("[WITHDRAWAL] Falha ao submeter para simpay:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Falha ao enviar a solicitacao para a Simpay.",
    };
  }

  const withdrawalId = uuidv4();

  await db.insert(pgWithdrawalRequests).values({
    amount,
    fee,
    id: withdrawalId,
    pixKey: trimmedPix,
    simpayWithdrawalId,
    status: "pending",
    userId: user.id,
  });

  revalidatePath("/affiliate");
  return { success: true };
}

export async function cancelLocalWithdrawal(
  withdrawalId: string
): Promise<{ error?: string; success?: boolean }> {
  const user = await getUser();

  const withdrawal = await db.query.pgWithdrawalRequests.findFirst({
    where: and(
      eq(pgWithdrawalRequests.id, withdrawalId),
      eq(pgWithdrawalRequests.userId, user.id)
    ),
  });

  if (!withdrawal) {
    return { error: "Saque nao encontrado." };
  }

  if (withdrawal.status !== "pending") {
    return { error: "Somente saques pendentes podem ser cancelados." };
  }

  if (withdrawal.simpayWithdrawalId) {
    return {
      error:
        "Este saque ja foi enviado para a Simpay. Cancele ou rejeite pela Simpay.",
    };
  }

  await db
    .update(pgWithdrawalRequests)
    .set({
      rejectionReason: "Cancelado pelo afiliado antes de enviar para a Simpay.",
      status: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(pgWithdrawalRequests.id, withdrawalId));

  revalidatePath("/affiliate");
  return { success: true };
}

export async function syncWithdrawalStatus(
  withdrawalId: string
): Promise<void> {
  const user = await getUser();

  const withdrawal = await db.query.pgWithdrawalRequests.findFirst({
    where: and(
      eq(pgWithdrawalRequests.id, withdrawalId),
      eq(pgWithdrawalRequests.userId, user.id)
    ),
  });

  if (withdrawal?.status !== "pending" || !withdrawal.simpayWithdrawalId) {
    return;
  }

  try {
    const remote = await simpayApi.getWithdrawalStatus(
      withdrawal.simpayWithdrawalId
    );

    console.log(
      `[WITHDRAWAL-SYNC] Status remoto para ${withdrawalId}:`,
      remote
    );

    const normalizedStatus = remote.status?.toLowerCase();

    if (["approved", "completed", "aprovada"].includes(normalizedStatus)) {
      await db.transaction(async tx => {
        await tx
          .update(pgWithdrawalRequests)
          .set({ status: "approved", updatedAt: new Date() })
          .where(eq(pgWithdrawalRequests.id, withdrawalId));

        const commissions = await tx.query.pgAffiliateCommission.findMany({
          orderBy: (t, { asc }) => [asc(t.createdAt)],
          where: and(
            eq(pgAffiliateCommission.affiliateUserId, user.id),
            eq(pgAffiliateCommission.status, "available")
          ),
        });

        let remaining = withdrawal.amount;
        for (const commission of commissions) {
          if (remaining < 0.001) break;
          await tx
            .update(pgAffiliateCommission)
            .set({ status: "withdrawn" })
            .where(eq(pgAffiliateCommission.id, commission.id));
          remaining -= commission.commissionAmount;
        }
      });
    } else if (
      ["rejected", "recusada", "failed", "expired"].includes(normalizedStatus)
    ) {
      await db
        .update(pgWithdrawalRequests)
        .set({
          rejectionReason: remote.rejectionReason ?? "Rejeitado pela operadora",
          status: "rejected",
          updatedAt: new Date(),
        })
        .where(eq(pgWithdrawalRequests.id, withdrawalId));
    }

    revalidatePath("/affiliate");
  } catch (err) {
    console.error("[WITHDRAWAL-SYNC] Erro ao verificar status:", err);
  }
}
