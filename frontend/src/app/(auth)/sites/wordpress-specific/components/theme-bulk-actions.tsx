"use client";

import {
  CheckCircle,
  Download,
  MoreHorizontal,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { WordPressSiteInfo } from "../types";

interface ThemeBulkActionsProps {
  sites: WordPressSiteInfo[];
}

export function ThemeBulkActions({ sites }: ThemeBulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const totalThemes = sites.reduce(
    (acc, site) => acc + (site.themes?.length || 0),
    0
  );

  const totalActiveThemes = sites.reduce(
    (acc, site) =>
      acc +
      (site.themes?.filter(theme => theme.status === "active").length || 0),
    0
  );

  const totalThemeUpdates = sites.reduce(
    (acc, site) => acc + (site.updatesAvailable?.themes?.length || 0),
    0
  );

  const handleBulkAction = async (action: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement bulk theme actions
      switch (action) {
        case "update-all":
          toast({
            description: `Iniciando atualização de ${totalThemeUpdates} temas`,
            title: "Atualizando temas...",
          });
          break;
        case "activate-defaults":
          toast({
            description: "Ativando temas padrão em todas as instalações",
            title: "Ativando temas padrão...",
          });
          break;
        case "backup-themes":
          toast({
            description: "Criando backup de todos os temas customizados",
            title: "Fazendo backup...",
          });
          break;
        case "scan-updates":
          toast({
            description: "Escaneando todos os temas para atualizações",
            title: "Verificando atualizações...",
          });
          break;
      }
    } catch (error) {
      toast({
        description: "Falha ao executar ação em lote",
        title: "Erro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground text-sm">
        {totalThemes} temas • {totalActiveThemes} ativos
        {totalThemeUpdates > 0 && (
          <span className="ml-2 text-orange-600">
            • {totalThemeUpdates} atualizações
          </span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isLoading || totalThemes === 0}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="mr-2 h-4 w-4" />
            )}
            Ações em Lote
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {totalThemeUpdates > 0 && (
            <>
              <DropdownMenuItem onClick={() => handleBulkAction("update-all")}>
                <Download className="mr-2 h-4 w-4" />
                Atualizar Todos ({totalThemeUpdates})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onClick={() => handleBulkAction("activate-defaults")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Ativar Temas Padrão
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleBulkAction("backup-themes")}>
            <Settings className="mr-2 h-4 w-4" />
            Backup de Temas
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleBulkAction("scan-updates")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Verificar Atualizações
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        disabled={isLoading || totalThemes === 0}
        onClick={() => handleBulkAction("scan-updates")}
        size="sm"
        variant="outline"
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        />
        Atualizar
      </Button>
    </div>
  );
}
