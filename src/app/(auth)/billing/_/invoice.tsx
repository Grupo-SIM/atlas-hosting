"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Separator } from "@/components/ui/separator";
import { type Invoice } from "@/lib/db/schema";
import { cn, toBrl } from "@/lib/utils";
import { useState } from "react";
import {
  addDays,
  format,
  formatDistanceToNow,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  Package,
  Tag,
} from "lucide-react";
import Link from "next/link";

export default function InvoiceCard({
  invoice,
  isExpanded: initialExpanded = false,
}: {
  isExpanded?: boolean;
  invoice: Invoice;
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const breakdownInformation = (() => {
    if (invoice.type === "subscription") {
      return [
        {
          label: invoice.reference ? `Plano ${invoice.reference}` : "Plano",
          value: invoice.amount,
        },
      ];
    }

    const whoisGuard = invoice.type === "domain" && (invoice.metadata as any)?.whoisguard === "on";

    const breakdownInformation = [
      {
        label: invoice.reference,
        value: invoice.amount,
      },
    ];

    if (whoisGuard) {
      breakdownInformation.push({
        label: "Proteção de Privacidade (WHOIS)",
        value: 0,
      });
    }

    return breakdownInformation;
  })();

  const expiryDate = addDays(invoice.createdAt, 3);
  const isOverdue = isBefore(expiryDate, new Date());

  return (
    <div>
      <Card className={cn(
        "w-full transition-all duration-200 border border-border/50 shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm group",
        isExpanded && "ring-1 ring-primary/20 bg-card shadow-md border-primary/20"
      )}>
        {/* Collapsed Summary View */}
        <CardHeader 
          className="pb-4 cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                invoice.status === "paid" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary",
                "group-hover:bg-primary group-hover:text-primary-foreground"
              )}>
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">
                  Fatura #{invoice.id.slice(0, 8).toUpperCase()}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {format(invoice.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "capitalize px-3 py-1 font-bold",
                    invoice.type === "domain" 
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                      : invoice.type === "vps"
                        ? "bg-blue-600/10 text-blue-500 border-blue-500/20"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  )}
                >
                  {invoice.type === "domain" ? "Domínio" : invoice.type === "vps" ? "VPS" : "Plano"}
                </Badge>
                <Badge
                  className={cn(
                    "px-3 py-1 shadow-sm font-bold border",
                    getStatusStyles(invoice.status)
                  )}
                >
                  {statusLabel[invoice.status] || "Status desconhecido"}
                </Badge>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="text-xl font-black text-primary tracking-tighter">
                    {toBrl(invoice.amount)}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    Valor total
                  </div>
                </div>
                <div className={cn(
                  "p-1 rounded-full bg-muted transition-transform duration-300",
                  isExpanded && "rotate-180 bg-primary/10 text-primary"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
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
                    {invoice.type === "domain" ? "Domínio" : invoice.type === "vps" ? "VPS" : "Plano"}
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
      return "outline";
    case "overdue":
    case "vencida":
    case "failed":
      return "destructive";
    case "processing":
      return "secondary";
    default:
      return "outline";
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "overdue":
    case "failed":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "processing":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground";
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
