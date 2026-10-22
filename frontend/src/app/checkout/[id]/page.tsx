import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  isBoletoEligibleForVpsConfig,
  isPixEligibleForVpsConfig,
} from "@/app/actions";
import { getOptionalUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { type Invoice, pgInvoice, pgPlan } from "@/lib/db/schema";
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

  if (invoice.type === "subscription") {
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

  const invoiceConfig = (invoice.metadata as any)?.config || {};
  const isAnnualVps =
    invoice.type === "vps" && (await isPixEligibleForVpsConfig(invoiceConfig));
  const allowBoleto = await isBoletoEligibleForVpsConfig(
    invoice.type === "vps" ? invoiceConfig : {}
  );

  return (
    <CheckoutClient
      allowBoleto={allowBoleto}
      initialStep={initialStep}
      invoice={invoice as Invoice}
      isAnnualVps={isAnnualVps}
      reference={reference}
      user={user ? { id: user.id, organization: user.organization } : null}
    />
  );
}
