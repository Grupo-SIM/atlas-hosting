"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Palette,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import type { WordPressSiteInfo } from "../types";
import { useToast } from "@/hooks/use-toast";

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
      (site.themes?.filter((theme) => theme.status === "active").length || 0),
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
            title: "Atualizando temas...",
            description: `Iniciando atualização de ${totalThemeUpdates} temas`,
          });
          break;
        case "activate-defaults":
          toast({
            title: "Ativando temas padrão...",
            description: "Ativando temas padrão em todas as instalações",
          });
          break;
        case "backup-themes":
          toast({
            title: "Fazendo backup...",
            description: "Criando backup de todos os temas customizados",
          });
          break;
        case "scan-updates":
          toast({
            title: "Verificando atualizações...",
            description: "Escaneando todos os temas para atualizações",
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao executar ação em lote",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground">
        {totalThemes} temas • {totalActiveThemes} ativos
        {totalThemeUpdates > 0 && (
          <span className="text-orange-600 ml-2">
            • {totalThemeUpdates} atualizações
          </span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || totalThemes === 0}
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
        variant="outline"
        size="sm"
        onClick={() => handleBulkAction("scan-updates")}
        disabled={isLoading || totalThemes === 0}
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        />
        Atualizar
      </Button>
    </div>
  );
}
