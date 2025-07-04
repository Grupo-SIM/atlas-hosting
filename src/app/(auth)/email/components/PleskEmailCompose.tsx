"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Paperclip,
  Type,
  Bold,
  Italic,
  Underline,
  X,
  Upload,
  Save,
  MoreHorizontal,
} from "lucide-react";
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
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) {
      alert("Por favor, preencha os campos obrigatórios (Para e Assunto)");
      return;
    }

    onSend({
      to: to.trim(),
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
      subject: subject.trim(),
      text: body.trim(),
      html: `<p>${body.trim().replace(/\n/g, "</p><p>")}</p>`,
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {replyTo ? "Responder" : "Nova mensagem"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Rascunho
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* From Account */}
        {fromAccount && (
          <div className="space-y-2">
            <Label htmlFor="from">De</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="px-3 py-1">
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
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </Button>
              )}
              {!showBcc && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs"
                  onClick={() => setShowBcc(true)}
                >
                  Cco
                </Button>
              )}
            </div>
          </div>
          <Input
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="destinatario@exemplo.com"
            className="w-full"
          />
        </div>

        {/* CC Field */}
        {showCc && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cc">Cc</Label>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={() => setShowCc(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              id="cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="copia@exemplo.com"
            />
          </div>
        )}

        {/* BCC Field */}
        {showBcc && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bcc">Cco</Label>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={() => setShowBcc(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              id="bcc"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="copia-oculta@exemplo.com"
            />
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Assunto *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Assunto da mensagem"
          />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label>Anexos ({attachments.length})</Label>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
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
            <Button variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Underline className="h-4 w-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Message Body */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="body">Mensagem</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 min-h-[200px] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {isDraft && <Badge variant="secondary">Salvo como rascunho</Badge>}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
