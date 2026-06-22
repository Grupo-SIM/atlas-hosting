export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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
      where: eq(pgInvoice.id, invoiceId),
      columns: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        metadata: true,
      },
    });

    if (invoice?.type === "vps") {
      const meta = invoice.metadata as any;
      const planType: string = meta?.config?.type || "vps";
      vpsOrder = {
        orderNumber: invoice.id.slice(-8).toUpperCase(),
        amount: invoice.amount,
        currency: invoice.currency,
        planType,
      };
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <PaymentSuccessCard />
      {vpsOrder && <VpsOrderModal order={vpsOrder} />}
    </div>
  );
}
