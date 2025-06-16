"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  Download,
  Paperclip,
  User,
  Calendar,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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

interface PleskEmailViewProps {
  email: EmailMessage;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
}

export function PleskEmailView({ email, onReply, onForward, onDelete }: PleskEmailViewProps) {
  const [isStarred, setIsStarred] = useState(email.isStarred);

  const toggleStar = () => {
    setIsStarred(!isStarred);
    email.isStarred = !isStarred;
  };

  const getInitials = (name: string) => {
    return name
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const mockAttachments = email.hasAttachment ? [
    {
      id: "1",
      name: "proposta-website.pdf",
      size: "2.4 MB",
      type: "application/pdf"
    },
    {
      id: "2", 
      name: "briefing-projeto.docx",
      size: "156 KB",
      type: "application/docx"
    }
  ] : [];

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate mb-2">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant={email.folder === "spam" ? "destructive" : "secondary"}>
                {email.folder === "inbox" && "Caixa de Entrada"}
                {email.folder === "sent" && "Enviados"}
                {email.folder === "drafts" && "Rascunhos"}
                {email.folder === "archive" && "Arquivo"}
                {email.folder === "spam" && "Spam"}
                {email.folder === "trash" && "Lixeira"}
              </Badge>
              {email.hasAttachment && (
                <Badge variant="outline">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {mockAttachments.length} anexo(s)
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={toggleStar}>
              <Star className={cn(
                "h-4 w-4",
                isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )} />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Reply Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onReply}>
            <Reply className="h-4 w-4 mr-2" />
            Responder
          </Button>
          <Button variant="outline" size="sm">
            <ReplyAll className="h-4 w-4 mr-2" />
            Responder a todos
          </Button>
          <Button variant="outline" size="sm" onClick={onForward}>
            <Forward className="h-4 w-4 mr-2" />
            Encaminhar
          </Button>
        </div>

        <Separator />
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {/* Email Header Info */}
        <div className="space-y-4">
          {/* From */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {getInitials(email.from)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">{email.from}</p>
                <Badge variant="outline" className="text-xs">
                  Remetente
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Para: {email.to}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {format(email.date, "dd/MM/yyyy", { locale: ptBR })}
              </p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {format(email.date, "HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {email.hasAttachment && mockAttachments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Anexos ({mockAttachments.length})</span>
              </div>
              <div className="grid gap-2">
                {mockAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <Paperclip className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{attachment.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
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
        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button onClick={onReply}>
              <Reply className="h-4 w-4 mr-2" />
              Responder
            </Button>
            <Button variant="outline" onClick={onForward}>
              <Forward className="h-4 w-4 mr-2" />
              Encaminhar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
