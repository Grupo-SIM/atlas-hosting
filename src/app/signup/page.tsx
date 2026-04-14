import AuthPage from "@/components/auth/AuthPage";
import SignupForm from "@/components/auth/SignupForm";
import { db } from "@/lib/db";
import { pgUser, type User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar Conta - Atlas Hosting",
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export default async function SignupPage({
  searchParams,
}: { searchParams: Promise<{ ref?: string; redirect?: string }> }) {
  const resolvedParams = await searchParams;

  let refUser: Pick<User, "name" | "email" | "id"> | undefined;
  if (resolvedParams.ref) {
    refUser = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, resolvedParams.ref),
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  const loginSwitchHref = resolvedParams.redirect
    ? `/login?redirect=${encodeURIComponent(resolvedParams.redirect)}`
    : "/login";

  return (
    <AuthPage
      title="Bem-vindo ao Atlas Hosting"
      subtitle="Preencha os campos para criar sua conta na plataforma"
      switchHref={loginSwitchHref}
      switchTitle="Já possui uma conta?"
      switchText="Faça login"
    >
      <SignupForm referrer={refUser} redirect={resolvedParams.redirect} />
    </AuthPage>
  );
}
