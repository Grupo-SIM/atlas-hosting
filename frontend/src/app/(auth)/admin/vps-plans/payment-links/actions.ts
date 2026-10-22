"use server";

import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice, pgUser, pgVpsPaymentLink } from "@/lib/db/schema";
import {
  assertPaymentLinkEditable,
  type PaymentLinkEffectiveStatus,
  paymentLinkEffectiveStatus,
} from "@/lib/payment-links/status";
import {
  findSellablePlan,
  type SellableProductType,
} from "@/lib/vps-sellable-plans";

export interface PaymentLinkRow {
  id: string;
  productType: SellableProductType;
  planId: string;
  planName: string;
  intervalMonths: number;
  amountBrl: number;
  allowPix: boolean;
  allowBoleto: boolean;
  status: PaymentLinkEffectiveStatus;
  linkedUserId: string | null;
  linkedUserName: string | null;
  linkedUserEmail: string | null;
  createdAt: Date;
  usedAt: Date | null;
}

export async function getVpsPaymentLinksAction(): Promise<PaymentLinkRow[]> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const links = await db.query.pgVpsPaymentLink.findMany({
    limit: 200,
    orderBy: [desc(pgVpsPaymentLink.createdAt)],
    with: {
      linkedUser: { columns: { email: true, name: true } },
      resultingInvoice: { columns: { status: true } },
    },
  });

  return links.map(l => ({
    allowBoleto: l.allowBoleto,
    allowPix: l.allowPix,
    amountBrl: l.amountBrl,
    createdAt: l.createdAt,
    id: l.id,
    intervalMonths: l.intervalMonths,
    linkedUserEmail: (l.linkedUser as any)?.email ?? null,
    linkedUserId: l.linkedUserId,
    linkedUserName: (l.linkedUser as any)?.name ?? null,
    planId: l.planId,
    planName: l.planName,
    productType: l.productType as SellableProductType,
    status: paymentLinkEffectiveStatus(
      l.status,
      (l.resultingInvoice as { status?: string } | null)?.status
    ),
    usedAt: l.usedAt,
  }));
}

export async function searchCustomersAction(): Promise<
  { id: string; name: string; email: string }[]
> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const users = await db.query.pgUser.findMany({
    columns: { email: true, id: true, name: true },
    limit: 300,
    orderBy: [desc(pgUser.createdAt)],
  });
  return users;
}

/**
 * "none"/vazio = link genérico. Caso contrário resolve o cliente e a org dele —
 * sem org não dá pra pendurar a cobrança em lugar nenhum.
 */
async function resolveLinkedCustomer(linkedUserId: string): Promise<{
  linkedOrgId: string | null;
  resolvedLinkedUserId: string | null;
}> {
  const id = linkedUserId.trim();
  if (!id || id === "none")
    return { linkedOrgId: null, resolvedLinkedUserId: null };

  const linkedUser = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, id),
  });
  if (!linkedUser) throw new Error("Cliente selecionado não encontrado.");
  if (!linkedUser.organizationId)
    throw new Error("Cliente selecionado não tem organização vinculada.");

  return {
    linkedOrgId: linkedUser.organizationId,
    resolvedLinkedUserId: linkedUser.id,
  };
}

export async function createVpsPaymentLinkAction(
  formData: FormData
): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const productType = String(
    formData.get("productType") || ""
  ) as SellableProductType;
  const planId = String(formData.get("planId") || "");
  const intervalMonths = Number.parseInt(
    String(formData.get("intervalMonths") || ""),
    10
  );
  const amountBrl = Number.parseFloat(String(formData.get("amountBrl") || ""));
  const allowPix = formData.get("allowPix") === "on";
  const allowBoleto = formData.get("allowBoleto") === "on";
  const linkedUserId = String(formData.get("linkedUserId") || "").trim();

  const plan = findSellablePlan(productType, planId);
  if (!plan) throw new Error("Plano inválido.");
  if (!Number.isInteger(intervalMonths) || intervalMonths < 1) {
    throw new Error(
      "Período inválido — precisa ser um número inteiro de meses maior que zero."
    );
  }
  if (!Number.isFinite(amountBrl) || amountBrl <= 0) {
    throw new Error("Valor inválido.");
  }

  const { linkedOrgId, resolvedLinkedUserId } =
    await resolveLinkedCustomer(linkedUserId);

  await db.insert(pgVpsPaymentLink).values({
    allowBoleto,
    allowPix,
    amountBrl,
    createdByAdminId: admin.id,
    intervalMonths,
    linkedOrgId,
    linkedUserId: resolvedLinkedUserId,
    planId,
    planName: plan.name,
    productType,
  });

  revalidatePath("/admin/vps-plans/payment-links");
}

/**
 * Troca (ou remove) o cliente vinculado de um link que ainda não foi pago.
 *
 * Se o link já gerou uma fatura pendente — alguém abriu a URL — ela precisa
 * acompanhar a troca: vira do novo cliente, ou expira quando o link volta a ser
 * genérico (aí a próxima abertura cria uma fatura nova pelo fluxo de checkout).
 */
