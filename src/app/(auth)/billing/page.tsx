import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice, type Invoice } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { groupBy } from "lodash";
import { FileText } from "lucide-react";
import type { Metadata } from "next";
import InvoiceCard from "./_/invoice";

export default async function BillingPage({
  searchParams: _searchParams,
}: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await _searchParams;

  const { organizationId } = await getUser();

  // Assumes invoiceTable has fields: id, userId, amount, status, createdAt, reference, type
  // Adjust field names (e.g., invoiceTable.user_id) if your schema differs.
  const _userInvoices = organizationId
    ? await db.query.pgInvoice.findMany({
        where: eq(pgInvoice.orgId, organizationId),
        orderBy: [desc(pgInvoice.updatedAt)],
      })
    : [];

  const plans = groupBy(await db.query.pgPlan.findMany(), "id");

  const userInvoices = _userInvoices.map((invoice) => {
    if (invoice.type === "domain") {
      return invoice;
    }

    const plan = plans[invoice.reference][0];

    return {
      ...invoice,
      reference: plan ? plan.name : invoice.reference,
    };
  });

  return (
    <div className="flex h-full w-full max-w-2xl mx-auto flex-col">
      <main className="flex-grow container mx-auto py-8 px-4 md:px-6 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Minhas Faturas</h1>
        </div>

        {userInvoices.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center min-h-[200px]">
              <FileText size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhuma fatura encontrada
              </h3>
              <p className="text-muted-foreground">
                {organizationId
                  ? "Você ainda não possui faturas."
                  : "Não foi possível carregar suas faturas. Verifique se você está logado."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {userInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                isExpanded={searchParams.id === invoice.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Minhas Faturas - Atlas Hosting",
  description: "Visualize e gerencie suas faturas.",
};
