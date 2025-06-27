import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { pgPlan, type Invoice } from "@/lib/db/schema";
import { cn, toBrl } from "@/lib/utils";
import {
  add,
  addDays,
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { eq } from "drizzle-orm";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  Package,
  Tag,
} from "lucide-react";
import Link from "next/link";

export default function InvoiceCard({
  isExpanded,
  invoice,
}: {
  isExpanded?: boolean;
  invoice: Invoice;
}) {
  const breakdownInformation = (() => {
    if (invoice.type === "subscription") {
      return [
        {
          label: invoice.reference ? `Plano ${invoice.reference}` : "Plano",
          value: invoice.amount,
        },
      ];
    }

    const whoisGuard = invoice.metadata.whoisguard === "on";

    const breakdownInformation = [
      {
        label: invoice.reference,
        value: invoice.amount - (whoisGuard ? 3 : 0),
      },
    ];

    if (whoisGuard) {
      breakdownInformation.push({
        label: "Proteção de Privacidade",
        value: whoisGuard ? 3 : 0,
      });
    }

    return breakdownInformation;
  })();

  const expiryDate = addDays(invoice.createdAt, 3);
  const isOverdue = isBefore(expiryDate, new Date());

  return (
    <div>
      <Card className="w-full transition-all duration-300">
        {/* Collapsed Summary View */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Fatura #{invoice.id.slice(0, 8).toUpperCase()}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(invoice.createdAt, "PPP", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  {toBrl(invoice.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Valor da fatura
                </div>
              </div>
              <Link
                prefetch
                href={isExpanded ? "?" : `?id=${invoice.id}`}
                scroll={false}
                replace
              >
                <Button variant="ghost" size="sm">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform ease-[easeOutCubic] duration-300",
                      { "rotate-180": isExpanded }
                    )}
                  />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Summary Bar */}
          {!isExpanded && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Badge variant="secondary" className="text-xs">
                {invoice.type === "domain" ? "Domínio" : "Plano"}
              </Badge>
              <Badge
                variant={getStatusVariant(invoice.status)}
                className="text-xs"
              >
                {statusLabel[invoice.status] || "Status desconhecido"}
              </Badge>
            </div>
          )}
        </CardHeader>

        {/* Expanded Detailed View */}
        {isExpanded && (
          <CardContent
            className={cn(
              "space-y-6 ease-[easeOutCubic] duration-300",
              isExpanded
                ? "animate-in slide-in-from-top-2"
                : "animate-out slide-out-to-top-2"
            )}
          >
            <div className="flex justify-end">
              <Badge
                variant={getStatusVariant(invoice.status)}
                className="text-sm"
              >
                {statusLabel[invoice.status] || "Status desconhecido"}
              </Badge>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Data de Emissão
                    </p>
                    <p className="text-base font-semibold">
                      {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-right md:text-left">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total da Fatura
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {toBrl(invoice.amount)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detalhes do Produto
              </h3>

              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.reference}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Tipo de produto:
                  </span>
                  <Badge variant="outline">
                    {invoice.type === "domain" ? "Domínio" : "Plano"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Produtos da compra</h3>

              <div className="space-y-2">
                <Separator />

                {breakdownInformation.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-muted-foreground text-sm">
                      {toBrl(item.value)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Valor Final</span>
                  <span className="text-primary">{toBrl(invoice.amount)}</span>
                </div>
              </div>
            </div>

            {!["paid", "processing"].includes(invoice.status) && (
              <>
                {/* Additional Info */}
                <div className="bg-muted/20 rounded-lg p-4 border-l-4 border-primary">
                  <p className="text-sm text-muted-foreground">
                    <strong>Vencimento:</strong>{" "}
                    {format(expiryDate, "PPP", { locale: ptBR })},{" "}
                    {formatDistanceToNow(expiryDate, {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                    .
                    <br />
                    Essa fatura será vencida 3 dias após sua emissão.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Link
                    prefetch
                    className="flex-1 grid !cursor-pointer"
                    href={`/checkout/${invoice.id}`}
                  >
                    <GradientButton>Pagar agora</GradientButton>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

const statusLabel = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Vencida",
  failed: "Pagamento recusado",
  processing: "Em processamento",
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

type InvoiceStatus = Invoice["status"];

type Common<A, B> = {
  [P in keyof A & keyof B]: A[P] | B[P];
};
