import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  isBoletoEligibleForVpsConfig,
  isBoletoEnabledGlobally,
  isPixEligibleForVpsConfig,
} from "@/app/actions";
import { getOptionalUser } from "@/lib/auth";
import {
  cartAllowsBoleto,
  cartAllowsPix,
  cartDataOf,
  cartParentIdOf,
  loadCartChildren,
} from "@/lib/cart/invoice";
import { db } from "@/lib/db";
import { type Invoice, pgInvoice, pgPlan } from "@/lib/db/schema";
import { isExclusivityInvoice } from "@/lib/template-exclusivity/shared";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  description: "Pagamento de fatura",
  title: "Checkout - Atlas Hosting",
};

export interface InstallmentRate {
  n: number;
  domRate: number;
  masterRate: number;
  buyerRate: number;
  fixedFee: number;
}

export interface CheckoutRates {
  domCcRate: number;
  masterCcRate: number;
  buyerCcRate: number;
  installments: InstallmentRate[];
  vendorCcPercent: number;
  vendorCcFixed: number;
  vendorPixPercent: number;
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ initialStep?: string }>;
}) {
  const user = await getOptionalUser();
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, resolvedParams.id),
  });

  if (!invoice) {
    notFound();
  }

  // Item de pedido do carrinho: o pagamento é do pedido inteiro.
  const cartParentId = cartParentIdOf(invoice);
  if (cartParentId) {
    const parent = await db.query.pgInvoice.findFirst({
      columns: { id: true, status: true },
      where: eq(pgInvoice.id, cartParentId),
    });
    if (parent && parent.status !== "paid" && parent.status !== "expired") {
      redirect(`/checkout/${parent.id}`);
    }
  }

  if (invoice.status === "expired" || invoice.status === "paid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000B12]">
        <div className="space-y-4 px-6 text-center">
          <p className="font-black text-2xl text-white">
            {invoice.status === "paid" ? "Fatura já paga" : "Fatura expirada"}
          </p>
          <p className="text-slate-400">
            {invoice.status === "paid"
              ? "Esta fatura já foi paga."
              : "Esta fatura expirou. Crie uma nova para continuar."}
          </p>
        </div>
      </div>
    );
  }

  let reference = invoice.reference;

  if (isExclusivityInvoice(invoice)) {
    // Exclusividade de template também é fatura `subscription`, mas a referência é `EXCL-<id>`, não um plano:
    // buscar plano por ela derruba a página (plans.id é uuid). Mostra a descrição da fatura.
    reference = invoice.description || "Exclusividade de template";
  } else if (invoice.type === "subscription") {
    const plan = await db.query.pgPlan.findFirst({
      where: eq(pgPlan.id, reference),
    });

    if (!plan) {
      notFound();
    }

    reference = plan.name;
  }

  const initialStep =
    resolvedSearch.initialStep === "payment" ? "payment" : "billing";

  if (cartParentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000B12]">
        <div className="space-y-4 px-6 text-center">
          <p className="font-black text-2xl text-white">Item de um pedido</p>
          <p className="text-slate-400">
            Este item faz parte de um pedido do carrinho que não está mais
            aberto para pagamento.
          </p>
        </div>
      </div>
    );
  }

  const invoiceConfig = (invoice.metadata as any)?.config || {};
  let isAnnualVps =
    invoice.type === "vps" && (await isPixEligibleForVpsConfig(invoiceConfig));
  let allowBoleto = await isBoletoEligibleForVpsConfig(
    invoice.type === "vps" ? invoiceConfig : {}
  );

  const cartData = cartDataOf(invoice);
  if (cartData) {
    const children = await loadCartChildren(invoice);
    // `isAnnualVps` libera o PIX no formulário; no pedido vale se valer para cada VPS.
    isAnnualVps = await cartAllowsPix(children, isPixEligibleForVpsConfig);
    allowBoleto = await cartAllowsBoleto(
      children,
      isBoletoEligibleForVpsConfig,
      isBoletoEnabledGlobally
    );
    reference = invoice.description || "Pedido do carrinho";
  }

  return (
    <CheckoutClient
      allowBoleto={allowBoleto}
      cartItems={cartData?.items}
      initialStep={initialStep}
      invoice={invoice as Invoice}
      isAnnualVps={isAnnualVps}
      reference={reference}
      user={user ? { id: user.id, organization: user.organization } : null}
    />
  );
}
