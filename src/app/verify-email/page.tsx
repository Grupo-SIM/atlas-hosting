import AuthPage from "@/components/auth/AuthPage";
import EmailVerificationCodeForm from "@/components/auth/EmailVerificationCodeForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificar email - Atlas Hosting",
  description:
    "Verificar seu endereço de email para ativar sua conta",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const resolvedParams = await searchParams;
  const { token, email } = resolvedParams;

  // If token is provided, redirect to old flow (for backward compatibility)
  // Otherwise, show code verification form
  return (
    <AuthPage
      title="Verificar email"
      subtitle={email ? `Digite o código de 5 dígitos enviado para ${email}` : "Digite seu email e o código de verificação que você recebeu"}
      switchHref="/login"
      switchTitle="Já verificou seu email?"
      switchText="Fazer login"
    >
      <EmailVerificationCodeForm email={email} />
    </AuthPage>
  );
}
