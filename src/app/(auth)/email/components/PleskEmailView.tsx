"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Archive,
  Clock,
  Download,
  Forward,
  MoreHorizontal,
  Paperclip,
  Reply,
  ReplyAll,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

interface PleskEmailViewProps {
  email: EmailMessage;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
}

export function PleskEmailView({
  email,
  onReply,
  onForward,
  onDelete,
}: PleskEmailViewProps) {
  const [isStarred, setIsStarred] = useState(email.isStarred);

  const toggleStar = () => {
    setIsStarred(!isStarred);
    email.isStarred = !isStarred;
  };

  const getInitials = (name: string) => {
    return name
      .split("@")[0]
      .split(".")
      .map(part => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const mockAttachments = email.hasAttachment
    ? [
        {
          id: "1",
          name: "proposta-website.pdf",
          size: "2.4 MB",
          type: "application/pdf",
        },
        {
          id: "2",
          name: "briefing-projeto.docx",
          size: "156 KB",
          type: "application/docx",
        },
      ]
    : [];

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 truncate font-semibold text-xl">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <Badge
                variant={email.folder === "spam" ? "destructive" : "secondary"}
              >
                {email.folder === "inbox" && "Caixa de Entrada"}
                {email.folder === "sent" && "Enviados"}
                {email.folder === "drafts" && "Rascunhos"}
                {email.folder === "archive" && "Arquivo"}
                {email.folder === "spam" && "Spam"}
                {email.folder === "trash" && "Lixeira"}
              </Badge>
              {email.hasAttachment && (
                <Badge variant="outline">
                  <Paperclip className="mr-1 h-3 w-3" />
                  {mockAttachments.length} anexo(s)
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button onClick={toggleStar} size="sm" variant="ghost">
              <Star
                className={cn(
                  "h-4 w-4",
                  isStarred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </Button>
            <Button size="sm" variant="ghost">
              <Archive className="h-4 w-4" />
            </Button>
            <Button onClick={onDelete} size="sm" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Reply Actions */}
        <div className="flex items-center space-x-2">
          <Button onClick={onReply} size="sm" variant="outline">
            <Reply className="mr-2 h-4 w-4" />
            Responder
          </Button>
          <Button size="sm" variant="outline">
            <ReplyAll className="mr-2 h-4 w-4" />
            Responder a todos
          </Button>
          <Button onClick={onForward} size="sm" variant="outline">
            <Forward className="mr-2 h-4 w-4" />
            Encaminhar
          </Button>
        </div>

        <Separator />
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        {/* Email Header Info */}
        <div className="space-y-4">
          {/* From */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(email.from)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">{email.from}</p>
                <Badge className="text-xs" variant="outline">
                  Remetente
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">Para: {email.to}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm">
                {format(email.date, "dd/MM/yyyy", { locale: ptBR })}
              </p>
              <p className="flex items-center text-muted-foreground text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {format(email.date, "HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {email.hasAttachment && mockAttachments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  Anexos ({mockAttachments.length})
                </span>
              </div>
              <div className="grid gap-2">
                {mockAttachments.map(attachment => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-secondary/50"
                    key={attachment.id}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                        <Paperclip className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{attachment.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {attachment.size}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Email Body */}
        <div className="space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {email.body ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {email.body}
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {email.preview}

                {"\n\n"}

                {/* Extended mock content */}
                {email.id === "1" && (
                  <>
                    {"Detalhes do projeto:\n"}
                    {"• Website corporativo responsivo\n"}
                    {"• Integração com redes sociais\n"}
                    {"• Sistema de blog\n"}
                    {"• Formulário de contato\n"}
                    {"• Otimização para SEO\n\n"}
                    {"Prazo desejado: 30 dias\n"}
                    {"Orçamento: R$ 5.000 - R$ 8.000\n\n"}
                    {"Aguardo seu retorno para agendarmos uma reunião.\n\n"}
                    {"Att,\n"}
                    {"João Silva\n"}
                    {"(11) 99999-9999\n"}
                    {"joao@cliente.com"}
                  </>
                )}

                {email.id === "2" && (
                  <>
                    {"Principais destaques desta semana:\n\n"}
                    {"🚀 React 19 RC lançado com novas funcionalidades\n"}
                    {"📱 Flutter 3.16 com melhorias de performance\n"}
                    {"🎨 Figma anuncia novas ferramentas de IA\n"}
                    {"☁️ AWS lança novos serviços de machine learning\n\n"}
                    {"Artigos recomendados:\n"}
                    {"- Como otimizar aplicações Next.js\n"}
                    {"- Tendências em UI/UX para 2024\n"}
                    {"- Segurança em aplicações web modernas\n\n"}
                    {"Acompanhe nossas redes sociais para mais conteúdo!"}
                  </>
                )}

                {email.id === "3" && (
                  <>
                    {"Relatório de Backup Automático\n"}
                    {"=====================================\n\n"}
                    {"Data/Hora: 14/01/2024 às 02:00:15\n"}
                    {"Duração: 45 minutos\n"}
                    {"Status: ✅ Concluído com sucesso\n\n"}
                    {"Itens incluídos no backup:\n"}
                    {"• Banco de dados MySQL (125 MB)\n"}
                    {"• Arquivos do site (2.8 GB)\n"}
                    {"• Configurações do servidor\n"}
                    {"• Certificados SSL\n\n"}
                    {"Local de armazenamento: Backup remoto seguro\n"}
                    {"Próximo backup: 15/01/2024 às 02:00\n\n"}
                    {"Este é um e-mail automático. Não é necessário responder."}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Reply Actions */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2">
            <Button onClick={onReply}>
              <Reply className="mr-2 h-4 w-4" />
              Responder
            </Button>
            <Button onClick={onForward} variant="outline">
              <Forward className="mr-2 h-4 w-4" />
              Encaminhar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
