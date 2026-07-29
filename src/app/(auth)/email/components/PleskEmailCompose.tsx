"use client";

import {
  Bold,
  Italic,
  MoreHorizontal,
  Paperclip,
  Save,
  Send,
  Underline,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { MailName } from "@/lib/server/apis/plesk-xml/types";

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

interface PleskEmailComposeProps {
  onSend: (emailData: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    text?: string;
    html?: string;
  }) => void;
  onCancel: () => void;
  replyTo?: EmailMessage | null;
  fromAccount?: MailName | null;
}

export function PleskEmailCompose({
  onSend,
  onCancel,
  replyTo,
  fromAccount,
}: PleskEmailComposeProps) {
  const [to, setTo] = useState(replyTo ? replyTo.from : "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject.replace(/^Re: /, "")}` : ""
  );
  const [body, setBody] = useState(
    replyTo
      ? `\n\n--- Mensagem original ---\nDe: ${replyTo.from}\nPara: ${replyTo.to}\nAssunto: ${replyTo.subject}\nData: ${replyTo.date.toLocaleString("pt-BR")}\n\n${replyTo.body || replyTo.preview}`
      : ""
  );
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDraft, setIsDraft] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) {
      alert("Por favor, preencha os campos obrigatórios (Para e Assunto)");
      return;
    }

    onSend({
      bcc: bcc.trim() || undefined,
      cc: cc.trim() || undefined,
      html: `<p>${body.trim().replace(/\n/g, "</p><p>")}</p>`,
      subject: subject.trim(),
      text: body.trim(),
      to: to.trim(),
    });
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    // In a real implementation, this would save to drafts folder
    console.log("Email saved as draft");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {replyTo ? "Responder" : "Nova mensagem"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={handleSaveDraft} size="sm" variant="ghost">
              <Save className="mr-2 h-4 w-4" />
              Rascunho
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button onClick={onCancel} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4">
        {/* From Account */}
        {fromAccount && (
          <div className="space-y-2">
            <Label htmlFor="from">De</Label>
            <div className="flex items-center space-x-2">
              <Badge className="px-3 py-1" variant="secondary">
                {fromAccount.name}@{fromAccount.site_name}
              </Badge>
            </div>
          </div>
        )}

        {/* To Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="to">Para *</Label>
            <div className="flex items-center space-x-2 text-sm">
              {!showCc && (
                <Button
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowCc(true)}
                  size="sm"
                  variant="link"
                >
                  Cc
                </Button>
              )}
              {!showBcc && (
                <Button
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowBcc(true)}
                  size="sm"
                  variant="link"
                >
                  Cco
                </Button>
              )}
            </div>
          </div>
          <Input
            className="w-full"
            id="to"
            onChange={e => setTo(e.target.value)}
            placeholder="destinatario@exemplo.com"
            value={to}
          />
        </div>

        {/* CC Field */}
        {showCc && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cc">Cc</Label>
              <Button
                className="h-auto p-0"
                onClick={() => setShowCc(false)}
                size="sm"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              id="cc"
              onChange={e => setCc(e.target.value)}
              placeholder="copia@exemplo.com"
              value={cc}
            />
          </div>
        )}

        {/* BCC Field */}
        {showBcc && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bcc">Cco</Label>
              <Button
                className="h-auto p-0"
                onClick={() => setShowBcc(false)}
                size="sm"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              id="bcc"
              onChange={e => setBcc(e.target.value)}
              placeholder="copia-oculta@exemplo.com"
              value={bcc}
            />
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Assunto *</Label>
          <Input
            id="subject"
            onChange={e => setSubject(e.target.value)}
            placeholder="Assunto da mensagem"
            value={subject}
          />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label>Anexos ({attachments.length})</Label>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  className="flex items-center justify-between rounded border p-2"
                  key={`${file.name}-${file.size}-${index}`}
                >
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{file.name}</span>
                    <Badge className="text-xs" variant="outline">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => removeAttachment(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Toolbar */}
        <div className="flex items-center space-x-2 py-2">
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost">
              <Bold className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Italic className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Underline className="h-4 w-4" />
            </Button>
          </div>
          <Separator className="h-6" orientation="vertical" />
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <input
              className="hidden"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              type="file"
            />
            <Button
              onClick={() => document.getElementById("file-upload")?.click()}
              size="sm"
              variant="ghost"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Message Body */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="body">Mensagem</Label>
          <Textarea
            className="min-h-[200px] flex-1 resize-none"
            id="body"
            onChange={e => setBody(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            value={body}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-2">
            {isDraft && <Badge variant="secondary">Salvo como rascunho</Badge>}
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onCancel} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
