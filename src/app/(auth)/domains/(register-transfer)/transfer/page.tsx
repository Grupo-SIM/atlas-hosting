import { getUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import type { OrganizationDomain } from "@/lib/db/schema/tables/organization";
import { TransferForm } from "./components/TransferForm";
import { TransferDomainsList } from "./components/TransferDomainsList";
import { NameserverGuide } from "./components/NameserverGuide";

export default async function DomainsTransferPage({
  searchParams: searchParamsProp,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain } = await searchParamsProp;
  const user = await getUser();

  // Get existing domains that are in transfer status (active: false)
  const transferDomains = user.organization.domains.filter(
    (d: OrganizationDomain) => !d.active
  );

  return (
    <TabsContent key="rt" defaultValue="transfer" value="transfer" className="space-y-8 mt-8">
      <div className="grid grid-cols-[1fr_auto] gap-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Transferir Domínio Existente
            </CardTitle>
            <CardDescription>
              Adicione seu domínio existente à sua organização Atlas Hosting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TransferForm defaultDomain={domain} />

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">
                Como funciona a transferência:
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Adicione seu domínio existente</p>
                <p>• Configure os nameservers no seu registrador atual</p>
                <p>• Aguarde a propagação DNS (1-24 horas)</p>
                <p>• Seu domínio ficará ativo na organização</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl flex flex-col">
          <CardHeader>
            <CardTitle>Guia de Transferência</CardTitle>
            <CardDescription>
              Instruções para transferir seu domínio para a Atlas Hosting
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 justify-center h-full">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Nameservers Atlas Hosting
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-md font-mono text-sm">
                  dns1.registrar-servers.com
                </div>
                <div className="p-3 bg-muted rounded-md font-mono text-sm">
                  dns2.registrar-servers.com
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <NameserverGuide />
            </div>
          </CardContent>
        </Card>
      </div>
      <TransferDomainsList domains={transferDomains} />
    </TabsContent>
  );
}
