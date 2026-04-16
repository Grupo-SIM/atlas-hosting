import { QuickActions, SitesQuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { ServerStatus } from "@/components/dashboard/ServerStatus";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { getUser } from "@/lib/auth";
import { Suspense } from "react";

export default async function Dashboard({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const user = await getUser();
  const searchParams = await _searchParams;

  return (
    <div className="space-y-8 p-6 pb-16">
      <WelcomeHeader user={user} />
      <QuickActions />
{/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col h-full">
          <Suspense fallback={<div className="h-full" />}>
            <RecentActivities searchParams={searchParams} />
          </Suspense>
        </div>
        <div className="lg:col-span-4 flex flex-col h-full">
          <Suspense fallback={<div className="h-full" />}>
            <ServerStatus user={user} />
          </Suspense>
        </div>
      </div> */}
      <SitesQuickActions />
    </div>
  );
}
