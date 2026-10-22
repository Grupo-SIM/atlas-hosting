"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Archive,
  Filter,
  Mail,
  MailOpen,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder: string;
  body?: string;
}

interface PleskEmailListProps {
  emails: EmailMessage[];
  selectedEmail: EmailMessage | null;
  onEmailSelect: (email: EmailMessage) => void;
  folder: string;
  isLoading?: boolean;
}

export function PleskEmailList({
  emails,
  selectedEmail,
  onEmailSelect,
  folder,
  isLoading = false,
}: PleskEmailListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  const filteredEmails = emails.filter(
    email =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmailClick = (email: EmailMessage) => {
    onEmailSelect(email);
    // Mark as read when clicked
    if (!email.isRead) {
      email.isRead = true;
    }
  };

  const handleEmailSelection = (emailId: string, selected: boolean) => {
    const newSelection = new Set(selectedEmails);
    if (selected) {
      newSelection.add(emailId);
    } else {
      newSelection.delete(emailId);
    }
    setSelectedEmails(newSelection);
  };

  const getFolderTitle = (folderId: string) => {
    const folderNames: Record<string, string> = {
      archive: "Arquivo",
      drafts: "Rascunhos",
      inbox: "Caixa de Entrada",
      sent: "Enviados",
      spam: "Spam",
      trash: "Lixeira",
    };
    return folderNames[folderId] || "E-mails";
  };

  const getFromDisplay = (email: EmailMessage) => {
    if (folder === "sent" || folder === "drafts") {
      return `Para: ${email.to}`;
    }
    return email.from;
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getFolderTitle(folder)}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Filter className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar e-mails..."
            value={searchQuery}
          />
        </div>

        {/* Quick Actions */}
        {selectedEmails.size > 0 && (
          <div className="flex items-center space-x-2 rounded-lg bg-secondary p-2">
            <span className="text-muted-foreground text-sm">
              {selectedEmails.size} selecionado(s)
            </span>
            <Separator className="h-4" orientation="vertical" />
            <Button size="sm" variant="ghost">
              <Archive className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MailOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <RefreshCw className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mb-2 font-medium text-lg text-muted-foreground">
                Carregando e-mails...
              </p>
              <p className="text-muted-foreground text-sm">
                Conectando ao servidor de e-mail
              </p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-lg text-muted-foreground">
                {searchQuery ? "Nenhum e-mail encontrado" : "Pasta vazia"}
              </p>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Tente ajustar os termos de busca"
                  : "Não há e-mails nesta pasta"}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredEmails.map(email => (
                <div
                  className={cn(
                    "flex cursor-pointer items-start space-x-3 border-b p-4 transition-colors hover:bg-secondary/50",
                    selectedEmail?.id === email.id && "bg-secondary",
                    !email.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                >
                  {/* Selection Checkbox */}
                  <input
                    checked={selectedEmails.has(email.id)}
                    className="mt-1 rounded border-gray-300"
                    onChange={e => {
                      e.stopPropagation();
                      handleEmailSelection(email.id, e.target.checked);
                    }}
                    type="checkbox"
                  />

                  {/* Star */}
                  <Button
                    className="h-auto p-0"
                    onClick={e => {
                      e.stopPropagation();
                      email.isStarred = !email.isStarred;
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        email.isStarred
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </Button>

                  {/* Email Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          "truncate text-sm",
                          !email.isRead ? "font-semibold" : "font-medium"
                        )}
                      >
                        {getFromDisplay(email)}
                      </p>
                      <div className="flex flex-shrink-0 items-center space-x-2">
                        {email.hasAttachment && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(email.date, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Subject */}
                    <p
                      className={cn(
                        "truncate text-sm",
                        !email.isRead ? "font-semibold" : "font-normal"
                      )}
                    >
                      {email.subject}
                    </p>

                    {/* Preview */}
                    <p className="truncate text-muted-foreground text-xs">
                      {email.preview}
                    </p>

                    {/* Badges */}
                    <div className="flex items-center space-x-2">
                      {!email.isRead && (
                        <Badge className="text-xs" variant="default">
                          Novo
                        </Badge>
                      )}
                      {email.folder === "spam" && (
                        <Badge className="text-xs" variant="destructive">
                          Spam
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
