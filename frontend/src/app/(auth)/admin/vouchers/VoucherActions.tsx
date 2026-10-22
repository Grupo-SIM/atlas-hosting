"use client";

import { CheckCircle, Trash2, XCircle } from "lucide-react";
import { useTransition } from "react";
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
import { TableCell } from "@/components/ui/table";
import { deleteVoucher, toggleVoucher } from "./voucher-actions";

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
        toast.error(error instanceof Error ? error.message : "Erro ao excluir voucher.");
      }
    });
  };

  return (
    <>
      <TableCell className="text-center">
        <Button
          className="w-full hover:bg-muted"
          disabled={isPending}
          onClick={handleToggle}
          size="sm"
          variant="ghost"
        >
          {active ? (
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="h-4 w-4" />
              <span className="font-bold text-[10px] uppercase tracking-tighter">
                Desativar
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span className="font-bold text-[10px] uppercase tracking-tighter">
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
              className="w-full gap-2 text-red-500 hover:bg-red-500/10"
              disabled={isPending}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-bold text-[10px] uppercase tracking-tighter">
                Excluir
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O voucher{" "}
                <span className="font-bold text-emerald-500 text-foreground">
                  {code}
                </span>{" "}
                será permanentemente excluído do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
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
