"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Compose, 
  RefreshCw, 
  Settings, 
  Filter,
  Archive,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmailHeaderProps {
  onCompose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function EmailHeader({ onCompose, searchQuery, onSearchChange }: EmailHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar e-mails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-80"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Archive className="h-4 w-4 mr-2" />
            Arquivar
          </Button>
          
          <Button variant="outline" size="sm" disabled>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Marcar como lido</DropdownMenuItem>
              <DropdownMenuItem>Marcar como não lido</DropdownMenuItem>
              <DropdownMenuItem>Marcar como importante</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Mover para pasta</DropdownMenuItem>
              <DropdownMenuItem>Aplicar filtro</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side - Compose and Settings */}
        <div className="flex items-center gap-3">
          <Button onClick={onCompose} size="sm">
            <Compose className="h-4 w-4 mr-2" />
            Escrever
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Configurações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Contas de e-mail</DropdownMenuItem>
              <DropdownMenuItem>Assinatura</DropdownMenuItem>
              <DropdownMenuItem>Filtros e regras</DropdownMenuItem>
              <DropdownMenuItem>Configurações gerais</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Importar/Exportar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
