"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  PenTool, 
  Plus, 
  ChevronDown, 
  Settings,
  User,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MailName } from "@/lib/server/apis/plesk-xml/types";
import { use } from "react";
import { getUser } from "@/lib/auth";

interface EmailFolder {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
}

interface PleskEmailSidebarProps {
  folders: EmailFolder[];
  selectedFolder: string;
  onFolderSelect: (folderId: string) => void;
  onCompose: () => void;
  mailAccounts: MailName[];
  activeAccount: MailName | null;
  onAccountSelect: (account: MailName) => void;
  onAddAccount: () => void;
}

export function PleskEmailSidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  onCompose,
  mailAccounts,
  activeAccount,
  onAccountSelect,
  onAddAccount
}: PleskEmailSidebarProps) {
  const user = use(getUser());

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">E-mail</CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Compose Button */}
        <Button onClick={onCompose} className="w-full">
          <PenTool className="h-4 w-4 mr-2" />
          Escrever
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Account Selector */}
        {mailAccounts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Contas</h3>
              <Button variant="ghost" size="sm" onClick={onAddAccount}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {mailAccounts.map((account) => (
                <Button
                  key={account.id}
                  variant={activeAccount?.id === account.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left h-auto p-3",
                    activeAccount?.id === account.id && "bg-secondary"
                  )}
                  onClick={() => onAccountSelect(account)}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Mail className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {account.name}@{user.selectedDomain}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account.mailbox?.enabled ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <Separator />
          </div>
        )}

        {/* Folders */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Pastas</h3>
          <div className="space-y-1">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                className="w-full justify-between"
                onClick={() => onFolderSelect(folder.id)}
              >
                <div className="flex items-center space-x-3">
                  {folder.icon}
                  <span className="text-sm">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Storage Info */}
        {activeAccount?.mailbox && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Armazenamento</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usado</span>
                  <span className="text-muted-foreground">
                    {activeAccount.mailbox.quota && activeAccount.mailbox.quota > 0
                      ? `${Math.round(activeAccount.mailbox.quota / (1024 * 1024))} MB`
                      : "Ilimitado"
                    }
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: activeAccount.mailbox.quota && activeAccount.mailbox.quota > 0 
                        ? "25%" 
                        : "0%" 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Espaço disponível: {
                    activeAccount.mailbox.quota && activeAccount.mailbox.quota > 0
                      ? `${Math.round((activeAccount.mailbox.quota * 0.75) / (1024 * 1024))} MB`
                      : "Ilimitado"
                  }
                </p>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Separator />
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <User className="h-4 w-4 mr-2" />
            Configurações da Conta
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferências
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
