"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Roboto } from "next/font/google";
import { Switch } from "@/components/ui/switch";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type VpsPlan = {
  id: string;
  name: string;
  priceOld: string;
  priceNew: string;
  priceBackup: string;
  popular?: boolean;
  vcpu: string;
  ram: string;
  storage: string;
  snapshots: string;
  traffic: string;
};

const plans: VpsPlan[] = [
  {
    id: "10",
    name: "Cloud VPS 10",
    priceOld: "R$ 49,48",
    priceNew: "R$ 39,58",
    priceBackup: "R$ 48,68",
    vcpu: "4 núcleos",
    ram: "8 GB",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1",
    traffic: "Porta de 200 Mbit/s",
  },
  {
    id: "20",
    name: "Cloud VPS 20",
    priceOld: "R$ 79,45",
    priceNew: "R$ 63,56",
    priceBackup: "R$ 75,56",
    popular: true,
    vcpu: "6 núcleos",
    ram: "12 GB",
    storage: "100 GB NVMe ou SSD 200 GB",
    snapshots: "2",
    traffic: "Porta de 300 Mbit/s",
  },
  {
    id: "30",
    name: "Cloud VPS 30",
    priceOld: "R$ 149,90",
    priceNew: "R$ 119,92",
    priceBackup: "R$ 140,68",
    vcpu: "8 núcleos",
    ram: "24 GB",
    storage: "200 GB NVMe ou SSD 400 GB",
    snapshots: "3",
    traffic: "Porta de 600 Mbit/s",
  },
  {
    id: "40",
    name: "Cloud VPS 40",
    priceOld: "R$ 259,83",
    priceNew: "R$ 207,86",
    priceBackup: "R$ 243,72",
    vcpu: "12 núcleos",
    ram: "48 GB",
    storage: "250 GB NVMe ou SSD 500 GB",
    snapshots: "3",
    traffic: "Porta de 800 Mbit/s",
  },
  {
    id: "50",
    name: "Cloud VPS 50",
    priceOld: "R$ 459,68",
    priceNew: "R$ 367,74",
    priceBackup: "R$ 412,48",
    vcpu: "16 núcleos",
    ram: "64 GB",
    storage: "300 GB NVMe ou SSD 600 GB",
    snapshots: "3",
    traffic: "Porta de 1 Gbit/s",
  },
  {
    id: "60",
    name: "Cloud VPS 60",
    priceOld: "R$ 589,60",
    priceNew: "R$ 471,68",
    priceBackup: "R$ 527,98",
    vcpu: "18 núcleos",
    ram: "96 GB",
    storage: "350 GB NVMe ou SSD 700 GB",
    snapshots: "3",
    traffic: "Porta de 1 Gbit/s",
  },
];

