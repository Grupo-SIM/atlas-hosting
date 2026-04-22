"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, XCircle } from "lucide-react";
import { toggleVoucher, deleteVoucher } from "./voucher-actions";
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
import { useTransition } from "react";
import { toast } from "sonner";
import { TableCell } from "@/components/ui/table";

interface VoucherActionsProps {
  voucherId: string;
  active: boolean;
  code: string;
}

export default function VoucherActions({
  voucherId,
  active,
  code,
}: VoucherActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleVoucher(voucherId, active);
        toast.success(
          `Voucher ${code} ${active ? "desativado" : "ativado"} com sucesso!`
        );
      } catch (error) {
        toast.error("Erro ao alterar status do voucher.");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteVoucher(voucherId);
        toast.success(`Voucher ${code} excluído com sucesso!`);
      } catch (error) {
        toast.error("Erro ao excluir voucher.");
      }
    });
  };

  return (
    <>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={isPending}
          className="hover:bg-muted w-full"
        >
          {active ? (
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                Desativar
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                Ativar
              </span>
            </div>
          )}
        </Button>
      </TableCell>

      <TableCell className="text-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              className="hover:bg-red-500/10 text-red-500 gap-2 w-full"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                Excluir
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O voucher{" "}
                <span className="font-bold text-foreground text-emerald-500">{code}</span> será
                permanentemente excluído do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir Voucher
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </>
  );
}
