import type { DomainData } from "@/app/(auth)/domains/[action]/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toBrl } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export async function DomainSuggestions({
  domainDataPromise,
  searchQuery,
}: {
  domainDataPromise: Promise<DomainData>;
  searchQuery: string;
}) {
  const domainData = await domainDataPromise;

  if (!domainData?.extraDomains || domainData.extraDomains.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sugestões</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não há sugestões adicionais de domínios disponíveis para &quot;
            {searchQuery}&quot; no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sugestões de Domínios</CardTitle>
        <CardDescription>
          Outras opções de domínios que podem lhe interessar:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 max-h-full">
          {domainData.extraDomains.map((domain) => (
            <div
              key={domain.domain}
              className="flex items-center justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                {domain.available ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold">{domain.domain}</h3>
                  {domain.available ? (
                    <div className="flex flex-col gap-1 my-1">
                      <p className="text-sm text-muted-foreground">
                        Preço de registro: {toBrl(domain.priceBRL)}
                        {domain.isPremium && " (Premium)"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Preço de renovação: {toBrl(domain.renewBRL)}
                        {domain.isPremium && " (Premium)"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Domínio não disponível
                    </p>
                  )}
                </div>
              </div>
              {domain.available && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/domains/register?domain=${domain.domain}`}>
                    Registrar
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
