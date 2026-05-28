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
    value: 190,
    suffix: "",
    label: "países alcançados",
  },
  {
    value: 225,
    suffix: "K+",
    label: "Clientes ao redor do mundo",
  },
  {
    value: 22,
    suffix: "+",
    label: "Anos de Experiência no mercado",
  },
  {
    value: 450,
    suffix: "K+",
    label: "Servidores rodando",
  },
];

export function Statistics() {
  return (
    <section className="bg-transparent relative w-full pt-8 md:pt-24 overflow-hidden">
      {/* World Map Background animation */}
      <div className="absolute inset-0 z-[1] pointer-events-none flex justify-center items-start pt-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_22%,rgba(0,163,255,0.05)_0%,rgba(0,163,255,0.02)_36%,rgba(0,11,18,0)_78%)] z-[2]" />
        <div className="w-[150%] max-w-[1700px] opacity-[0.55] scale-[1.25] translate-y-[-10%]">
          <LottieMap />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 px-4">
        {/* Texto Principal */}
        <div className="text-center mb-12 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          <span className="inline-flex items-center rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-[14px] font-semibold uppercase tracking-[0.12em] text-sky-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-500 mr-2" />
            Resultados Reais
          </span>
          <h2 className={`${roboto.className} text-[2.2rem] md:text-[3.1rem] font-bold text-white mb-5 leading-[1.05] tracking-tight`}>
            Performance Garantida,<br className="hidden md:block" />
            preço justo, retorno real
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-medium delay-100">
            Você trabalha muito, seu negócio merece um lugar que valorize isso!
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 w-full max-w-6xl mx-auto gap-4 md:gap-6 justify-center mb-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center justify-center text-center px-5 py-12 bg-[#00050A] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden group transition-all hover:translate-y-[-4px]"
            >
              {/* Persistent Bottom Bar */}
              <div className="absolute inset-x-0 bottom-0 h-[4px] bg-[#00A3FF] shadow-[0_0_15px_rgba(0,163,255,0.5)]" />
              
              <div className="mb-3">
                <span className={`${roboto.className} text-[42px] md:text-[52px] font-bold text-white flex items-baseline justify-center tracking-tight`}>
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
              <p className="text-white/60 text-[13px] md:text-[14px] tracking-[0.15em] font-bold uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

