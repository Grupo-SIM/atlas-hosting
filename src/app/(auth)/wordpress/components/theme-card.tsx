"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Palette, RefreshCw, Settings, Eye } from "lucide-react";
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
      console.log(`Theme action: ${action} for ${theme.name} on site ${siteId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error performing ${action} on theme ${theme.name}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">
                {theme.title || theme.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {siteName}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                disabled={isLoading}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {theme.status === "inactive" ? (
                <DropdownMenuItem 
                  onClick={() => handleAction("activate")}
                  disabled={isLoading}
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
              
              {theme.updateAvailable && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleAction("update")}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem 
                onClick={() => handleAction("customize")}
                disabled={isLoading}
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
              {theme.author && (
                <span className="text-muted-foreground">
                  por {theme.author}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant={theme.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {theme.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              
              {theme.updateAvailable && (
                <Badge variant="destructive" className="text-xs">
                  Atualização
                </Badge>
              )}
            </div>
          </div>

          {/* Theme Description */}
          {theme.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {theme.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {theme.updateAvailable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction("update")}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Atualizar
              </Button>
            )}
            
            {theme.status === "inactive" && (
              <Button
                size="sm"
                onClick={() => handleAction("activate")}
                disabled={isLoading}
                className="flex-1"
              >
                <Eye className="mr-2 h-3 w-3" />
                Ativar
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("customize")}
              disabled={isLoading}
              className={theme.status === "active" ? "flex-1" : ""}
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
