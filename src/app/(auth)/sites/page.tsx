import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import Link from "next/link";
import { SiteCard } from "./components/SiteCard";
import { SiteStats } from "./components/SiteStats";
import coolifyApi from "@/lib/server/apis/coolify";

export default async function SitesPage() {
  const applications = await coolifyApi.listApplications();

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Sites
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus sites e aplicações
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild={true}>
            <Link href="/sites/new">
              <Globe className="mr-2 h-4 w-4" /> Criar Novo Site
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((app: any) => (
          <div key={app.id} className="space-y-6">
            <SiteCard site={app} />
            <SiteStats />
          </div>
        ))}
      </div>
    </div>
  );
}
