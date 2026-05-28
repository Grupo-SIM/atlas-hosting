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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {domains.map((domain) => (
          <div
            key={domain.domain}
            className="flex items-start justify-between gap-3 p-3 border rounded-lg"
          >
            <div className="flex items-start gap-3 min-w-0">
              {domain.available ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{domain.domain}</h3>
                {domain.available ? (
                  <div className="flex flex-col gap-0.5 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Registro: {toBrl(domain.priceBRL)}
                      {domain.isPremium && " (Premium)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Renovação: {toBrl(domain.renewBRL)}
                      {domain.isPremium && " (Premium)"}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Não disponível
                  </p>
                )}
              </div>
            </div>
            {domain.available && (
              <Button asChild variant="outline" size="sm" className="shrink-0 text-xs h-7 px-2">
                <Link href={`/domain?domain=${domain.domain}`}>
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
