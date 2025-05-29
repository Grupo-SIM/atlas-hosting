import AuthPage from "@/components/auth/AuthPage";
import SignupForm from "@/components/auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar Conta - Atlas Hosting",
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export default function SignupPage() {
  return (
    <AuthPage
      title="Bem-vindo ao Atlas Hosting"
      subtitle="Preencha os campos para criar sua conta na plataforma"
      switchHref="/login"
      switchTitle="Já possui uma conta?"
      switchText="Faça login"
    >
      <SignupForm />
    </AuthPage>
  );
}
