"use client";

import { Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedInput } from "@/hooks/use-debounced-input";
import { toast } from "@/hooks/use-toast";
import { sendUserEmailAction } from "../email-actions";

export function SendUserEmailButton({
  id,
  name,
  email,
}: {
  id: string;
  name: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const defaultSubject =
    "Atualize seu cartão para renovação da assinatura Atlas";
  const [subject, setSubject] = useState(defaultSubject);
  const defaultMessage = `Olá, ${name}!\n\nPrecisamos que você cadastre novamente seu cartão no painel Atlas e o selecione para as assinaturas que deseja renovar automaticamente.\n\nAcesse Configurações → Pagamentos pelo botão abaixo, adicione seu cartão e clique em Usar este cartão na assinatura desejada. Apenas salvar o cartão não ativa a cobrança automática.\n\nEssa seleção autoriza as próximas cobranças de renovação, inclusive uma renovação pendente, conforme os prazos da assinatura. Cadastrar o cartão não confirma o pagamento de faturas anteriores nem reativa um serviço cancelado. Se houver renovação vencida ou serviço interrompido, fale com nosso suporte para regularizar.\n\nPor segurança, nunca envie número do cartão, código de segurança ou senha por email. Informe esses dados somente no painel Atlas.\n\nEquipe Atlas`;
  const [message, setMessage] = useState(defaultMessage);
  const [localSubject, changeSubject] = useDebouncedInput(subject, setSubject);
  const [localMessage, changeMessage] = useDebouncedInput(message, setMessage);
  const discard = () => {
    changeSubject(defaultSubject);
    setSubject(defaultSubject);
    changeMessage(defaultMessage);
    setMessage(defaultMessage);
    setOpen(false);
  };
  return (
    <Dialog
      onOpenChange={value => {
        if (pending) return;
        if (value) setOpen(true);
        else discard();
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer" size="sm" variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Enviar email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Enviar email ao cliente</DialogTitle>
          <DialogDescription>
            Destinatário: {email}. Revise o texto antes de enviar. Link para
            Configurações → Pagamentos incluído automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={event => {
            event.preventDefault();
            startTransition(async () => {
              const result = await sendUserEmailAction(
                id,
                localSubject,
                localMessage
              ).catch(
                () =>
                  ({
                    error:
                      "Falha de comunicação. Confira o envio antes de tentar novamente.",
                    ok: false,
                  }) as const
              );
              toast({
                description: result.ok
                  ? `Mensagem enviada para ${email}.`
                  : result.error,
                title: result.ok ? "Email enviado" : "Falha no envio",
                variant: result.ok ? "default" : "destructive",
              });
              if (result.ok) setOpen(false);
            });
          }}
        >
          <div>
            <Label htmlFor={`subject-${id}`}>
              Assunto <span className="text-destructive">*</span>
            </Label>
            <Input
              disabled={pending}
              id={`subject-${id}`}
              maxLength={160}
              name="subject"
              onChange={event => changeSubject(event.currentTarget.value)}
              placeholder="Ex: Atualize seu cartão na Atlas"
              required
              value={localSubject}
            />
          </div>
          <div>
            <Label htmlFor={`message-${id}`}>
              Mensagem <span className="text-destructive">*</span>
            </Label>
            <Textarea
              className="scrollbar-themed h-64 resize-none placeholder:text-muted-foreground"
              disabled={pending}
              id={`message-${id}`}
              maxLength={10000}
              name="message"
              onChange={event => changeMessage(event.currentTarget.value)}
              placeholder="Olá! Acesse seu painel Atlas para atualizar seu cartão."
              required
              value={localMessage}
            />
          </div>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              disabled={pending}
              onClick={discard}
              type="button"
              variant="outline"
            >
              Descartar
            </Button>
            <Button
              className="cursor-pointer"
              disabled={pending || !localSubject.trim() || !localMessage.trim()}
              type="submit"
            >
              <Mail className="mr-2 h-4 w-4" />
              {pending ? "Enviando..." : "Enviar email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
