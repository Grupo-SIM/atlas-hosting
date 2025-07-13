import DomainSelector from "@/components/domains/DomainSelector";
import Sidebar from "@/components/layouts/components/Sidebar";
import Topbar from "@/components/layouts/components/Topbar";
import { getUser } from "@/lib/auth";
import type { User } from "@/lib/db/schema";
import {
  getUserCurrentDomain,
  getUserNamecheapDomains,
} from "@/lib/server/utils";
import { find } from "lodash";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Atlas Hosting - Serviços de Web Hosting",
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export const dynamic = "force-dynamic"; // Force dynamic rendering for this layout

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-h-screen min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar>
          <UserSiteSelect />
        </Topbar>

        <main className="flex-1 overflow-y-auto border-1 border-solid border-border border-b-0 border-r-0 min-h-max">
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
    (domain) => domain.domain === selectedDomain?.domain
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
