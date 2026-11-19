export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type CartInvoiceOptions, pgInvoice } from "@/lib/db/schema";
import PaymentSuccessCard from "./components/PaymentSuccessCard";
import VpsOrderModal from "./components/VpsOrderModal";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  const { invoiceId } = await searchParams;

  let vpsOrder = null;
  let pendingCartItems: string[] = [];
  let cartOrderNumber = "";

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

    // Pedido do carrinho com item não entregue (ex.: registrador recusou o domínio).
    if (invoice?.type === "cart") {
      const meta = invoice.metadata as Partial<CartInvoiceOptions>;
      const failed = new Set(meta.cartFulfillment?.failed ?? []);
      pendingCartItems = (meta.cart?.items ?? [])
        .filter(item => failed.has(item.invoiceId))
        .map(item => item.label);
      cartOrderNumber = invoice.id.slice(0, 8).toUpperCase();
    }

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
      {pendingCartItems.length > 0 ? (
        <div className="mt-4 w-full max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Alguns itens ainda não foram ativados
          </p>
          <p className="mt-1 text-muted-foreground">
            {pendingCartItems.join(", ")}. O pagamento foi recebido — fale com o
            suporte informando a fatura #{cartOrderNumber} para concluirmos ou
            estornarmos.
          </p>
        </div>
      ) : null}
      {vpsOrder && <VpsOrderModal order={vpsOrder} />}
    </div>
  );
}
