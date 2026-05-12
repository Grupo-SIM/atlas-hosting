import { Metadata } from "next";

export const metadata: Metadata = { title: "Conta Suspensa" };

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-foreground">Conta Suspensa</h1>
        <p className="text-muted-foreground">
          Sua conta foi suspensa pelo administrador. Entre em contato com o
          suporte para mais informações.
        </p>
      </div>
    </div>
  );
}
