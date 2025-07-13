import AuthPage from "@/components/auth/AuthPage";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Esqueci minha senha - Atlas Hosting",
  description:
    "Redefinir senha da sua conta Atlas Hosting",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      title="Esqueci minha senha"
      subtitle="Digite seu email para receber um link de redefinição de senha"
      switchHref="/login"
      switchTitle="Lembrou da senha?"
      switchText="Fazer login"
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
