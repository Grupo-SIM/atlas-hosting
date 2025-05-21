// filepath: /home/eurmn/workspace/jb/atlas-hosting/src/app/(authenticated)/(dashboard)/sites/new/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getUser } from "@/lib/auth";
import nameSilo from "@/lib/server/apis/namesilo";
import { type ListDomainDomain } from "@/lib/server/apis/namesilo/types";
import { Suspense } from "react";
import { NewWordPressSiteForm } from "./components/NewWordPressSiteForm"; // We'll create this client component
import pleskApi from "@/lib/server/apis/plesk";

async function getUserDomains(
  namesiloId: number
): Promise<(ListDomainDomain & { inPlesk: boolean })[]> {
  try {
    const response = await nameSilo.listDomains({
      portfolioId: namesiloId,
      pageSize: 300,
    }); // Max pageSize for listDomains is 300

    let allDomains: ListDomainDomain[] = [];

    if (response && response.code === 300 && response.domains) {
      if (Array.isArray(response.domains)) {
        allDomains = response.domains;
      } else if (
        typeof response.domains === "object" &&
        response.domains.domain
      ) {
        // Handle case where only one domain is returned as an object instead of an array
        allDomains = [response.domains.domain];
      } else {
        allDomains = [];
      }
    }

    const domainsWithPleskData = await Promise.all(
      allDomains.map(async (domain) => {
        const d = await pleskApi.getDomain(domain.domain);
        console.log(d);
        return {
          ...domain,
          inPlesk: false,
        };
      })
    );

    return domainsWithPleskData;

    console.error(
      "Error fetching domains or no domains found:",
      response?.detail
    );
    return [];
  } catch (error) {
    console.error("Exception fetching domains:", error);
    return [];
  }
}

export default async function NewSitePage() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="space-y-6 p-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Site WordPress</CardTitle>
            <CardDescription>
              Você precisa estar logado para criar um novo site.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user.namesiloId) {
    return (
      <div className="space-y-6 p-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Site WordPress</CardTitle>
            <CardDescription>
              Sua conta não está configurada para registrar domínios (Namesilo
              ID ausente). Por favor, complete seu perfil ou contate o suporte.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fetch domains on the server
  const domains = await getUserDomains(+user.namesiloId);

  return (
    <div className="space-y-6 p-6 pb-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Criar Novo Site WordPress</CardTitle>
          <CardDescription>
            Selecione um dos seus domínios existentes para instalar o WordPress.
            O sistema configurará automaticamente o DNS e a hospedagem.
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<NewSitePageSkeleton />}>
          <NewWordPressSiteForm domains={domains} />
        </Suspense>
      </Card>
    </div>
  );
}

function NewSitePageSkeleton() {
  return (
    <>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domainName-skeleton">Selecione um Domínio</Label>
          <div
            className="h-10 w-full bg-muted rounded-md animate-pulse"
            id="domainName-skeleton"
          ></div>
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled className="w-full sm:w-auto">
          Criar Site WordPress
        </Button>
      </CardFooter>
    </>
  );
}
