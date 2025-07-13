"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CgSpinner } from "react-icons/cg";

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  userEmail?: string;
  emailVerified?: boolean;
}

export default function EmailVerificationGuard({ 
  children, 
  userEmail,
  emailVerified 
}: EmailVerificationGuardProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // If email is verified, render children
  if (emailVerified) {
    return <>{children}</>;
  }

  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    setIsResending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage("Erro ao enviar email de verificação");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificar email
          </h2>
          
          <p className="text-sm text-gray-600 mb-6">
            Você precisa verificar seu endereço de email antes de continuar.
            {userEmail && (
              <>
                <br />
                Um email foi enviado para <strong>{userEmail}</strong>
              </>
            )}
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleResendVerification}
              disabled={isResending || !userEmail}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <CgSpinner className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Reenviar email de verificação
            </Button>

            <Button
              onClick={() => router.push("/verify-email")}
              className="w-full"
              variant="ghost"
            >
              Já tenho um código de verificação
            </Button>

            <Button
              onClick={() => router.push("/login")}
              className="w-full"
              variant="ghost"
            >
              Voltar ao login
            </Button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-green-600">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
