"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Star,
  AlertCircle,
  FolderOpen,
  Plus,
  Settings,
  User,
  Calendar,
  Users,
  PenBoxIcon
} from "lucide-react";

interface EmailSidebarProps {
  selectedFolder: string;
  onFolderChange: (folder: string) => void;
  onCompose: () => void;
}

const folders = [
  { id: "inbox", name: "Caixa de Entrada", icon: Inbox, count: 12, color: "default" },
  { id: "starred", name: "Favoritos", icon: Star, count: 3, color: "yellow" },
  { id: "sent", name: "Enviados", icon: Send, count: 0, color: "default" },
  { id: "archive", name: "Arquivo", icon: Archive, count: 0, color: "default" },
  { id: "spam", name: "Spam", icon: AlertCircle, count: 2, color: "orange" },
  { id: "trash", name: "Lixeira", icon: Trash2, count: 1, color: "red" },
];

const customFolders = [
  { id: "work", name: "Trabalho", icon: FolderOpen, count: 5 },
  { id: "personal", name: "Pessoal", icon: FolderOpen, count: 2 },
  { id: "finance", name: "Financeiro", icon: FolderOpen, count: 8 },
];

export function EmailSidebar({ selectedFolder, onFolderChange, onCompose }: EmailSidebarProps) {
  return (
    <div className="w-64 space-y-4">
      {/* Compose Button */}
      <Button onClick={onCompose} className="w-full" size="lg">
        <PenBoxIcon className="h-4 w-4 mr-2" />
        Escrever
      </Button>

      {/* Main Folders */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isSelected = selectedFolder === folder.id;
              
              return (
                <button
                  key={folder.id}
                  onClick={() => onFolderChange(folder.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <Badge 
                      variant={isSelected ? "secondary" : "outline"} 
                      className={cn(
                        "text-xs",
                        folder.color === "yellow" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                        folder.color === "orange" && "bg-orange-100 text-orange-800 border-orange-300",
                        folder.color === "red" && "bg-red-100 text-red-800 border-red-300",
                        isSelected && "bg-primary-foreground text-primary"
                      )}
                    >
                      {folder.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Folders */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Pastas Personalizadas</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {customFolders.map((folder) => {
              const Icon = folder.icon;
              const isSelected = selectedFolder === folder.id;
              
              return (
                <button
                  key={folder.id}
                  onClick={() => onFolderChange(folder.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs">
                      {folder.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Apps */}
      <Card>
        <CardContent className="p-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Aplicativos</h3>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Calendar className="h-4 w-4" />
              <span>Calendário</span>
            </button>
            
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Users className="h-4 w-4" />
              <span>Contatos</span>
            </button>
            
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Armazenamento</span>
              <span className="font-medium">2.1 GB / 5 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }} />
            </div>
            <p className="text-xs text-muted-foreground">
              42% utilizado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
