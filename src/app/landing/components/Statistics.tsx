"use client";

import CountUp from "./CountUp";
import { Roboto } from 'next/font/google';
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto"
});

const stats = [
  {
    value: 4,
    suffix: "K+",
    label: "Sites desenvolvidos",
  },
  {
    value: 2,
    suffix: "K+",
    label: "Clientes satisfeitos",
  },
  {
    value: 12,
    suffix: "+",
    label: "Anos de Experiência no mercado",
  },
  {
    value: 4.9,
    suffix: "/5",
    label: "Avaliação média",
  },
];

export function Statistics() {
  return (
    <section className="bg-slate-50 relative w-full pt-24 overflow-hidden">
      {/* World Map Background animation */}
      <div className="absolute inset-0 z-[1] pointer-events-none flex justify-center items-start pt-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_22%,rgba(16,185,129,0.05)_0%,rgba(16,185,129,0.02)_36%,rgba(248,250,252,0)_78%)] z-[2]" />
        <div className="w-[150%] max-w-[1700px] opacity-[0.08] scale-[1.25] translate-y-[-10%]">
          <LottieMap />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 px-4">
        {/* Texto Principal */}
        <div className="text-center mb-12 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600 mb-4">
            Resultados Reais
          </span>
          <h2 className={`${roboto.className} text-[2.2rem] md:text-[3.1rem] font-bold text-slate-900 mb-5 leading-[1.05] tracking-tight`}>
            Performance Garantida,<br className="hidden md:block" />
            preço justo, retorno real
          </h2>
          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-8 font-medium delay-100">
            Você trabalha muito, seu negócio merece um lugar que valorize isso!
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 w-full max-w-6xl mx-auto gap-3 md:gap-4 justify-center mb-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center justify-center text-center px-5 py-10 bg-white border border-slate-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
              <div className="mb-2">
                <span className={`${roboto.className} text-[38px] md:text-[46px] font-bold text-emerald-500 flex items-baseline justify-center`}>
                  <CountUp
                    from={0}
                    to={stat.value}
                    separator=""
                    direction="up"
                    duration={2}
                    decimals={stat.value % 1 !== 0 ? 1 : 0}
                    className="count-up-text"
                  />
                  <span>{stat.suffix}</span>
                </span>
              </div>
              <p className="text-slate-500 text-[11px] md:text-[12px] tracking-[0.08em] font-semibold uppercase opacity-85">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

