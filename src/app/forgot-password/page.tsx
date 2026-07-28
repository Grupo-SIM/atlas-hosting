import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  description: "Redefinir senha da sua conta Atlas Hosting",
  title: "Esqueci minha senha - Atlas Hosting",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      subtitle="Digite seu email para receber um link de redefinição de senha"
      switchHref="/login"
      switchText="Fazer login"
      switchTitle="Lembrou da senha?"
      title="Esqueci minha senha"
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
