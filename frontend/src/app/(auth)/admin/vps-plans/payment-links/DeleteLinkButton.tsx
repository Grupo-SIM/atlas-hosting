"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { deleteVpsPaymentLinkAction } from "./actions";

export function DeleteLinkButton({
  id,
  planName,
  isPaid,
}: {
  id: string;
  planName: string;
  isPaid: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteVpsPaymentLinkAction(id);
      toast.success("Link excluído.");
    } catch {
      toast.error("Erro ao excluir o link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="text-muted-foreground transition-colors hover:text-destructive"
          size="icon"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir este link?</AlertDialogTitle>
          <AlertDialogDescription>
            O link de <strong>{planName}</strong> some da lista e a URL para de
            funcionar. Não dá pra desfazer.
            {isPaid
              ? " A fatura já paga e a assinatura gerada por ele continuam intactas — some só o registro do link."
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
            onClick={e => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
