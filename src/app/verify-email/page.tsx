import AuthPage from "@/components/auth/AuthPage";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificar email - Atlas Hosting",
  description:
    "Verificar seu endereço de email para ativar sua conta",
};

interface VerifyEmailPageProps {
  searchParams: {
    token?: string;
  };
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = searchParams;

  return (
    <AuthPage
      title="Verificar email"
      subtitle={token ? "Verificando seu email..." : "Digite seu email para receber um link de verificação"}
      switchHref="/login"
      switchTitle="Já verificou seu email?"
      switchText="Fazer login"
    >
      <EmailVerificationForm token={token} />
    </AuthPage>
  );
}
