"use client";

import { Calendar, CreditCard, DollarSign, Download, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentsPage() {
  const [paymentMethods] = useState([
    {
      brand: "Visa",
      expiry: "12/25",
      id: 1,
      isDefault: true,
      last4: "4242",
      type: "Cartão de Crédito",
    },
    {
      brand: "Mastercard",
      expiry: "03/26",
      id: 2,
      isDefault: false,
      last4: "8888",
      type: "Cartão de Débito",
    },
  ]);

  const [transactions] = useState([
    {
      amount: "R$ 99,90",
      date: "2024-03-15",
      description: "Plano Pro - Mensal",
      id: 1,
      invoice: "INV-001",
      status: "success",
    },
    {
      amount: "R$ 99,90",
      date: "2024-02-15",
      description: "Plano Pro - Mensal",
      id: 2,
      invoice: "INV-002",
      status: "success",
    },
    {
      amount: "R$ 45,00",
      date: "2024-01-15",
      description: "Registro de Domínio",
      id: 3,
      invoice: "INV-003",
      status: "success",
    },
    {
      amount: "R$ 99,90",
      date: "2024-01-15",
      description: "Plano Pro - Mensal",
      id: 4,
      invoice: "INV-004",
      status: "failed",
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case "failed":
        return <Badge variant="destructive">Falhou</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            Pagamentos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie seus métodos de pagamento e histórico de transações
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Método de Pagamento
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Gasto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">R$ 1.234,70</div>
            <p className="text-muted-foreground text-xs">Últimos 12 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Próximo Pagamento
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">R$ 99,90</div>
            <p className="text-muted-foreground text-xs">Vence em 15/04/2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Métodos Ativos
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{paymentMethods.length}</div>
            <p className="text-muted-foreground text-xs">Cartões cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>
              Gerencie seus cartões e métodos de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map(method => (
                <div
                  className="flex items-center justify-between rounded-lg border p-4"
                  key={method.id}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {method.brand} •••• {method.last4}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Expira em {method.expiry}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <Badge variant="secondary">Padrão</Badge>
                    )}
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                </div>
              ))}

              <Button className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Novo Cartão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Gastos</CardTitle>
            <CardDescription>
              Visão geral dos seus gastos mensais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Hospedagem</span>
                <span className="font-medium">R$ 99,90/mês</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Domínios</span>
                <span className="font-medium">R$ 45,00/ano</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">E-mail</span>
                <span className="font-medium">R$ 19,90/mês</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL</span>
                <span className="font-medium">Gratuito</span>
              </div>
              <hr />
              <div className="flex items-center justify-between font-medium">
                <span>Total Mensal</span>
                <span>R$ 119,80</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Visualize todas as suas transações recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Fatura: {transaction.invoice}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.amount}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
