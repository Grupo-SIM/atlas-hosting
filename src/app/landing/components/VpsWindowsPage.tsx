"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, MonitorCog } from "lucide-react";
import { Roboto } from "next/font/google";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type WindowsPlan = {
  id?: string;
  name: string;
  eurOld: number;
  eurNew: number;
  vcpu: string;
  ram: string;
  storage: string;
  snapshots: string;
  speed: string;
  noSetupFee?: boolean;
};

const windowsPlans = [
  {
    id: "10",
    name: "Cloud VPS 10 (S)",
    eurOld: 24.00,
    eurNew: 22.20,
    vcpu: "4 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1 Instantâneo",
    speed: "Porta de 200 Mbit/s",
  },
  {
    id: "20",
    name: "Cloud VPS 20 (M)",
    eurOld: 45.00,
    eurNew: 42.20,
    vcpu: "6 núcleos de vCPU",
    ram: "12 GB de RAM",
    storage: "100 GB NVMe ou SSD 200 GB",
    snapshots: "2 Instantâneos",
    speed: "Porta de 300 Mbit/s",
    noSetupFee: true,
  },
  {
    id: "30",
    name: "Cloud VPS 30 (L)",
    eurOld: 80.00,
    eurNew: 74.40,
    vcpu: "8 núcleos de vCPU",
    ram: "24 GB de RAM",
    storage: "200 GB NVMe ou SSD 400 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 600 Mbit/s",
    noSetupFee: true,
  },
  {
    id: "40",
    name: "Cloud VPS 40 (XL)",
    eurOld: 148.00,
    eurNew: 138.00,
    vcpu: "12 núcleos de vCPU",
    ram: "48 GB de RAM",
    storage: "250 GB NVMe ou SSD 500 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 800 Mbit/s",
    noSetupFee: true,
  },
  {
    id: "50",
    name: "Cloud VPS 50 (XXL)",
    eurOld: 191.00,
    eurNew: 176.20,
    vcpu: "16 núcleos de vCPU",
    ram: "64 GB de RAM",
    storage: "300 GB NVMe ou SSD 600 GB",
    snapshots: "3 Instantâneos",
    speed: "Porta de 1 Gbit/s",
    noSetupFee: true,
  },
  {
    id: "60",
    name: "Cloud VPS 60 (XXXL)",
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

export function VpsWindowsPage() {
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

        <div className="mt-8 overflow-x-auto pb-3 pt-4 scrollbar-thin md:mt-10">
          <div className="flex min-w-[1640px] gap-4 md:justify-center">
            {windowsPlans.map((plan) => {
              const formattedPrice = formatBRL(plan.eurNew).replace(/\u00A0/g, " ");
              const priceParts = formattedPrice.split(" ");
              const priceSymbol = priceParts[0];
              const priceValue = priceParts.slice(1).join("");
              const [priceMain, priceCents] = priceValue.split(",");

              return (
              <article
                key={plan.name}
                className="relative w-[260px] shrink-0 overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {plan.noSetupFee && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className={`${roboto.className} whitespace-nowrap rounded bg-[#0099e5] px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm`}>
                      Taxa de instalação grátis
                    </span>
                  </div>
                )}
                <div className="p-4 pt-5">
                  <p className={`${roboto.className} text-base font-bold tracking-wide text-slate-900`}>{plan.name}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">Servidor Windows</p>
                  <p className="mt-2 text-xs font-medium text-rose-500 line-through opacity-70">{formatBRL(plan.eurOld)}</p>
                  <div className="mt-0.5 flex items-baseline gap-0.5 whitespace-nowrap leading-none text-slate-900">
                    <span className="text-[12px] font-bold mb-0.5">{priceSymbol}</span>
                    <span className="text-xl font-extrabold md:text-4xl">{priceMain},</span>
                    <span className="text-xl font-bold">{priceCents}</span>
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
            )})}
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
