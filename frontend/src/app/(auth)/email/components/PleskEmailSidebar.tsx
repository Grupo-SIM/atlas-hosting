"use client";

import { Mail, PenTool, Plus, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/lib/db/schema";
import type { MailName } from "@/lib/server/apis/plesk-xml/types";
import { cn } from "@/lib/utils";

interface EmailFolder {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
}

interface PleskEmailSidebarProps {
  folders: EmailFolder[];
  selectedFolder: string;
  mailAccounts: MailName[];
  activeAccount: MailName | null;
  user: User;
  onFolderSelect: (folderId: string) => void;
  onCompose: () => void;
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
  onAddAccount,
  user,
}: PleskEmailSidebarProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">E-mail</CardTitle>
          <Button size="sm" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Compose Button */}
        <Button className="w-full" onClick={onCompose}>
          <PenTool className="mr-2 h-4 w-4" />
          Escrever
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Account Selector */}
        {mailAccounts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground text-sm">
                Contas
              </h3>
              <Button onClick={onAddAccount} size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {mailAccounts.map(account => (
                <Button
                  className={cn(
                    "h-auto w-full justify-start p-3 text-left",
                    activeAccount?.id === account.id && "bg-secondary"
                  )}
                  key={account.id}
                  onClick={() => onAccountSelect(account)}
                  variant={
                    activeAccount?.id === account.id ? "secondary" : "ghost"
                  }
                >
                  <div className="flex min-w-0 items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Mail className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">
                        {account.name}@{user.selectedDomain}
                      </p>
                      <p className="text-muted-foreground text-xs">
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
          <h3 className="font-medium text-muted-foreground text-sm">Pastas</h3>
          <div className="space-y-1">
            {folders.map(folder => (
              <Button
                className="w-full justify-between"
                key={folder.id}
                onClick={() => onFolderSelect(folder.id)}
                variant={selectedFolder === folder.id ? "secondary" : "ghost"}
              >
                <div className="flex items-center space-x-3">
                  {folder.icon}
                  <span className="text-sm">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge className="text-xs" variant="secondary">
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
              <h3 className="font-medium text-muted-foreground text-sm">
                Armazenamento
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usado</span>
                  <span className="text-muted-foreground">
                    {activeAccount.mailbox.quota &&
                    activeAccount.mailbox.quota > 0
                      ? `${Math.round(activeAccount.mailbox.quota / (1024 * 1024))} MB`
                      : "Ilimitado"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width:
                        activeAccount.mailbox.quota &&
                        activeAccount.mailbox.quota > 0
                          ? "25%"
                          : "0%",
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Espaço disponível:{" "}
                  {activeAccount.mailbox.quota &&
                  activeAccount.mailbox.quota > 0
                    ? `${Math.round((activeAccount.mailbox.quota * 0.75) / (1024 * 1024))} MB`
                    : "Ilimitado"}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Separator />
        <div className="space-y-1">
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <UserIcon className="mr-2 h-4 w-4" />
            Configurações da Conta
          </Button>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <Settings className="mr-2 h-4 w-4" />
            Preferências
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
