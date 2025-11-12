import { Wifi, Globe, Lock, Building2 } from "lucide-react";

export function FeaturesBadge() {
  return (
    <div className="relative -mt-20 mb-12 z-20">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-indigo-900/95 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-blue-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
            {/* Seção Esquerda - Título Principal */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Hospedagem inteligente,
              </h2>
              <p className="text-xl md:text-2xl font-semibold text-white">
                retorno garantido
              </p>
            </div>

            {/* Seção do Meio - Features com Ícones */}
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                  <Wifi className="h-6 w-6 md:h-7 md:w-7 text-green-400" />
                </div>
                <p className="text-xs md:text-sm text-white font-medium leading-tight">
                  Velocidade e estabilidade
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                  <Globe className="h-6 w-6 md:h-7 md:w-7 text-green-400" />
                </div>
                <p className="text-xs md:text-sm text-white font-medium leading-tight">
                  Alcance global, estrutura local
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                  <Lock className="h-6 w-6 md:h-7 md:w-7 text-green-400" />
                </div>
                <p className="text-xs md:text-sm text-white font-medium leading-tight">
                  Proteção ativa 24h por dia
                </p>
              </div>
            </div>

            {/* Seção Direita - Alta Performance */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-3">
              <div className="text-center md:text-right">
                <p className="text-xs md:text-sm text-white/80 mb-2">ALTA PERFORMANCE</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-green-400 flex items-center justify-center">
                    <Building2 className="h-6 w-6 md:h-7 md:w-7 text-green-400" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-green-400">
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

