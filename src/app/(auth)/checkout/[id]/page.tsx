import CheckoutClient from "./checkout-client";
import { db } from "@/lib/db";
import { pgInvoice, pgPlan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout - Atlas Hosting",
  description: "Pagamento de fatura",
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

  return <CheckoutClient invoice={invoice} user={user} reference={reference} />;
}
