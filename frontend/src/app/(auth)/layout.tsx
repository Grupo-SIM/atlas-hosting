import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { AdminThemeSync } from "@/components/layouts/components/AdminThemeSync";
import { PageBackButton } from "@/components/layouts/components/PageBackButton";
import Sidebar from "@/components/layouts/components/Sidebar";
import Topbar from "@/components/layouts/components/Topbar";
import { getUser } from "@/lib/auth";
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
        canAccessSiteBuilder={canAccessSiteBuilder(user)}
        isAdmin={user.isAdmin || false}
      />
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <ImpersonationBanner />
        <Topbar
          canAccessSiteBuilder={canAccessSiteBuilder(user)}
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
