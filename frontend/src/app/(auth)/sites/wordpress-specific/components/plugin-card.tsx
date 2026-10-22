"use client";

import {
  ArrowUpCircle,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Settings,
  XCircle,
} from "lucide-react";
import { useState, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { togglePlugin, updatePlugin } from "../actions";
import type { WordPressPluginInfo } from "../types";

interface PluginCardProps {
  plugin: WordPressPluginInfo;
  instanceId: number;
  siteUrl: string;
}

export function PluginCard({ plugin, instanceId, siteUrl }: PluginCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);
    startTransition(async () => {
      try {
        const result = await updatePlugin(instanceId, plugin.name);
        if (result.success) {
          toast({
            description: result.message,
            title: "Plugin atualizado",
          });
        } else {
          toast({
            description: result.message,
            title: "Erro ao atualizar",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Falha ao atualizar o plugin",
          title: "Erro",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    });
  };

  const handleToggle = (activate: boolean) => {
    setIsToggling(true);
    startTransition(async () => {
      try {
        const result = await togglePlugin(instanceId, plugin.name, activate);
        if (result.success) {
          toast({
            description: result.message,
            title: activate ? "Plugin ativado" : "Plugin desativado",
          });
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: `Falha ao ${activate ? "ativar" : "desativar"} o plugin`,
          title: "Erro",
          variant: "destructive",
        });
      } finally {
        setIsToggling(false);
      }
    });
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <h5 className="mb-1 font-medium text-sm">{plugin.name}</h5>
            <p className="mb-2 text-muted-foreground text-xs">
              {plugin.description || "Sem descrição"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-6 w-6 p-0"
                disabled={isPending}
                size="sm"
                variant="ghost"
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-3 w-3" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={isToggling}
                onClick={() => handleToggle(plugin.status !== "active")}
              >
                {plugin.status === "active" ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>

              {plugin.updateAvailable && (
                <DropdownMenuItem disabled={isUpdating} onClick={handleUpdate}>
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  {isUpdating ? "Atualizando..." : "Atualizar"}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={e => e.preventDefault()}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Remover
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover Plugin</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja remover o plugin "{plugin.name}"?
                      Esta ação não pode ser desfeita e todos os dados do plugin
                      serão perdidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              className={
                plugin.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : ""
              }
              variant={plugin.status === "active" ? "default" : "secondary"}
            >
              {plugin.status === "active" ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {plugin.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
            {plugin.updateAvailable && (
              <Badge
                className="border-orange-200 text-orange-600"
                variant="outline"
              >
                <ArrowUpCircle className="mr-1 h-3 w-3" />
                Update
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground text-xs">
            v{plugin.version}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
