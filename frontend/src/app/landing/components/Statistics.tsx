"use client";

import { Roboto } from "next/font/google";
import CountUp from "./CountUp";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
});

const stats = [
  {
    label: "países alcançados",
    suffix: "",
    value: 190,
  },
  {
    label: "Clientes ao redor do mundo",
    suffix: "K+",
    value: 225,
  },
  {
    label: "Anos de Experiência no mercado",
    suffix: "+",
    value: 22,
  },
  {
    label: "Servidores rodando",
    suffix: "K+",
    value: 450,
  },
];

export function Statistics() {
  return (
    <section className="relative w-full overflow-hidden bg-transparent pt-8 md:pt-24">
      {/* World Map Background animation */}
      <div className="pointer-events-none absolute inset-0 z-[1] flex items-start justify-center overflow-hidden pt-0">
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(70%_55%_at_50%_22%,rgba(0,163,255,0.05)_0%,rgba(0,163,255,0.02)_36%,rgba(0,11,18,0)_78%)]" />
        <div className="w-[150%] max-w-[1700px] translate-y-[-10%] scale-[1.25] opacity-[0.55]">
          <LottieMap />
        </div>
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {/* Texto Principal */}
        <div className="fade-in slide-in-from-bottom-2 mb-12 animate-in fill-mode-both pt-8 text-center duration-300">
          <span className="mb-4 inline-flex items-center rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 font-semibold text-[14px] text-sky-400 uppercase tracking-[0.12em]">
            <span className="mr-2 h-2 w-2 rounded-full bg-sky-500" />
            Resultados Reais
          </span>
          <h2
            className={`${roboto.className} mb-5 font-bold text-[2.2rem] text-white leading-[1.05] tracking-tight md:text-[3.1rem]`}
          >
            Performance Garantida,
            <br className="hidden md:block" />
            preço justo, retorno real
          </h2>
          <p className="mx-auto mb-8 max-w-2xl font-medium text-base text-slate-400 delay-100 md:text-lg">
            Você trabalha muito, seu negócio merece um lugar que valorize isso!
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="mx-auto mb-24 grid w-full max-w-6xl grid-cols-1 justify-center gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#00050A] px-5 py-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all hover:translate-y-[-4px]"
              key={index}
            >
              {/* Persistent Bottom Bar */}
              <div className="absolute inset-x-0 bottom-0 h-[4px] bg-[#00A3FF] shadow-[0_0_15px_rgba(0,163,255,0.5)]" />

              <div className="mb-3">
                <span
                  className={`${roboto.className} flex items-baseline justify-center font-bold text-[42px] text-white tracking-tight md:text-[52px]`}
                >
                  <CountUp
                    className="count-up-text"
                    decimals={stat.value % 1 !== 0 ? 1 : 0}
                    direction="up"
                    duration={2}
                    from={0}
                    separator=""
                    to={stat.value}
                  />
                  <span>{stat.suffix}</span>
                </span>
              </div>
              <p className="font-bold text-[13px] text-white/60 uppercase tracking-[0.15em] md:text-[14px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
