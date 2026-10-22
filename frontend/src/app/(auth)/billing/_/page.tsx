import clsx from "clsx";
import { desc, eq } from "drizzle-orm";
import { groupBy } from "lodash";
import { CreditCard, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { type Invoice, pgInvoice } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";

export const metadata: Metadata = {
  description: "Visualize e gerencie suas faturas.",
  title: "Minhas Faturas - Atlas Hosting",
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
        orderBy: [desc(pgInvoice.updatedAt)],
        where: eq(pgInvoice.orgId, organizationId),
      })
    : [];

  const plans = groupBy(await db.query.pgPlan.findMany(), "id");

  const userInvoices = _userInvoices.map(invoice => {
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
      <div className="container mx-auto w-full flex-grow px-4 py-8 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-bold text-3xl">Minhas Faturas</h1>
        </div>

        {userInvoices.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center pt-6 text-center">
              <FileText className="mb-4 text-muted-foreground" size={48} />
              <h3 className="mb-2 font-semibold text-xl">
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
            {userInvoices.map(invoice => (
              <Card className="overflow-hidden shadow-md" key={invoice.id}>
                <CardHeader className="!py-4 !px-6 flex flex-row items-start justify-between space-y-0 bg-muted/50 sm:items-center">
                  <div>
                    <CardTitle className="font-medium text-xl">
                      Fatura #{invoice.id.substring(0, 8).toUpperCase()}
                    </CardTitle>
                  </div>
                  <Badge
                    className="mt-1 whitespace-nowrap text-sm sm:mt-0"
                    variant={getStatusVariant(invoice.status)}
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
                      "grid items-center gap-3 text-sm sm:grid-cols-2",
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
                        <Link href={`/checkout/${invoice.id}`}>
                          <Button>
                            <CreditCard className="mr-2 h-4 w-4" /> Pagar Agora
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
