import AuthPage from "@/components/auth/AuthPage";
import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Atlas Hosting",
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export default function LoginPage() {
  return (
    <AuthPage
      title="Bem-vindo de volta"
      subtitle="Faça login para acessar sua conta de hospedagem"
      switchHref="/signup"
      switchTitle="Não possui uma conta?"
      switchText="Criar uma conta"
    >
      <LoginForm />
    </AuthPage>
  );
}
