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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Globe } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { CgSpinner } from "react-icons/cg";
import { FaTimes } from "react-icons/fa";
import { WordPressInstance } from "./SitesList";

export interface SiteCardProps {
  instance: WordPressInstance;
  isLoading: boolean;
  isBulkMode: boolean;
  isPending: boolean;
  selectedInstances: number[];
  onToggleSelection: (instanceId: number) => void;
  onDelete: (instance: WordPressInstance) => void;
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
  const redirectUrl = useMemo(
    () => `/sites/edit?site=${encodeURIComponent(instance.domain)}`,
    [instance.domain]
  );

  return (
    <Card key={instance.id}>
      <CardHeader className="relative">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {isBulkMode ? (
            <Checkbox
              checked={selectedInstances.includes(instance.id)}
              onCheckedChange={() => onToggleSelection(instance.id)}
              className="mr-2 cursor-pointer"
            />
          ) : (
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <CgSpinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <FaTimes className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <TooltipContent>Excluir Site</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Site</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o site {instance.name}? Esta
                    ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(instance)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {instance.name}
        </CardTitle>
        <CardDescription>{instance.domain}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <CgSpinner className="h-4 w-4 animate-spin" />
            <span>Em processamento</span>
          </div>
        ) : (
          <Button variant="outline" asChild className="w-full">
            <Link href={redirectUrl} target="_blank" rel="noopener noreferrer">
              Editar Site
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
