"use client";

import { loadMoreDomainSuggestions } from "@/app/(auth)/domain/actions";
import type { DomainWithAvailability } from "@/app/(auth)/domain/types";
import { Button } from "@/components/ui/button";
import { toBrl } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

export function DomainSuggestionsClient({
  initialDomains,
  domainName,
}: {
  initialDomains: DomainWithAvailability[];
  domainName: string;
}) {
  const [domains, setDomains] = useState(initialDomains);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const more = await loadMoreDomainSuggestions(domainName);
      setDomains((prev) => [...prev, ...more]);
      setLoaded(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {domains.map((domain) => (
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
                <Link href={`/domain/register?domain=${domain.domain}`}>
                  Registrar
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>

      {!loaded && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              "Carregar mais domínios"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
