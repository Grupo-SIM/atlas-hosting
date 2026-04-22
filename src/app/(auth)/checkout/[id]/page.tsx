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
  buyerCcRate: number;      // MDR_CC_1X — taxa DOM sobre cartão (ex: 0.0399)
  vendorCcPercent: number;  // TAXA_LINK_PERCENT — taxa % da plataforma ao vendedor (ex: 0.0699)
  vendorCcFixed: number;    // TAXA_LINK_FIXA — taxa fixa da plataforma ao vendedor (ex: 4.00)
  vendorPixPercent: number; // LIQUIDEZ — taxa PIX ao vendedor (ex: 0.09)
};

async function fetchCheckoutRates(): Promise<CheckoutRates | null> {
  const apiUrl = process.env.SIMPAY_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/public/cc-rates/ATLAS`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const json = await res.json() as CheckoutRates;
    if (
      typeof json.buyerCcRate !== "number" ||
      typeof json.vendorCcPercent !== "number" ||
      typeof json.vendorCcFixed !== "number" ||
      typeof json.vendorPixPercent !== "number"
    ) {
      return null;
    }
    return json;
  } catch {
    return null;
  }
}

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

  const rates = await fetchCheckoutRates();

  return (
    <CheckoutClient
      invoice={invoice as Invoice}
      user={user}
      reference={reference}
      rates={rates}
    />
  );
}
