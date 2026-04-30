import LoadingState from "./components/LoadingState";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header (Mocked to prevent layout jump) */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a página inicial</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Buscar Domínio
          </h1>
          <p className="text-slate-500">
            Encontre o domínio perfeito para o seu projeto
          </p>
        </div>

        {/* Search Bar (Mocked to prevent layout jump) */}
        <div className="mb-8">
          <div className="relative rounded-2xl p-2 bg-white border border-slate-200 shadow-sm flex">
            <div className="flex items-center gap-2 w-full opacity-50 cursor-not-allowed">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Digite o nome do domínio..."
                className="flex-1 bg-transparent text-slate-900 placeholder-slate-300 outline-none text-base py-2"
                disabled
              />
              <Button
                disabled
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6"
              >
                Pesquisar
              </Button>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <LoadingState />
      </div>
    </div>
  );
}
