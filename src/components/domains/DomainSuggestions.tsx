import type { DomainData } from "@/app/(auth)/domain/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DomainSuggestionsClient } from "./DomainSuggestionsClient";

export async function DomainSuggestions({
  domainDataPromise,
  searchQuery,
}: {
  domainDataPromise: Promise<DomainData>;
  searchQuery: string;
}) {
  const domainData = await domainDataPromise;

  const domainName = searchQuery.includes(".")
    ? searchQuery.split(".")[0]
    : searchQuery;

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
        <DomainSuggestionsClient
          initialDomains={domainData.extraDomains}
          domainName={domainName}
        />
      </CardContent>
    </Card>
  );
}
