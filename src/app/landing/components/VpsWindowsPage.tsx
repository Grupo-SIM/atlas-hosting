"use client";

import { Fragment, useState, useEffect } from "react";
import { Check, Star, Wallet, Rocket, MessageCircle, Globe2 } from "lucide-react";
import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type WindowsPlan = {
  id: string;
  name: string;
  eurOld: number;
  eurNew: number;
  vcpu: string;
  ram: string;
  storage: string;
  snapshots: string;
  speed: string;
  noSetupFee?: boolean;
  popular?: boolean;
};

const windowsPlans: WindowsPlan[] = [
  {
    id: "10",
    name: "Windows VPS 10",
    eurOld: 32.00,
    eurNew: 25.60,
    vcpu: "4 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1 Instantâneo",
    speed: "Porta de 200 Mbit/s",
    noSetupFee: true,
  },
  {
    id: "20",
    name: "Windows VPS 20",
    eurOld: 58.00,
    eurNew: 46.40,
    vcpu: "6 núcleos de vCPU",
    ram: "16 GB de RAM",
    storage: "100 GB NVMe ou SSD 200 GB",
    snapshots: "2 Instantâneos",
    speed: "Porta de 400 Mbit/s",
    noSetupFee: true,
    popular: true,
  },
  {
    id: "30",
    name: "Windows VPS 30",
    eurOld: 112.00,
    eurNew: 89.60,
    vcpu: "10 núcleos de vCPU",
    ram: "32 GB de RAM",
    storage: "200 GB NVMe ou SSD 400 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 600 Mbit/s",
    noSetupFee: true,
  },
  {
    id: "40",
    name: "Windows VPS 40",
    eurOld: 238.00,
    eurNew: 218.40,
    vcpu: "18 núcleos de vCPU",
    ram: "96 GB de RAM",
    storage: "350 GB NVMe ou SSD 700 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 1 Gbit/s",
    noSetupFee: true,
  },
];

const bullets = [
  "Ambiente Windows nativo e otimizado",
  "Tráfego ilimitado até 1 Gbit/s",
  "Proteção DDoS sempre ativa",
];

