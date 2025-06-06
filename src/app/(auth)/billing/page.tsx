import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { type Invoice, pgInvoice, pgPlan } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import clsx from "clsx";
import { desc, eq } from "drizzle-orm";
import { groupBy } from "lodash";
import { CreditCard, FileText } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Minhas Faturas - Atlas Hosting",
  description: "Visualize e gerencie suas faturas.",
};

type InvoiceStatus = Invoice["status"];

type Common<A, B> = {
  [P in keyof A & keyof B]: A[P] | B[P];
};

const getStatusVariant = (
  status?: InvoiceStatus | null
): "default" | "destructive" | "outline" | "secondary" | "action" => {
  if (!status) {
    return "secondary";
  }
  switch (status.toLowerCase()) {
    case "paid":
    case "paga":
      return "action";
    case "pending":
    case "pendente":
      return "secondary";
    case "overdue":
    case "vencida":
      return "destructive";
    default:
      return "outline";
  }
};

const formatDate = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) {
    return "N/A";
  }
  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (_error) {
    return "Data inválida";
  }
};

export default async function BillingPage() {
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
    <div className="flex h-full w-full flex-col">
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
              <Card key={invoice.id} className="overflow-hidden shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 !py-4 !px-6 bg-muted/50 sm:items-center">
                  <div>
                    <CardTitle className="text-xl font-medium">
                      Fatura #{invoice.id.substring(0, 8).toUpperCase()}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={getStatusVariant(invoice.status)}
                    className="text-sm whitespace-nowrap mt-1 sm:mt-0"
                  >
                    {invoice.status === "pending" && "A pagar"}
                    {invoice.status === "paid" && "Pago"}
                    {invoice.status === "failed" && "Pagamento recusado"}
                    {invoice.status === "processing" && "Em processamento"}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <div
                    className={clsx([
                      "grid gap-3 sm:grid-cols-2 text-sm items-center",
                      invoice.status === "pending"
                        ? "md:grid-cols-5"
                        : "md:grid-cols-4",
                    ])}
                  >
                    <div>
                      <strong>
                        {invoice.type === "domain" ? "Domínio" : "Plano"}:
                      </strong>{" "}
                      {invoice.reference || "N/A"}
                    </div>
                    <div>
                      <strong>Tipo:</strong>{" "}
                      {invoice.type === "domain" ? "Domínio" : "Plano"}
                    </div>
                    <div>
                      <strong>Total:</strong> {toBrl(invoice.amount)}
                    </div>
                    <div>
                      <strong>Data de Emissão:</strong>{" "}
                      {formatDate(invoice.createdAt)}
                    </div>
                    {invoice.status === "pending" && (
                      <div className="flex justify-end">
                        <Button asChild={true}>
                          <Link href={`/checkout/${invoice.id}`}>
                            <CreditCard className="mr-2 h-4 w-4" /> Pagar Agora
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
