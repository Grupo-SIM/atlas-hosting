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

export type CheckoutRates = {
  domCcRate: number;
  masterCcRate: number;
  buyerCcRate: number;
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
