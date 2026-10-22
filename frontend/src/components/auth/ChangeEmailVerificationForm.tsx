"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ChangeEmailVerificationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<{
    type: "loading" | "success" | "error";
    message: string;
  }>({ message: "Verificando token...", type: "loading" });

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setVerificationState({
        message: "Token ou email inválido. Verifique o link enviado por email.",
        type: "error",
      });
      return;
    }

    // Validate the token on component mount
    validateToken();
  }, [token, email]);

  const validateToken = async () => {
    if (!token || !email) return;

    try {
      const response = await fetch(
        `/api/auth/verify-change-email?token=${token}&email=${encodeURIComponent(email)}`
      );
      const result = await response.json();

      if (response.ok && result.valid) {
        setVerificationState({
          message:
            "Token válido! Clique no botão abaixo para confirmar a alteração do email.",
          type: "success",
        });
      } else {
        setVerificationState({
          message: result.error || "Token inválido ou expirado.",
          type: "error",
        });
      }
    } catch (error) {
      setVerificationState({
        message: "Erro ao validar token. Tente novamente.",
        type: "error",
      });
    }
  };

  const handleVerifyEmail = async () => {
    if (!token || !email) return;

    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/verify-change-email", {
        body: JSON.stringify({ email, token }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationState({
          message:
            "Email alterado com sucesso! Você pode agora fazer login com o novo email.",
          type: "success",
        });

        // Show success toast
        toast({
          description: `Seu email foi alterado para ${email}. Você pode agora fazer login com o novo endereço.`,
          duration: 5000,
          title: "Email alterado com sucesso",
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?message=email-changed");
        }, 3000);
      } else {
        setVerificationState({
          message: result.error || "Erro ao alterar email.",
          type: "error",
        });

        // Show error toast
        toast({
          description: result.error || "Erro ao alterar email.",
          duration: 5000,
          title: "Erro ao alterar email",
          variant: "destructive",
        });
      }
    } catch (error) {
      setVerificationState({
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
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Confirmar Alteração de Email
          </CardTitle>
          <CardDescription>
            {email
              ? `Confirmando alteração para: ${email}`
              : "Verificando dados..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationState.type === "loading" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {verificationState.type === "error" && (
            <Alert className="border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verificationState.message}</AlertDescription>
            </Alert>
          )}

          {verificationState.type === "success" && !isVerifying && (
            <>
              <Alert className="border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{verificationState.message}</AlertDescription>
              </Alert>

              {verificationState.message.includes("Token válido") && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Confirme a alteração:</strong> Seu email será
                      alterado para{" "}
                      <span className="font-semibold">{email}</span>. Esta ação
                      não pode ser desfeita.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    disabled={isVerifying}
                    onClick={handleVerifyEmail}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando email...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar alteração
                      </>
                    )}
                  </Button>
                </div>
              )}

              {verificationState.message.includes("sucesso") && (
                <div className="space-y-4 text-center">
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-green-800 text-sm">
                      Redirecionando para a página de login...
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => router.push("/login")}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Ir para login
                  </Button>
                </div>
              )}
            </>
          )}

          {verificationState.type === "error" && (
            <div className="space-y-4 text-center">
              <Button
                className="w-full"
                onClick={() => router.push("/login")}
                variant="outline"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
