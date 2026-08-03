import { find } from "lodash";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import DomainSelector from "@/components/domains/DomainSelector";
import { AdminThemeSync } from "@/components/layouts/components/AdminThemeSync";
import { PageBackButton } from "@/components/layouts/components/PageBackButton";
import Sidebar from "@/components/layouts/components/Sidebar";
import Topbar from "@/components/layouts/components/Topbar";
import { getUser } from "@/lib/auth";
import type { User } from "@/lib/db/schema";
import { getUserCurrentDomain } from "@/lib/server/utils";

export const metadata: Metadata = {
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
  title: "Atlas Hosting - Serviços de Web Hosting",
};

export const dynamic = "force-dynamic"; // Force dynamic rendering for this layout

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
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
      <Sidebar isAdmin={user.isAdmin || false} />
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <ImpersonationBanner />
        <Topbar isAdmin={user.isAdmin || false}>
          <UserSiteSelect />
        </Topbar>

        <main className="flex-1 overflow-y-auto border-border bg-background md:border-l">
          <PageBackButton />
          {children}
        </main>
      </div>
    </div>
  );
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export async function UserSiteSelect() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const selectedDomain = await getUserCurrentDomain(user);

  const selectedDomainInfo = find(
    user.organization.domains,
    domain => domain.domain === selectedDomain?.domain
  );

  return (
    selectedDomain && (
      <DomainSelector
        domains={user.organization.domains}
        selectedDomain={selectedDomainInfo}
      />
    )
  );
}
