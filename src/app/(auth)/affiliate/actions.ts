"use server";

import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { and, eq, sum } from "drizzle-orm";
import simpayApi from "@/lib/server/apis/simpay";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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

  const { available } = await getAffiliateBalance(user.id);
  if (amount > available) {
    return { error: "Saldo insuficiente" };
  }

  const withdrawalId = uuidv4();

  await db.insert(pgWithdrawalRequests).values({
    id: withdrawalId,
    userId: user.id,
    status: "pending",
    amount,
    pixKey: trimmedPix,
    fee,
  });

  // Submit to simpay (non-blocking — withdrawal record already created)
  try {
    const result = await simpayApi.requestWithdrawal({
      valor: amount,
      chavePix: trimmedPix,
      description: `atlas-${user.id}`,
    });

    await db
      .update(pgWithdrawalRequests)
      .set({ simpayWithdrawalId: result.id })
      .where(eq(pgWithdrawalRequests.id, withdrawalId));
  } catch (err) {
    console.error("[WITHDRAWAL] Falha ao submeter para simpay:", err);
    // Withdrawal record exists; admin can process manually
  }

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

  if (
    !withdrawal ||
    withdrawal.status !== "pending" ||
    !withdrawal.simpayWithdrawalId
  ) {
    return;
  }

  try {
    const remote = await simpayApi.getWithdrawalStatus(
      withdrawal.simpayWithdrawalId
    );

    const normalizedStatus = remote.status?.toLowerCase();

    if (normalizedStatus === "approved" || normalizedStatus === "completed") {
      await db.transaction(async (tx) => {
        await tx
          .update(pgWithdrawalRequests)
          .set({ status: "approved", updatedAt: new Date() })
          .where(eq(pgWithdrawalRequests.id, withdrawalId));

        const commissions = await tx.query.pgAffiliateCommission.findMany({
          where: and(
            eq(pgAffiliateCommission.affiliateUserId, user.id),
            eq(pgAffiliateCommission.status, "available")
          ),
          orderBy: (t, { asc }) => [asc(t.createdAt)],
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
    } else if (normalizedStatus === "rejected") {
      await db
        .update(pgWithdrawalRequests)
        .set({
          status: "rejected",
          rejectionReason:
            remote.rejectionReason ?? "Rejeitado pela operadora",
          updatedAt: new Date(),
        })
        .where(eq(pgWithdrawalRequests.id, withdrawalId));
    }

    revalidatePath("/affiliate");
  } catch (err) {
    console.error("[WITHDRAWAL-SYNC] Erro ao verificar status:", err);
  }
}
