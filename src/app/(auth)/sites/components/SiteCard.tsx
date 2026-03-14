"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
            onCheckedChange={() => onToggleSelection(instance.id)}
            disabled={isPending}
            className="mt-1"
          />
        )}
        <div className="flex-1">
          <CardTitle>{instance.name}</CardTitle>
          <CardDescription>{instance.domain}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">Status: {instance.status}</p>
        <p className="text-sm text-gray-500">Caminho: {instance.path}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isLoading || isPending}
              size="sm"
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
