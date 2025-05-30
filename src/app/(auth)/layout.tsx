import DomainSelector from "@/components/domains/DomainSelector";
import Sidebar from "@/components/layouts/components/Sidebar";
import Topbar from "@/components/layouts/components/Topbar";
import { getUser } from "@/lib/auth";
import type { User } from "@/lib/db/schema";
import type { DomainListItem } from "@/lib/server/apis/namecheap/types";
import { getUserCurrentDomain, getUserDomains } from "@/lib/server/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Atlas Hosting - Serviços de Web Hosting",
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const domains = await getUserDomains(user.id);
  const selectedDomain = await getUserCurrentDomain(user);

  return (
    <div className="max-h-screen min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user}>
          <UserSiteSelect
            domains={domains}
            selectedDomain={selectedDomain}
            user={user}
          />
        </Topbar>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

async function UserSiteSelect({
  user,
  domains,
  selectedDomain,
}: {
  user: User;
  domains: (DomainListItem & {
    inPlesk: boolean;
  })[];
  selectedDomain: DomainListItem | null;
}) {
  return (
    selectedDomain && (
      <DomainSelector domains={domains} selectedDomain={selectedDomain} />
    )
  );
}
