import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { AdminThemeSync } from "@/components/layouts/components/AdminThemeSync";
import { PageBackButton } from "@/components/layouts/components/PageBackButton";
import Sidebar from "@/components/layouts/components/Sidebar";
import Topbar from "@/components/layouts/components/Topbar";
import { getUser } from "@/lib/auth";
import { hasAnyAdminArea, hasAreaAccess } from "@/lib/permissions/access";
import { canAccessSiteBuilder } from "@/lib/site-builder/access";
import { RenewalPendingBanner } from "./components";

export const metadata: Metadata = {
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
  title: "Atlas Hosting - Serviços de Web Hosting",
};

export const dynamic = "force-dynamic"; // Force dynamic rendering for this layout

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  // Usuário de equipe com alguma área de administração (admin completo já tem o botão por `isAdmin`).
  const hasAdminAreas = !user.isAdmin && (await hasAnyAdminArea(user));
  // Quem o master liberou para editar templates também vê o Criador de Sites no menu.
  const showBuilder =
    canAccessSiteBuilder(user) ||
    (await hasAreaAccess(user, "admin_templates", "view"));

  return (
    <div className="flex max-h-screen min-h-screen overflow-hidden bg-background">
      {/* Aplica a paleta de admin antes da primeira pintura — sem piscar tema claro. */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: script inline anti-flash de tema
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var p=location.pathname;if(p==="/admin"||p.indexOf("/admin/")===0){document.documentElement.classList.add("admin-theme")}}catch(e){}})()`,
        }}
      />
      <AdminThemeSync />
      <Sidebar
        canAccessSiteBuilder={showBuilder}
        hasAdminAreas={hasAdminAreas}
        isAdmin={user.isAdmin || false}
      />
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <ImpersonationBanner />
        <Topbar
          canAccessSiteBuilder={showBuilder}
          hasAdminAreas={hasAdminAreas}
          isAdmin={user.isAdmin || false}
        />

        <main className="flex-1 overflow-y-auto border-border bg-background md:border-l">
          <Suspense
            fallback={
              <div className="h-24 animate-pulse border border-border bg-muted" />
            }
          >
            <RenewalPendingBanner />
          </Suspense>
          <Suspense fallback={null}>
            <PageBackButton />
          </Suspense>
          {children}
        </main>
      </div>
    </div>
  );
}
