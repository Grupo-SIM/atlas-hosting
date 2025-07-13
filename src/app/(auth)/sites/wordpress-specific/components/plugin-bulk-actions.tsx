"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, RefreshCw, Package, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { updatePlugin } from "../actions";
import type { WordPressSiteInfo } from "../types";

interface PluginBulkActionsProps {
  sites: WordPressSiteInfo[];
}

export function PluginBulkActions({ sites }: PluginBulkActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  // Get all plugins that have updates available across all sites
  const pluginsWithUpdates = sites.flatMap(
    (site) =>
      site.updatesAvailable?.plugins?.map((plugin) => ({
        plugin,
        siteId: site.id,
        instanceId: site.instanceId,
        siteUrl: site.url,
      })) || []
  );

  const handleUpdateAll = () => {
    if (pluginsWithUpdates.length === 0) {
      toast({
        title: "Nenhuma atualização",
        description: "Não há plugins com atualizações disponíveis",
      });
      return;
    }

    setIsUpdatingAll(true);
    startTransition(async () => {
      let successCount = 0;
      let errorCount = 0;

      for (const { plugin, instanceId } of pluginsWithUpdates) {
        try {
          const result = await updatePlugin(instanceId, plugin.name.toString());
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Atualizações concluídas",
          description: `${successCount} plugin(s) atualizado(s) com sucesso${errorCount > 0 ? `, ${errorCount} falharam` : ""}`,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          title: "Erro nas atualizações",
          description: `Falha ao atualizar ${errorCount} plugin(s)`,
          variant: "destructive",
        });
      }

      setIsUpdatingAll(false);
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (sites.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleUpdateAll}
        disabled={isPending || pluginsWithUpdates.length === 0}
        className={
          pluginsWithUpdates.length > 0
            ? "border-orange-200 text-orange-600 hover:bg-orange-50"
            : ""
        }
      >
        {isUpdatingAll ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ArrowUpCircle className="mr-2 h-4 w-4" />
        )}
        Atualizar Todos{" "}
        {pluginsWithUpdates.length > 0 && `(${pluginsWithUpdates.length})`}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Verificar Updates
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        {pluginsWithUpdates.length > 0 && (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200"
          >
            <Package className="mr-1 h-3 w-3" />
            {pluginsWithUpdates.length} update
            {pluginsWithUpdates.length !== 1 ? "s" : ""} disponível
            {pluginsWithUpdates.length !== 1 ? "is" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}
