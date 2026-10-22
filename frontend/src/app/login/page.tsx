import type { Metadata } from "next";
import { use } from "react";
import AuthPage from "@/components/auth/AuthPage";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
  title: "Login - Atlas Hosting",
};

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default function LoginPage({
  searchParams: _searchParams,
}: LoginPageProps) {
  const searchParams = use(_searchParams);

  const signupSwitchHref = searchParams.redirect
    ? `/signup?redirect=${encodeURIComponent(searchParams.redirect)}`
    : "/signup";

  return (
    <AuthPage
      backHref="/"
      subtitle="Faça login para acessar sua conta"
      switchHref={signupSwitchHref}
      switchText="Criar uma conta"
      switchTitle="Não possui uma conta?"
      title="Bem-vindo"
    >
      <LoginForm redirectTo={searchParams.redirect} />
    </AuthPage>
  );
}
