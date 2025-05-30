// src/app/(authenticated)/(dashboard)/sites/page.tsx
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe } from "lucide-react";
import Link from "next/link";
import { SitesList } from "./components/SitesList";
import dns from "node:dns";
import { promisify } from "node:util";
import { getUserWordPressSites } from "@/lib/server/utils";
import { cookies } from "next/headers";

export interface ParsedWordPressInstance {
  id: number; // This likely refers to Plesk's internal ID for the WP instance
  instanceId: number; // Often the same as id from WP Toolkit
  name: string; // Name of the WordPress installation (e.g., "My Blog")
  domain: string; // The primary domain/URL of the WordPress site (e.g., "http://example.com")
  path: string; // Installation path relative to the domain's webroot
  status: string; // Status text from Plesk (e.g., "Active", "Broken")
}

const resolve4 = promisify(dns.resolve4);

async function checkDomain(domain: string): Promise<boolean> {
  try {
    const addresses = await resolve4(domain);
    return addresses.includes(process.env.SERVER_IP!);
  } catch (_error) {
    // console.error(`DNS resolution failed for ${domain}:`, error);
    return false;
  }
}

export default async function SitesPage() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="space-y-6 p-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Sites WordPress</CardTitle>
            <CardDescription>
              Você precisa estar logado para ver seus sites.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter WordPress instances to only show those associated with the user's Namecheap domains
  const wpInstances = await getUserWordPressSites(user.id);

  // Do DNS check for each filtered instance
  const dnsResults = await Promise.all(
    wpInstances.map(async (instance) => {
      let hostname = "";
      try {
        hostname = new URL(instance.domain).hostname;
        const ready = await checkDomain(hostname);
        return { ...instance, ready, hostname };
      } catch (_e) {
        return { ...instance, ready: false, hostname: "" };
      }
    })
  );

  const readyInstances = dnsResults.filter((i) => i.ready);
  const processingInstances = dnsResults.filter((i) => !i.ready);

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Sites WordPress
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus sites WordPress e acesse o painel administrativo
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

      <SitesList
        readyInstances={readyInstances}
        processingInstances={processingInstances}
      />
    </div>
  );
}
