"use client";

import { format } from "date-fns";
import { Crown, Loader, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  formatBrl,
  type TemplateExclusivityState,
} from "@/lib/template-exclusivity/rules";
import { buyExclusivity, sendProposal } from "../actions";

export type ExclusivityView = TemplateExclusivityState & { feePercent: number };

/** Selo curto para o card da galeria. */
export function ExclusivityBadge({ state }: { state?: ExclusivityView }) {
  if (!state || state.kind === "public") return null;
  const base =
    "absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-[11px] shadow-sm";
  if (state.kind === "available") {
    return (
      <span className={`${base} bg-white text-[#1d1c1a]`}>
        <Crown className="size-3" /> Exclusividade disponível
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
    <span className={`${base} bg-[#1d1c1a] text-white`}>
      <Lock className="size-3" /> Exclusivo
    </span>
  );
}

/**
 * Ações de exclusividade de um template: comprar (preço anual do admin),
 * mostrar que é seu, ou fazer proposta ao dono atual.
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
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

  if (!state || state.kind === "public") return null;

  if (state.kind === "available") {
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
        {busy ? (
          <Loader className="size-[14px] animate-spin" />
        ) : (
          <Crown className="size-[14px]" />
        )}
        Exclusividade · {formatBrl(state.annualPriceBrl)}/ano
      </button>
    );
  }

  if (state.kind === "owned_by_me") {
    return (
      <span className="flex items-center gap-1.5 px-1 py-2 text-[#55524c] text-[12px]">
        <Crown className="size-[13px]" />
        Só seu{state.expiresAt ? ` até ${format(new Date(state.expiresAt), "dd/MM/yyyy")}` : ""}
      </span>
    );
  }

  if (state.kind === "reserved") {
    return (
      <span className="flex items-center gap-1.5 px-1 py-2 text-[#55524c] text-[12px]">
        <Lock className="size-[13px]" /> Sendo adquirido por outra pessoa
      </span>
    );
  }

  return (
    <>
      <button className={className} onClick={() => setOfferOpen(true)} type="button">
        <Lock className="size-[14px]" />
        Fazer proposta · mín. {formatBrl(state.minOfferBrl)}
      </button>
      <OfferDialog
        feePercent={state.feePercent}
        minimum={state.minOfferBrl}
        onClose={() => setOfferOpen(false)}
        open={offerOpen}
        templateId={templateId}
        templateName={templateName}
      />
    </>
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
    router.push(`/criador-de-sites/exclusividades/propostas/${result.proposalId}`);
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
          <p className={tooLow ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
            Mínimo de {formatBrl(minimum)}.
          </p>
          {!tooLow && (
            <p className="text-muted-foreground text-sm">
              Se fechar por este valor, você paga{" "}
              <strong>{formatBrl(buyerTotal(amount, feePercent))}</strong> (inclui
              a taxa do Atlas de {feePercent}%) e ganha 12 meses de exclusividade.
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
