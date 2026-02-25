import { Suspense } from "react";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DomainSearchResults from "./components/DomainSearchResults";
import SearchButton from "./components/SearchButton";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function DomainSearchPage({
  searchParams,
}: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000319' }}>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a página inicial</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Buscar Domínio
          </h1>
          <p className="text-white/70">
            Encontre o domínio perfeito para o seu projeto
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative rounded-4xl p-2 bg-white/5 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)]">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-white/70 ml-2" />
              <input
                type="text"
                defaultValue={query}
                placeholder="Digite o nome do domínio..."
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-base py-2"
                id="domain-search-input"
              />
              <SearchButton />
            </div>
          </div>
        </div>

        {/* Results */}
        {query ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            }
          >
            <DomainSearchResults query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/70 text-lg">
              Digite um domínio no campo de busca acima para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

