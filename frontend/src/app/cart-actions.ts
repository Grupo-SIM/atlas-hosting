"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { createDomainInvoice, createVpsInvoice } from "@/app/actions";
import { getOptionalUser } from "@/lib/auth";
import { CART_MAX_ITEMS, type CartCheckoutItem } from "@/lib/cart/types";
import { vpsConfigFromSearchParams } from "@/lib/cart/vps-config";
import { db } from "@/lib/db";
import {
  type CartInvoiceItemSummary,
  type CartInvoiceOptions,
  type DomainRegisterInvoiceOptions,
  pgInvoice,
} from "@/lib/db/schema";

export type CheckoutCartResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

const DOMAIN_PATTERN = /^(?=.{3,253}$)[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const PLAN_ID_PATTERN = /^[a-z0-9-]{1,16}$/i;

/** Campos de link de pagamento do admin não entram pelo carrinho: lá o preço é do catálogo. */
const PAYMENT_LINK_FIELDS = [
  "paymentLinkId",
  "customLinkAmountBrl",
  "customLinkAllowPix",
  "customLinkAllowBoleto",
] as const;

function cleanLabel(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  // Texto vindo do navegador: tira caracteres de controle e `<>` antes de gravar na fatura.
  const label = Array.from(raw)
    .filter(ch => ch.charCodeAt(0) >= 32 && ch !== "<" && ch !== ">")
    .join("")
    .trim()
    .slice(0, 80);
  return label || fallback;
}

function parseItems(raw: unknown): CartCheckoutItem[] | string {
  if (!Array.isArray(raw) || raw.length === 0)
    return "Seu carrinho está vazio.";
  if (raw.length > CART_MAX_ITEMS)
    return `O carrinho aceita até ${CART_MAX_ITEMS} itens.`;

  const items: CartCheckoutItem[] = [];
  const seenDomains = new Set<string>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object")
      return "Item inválido no carrinho.";
    const item = entry as Record<string, unknown>;
    if (item.kind === "domain") {
      const domain =
        typeof item.domain === "string" ? item.domain.trim().toLowerCase() : "";
      const years = Number(item.years);
      if (!DOMAIN_PATTERN.test(domain)) return "Domínio inválido no carrinho.";
      if (!Number.isInteger(years) || years < 1 || years > 10)
        return `Período inválido para ${domain}.`;
      if (seenDomains.has(domain)) continue;
      seenDomains.add(domain);
      items.push({ domain, kind: "domain", years });
    } else if (item.kind === "vps") {
      const planId = typeof item.planId === "string" ? item.planId : "";
      const query = typeof item.query === "string" ? item.query : "";
      if (!PLAN_ID_PATTERN.test(planId) || query.length > 4096)
        return "Servidor inválido no carrinho.";
      items.push({
        kind: "vps",
        label: cleanLabel(item.label, `VPS ${planId}`),
        planId,
        query,
      });
    } else {
      return "Item inválido no carrinho.";
    }
  }
  return items;
}

async function discardChildren(ids: string[]) {
  if (ids.length === 0) return;
  await db
    .update(pgInvoice)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(inArray(pgInvoice.id, ids), eq(pgInvoice.status, "pending")))
    .catch(error =>
      console.error("[CARRINHO] Falha ao descartar faturas parciais:", error)
    );
}

/**
 * Fecha o carrinho: cria cada item pela função de sempre (`createDomainInvoice`,
 * `createVpsInvoice` — mesmo preço, mesma validação) e uma fatura `cart` que paga
 * todas de uma vez. Se algum item falhar, as faturas já criadas são descartadas.
 */
