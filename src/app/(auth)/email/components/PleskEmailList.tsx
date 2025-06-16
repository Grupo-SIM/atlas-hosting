"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Star, 
  Paperclip, 
  MoreHorizontal,
  RefreshCw,
  Filter,
  Archive,
  Trash2,
  MailOpen,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function PleskEmailList({ emails, selectedEmail, onEmailSelect, folder, isLoading = false }: PleskEmailListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  const filteredEmails = emails.filter(email => 
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
      inbox: "Caixa de Entrada",
      sent: "Enviados",
      drafts: "Rascunhos",
      archive: "Arquivo",
      spam: "Spam",
      trash: "Lixeira"
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getFolderTitle(folder)}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar e-mails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Actions */}
        {selectedEmails.size > 0 && (
          <div className="flex items-center space-x-2 p-2 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedEmails.size} selecionado(s)
            </span>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MailOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Carregando e-mails...
              </p>
              <p className="text-sm text-muted-foreground">
                Conectando ao servidor de e-mail
              </p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchQuery ? "Nenhum e-mail encontrado" : "Pasta vazia"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? "Tente ajustar os termos de busca"
                  : "Não há e-mails nesta pasta"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    "flex items-start space-x-3 p-4 border-b cursor-pointer hover:bg-secondary/50 transition-colors",
                    selectedEmail?.id === email.id && "bg-secondary",
                    !email.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleEmailClick(email)}
                >
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedEmails.has(email.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleEmailSelection(email.id, e.target.checked);
                    }}
                    className="mt-1 rounded border-gray-300"
                  />

                  {/* Star */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      email.isStarred = !email.isStarred;
                    }}
                  >
                    <Star 
                      className={cn(
                        "h-4 w-4", 
                        email.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      )} 
                    />
                  </Button>

                  {/* Email Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-sm truncate",
                        !email.isRead ? "font-semibold" : "font-medium"
                      )}>
                        {getFromDisplay(email)}
                      </p>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {email.hasAttachment && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(email.date, { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Subject */}
                    <p className={cn(
                      "text-sm truncate",
                      !email.isRead ? "font-semibold" : "font-normal"
                    )}>
                      {email.subject}
                    </p>

                    {/* Preview */}
                    <p className="text-xs text-muted-foreground truncate">
                      {email.preview}
                    </p>

                    {/* Badges */}
                    <div className="flex items-center space-x-2">
                      {!email.isRead && (
                        <Badge variant="default" className="text-xs">
                          Novo
                        </Badge>
                      )}
                      {email.folder === "spam" && (
                        <Badge variant="destructive" className="text-xs">
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