export function VpsWindowsPage() {
  const router = useRouter();
  const [currentRate, setCurrentRate] = useState(5.86);

  useEffect(() => {
    fetch("/api/currency/euro")
      .then(res => res.json())
      .then(data => {
        if (data.rate) {
          setCurrentRate(data.rate);
        }
      })
      .catch(err => console.error("Error fetching rate:", err));
  }, []);

  const formatBRL = (eur: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(eur * currentRate);
  };

  const gridCols = `minmax(14.5rem, 16rem) repeat(${windowsPlans.length}, minmax(0, 1fr))`;

  return (
    <div className="w-full min-w-0 bg-transparent">
      <section className="relative bg-transparent px-4 py-8 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1760px)] px-0 mt-[2rem]">
          <div className="flex flex-col justify-start pb-4 md:pb-6">
            <div className="mx-auto max-w-3xl text-left w-full">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded border border-white/20 bg-white/5 px-3 py-1.5 shadow-xl backdrop-blur-md">
                <span className={`${roboto.className} text-[11px] font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2`}>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                  VPS Windows
                </span>
              </div>
              <h1
                className={`${roboto.className} text-left text-3xl font-black leading-tight tracking-tight text-white md:text-[3rem] uppercase`}
              >
                Servidor VPS <br /><span className="text-sky-500">Windows</span> <br />Acessível e rápido
              </h1>
              <ul className="mx-auto mt-6 max-w-xl space-y-3 text-left text-base text-slate-400">
                {bullets.map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" strokeWidth={2.5} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mr-auto mt-8 flex max-w-2xl flex-wrap items-center justify-start gap-3 text-base text-slate-400">
                <span className="text-white font-medium">Nossos clientes dizem</span>
                <span className="font-semibold text-white">Excelente</span>
                <span className="flex text-sky-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                </span>
                <span className="text-slate-500">4,5 de 5 com base em 9.032 avaliações</span>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto overflow-y-visible pt-1 pb-4 scrollbar-thin md:mt-5">
            <div
              className="grid w-full min-w-[1300px] gap-x-3 gap-y-0 md:min-w-full"
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* corner */}
              <div className="md:sticky md:left-0 md:z-20 rounded-tl-xl border border-white/20 border-b-0 bg-[#000B12] p-3 text-left shadow-xl backdrop-blur-md">
                <p className={`${roboto.className} text-base font-bold uppercase tracking-wide text-white`}>
                  Especificações da máquina
                </p>
              </div>
              {windowsPlans.map((p, idx) => {
                const formattedPrice = formatBRL(p.eurNew).replace(/\u00A0/g, " ");
                const priceParts = formattedPrice.split(" ");
                const priceSymbol = priceParts[0];
                const priceValue = priceParts.slice(1).join("");
                const [priceMain, priceCents] = priceValue.split(",");

                return (
                  <div
                    key={p.id}
                    className={`relative overflow-hidden rounded-t-xl border-l border-r border-t border-b border-white/10 p-3.5 shadow-2xl backdrop-blur-md ${
                      p.popular ? "border-sky-500 bg-[#01101A]" : "border-white/20 bg-[#01101A]"
                    } ${idx === windowsPlans.length - 1 ? "rounded-tr-xl" : ""}`}
                  >
                    {p.popular ? (
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`${roboto.className} rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white`}
                        >
                          Mais vendido
                        </span>
                      </div>
                    ) : null}
                    <p className={`${roboto.className} pr-[4.5rem] text-lg font-bold tracking-wide text-white`}>{p.name}</p>
                    <div className="mt-2 flex flex-wrap items-end gap-1.5">
                      <span className="text-xs font-medium text-rose-500 line-through opacity-70">{formatBRL(p.eurOld)}</span>
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-0.5 whitespace-nowrap">
                      <span className="text-[12px] font-bold text-white mb-0.5">{priceSymbol}</span>
                      <span className="text-2xl font-extrabold leading-none tracking-tight text-white md:text-5xl">
                        {priceMain},
                      </span>
                      <span className="text-xl font-bold text-white md:text-2xl">{priceCents}</span>
                      <span className="text-xs font-medium text-slate-400 ml-1">/mês</span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-light leading-snug text-slate-400">12 meses</p>
                    <button
                      onClick={() => router.push(`/vps-windows/configure/${p.id}`)}
                      className={`${roboto.className} mt-3 block w-full rounded-md py-2 text-center text-[11px] font-bold uppercase tracking-wide transition-all ${p.popular
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
                          : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      Começar agora →
                    </button>
                    <p className="mt-2 text-xs font-semibold text-sky-400 uppercase tracking-wide">100% de cashback</p>
                    <p className="mt-1 text-xs font-semibold text-sky-500 uppercase tracking-wide">Suporte 24/7 Ativo</p>
                  </div>
                );
              })}

              {[
                { label: "Núcleos de vCPU", key: "vcpu" as const },
                { label: "RAM (GB)", key: "ram" as const },
                {
                  label: "NVMe (GB) / SSD (GB)",
                  key: "storage" as const,
                },
                { label: "Instantâneos", key: "snapshots" as const },
                { label: "Tráfego (entrada ilimitada)", key: "speed" as const },
              ].map((row) => (
                <Fragment key={row.key}>
                  <div
                    className={`md:sticky md:left-0 md:z-20 flex flex-col justify-center border border-white/20 border-t-0 bg-[#000B12] p-3 text-left shadow-xl backdrop-blur-md ${row.key === "speed" ? "rounded-b-xl border-b" : ""
                      }`}
                  >
                    <span className="text-lg font-bold leading-tight text-white">{row.label}</span>
                  </div>
                  {windowsPlans.map((p, colIdx) => (
                    <div
                      key={`${row.key}-${p.id}`}
                      className={`flex items-center px-2 py-3 text-center text-xl font-bold leading-snug text-white border-l border-r border-t-0 border-b border-white/10 ${
                        p.popular ? "border-sky-500 bg-[#01101A]" : "border-white/20 bg-[#01101A]"
                      } ${row.key === "speed" ? "rounded-b-xl border-b-white/20" : ""}`}
                    >
                      <span className="w-full">{p[row.key]}</span>
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-end md:text-left">
            <p className="text-sm text-slate-500 md:text-right font-medium">
              Precisa de ajuda com Windows? <Link href="#faq" className="font-bold text-sky-400 underline-offset-4 hover:underline decoration-sky-500/30">Fale conosco</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-[min(92vw,1280px)]">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className={`${roboto.className} text-4xl font-black tracking-tight text-white md:text-[2.8rem] uppercase`}>
              Construído pensando nas suas <span className="text-sky-500">necessidades</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-400">
              Projetamos todos os nossos planos de VPS para oferecer o valor e o desempenho que seus projetos exigem.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Performance</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Infraestrutura otimizada para workloads Windows.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Rapidez</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Provisionamento instantâneo do seu servidor.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Suporte</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Time especializado em Windows Server 24/7.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Global</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Disponível em todas as nossas regiões.
                </p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="mx-auto mt-24 max-w-5xl text-center">
            <h3 className={`${roboto.className} text-4xl font-black tracking-tight text-white md:text-[3.5rem] uppercase leading-[1.05]`}>
              9 regiões, 11 localidades,<br />
              <span className="text-sky-500">disponibilidade global</span>.
            </h3>
            <p className="mx-auto mt-8 max-w-3xl text-xl text-slate-300 font-medium leading-relaxed">
              Dos EUA ao Reino Unido, da Europa à Ásia e Austrália, escolha a localização ideal para baixa latência em todo o mundo.
            </p>
          </div>

          {/* Map Section - Alone, like in home route */}
          <div className="relative mt-0 py-24 overflow-hidden">
            <div className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center opacity-40">
              <div className="w-[150%] max-w-[1600px] scale-[1.3]">
                <LottieMap />
              </div>
            </div>
            {/* Spacer to give height */}
            <div className="relative min-h-[400px] md:min-h-[500px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
