"use server";

import { db } from "@/lib/db";
import { pgInvoice, VpsInvoiceOptions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { addMonths } from "date-fns";

export type VpsPlanRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  amount: number;
  currency: string;
  description: string | null;
  duration: string;
  subscriptionStart: Date;
  subscriptionExpiry: Date;
};

export async function getVpsPlanSubscriptionsAction(): Promise<VpsPlanRow[]> {
  const invoices = await db.query.pgInvoice.findMany({
    where: and(eq(pgInvoice.type, "vps"), eq(pgInvoice.status, "paid")),
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: [desc(pgInvoice.createdAt)],
  });

  return invoices.map((inv) => {
    const meta = inv.metadata as VpsInvoiceOptions;
    const duration = meta?.config?.duration ?? "1";
    const start = new Date(inv.createdAt);
    const expiry = addMonths(start, parseInt(duration, 10));

    return {
      id: inv.id,
      userId: inv.userId,
      userName: inv.user?.name ?? null,
      userEmail: inv.user?.email ?? "",
      amount: inv.amount,
      currency: inv.currency,
      description: inv.description ?? null,
      duration,
      subscriptionStart: start,
      subscriptionExpiry: expiry,
    };
  });
}
