"use client";

import {
  AlertTriangle,
  ArrowUpCircle,
  Package,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WordPressSiteInfo } from "../types";

interface WordPressActionsButtonsProps {
  sites: WordPressSiteInfo[];
}

export function WordPressActionsButtons({
  sites,
}: WordPressActionsButtonsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate sites with updates available
  const sitesWithUpdates = sites.filter(
    site =>
      site.updatesAvailable?.core ||
      (site.updatesAvailable?.plugins &&
        site.updatesAvailable.plugins.length > 0)
  );

  const handleUpdateAll = async () => {
    setIsUpdating(true);
    try {
      // Trigger server actions for updates
      // This would call the updateWordPressCore and updatePlugin actions
      router.refresh();
    } finally {
      setTimeout(() => setIsUpdating(false), 2000);
    }
  };

  const handleCreateBackup = async () => {
    try {
      // This would call the createWordPressBackup server action
      router.refresh();
    } catch (error) {
      console.error("Error creating backup:", error);
    }
  };

  if (sites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {sitesWithUpdates.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800 dark:text-orange-200">
                Atualizações Disponíveis
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              {sitesWithUpdates.length} site
              {sitesWithUpdates.length !== 1 ? "s" : ""} com atualizações
              pendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {sitesWithUpdates.map(site => (
                <Badge
                  className="bg-white dark:bg-orange-900"
                  key={site.id}
                  variant="secondary"
                >
                  {site.url}
                </Badge>
              ))}
            </div>
            <Button
              className="bg-orange-600 text-white hover:bg-orange-700"
              disabled={isUpdating}
              onClick={handleUpdateAll}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Atualizar Todos os Sites
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações em Lote</CardTitle>
          <CardDescription>
            Execute ações em todos os seus sites WordPress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              className="flex items-center space-x-2"
              onClick={handleCreateBackup}
              variant="outline"
            >
              <Shield className="h-4 w-4" />
              <span>Backup de Todos os Sites</span>
            </Button>

            <Button
              className="flex items-center space-x-2"
              onClick={() => router.refresh()}
              variant="outline"
            >
              <Package className="h-4 w-4" />
              <span>Verificar Plugins</span>
            </Button>

            <Button
              className="flex items-center space-x-2"
              onClick={() => router.refresh()}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Verificar Status</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
