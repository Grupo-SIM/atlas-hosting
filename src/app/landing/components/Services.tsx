"use client";

import { Globe } from "lucide-react";
import AtlasLogo from "@/assets/atlas.svg";

function CircularProgress({
  value,
  children,
}: {
  value: number;
  children: React.ReactNode;
}) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full -rotate-90 drop-shadow-[0_0_8px_rgba(1,252,141,0.5)]">
        <circle
          className="stroke-white/5"
          cx="28"
          cy="28"
          fill="none"
          r="22"
          strokeWidth="3"
        />
        <circle
          className="stroke-[#01FC8D]"
          cx="28"
          cy="28"
          fill="none"
          r="22"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <div className="z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}

import { motion } from "motion/react";

export function Services() {
  const slideInLeft = {
    initial: { opacity: 0, x: -15 },
    transition: { duration: 0.25 },
    viewport: { margin: "200px", once: true },
    whileInView: { opacity: 1, x: 0 },
  };

  const slideInRight = {
    initial: { opacity: 0, x: 15 },
    transition: { duration: 0.25 },
    viewport: { margin: "200px", once: true },
    whileInView: { opacity: 1, x: 0 },
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0e27] px-4 py-24 pt-32"
      id="servicos"
    >
      <div className="container mx-auto max-w-7xl px-2 md:px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Lado Esquerdo - Imagem com corte diagonal */}
          <div className="fade-in slide-in-from-left-2 relative mx-auto w-full max-w-[550px] animate-in fill-mode-both duration-300 lg:pr-4">
            <div
              className="relative w-full rounded-[24px] p-[6px]"
              style={{
                background: "#01FC8D",
                clipPath:
                  "polygon(-20px -20px, calc(100% + 20px) -20px, calc(100% + 20px) calc(100% - 90px), 100% calc(100% - 90px), calc(100% - 90px) 100%, calc(100% - 90px) calc(100% + 20px), -20px calc(100% + 20px))",
              }}
            >
              <div
                className="relative h-[450px] w-full overflow-hidden rounded-[18px] bg-[#0a0e27] md:h-[600px]"
                style={{
                  clipPath:
                    "polygon(-20px -20px, calc(100% + 20px) -20px, calc(100% + 20px) calc(100% - 86px), 100% calc(100% - 86px), calc(100% - 86px) 100%, calc(100% - 86px) calc(100% + 20px), -20px calc(100% + 20px))",
                }}
              >
                <img
                  alt="Nossos Serviços"
                  className="h-full w-full object-cover opacity-90"
                  src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/woman-computer-and-hacker-with-music-headphones-and-programming-for-cybersecurity-thinking-radio.jpg"
                  {...({ fetchPriority: "high" } as any)}
                />
              </div>
            </div>
          </div>

          {/* Lado Direito - Conteúdo */}
          <div className="fade-in slide-in-from-bottom-2 animate-in space-y-8 fill-mode-both delay-150 duration-300 lg:pl-4">
            <div>
              <div className="mb-8 inline-flex flex-row items-center gap-3 rounded border border-white/5 bg-[#0e132e] px-3 py-1.5">
                <div className="h-4 w-1 bg-[#01FC8D]" />
                <span className="font-semibold text-[#01FC8D] text-xs uppercase tracking-wider">
                  NOSSOS SERVIÇOS
                </span>
              </div>

              <h2 className="mb-6 font-bold text-[2rem] text-white leading-tight tracking-normal md:text-[2.6rem]">
                O Atlas é um lugar criado para{" "}
                <br className="hidden lg:block" /> você crescer
              </h2>

              <p className="mb-8 max-w-lg font-light text-base text-gray-400 leading-relaxed md:text-[17px]">
                Do iniciante ao profissional, nossos serviços atendem todos os
                perfis.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Card 1 */}
              <motion.div
                className="flex items-center justify-between rounded-[12px] border border-white/5 bg-gradient-to-r from-[#11172f] to-[#171b31] p-6 px-7 shadow-2xl"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                viewport={{ margin: "-50px", once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h4 className="mb-2 font-semibold text-[#01FC8D] text-[10px] uppercase tracking-widest drop-shadow-md md:text-[11px]">
                    HOSPEDAGEM OTIMIZADA
                  </h4>
                  <p className="font-semibold text-[15px] text-white tracking-wide md:text-[17px]">
                    Simples, estável e inteligente
                  </p>
                </div>
                <CircularProgress value={37}>
                  <AtlasLogo className="h-5 w-5 object-contain text-[#01FC8D] drop-shadow-[0_0_8px_rgba(1,252,141,0.5)]" />
                </CircularProgress>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                className="flex items-center justify-between rounded-[12px] border border-white/5 bg-gradient-to-r from-[#11172f] to-[#171b31] p-6 px-7 shadow-2xl"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                viewport={{ margin: "-50px", once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h4 className="mb-2 font-semibold text-[#01FC8D] text-[10px] uppercase tracking-widest drop-shadow-md md:text-[11px]">
                    COMPRA DE DOMÍNIOS
                  </h4>
                  <p className="font-semibold text-[15px] text-white tracking-wide md:text-[17px]">
                    Encontre e registre seu domínio com facilidade
                  </p>
                </div>
                <CircularProgress value={25}>
                  <Globe
                    className="h-5 w-5 text-[#01FC8D] drop-shadow-[0_0_8px_rgba(1,252,141,0.5)]"
                    strokeWidth={2}
                  />
                </CircularProgress>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
