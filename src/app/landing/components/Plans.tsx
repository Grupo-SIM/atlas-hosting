"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Roboto } from "next/font/google";
import { Switch } from "@/components/ui/switch";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { convertVpsPriceFromEuro, type VpsDisplayCurrency } from "@/lib/vps-price-display";
import { DISPLAY_CURRENCY_CHANGE_EVENT, readDisplayCurrency } from "@/lib/display-currency";
import {
  CLOUD_VPS_PLANS,
  getCloudVpsMonthlyEuro,
  getCloudVpsOldMonthlyEuro,
} from "@/lib/vps-catalog";

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
  port: string;
  traffic: string;
};

const plans: VpsPlan[] = CLOUD_VPS_PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  eurOld: getCloudVpsOldMonthlyEuro(plan.id, false)!,
  eurNew: getCloudVpsMonthlyEuro(plan.id, false, 24)!,
  eurBackup: getCloudVpsMonthlyEuro(plan.id, true, 24)!,
  popular: plan.id === "6",
  vcpu: plan.vcpu,
  ram: plan.ram,
  storage: plan.storage,
  snapshots: plan.snapshots,
  port: plan.port,
  traffic: plan.traffic,
}));

export function Plans() {
  const router = useRouter();
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<VpsDisplayCurrency>("BRL");
  const [currencyRates, setCurrencyRates] = useState({ eurToBrl: 5.86, eurToUsd: 1.08 });

  useEffect(() => {
    fetch("/api/currency/euro")
      .then(res => res.json())
      .then(data => {
        if (data.rate || data.usdRate) {
          setCurrencyRates((rates) => ({
            eurToBrl: data.rate || rates.eurToBrl,
            eurToUsd: data.usdRate || rates.eurToUsd,
          }));
        }
      })
      .catch(err => console.error("Error fetching rate:", err));
  }, []);

  useEffect(() => {
    const syncCurrency = () => setDisplayCurrency(readDisplayCurrency());
    syncCurrency();
    window.addEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
    return () => window.removeEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
  }, []);

  const formatBRL = (eur: number) => {
    const amount = convertVpsPriceFromEuro(eur, displayCurrency, currencyRates);
    return new Intl.NumberFormat(displayCurrency === "BRL" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: displayCurrency,
    }).format(amount);
  };

  const getPriceParts = (eur: number) => {
    const amount = convertVpsPriceFromEuro(eur, displayCurrency, currencyRates);
    const [whole, cents] = amount.toFixed(2).split(".");
    const locale = displayCurrency === "BRL" ? "pt-BR" : "en-US";
    const priceMain = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(whole));
    const priceSymbol = displayCurrency === "BRL" ? "R$" : displayCurrency === "EUR" ? "€" : "US$";

    return { priceSymbol, priceMain, priceCents: cents };
  };

  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps'
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  const rowSpecs = [
    { label: "Núcleos de vCPU", key: "vcpu" as const },
    { label: "RAM (GB)", key: "ram" as const },
    { label: "Armazenamento", key: "storage" as const },
    { label: "Instantâneos", key: "snapshots" as const },
    { label: "Velocidade da Porta", key: "port" as const },
    { label: "Tráfego (entrada ilimitada)", key: "traffic" as const },
  ];

  return (
    <section id="planos" className="relative bg-transparent px-4 py-20 md:px-8 md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-[1760px]">
        <div className="mb-16 text-center">
          <h2 className={`${roboto.className} text-4xl font-bold tracking-tight text-white md:text-6xl`}>
            Potência dedicada para tirar seus projetos do papel.
          </h2>
          <p className="mt-4 text-lg text-slate-400 md:text-xl max-w-2xl mx-auto">
            Escolha o plano VPS ideal e escale com performance, estabilidade e suporte 24/7.
          </p>
        </div>

        {/* Mobile backup toggle - only on smaller screens */}
        <div className="xl:hidden flex items-center gap-3 mb-4 border border-white/10 bg-white/5 rounded-2xl px-5 py-4 backdrop-blur-md">
          <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} className="data-[state=unchecked]:bg-white/10 border-white/10 data-[state=checked]:bg-sky-500" />
          <div>
            <span className="text-sm font-black text-white uppercase tracking-widest">Backup automático</span>
            <p className="text-xs text-slate-400 mt-0.5">{backupEnabled ? "Ativado" : "Desativado"}</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch justify-start gap-4">

          {/* Card de Especificações Fixo - only visible on xl+ */}
          <div className="hidden xl:block xl:w-[280px] shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl h-full flex flex-col shadow-2xl transition-all backdrop-blur-md">
              <div className="p-8 h-[280px] flex flex-col justify-between border-b border-white/10 items-center text-center">
                <p className={`${roboto.className} text-[20px] font-black uppercase tracking-[0.2em] text-sky-400`}>ESPECIFICAÇÕES</p>
                <div className="flex flex-col gap-4 items-center">
                  <span className="text-2xl font-black text-white uppercase tracking-tighter">Backup automático</span>
                  <div className="flex items-center gap-3">
                    <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} className="data-[state=unchecked]:bg-white/10 border-white/10 data-[state=checked]:bg-sky-500" />
                    <span className="text-lg font-bold text-white">{backupEnabled ? "Ativado" : "Desativado"}</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow bg-white/5">
                {rowSpecs.map((row, i) => (
                  <div key={row.key} className={`px-8 h-[72px] flex flex-col justify-center items-center text-center border-t border-white/10 ${i === rowSpecs.length - 1 ? 'border-b-0' : ''}`}>
                    <span className="text-[18px] font-black text-white uppercase tracking-widest leading-none">{row.label}</span>
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
                const { priceSymbol, priceMain, priceCents } = getPriceParts(currentEurPrice);

                return (
                  <div key={p.id} className="flex-[0_0_100%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] 2xl:flex-[0_0_24%] min-w-0">
                    <div className={`bg-[#00050A] border rounded-2xl h-full flex flex-col transition-all duration-300 shadow-2xl backdrop-blur-md ${p.popular ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-white/10 hover:border-white/20'}`}>

                      {/* Plan Header */}
                      <div className="p-8 h-[280px] flex flex-col justify-between border-b border-white/10 relative">
                        {p.popular && (
                          <div className="absolute top-6 right-6">
                            <span className="rounded-full bg-sky-500 px-3 py-1 text-[12px] font-extrabold uppercase tracking-widest text-white shadow-lg">MAIS VENDIDO</span>
                          </div>
                        )}
                        <div>
                          <p className={`${roboto.className} text-3xl font-black text-white mb-4 uppercase tracking-tighter`}>{p.name}</p>
                          <span className="text-base text-rose-500 line-through mb-1 block opacity-70">{formatBRL(p.eurOld)}</span>
                          <div className="flex items-baseline gap-1 whitespace-nowrap text-white">
                            <span className="text-lg font-bold mb-2">{priceSymbol}</span>
                            <span className="text-6xl font-black">{priceMain},</span>
                            <span className="text-3xl font-black">{priceCents}</span>
                            <span className="text-base font-medium opacity-40 ml-1.5">/mês</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500 uppercase tracking-wider">24 meses</p>
                        </div>

                        <button
                          onClick={() => router.push(`/vps/configure/${p.id}?duration=24&backup=${backupEnabled}`)}
                          className={`${roboto.className} block w-full rounded-xl py-3 text-center text-[14px] font-black uppercase tracking-[0.15em] transition-all ${p.popular ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400' : 'border-2 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          Começar agora →
                        </button>
                      </div>

                      {/* Plan Specs Values */}
                      <div className="flex-grow bg-[#00050A]">
                        {rowSpecs.map((row) => (
                          <div key={`${p.id}-${row.key}`} className="min-h-[72px] flex flex-col xl:flex-row items-center justify-center xl:justify-center border-t border-white/10 px-6 py-3 xl:py-0 text-center gap-1 xl:gap-0">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest xl:hidden">{row.label}</span>
                            <span className="text-lg font-black text-white uppercase tracking-tighter">{p[row.key]}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 border-t border-white/10 flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center gap-2 text-sky-400">
                          <Check className="h-4 w-4" strokeWidth={4} />
                          <span className="text-[15px] font-black uppercase tracking-widest">100% de cashback</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sky-500">
                          <Check className="h-4 w-4" strokeWidth={4} />
                          <span className="text-[15px] font-black uppercase tracking-widest">Suporte 24/7 Ativo</span>
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
          <p className="text-base text-white">
            Quer ainda mais potência? <Link href="/vds" className="font-bold text-sky-400 hover:underline underline-offset-4 decoration-sky-500/30 transition-colors">Escolha um VDS</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
