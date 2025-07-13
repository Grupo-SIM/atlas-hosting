"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Mail, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChangeEmailVerificationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<{
    type: "loading" | "success" | "error";
    message: string;
  }>({ type: "loading", message: "Verificando token..." });

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setVerificationState({
        type: "error",
        message: "Token ou email inválido. Verifique o link enviado por email.",
      });
      return;
    }

    // Validate the token on component mount
    validateToken();
  }, [token, email]);

  const validateToken = async () => {
    if (!token || !email) return;
    
    try {
      const response = await fetch(`/api/auth/verify-change-email?token=${token}&email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (response.ok && result.valid) {
        setVerificationState({
          type: "success",
          message: "Token válido! Clique no botão abaixo para confirmar a alteração do email.",
        });
      } else {
        setVerificationState({
          type: "error",
          message: result.error || "Token inválido ou expirado.",
        });
      }
    } catch (error) {
      setVerificationState({
        type: "error",
        message: "Erro ao validar token. Tente novamente.",
      });
    }
  };

  const handleVerifyEmail = async () => {
    if (!token || !email) return;

    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/verify-change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationState({
          type: "success",
          message: "Email alterado com sucesso! Você pode agora fazer login com o novo email.",
        });
        
        // Show success toast
        toast({
          title: "Email alterado com sucesso",
          description: `Seu email foi alterado para ${email}. Você pode agora fazer login com o novo endereço.`,
          duration: 5000,
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?message=email-changed");
        }, 3000);
      } else {
        setVerificationState({
          type: "error",
          message: result.error || "Erro ao alterar email.",
        });
        
        // Show error toast
        toast({
          title: "Erro ao alterar email",
          description: result.error || "Erro ao alterar email.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      setVerificationState({
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
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Confirmar Alteração de Email
          </CardTitle>
          <CardDescription>
            {email ? `Confirmando alteração para: ${email}` : "Verificando dados..."}
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
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Confirme a alteração:</strong> Seu email será alterado para{" "}
                      <span className="font-semibold">{email}</span>. 
                      Esta ação não pode ser desfeita.
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleVerifyEmail}
                    className="w-full"
                    disabled={isVerifying}
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
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Redirecionando para a página de login...
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Ir para login
                  </Button>
                </div>
              )}
            </>
          )}

          {verificationState.type === "error" && (
            <div className="text-center space-y-4">
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="w-full"
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
