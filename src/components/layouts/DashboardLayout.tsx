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
    <div className="max-h-screen min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar>{/* <UserSiteSelect user={user} /> */}</Topbar>
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
