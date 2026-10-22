"use client";

import { addDays, format, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  Package,
  Tag,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@/lib/db/schema";
import { cn, toBrl } from "@/lib/utils";

export interface InvoiceCustomer {
  name: string | null;
  email: string | null;
  document: string | null;
  phone: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

export default function InvoiceCard({
  invoice,
  customer,
  isExpanded: initialExpanded = false,
}: {
  isExpanded?: boolean;
  invoice: Invoice;
  customer?: InvoiceCustomer | null;
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const customerFields = customer
    ? ([
        { label: "Nome", value: customer.name },
        { label: "E-mail", value: customer.email },
        {
          label: documentLabel(customer.document),
          value: formatDocument(customer.document),
        },
        { label: "Telefone", value: formatPhone(customer.phone) },
        { label: "Endereço", value: formatAddress(customer) },
        { label: "CEP", value: formatZipCode(customer.zipCode) },
      ].filter(field => !!field.value) as { label: string; value: string }[])
    : [];

  const breakdownInformation = (() => {
    if (invoice.type === "subscription") {
      return [
        {
          label: invoice.reference ? `Plano ${invoice.reference}` : "Plano",
          value: invoice.amount,
        },
      ];
    }

    const whoisGuard =
      invoice.type === "domain" &&
      (invoice.metadata as any)?.whoisguard === "on";

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
      <Card
        className={cn(
          "group w-full border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm transition-all duration-200",
          isExpanded &&
            "border-primary/20 bg-card shadow-md ring-1 ring-primary/20"
        )}
      >
        {/* Collapsed Summary View */}
        <CardHeader
          className="cursor-pointer pb-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex-shrink-0 rounded-xl p-2.5 transition-colors",
                  invoice.status === "paid"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-primary/10 text-primary"
                )}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate font-bold text-base tracking-tight">
                  Fatura #{invoice.id.slice(0, 8).toUpperCase()}
                </CardTitle>
                <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
                  <CalendarDays className="h-3 w-3 flex-shrink-0" />
                  {format(invoice.createdAt, "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </div>
                {/* Badges — visible on all screens */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge
                    className={cn(
                      "pointer-events-none px-2 py-0.5 font-bold text-[10px] capitalize",
                      invoice.type === "domain"
                        ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                        : invoice.type === "vps"
                          ? "border-blue-500/20 bg-blue-600/10 text-blue-500"
                          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                    )}
                    variant="outline"
                  >
                    {invoice.type === "domain"
                      ? "Domínio"
                      : invoice.type === "vps"
                        ? "VPS"
                        : "Plano"}
                  </Badge>
                  <Badge
                    className={cn(
                      "pointer-events-none border px-2 py-0.5 font-bold text-[10px] shadow-sm",
                      getStatusStyles(invoice.status)
                    )}
                  >
                    {statusLabel[invoice.status] || "Status desconhecido"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <div className="text-right">
                <div className="whitespace-nowrap font-black text-base text-primary tracking-tighter">
                  {toBrl(invoice.amount)}
                </div>
                <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                  Valor total
                </div>
              </div>
              <div
                className={cn(
                  "flex-shrink-0 rounded-full bg-muted p-1 transition-transform duration-300",
                  isExpanded && "rotate-180 bg-primary/10 text-primary"
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Expanded Detailed View */}
        {isExpanded && (
          <CardContent
            className={cn(
              "space-y-6 duration-300 ease-[easeOutCubic]",
              isExpanded
                ? "slide-in-from-top-2 animate-in"
                : "slide-out-to-top-2 animate-out"
            )}
          >
            <div className="flex justify-end">
              <Badge
                className="pointer-events-none text-sm"
                variant={getStatusVariant(invoice.status)}
              >
                {statusLabel[invoice.status] || "Status desconhecido"}
              </Badge>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Data de Emissão
                    </p>
                    <p className="font-semibold text-base">
                      {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-right md:text-left">
                  <p className="font-medium text-muted-foreground text-sm">
                    Total da Fatura
                  </p>
                  <p className="font-bold text-3xl text-primary">
                    {toBrl(invoice.amount)}
                  </p>
                </div>
              </div>
            </div>

            {customerFields.length > 0 && (
              <>
                <Separator />

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 font-semibold text-lg">
                    <UserRound className="h-5 w-5" />
                    Dados do Cliente
                  </h3>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg bg-muted/30 p-4 sm:grid-cols-2">
                    {customerFields.map(field => (
                      <div key={field.label}>
                        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          {field.label}
                        </p>
                        <p className="break-words font-medium text-sm">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <Package className="h-5 w-5" />
                Detalhes do Produto
              </h3>

              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-background p-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.reference}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-sm">
                    Tipo de produto:
                  </span>
                  <Badge variant="outline">
                    {invoice.type === "domain"
                      ? "Domínio"
                      : invoice.type === "vps"
                        ? "VPS"
                        : "Plano"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Produtos da compra</h3>

              <div className="space-y-2">
                <Separator />

                {breakdownInformation.map(item => (
                  <div
                    className="flex items-center justify-between"
                    key={item.label}
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-muted-foreground text-sm">
                      {toBrl(item.value)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Valor Final</span>
                  <span className="text-primary">{toBrl(invoice.amount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

const onlyDigits = (value: string | null | undefined) =>
  (value || "").replace(/\D/g, "");

const documentLabel = (document: string | null) =>
  onlyDigits(document).length === 14 ? "CNPJ" : "CPF";

const formatDocument = (document: string | null) => {
  const digits = onlyDigits(document);
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
  return document || "";
};

const formatPhone = (phone: string | null) => {
  const digits = onlyDigits(phone);
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone || "";
};

const formatZipCode = (zipCode: string | null) => {
  const digits = onlyDigits(zipCode);
  return digits.length === 8
    ? digits.replace(/(\d{5})(\d{3})/, "$1-$2")
    : zipCode || "";
};

const formatAddress = (customer: InvoiceCustomer) => {
  const streetLine = [customer.street, customer.number]
    .filter(Boolean)
    .join(", ");
  const cityLine = [customer.city, customer.state].filter(Boolean).join(" - ");
  return [streetLine, customer.neighborhood, cityLine]
    .filter(Boolean)
    .join(" · ");
};

const statusLabel = {
  expired: "Expirada",
  failed: "Pagamento recusado",
  overdue: "Vencida",
  paid: "Pago",
  pending: "Pendente",
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
    case "expired":
      return "destructive";
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
    case "expired":
      return "bg-red-500/10 text-red-500 border-red-500/20";
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
