import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import EmailVerificationCodeForm from "@/components/auth/EmailVerificationCodeForm";

export const metadata: Metadata = {
  description: "Verificar seu endereço de email para ativar sua conta",
  title: "Verificar email - Atlas Hosting",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
    redirect?: string;
  }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const resolvedParams = await searchParams;
  const { token, email, redirect } = resolvedParams;

  return (
    <AuthPage
      subtitle={
        email
          ? `Digite o código de 5 dígitos enviado para ${email}`
          : "Digite seu email e o código de verificação que você recebeu"
      }
      switchHref="/login"
      switchText="Fazer login"
      switchTitle="Já verificou seu email?"
      title="Verificar email"
    >
      <EmailVerificationCodeForm email={email} redirect={redirect} />
    </AuthPage>
  );
}