export async function checkoutCart(
  rawItems: unknown
): Promise<CheckoutCartResult> {
  const user = await getOptionalUser();
  if (!user) return { error: "Faça login para finalizar a compra.", ok: false };
  if (!user.organization)
    return { error: "Conclua seu cadastro antes de comprar.", ok: false };

  const parsed = parseItems(rawItems);
  if (typeof parsed === "string") return { error: parsed, ok: false };

  const created: { id: string; label: string; kind: "domain" | "vps" }[] = [];

  for (const item of parsed) {
    if (item.kind === "domain") {
      const res = await createDomainInvoice({
        domain: item.domain,
        whoisguard: "on",
        years: String(item.years),
      });
      if (!res || "error" in res || !res.invoiceId) {
        await discardChildren(created.map(c => c.id));
        const reason =
          res && "error" in res && res.error
            ? res.error
            : "não foi possível gerar o pedido.";
        return { error: `${item.domain}: ${reason}`, ok: false };
      }
      created.push({
        id: res.invoiceId,
        kind: "domain",
        label:
          item.years > 1 ? `${item.domain} (${item.years} anos)` : item.domain,
      });
      continue;
    }

    const config: Record<string, unknown> = vpsConfigFromSearchParams(
      new URLSearchParams(item.query)
    );
    for (const field of PAYMENT_LINK_FIELDS) delete config[field];

    const res = await createVpsInvoice({ config, planId: item.planId });
    if (res.status !== "success") {
      await discardChildren(created.map(c => c.id));
      return { error: `${item.label}: ${res.message}`, ok: false };
    }
    const months = Number.parseInt(String(config.duration ?? "1"), 10) || 1;
    created.push({
      id: res.invoiceId,
      kind: "vps",
      label: `${item.label} (${months} ${months === 1 ? "mês" : "meses"})`,
    });
  }

  try {
    const children = await db.query.pgInvoice.findMany({
      where: inArray(
        pgInvoice.id,
        created.map(c => c.id)
      ),
    });
    const byId = new Map(children.map(child => [child.id, child]));
    if (byId.size !== created.length) throw new Error("Item do pedido sumiu.");

    const items: CartInvoiceItemSummary[] = created.map(c => ({
      amount: byId.get(c.id)!.amount,
      invoiceId: c.id,
      kind: c.kind,
      label: c.label,
    }));
    const total =
      Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
    const namecheapCostUsd = children
      .filter(child => child.type === "domain")
      .reduce(
        (sum, child) =>
          sum +
          ((child.metadata as DomainRegisterInvoiceOptions).namecheapCostUsd ??
            0),
        0
      );
    const dueDate = new Date(
      Math.min(...children.map(child => child.dueDate.getTime()))
    );
    const reference = `Carrinho: ${items.map(item => item.label).join(" · ")}`;

    const metadata: CartInvoiceOptions = {
      cart: { childInvoiceIds: created.map(c => c.id), items },
      namecheapCostUsd: namecheapCostUsd > 0 ? namecheapCostUsd : undefined,
    };

    const cartInvoice = await db.transaction(async tx => {
      const [row] = await tx
        .insert(pgInvoice)
        .values({
          amount: total,
          currency: "BRL",
          description: `Pedido com ${items.length} ${items.length === 1 ? "item" : "itens"}`,
          dueDate,
          metadata,
          orgId: user.organization.id,
          reference: reference.slice(0, 280),
          status: "pending",
          type: "cart",
          userId: user.id,
        })
        .returning({ id: pgInvoice.id });
      if (!row) throw new Error("Falha ao gravar o pedido.");

      // Vincula as filhas: a partir daqui elas só são pagas por este pedido.
      await tx
        .update(pgInvoice)
        .set({
          metadata: sql`(${pgInvoice.metadata}::jsonb || jsonb_build_object('cartInvoiceId', ${row.id}::text))::json`,
          updatedAt: new Date(),
        })
        .where(
          inArray(
            pgInvoice.id,
            created.map(c => c.id)
          )
        );
      return row;
    });

    console.log(
      `[CARRINHO] Pedido ${cartInvoice.id} | R$ ${total.toFixed(2)} | ${items.length} itens | usuário ${user.id}`
    );
    return { ok: true, redirectUrl: `/checkout/${cartInvoice.id}` };
  } catch (error) {
    console.error("[CARRINHO] Erro ao fechar o pedido:", error);
    await discardChildren(created.map(c => c.id));
    return {
      error: "Não foi possível fechar o pedido. Tente novamente.",
      ok: false,
    };
  }
}
