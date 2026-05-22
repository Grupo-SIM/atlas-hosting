import CheckoutClient from "./checkout-client";
import { db } from "@/lib/db";
import { pgInvoice, pgPlan, type Invoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout - Atlas Hosting",
  description: "Pagamento de fatura",
};

export type InstallmentRate = {
  n: number;
  domRate: number;
  masterRate: number;
  buyerRate: number;
  fixedFee: number;
};

export type CheckoutRates = {
  domCcRate: number;
  masterCcRate: number;
  buyerCcRate: number;
  installments: InstallmentRate[];
  vendorCcPercent: number;
  vendorCcFixed: number;
  vendorPixPercent: number;
};

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
      <div className="min-h-screen bg-[#000B12] flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <p className="text-2xl font-black text-white">
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

  const initialStep = resolvedSearch.initialStep === "payment" ? "payment" : "billing";

  return (
    <CheckoutClient
      invoice={invoice as Invoice}
      user={user ? { id: user.id, organization: user.organization } : null}
      reference={reference}
      initialStep={initialStep}
    />
  );
}
