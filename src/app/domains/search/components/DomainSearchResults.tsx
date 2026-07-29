"use client";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  XCircle,
} from "lucide-react";
import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingState from "./LoadingState";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

interface DomainResult {
  domain: string;
  available: boolean;
  priceBRL: number;
  renewBRL: number;
  transferBRL: number;
  isPremium: boolean;
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

const INCLUDED_FEATURES = [
  "Administração de DNS incluída",
  "Proteção WHOIS opcional (grátis)",
  "Suporte 24/7 em português",
];

function tldOf(domain: string) {
  const i = domain.indexOf(".");
  return i >= 0 ? domain.slice(i).toLowerCase() : "";
}

type FilterId = "all" | "popular" | "business" | "tech";

const FILTERS: {
  id: FilterId;
  label: string;
  match: (domain: string) => boolean;
}[] = [
  { id: "all", label: "Todos", match: () => true },
  {
    id: "popular",
    label: "Populares",
    match: d => [".com", ".net", ".org"].includes(tldOf(d)),
  },
  {
    id: "business",
    label: "Negócios",
    match: d =>
      [".co", ".online", ".site", ".store", ".world", ".ink", ".inc"].includes(
        tldOf(d)
      ),
  },
  {
    id: "tech",
    label: "Tecnologia",
    match: d =>
      [".io", ".dev", ".tech", ".app", ".cloud", ".xyz", ".space"].includes(
        tldOf(d)
      ),
  },
];

function pathAfterAuthSingle(domain: string) {
  return `/domain?domain=${encodeURIComponent(domain)}`;
}

function pathAfterAuthBundle(domains: string[]) {
  return `/domain?tab=register&bundle=${encodeURIComponent(domains.join(","))}`;
}

export default function DomainSearchResults({
  query,
}: DomainSearchResultsProps) {
  const router = useRouter();
  const [mainResult, setMainResult] = useState<DomainResult | null>(null);
  const [suggestions, setSuggestions] = useState<DomainResult[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<FilterId>("all");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postAuthPath, setPostAuthPath] = useState<string | null>(null);

  const openAuthModal = (path: string) => {
    setPostAuthPath(path);
    setAuthModalOpen(true);
  };

  const onAuthModalOpenChange = (open: boolean) => {
    setAuthModalOpen(open);
    if (!open) {
      setPostAuthPath(null);
    }
  };

  const goToLogin = () => {
    if (!postAuthPath) return;
    router.push(`/login?redirect=${encodeURIComponent(postAuthPath)}`);
  };

  const goToSignup = () => {
    if (!postAuthPath) return;
    router.push(`/signup?redirect=${encodeURIComponent(postAuthPath)}`);
  };

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
      setSuggestions(prev =>
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
    setFilterId("all");

    fetchPage(1, false)
      .catch(err => {
        const msg =
          err instanceof Error
            ? err.message
            : "Erro ao buscar domínio. Tente novamente.";
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      currency: "BRL",
      style: "currency",
    }).format(price);

  const allResults = useMemo(() => {
    const list: DomainResult[] = [];
    if (mainResult) {
      list.push(mainResult);
    }
    suggestions.forEach(s => {
      if (!list.some(existing => existing.domain === s.domain)) {
        list.push(s);
      }
    });
    return list;
  }, [mainResult, suggestions]);

  const bundleItems = useMemo(() => {
    // Keep bundle items coming from suggestions for "Amplie sua marca"
    return suggestions.filter(s => s.available).slice(0, 3);
  }, [suggestions]);

  const filteredList = useMemo(() => {
    const match = FILTERS.find(f => f.id === filterId)?.match ?? (() => true);
    return allResults.filter(s => match(s.domain));
  }, [allResults, filterId]);

  const bundleTotal = useMemo(
    () => bundleItems.reduce((acc, s) => acc + s.priceBRL, 0),
    [bundleItems]
  );

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-6 text-red-100">
        <p
          className={`${roboto.className} mb-2 font-semibold text-lg uppercase tracking-wide`}
        >
          Erro ao buscar
        </p>
        <p className="text-red-100/90 text-sm">{error}</p>
      </div>
    );
  }

  if (!mainResult) {
    return null;
  }

