"use client";

import { CreditCard, Loader2, Star, StarOff, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { deleteCard, setDefaultCard } from "../actions";

export interface UserCard {
  id: string;
  cardToken: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
  createdAt: Date;
}

interface CardListProps {
  cards: UserCard[];
}

export function CardList({ cards }: CardListProps) {
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleSetDefault = async (cardId: string) => {
    setLoadingCardId(cardId);
    try {
      const result = await setDefaultCard(cardId);

      if (result.status === "success") {
        toast({
          description: result.message,
          title: "Sucesso",
        });
      } else {
        toast({
          description: result.message,
          title: "Erro",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Erro inesperado ao definir cartão padrão",
        title: "Erro",
        variant: "destructive",
      });
    } finally {
      setLoadingCardId(null);
    }
  };

  const handleDelete = async (cardId: string) => {
    setDeletingCardId(cardId);
    try {
      const result = await deleteCard(cardId);

      if (result.status === "success") {
        toast({
          description: result.message,
          title: "Sucesso",
        });
      } else {
        toast({
          description: result.message,
          title: "Erro",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Erro inesperado ao remover cartão",
        title: "Erro",
        variant: "destructive",
      });
    } finally {
      setDeletingCardId(null);
    }
  };

  const getCardIcon = (brand: string) => {
    return <CreditCard className="h-6 w-6 text-primary" />;
  };

  if (cards.length === 0) {
    return (
      <div className="py-8 text-center">
        <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Nenhum cartão cadastrado. Adicione um cartão para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map(card => (
        <div
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
          key={card.id}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              {getCardIcon(card.brand)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {card.brand} •••• {card.last4}
                </p>
                {card.isDefault && (
                  <Badge
                    className="bg-primary/10 text-primary"
                    variant="outline"
                  >
                    Padrão
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {card.holderName} • Expira em {card.expiryMonth}/
                {card.expiryYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className={card.isDefault ? "text-primary" : ""}
              disabled={card.isDefault || loadingCardId === card.id}
              onClick={() => handleSetDefault(card.id)}
              size="icon"
              title={card.isDefault ? "Cartão padrão" : "Definir como padrão"}
              variant="ghost"
            >
              {loadingCardId === card.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : card.isDefault ? (
                <Star className="h-4 w-4 fill-current" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                  disabled={deletingCardId === card.id}
                  size="icon"
                  variant="ghost"
                >
                  {deletingCardId === card.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover cartão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover o cartão {card.brand} ••••{" "}
                    {card.last4}? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleDelete(card.id)}
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
