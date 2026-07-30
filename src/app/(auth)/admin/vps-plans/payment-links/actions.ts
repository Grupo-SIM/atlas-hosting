"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgUser, pgVpsPaymentLink } from "@/lib/db/schema";
import {
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

  let linkedOrgId: string | null = null;
  let resolvedLinkedUserId: string | null = null;
  if (linkedUserId && linkedUserId !== "none") {
    const linkedUser = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, linkedUserId),
    });
    if (!linkedUser) throw new Error("Cliente selecionado não encontrado.");
    if (!linkedUser.organizationId)
      throw new Error("Cliente selecionado não tem organização vinculada.");
    resolvedLinkedUserId = linkedUser.id;
    linkedOrgId = linkedUser.organizationId;
  }

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

export async function cancelVpsPaymentLinkAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  await db
    .update(pgVpsPaymentLink)
    .set({ status: "cancelled" })
    .where(eq(pgVpsPaymentLink.id, id));

  revalidatePath("/admin/vps-plans/payment-links");
}

/**
 * Apaga a linha do link. A fatura gerada por ele (se houver) não é tocada — ela
 * pertence ao cliente e pode até já estar paga; some só o registro do link.
 */
export async function deleteVpsPaymentLinkAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  await db.delete(pgVpsPaymentLink).where(eq(pgVpsPaymentLink.id, id));

  revalidatePath("/admin/vps-plans/payment-links");
}
