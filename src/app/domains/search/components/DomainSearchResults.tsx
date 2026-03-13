"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DomainResult {
  domain: string;
  available: boolean;
  priceBRL: number;
  renewBRL: number;
  transferBRL: number;
  isPremium: boolean;
  /** Presente quando o TLD não é suportado pela plataforma */
  unavailableReason?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface SearchResponse {
  main: DomainResult;
  suggestions: DomainResult[];
  pagination: PaginationInfo;
}

interface DomainSearchResultsProps {
  query: string;
}

const PAGE_SIZE = 9;

export default function DomainSearchResults({
  query,
}: DomainSearchResultsProps) {
  const [mainResult, setMainResult] = useState<DomainResult | null>(null);
  const [suggestions, setSuggestions] = useState<DomainResult[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const url = `/api/domains/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${PAGE_SIZE}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || "Erro ao buscar domínio"
        );
      }

      const data: SearchResponse = await response.json();

      setMainResult(data.main);
      setSuggestions((prev) =>
        append ? [...prev, ...data.suggestions] : data.suggestions
      );
      setPagination(data.pagination);
    },
    [query]
  );

  useEffect(() => {
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setMainResult(null);
    setSuggestions([]);
    setPagination(null);

    fetchPage(1, false)
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : "Erro ao buscar domínio. Tente novamente.";
        setError(msg);
        console.error("Error searching domain:", err);
      })
      .finally(() => setIsLoading(false));
  }, [query, fetchPage]);

  const handleLoadMore = async () => {
    if (!pagination || pagination.page >= pagination.totalPages) return;
    setIsLoadingMore(true);
    try {
      await fetchPage(pagination.page + 1, true);
    } catch (err) {
      console.error("Error loading more domains:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

  if (!mainResult) {
    return null;
  }

  const availableSuggestions = suggestions.filter((s) => s.available);
  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className="relative rounded-4xl p-6 text-white overflow-hidden bg-slate-200/10 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)]">
        <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {mainResult.available ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{mainResult.domain}</h2>
                <p className="text-white/70 text-sm">
                  {mainResult.available
                    ? "Este domínio está disponível para registro"
                    : (mainResult.unavailableReason ?? "Este domínio não está disponível")}
                </p>
              </div>
            </div>
            {mainResult.isPremium && (
              <span className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                Premium
              </span>
            )}
          </div>

          {mainResult.available && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm mb-1">Preço anual</p>
                  <p className="text-3xl font-bold">
                    {formatPrice(mainResult.priceBRL)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm mb-1">Renovação</p>
                  <p className="text-xl text-white/80">
                    {formatPrice(mainResult.renewBRL)}
                  </p>
                </div>
              </div>
              <Link
                href={`/signup?redirect=/domain?domain=${encodeURIComponent(
                  mainResult.domain
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
      {availableSuggestions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              Sugestões alternativas
            </h3>
            {pagination && (
              <span className="text-white/50 text-sm">
                {availableSuggestions.length} de {pagination.total} disponíveis
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableSuggestions.map((suggestion) => (
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

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-green-500/50 px-8 py-5 rounded-xl gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Carregar mais domínios
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {availableSuggestions.length === 0 && (
        <div className="text-center py-12 rounded-4xl bg-white/5 border border-white/10">
          <p className="text-white/70">
            Nenhuma sugestão alternativa disponível no momento.
          </p>
        </div>
      )}
    </div>
  );
}
