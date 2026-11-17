"use client";

import { format } from "date-fns";
import { Crown, Loader, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  buyerTotal,
  EVICTION_DAYS,
  formatBrl,
  PAYMENT_WINDOW_HOURS,
  PROPOSAL_TTL_DAYS,
  type TemplateExclusivityState,
} from "@/lib/template-exclusivity/rules";
import { buyExclusivity, sendProposal } from "../actions";

export type ExclusivityView = TemplateExclusivityState & { feePercent: number };

/** Selo curto que fica sobre a miniatura do template. */
export function ExclusivityBadge({ state }: { state?: ExclusivityView }) {
  if (!state || state.kind === "public") return null;
  const base =
    "absolute top-2.5 left-2.5 z-10 flex items-center gap-[5px] rounded-full py-[5px] pr-2.5 pl-2 font-medium text-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.12)]";
  if (state.kind === "available") {
    return (
      <span className={`${base} bg-[#1d1c1a] text-[#d6f34a]`}>
        <Crown className="size-3" /> Pode ser só seu
      </span>
    );
  }
  if (state.kind === "owned_by_me") {
    return (
      <span className={`${base} bg-[#d6f34a] text-[#1d1c1a]`}>
        <Crown className="size-3" /> Seu exclusivo
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-[color:var(--sbx-ink)] text-[color:var(--sbx-on-ink)]`}
    >
      <Lock className="size-3" />
      {state.kind === "reserved" ? "Reservado" : "Exclusivo"}
    </span>
  );
}

/** Compra a exclusividade e leva para o checkout da anuidade. */
export function BuyExclusivityButton({
  children,
  className,
  templateId,
}: {
  children: ReactNode;
  className?: string;
  templateId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await buyExclusivity(templateId);
        if (!result.ok) {
          toast.error(result.error);
          setBusy(false);
          return;
        }
        router.push(result.checkoutUrl);
      }}
      type="button"
    >
      {busy && <Loader className="size-[13px] animate-spin" />}
      {children}
    </button>
  );
}

/** Abre a proposta de compra para o dono atual do template. */
export function ProposalButton({
  children,
  className,
  feePercent,
  minOfferBrl,
  templateId,
  templateName,
}: {
  children: ReactNode;
  className?: string;
  feePercent: number;
  minOfferBrl: number;
  templateId: string;
  templateName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)} type="button">
        {children}
      </button>
      <OfferDialog
        feePercent={feePercent}
        minimum={minOfferBrl}
        onClose={() => setOpen(false)}
        open={open}
        templateId={templateId}
        templateName={templateName}
      />
    </>
  );
}

/** Explica como funciona a compra de um template exclusivo de outra pessoa. */
export function ExclusivityRulesButton({
  className,
  feePercent,
  minOfferBrl,
}: {
  className?: string;
  feePercent: number;
  minOfferBrl: number;
}) {
  const [open, setOpen] = useState(false);
  const example = minOfferBrl;
  return (
    <>
      <button className={className} onClick={() => setOpen(true)} type="button">
        Ver regras
      </button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Como funciona a proposta</DialogTitle>
            <DialogDescription>
              Este template é exclusivo de outro usuário. Você pode comprar a
              exclusividade dele por uma proposta, sem trocar contato.
            </DialogDescription>
          </DialogHeader>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed">
            <li>
              Ofereça a partir de <strong>{formatBrl(minOfferBrl)}</strong>, o
              mínimo definido pelo dono.
            </li>
            <li>
              O dono pode aceitar, recusar ou mandar uma contraproposta. Cada
              lado tem {PROPOSAL_TTL_DAYS} dias para responder; sem resposta, a
              proposta expira.
            </li>
            <li>
              Aceita a proposta, você tem {PAYMENT_WINDOW_HOURS}h para pagar o
              valor fechado + a taxa do Atlas de {feePercent}%.
            </li>
            <li>
              Pago, a exclusividade passa a ser sua por 12 meses (renovação
              anual). Os sites do dono anterior saem do ar em {EVICTION_DAYS}{" "}
              dias.
            </li>
          </ol>
          <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
            <span className="text-muted-foreground text-xs">
              Exemplo · fechando pelo mínimo
            </span>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor acordado</span>
              <span>{formatBrl(example)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Taxa do Atlas ({feePercent}%)
              </span>
              <span>
                + {formatBrl(buyerTotal(example, feePercent) - example)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1.5 font-medium">
              <span>Você paga</span>
              <span>{formatBrl(buyerTotal(example, feePercent))}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Ações de exclusividade de um template (usado na barra da pré-visualização):
 * comprar, mostrar que é seu, ou fazer proposta ao dono atual.
 */
export function ExclusivityAction({
  className,
  state,
  templateId,
  templateName,
}: {
  className?: string;
  state?: ExclusivityView;
  templateId: string;
  templateName: string;
}) {
  if (!state || state.kind === "public") return null;

  if (state.kind === "available") {
    return (
      <BuyExclusivityButton className={className} templateId={templateId}>
        <Crown className="size-[14px]" />
        Exclusividade · {formatBrl(state.annualPriceBrl)}/ano
      </BuyExclusivityButton>
    );
  }

  if (state.kind === "owned_by_me") {
    return (
      <span className="flex items-center gap-1.5 px-1 py-2 text-[12px] text-[color:var(--sbx-mid)]">
        <Crown className="size-[13px]" />
        Só seu
        {state.expiresAt
          ? ` até ${format(new Date(state.expiresAt), "dd/MM/yyyy")}`
          : ""}
      </span>
    );
  }

  if (state.kind === "reserved") {
    return (
      <span className="flex items-center gap-1.5 px-1 py-2 text-[12px] text-[color:var(--sbx-mid)]">
        <Lock className="size-[13px]" /> Sendo adquirido por outra pessoa
      </span>
    );
  }

  return (
    <ProposalButton
      className={className}
      feePercent={state.feePercent}
      minOfferBrl={state.minOfferBrl}
      templateId={templateId}
      templateName={templateName}
    >
      <Lock className="size-[14px]" />
      Fazer proposta · mín. {formatBrl(state.minOfferBrl)}
    </ProposalButton>
  );
}

function OfferDialog({
  feePercent,
  minimum,
  onClose,
  open,
  templateId,
  templateName,
}: {
  feePercent: number;
  minimum: number;
  onClose: () => void;
  open: boolean;
  templateId: string;
  templateName: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(minimum);
  const [busy, setBusy] = useState(false);
  const tooLow = amount < minimum;

  const submit = async () => {
    setBusy(true);
    const result = await sendProposal(templateId, amount);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Proposta enviada! O dono foi avisado.");
    onClose();
    router.push(
      `/criador-de-sites/exclusividades/propostas/${result.proposalId}`
    );
  };

  return (
    <Dialog onOpenChange={value => !value && onClose()} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proposta pelo template {templateName}</DialogTitle>
          <DialogDescription>
            Este template é exclusivo de outro usuário. Ofereça um valor para
            comprar a exclusividade; ele pode aceitar, recusar ou mandar uma
            contraproposta. Vocês não trocam contato: tudo acontece aqui.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="offer-amount">Sua oferta</Label>
          <MoneyInput id="offer-amount" onChange={setAmount} value={amount} />
          <p
            className={
              tooLow
                ? "text-destructive text-xs"
                : "text-muted-foreground text-xs"
            }
          >
            Mínimo de {formatBrl(minimum)}.
          </p>
          {!tooLow && (
            <p className="text-muted-foreground text-sm">
              Se fechar por este valor, você paga{" "}
              <strong>{formatBrl(buyerTotal(amount, feePercent))}</strong>{" "}
              (inclui a taxa do Atlas de {feePercent}%) e ganha 12 meses de
              exclusividade.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button disabled={busy || tooLow} onClick={submit}>
            {busy && <Loader className="mr-2 size-4 animate-spin" />}
            Enviar proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
