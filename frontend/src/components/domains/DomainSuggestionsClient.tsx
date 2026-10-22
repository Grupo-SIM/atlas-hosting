"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { loadMoreDomainSuggestions } from "@/app/(auth)/domain/actions";
import type { DomainWithAvailability } from "@/app/(auth)/domain/types";
import { Button } from "@/components/ui/button";
import { toBrl } from "@/lib/utils";

export function DomainSuggestionsClient({
  initialDomains,
  domainName,
  returnTo,
}: {
  initialDomains: DomainWithAvailability[];
  domainName: string;
  returnTo?: string;
}) {
  const [domains, setDomains] = useState(initialDomains);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const more = await loadMoreDomainSuggestions(domainName);
      setDomains(prev => [...prev, ...more]);
      setLoaded(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {domains.map(domain => (
          <div
            className="flex items-start justify-between gap-3 rounded-lg border p-3"
            key={domain.domain}
          >
            <div className="flex min-w-0 items-start gap-3">
              {domain.available ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              )}
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-sm">
                  {domain.domain}
                </h3>
                {domain.available ? (
                  <div className="mt-1 flex flex-col gap-0.5">
                    <p className="text-muted-foreground text-xs">
                      Registro: {toBrl(domain.priceBRL)}
                      {domain.isPremium && " (Premium)"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Renovação: {toBrl(domain.renewBRL)}
                      {domain.isPremium && " (Premium)"}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-muted-foreground text-xs">
                    Não disponível
                  </p>
                )}
              </div>
            </div>
            {domain.available && (
              <Button
                asChild
                className="h-7 shrink-0 px-2 text-xs"
                size="sm"
                variant="outline"
              >
                <Link
                  href={`/domain?domain=${encodeURIComponent(domain.domain)}&returnTo=${encodeURIComponent(returnTo || "/home")}`}
                >
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
            disabled={isPending}
            onClick={handleLoadMore}
            variant="outline"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