export async function updateVpsPaymentLinkCustomerAction(
  id: string,
  linkedUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  return db.transaction(async (tx): Promise<{ ok: true } | { ok: false; error: string }> => {
    await tx.execute(sql`SELECT id FROM vps_payment_links WHERE id = ${id} FOR UPDATE`);
  const link = await tx.query.pgVpsPaymentLink.findFirst({
    where: eq(pgVpsPaymentLink.id, id),
    with: { resultingInvoice: { columns: { id: true, status: true, metadata: true } } },
  });
  if (!link) return { error: "Link não encontrado.", ok: false };

  if (link.resultingInvoiceId) await tx.execute(sql`SELECT id FROM invoices WHERE id = ${link.resultingInvoiceId} FOR UPDATE`);
  const currentInvoice = link.resultingInvoiceId ? await tx.query.pgInvoice.findFirst({ where: eq(pgInvoice.id, link.resultingInvoiceId) }) : null;
  const invoice = currentInvoice as {
    id: string;
    status: string;
  } | null;
  try { assertPaymentLinkEditable(currentInvoice); } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
  const status = paymentLinkEffectiveStatus(link.status, invoice?.status);
  if (status !== "pending") {
    return {
      error:
        "Só dá pra trocar o cliente de um link que ainda está aguardando pagamento.",
      ok: false,
    };
  }

  let linkedOrgId: string | null;
  let resolvedLinkedUserId: string | null;
  try {
    ({ linkedOrgId, resolvedLinkedUserId } =
      await resolveLinkedCustomer(linkedUserId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Cliente inválido.",
      ok: false,
    };
  }
  if (resolvedLinkedUserId === link.linkedUserId) return { ok: true };

  if (invoice?.status === "pending") {
    if (resolvedLinkedUserId && linkedOrgId) {
      await tx
        .update(pgInvoice)
        .set({
          // A voucher belongs to the original payer; transferring the invoice releases it.
          amount: sql`coalesce(${pgInvoice.originalAmount}, ${pgInvoice.amount})`,
          originalAmount: null,
          voucherId: null,
          voucherDiscount: 0,
          orgId: linkedOrgId,
          updatedAt: new Date(),
          userId: resolvedLinkedUserId,
        })
        .where(eq(pgInvoice.id, invoice.id));
    } else {
      await tx
        .update(pgInvoice)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(pgInvoice.id, invoice.id));
    }
  }

  await tx
    .update(pgVpsPaymentLink)
    .set({
      linkedOrgId,
      linkedUserId: resolvedLinkedUserId,
      // Link genérico com fatura expirada precisa gerar uma nova na próxima visita.
      resultingInvoiceId:
        invoice && !resolvedLinkedUserId ? null : link.resultingInvoiceId,
    })
    .where(eq(pgVpsPaymentLink.id, id));

  revalidatePath("/admin/vps-plans/payment-links");
  return { ok: true };
  });
}

export async function cancelVpsPaymentLinkAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  await db.transaction(async tx => {
    await tx.execute(sql`SELECT id FROM vps_payment_links WHERE id = ${id} FOR UPDATE`);
    const link = await tx.query.pgVpsPaymentLink.findFirst({ where: eq(pgVpsPaymentLink.id, id), with: { resultingInvoice: true } });
    if (!link) throw new Error("Link não encontrado.");
    if (link.resultingInvoiceId) await tx.execute(sql`SELECT id FROM invoices WHERE id = ${link.resultingInvoiceId} FOR UPDATE`);
    const invoice = link.resultingInvoiceId ? await tx.query.pgInvoice.findFirst({ where: eq(pgInvoice.id, link.resultingInvoiceId) }) : null;
    assertPaymentLinkEditable(invoice);
    if (invoice && ["pending", "failed"].includes(invoice.status)) await tx.update(pgInvoice).set({ status: "expired", updatedAt: new Date() }).where(eq(pgInvoice.id, invoice.id));
    await tx.update(pgVpsPaymentLink).set({ status: "cancelled" }).where(eq(pgVpsPaymentLink.id, id));
  });

  revalidatePath("/admin/vps-plans/payment-links");
}

/**
 * Apaga a linha do link. A fatura gerada por ele (se houver) não é tocada — ela
 * pertence ao cliente e pode até já estar paga; some só o registro do link.
 */
export async function deleteVpsPaymentLinkAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const link = await db.query.pgVpsPaymentLink.findFirst({ where: eq(pgVpsPaymentLink.id, id), with: { resultingInvoice: true } });
  if (link && link.status !== "cancelled" && link.resultingInvoice?.status !== "paid") await cancelVpsPaymentLinkAction(id);
  await db.delete(pgVpsPaymentLink).where(eq(pgVpsPaymentLink.id, id));

  revalidatePath("/admin/vps-plans/payment-links");
}
