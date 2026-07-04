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
import { suspendUserAction, reactivateUserAction, promoteToAdminAction } from "./actions";
import { startImpersonationAction } from "./impersonation-actions";

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

  if (suspendedAt !== null) {
    return (
      <div className="flex items-center justify-end gap-2">
        <ImpersonateButton id={id} pending={pending} startTransition={startTransition} />
        <Button
          variant="default"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => reactivateUserAction(id))}
        >
          Reativar
        </Button>
        <PromoteButton id={id} pending={pending} startTransition={startTransition} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <ImpersonateButton id={id} pending={pending} startTransition={startTransition} />
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
      <PromoteButton id={id} pending={pending} startTransition={startTransition} />
    </div>
  );
}

function ImpersonateButton({
  id,
  pending,
  startTransition,
}: {
  id: string;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending}>
          Acessar como
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Acessar como este cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            Você entrará no painel vendo a conta deste cliente. O acesso é
            registrado no log de segurança (seu e do cliente) e um aviso fica
            visível enquanto durar. Use o botão "Sair da conta do cliente" para
            voltar à sua conta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => startTransition(() => startImpersonationAction(id))}
          >
            Acessar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PromoteButton({
  id,
  pending,
  startTransition,
}: {
  id: string;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="sm" disabled={pending}>
          Tornar Admin
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promover a Admin?</AlertDialogTitle>
          <AlertDialogDescription>
            O usuário terá acesso total ao painel administrativo. Esta ação não
            pode ser desfeita por aqui.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => startTransition(() => promoteToAdminAction(id))}
          >
            Confirmar promoção
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
