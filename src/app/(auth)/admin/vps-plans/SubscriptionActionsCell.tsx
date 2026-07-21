"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  suspendVpsSubscriptionAction,
  reactivateVpsSubscriptionAction,
  cancelVpsSubscriptionAction,
} from "./actions";
import { createVpsRenewalInvoice } from "@/app/actions";

interface Props {
  id: string;
  status: "active" | "cancelled" | "failed" | "paused";
  paymentMethod: "credit_card" | "pix";
  nextChargeDate: Date;
}

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export function SubscriptionActionsCell({ id, status, paymentMethod, nextChargeDate }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const dueSoon = new Date(nextChargeDate).getTime() <= Date.now() + FIFTEEN_DAYS_MS;
  const canRenewPix =
    paymentMethod === "pix" && (status === "paused" || (status === "active" && dueSoon));

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

  let primaryAction: React.ReactNode = null;

  if (canRenewPix) {
    primaryAction = (
      <Button variant="default" size="sm" disabled={pending} onClick={handleRenew}>
        Renovar (PIX)
      </Button>
    );
  } else if (status === "active") {
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
  } else if (status === "paused") {
    primaryAction = (
      <Button
        variant="default"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(() => reactivateVpsSubscriptionAction(id))
        }
      >
        Reativar
      </Button>
    );
  }

  const cancelAction = status !== "cancelled" && (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={pending}>
          Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar assinatura definitivamente?</AlertDialogTitle>
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

  if (!primaryAction && !cancelAction) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {primaryAction}
      {cancelAction}
    </div>
  );
}
