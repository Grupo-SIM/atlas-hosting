"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cpu, HardDrive, ShieldCheck, Wallet } from "lucide-react";
import { Roboto } from "next/font/google";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type VdsPlan = {
  name: string;
  eurOld: number;
  eurNew: number;
  cores: string;
  cpu: string;
  ram: string;
  storage: string;
  speed: string;
};

const vdsPlans: VdsPlan[] = [
  {
    name: "Cloud VDS S",
    eurOld: 68.80,
    eurNew: 55.04,
    cores: "3 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "24 GB de RAM",
    storage: "NVMe de 180 GB",
    speed: "Porta de 250 Mbit/s",
  },
  {
    name: "Cloud VDS M",
    eurOld: 89.60,
    eurNew: 71.68,
    cores: "4 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "32 GB de RAM",
    storage: "NVMe de 240 GB",
    speed: "Porta de 500 Mbit/s",
  },
  {
    name: "Cloud VDS L",
    eurOld: 128.00,
    eurNew: 102.40,
    cores: "6 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "48 GB de RAM",
    storage: "NVMe de 360 GB",
    speed: "Porta de 750 Mbit/s",
  },
  {
    name: "Cloud VDS XL",
    eurOld: 164.80,
    eurNew: 131.84,
    cores: "8 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "64 GB de RAM",
    storage: "NVMe de 480 GB",
    speed: "Porta de 1 Gbit/s",
  },
  {
    name: "Cloud VDS XXL",
    eurOld: 238.00,
    eurNew: 190.40,
    cores: "12 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "96 GB de RAM",
    storage: "NVMe de 720 GB",
    speed: "Porta de 1 Gbit/s",
  },
];

export function VdsPage() {
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

  return (
    <section className="relative overflow-hidden bg-transparent px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1760px)] mt-[2rem]">
        <div className="flex flex-col justify-start pb-4 md:pb-6">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 shadow-xl backdrop-blur-md">
              <Wallet className="h-4 w-4 text-sky-500" />
              <span className={`${roboto.className} text-xs font-bold uppercase tracking-wider text-sky-400`}>
                Cloud VDS por menos
              </span>
            </div>

            <h1 className={`${roboto.className} mx-auto max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl uppercase tracking-tight`}>
              Servidores Virtuais <span className="text-sky-500">Dedicados</span>:
              <br />
              O Equilíbrio Perfeito
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
              Obtenha o melhor dos dois mundos: VPS em nuvem e servidores dedicados, com ótimo preço. Cada VPS inclui:
            </p>

            <ul className="mx-auto mt-6 max-w-3xl space-y-3 text-left text-base text-slate-300">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                100% de RAM dedicada - sem compartilhamento, apenas velocidade.
              </li>
              <li className="flex items-start gap-2.5">
                <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                Processadores AMD de última geração - núcleos físicos dedicados.
              </li>
              <li className="flex items-start gap-2.5">
                <HardDrive className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                Armazenamento SSD NVMe de nível empresarial.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-3 scrollbar-thin md:mt-5">
          <div className="flex min-w-[1180px] gap-4 md:justify-center">
            {vdsPlans.map((plan) => {
              const formattedPrice = formatBRL(plan.eurNew).replace(/\u00A0/g, " ");
              const priceParts = formattedPrice.split(" ");
              const priceSymbol = priceParts[0];
              const priceValue = priceParts.slice(1).join("");
              const [priceMain, priceCents] = priceValue.split(",");

              return (
              <article
                key={plan.name}
                className="w-[230px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md"
              >
                <div className="p-3.5">
                  <p className={`${roboto.className} text-[13px] font-bold tracking-wide text-white`}>{plan.name}</p>
                  <p className="mt-2 text-xs font-medium text-rose-500 line-through opacity-70">{formatBRL(plan.eurOld)}</p>
                  <div className="mt-0.5 flex items-baseline gap-0.5 whitespace-nowrap leading-none text-white">
                    <span className="text-[12px] font-bold mb-0.5">{priceSymbol}</span>
                    <span className="text-xl font-extrabold md:text-4xl">{priceMain},</span>
                    <span className="text-xl font-bold">{priceCents}</span>
                    <span className="ml-1 text-[10px] font-medium text-slate-400">/mês</span>
                  </div>
                  <p className="mt-0.5 text-[10px] font-light leading-snug text-slate-400">12 meses</p>
                  <button
                    onClick={() => {
                      const planId = plan.name.split(" ").pop()?.toLowerCase();
                      const supportedPlans = ["s", "m", "l", "xl", "xxl"];
                      if (supportedPlans.includes(planId || "")) {
                        router.push(`/vds/configure/${planId}`);
                      } else {
                        window.open(`https://wa.me/558398849027?text=${encodeURIComponent(`Olá! Escolhi o plano ${plan.name} e gostaria de dar continuidade ao processo.`)}`, "_blank");
                      }
                    }}
                    className={`${roboto.className} mt-3 block w-full rounded-md border border-white/10 bg-white/5 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-300 transition-all hover:bg-white/10 hover:text-white`}
                  >
                    Começar agora →
                  </button>
                </div>

                <div className="space-y-0 border-t border-white/10 text-[11px] text-slate-300 md:text-xs">
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold first:border-t-0 text-white">{plan.cores}</p>
                  <p className="border-t border-white/5 px-3 py-2.5 text-slate-400 font-medium">{plan.cpu}</p>
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold text-white">{plan.ram}</p>
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold text-white">{plan.storage}</p>
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold text-white">{plan.speed}</p>
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold text-white">Tráfego ilimitado*</p>
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold text-sky-400 uppercase tracking-wider text-[10px] font-extrabold">100% de cashback</p>
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold text-sky-500 uppercase tracking-wider text-[10px] font-extrabold">Suporte 24/7 Ativo</p>
                </div>
              </article>
            )})}
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-2xl backdrop-blur-md">
          <h3 className={`${roboto.className} text-2xl font-black text-white md:text-[2rem] uppercase`}>Firewall <span className="text-sky-500">Grátis</span> Incluso</h3>
          <p className="mt-2 text-lg text-slate-300">
            Bloqueie tráfego indesejado e defina regras personalizadas no seu Painel de Controle do Cliente.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl text-center">
          <h3 className={`${roboto.className} text-3xl font-black tracking-tight text-white md:text-[2.2rem] uppercase`}>
            9 regiões, 11 localidades, <span className="text-sky-500">disponibilidade global</span>.
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-300">
            Dos EUA ao Reino Unido, da Europa à Ásia e Austrália, escolha a localização ideal para baixa latência em todo o mundo.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl backdrop-blur-md">
          <div className="relative overflow-hidden rounded-2xl bg-[#000B12]/50 p-6 md:p-10 border border-white/5">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:36px_36px]" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40 mix-blend-screen">
              <LottieMap />
            </div>
            <div className="relative min-h-[300px] md:min-h-[360px]" />
          </div>
        </div>

      </div>
    </section>
  );
}
