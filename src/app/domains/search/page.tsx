import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Roboto } from "next/font/google";
import { Navbar } from "@/app/landing/components/Navbar";
import DomainSearchResults from "./components/DomainSearchResults";
import SearchForm from "./components/SearchForm";
import LoadingState from "./components/LoadingState";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function DomainSearchPage({
  searchParams,
}: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0e27]">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #061224 0%, #07182b 38%, #081427 68%, #08091a 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 42% at 50% 0%, rgba(1,252,141,0.16) 0%, rgba(1,252,141,0.06) 38%, rgba(1,252,141,0) 72%)",
        }}
      />
      <Navbar />
      <main className="w-full pt-20 md:pt-24">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pb-24 md:pt-10">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-[#01FC8D]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>

          <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
            <h1
              className={`${roboto.className} text-balance text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.65rem] lg:leading-tight`}
            >
              Encontre o nome do seu domínio
            </h1>
            <p className="mt-3 text-base text-white/65 md:text-lg">
              Pesquise, compare extensões e registre em poucos cliques.
            </p>
          </header>

          <SearchForm defaultValue={query} />

          <div className="mt-12 md:mt-14">
            {query ? (
              <Suspense fallback={<LoadingState />}>
                <DomainSearchResults query={query} />
              </Suspense>
            ) : (
              <p className="text-center text-base text-white/55 md:text-lg">
                Digite um nome ou domínio acima para ver disponibilidade e sugestões.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
