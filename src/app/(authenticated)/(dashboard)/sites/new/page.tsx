// src/app/(authenticated)/(dashboard)/sites/new/page.tsx
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
import { namecheapApi } from "@/lib/server/apis/namecheap"; // Import Namecheap API
import { type DomainListItem } from "@/lib/server/apis/namecheap/types"; // Import Namecheap DomainListItem type
import pleskApi from "@/lib/server/apis/plesk";
import { Suspense } from "react";
import { NewWordPressSiteForm } from "./components/NewWordPressSiteForm";

// Updated function to use Namecheap API
async function getUserDomains(): Promise<
  (DomainListItem & { inPlesk: boolean })[]
> {
  try {
    // Call Namecheap API to get the list of domains
    // Assuming PageSize and other params are handled by default or not strictly needed here.
    // Add params like PageSize if needed: namecheapApi.getList({ PageSize: 100 })
    const response = await namecheapApi.getList({});

    let allDomains: DomainListItem[] = [];

    if (response && response.Domains) {
      allDomains = response.Domains;
    } else {
      console.error(
        "Error fetching domains from Namecheap or no domains found:",
        response
      );
      return [];
    }

    const domainsWithPleskData = await Promise.all(
      allDomains.map(async (domain) => {
        let isInPlesk = false;
        try {
          // Check if domain exists in Plesk.
          // Plesk API's getDomain might throw an error if domain is not found,
          // so we'll catch it and assume not in Plesk.
          const pleskDomainInfo = await pleskApi.getDomain(domain.Name); // Use domain.Name
          if (pleskDomainInfo) {
            // Further checks can be added here if needed, e.g., check for WP installation
            isInPlesk = true;
          }
        } catch (pleskError) {
          // Assuming error means domain is not in Plesk or not accessible
          // console.warn(`Domain ${domain.Name} not found in Plesk or error checking:`, pleskError);
          isInPlesk = false;
        }
        return {
          ...domain,
          inPlesk: isInPlesk, // Example: Check if domain is already in Plesk
        };
      })
    );

    return domainsWithPleskData;
  } catch (error) {
    console.error("Exception fetching/processing Namecheap domains:", error);
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

  // Removed user.namesiloId check.
  // If there's a Namecheap-specific user configuration to check (e.g., user.namecheapUserName),
  // it could be added here. For now, proceeding without it.

  // Fetch domains on the server using the updated function
  const domains = await getUserDomains();

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
