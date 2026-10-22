import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conta Suspensa" };

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md space-y-4 px-6 text-center">
        <div className="text-6xl">🚫</div>
        <h1 className="font-bold text-2xl text-foreground">Conta Suspensa</h1>
        <p className="text-muted-foreground">
          Sua conta foi suspensa pelo administrador. Entre em contato com o
          suporte para mais informações.
        </p>
      </div>
    </div>
  );
}
