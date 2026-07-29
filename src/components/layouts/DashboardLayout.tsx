import Topbar from "@/components/layouts/components/Topbar";
import type { User } from "@/lib/db/schema";
import Sidebar from "./components/Sidebar";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default async function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  return (
    <div className="flex max-h-screen min-h-screen bg-background">
      <Sidebar isAdmin={user.isAdmin || false} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar isAdmin={user.isAdmin || false}>
          {/* <UserSiteSelect user={user} /> */}
        </Topbar>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

/* 
async function UserSiteSelect({ user }: { user: User }) {
  const domains = await getUserDomains(user);
  const selectedDomain = await getUserCurrentDomain(user);

  return (
    selectedDomain && (
      <DomainSelector
        domains={domains}
        selectedDomain={user.organization.domains}
      />
    )
  );
}
 */
