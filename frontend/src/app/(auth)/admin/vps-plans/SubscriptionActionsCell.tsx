"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { SendRenewalReminderButton } from "./components";
import { createVpsRenewalInvoice } from "@/app/actions";
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
import { Button } from "@/components/ui/button";
import {
  cancelVpsSubscriptionAction,
  reactivateVpsSubscriptionAction,
} from "./actions";

interface Props {
  id: string;
  status: "active" | "cancelled" | "failed" | "paused";
  paymentMethod: "credit_card" | "pix" | "boleto" | "voucher";
  nextChargeDate: Date;
}

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export function SubscriptionActionsCell({
  id,
  status,
  paymentMethod,
  nextChargeDate,
}: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const dueSoon =
    new Date(nextChargeDate).getTime() <= Date.now() + FIFTEEN_DAYS_MS;
  const canRenewPix =
    ((status === "paused" || status === "failed" || status === "active") && dueSoon);

  const handleRenew = () => {
    startTransition(async () => {
      const result = await createVpsRenewalInvoice(id);
      if (result.status === "success") {
        router.push(result.redirectUrl);
      } else {
        toast.error(result.message);
      }
    });
  };

  let primaryAction: ReactNode = null;

  if (canRenewPix) {
    primaryAction = (
      <Button
        disabled={pending}
        onClick={handleRenew}
        size="sm"
        variant="default"
      >
        Renovar plano
      </Button>
    );
  }
  /* Desabilitado: essa ação só muda vps_subscriptions.status no banco — não
   * suspende o servidor na Contabo nem tira acesso do cliente à plataforma.
   * Ver plano de vinculação com status real da Contabo antes de reativar.
  else if (status === "active") {
    primaryAction = (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={pending}>
            Suspender
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender assinatura?</AlertDialogTitle>
            <AlertDialogDescription>
              A assinatura será pausada e nenhuma cobrança ocorrerá. O tempo
              restante será preservado e retomará a partir da data de reativação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                startTransition(() => suspendVpsSubscriptionAction(id))
              }
            >
              Confirmar suspensão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } */
  if (!canRenewPix && status === "paused") {
    primaryAction = (
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(() => reactivateVpsSubscriptionAction(id))
        }
        size="sm"
        variant="default"
      >
        Reativar
      </Button>
    );
  }

  // Desabilitado: essa ação só muda vps_subscriptions.status no banco — não
  // cancela o servidor na Contabo nem tira acesso do cliente à plataforma.
  // Ver plano de vinculação com status real da Contabo antes de reativar.
  const cancelAction = false && (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={pending} size="sm" variant="destructive">
          Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cancelar assinatura definitivamente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O cliente não será cobrado
            novamente por esta assinatura. Para retomar o serviço, será
            necessário fazer uma nova contratação.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() =>
              startTransition(() => cancelVpsSubscriptionAction(id))
            }
          >
            Confirmar cancelamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const canSendReminder = status === "active" &&
    new Date(nextChargeDate).toLocaleDateString("en-CA", { timeZone: "America/Recife" }) >
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Recife" });

  if (!primaryAction && !cancelAction && !canSendReminder) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {primaryAction}
      {cancelAction}
      {canSendReminder && <SendRenewalReminderButton subscriptionId={id} />}
    </div>
  );
}
