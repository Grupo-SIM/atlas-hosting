"use client";

import { Globe } from "lucide-react";
import AtlasLogo from "@/assets/atlas.svg";

function CircularProgress({ value, children }: { value: number; children: React.ReactNode }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(1,252,141,0.5)]">
        <circle cx="28" cy="28" r="22" fill="none" className="stroke-white/5" strokeWidth="3" />
        <circle cx="28" cy="28" r="22" fill="none" className="stroke-[#01FC8D]" strokeWidth="3" 
          strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" />
      </svg>
      <div className="z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

import { motion } from "motion/react";

export function Services() {
  const slideInLeft = {
    initial: { opacity: 0, x: -15 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "200px" },
    transition: { duration: 0.25 }
  };

  const slideInRight = {
    initial: { opacity: 0, x: 15 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "200px" },
    transition: { duration: 0.25 }
  };

  return (
    <section id="servicos" className="py-24 px-4 bg-[#0a0e27] relative w-full pt-32 overflow-hidden">
      <div className="container mx-auto px-2 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Lado Esquerdo - Imagem com corte diagonal */}
          <div className="relative w-full max-w-[550px] mx-auto lg:pr-4 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both">
            <div 
              className="relative w-full p-[6px] rounded-[24px]"
              style={{
                background: "#01FC8D",
                clipPath: "polygon(-20px -20px, calc(100% + 20px) -20px, calc(100% + 20px) calc(100% - 90px), 100% calc(100% - 90px), calc(100% - 90px) 100%, calc(100% - 90px) calc(100% + 20px), -20px calc(100% + 20px))"
              }}
            >
              <div 
                className="relative w-full h-[450px] md:h-[600px] rounded-[18px] overflow-hidden bg-[#0a0e27]"
                style={{
                  clipPath: "polygon(-20px -20px, calc(100% + 20px) -20px, calc(100% + 20px) calc(100% - 86px), 100% calc(100% - 86px), calc(100% - 86px) 100%, calc(100% - 86px) calc(100% + 20px), -20px calc(100% + 20px))"
                }}
              >
                <img
                  src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/woman-computer-and-hacker-with-music-headphones-and-programming-for-cybersecurity-thinking-radio.jpg"
                  alt="Nossos Serviços"
                  className="w-full h-full object-cover opacity-90"
                  {...({ fetchPriority: "high" } as any)}
                />
              </div>
            </div>
          </div>

          {/* Lado Direito - Conteúdo */}
          <div className="space-y-8 lg:pl-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-both">
            <div>
              <div className="inline-flex flex-row items-center gap-3 mb-8 bg-[#0e132e] py-1.5 px-3 rounded border border-white/5">
                <div className="w-1 h-4 bg-[#01FC8D]"></div>
                <span className="text-xs font-semibold tracking-wider text-[#01FC8D] uppercase">
                  NOSSOS SERVIÇOS
                </span>
              </div>
              
              <h2 className="text-[2rem] md:text-[2.6rem] font-bold text-white mb-6 leading-tight tracking-normal">
                O Atlas é um lugar criado para <br className="hidden lg:block"/> você crescer
              </h2>

              <p className="text-base md:text-[17px] text-gray-400 mb-8 max-w-lg font-light leading-relaxed">
                Do iniciante ao profissional, nossos serviços atendem todos os perfis.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Card 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="flex items-center justify-between p-6 px-7 rounded-[12px] border border-white/5 bg-gradient-to-r from-[#11172f] to-[#171b31] shadow-2xl"
              >
                <div>
                  <h4 className="text-[#01FC8D] text-[10px] md:text-[11px] font-semibold tracking-widest uppercase mb-2 drop-shadow-md">
                    HOSPEDAGEM OTIMIZADA
                  </h4>
                  <p className="text-white text-[15px] md:text-[17px] font-semibold tracking-wide">
                    Simples, estável e inteligente
                  </p>
                </div>
                <CircularProgress value={37}>
                  <AtlasLogo className="w-5 h-5 text-[#01FC8D] object-contain drop-shadow-[0_0_8px_rgba(1,252,141,0.5)]" />
                </CircularProgress>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center justify-between p-6 px-7 rounded-[12px] border border-white/5 bg-gradient-to-r from-[#11172f] to-[#171b31] shadow-2xl"
              >
                <div>
                  <h4 className="text-[#01FC8D] text-[10px] md:text-[11px] font-semibold tracking-widest uppercase mb-2 drop-shadow-md">
                    COMPRA DE DOMÍNIOS
                  </h4>
                  <p className="text-white text-[15px] md:text-[17px] font-semibold tracking-wide">
                    Encontre e registre seu domínio com facilidade
                  </p>
                </div>
                <CircularProgress value={25}>
                  <Globe className="w-5 h-5 text-[#01FC8D] drop-shadow-[0_0_8px_rgba(1,252,141,0.5)]" strokeWidth={2} />
                </CircularProgress>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
