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
import { suspendUserAction, reactivateUserAction } from "./actions";

interface Props {
  id: string;
  suspendedAt: Date | null;
  isAdmin: boolean;
}

export function UserActionsCell({ id, suspendedAt, isAdmin }: Props) {
  const [pending, startTransition] = useTransition();

  if (isAdmin) {
    return <span className="text-muted-foreground text-sm">Admin</span>;
  }

  if (suspendedAt === null) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={pending}>
            Suspender
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender conta?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário será redirecionado para a página de conta suspensa ao
              tentar acessar o painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => startTransition(() => suspendUserAction(id))}
            >
              Confirmar suspensão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => reactivateUserAction(id))}
    >
      Reativar
    </Button>
  );
}
