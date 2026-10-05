"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRealUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice, pgVoucher } from "@/lib/db/schema";
import { calculateVoucherDiscount } from "@/lib/server/vouchers/discount";

export type ApplyVoucherResult = { status: "success"; discount: number; finalAmount: number; voucherId: string; message: string } | { status: "error"; message: string };

export async function applyVoucher(invoiceId: string, voucherCode: string): Promise<ApplyVoucherResult> {
  const user = await getRealUser();
  try {
    const result = await db.transaction(async tx => {
      const [invoice] = await tx.select().from(pgInvoice).where(eq(pgInvoice.id, invoiceId)).for("update");
      if (!invoice || invoice.userId !== user.id || invoice.orgId !== user.organization.id) throw new Error("Fatura não encontrada.");
      if (invoice.status !== "pending" || invoice.dueDate <= new Date() || (invoice.metadata as any)?.simpayPaymentId || (invoice.metadata as any)?.pixTransactionId || (invoice.metadata as any)?.domTransactionId || (invoice.metadata as any)?.paymentStartedAt) throw new Error("Pagamento iniciado ou fatura indisponível; voucher não pode ser alterado.");
      if (invoice.voucherConsumed) throw new Error("Voucher já consumido nesta fatura.");
      if (invoice.voucherId) throw new Error("Esta fatura já possui um voucher.");
      const [voucher] = await tx.select().from(pgVoucher).where(eq(pgVoucher.code, voucherCode.trim().toUpperCase())).for("update");
      if (!voucher || !voucher.active) throw new Error("Voucher inválido ou desativado.");
      if (voucher.expiresAt && voucher.expiresAt.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)) throw new Error("Este voucher expirou.");
      if (voucher.userId && voucher.userId !== user.id) throw new Error("Este voucher não está disponível para sua conta.");
      const [reserved] = await tx.select({ count: sql<number>`count(*)::int` }).from(pgInvoice).where(and(eq(pgInvoice.voucherId, voucher.id), eq(pgInvoice.voucherConsumed, false), sql`((${pgInvoice.status} = 'pending' and ${pgInvoice.dueDate} > now()) or ${pgInvoice.status} = 'processing' or ${pgInvoice.metadata}->>'simpayPaymentId' is not null or ${pgInvoice.metadata}->>'pixTransactionId' is not null or ${pgInvoice.metadata}->>'domTransactionId' is not null or ${pgInvoice.metadata}->>'paymentStartedAt' is not null)`));
      if (voucher.currentUses + reserved.count >= voucher.maxUses) throw new Error("Limite de uso do voucher atingido.");
      const { discountCents, finalAmount } = calculateVoucherDiscount(invoice.amount, voucher.discountType, voucher.discountValue);
      await tx.update(pgInvoice).set({ originalAmount: invoice.amount, amount: finalAmount, voucherId: voucher.id, voucherDiscount: discountCents, updatedAt: new Date() }).where(eq(pgInvoice.id, invoiceId));
      return { status: "success" as const, discount: discountCents / 100, finalAmount, voucherId: voucher.id, message: "Voucher reservado para esta fatura." };
    });
    revalidatePath(`/checkout/${invoiceId}`);
    return result;
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erro ao aplicar voucher." };
  }
}

export async function removeVoucher(invoiceId: string): Promise<{ status: "success" | "error"; message: string }> {
  const user = await getRealUser();
  const [invoice] = await db.update(pgInvoice).set({ amount: sql`coalesce(${pgInvoice.originalAmount}, ${pgInvoice.amount})`, originalAmount: null, voucherId: null, voucherDiscount: 0, updatedAt: new Date() }).where(and(eq(pgInvoice.id, invoiceId), eq(pgInvoice.userId, user.id), eq(pgInvoice.orgId, user.organization.id), eq(pgInvoice.status, "pending"), eq(pgInvoice.voucherConsumed, false), gt(pgInvoice.dueDate, new Date()), sql`${pgInvoice.metadata}->>'simpayPaymentId' is null`, sql`${pgInvoice.metadata}->>'pixTransactionId' is null`, sql`${pgInvoice.metadata}->>'domTransactionId' is null`, sql`${pgInvoice.metadata}->>'paymentStartedAt' is null`)).returning({ id: pgInvoice.id });
  if (!invoice) return { status: "error", message: "Pagamento iniciado ou fatura indisponível; voucher não pode ser alterado." };
  revalidatePath(`/checkout/${invoiceId}`);
  return { status: "success", message: "Voucher removido; valor original restaurado." };
}
