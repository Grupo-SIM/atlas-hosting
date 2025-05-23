// src/app/(authenticated)/(dashboard)/sites/page.tsx
import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe } from "lucide-react";
import Link from "next/link";
import { SitesList } from "./components/SitesList";
import { namecheapApi } from "@/lib/server/apis/namecheap"; // Import Namecheap API
import { type DomainListItem } from "@/lib/server/apis/namecheap/types"; // Import Namecheap DomainListItem type
import dns from "dns";
import { promisify } from "util";
import { WordPressInstance } from "@/lib/server/apis/plesk/wp-toolkit";

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
  } catch (error) {
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

  // console.log({ userDomainNames, allWpInstancesCount: allWpInstances.length, filteredWpInstances: wpInstances });

  // Do DNS check for each filtered instance
  const dnsResults = await Promise.all(
    wpInstances.map(async (instance) => {
      let hostname = "";
      try {
        hostname = new URL(instance.domain).hostname;
        const ready = await checkDomain(hostname);
        return { ...instance, ready, hostname };
      } catch (e) {
        // console.warn(`Could not parse hostname from WP instance domain: ${instance.domain}`);
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
          <Button variant="outline" asChild>
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

export async function getUserWordPressSites(userId: string) {
  let userDomainNames: string[] = [];
  try {
    // Fetch user's domains from Namecheap
    // Assumes namecheapApi.getList() lists domains relevant to the user context
    // (e.g., domains under the API user's account or a specific sub-user if wrapper is instantiated per-user)
    const ncResponse = await namecheapApi.getList({ PageSize: 100 }); // Max PageSize, adjust as needed

    if (ncResponse && ncResponse.Domains) {
      userDomainNames = ncResponse.Domains.map((d: DomainListItem) => d.Name);
    } else {
      console.warn("No domains found for user from Namecheap or API error.");
      userDomainNames = [];
    }
  } catch (error) {
    console.error("Error fetching domains from Namecheap:", error);
    userDomainNames = []; // Default to empty list on error
  }

  // Fetch WordPress instances from Plesk
  let allWpInstances: ParsedWordPressInstance[] = [];
  try {
    const wpResponse = await pleskApi.wordpress.list(); // Lists all WP instances on the server

    if (wpResponse.stdout) {
      allWpInstances = JSON.parse(wpResponse.stdout).map(
        (instance: WordPressInstance) => ({
          id: instance.id, // WP Toolkit specific ID
          instanceId: instance.id, // Redundant, but kept for consistency if used elsewhere
          name: instance.name, // Title of the site
          domain: instance.siteUrl || instance.mainDomainId, // site_url is usually the one from WP Toolkit JSON output
          path: instance.path,
          status: instance.stateText,
        })
      );
    }
  } catch (error) {
    console.error("Error fetching WordPress instances from Plesk:", error);
  }

  // Filter WordPress instances to only show those associated with the user's Namecheap domains
  const userWpInstances = allWpInstances.filter((instance) => {
    if (!instance.domain) return false;
    try {
      const instanceHostname = new URL(instance.domain).hostname;
      return userDomainNames.some((userDomain) => {
        console.log(instanceHostname, userDomain);
        return (
          instanceHostname === userDomain ||
          instanceHostname === `www.${userDomain}`
        );
      });
    } catch (e) {
      console.warn(`Invalid URL for WP instance domain: ${instance.domain}`);
      return false;
    }
  });

  return userWpInstances;
}