export function Plans() {
  const router = useRouter();
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps'
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  const rowSpecs = [
    { label: "Núcleos de vCPU", key: "vcpu" as const },
    { label: "RAM (GB)", key: "ram" as const },
    {
      label: "NVMe (GB) / SSD (GB)",
      sub: "+ Espaço de armazenamento extra",
      key: "storage" as const,
    },
    { label: "Instantâneos", key: "snapshots" as const },
    { label: "Tráfego (entrada ilimitada)", key: "traffic" as const },
  ];

  return (
    <section id="planos" className="relative bg-slate-50 px-4 py-20 md:px-8 md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-[1760px]">
        <div className="mb-16 text-center">
          <h2 className={`${roboto.className} text-3xl font-bold tracking-tight text-slate-900 md:text-5xl`}>
            Potência dedicada para tirar seus projetos do papel.
          </h2>
          <p className="mt-4 text-base text-slate-500 md:text-lg max-w-2xl mx-auto">
            Escolha o plano VPS ideal e escale com performance, estabilidade e suporte 24/7.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch justify-start gap-4">

          {/* Card de Especificações Fixo */}
          <div className="w-full xl:w-[280px] shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl h-full flex flex-col shadow-sm">
              <div className="p-8 h-[280px] flex flex-col justify-between border-b border-slate-100">
                <p className={`${roboto.className} text-[13px] font-bold uppercase tracking-[0.2em] text-emerald-600`}>
                  ESPECIFICAÇÕES DA EMBALAGEM
                </p>
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium text-slate-400">VPS com backup automático</span>
                  <div className="flex items-center gap-3">
                    <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} />
                    <span className="text-xs text-slate-500">{backupEnabled ? "Ativado" : "Desativado"}</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow">
                {rowSpecs.map((row, i) => (
                  <div key={row.key} className={`px-8 h-[72px] flex flex-col justify-center border-t border-slate-50 ${i === rowSpecs.length - 1 ? 'border-b-0' : ''}`}>
                    <span className="text-base font-bold text-slate-700 uppercase tracking-widest leading-none">{row.label}</span>
                    {row.sub && <span className="text-sm text-slate-400 mt-1 sm:mt-2 leading-tight">{row.sub}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slider de Cartões de Planos */}
          <div className="flex-grow overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex gap-4 px-2 py-2">
              {plans.map((p) => {
                const currentPrice = backupEnabled ? p.priceBackup : p.priceNew;
                const [priceSymbol, priceValue] = currentPrice.split(" ");
                const [priceMain, priceCents] = priceValue.split(",");

                return (
                  <div key={p.id} className="flex-[0_0_100%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] 2xl:flex-[0_0_24%] min-w-0">
                    <div className={`bg-white border rounded-2xl h-full flex flex-col transition-all duration-300 ${p.popular ? 'border-emerald-500 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}`}>

                      {/* Plan Header */}
                      <div className="p-8 h-[280px] flex flex-col justify-between border-b border-slate-100 relative">
                        {p.popular && (
                          <div className="absolute top-6 right-6">
                            <span className="rounded-full bg-emerald-500 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-lg">MAIS VENDIDO</span>
                          </div>
                        )}
                        <div>
                          <p className={`${roboto.className} text-2xl font-bold text-slate-900 mb-4`}>{p.name}</p>
                          <span className="text-sm text-rose-500 line-through opacity-70 mb-1 block">{p.priceOld}</span>
                          <div className="flex items-baseline gap-1 whitespace-nowrap">
                            <span className="text-base font-bold text-slate-900 mb-2">{priceSymbol}</span>
                            <span className="text-5xl font-extrabold text-slate-900">{priceMain},</span>
                            <span className="text-2xl font-bold text-slate-900">{priceCents}</span>
                            <span className="text-sm font-medium text-slate-400 ml-1.5 opacity-60">/mês</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 uppercase tracking-wide">12 meses</p>
                        </div>

                        <button
                          onClick={() => router.push(`/vps/configure/${p.id}`)}
                          className={`${roboto.className} block w-full rounded-xl py-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${p.popular ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          Começar agora →
                        </button>
                      </div>

                      {/* Plan Specs Values */}
                      <div className="flex-grow bg-slate-50/30">
                        {rowSpecs.map((row) => (
                          <div key={`${p.id}-${row.key}`} className="h-[72px] flex items-center justify-center border-t border-slate-100 px-6 text-center">
                            <span className="text-lg font-bold text-slate-700">{p[row.key]}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Check className="h-3 w-3" strokeWidth={4} />
                          <span className="text-xs font-extrabold uppercase tracking-wider">100% de cashback</span>
                        </div>
                        <div className="flex items-center gap-2 text-sky-600">
                          <Check className="h-3 w-3" strokeWidth={4} />
                          <span className="text-xs font-extrabold uppercase tracking-wider">Suporte 24/7 Ativo</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-16 text-right">
          <p className="text-sm text-slate-500">
            Quer ainda mais potência? <Link href="/vds" className="font-bold text-emerald-600 hover:underline underline-offset-4">Escolha um VDS</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
