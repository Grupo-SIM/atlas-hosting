import DashboardLayout from "@/components/layouts/DashboardLayout";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ServerStatus } from "@/components/dashboard/ServerStatus";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { getUser } from "@/lib/auth";

export default async function Dashboard() {
  const user = await getUser();

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 pb-16">
        <WelcomeHeader user={user} />
        <QuickActions />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <RecentActivities />
          </div>
          <div className="lg:col-span-4">
            <ServerStatus />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}