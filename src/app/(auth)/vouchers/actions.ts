"use server";

import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice, pgVoucher } from "@/lib/db/schema";

export type ApplyVoucherResult =
  | {
      status: "success";
      discount: number;
      finalAmount: number;
      voucherId: string;
      message: string;
    }
  | { status: "error"; message: string };

/**
 * Valida e calcula o desconto de um voucher para uma fatura.
 * NÃO incrementa o uso — isso acontece somente quando o pagamento é confirmado.
 */
export async function applyVoucher(
  invoiceId: string,
  voucherCode: string
): Promise<ApplyVoucherResult> {
  const user = await getUser();

  const code = voucherCode.trim().toUpperCase();

  if (!code) {
    return { message: "Código do voucher é obrigatório.", status: "error" };
  }

  // Buscar o voucher
  const voucher = await db.query.pgVoucher.findFirst({
    where: eq(pgVoucher.code, code),
  });

  if (!voucher) {
    return { message: "Voucher não encontrado.", status: "error" };
  }

  // Verificar se está ativo
  if (!voucher.active) {
    return { message: "Este voucher está desativado.", status: "error" };
  }

  // Verificar se expirou
  if (
    voucher.expiresAt &&
    new Date(voucher.expiresAt).toISOString().slice(0, 10) <
      new Date().toISOString().slice(0, 10)
  ) {
    return { message: "Este voucher expirou.", status: "error" };
  }

  // Verificar se já atingiu o limite de uso
  if (voucher.currentUses >= voucher.maxUses) {
    return { message: "Este voucher já foi utilizado.", status: "error" };
  }

  // Verificar se é vinculado a outro usuário
  if (voucher.userId && voucher.userId !== user.id) {
    return {
      message: "Este voucher não está disponível para sua conta.",
      status: "error",
    };
  }

  // Buscar a fatura
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });

  if (!invoice || invoice.orgId !== user.organization.id) {
    return { message: "Fatura não encontrada.", status: "error" };
  }

  if (invoice.status === "paid") {
    return { message: "Esta fatura já foi paga.", status: "error" };
  }

  // Calcular o desconto
  let discount: number;

  if (voucher.discountType === "fixed") {
    discount = Math.min(voucher.discountValue, invoice.amount);
  } else {
    // percentage
    discount = (voucher.discountValue / 100) * invoice.amount;
    discount = Math.min(discount, invoice.amount);
  }

  discount = Math.round(discount * 100) / 100; // Arredondar para 2 casas

  const finalAmount = Math.max(invoice.amount - discount, 0);

  const discountLabel =
    voucher.discountType === "fixed"
      ? `R$ ${voucher.discountValue.toFixed(2)}`
      : `${voucher.discountValue}%`;

  return {
    discount,
    finalAmount: Math.round(finalAmount * 100) / 100,
    message: `Voucher ${code} aplicado! Desconto de ${discountLabel}.`,
    status: "success",
    voucherId: voucher.id,
  };
}

/**
 * Marca o voucher como utilizado (incrementa currentUses) e aplica o desconto na fatura.
 * Deve ser chamado quando o pagamento for confirmado.
 */
export async function consumeVoucher(
  invoiceId: string,
  voucherId: string
): Promise<{ ok: boolean }> {
  const voucher = await db.query.pgVoucher.findFirst({
    where: eq(pgVoucher.id, voucherId),
  });

  if (!voucher?.active || voucher.currentUses >= voucher.maxUses) {
    return { ok: false };
  }

  // Incrementar uso
  await db
    .update(pgVoucher)
    .set({ currentUses: voucher.currentUses + 1 })
    .where(eq(pgVoucher.id, voucherId));

  // Atualizar o valor da fatura com o desconto
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });

  if (invoice) {
    let discount: number;
    if (voucher.discountType === "fixed") {
      discount = Math.min(voucher.discountValue, invoice.amount);
    } else {
      discount = (voucher.discountValue / 100) * invoice.amount;
      discount = Math.min(discount, invoice.amount);
    }

    const finalAmount = Math.max(invoice.amount - discount, 0);

    await db
      .update(pgInvoice)
      .set({ amount: Math.round(finalAmount * 100) / 100 })
      .where(eq(pgInvoice.id, invoiceId));
  }

  return { ok: true };
}
