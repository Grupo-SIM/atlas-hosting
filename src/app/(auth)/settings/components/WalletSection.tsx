"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowDownLeft,
  ArrowUpCircle,
  ArrowUpRight,
  CreditCard,
  Plus,
  Wallet,
  History,
} from "lucide-react";
import type { User } from "@/lib/db/schema/tables/user";
import { formatDate, toBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WalletSectionProps {
  user: User;
  invoices: any[];
}

const quickAddAmounts = [50, 100, 250, 500];

export function WalletSection({ user, invoices }: WalletSectionProps) {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Saldo da Carteira
            </CardTitle>
            <CardDescription>Saldo disponível em sua carteira</CardDescription>
          </div>
          <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar fundos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar fundos à carteira</DialogTitle>
                <DialogDescription>
                  Selecione um valor para adicionar à sua carteira
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {quickAddAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        // Handle quick amount selection
                        console.log(`Adding ${amount} to wallet`);
                      }}
                    >
                      {toBrl(amount)}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customAmount">Valor personalizado</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="Digite o valor..."
                    min="10"
                    step="0.01"
                  />
                </div>
                <Button className="w-full">
                  Adicionar fundos
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">
                {toBrl(user.organization.wallet?.balance ?? 0)}
              </span>
              <Badge
                variant="outline"
                className="ml-3 bg-green-500/10 text-green-500"
              >
                <ArrowUpCircle className="mr-1 h-3 w-3" />
                Ativo
              </Badge>
            </div>
            {invoices.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Última transação: {format(invoices[0]?.createdAt, "PPP", { locale: ptBR })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transações Recentes
          </CardTitle>
          <CardDescription>
            Histórico das suas últimas movimentações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.reference}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-amber-600">
                    -{toBrl(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Nenhuma transação encontrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartões Salvos
            </CardTitle>
            <CardDescription>
              Gerencie seus métodos de pagamento salvos
            </CardDescription>
          </div>
          <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar cartão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar novo cartão</DialogTitle>
                <DialogDescription>
                  Adicione um novo cartão à sua carteira para pagamentos futuros
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do cartão</Label>
                  <Input
                    id="cardNumber"
                    placeholder="**** **** **** ****"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Validade</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="***"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nome no cartão</Label>
                  <Input
                    id="cardName"
                    placeholder="Nome como aparece no cartão"
                  />
                </div>
                <Button className="w-full">
                  Adicionar cartão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Nenhum cartão salvo encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Adicione um cartão para facilitar seus pagamentos futuros
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
