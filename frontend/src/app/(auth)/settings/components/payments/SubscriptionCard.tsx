"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { associateSubscriptionCard } from "../../payment-actions";
import type { PaymentCardSummary } from "./types";

export function SubscriptionCard({
  id,
  plan,
  amount,
  nextCharge,
  currentCardId,
  cards,
}: {
  id: string;
  plan: string;
  amount: number;
  nextCharge: string;
  currentCardId: string | null;
  cards: PaymentCardSummary[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const current = cards.find(card => card.id === currentCardId);
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="font-medium">
        {plan} ·{" "}
        {amount.toLocaleString("pt-BR", { currency: "BRL", style: "currency" })}
      </p>
      <p className="text-muted-foreground text-sm">
        Renovação: {nextCharge}.{" "}
        {current
          ? `Cartão: ${current.brand} final ${current.last4}.`
          : "Sem cartão válido associado."}
      </p>
      <p className="text-muted-foreground text-sm">
        Ao selecionar, você autoriza cobrança automática desta assinatura,
        inclusive renovação pendente. Pagamentos e cancelamentos em conciliação
        exigem suporte.
      </p>
      <div className="flex flex-wrap gap-2">
        {cards.map(card => (
          <Button
            className="cursor-pointer"
            disabled={pending || currentCardId === card.id}
            key={card.id}
            onClick={() =>
              startTransition(async () => {
                const result = await associateSubscriptionCard(id, card.id);
                toast({
                  description: result.ok
                    ? "Cartão selecionado para renovação automática desta assinatura."
                    : result.error,
                  title: result.ok
                    ? "Cartão associado"
                    : "Não foi possível associar",
                  variant: result.ok ? "default" : "destructive",
                });
                if (result.ok) router.refresh();
              })
            }
            variant="outline"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {currentCardId === card.id ? "Selecionado:" : "Usar este cartão:"}{" "}
            {card.brand} •••• {card.last4}
          </Button>
        ))}
      </div>
    </div>
  );
}
