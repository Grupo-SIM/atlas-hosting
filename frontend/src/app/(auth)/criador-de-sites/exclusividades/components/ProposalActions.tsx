"use client";

import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProposalResponse } from "@/lib/template-exclusivity/proposals";
import {
  buyerTotal,
  formatBrl,
  proposalActionError,
} from "@/lib/template-exclusivity/rules";
import { answerProposal } from "../actions";

interface Props {
  checkoutUrl: string | null;
  feePercent: number;
  minimum: number;
  proposal: {
    amountBrl: number;
    expiresAt: Date;
    id: string;
    status: string;
    turn: "buyer" | "seller";
  };
  role: "buyer" | "seller";
}

/** Botões de acordo com o papel e a vez: aceitar, recusar, contrapropor, cancelar, pagar. */
export function ProposalActions({
  checkoutUrl,
  feePercent,
  minimum,
  proposal,
  role,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [countering, setCountering] = useState(false);
  const [amount, setAmount] = useState(Math.max(proposal.amountBrl, minimum));

  const can = (action: ProposalResponse["action"]) =>
    proposalActionError(
      { ...proposal, expiresAt: new Date(proposal.expiresAt) },
      role,
      action
    ) === null;

  const send = async (response: ProposalResponse, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(response.action);
    const result = await answerProposal(proposal.id, response);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      router.refresh();
      return;
    }
    setCountering(false);
    if (result.checkoutUrl) {
      router.push(result.checkoutUrl);
      return;
    }
    toast.success("Resposta enviada.");
    router.refresh();
  };

  if (
    role === "buyer" &&
    proposal.status === "awaiting_payment" &&
    checkoutUrl
  ) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-[#d6f34a] bg-[color:var(--sbx-lime-bg2)] p-5">
        <p className="flex-1 text-sm">
          Negócio fechado! Pague{" "}
          <strong>
            {formatBrl(buyerTotal(proposal.amountBrl, feePercent))}
          </strong>{" "}
          para receber a exclusividade.
        </p>
        <Button asChild={true}>
          <Link href={checkoutUrl}>Pagar agora</Link>
        </Button>
        <Button
          disabled={busy !== null}
          onClick={() =>
            send(
              { action: "cancel" },
              "Desistir da compra? A fatura será cancelada."
            )
          }
          variant="outline"
        >
          Desistir
        </Button>
      </div>
    );
  }

  const myTurn = can("accept");
  const canCancel = role === "buyer" && can("cancel");
  if (!(myTurn || canCancel)) {
    if (proposal.status === "open") {
      return (
        <p className="rounded-[14px] border border-[color:var(--sbx-line-b)] bg-[color:var(--sbx-card)] p-5 text-[color:var(--sbx-mute)] text-sm">
          Aguardando a resposta{" "}
          {role === "buyer" ? "do dono atual" : "do comprador"}.
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-[color:var(--sbx-line-b)] bg-[color:var(--sbx-card)] p-5">
      {myTurn ? (
        <p className="text-sm">
          {role === "seller"
            ? `Proposta de ${formatBrl(proposal.amountBrl)} pelo seu template.`
            : `O dono pediu ${formatBrl(proposal.amountBrl)}.`}{" "}
          O que você quer fazer?
        </p>
      ) : (
        <p className="text-[color:var(--sbx-mute)] text-sm">
          Aguardando a resposta do dono atual.
        </p>
      )}

      {countering && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="counter-amount">Sua contraproposta</Label>
          <MoneyInput id="counter-amount" onChange={setAmount} value={amount} />
          <p
            className={
              amount < minimum
                ? "text-destructive text-xs"
                : "text-muted-foreground text-xs"
            }
          >
            Mínimo de {formatBrl(minimum)}. O comprador pagaria{" "}
            {formatBrl(buyerTotal(amount, feePercent))} com a taxa do Atlas.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {myTurn && !countering && (
          <>
            <Button
              disabled={busy !== null}
              onClick={() =>
                send(
                  { action: "accept" },
                  role === "seller"
                    ? `Aceitar ${formatBrl(proposal.amountBrl)}? O comprador terá 48 horas para pagar.`
                    : `Aceitar ${formatBrl(proposal.amountBrl)}? Você terá 48 horas para pagar ${formatBrl(buyerTotal(proposal.amountBrl, feePercent))}.`
                )
              }
            >
              {busy === "accept" && (
                <Loader className="mr-2 size-4 animate-spin" />
              )}
              Aceitar
            </Button>
            <Button
              disabled={busy !== null}
              onClick={() => setCountering(true)}
              variant="outline"
            >
              Contraproposta
            </Button>
            <Button
              disabled={busy !== null}
              onClick={() =>
                send(
                  { action: "decline" },
                  "Recusar e encerrar esta negociação?"
                )
              }
              variant="outline"
            >
              {busy === "decline" && (
                <Loader className="mr-2 size-4 animate-spin" />
              )}
              Recusar
            </Button>
          </>
        )}
        {countering && (
          <>
            <Button
              disabled={busy !== null || amount < minimum}
              onClick={() => send({ action: "counter", amount })}
            >
              {busy === "counter" && (
                <Loader className="mr-2 size-4 animate-spin" />
              )}
              Enviar contraproposta
            </Button>
            <Button onClick={() => setCountering(false)} variant="outline">
              Voltar
            </Button>
          </>
        )}
        {canCancel && !countering && (
          <Button
            disabled={busy !== null}
            onClick={() => send({ action: "cancel" }, "Cancelar sua proposta?")}
            variant="ghost"
          >
            {busy === "cancel" && (
              <Loader className="mr-2 size-4 animate-spin" />
            )}
            Cancelar proposta
          </Button>
        )}
      </div>
    </div>
  );
}
