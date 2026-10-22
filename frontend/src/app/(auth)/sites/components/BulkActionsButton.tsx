"use client";

import { CgSpinner } from "react-icons/cg";
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

interface BulkActionButtonsProps {
  isBulkMode: boolean;
  selectedCount: number;
  isPending: boolean;
  onToggleBulkMode: () => void;
  onBulkDelete: () => void;
}

export function BulkActionButtons({
  isBulkMode,
  selectedCount,
  isPending,
  onToggleBulkMode,
  onBulkDelete,
}: BulkActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {isBulkMode ? (
        <>
          <Button onClick={onToggleBulkMode} size="sm" variant="outline">
            Cancelar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild={true}>
              <Button
                disabled={selectedCount === 0 || isPending}
                size="sm"
                variant="destructive"
              >
                {isPending ? (
                  <CgSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  `Deletar (${selectedCount})`
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Sites</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir {selectedCount} site(s)? Esta
                  ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onBulkDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <Button onClick={onToggleBulkMode} size="sm" variant="outline">
          Ação em massa
        </Button>
      )}
    </div>
  );
}
