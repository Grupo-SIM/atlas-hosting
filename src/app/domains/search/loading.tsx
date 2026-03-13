import LoadingState from "./components/LoadingState";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000319' }}>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header (Mocked to prevent layout jump) */}
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

        {/* Search Bar (Mocked to prevent layout jump) */}
        <div className="mb-8">
          <div className="relative rounded-4xl p-2 bg-white/5 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] flex">
            <div className="flex items-center gap-2 w-full opacity-50 cursor-not-allowed">
              <Search className="w-5 h-5 text-white/70 ml-2" />
              <input
                type="text"
                placeholder="Digite o nome do domínio..."
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-base py-2"
                disabled
              />
              <Button
                disabled
                className="bg-green-500 hover:bg-green-600 text-white rounded-4xl px-6"
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
