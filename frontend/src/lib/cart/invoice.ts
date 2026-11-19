import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type CartInvoiceOptions,
  type Invoice,
  pgInvoice,
} from "@/lib/db/schema";

export const CART_CHILD_PAYMENT_ERROR =
  "Este item faz parte de um pedido do carrinho. Pague pelo pedido completo.";

/** Fatura-filha de um carrinho: devolve o id da fatura `cart` que a paga. */
export function cartParentIdOf(
  invoice: Pick<Invoice, "metadata" | "type">
): string | null {
  if (invoice.type === "cart") return null;
  const parentId = (invoice.metadata as { cartInvoiceId?: unknown } | null)
    ?.cartInvoiceId;
  return typeof parentId === "string" && parentId ? parentId : null;
}

export function isCartChildInvoice(
  invoice: Pick<Invoice, "metadata" | "type">
): boolean {
  return cartParentIdOf(invoice) !== null;
}

export function cartDataOf(
  invoice: Pick<Invoice, "metadata" | "type">
): CartInvoiceOptions["cart"] | null {
  if (invoice.type !== "cart") return null;
  const cart = (invoice.metadata as CartInvoiceOptions | null)?.cart;
  return cart && Array.isArray(cart.childInvoiceIds) ? cart : null;
}

/** O pedido tem domínio para registrar (exige contato completo do registrante). */
export function cartHasDomains(
  invoice: Pick<Invoice, "metadata" | "type">
): boolean {
  return !!cartDataOf(invoice)?.items.some(item => item.kind === "domain");
}

/**
 * Faturas-filhas do pedido. Só aceita filhas da mesma organização que apontam de
 * volta para este carrinho — um id forjado em `childInvoiceIds` não entra.
 */
export async function loadCartChildren(
  cart: Pick<Invoice, "id" | "metadata" | "orgId" | "type">
): Promise<Invoice[]> {
  const data = cartDataOf(cart);
  if (!data || data.childInvoiceIds.length === 0) return [];
  const rows = await db.query.pgInvoice.findMany({
    where: inArray(pgInvoice.id, data.childInvoiceIds),
  });
  const byId = new Map(rows.map(row => [row.id, row]));
  return data.childInvoiceIds
    .map(id => byId.get(id))
    .filter(
      (row): row is Invoice =>
        !!row &&
        row.orgId === cart.orgId &&
        cartParentIdOf(row) === cart.id &&
        (row.type === "domain" || row.type === "vps")
    );
}

type VpsEligibility = (config: unknown) => Promise<boolean>;

/** PIX vale para o pedido só se valer para cada VPS dele (domínio sempre aceita PIX). */
export async function cartAllowsPix(
  children: Invoice[],
  isPixEligibleForVpsConfig: VpsEligibility
): Promise<boolean> {
  for (const child of children) {
    if (child.type !== "vps") continue;
    const config = (child.metadata as { config?: unknown })?.config ?? {};
    if (!(await isPixEligibleForVpsConfig(config))) return false;
  }
  return true;
}

/** Boleto: chave global do admin para domínio; regra da VPS para cada VPS. */
export async function cartAllowsBoleto(
  children: Invoice[],
  isBoletoEligibleForVpsConfig: VpsEligibility,
  isBoletoEnabledGlobally: () => Promise<boolean>
): Promise<boolean> {
  if (
    children.some(child => child.type === "domain") &&
    !(await isBoletoEnabledGlobally())
  )
    return false;
  for (const child of children) {
    if (child.type !== "vps") continue;
    const config = (child.metadata as { config?: unknown })?.config ?? {};
    if (!(await isBoletoEligibleForVpsConfig(config))) return false;
  }
  return true;
}

/**
 * Reparte o desconto do voucher do pedido entre as filhas, na proporção do
 * valor de cada uma. Assim comissão e relatórios por tipo usam o valor pago de
 * verdade, e `originalAmount` guarda o preço cheio (base da renovação da VPS).
 * Retorna o novo `amount` por fatura-filha; vazio quando não há o que repartir.
 */
export function splitCartDiscount(
  cartAmount: number,
  children: Pick<Invoice, "amount" | "id" | "originalAmount">[]
): Map<string, number> {
  const result = new Map<string, number>();
  if (children.some(child => child.originalAmount !== null)) return result;
  const childrenTotal = children.reduce((sum, child) => sum + child.amount, 0);
  if (childrenTotal <= 0 || cartAmount >= childrenTotal - 0.005) return result;

  const ratio = Math.max(0, cartAmount) / childrenTotal;
  let allocated = 0;
  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    const amount = isLast
      ? Math.max(0, Math.round((cartAmount - allocated) * 100) / 100)
      : Math.round(child.amount * ratio * 100) / 100;
    allocated += amount;
    result.set(child.id, amount);
  });
  return result;
}
