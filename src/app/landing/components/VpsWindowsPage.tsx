"use client";

import Link from "next/link";
import { Check, MonitorCog } from "lucide-react";
import { Rajdhani } from "next/font/google";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type WindowsPlan = {
  name: string;
  oldPrice: string;
  newPrice: string;
  cents: string;
  vcpu: string;
  ram: string;
  storage: string;
  snapshots: string;
  speed: string;
};

const windowsPlans: WindowsPlan[] = [
  {
    name: "Cloud VPS 10",
    oldPrice: "R$ 165,63",
    newPrice: "R$ 132,",
    cents: "50",
    vcpu: "4 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1 Instantâneo",
    speed: "Porta de 200 Mbit/s",
  },
  {
    name: "Cloud VPS 20",
    oldPrice: "R$ 318,03",
    newPrice: "R$ 254,",
    cents: "42",
    vcpu: "6 núcleos de vCPU",
    ram: "12 GB de RAM",
    storage: "NVMe de 100 GB ou SSD 200 GB",
    snapshots: "2 Instantâneos",
    speed: "Porta de 300 Mbit/s",
  },
  {
    name: "Cloud VPS 30",
    oldPrice: "R$ 549,63",
    newPrice: "R$ 439,",
    cents: "70",
    vcpu: "8 núcleos de vCPU",
    ram: "24 GB de RAM",
    storage: "NVMe de 200 GB ou SSD 400 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 600 Mbit/s",
  },
  {
    name: "Cloud VPS 40",
    oldPrice: "R$ 1.013,05",
    newPrice: "R$ 810,",
    cents: "44",
    vcpu: "12 núcleos de vCPU",
    ram: "48 GB de RAM",
    storage: "NVMe de 250 GB ou SSD 500 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 800 Mbit/s",
  },
  {
    name: "Cloud VPS 50",
    oldPrice: "R$ 1.359,08",
    newPrice: "R$ 1.087,",
    cents: "26",
    vcpu: "16 núcleos de vCPU",
    ram: "64 GB de RAM",
    storage: "NVMe de 300 GB ou SSD 600 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 1 Gbit/s",
  },
  {
    name: "Cloud VPS 60",
    oldPrice: "R$ 1.666,38",
    newPrice: "R$ 1.333,",
    cents: "10",
    vcpu: "18 núcleos de vCPU",
    ram: "96 GB de RAM",
    storage: "NVMe de 350 GB ou SSD 700 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 1 Gbit/s",
  },
];

export function VpsWindowsPage() {
  return (
    <section className="relative overflow-hidden bg-[#0a0e27] px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_0%,rgba(1,252,141,0.14)_0%,rgba(1,252,141,0)_70%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1700px)] mt-[6rem]">
        <div className="flex flex-col justify-start pb-4 md:pb-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/15 bg-[#0e132e] px-3 py-1.5">
            <MonitorCog className="h-4 w-4 text-[#01FC8D]" />
            <span className={`${rajdhani.className} text-xs font-bold uppercase tracking-wider text-[#01FC8D]`}>
              VPS Windows
            </span>
          </div>

          <h1 className={`${rajdhani.className} mx-auto max-w-5xl text-4xl font-bold leading-tight text-white md:text-6xl`}>
            Servidor VPS Windows - Acessível, rápido e flexível
          </h1>

          <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed text-gray-300 md:text-lg">
            Hospedagem VPS Windows escalável, projetada para todos — de iniciantes a profissionais de tecnologia.
            Desfrute de configuração rápida, desempenho consistente e soluções seguras.
          </p>
        </div>
        </div>

        <div className="mx-auto mt-4 w-full max-w-5xl rounded-2xl border border-white/10 bg-[linear-gradient(90deg,#0b1b38_0%,#0a1c3d_45%,#0a1730_100%)] px-6 py-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:mt-5">
          <h3 className={`${rajdhani.className} text-2xl font-bold text-white md:text-[2rem]`}>Windows Server Incluso</h3>
          <p className="mt-1 text-lg text-[#8cb7de]">
            VPS com ambiente Windows pronto para aplicações, RDP e workloads corporativos.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto pb-3 scrollbar-thin md:mt-5">
          <div className="flex min-w-[1380px] gap-4 md:justify-center">
            {windowsPlans.map((plan) => (
              <article
                key={plan.name}
                className="w-[230px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0d1225]"
              >
                <div className="p-3.5">
                  <p className={`${rajdhani.className} text-[13px] font-bold tracking-wide text-white`}>{plan.name}</p>
                  <p className="mt-1 text-sm font-bold text-gray-300">Servidor Windows</p>
                  <p className="mt-2 text-xs font-medium text-[#ff4d4d]/90 line-through">{plan.oldPrice}</p>
                  <p className="mt-0.5 leading-none text-white">
                    <span className="text-4xl font-extrabold">{plan.newPrice}</span>
                    <span className="align-top text-lg font-bold">{plan.cents}</span>
                    <span className="ml-1 text-[10px] font-medium text-gray-400">/mês</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-light leading-snug text-gray-500">por um período de 12 meses</p>
                  <Link
                    href={`https://wa.me/558398849027?text=${encodeURIComponent(`Olá! Escolhi o plano Windows ${plan.name} e gostaria de dar continuidade ao processo.`)}`}
                    target="_blank"
                    className={`${rajdhani.className} mt-3 block w-full rounded-md border border-white/20 bg-transparent py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/5`}
                  >
                    Começar agora →
                  </Link>
                </div>

                <div className="space-y-0 border-t border-white/10 text-[11px] text-gray-300 md:text-xs">
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold first:border-t-0">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-[#f5be2f]" />
                      {plan.vcpu}
                    </span>
                  </p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-[#f5be2f]" />
                      {plan.ram}
                    </span>
                  </p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-[#f5be2f]" />
                      {plan.storage}
                    </span>
                  </p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-[#f5be2f]" />
                      {plan.snapshots}
                    </span>
                  </p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-[#f5be2f]" />
                      {plan.speed}
                    </span>
                  </p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-[#f5be2f]" />
                      Tráfego ilimitado*
                    </span>
                  </p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold text-[#01FC8D]">100% de cashback</p>
                  <p className="border-t border-white/10 px-3 py-2.5 font-semibold text-[#38bdf8]">Suporte 24/7</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl text-center">
          <h3 className={`${rajdhani.className} text-3xl font-semibold tracking-tight text-white md:text-[2.2rem]`}>
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
              <img
                src="/6864935_23322.jpg"
                alt=""
                aria-hidden="true"
                className="h-[115%] w-[115%] object-contain"
              />
            </div>
            <div className="relative min-h-[300px] md:min-h-[360px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
