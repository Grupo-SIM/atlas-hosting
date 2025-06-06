"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  Package,
  Tag,
} from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import type { Invoice } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";

export default function InvoiceCard({
  isExpanded,
  invoice,
}: { isExpanded?: boolean; invoice: Invoice }) {
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
                <CardTitle className="text-lg font-bold">
                  Invoice #INV-2024-001
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Web Development Package
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xl font-bold text-primary">$2,450.00</p>
                <p className="text-xs text-muted-foreground">Dec 5, 2024</p>
              </div>
              <Link href={isExpanded ? "?" : `?id=${invoice.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Summary Bar */}
          {!isExpanded && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
              <Badge variant="secondary" className="text-xs">
                Digital Service
              </Badge>
              <Badge variant="outline" className="text-xs">
                Issued
              </Badge>
              <span className="text-xs text-muted-foreground">Net 30 days</span>
            </div>
          )}
        </CardHeader>

        {/* Expanded Detailed View */}
        {isExpanded && (
          <CardContent className="space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex justify-end">
              <Badge
                variant={getStatusVariant(invoice.status)}
                className="text-sm"
              >
                {invoice.status === "pending" && "A pagar"}
                {invoice.status === "paid" && "Pago"}
                {invoice.status === "failed" && "Pagamento recusado"}
                {invoice.status === "processing" && "Em processamento"}
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
                      <p className="font-semibold">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Tipo de produto:
                  </span>
                  <Badge variant="outline">
                    {invoice.type === "domain" ? "Domínio" : "Plano"}]]]]]]
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Price Breakdown</h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">$2,200.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium">$220.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-medium">$30.00</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">$2,450.00</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-muted/20 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Payment Terms:</strong> Net 30 days from emission date.
                Late payments may incur additional fees.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button size="sm" className="flex-1">
                Download PDF
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Send Email
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

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
