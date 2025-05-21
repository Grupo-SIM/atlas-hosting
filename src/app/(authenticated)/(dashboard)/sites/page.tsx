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
import nameSilo from "@/lib/server/apis/namesilo";
import dns from "dns";
import { promisify } from "util";

interface WordPressInstance {
  id: number;
  instanceId: number;
  name: string;
  domain: string;
  path: string;
  status: string;
}

const resolve4 = promisify(dns.resolve4);

async function checkDomain(domain: string): Promise<boolean> {
  try {
    const addresses = await resolve4(domain);
    return addresses.includes(process.env.SERVER_IP!);
  } catch (error) {
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

  // Fetch user's domains
  const userDomains = await nameSilo.listDomains({
    portfolioId: +user.namesiloId!,
    pageSize: 300,
  });

  const userDomainNames = Array.isArray(userDomains.domains)
    ? userDomains.domains.map((d) => d.domain)
    : [userDomains.domains.domain.domain];

  // Fetch WordPress instances
  const wpResponse = await pleskApi.wordpress.list();
  const allWpInstances: WordPressInstance[] = JSON.parse(
    wpResponse.stdout || "[]"
  ).map((instance: any) => ({
    id: instance.id,
    instanceId: instance.id,
    name: instance.name,
    domain: instance.siteUrl,
    path: instance.path,
    status: instance.stateText,
  }));

  console.log({ wpResponse });

  // Filter WordPress instances to only show user's domains
  const wpInstances = allWpInstances.filter((instance) =>
    userDomainNames.some((domain) =>
      [domain, `www.${domain}`].includes(new URL(instance.domain).hostname)
    )
  );

  // Do DNS check for each instance
  const dnsResults = await Promise.all(
    wpInstances.map(async (instance) => {
      const hostname = new URL(instance.domain).hostname;
      const ready = await checkDomain(hostname);
      return { ...instance, ready };
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
