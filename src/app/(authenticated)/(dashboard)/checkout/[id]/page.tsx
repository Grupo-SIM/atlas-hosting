import AtlasLogo from "@/assets/atlas.svg";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { ModeToggle } from "@/components/ModeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { pgInvoice, pgPlan } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout - Atlas Hosting",
  description: "Pagamento de fatura",
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, (await params).id),
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

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/50 relative">
      <div className="flex gap-6">
        <Card className="max-w-xl w-full !shadow-lg !shadow-black/3">
          <CardHeader className="w-full text-center">
            <CardTitle>Compra por cartão de crédito</CardTitle>
            <hr className="mt-4" />
          </CardHeader>
          <CardContent>
            <CheckoutForm invoiceId={invoice.id} />
          </CardContent>
        </Card>
        <Card className="min-w-xs max-w-fit w-full h-min !shadow-lg !shadow-black/3 flex flex-col">
          <CardHeader className="w-full text-center">
            <CardTitle className="text-base">Resumo do Pedido</CardTitle>
            <hr className="mt-4" />
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="text-xs flex items-center justify-between text-zinc-800 dark:text-zinc-200">
              <div>
                {invoice.type === "domain" ? "Domínio " : "Plano "}
                {reference}
              </div>
              <div className="text-xs font-semibold">
                {toBrl(invoice.amount)}
              </div>
            </div>
            {invoice.type === "domain" && (
              <>
                <div className="text-xs flex gap-4 items-center justify-between text-zinc-800 dark:text-zinc-200 mt-7">
                  <div>Proteção de privacidade WHOIS</div>
                  <div className="text-xs font-semibold">{toBrl(0)}</div>
                </div>
                <div className="text-xs flex gap-4  items-center justify-between text-zinc-800 dark:text-zinc-200 mt-7 mb-1">
                  <div>Certificado SSL</div>
                  <div className="text-xs font-semibold">{toBrl(0)}</div>
                </div>
              </>
            )}
            <hr className="my-5" />
            <div className="flex flex-col flex-1 justify-end">
              <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                <div className="font-semibold text-xl">Total:</div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {toBrl(invoice.amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
