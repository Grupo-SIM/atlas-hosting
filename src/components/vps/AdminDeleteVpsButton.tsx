"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteVpsAction } from "@/app/vps-actions";
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

interface AdminDeleteVpsButtonProps {
  vpsId: string;
  vpsName: string;
}

export default function AdminDeleteVpsButton({
  vpsId,
  vpsName,
}: AdminDeleteVpsButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteVpsAction(vpsId);
      if (res.success) {
        toast.success(`Servidor "${vpsName}" desvinculado com sucesso.`);
      }
    } catch (error: any) {
      toast.error(`Erro ao desvincular: ${error.message}`);
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
          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso irá desvincular o servidor <strong>{vpsName}</strong> da conta
            do cliente. Ele perderá acesso total às métricas e monitoramento
            deste nó imediatamente.
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
            Desvincular Agora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
