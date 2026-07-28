import { Building2, Globe, Lock, Wifi } from "lucide-react";

export function FeaturesBadge() {
  return (
    <div className="relative z-20 -mt-20 mb-12">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-blue-700/50 bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-indigo-900/95 p-6 shadow-2xl backdrop-blur-md md:p-8">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3 md:gap-8">
            {/* Seção Esquerda - Título Principal */}
            <div className="text-center md:text-left">
              <h2 className="mb-2 font-bold text-2xl text-white md:text-3xl">
                Hospedagem inteligente,
              </h2>
              <p className="font-semibold text-white text-xl md:text-2xl">
                retorno garantido
              </p>
            </div>

            {/* Seção do Meio - Features com Ícones */}
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 md:h-14 md:w-14">
                  <Wifi className="h-6 w-6 text-green-400 md:h-7 md:w-7" />
                </div>
                <p className="font-medium text-white text-xs leading-tight md:text-sm">
                  Velocidade e estabilidade
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 md:h-14 md:w-14">
                  <Globe className="h-6 w-6 text-green-400 md:h-7 md:w-7" />
                </div>
                <p className="font-medium text-white text-xs leading-tight md:text-sm">
                  Alcance global, estrutura local
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 md:h-14 md:w-14">
                  <Lock className="h-6 w-6 text-green-400 md:h-7 md:w-7" />
                </div>
                <p className="font-medium text-white text-xs leading-tight md:text-sm">
                  Proteção ativa 24h por dia
                </p>
              </div>
            </div>

            {/* Seção Direita - Alta Performance */}
            <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:justify-end">
              <div className="text-center md:text-right">
                <p className="mb-2 text-white/80 text-xs md:text-sm">
                  ALTA PERFORMANCE
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-400 md:h-14 md:w-14">
                    <Building2 className="h-6 w-6 text-green-400 md:h-7 md:w-7" />
                  </div>
                  <p className="font-bold text-green-400 text-lg md:text-xl">
                    Foco em negócios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
