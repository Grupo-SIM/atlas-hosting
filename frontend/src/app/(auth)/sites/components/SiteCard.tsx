"use client";

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ParsedWordPressInstance } from "@/lib/server/utils";

export interface SiteCardProps {
  instance: ParsedWordPressInstance;
  isLoading: boolean;
  isBulkMode: boolean;
  isPending: boolean;
  selectedInstances: number[];
  onToggleSelection: (instanceId: number) => void;
  onDelete: (instance: ParsedWordPressInstance) => void;
}

export function SiteCard({
  instance,
  isLoading,
  isBulkMode,
  isPending,
  selectedInstances,
  onToggleSelection,
  onDelete,
}: SiteCardProps) {
  const isSelected = selectedInstances.includes(instance.id);

  return (
    <Card className={isSelected ? "border-primary" : undefined}>
      <CardHeader className="flex flex-row items-start gap-3">
        {isBulkMode && (
          <Checkbox
            checked={isSelected}
            className="mt-1"
            disabled={isPending}
            onCheckedChange={() => onToggleSelection(instance.id)}
          />
        )}
        <div className="flex-1">
          <CardTitle>{instance.name}</CardTitle>
          <CardDescription>{instance.domain}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-sm">Status: {instance.status}</p>
        <p className="text-gray-500 text-sm">Caminho: {instance.path}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading || isPending}
              size="sm"
              variant="destructive"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente
                sua aplicação e removerá seus dados de nossos servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(instance)}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
