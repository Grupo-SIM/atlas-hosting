import CheckoutForm from "@/components/checkout/CheckoutForm";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { invoiceTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Bell } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import AtlasLogo from "@/assets/atlas.svg";
import { toBrl } from "@/lib/utils";


export const metadata: Metadata = {
  title: "Checkout - Atlas Hosting",
  description: "Pagamento de fatura",
};

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const invoice = await db.query.invoiceTable.findFirst({
    where: eq(invoiceTable.id, (await params).id),
  });

  if (!invoice) {
    notFound();
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/50 relative">
      <header className="h-16 bg-card border-b flex items-center justify-between px-6 space-x-4 absolute top-0 left-0 w-full">
        <h1 className="text-base md:text-2xl font-bold flex items-center m-0">
          <AtlasLogo className="h-6 w-min object-contain mr-4" />
            Atlas Hosting
        </h1>
        <div className="flex items-center space-x-4">
          <ModeToggle />
        </div>
      </header>

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
        <Card className="max-w-fit w-full h-min !shadow-lg !shadow-black/3 flex flex-col">
          <CardHeader className="w-full text-center">
            <CardTitle className="text-base">Resumo do Pedido</CardTitle>
            <hr className="mt-4" />
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="text-xs flex items-center justify-between text-zinc-800 dark:text-zinc-200">
              <div>
                {invoice.type === "domain" ? "Domínio ": "Plano "}
                {invoice.reference}
              </div>
              <div className="text-xs font-semibold">
                {toBrl(invoice.amount)}
              </div>
            </div>
            {invoice.type === "domain" && (
              <>
                <div className="text-xs flex gap-4 items-center justify-between text-zinc-800 dark:text-zinc-200 mt-7">
                  <div>
                  Proteção de privacidade WHOIS
                  </div>
                  <div className="text-xs font-semibold">
                    {toBrl(0)}
                  </div>
                </div>
                <div className="text-xs flex gap-4  items-center justify-between text-zinc-800 dark:text-zinc-200 mt-7 mb-1">
                  <div>
                  Certificado SSL
                  </div>
                  <div className="text-xs font-semibold">
                    {toBrl(0)}
                  </div>
                </div>
              </>
            )}
            <hr className="my-5" />
            <div className="flex flex-col flex-1 justify-end">
              <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                <div className="font-semibold text-xl">
                  Total:
                </div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{toBrl(invoice.amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}