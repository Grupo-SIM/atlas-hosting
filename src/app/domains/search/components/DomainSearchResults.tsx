"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DomainResult {
  domain: string;
  available: boolean;
  priceBRL: number;
  renewBRL: number;
  transferBRL: number;
  isPremium: boolean;
}

interface SearchResponse {
  main: DomainResult;
  suggestions: DomainResult[];
}

interface DomainSearchResultsProps {
  query: string;
}

export default function DomainSearchResults({
  query,
}: DomainSearchResultsProps) {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      setSearchResults(null);

      try {
        const response = await fetch(
          `/api/domains/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.details || errorData.error || "Erro ao buscar domínio"
          );
        }

        const data: SearchResponse = await response.json();
        setSearchResults(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro ao buscar domínio. Tente novamente.";
        setError(errorMessage);
        console.error("Error searching domain:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-4xl p-6 bg-red-500/20 border border-red-500/30 text-red-200">
        <p className="font-semibold mb-2">Erro ao buscar domínio</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!searchResults) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className="relative rounded-4xl p-6 text-white overflow-hidden bg-slate-200/10 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)]">
        <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {searchResults.main.available ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{searchResults.main.domain}</h2>
                <p className="text-white/70 text-sm">
                  {searchResults.main.available
                    ? "Este domínio está disponível para registro"
                    : "Este domínio não está disponível"}
                </p>
              </div>
            </div>
            {searchResults.main.isPremium && (
              <span className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                Premium
              </span>
            )}
          </div>

          {searchResults.main.available && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm mb-1">Preço anual</p>
                  <p className="text-3xl font-bold">
                    {formatPrice(searchResults.main.priceBRL)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm mb-1">Renovação</p>
                  <p className="text-xl text-white/80">
                    {formatPrice(searchResults.main.renewBRL)}
                  </p>
                </div>
              </div>
              <Link
                href={`/signup?redirect=/domain?domain=${encodeURIComponent(
                  searchResults.main.domain
                )}`}
                className="block"
              >
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-6 text-lg">
                  Registrar Agora
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {searchResults.suggestions.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Sugestões alternativas
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.suggestions
              .filter((s) => s.available)
              .map((suggestion) => (
                <div
                  key={suggestion.domain}
                  className="relative rounded-2xl p-4 text-white overflow-hidden bg-slate-200/10 backdrop-blur-[20px] border border-white/10 hover:border-green-500/30 transition-all"
                >
                  <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.1)_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold text-lg">
                        {suggestion.domain}
                      </span>
                      {suggestion.isPremium && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="mb-3">
                      <p className="text-white/70 text-xs mb-1">Preço anual</p>
                      <p className="text-xl font-bold">
                        {formatPrice(suggestion.priceBRL)}
                      </p>
                    </div>
                    <Link
                      href={`/signup?redirect=/domain?domain=${encodeURIComponent(
                        suggestion.domain
                      )}`}
                    >
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg">
                        Registrar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {searchResults.suggestions.filter((s) => s.available).length === 0 && (
        <div className="text-center py-12 rounded-4xl bg-white/5 border border-white/10">
          <p className="text-white/70">
            Nenhuma sugestão alternativa disponível no momento.
          </p>
        </div>
      )}
    </div>
  );
}

