"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpCircle,
  Check,
  CreditCard,
  History,
  Plus,
  Star,
  StarOff,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { IMaskInput } from "react-imask";
import {
  type AddCardData,
  addCard,
  deleteCard,
  getUserCards,
  setDefaultCard,
} from "@/app/(auth)/wallet/actions";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { UserCard } from "@/lib/db/schema/tables/card";
import type { User } from "@/lib/db/schema/tables/user";
import { toBrl } from "@/lib/utils";

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
    billingCity: "",
    billingEmail: "",
    // Billing information
    billingName: "",
    billingNeighborhood: "",
    billingNumber: "",
    billingPhone: "",
    billingState: "",
    billingStreet: "",
    billingZipCode: "",
    cardCvv: "",
    cardExpiration: "",
    cardNumber: "",
    holderDocument: "",
    holderName: "",
  });

  // Check if user needs billing information
  const needsBillingInfo = !user.organization?.domId;

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
          description: "Erro ao carregar cartões salvos",
          title: "Erro",
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
        description: "Todos os campos são obrigatórios",
        title: "Erro",
        variant: "destructive",
      });
      return;
    }

    // Validate billing information if user doesn't have domId
    if (needsBillingInfo) {
      if (
        !cardForm.billingName ||
        !cardForm.billingEmail ||
        !cardForm.billingPhone ||
        !cardForm.billingStreet ||
        !cardForm.billingNumber ||
        !cardForm.billingNeighborhood ||
        !cardForm.billingZipCode ||
        !cardForm.billingCity ||
        !cardForm.billingState
      ) {
        toast({
          description: "Todos os campos de cobrança são obrigatórios",
          title: "Erro",
          variant: "destructive",
        });
        return;
      }
    }

    startTransition(async () => {
      const result = await addCard(cardForm);

      if (result.status === "success") {
        toast({
          description: result.message,
          title: "Sucesso",
        });
        setIsAddCardOpen(false);
        setCardForm({
          billingCity: "",
          billingEmail: "",
          // Reset billing information
          billingName: "",
          billingNeighborhood: "",
          billingNumber: "",
          billingPhone: "",
          billingState: "",
          billingStreet: "",
          billingZipCode: "",
          cardCvv: "",
          cardExpiration: "",
          cardNumber: "",
          holderDocument: "",
          holderName: "",
        });
        // Reload cards
        const userCards = await getUserCards();
        setCards(userCards);
      } else {
        toast({
          description: result.message,
          title: "Erro",
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
          description: result.message,
          title: "Sucesso",
        });
        // Reload cards
        const userCards = await getUserCards();
        setCards(userCards);
      } else {
        toast({
          description: result.message,
          title: "Erro",
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
          description: result.message,
          title: "Sucesso",
        });
        // Reload cards
        const userCards = await getUserCards();
        setCards(userCards);
      } else {
        toast({
          description: result.message,
          title: "Erro",
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
          <Dialog onOpenChange={setIsAddFundsOpen} open={isAddFundsOpen}>
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
                  {quickAddAmounts.map(amount => (
                    <Button
                      className="h-12"
                      key={amount}
                      onClick={() => {
                        // Handle quick amount selection
                        console.log(`Adding ${amount} to wallet`);
                      }}
                      variant="outline"
                    >
                      {toBrl(amount)}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customAmount">Valor personalizado</Label>
                  <Input
                    id="customAmount"
                    min="10"
                    placeholder="Digite o valor..."
                    step="0.01"
                    type="number"
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
              <span className="font-bold text-4xl">
                {toBrl(user.organization.wallet?.balance ?? 0)}
              </span>
              <Badge
                className="mt-2 mb-auto ml-3 bg-green-500/10 text-green-500"
                variant="outline"
              >
                <ArrowUpCircle className="mr-1 h-3 w-3" />
                Ativo
              </Badge>
            </div>
            {invoices.length > 0 && (
              <p className="mt-2 text-muted-foreground text-sm">
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
          <Dialog onOpenChange={setIsAddCardOpen} open={isAddCardOpen}>
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
                    maxLength={19}
                    onChange={e =>
                      setCardForm(prev => ({
                        ...prev,
                        cardNumber: e.target.value.replace(/\s/g, ""),
                      }))
                    }
                    placeholder="**** **** **** ****"
                    value={formatCardNumber(cardForm.cardNumber)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Validade</Label>
                    <Input
                      id="expiryDate"
                      maxLength={5}
                      onChange={e =>
                        setCardForm(prev => ({
                          ...prev,
                          cardExpiration: formatExpiryDate(e.target.value),
                        }))
                      }
                      placeholder="MM/YY"
                      value={cardForm.cardExpiration}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      maxLength={4}
                      onChange={e =>
                        setCardForm(prev => ({
                          ...prev,
                          cardCvv: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="***"
                      value={cardForm.cardCvv}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nome no cartão</Label>
                  <Input
                    id="cardName"
                    onChange={e =>
                      setCardForm(prev => ({
                        ...prev,
                        holderName: e.target.value,
                      }))
                    }
                    placeholder="Nome como aparece no cartão"
                    value={cardForm.holderName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holderDocument">CPF do portador</Label>
                  <IMaskInput
                    autoComplete="document"
                    className={inputClasses}
                    id="holderDocument"
                    mask={[
                      { lazy: true, mask: "000.000.000-00", maxLength: 11 },
                      { lazy: false, mask: "00.000.000/0000-00" },
                    ]}
                    onAccept={value =>
                      setCardForm(prev => ({
                        ...prev,
                        holderDocument: value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="000.000.000-00"
                    unmask={true}
                  />
                </div>

                {/* Billing Information Section - Only show if user doesn't have domId */}
                {needsBillingInfo && (
                  <div className="border-t pt-4">
                    <h4 className="mb-3 font-medium text-muted-foreground text-sm">
                      Informações de Cobrança
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingName">Nome completo</Label>
                        <Input
                          id="billingName"
                          onChange={e =>
                            setCardForm(prev => ({
                              ...prev,
                              billingName: e.target.value,
                            }))
                          }
                          placeholder="Nome completo do responsável"
                          value={cardForm.billingName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingEmail">Email</Label>
                        <Input
                          id="billingEmail"
                          onChange={e =>
                            setCardForm(prev => ({
                              ...prev,
                              billingEmail: e.target.value,
                            }))
                          }
                          placeholder="email@exemplo.com"
                          type="email"
                          value={cardForm.billingEmail}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingPhone">Telefone</Label>
                        <IMaskInput
                          className={inputClasses}
                          id="billingPhone"
                          mask="(00) 00000-0000"
                          onAccept={value =>
                            setCardForm(prev => ({
                              ...prev,
                              billingPhone: value,
                            }))
                          }
                          placeholder="(11) 99999-9999"
                          value={cardForm.billingPhone}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="billingStreet">Endereço</Label>
                          <Input
                            id="billingStreet"
                            onChange={e =>
                              setCardForm(prev => ({
                                ...prev,
                                billingStreet: e.target.value,
                              }))
                            }
                            placeholder="Nome da rua"
                            value={cardForm.billingStreet}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingNumber">Número</Label>
                          <Input
                            id="billingNumber"
                            onChange={e =>
                              setCardForm(prev => ({
                                ...prev,
                                billingNumber: e.target.value,
                              }))
                            }
                            placeholder="123"
                            value={cardForm.billingNumber}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingNeighborhood">Bairro</Label>
                        <Input
                          id="billingNeighborhood"
                          onChange={e =>
                            setCardForm(prev => ({
                              ...prev,
                              billingNeighborhood: e.target.value,
                            }))
                          }
                          placeholder="Nome do bairro"
                          value={cardForm.billingNeighborhood}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingZipCode">CEP</Label>
                          <IMaskInput
                            className={inputClasses}
                            id="billingZipCode"
                            mask="00000-000"
                            onAccept={value =>
                              setCardForm(prev => ({
                                ...prev,
                                billingZipCode: value,
                              }))
                            }
                            placeholder="00000-000"
                            value={cardForm.billingZipCode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">Cidade</Label>
                          <Input
                            id="billingCity"
                            onChange={e =>
                              setCardForm(prev => ({
                                ...prev,
                                billingCity: e.target.value,
                              }))
                            }
                            placeholder="Nome da cidade"
                            value={cardForm.billingCity}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingState">Estado</Label>
                        <Input
                          id="billingState"
                          maxLength={2}
                          onChange={e =>
                            setCardForm(prev => ({
                              ...prev,
                              billingState: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="SP"
                          value={cardForm.billingState}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full"
                  disabled={isPending}
                  onClick={handleAddCard}
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
              {cards.map(card => (
                <div
                  className="flex h-24 items-center justify-between rounded-lg border bg-card/50 p-4"
                  key={card.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-lg text-white">
                      {getCardBrandIcon(card.brand)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          **** **** **** {card.last4}
                        </p>
                        {card.isDefault && (
                          <Badge className="text-xs" variant="secondary">
                            <Star className="mr-1 h-3 w-3 fill-current" />
                            Padrão
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {card.brand.toUpperCase()} • Expira {card.expiryMonth}/
                        {card.expiryYear}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {card.holderName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <Button
                        disabled={isPending}
                        onClick={() => handleSetDefaultCard(card.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      disabled={isPending}
                      onClick={() => setCardToDelete(card.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mb-4 text-muted-foreground">
                Nenhum cartão salvo encontrado
              </p>
              <p className="text-muted-foreground text-sm">
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
              {invoices.map(transaction => (
                <div
                  className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                  key={transaction.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.reference}</p>
                      <p className="text-muted-foreground text-sm">
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
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
        onOpenChange={() => setCardToDelete(null)}
        open={!!cardToDelete}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => cardToDelete && handleDeleteCard(cardToDelete)}
            >
              {isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
