"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const changeEmailSchema = z.object({
  newEmail: z.string().email("Email inválido"),
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

interface ChangeEmailFormProps {
  currentEmail: string;
  onSuccess?: () => void;
}

export function ChangeEmailForm({ currentEmail, onSuccess }: ChangeEmailFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  });

  const onSubmit = async (data: ChangeEmailFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/auth/request-change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: "success",
          message: "Email de verificação enviado! Verifique sua caixa de entrada no novo endereço.",
        });
        setPendingEmail(data.newEmail);
        form.reset();
        
        // Show success toast
        toast({
          title: "Email de verificação enviado",
          description: `Um email foi enviado para ${data.newEmail}. Clique no link para confirmar a alteração.`,
          duration: 5000,
        });
        
        onSuccess?.();
      } else {
        setSubmitMessage({
          type: "error",
          message: result.error || "Erro ao solicitar alteração de email",
        });
        
        // Show error toast
        toast({
          title: "Erro ao alterar email",
          description: result.error || "Erro ao solicitar alteração de email",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message: "Erro de conexão. Tente novamente.",
      });
      
      // Show error toast
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
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
            id="currentEmail"
            type="email"
            value={currentEmail}
            disabled
            className="bg-muted"
          />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">Novo email</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="novo@exemplo.com"
              {...form.register("newEmail")}
              disabled={isSubmitting}
            />
            {form.formState.errors.newEmail && (
              <p className="text-sm text-red-600">
                {form.formState.errors.newEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Digite sua senha atual"
              {...form.register("currentPassword")}
              disabled={isSubmitting}
            />
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-red-600">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
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
          <Alert className={submitMessage.type === "error" ? "border-red-200" : "border-green-200"}>
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
              <strong>Verificação pendente:</strong> Um email de verificação foi enviado para{" "}
              <span className="font-semibold">{pendingEmail}</span>. 
              Clique no link do email para confirmar a alteração.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            • Você receberá um email de verificação no novo endereço
          </p>
          <p>
            • Seu email será alterado apenas após a verificação
          </p>
          <p>
            • Você será notificado no email atual quando a alteração for concluída
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
