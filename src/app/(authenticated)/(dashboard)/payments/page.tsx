"use client";

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
import { Calendar, CreditCard, DollarSign, Download, Plus } from "lucide-react";
import { useState } from "react";

export default function PaymentsPage() {
  const [paymentMethods] = useState([
    {
      id: 1,
      type: "Cartão de Crédito",
      last4: "4242",
      expiry: "12/25",
      isDefault: true,
      brand: "Visa",
    },
    {
      id: 2,
      type: "Cartão de Débito",
      last4: "8888",
      expiry: "03/26",
      isDefault: false,
      brand: "Mastercard",
    },
  ]);

  const [transactions] = useState([
    {
      id: 1,
      date: "2024-03-15",
      description: "Plano Pro - Mensal",
      amount: "R$ 99,90",
      status: "success",
      invoice: "INV-001",
    },
    {
      id: 2,
      date: "2024-02-15",
      description: "Plano Pro - Mensal",
      amount: "R$ 99,90",
      status: "success",
      invoice: "INV-002",
    },
    {
      id: 3,
      date: "2024-01-15",
      description: "Registro de Domínio",
      amount: "R$ 45,00",
      status: "success",
      invoice: "INV-003",
    },
    {
      id: 4,
      date: "2024-01-15",
      description: "Plano Pro - Mensal",
      amount: "R$ 99,90",
      status: "failed",
      invoice: "INV-004",
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Pagamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus métodos de pagamento e histórico de transações
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Método de Pagamento
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.234,70</div>
            <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximo Pagamento
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 99,90</div>
            <p className="text-xs text-muted-foreground">Vence em 15/04/2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Métodos Ativos
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentMethods.length}</div>
            <p className="text-xs text-muted-foreground">Cartões cadastrados</p>
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
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {method.brand} •••• {method.last4}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expira em {method.expiry}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <Badge variant="secondary">Padrão</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
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
              <div className="flex justify-between items-center">
                <span className="text-sm">Hospedagem</span>
                <span className="font-medium">R$ 99,90/mês</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Domínios</span>
                <span className="font-medium">R$ 45,00/ano</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">E-mail</span>
                <span className="font-medium">R$ 19,90/mês</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SSL</span>
                <span className="font-medium">Gratuito</span>
              </div>
              <hr />
              <div className="flex justify-between items-center font-medium">
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
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Fatura: {transaction.invoice}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.amount}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
