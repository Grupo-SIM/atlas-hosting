"use client";

import Link from "next/link";
import { Check, MonitorCog } from "lucide-react";
import { Roboto } from "next/font/google";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
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

const windowsPlans = [
  {
    id: "10",
    name: "Cloud VPS 10 (S)",
    oldPrice: "R$ 174,79",
    newPrice: "R$ 139,",
    cents: "83",
    vcpu: "4 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1 Instantâneo",
    speed: "Porta de 200 Mbit/s",
  },
  {
    id: "20",
    name: "Cloud VPS 20 (M)",
    oldPrice: "R$ 210,85",
    newPrice: "R$ 168,",
    cents: "68",
    vcpu: "6 núcleos de vCPU",
    ram: "12 GB de RAM",
    storage: "100 GB NVMe ou SSD 200 GB",
    snapshots: "2 Instantâneos",
    speed: "Porta de 300 Mbit/s",
  },
  {
    id: "30",
    name: "Cloud VPS 30 (L)",
    oldPrice: "R$ 311,83",
    newPrice: "R$ 249,",
    cents: "46",
    vcpu: "8 núcleos de vCPU",
    ram: "24 GB de RAM",
    storage: "200 GB NVMe ou SSD 400 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 600 Mbit/s",
  },
  {
    id: "40",
    name: "Cloud VPS 40 (XL)",
    oldPrice: "R$ 470,50",
    newPrice: "R$ 376,",
    cents: "40",
    vcpu: "12 núcleos de vCPU",
    ram: "48 GB de RAM",
    storage: "250 GB NVMe ou SSD 500 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 800 Mbit/s",
  },
  {
    id: "50",
    name: "Cloud VPS 50 (XXL)",
    oldPrice: "R$ 1.377,31",
    newPrice: "R$ 1.101,",
    cents: "85",
    vcpu: "16 núcleos de vCPU",
    ram: "64 GB de RAM",
    storage: "300 GB NVMe ou SSD 600 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 1 Gbit/s",
  },
  {
    id: "60",
    name: "Cloud VPS 60 (XXXL)",
    oldPrice: "R$ 1.550,69",
    newPrice: "R$ 1.240,",
    cents: "55",
    vcpu: "18 núcleos de vCPU",
    ram: "96 GB de RAM",
    storage: "350 GB NVMe ou SSD 700 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 1 Gbit/s",
  },
];

export function VpsWindowsPage() {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1700px)] mt-[2rem]">
        <div className="flex flex-col justify-start pb-4 md:pb-6">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <MonitorCog className="h-4 w-4 text-emerald-500" />
              <span className={`${roboto.className} text-xs font-bold uppercase tracking-wider text-emerald-600`}>
                VPS Windows
              </span>
            </div>

            <h1 className={`${roboto.className} mx-auto max-w-5xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl`}>
              Servidor VPS Windows - Acessível, rápido e flexível
            </h1>

            <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed text-slate-600 md:text-lg">
              Hospedagem VPS Windows escalável, projetada para todos — de iniciantes a profissionais de tecnologia.
              Desfrute de configuração rápida, desempenho consistente e soluções seguras.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-4 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm md:mt-5">
          <h3 className={`${roboto.className} text-2xl font-bold text-slate-900 md:text-[2rem]`}>Windows Server Incluso</h3>
          <p className="mt-2 text-lg text-slate-600">
            VPS com ambiente Windows pronto para aplicações, RDP e workloads corporativos.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto pb-3 scrollbar-thin md:mt-10">
          <div className="flex min-w-[1640px] gap-4 md:justify-center">
            {windowsPlans.map((plan) => (
              <article
                key={plan.name}
                className="w-[260px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-4">
                  <p className={`${roboto.className} text-base font-bold tracking-wide text-slate-900`}>{plan.name}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">Servidor Windows</p>
                  <p className="mt-2 text-xs font-medium text-rose-500 line-through opacity-70">{plan.oldPrice}</p>
                  <div className="mt-0.5 flex items-baseline gap-1 whitespace-nowrap leading-none text-slate-900">
                    <span className="text-4xl font-extrabold">{plan.newPrice}</span>
                    <span className="text-lg font-bold">{plan.cents}</span>
                    <span className="ml-1 text-xs font-medium text-slate-400">/mês</span>
                  </div>
                  <p className="mt-0.5 text-xs font-light leading-snug text-slate-400">por um período de 12 meses</p>
                  <Link
                    href={`/vps-windows/configure/${plan.id}`}
                    className={`${roboto.className} mt-3 block w-full rounded-md border border-slate-200 bg-transparent py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50`}
                  >
                    Começar agora →
                  </Link>
                </div>

                <div className="space-y-0 border-t border-slate-100 text-lg font-bold text-slate-700">
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold first:border-t-0">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm">{plan.vcpu}</span>
                    </span>
                  </p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm">{plan.ram}</span>
                    </span>
                  </p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm">{plan.storage}</span>
                    </span>
                  </p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm">{plan.snapshots}</span>
                    </span>
                  </p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm">{plan.speed}</span>
                    </span>
                  </p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">
                    <span className="inline-flex items-start gap-2">
                      <Check className="mt-[1px] h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm">Tráfego ilimitado*</span>
                    </span>
                  </p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold text-emerald-600 text-xs uppercase tracking-wider">100% de cashback</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold text-sky-600 text-xs uppercase tracking-wider">Suporte 24/7 Ativo</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl text-center">
          <h3 className={`${roboto.className} text-3xl font-semibold tracking-tight text-slate-900 md:text-[2.2rem]`}>
            9 regiões, 11 localidades, disponibilidade global.
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
            Dos EUA ao Reino Unido, da Europa à Ásia e Austrália, escolha a localização ideal para baixa latência em todo o mundo.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="relative overflow-hidden rounded-2xl bg-slate-50 p-6 md:p-10 border border-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:36px_36px]" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70">
              <LottieMap />
            </div>
            <div className="relative min-h-[300px] md:min-h-[360px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
