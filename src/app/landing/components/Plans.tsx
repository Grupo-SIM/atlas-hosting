"use client";

import { useState, useEffect } from "react";
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
  eurOld: number;
  eurNew: number;
  eurBackup: number;
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
    eurOld: 9.00,
    eurNew: 7.20,
    eurBackup: 10.20,
    vcpu: "4 núcleos",
    ram: "8 GB",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1",
    traffic: "Porta de 200 Mbit/s",
  },
  {
    id: "20",
    name: "Cloud VPS 20",
    eurOld: 14.00,
    eurNew: 11.20,
    eurBackup: 15.20,
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
    eurOld: 28.00,
    eurNew: 22.40,
    eurBackup: 28.40,
    vcpu: "8 núcleos",
    ram: "24 GB",
    storage: "200 GB NVMe ou SSD 400 GB",
    snapshots: "3",
    traffic: "Porta de 600 Mbit/s",
  },
  {
    id: "40",
    name: "Cloud VPS 40",
    eurOld: 50.00,
    eurNew: 40.00,
    eurBackup: 50.00,
    vcpu: "12 núcleos",
    ram: "48 GB",
    storage: "250 GB NVMe ou SSD 500 GB",
    snapshots: "3",
    traffic: "Porta de 800 Mbit/s",
  },
  {
    id: "50",
    name: "Cloud VPS 50",
    eurOld: 74.00,
    eurNew: 59.20,
    eurBackup: 74.20,
    vcpu: "16 núcleos",
    ram: "64 GB",
    storage: "300 GB NVMe ou SSD 600 GB",
    snapshots: "3",
    traffic: "Porta de 1 Gbit/s",
  },
  {
    id: "60",
    name: "Cloud VPS 60",
    eurOld: 98.00,
    eurNew: 78.40,
    eurBackup: 97.40,
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
    <section id="planos" className="relative bg-transparent px-4 py-20 md:px-8 md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-[1760px]">
        <div className="mb-16 text-center">
          <h2 className={`${roboto.className} text-3xl font-bold tracking-tight text-white md:text-5xl`}>
            Potência dedicada para tirar seus projetos do papel.
          </h2>
          <p className="mt-4 text-base text-slate-400 md:text-lg max-w-2xl mx-auto">
            Escolha o plano VPS ideal e escale com performance, estabilidade e suporte 24/7.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch justify-start gap-4">

          {/* Card de Especificações Fixo */}
          <div className="w-full xl:w-[280px] shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl h-full flex flex-col shadow-2xl transition-all backdrop-blur-md">
              <div className="p-8 h-[280px] flex flex-col justify-between border-b border-white/10 items-center text-center">
                <p className={`${roboto.className} text-[18px] font-black uppercase tracking-[0.2em] text-sky-400`}>
                  ESPECIFICAÇÕES
                </p>
                <div className="flex flex-col gap-4 items-center">
                  <span className="text-xl font-black text-white uppercase tracking-tighter">Backup automático</span>
                  <div className="flex items-center gap-3">
                    <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} className="data-[state=unchecked]:bg-white/10 border-white/10 data-[state=checked]:bg-sky-500" />
                    <span className="text-base font-bold text-white">{backupEnabled ? "Ativado" : "Desativado"}</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow bg-white/5">
                {rowSpecs.map((row, i) => (
                  <div key={row.key} className={`px-8 h-[72px] flex flex-col justify-center items-center text-center border-t border-white/10 ${i === rowSpecs.length - 1 ? 'border-b-0' : ''}`}>
                    <span className="text-[16px] font-black text-white uppercase tracking-widest leading-none">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slider de Cartões de Planos */}
          <div className="flex-grow overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex gap-4 px-2 py-2">
              {plans.map((p) => {
                const currentEurPrice = backupEnabled ? p.eurBackup : p.eurNew;
                const formattedPrice = formatBRL(currentEurPrice).replace(/\u00A0/g, " ");
                const priceParts = formattedPrice.split(" ");
                const priceSymbol = priceParts[0];
                const priceValue = priceParts.slice(1).join("");
                const [priceMain, priceCents] = priceValue.split(",");

                return (
                  <div key={p.id} className="flex-[0_0_100%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] 2xl:flex-[0_0_24%] min-w-0">
                    <div className={`bg-[#00050A] border rounded-2xl h-full flex flex-col transition-all duration-300 shadow-2xl backdrop-blur-md ${p.popular ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-white/10 hover:border-white/20'}`}>

                      {/* Plan Header */}
                      <div className="p-8 h-[280px] flex flex-col justify-between border-b border-white/10 relative">
                        {p.popular && (
                          <div className="absolute top-6 right-6">
                            <span className="rounded-full bg-sky-500 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-lg">MAIS VENDIDO</span>
                          </div>
                        )}
                        <div>
                          <p className={`${roboto.className} text-2xl font-black text-white mb-4 uppercase tracking-tighter`}>{p.name}</p>
                          <span className="text-sm text-rose-500 line-through mb-1 block opacity-70">{formatBRL(p.eurOld)}</span>
                          <div className="flex items-baseline gap-1 whitespace-nowrap text-white">
                            <span className="text-base font-bold mb-2">{priceSymbol}</span>
                            <span className="text-5xl font-black">{priceMain},</span>
                            <span className="text-2xl font-black">{priceCents}</span>
                            <span className="text-sm font-medium opacity-40 ml-1.5">/mês</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">12 meses</p>
                        </div>

                        <button
                          onClick={() => router.push(`/vps/configure/${p.id}`)}
                          className={`${roboto.className} block w-full rounded-xl py-3 text-center text-[11px] font-black uppercase tracking-[0.15em] transition-all ${p.popular ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400' : 'border-2 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          Começar agora →
                        </button>
                      </div>

                      {/* Plan Specs Values */}
                      <div className="flex-grow bg-[#00050A]">
                        {rowSpecs.map((row) => (
                          <div key={`${p.id}-${row.key}`} className="h-[72px] flex items-center justify-center border-t border-white/10 px-6 text-center">
                            <span className="text-base font-black text-white uppercase tracking-tighter">{p[row.key]}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 border-t border-white/10 flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center gap-2 text-sky-400">
                          <Check className="h-4 w-4" strokeWidth={4} />
                          <span className="text-[13px] font-black uppercase tracking-widest">100% de cashback</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sky-500">
                          <Check className="h-4 w-4" strokeWidth={4} />
                          <span className="text-[13px] font-black uppercase tracking-widest">Suporte 24/7 Ativo</span>
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
          <p className="text-sm text-white">
            Quer ainda mais potência? <Link href="/vds" className="font-bold text-sky-400 hover:underline underline-offset-4 decoration-sky-500/30 transition-colors">Escolha um VDS</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
