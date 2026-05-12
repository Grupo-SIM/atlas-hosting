"use client";

import { useTransition } from "react";
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
import { suspendVpsSubscriptionAction, reactivateVpsSubscriptionAction } from "./actions";

interface Props {
  id: string;
  status: "active" | "cancelled" | "failed" | "paused";
}

export function SubscriptionActionsCell({ id, status }: Props) {
  const [pending, startTransition] = useTransition();

  if (status === "active") {
    return (
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
  }

  if (status === "paused") {
    return (
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

  return <span className="text-muted-foreground text-sm">—</span>;
}
