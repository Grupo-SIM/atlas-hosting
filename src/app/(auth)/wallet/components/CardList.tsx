"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CreditCard, Star, StarOff, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteCard, setDefaultCard } from "../actions";
import { toast } from "@/hooks/use-toast";

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
          title: "Sucesso",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao definir cartão padrão",
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
          title: "Sucesso",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover cartão",
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
      <div className="text-center py-8">
        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Nenhum cartão cadastrado. Adicione um cartão para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {getCardIcon(card.brand)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {card.brand} •••• {card.last4}
                </p>
                {card.isDefault && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Padrão
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {card.holderName} • Expira em {card.expiryMonth}/{card.expiryYear}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={card.isDefault ? "text-primary" : ""}
              onClick={() => handleSetDefault(card.id)}
              disabled={card.isDefault || loadingCardId === card.id}
              title={card.isDefault ? "Cartão padrão" : "Definir como padrão"}
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
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  disabled={deletingCardId === card.id}
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
                    onClick={() => handleDelete(card.id)}
                    className="bg-red-600 hover:bg-red-700"
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
