"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "@/hooks/use-toast";
import {
  ArrowUpCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Settings,
  Loader2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { updatePlugin, togglePlugin } from "../actions";
import type { WordPressPluginInfo } from "../actions";

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
            title: "Plugin atualizado",
            description: result.message,
          });
        } else {
          toast({
            title: "Erro ao atualizar",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao atualizar o plugin",
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
            title: activate ? "Plugin ativado" : "Plugin desativado",
            description: result.message,
          });
        } else {
          toast({
            title: "Erro",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: `Falha ao ${activate ? "ativar" : "desativar"} o plugin`,
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
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h5 className="font-medium text-sm mb-1">{plugin.name}</h5>
            <p className="text-xs text-muted-foreground mb-2">
              {plugin.description || "Sem descrição"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                disabled={isPending}
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
                onClick={() => handleToggle(plugin.status !== 'active')}
                disabled={isToggling}
              >
                {plugin.status === 'active' ? (
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
                <DropdownMenuItem
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
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
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
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
                      Esta ação não pode ser desfeita e todos os dados do plugin serão perdidos.
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
              variant={plugin.status === 'active' ? 'default' : 'secondary'}
              className={plugin.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
            >
              {plugin.status === 'active' ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {plugin.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            {plugin.updateAvailable && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <ArrowUpCircle className="mr-1 h-3 w-3" />
                Update
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            v{plugin.version}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
