import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { getRealUser, getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgUserCard, pgVpsSubscription } from "@/lib/db/schema";
import { AddPaymentCard } from "./AddPaymentCard";
import { SubscriptionCard } from "./SubscriptionCard";

export async function PaymentSettings() {
  const user = await getUser();
  const real = await getRealUser();
  if (
    real.id !== user.id ||
    user.organization?.ownerId !== user.id ||
    !user.organization.wallet
  )
    return (
      <p>
        Gerenciamento de cartões disponível somente ao titular da organização,
        fora do acesso como cliente.
      </p>
    );
  const [cards, subscriptions] = await Promise.all([
    db.query.pgUserCard.findMany({
      where: eq(pgUserCard.walletId, user.organization.wallet.id),
    }),
    db.query.pgVpsSubscription.findMany({
      where: and(
        eq(pgVpsSubscription.userId, user.id),
        eq(pgVpsSubscription.orgId, user.organization.id),
        eq(pgVpsSubscription.paymentMethod, "credit_card"),
        eq(pgVpsSubscription.status, "active")
      ),
    }),
  ]);
  const summaries = cards.map(
    ({ id, brand, last4, expiryMonth, expiryYear }) => ({
      brand,
      expiryMonth,
      expiryYear,
      id,
      last4,
    })
  );
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-semibold text-xl">Cartões e assinaturas</h2>
        <p className="text-muted-foreground">
          Cadastre seu cartão e escolha qual usar em cada assinatura.{" "}
          <Link className="underline" href="/settings?tab=user">
            Atualizar dados pessoais de cobrança
          </Link>
        </p>
      </div>
      <AddPaymentCard />
      <div className="space-y-3">
        <h3 className="font-semibold">Assinaturas com pagamento por cartão</h3>
        {!summaries.length && (
          <p className="text-muted-foreground">
            Nenhum cartão salvo. Cadastre um cartão acima para selecionar na
            assinatura.
          </p>
        )}
        {subscriptions.map(sub => (
          <SubscriptionCard
            amount={sub.amountBrl}
            cards={summaries}
            currentCardId={
              cards.find(
                card =>
                  card.cardToken ===
                  (sub.config as Record<string, unknown>).cardToken
              )?.id ?? null
            }
            id={sub.id}
            key={sub.id}
            nextCharge={sub.nextChargeDate.toLocaleDateString("pt-BR", {
              timeZone: "America/Recife",
            })}
            plan={`${sub.planType.toUpperCase()} ${sub.planId}`}
          />
        ))}
        {!subscriptions.length && (
          <p className="text-muted-foreground">
            Nenhuma assinatura ativa com pagamento por cartão. Assinaturas
            pausadas ou canceladas precisam de atendimento para regularização.
          </p>
        )}
      </div>
    </section>
  );
}