  return (
    <div className="space-y-12 md:space-y-14">
      {/* Destaques: correspondência + pacote sugerido */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Card 1 — correspondência com a busca */}
        <article className="flex flex-col rounded-2xl border border-white/12 bg-[#0d1225] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)] md:p-8">
          <span
            className={`${roboto.className} mb-4 inline-flex w-fit rounded-full border border-sky-500/35 bg-sky-500/10 px-3 py-1 font-bold text-[11px] text-sky-400 uppercase tracking-widest`}
          >
            Correspondência exata
          </span>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                className={`${roboto.className} break-all font-bold text-2xl text-white tracking-tight md:text-[1.65rem]`}
              >
                {mainResult.domain}
              </h2>
              <p className="mt-2 font-medium text-sm text-white/60">
                {mainResult.available
                  ? "Disponível para registro na Atlas."
                  : (mainResult.unavailableReason ??
                    "Indisponível no momento.")}
              </p>
            </div>
            {mainResult.isPremium ? (
              <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 font-semibold text-amber-200 text-xs">
                Premium
              </span>
            ) : null}
          </div>

          {mainResult.available ? (
            <>
              <div className="mt-6 flex flex-wrap items-end gap-6 border-white/10 border-t pt-6">
                <div>
                  <p className="font-medium text-white/45 text-xs uppercase tracking-wide">
                    Primeiro ano
                  </p>
                  <p
                    className={`${roboto.className} mt-1 font-bold text-3xl text-white`}
                  >
                    {formatPrice(mainResult.priceBRL)}
                  </p>
                  <p className="mt-1 text-white/45 text-xs">
                    Renovação {formatPrice(mainResult.renewBRL)}/ano
                  </p>
                </div>
              </div>

              <ul className="mt-6 flex flex-col gap-2.5">
                {INCLUDED_FEATURES.map(t => (
                  <li
                    className="flex items-start gap-2.5 text-sm text-white/80"
                    key={t}
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-sky-400"
                      strokeWidth={2.5}
                    />
                    {t}
                  </li>
                ))}
              </ul>

              <Button
                className={`${roboto.className} mt-8 h-12 w-full rounded-xl bg-sky-500 font-bold text-sm text-white uppercase tracking-wide shadow-[0_8px_24px_rgba(14,165,233,0.25)] transition-all hover:bg-sky-400 active:scale-[0.98]`}
                onClick={() =>
                  openAuthModal(pathAfterAuthSingle(mainResult.domain))
                }
                type="button"
              >
                Registrar agora
              </Button>
            </>
          ) : (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <XCircle className="h-8 w-8 shrink-0 text-red-400/90" />
              <p className="text-sm text-white/65">
                Experimente outra extensão ou varie o nome — veja sugestões ao
                lado e na lista abaixo.
              </p>
            </div>
          )}
        </article>

        {/* Card 2 — pacote / extensões sugeridas */}
        <article className="flex flex-col rounded-2xl border border-white/12 bg-[#0d1225] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)] md:p-8">
          <span
            className={`${roboto.className} mb-4 inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 font-bold text-[11px] text-white/80 uppercase tracking-widest`}
          >
            Amplie sua marca
          </span>

          {bundleItems.length > 0 ? (
            <>
              <p className="text-sm text-white/60">
                Combine estas extensões para proteger o nome do seu projeto.
              </p>
              <ul className="mt-5 space-y-3">
                {bundleItems.map(s => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                    key={s.domain}
                  >
                    <span
                      className={`${roboto.className} font-semibold text-white`}
                    >
                      {s.domain}
                    </span>
                    <span className="shrink-0 font-bold text-sky-400 text-sm">
                      {formatPrice(s.priceBRL)}
                      <span className="font-normal text-white/40">/ano</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-white/45 text-xs uppercase tracking-wide">
                Total estimado
              </p>
              <p
                className={`${roboto.className} font-bold text-2xl text-white`}
              >
                {formatPrice(bundleTotal)}
                <span className="font-medium text-base text-white/45">
                  {" "}
                  / primeiro ano
                </span>
              </p>
              <p className="mt-1 text-white/45 text-xs leading-relaxed">
                Compre estes domínios em uma única fatura e um único pagamento
                (disponível só neste pacote sugerido).
              </p>
              {bundleItems.length >= 2 ? (
                <Button
                  className={`${roboto.className} mt-8 h-12 w-full rounded-xl border-2 border-sky-500/50 bg-transparent font-bold text-sky-400 text-sm uppercase tracking-wide transition-all hover:bg-sky-500/10 hover:text-sky-400`}
                  onClick={() =>
                    openAuthModal(
                      pathAfterAuthBundle(bundleItems.map(b => b.domain))
                    )
                  }
                  type="button"
                  variant="outline"
                >
                  Comprar pacote
                </Button>
              ) : bundleItems.length === 1 ? (
                <Button
                  className={`${roboto.className} mt-8 h-12 w-full rounded-xl border-2 border-sky-500/50 bg-transparent font-bold text-sky-400 text-sm uppercase tracking-wide transition-all hover:bg-sky-500/10 hover:text-sky-400`}
                  onClick={() =>
                    openAuthModal(pathAfterAuthSingle(bundleItems[0]!.domain))
                  }
                  type="button"
                  variant="outline"
                >
                  Registrar esta extensão
                </Button>
              ) : null}
            </>
          ) : (
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-sm text-white/60">
                Assim que houver sugestões disponíveis para o seu termo,
                mostraremos um pacote de extensões aqui.
              </p>
              <p className="mt-4 text-sm text-white/45">
                Tente buscar apenas o nome (sem TLD) para ver mais opções.
              </p>
            </div>
          )}
        </article>
      </div>

      {/* Mais opções */}
      <section className="scroll-mt-28" id="mais-opcoes">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h3
            className={`${roboto.className} font-black text-white text-xl uppercase md:text-2xl`}
          >
            Mais opções
          </h3>
          {pagination ? (
            <span className="font-medium text-slate-400 text-sm">
              {allResults.filter(r => r.available).length} disponíveis nesta
              busca
              {pagination.total > 0 ? ` · ${pagination.total} no total` : ""}
            </span>
          ) : null}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.filter(
            f => f.id === "all" || allResults.some(s => f.match(s.domain))
          ).map(f => (
            <button
              className={`rounded-full border px-4 py-2 font-bold text-sm uppercase tracking-wide transition-all ${
                filterId === f.id
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
              key={f.id}
              onClick={() => setFilterId(f.id)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredList.length > 0 ? (
          <ul className="divide-y divide-white/10 rounded-2xl border border-white/12 bg-[#0d1225] shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
            {filteredList.map(s => (
              <li
                className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
                key={s.domain}
              >
                <div className="flex min-w-0 items-start gap-3">
                  {s.available ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-white/20" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`${roboto.className} font-bold text-lg text-white md:text-xl ${!s.available ? "opacity-50" : ""}`}
                      >
                        {s.domain}
                      </span>
                      {s.available ? (
                        s.isPremium ? (
                          <span className="rounded-full bg-amber-400/15 px-2 py-0.5 font-bold text-[10px] text-amber-200 uppercase tracking-wide">
                            Premium
                          </span>
                        ) : (
                          <span className="rounded-full border border-sky-500/20 bg-sky-500/12 px-2 py-0.5 font-bold text-[10px] text-sky-400 uppercase tracking-wide">
                            Disponível
                          </span>
                        )
                      ) : (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 font-bold text-[10px] text-white/40 uppercase tracking-wide">
                          Indisponível
                        </span>
                      )}
                    </div>
                    {s.available ? (
                      <p className="mt-0.5 text-white/45 text-xs">
                        Renovação a partir de {formatPrice(s.renewBRL)}/ano
                      </p>
                    ) : (
                      <p className="mt-0.5 text-white/30 text-xs">
                        Já registrado ou não disponível
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                  {s.available ? (
                    <>
                      <div className="text-right">
                        <p
                          className={`${roboto.className} font-bold text-lg text-white md:text-xl`}
                        >
                          {formatPrice(s.priceBRL)}
                        </p>
                        <p className="text-white/45 text-xs">/ano</p>
                      </div>
                      <Button
                        className={`${roboto.className} h-10 min-w-[7.5rem] shrink-0 rounded-xl border-white/25 bg-transparent font-bold text-white text-xs uppercase tracking-wide transition-all hover:border-sky-500/50 hover:bg-sky-500/5 hover:text-sky-400`}
                        onClick={() =>
                          openAuthModal(pathAfterAuthSingle(s.domain))
                        }
                        type="button"
                        variant="outline"
                      >
                        Registrar
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="h-10 min-w-[7.5rem] shrink-0 rounded-xl border-white/10 bg-white/5 font-bold text-white/30 text-xs uppercase tracking-wide"
                      disabled
                      type="button"
                      variant="outline"
                    >
                      Indisponível
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-white/12 bg-[#0d1225] px-6 py-14 text-center shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
            <p className="text-white/60">
              Nenhum resultado nesta categoria. Escolha outro filtro ou carregue
              mais sugestões.
            </p>
          </div>
        )}

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <Button
              className="gap-2 rounded-xl border-white/10 bg-white/5 px-8 py-6 font-bold text-white text-xs uppercase tracking-wide shadow-xl backdrop-blur-md transition-all hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400"
              disabled={isLoadingMore}
              onClick={handleLoadMore}
              variant="outline"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                  Carregando…
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 text-sky-400" />
                  Carregar mais
                </>
              )}
            </Button>
          </div>
        ) : null}
      </section>

      <Dialog onOpenChange={onAuthModalOpenChange} open={authModalOpen}>
        <DialogContent className="border-white/10 bg-[#0d1225] text-white sm:max-w-md [&_.text-muted-foreground]:text-white/65 [&_button.absolute]:text-white/80">
          <DialogHeader>
            <DialogTitle className={`${roboto.className} text-white text-xl`}>
              Continuar compra
            </DialogTitle>
            <DialogDescription className="text-base text-white/70">
              Você já possui conta na Atlas Hosting? Escolha uma opção para
              seguir para o pagamento com segurança.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className={`${roboto.className} h-11 w-full bg-sky-500 font-bold text-white uppercase tracking-wide transition-all hover:bg-sky-400`}
              onClick={goToLogin}
              type="button"
            >
              Sim — entrar com minha conta
            </Button>
            <Button
              className={`${roboto.className} h-11 w-full border-white/25 bg-transparent font-bold text-white uppercase tracking-wide transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400`}
              onClick={goToSignup}
              type="button"
              variant="outline"
            >
              Não — criar conta nova
            </Button>
            <Button
              className="text-white/55 transition-colors hover:bg-white/5 hover:text-sky-400"
              onClick={() => onAuthModalOpenChange(false)}
              type="button"
              variant="ghost"
            >
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
