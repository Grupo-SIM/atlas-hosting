import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  description: "Criar uma nova senha para sua conta Atlas Hosting",
  title: "Redefinir senha - Atlas Hosting",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthPage
        subtitle="O link de redefinição de senha é inválido ou expirou"
        switchHref="/forgot-password"
        switchText="Solicitar nova redefinição"
        switchTitle="Precisa de um novo link?"
        title="Link inválido"
      >
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Solicite um novo link de redefinição de senha para continuar.
          </p>
        </div>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      subtitle="Digite sua nova senha"
      switchHref="/login"
      switchText="Fazer login"
      switchTitle="Lembrou da senha?"
      title="Redefinir senha"
    >
      <ResetPasswordForm token={token} />
    </AuthPage>
  );
}
