import AuthPage from "@/components/auth/AuthPage";
import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";
import { use } from "react";

export const metadata: Metadata = {
  title: "Login - Atlas Hosting",
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
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
      title="Bem-vindo"
      subtitle="Faça login para acessar sua conta"
      switchHref={signupSwitchHref}
      switchTitle="Não possui uma conta?"
      switchText="Criar uma conta"
    >
      <LoginForm redirectTo={searchParams.redirect} />
    </AuthPage>
  );
}
