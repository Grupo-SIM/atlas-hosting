import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import SignupForm from "@/components/auth/SignupForm";
import { db } from "@/lib/db";
import { pgUser, type User } from "@/lib/db/schema";

export const metadata: Metadata = {
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
  title: "Criar Conta - Atlas Hosting",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; redirect?: string }>;
}) {
  const resolvedParams = await searchParams;

  let refUser: Pick<User, "name" | "email" | "id"> | undefined;
  if (resolvedParams.ref) {
    refUser = await db.query.pgUser.findFirst({
      columns: {
        email: true,
        id: true,
        name: true,
      },
      where: eq(pgUser.affiliateCode, resolvedParams.ref),
    });
  }

  const loginSwitchHref = resolvedParams.redirect
    ? `/login?redirect=${encodeURIComponent(resolvedParams.redirect)}`
    : "/login";

  return (
    <AuthPage
      subtitle="Preencha os campos para criar sua conta na plataforma"
      switchHref={loginSwitchHref}
      switchText="Faça login"
      switchTitle="Já possui uma conta?"
      title="Bem-vindo ao Atlas Hosting"
    >
      <SignupForm redirect={resolvedParams.redirect} referrer={refUser} />
    </AuthPage>
  );
}
