export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import PaymentSuccessCard from "./components/PaymentSuccessCard";
import VpsOrderModal from "./components/VpsOrderModal";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  const { invoiceId } = await searchParams;

  let vpsOrder = null;

  if (invoiceId) {
    const invoice = await db.query.pgInvoice.findFirst({
      columns: {
        amount: true,
        currency: true,
        id: true,
        metadata: true,
        type: true,
      },
      where: eq(pgInvoice.id, invoiceId),
    });

    if (invoice?.type === "vps") {
      const meta = invoice.metadata as any;
      const planType: string = meta?.config?.type || "vps";
      vpsOrder = {
        amount: invoice.amount,
        currency: invoice.currency,
        orderNumber: invoice.id.slice(-8).toUpperCase(),
        planType,
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <PaymentSuccessCard />
      {vpsOrder && <VpsOrderModal order={vpsOrder} />}
    </div>
  );
}
