import AuthPage from "@/components/auth/AuthPage";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir senha - Atlas Hosting",
  description:
    "Criar uma nova senha para sua conta Atlas Hosting",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthPage
        title="Link inválido"
        subtitle="O link de redefinição de senha é inválido ou expirou"
        switchHref="/forgot-password"
        switchTitle="Precisa de um novo link?"
        switchText="Solicitar nova redefinição"
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Solicite um novo link de redefinição de senha para continuar.
          </p>
        </div>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      title="Redefinir senha"
      subtitle="Digite sua nova senha"
      switchHref="/login"
      switchTitle="Lembrou da senha?"
      switchText="Fazer login"
    >
      <ResetPasswordForm token={token} />
    </AuthPage>
  );
}
