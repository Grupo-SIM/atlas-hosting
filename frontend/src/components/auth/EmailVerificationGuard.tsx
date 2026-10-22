"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { Button } from "@/components/ui/button";

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  userEmail?: string;
  emailVerified?: boolean;
}

export default function EmailVerificationGuard({
  children,
  userEmail,
  emailVerified,
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
        body: JSON.stringify({ email: userEmail }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              aria-hidden="true"
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>

          <h2 className="mb-2 font-bold text-2xl text-gray-900">
            Verificar email
          </h2>

          <p className="mb-6 text-gray-600 text-sm">
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
              className="w-full"
              disabled={isResending || !userEmail}
              onClick={handleResendVerification}
              variant="outline"
            >
              {isResending ? (
                <CgSpinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Reenviar email de verificação
            </Button>

            <Button
              className="w-full"
              onClick={() => router.push("/verify-email")}
              variant="ghost"
            >
              Já tenho um código de verificação
            </Button>

            <Button
              className="w-full"
              onClick={() => router.push("/login")}
              variant="ghost"
            >
              Voltar ao login
            </Button>
          </div>

          {message && <p className="mt-4 text-green-600 text-sm">{message}</p>}
        </div>
      </div>
    </div>
  );
}
