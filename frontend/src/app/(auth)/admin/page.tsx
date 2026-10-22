import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminQuickActions } from "@/components/dashboard/AdminQuickActions";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Administração — Atlas Hosting" };

/**
 * Passo intermediário entre a sidebar e as telas de admin: mesmo layout do
 * dashboard do cliente, com os antigos itens de admin da sidebar virando cards.
 */
export default async function AdminDashboardPage() {
  const user = await getUser();
  if (!user?.isAdmin) redirect("/home");

  return (
    <div className="space-y-8 p-6 pb-16">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            Área administrativa
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ferramentas internas da plataforma. Clique em qualquer item da
            sidebar para voltar ao painel do cliente.
          </p>
        </div>
      </div>

      <AdminQuickActions />
    </div>
  );
}
