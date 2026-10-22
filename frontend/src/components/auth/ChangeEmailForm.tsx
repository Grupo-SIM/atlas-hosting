"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newEmail: z.string().email("Email inválido"),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

interface ChangeEmailFormProps {
  currentEmail: string;
  onSuccess?: () => void;
}

export function ChangeEmailForm({
  currentEmail,
  onSuccess,
}: ChangeEmailFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ChangeEmailFormData>({
    defaultValues: {
      currentPassword: "",
      newEmail: "",
    },
    resolver: zodResolver(changeEmailSchema),
  });

  const onSubmit = async (data: ChangeEmailFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/auth/request-change-email", {
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({
          message:
            "Email de verificação enviado! Verifique sua caixa de entrada no novo endereço.",
          type: "success",
        });
        setPendingEmail(data.newEmail);
        form.reset();

        // Show success toast
        toast({
          description: `Um email foi enviado para ${data.newEmail}. Clique no link para confirmar a alteração.`,
          duration: 5000,
          title: "Email de verificação enviado",
        });

        onSuccess?.();
      } else {
        setSubmitMessage({
          message: result.error || "Erro ao solicitar alteração de email",
          type: "error",
        });

        // Show error toast
        toast({
          description: result.error || "Erro ao solicitar alteração de email",
          duration: 5000,
          title: "Erro ao alterar email",
          variant: "destructive",
        });
      }
    } catch (error) {
      setSubmitMessage({
        message: "Erro de conexão. Tente novamente.",
        type: "error",
      });

      // Show error toast
      toast({
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        duration: 5000,
        title: "Erro de conexão",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Alterar Email
        </CardTitle>
        <CardDescription>
          Altere o endereço de email da sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentEmail">Email atual</Label>
          <Input
            className="bg-muted"
            disabled
            id="currentEmail"
            type="email"
            value={currentEmail}
          />
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="newEmail">Novo email</Label>
            <Input
              id="newEmail"
              placeholder="novo@exemplo.com"
              type="email"
              {...form.register("newEmail")}
              disabled={isSubmitting}
            />
            {form.formState.errors.newEmail && (
              <p className="text-red-600 text-sm">
                {form.formState.errors.newEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              placeholder="Digite sua senha atual"
              type="password"
              {...form.register("currentPassword")}
              disabled={isSubmitting}
            />
            {form.formState.errors.currentPassword && (
              <p className="text-red-600 text-sm">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Lock className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar verificação
              </>
            )}
          </Button>
        </form>

        {submitMessage && (
          <Alert
            className={
              submitMessage.type === "error"
                ? "border-red-200"
                : "border-green-200"
            }
          >
            {submitMessage.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{submitMessage.message}</AlertDescription>
          </Alert>
        )}

        {pendingEmail && (
          <Alert className="border-blue-200">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Verificação pendente:</strong> Um email de verificação foi
              enviado para <span className="font-semibold">{pendingEmail}</span>
              . Clique no link do email para confirmar a alteração.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-muted-foreground text-sm">
          <p>• Você receberá um email de verificação no novo endereço</p>
          <p>• Seu email será alterado apenas após a verificação</p>
          <p>
            • Você será notificado no email atual quando a alteração for
            concluída
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
