import CheckoutClient from "./checkout-client";
import { db } from "@/lib/db";
import { pgInvoice, pgPlan, type Invoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  const resolvedParams = await params;

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

  if (!invoice) {
    notFound();
  }

  return (
    <CheckoutClient
      invoice={invoice as Invoice}
      user={user}
      reference={reference}
    />
  );
}
