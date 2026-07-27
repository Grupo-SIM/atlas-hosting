"use server";

import { db } from "@/lib/db";
import { pgVpsPaymentLink, pgUser } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { findSellablePlan, type SellableProductType } from "@/lib/vps-sellable-plans";

export type PaymentLinkRow = {
  id: string;
  productType: SellableProductType;
  planId: string;
  planName: string;
  intervalMonths: number;
  amountBrl: number;
  allowPix: boolean;
  status: "pending" | "used" | "cancelled";
  linkedUserName: string | null;
  linkedUserEmail: string | null;
  createdAt: Date;
  usedAt: Date | null;
};

export async function getVpsPaymentLinksAction(): Promise<PaymentLinkRow[]> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const links = await db.query.pgVpsPaymentLink.findMany({
    with: { linkedUser: { columns: { name: true, email: true } } },
    orderBy: [desc(pgVpsPaymentLink.createdAt)],
    limit: 200,
  });

  return links.map((l) => ({
    id: l.id,
    productType: l.productType as SellableProductType,
    planId: l.planId,
    planName: l.planName,
    intervalMonths: l.intervalMonths,
    amountBrl: l.amountBrl,
    allowPix: l.allowPix,
    status: l.status as PaymentLinkRow["status"],
    linkedUserName: (l.linkedUser as any)?.name ?? null,
    linkedUserEmail: (l.linkedUser as any)?.email ?? null,
    createdAt: l.createdAt,
    usedAt: l.usedAt,
  }));
}

export async function searchCustomersAction(): Promise<{ id: string; name: string; email: string }[]> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const users = await db.query.pgUser.findMany({
    columns: { id: true, name: true, email: true },
    orderBy: [desc(pgUser.createdAt)],
    limit: 300,
  });
  return users;
}

export async function createVpsPaymentLinkAction(formData: FormData): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const productType = String(formData.get("productType") || "") as SellableProductType;
  const planId = String(formData.get("planId") || "");
  const intervalMonths = parseInt(String(formData.get("intervalMonths") || ""), 10);
  const amountBrl = parseFloat(String(formData.get("amountBrl") || ""));
  const allowPix = formData.get("allowPix") === "on";
  const linkedUserId = String(formData.get("linkedUserId") || "").trim();

  const plan = findSellablePlan(productType, planId);
  if (!plan) throw new Error("Plano inválido.");
  if (!Number.isInteger(intervalMonths) || intervalMonths < 1) {
    throw new Error("Período inválido — precisa ser um número inteiro de meses maior que zero.");
  }
  if (!Number.isFinite(amountBrl) || amountBrl <= 0) {
    throw new Error("Valor inválido.");
  }

  let linkedOrgId: string | null = null;
  let resolvedLinkedUserId: string | null = null;
  if (linkedUserId && linkedUserId !== "none") {
    const linkedUser = await db.query.pgUser.findFirst({ where: eq(pgUser.id, linkedUserId) });
    if (!linkedUser) throw new Error("Cliente selecionado não encontrado.");
    if (!linkedUser.organizationId) throw new Error("Cliente selecionado não tem organização vinculada.");
    resolvedLinkedUserId = linkedUser.id;
    linkedOrgId = linkedUser.organizationId;
  }

  await db.insert(pgVpsPaymentLink).values({
    createdByAdminId: admin.id,
    productType,
    planId,
    planName: plan.name,
    intervalMonths,
    amountBrl,
    allowPix,
    linkedUserId: resolvedLinkedUserId,
    linkedOrgId,
  });

  revalidatePath("/admin/vps-plans/payment-links");
}

export async function cancelVpsPaymentLinkAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  await db
    .update(pgVpsPaymentLink)
    .set({ status: "cancelled" })
    .where(eq(pgVpsPaymentLink.id, id));

  revalidatePath("/admin/vps-plans/payment-links");
}
