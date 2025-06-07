"use client";

import { useState, useEffect, useTransition } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowDownLeft,
  ArrowUpCircle,
  ArrowUpRight,
  CreditCard,
  Plus,
  Wallet,
  History,
  Trash2,
  Star,
  StarOff,
  Check,
} from "lucide-react";
import type { User } from "@/lib/db/schema/tables/user";
import type { UserCard } from "@/lib/db/schema/tables/card";
import { formatDate, toBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  addCard,
  deleteCard,
  setDefaultCard,
  getUserCards,
  type AddCardData,
} from "@/app/(auth)/wallet/actions";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletSectionProps {
  user: User;
  invoices: Array<{
    id: string;
    reference: string;
    amount: number;
    createdAt: Date;
  }>;
}

const quickAddAmounts = [50, 100, 250, 500];

// Helper function to get card brand icon
const getCardBrandIcon = (brand: string) => {
  switch (brand.toLowerCase()) {
    case "visa":
      return "💳";
    case "mastercard":
      return "💳";
    case "american express":
    case "amex":
      return "💳";
    default:
      return "💳";
  }
};

// Helper function to format card number
const formatCardNumber = (value: string) => {
  return value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
};

// Helper function to format expiry date
const formatExpiryDate = (value: string) => {
  return value.replace(/\D/g, "").replace(/(\d{2})(\d{2})/, "$1/$2");
};

export function WalletSection({ user, invoices }: WalletSectionProps) {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const { toast } = useToast();

  // Card form state
  const [cardForm, setCardForm] = useState<AddCardData>({
    cardNumber: "",
    cardCvv: "",
    cardExpiration: "",
    holderName: "",
    holderDocument: "",
  });

  // Load cards on component mount
  useEffect(() => {
    const loadCards = async () => {
      setIsLoadingCards(true);
      try {
        const userCards = await getUserCards();
        setCards(userCards);
      } catch (error) {
        console.error("Error loading cards:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar cartões salvos",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCards(false);
      }
    };

    loadCards();
  }, [toast]);

  const handleAddCard = async () => {
    if (
      !cardForm.cardNumber ||
      !cardForm.cardCvv ||
      !cardForm.cardExpiration ||
      !cardForm.holderName ||
      !cardForm.holderDocument
    ) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await addCard(cardForm);

      if (result.status === "success") {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        setIsAddCardOpen(false);
        setCardForm({
          cardNumber: "",
          cardCvv: "",
          cardExpiration: "",
          holderName: "",
          holderDocument: "",
        });
        // Reload cards
        const userCards = await getUserCards();
        setCards(userCards);
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    startTransition(async () => {
      const result = await deleteCard(cardId);

      if (result.status === "success") {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        // Reload cards
        const userCards = await getUserCards();
        setCards(userCards);
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
      setCardToDelete(null);
    });
  };

  const handleSetDefaultCard = async (cardId: string) => {
    startTransition(async () => {
      const result = await setDefaultCard(cardId);

      if (result.status === "success") {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        // Reload cards
        const userCards = await getUserCards();
        setCards(userCards);
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

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
                <Button className="w-full">Adicionar fundos</Button>
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
                className="ml-3 bg-green-500/10 text-green-500 mb-auto mt-2"
              >
                <ArrowUpCircle className="mr-1 h-3 w-3" />
                Ativo
              </Badge>
            </div>
            {invoices.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Última transação:{" "}
                {format(invoices[0]?.createdAt, "PPP", { locale: ptBR })}
              </p>
            )}
          </div>
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
                    value={formatCardNumber(cardForm.cardNumber)}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        cardNumber: e.target.value.replace(/\s/g, ""),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Validade</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardForm.cardExpiration}
                      onChange={(e) =>
                        setCardForm((prev) => ({
                          ...prev,
                          cardExpiration: formatExpiryDate(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="***"
                      maxLength={4}
                      value={cardForm.cardCvv}
                      onChange={(e) =>
                        setCardForm((prev) => ({
                          ...prev,
                          cardCvv: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nome no cartão</Label>
                  <Input
                    id="cardName"
                    placeholder="Nome como aparece no cartão"
                    value={cardForm.holderName}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        holderName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holderDocument">CPF do portador</Label>
                  <Input
                    id="holderDocument"
                    placeholder="000.000.000-00"
                    value={cardForm.holderDocument}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        holderDocument: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddCard}
                  disabled={isPending}
                >
                  {isPending ? "Adicionando..." : "Adicionar cartão"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoadingCards ? (
            <div className="text-center">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : cards.length > 0 ? (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card/50 h-24"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                      {getCardBrandIcon(card.brand)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          **** **** **** {card.last4}
                        </p>
                        {card.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="mr-1 h-3 w-3 fill-current" />
                            Padrão
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {card.brand.toUpperCase()} • Expira {card.expiryMonth}/
                        {card.expiryYear}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {card.holderName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultCard(card.id)}
                        disabled={isPending}
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCardToDelete(card.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
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
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.reference}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(transaction.createdAt, "PPP", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-muted-foreground">
                    {toBrl(transaction.amount)}
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

      {/* Delete Card Confirmation Dialog */}
      <AlertDialog
        open={!!cardToDelete}
        onOpenChange={() => setCardToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cartão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este cartão? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cardToDelete && handleDeleteCard(cardToDelete)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
