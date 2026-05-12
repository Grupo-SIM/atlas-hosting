"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HardDrive, ShieldCheck } from "lucide-react";
import { Roboto } from "next/font/google";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type StoragePlan = {
  name: string;
  eurOld: number;
  eurNew: number;
  vcpu: string;
  ram: string;
  storage: string;
  speed: string;
  popular?: boolean;
};

const storagePlans: StoragePlan[] = [
  {
    name: "Storage VPS 10 (S)",
    eurOld: 9.00,
    eurNew: 7.20,
    vcpu: "2 núcleos de vCPU",
    ram: "4 GB de RAM",
    storage: "300 GB SSD",
    speed: "Porta de 200 Mbit/s",
  },
  {
    name: "Storage VPS 20 (M)",
    eurOld: 14.00,
    eurNew: 11.20,
    vcpu: "3 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "400 GB SSD",
    speed: "Porta de 300 Mbit/s",
    popular: true,
  },
  {
    name: "Storage VPS 30 (L)",
    eurOld: 28.00,
    eurNew: 22.40,
    vcpu: "6 núcleos de vCPU",
    ram: "18 GB de RAM",
    storage: "1 TB SSD",
    speed: "Porta de 600 Mbit/s",
  },
  {
    name: "Storage VPS 40 (XL)",
    eurOld: 50.00,
    eurNew: 40.00,
    vcpu: "8 núcleos de vCPU",
    ram: "30 GB de RAM",
    storage: "1.2 TB SSD",
    speed: "Porta de 800 Mbit/s",
  },
  {
    name: "Storage VPS 50 (XXL)",
    eurOld: 74.00,
    eurNew: 59.20,
    vcpu: "14 núcleos de vCPU",
    ram: "50 GB de RAM",
    storage: "1.4 TB SSD",
    speed: "Porta de 1 Gbit/s",
  },
];

export function VpsStoragePage() {
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
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 shadow-xl backdrop-blur-md">
              <HardDrive className="h-4 w-4 text-sky-500" />
              <span className={`${roboto.className} text-xs font-bold uppercase tracking-wider text-sky-400`}>
                Nova linha de VPS de armazenamento
              </span>
            </div>

            <h1 className={`${roboto.className} max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl uppercase tracking-tight`}>
              Melhor VPS com <span className="text-sky-500">armazenamento SSD</span> pelo menor preço
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
              Obtenha muito espaço de armazenamento com o melhor custo-benefício do mercado. Nosso VPS para
              armazenamento pode ser usado para qualquer aplicação ou projeto.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-3 scrollbar-thin md:mt-5">
          <div className="flex min-w-[1180px] gap-4 md:justify-center">
            {storagePlans.map((plan) => {
              const formattedNewPrice = formatBRL(plan.eurNew).replace(/\u00A0/g, " ");
              const [newMain, newCents] = formattedNewPrice.split(",");

              return (
              <article
                key={plan.name}
                className={`w-[230px] shrink-0 overflow-hidden rounded-xl border shadow-2xl backdrop-blur-md ${plan.popular
                    ? "border-sky-500/60 bg-white/10 ring-1 ring-sky-500/10"
                    : "border-white/10 bg-white/5"
                  }`}
              >
                <div className="relative p-3.5">
                  {plan.popular ? (
                    <span className={`${roboto.className} absolute right-2.5 top-2.5 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm`}>
                      Valor imbatível
                    </span>
                  ) : null}
                  <p className={`${roboto.className} pr-[4.5rem] text-[13px] font-bold tracking-wide text-white`}>
                    {plan.name}
                  </p>
                  <p className="mt-2 text-xs font-medium text-rose-500 line-through opacity-70">{formatBRL(plan.eurOld)}</p>
                  <p className="mt-0.5 leading-none text-white">
                    <span className="text-4xl font-extrabold">{newMain},</span>
                    <span className="align-top text-lg font-bold">{newCents}</span>
                    <span className="ml-1 text-[10px] font-medium text-slate-400">/mês</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-light leading-snug text-slate-400">por um período de 12 meses</p>
                  <Link
                    href={`/vps-armazenamento/configure/${plan.name.match(/\d+/)?.[0] || "10"}`}
                    className={`${roboto.className} mt-3 block w-full rounded-md border border-white/10 bg-white/5 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-300 transition-all hover:bg-white/10 hover:text-white`}
                  >
                    Começar agora →
                  </Link>
                </div>

                <div className="space-y-0 border-t border-white/10 text-[11px] text-slate-300 md:text-xs">
                  <p className="border-t border-white/5 px-3 py-2.5 font-bold first:border-t-0 text-white">{plan.vcpu}</p>
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
