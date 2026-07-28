"use client";

import {
  Eye,
  MoreHorizontal,
  Palette,
  RefreshCw,
  Settings,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WordPressThemeInfo } from "../types";

interface ThemeCardProps {
  theme: WordPressThemeInfo;
  siteId: number;
  siteName: string;
}

export function ThemeCard({ theme, siteId, siteName }: ThemeCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      // Theme management actions will be implemented here
      console.log(
        `Theme action: ${action} for ${theme.name} on site ${siteId}`
      );

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(
        `Error performing ${action} on theme ${theme.name}:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-2 dark:from-purple-900/20 dark:to-pink-900/20">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">
                {theme.title || theme.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {siteName}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 p-0"
                disabled={isLoading}
                variant="ghost"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {theme.status === "inactive" ? (
                <DropdownMenuItem
                  disabled={isLoading}
                  onClick={() => handleAction("activate")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ativar Tema
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <Eye className="mr-2 h-4 w-4" />
                  Tema Ativo
                </DropdownMenuItem>
              )}

              {theme.update === "available" && theme.update_version && (
                <>
                  <DropdownMenuItem
                    disabled={isLoading}
                    onClick={() => handleAction("update")}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                disabled={isLoading}
                onClick={() => handleAction("customize")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Personalizar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Theme Meta Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">
                v{theme.version || "N/A"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                className="text-xs"
                variant={theme.status === "active" ? "default" : "secondary"}
              >
                {theme.status === "active" ? "Ativo" : "Inativo"}
              </Badge>

              {theme.update === "available" && theme.update_version && (
                <Badge className="text-xs" variant="destructive">
                  Atualização para v{theme.update_version}
                </Badge>
              )}
            </div>
          </div>

          {/* Theme Description */}
          {theme.description && (
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {theme.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {theme.update === "available" && theme.update_version && (
              <Button
                className="flex-1"
                disabled={isLoading}
                onClick={() => handleAction("update")}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Atualizar para v{theme.update_version}
              </Button>
            )}

            {theme.status === "inactive" && (
              <Button
                className="flex-1"
                disabled={isLoading}
                onClick={() => handleAction("activate")}
                size="sm"
              >
                <Eye className="mr-2 h-3 w-3" />
                Ativar
              </Button>
            )}

            <Button
              className={theme.status === "active" ? "flex-1" : ""}
              disabled={isLoading}
              onClick={() => handleAction("customize")}
              size="sm"
              variant="outline"
            >
              <Settings className="mr-2 h-3 w-3" />
              {theme.status === "active" ? "Personalizar" : "Configurar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
