"use client";

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
  oldPrice: string;
  newPrice: string;
  cents: string;
  vcpu: string;
  ram: string;
  storage: string;
  speed: string;
  popular?: boolean;
};

const storagePlans: StoragePlan[] = [
  {
    name: "VPS de Armazenamento 10",
    oldPrice: "R$ 49,48",
    newPrice: "R$ 39,",
    cents: "58",
    vcpu: "2 núcleos de vCPU",
    ram: "4 GB de RAM",
    storage: "SSD de 300 GB",
    speed: "Porta de 200 Mbit/s",
  },
  {
    name: "VPS de Armazenamento 20",
    oldPrice: "R$ 79,45",
    newPrice: "R$ 63,",
    cents: "56",
    vcpu: "3 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "SSD de 400 GB",
    speed: "Porta de 300 Mbit/s",
    popular: true,
  },
  {
    name: "VPS de Armazenamento 30",
    oldPrice: "R$ 149,90",
    newPrice: "R$ 119,",
    cents: "92",
    vcpu: "6 núcleos de vCPU",
    ram: "18 GB de RAM",
    storage: "SSD de 1 TB",
    speed: "Porta de 600 Mbit/s",
  },
  {
    name: "VPS de Armazenamento 40",
    oldPrice: "R$ 259,83",
    newPrice: "R$ 207,",
    cents: "86",
    vcpu: "8 núcleos de vCPU",
    ram: "30 GB de RAM",
    storage: "SSD de 1,2 TB",
    speed: "Porta de 800 Mbit/s",
  },
  {
    name: "VPS de Armazenamento 50",
    oldPrice: "R$ 459,68",
    newPrice: "R$ 367,",
    cents: "74",
    vcpu: "14 núcleos de vCPU",
    ram: "50 GB de RAM",
    storage: "SSD de 1,4 TB",
    speed: "Porta de 1 Gbit/s",
  },
];

export function VpsStoragePage() {
  return (
    <section className="relative overflow-hidden bg-[#0a0e27] px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_0%,rgba(1,252,141,0.14)_0%,rgba(1,252,141,0)_70%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1700px)] mt-[6rem]">
        <div className="flex flex-col justify-start pb-4 md:pb-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/15 bg-[#0e132e] px-3 py-1.5">
              <HardDrive className="h-4 w-4 text-[#01FC8D]" />
              <span className={`${roboto.className} text-xs font-bold uppercase tracking-wider text-[#01FC8D]`}>
                Nova linha de VPS de armazenamento
              </span>
            </div>

            <h1 className={`${roboto.className} max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl`}>
              Melhor VPS com armazenamento SSD pelo menor preço
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
              Obtenha muito espaço de armazenamento com o melhor custo-benefício do mercado. Nosso VPS para
              armazenamento pode ser usado para qualquer aplicação ou projeto.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-3 scrollbar-thin md:mt-5">
          <div className="flex min-w-[1180px] gap-4 md:justify-center">
            {storagePlans.map((plan) => (
              <article
                key={plan.name}
                className={`w-[230px] shrink-0 overflow-hidden rounded-xl border bg-[#0d1225] ${plan.popular
                    ? "border-[#01FC8D]/60 shadow-[0_0_28px_rgba(1,252,141,0.06)]"
                    : "border-white/10"
                  }`}
              >
                <div className="relative p-3.5">
                  {plan.popular ? (
                    <span className={`${roboto.className} absolute right-2.5 top-2.5 rounded bg-[#ff8f2b] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white`}>
                      Valor imbatível
                    </span>
                  ) : null}
                  <p className={`${roboto.className} pr-[4.5rem] text-[13px] font-bold tracking-wide text-white`}>
                    {plan.name}
                  </p>
                  <p className="mt-2 text-xs font-medium text-[#ff4d4d]/90 line-through">{plan.oldPrice}</p>
                  <p className="mt-0.5 leading-none text-white">
                    <span className="text-4xl font-extrabold">{plan.newPrice}</span>
                    <span className="align-top text-lg font-bold">{plan.cents}</span>
                    <span className="ml-1 text-[10px] font-medium text-gray-400">/mês</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-light leading-snug text-gray-500">por um período de 12 meses</p>
                  <Link
                    href={`https://wa.me/558398849027?text=${encodeURIComponent(`Olá! Escolhi o plano ${plan.name} e gostaria de dar continuidade ao processo.`)}`}
                    target="_blank"
                    className={`${roboto.className} mt-3 block w-full rounded-md border border-white/20 bg-transparent py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/5`}
                  >
                    Começar agora →
                  </Link>
                </div>

                <div className="space-y-0 border-t border-white/10 text-[11px] text-gray-300 md:text-xs">
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold first:border-t-0">{plan.vcpu}</p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">{plan.ram}</p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">{plan.storage}</p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">{plan.speed}</p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">Tráfego ilimitado*</p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold text-[#01FC8D]">100% de cashback</p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold text-[#38bdf8]">Suporte 24/7</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl text-center">
          <h3 className={`${roboto.className} text-3xl font-semibold tracking-tight text-white md:text-[2.2rem]`}>
            9 regiões, 11 localidades, disponibilidade global.
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-300">
            Dos EUA ao Reino Unido, da Europa à Ásia e Austrália, escolha a localização ideal para baixa latência em todo o mundo.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-[#0d1225] p-6 md:p-8">
          <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_50%_50%,#101933_0%,#0d152d_55%,#0b1228_100%)] p-6 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:36px_36px]" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <LottieMap />
            </div>
            <div className="relative min-h-[300px] md:min-h-[360px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
