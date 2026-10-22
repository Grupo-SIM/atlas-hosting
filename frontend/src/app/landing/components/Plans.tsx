"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Check } from "lucide-react";
import { Roboto } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  DISPLAY_CURRENCY_CHANGE_EVENT,
  readDisplayCurrency,
} from "@/lib/display-currency";
import {
  CLOUD_VPS_PLANS,
  getCloudVpsMonthlyEuro,
  getCloudVpsOldMonthlyEuro,
} from "@/lib/vps-catalog";
import {
  convertVpsPriceFromEuro,
  type VpsDisplayCurrency,
} from "@/lib/vps-price-display";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

interface VpsPlan {
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
}

const plans: VpsPlan[] = CLOUD_VPS_PLANS.map(plan => ({
  eurBackup: getCloudVpsMonthlyEuro(plan.id, true, 24)!,
  eurNew: getCloudVpsMonthlyEuro(plan.id, false, 24)!,
  eurOld: getCloudVpsOldMonthlyEuro(plan.id, false)!,
  id: plan.id,
  name: plan.name,
  popular: plan.id === "6",
  port: plan.port,
  ram: plan.ram,
  snapshots: plan.snapshots,
  storage: plan.storage,
  traffic: plan.traffic,
  vcpu: plan.vcpu,
}));

export function Plans() {
  const router = useRouter();
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [displayCurrency, setDisplayCurrency] =
    useState<VpsDisplayCurrency>("BRL");
  const [currencyRates, setCurrencyRates] = useState({
    eurToBrl: 5.86,
    eurToUsd: 1.08,
  });

  useEffect(() => {
    fetch("/api/currency/euro")
      .then(res => res.json())
      .then(data => {
        if (data.rate || data.usdRate) {
          setCurrencyRates(rates => ({
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
    return () =>
      window.removeEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
  }, []);

  const formatBRL = (eur: number) => {
    const amount = convertVpsPriceFromEuro(eur, displayCurrency, currencyRates);
    return new Intl.NumberFormat(
      displayCurrency === "BRL" ? "pt-BR" : "en-US",
      {
        currency: displayCurrency,
        style: "currency",
      }
    ).format(amount);
  };

  const getPriceParts = (eur: number) => {
    const amount = convertVpsPriceFromEuro(eur, displayCurrency, currencyRates);
    const [whole, cents] = amount.toFixed(2).split(".");
    const locale = displayCurrency === "BRL" ? "pt-BR" : "en-US";
    const priceMain = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(Number(whole));
    const priceSymbol =
      displayCurrency === "BRL"
        ? "R$"
        : displayCurrency === "EUR"
          ? "€"
          : "US$";

    return { priceCents: cents, priceMain, priceSymbol };
  };

  const [emblaRef] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      loop: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const rowSpecs = [
    { key: "vcpu" as const, label: "Núcleos de vCPU" },
    { key: "ram" as const, label: "RAM (GB)" },
    { key: "storage" as const, label: "Armazenamento" },
    { key: "snapshots" as const, label: "Instantâneos" },
    { key: "port" as const, label: "Velocidade da Porta" },
    { key: "traffic" as const, label: "Tráfego (entrada ilimitada)" },
  ];

  return (
    <section
      className="relative bg-transparent px-4 py-20 md:px-8 md:py-32"
      id="planos"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1760px]">
        <div className="mb-16 text-center">
          <h2
            className={`${roboto.className} font-bold text-4xl text-white tracking-tight md:text-6xl`}
          >
            Potência dedicada para tirar seus projetos do papel.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400 md:text-xl">
            Escolha o plano VPS ideal e escale com performance, estabilidade e
            suporte 24/7.
          </p>
        </div>

        {/* Mobile backup toggle - only on smaller screens */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md xl:hidden">
          <Switch
            checked={backupEnabled}
            className="border-white/10 data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-white/10"
            onCheckedChange={setBackupEnabled}
          />
          <div>
            <span className="font-black text-sm text-white uppercase tracking-widest">
              Backup automático
            </span>
            <p className="mt-0.5 text-slate-400 text-xs">
              {backupEnabled ? "Ativado" : "Desativado"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-start gap-4 xl:flex-row">
          {/* Card de Especificações Fixo - only visible on xl+ */}
          <div className="hidden shrink-0 xl:block xl:w-[280px]">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md transition-all">
              <div className="flex h-[280px] flex-col items-center justify-between border-white/10 border-b p-8 text-center">
                <p
                  className={`${roboto.className} font-black text-[20px] text-sky-400 uppercase tracking-[0.2em]`}
                >
                  ESPECIFICAÇÕES
                </p>
                <div className="flex flex-col items-center gap-4">
                  <span className="font-black text-2xl text-white uppercase tracking-tighter">
                    Backup automático
                  </span>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={backupEnabled}
                      className="border-white/10 data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-white/10"
                      onCheckedChange={setBackupEnabled}
                    />
                    <span className="font-bold text-lg text-white">
                      {backupEnabled ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-grow bg-white/5">
                {rowSpecs.map((row, i) => (
                  <div
                    className={`flex h-[72px] flex-col items-center justify-center border-white/10 border-t px-8 text-center ${i === rowSpecs.length - 1 ? "border-b-0" : ""}`}
                    key={row.key}
                  >
                    <span className="font-black text-[18px] text-white uppercase leading-none tracking-widest">
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slider de Cartões de Planos */}
          <div
            className="flex-grow cursor-grab overflow-hidden active:cursor-grabbing"
            ref={emblaRef}
          >
            <div className="flex gap-4 px-2 py-2">
              {plans.map(p => {
                const currentEurPrice = backupEnabled ? p.eurBackup : p.eurNew;
                const { priceSymbol, priceMain, priceCents } =
                  getPriceParts(currentEurPrice);

                return (
                  <div
                    className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] 2xl:flex-[0_0_24%]"
                    key={p.id}
                  >
                    <div
                      className={`flex h-full flex-col rounded-2xl border bg-[#00050A] shadow-2xl backdrop-blur-md transition-all duration-300 ${p.popular ? "border-sky-500 ring-2 ring-sky-500/20" : "border-white/10 hover:border-white/20"}`}
                    >
                      {/* Plan Header */}
                      <div className="relative flex h-[280px] flex-col justify-between border-white/10 border-b p-8">
                        {p.popular && (
                          <div className="absolute top-6 right-6">
                            <span className="rounded-full bg-sky-500 px-3 py-1 font-extrabold text-[12px] text-white uppercase tracking-widest shadow-lg">
                              MAIS VENDIDO
                            </span>
                          </div>
                        )}
                        <div>
                          <p
                            className={`${roboto.className} mb-4 font-black text-3xl text-white uppercase tracking-tighter`}
                          >
                            {p.name}
                          </p>
                          <span className="mb-1 block text-base text-rose-500 line-through opacity-70">
                            {formatBRL(p.eurOld)}
                          </span>
                          <div className="flex items-baseline gap-1 whitespace-nowrap text-white">
                            <span className="mb-2 font-bold text-lg">
                              {priceSymbol}
                            </span>
                            <span className="font-black text-6xl">
                              {priceMain},
                            </span>
                            <span className="font-black text-3xl">
                              {priceCents}
                            </span>
                            <span className="ml-1.5 font-medium text-base opacity-40">
                              /mês
                            </span>
                          </div>
                          <p className="mt-1 text-slate-500 text-sm uppercase tracking-wider">
                            24 meses
                          </p>
                        </div>

                        <button
                          className={`${roboto.className} block w-full rounded-xl py-3 text-center font-black text-[14px] uppercase tracking-[0.15em] transition-all ${
                            p.popular
                              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
                              : "border-2 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                          }`}
                          onClick={() =>
                            router.push(
                              `/vps/configure/${p.id}?duration=24&backup=${backupEnabled}`
                            )
                          }
                        >
                          Começar agora →
                        </button>
                      </div>

                      {/* Plan Specs Values */}
                      <div className="flex-grow bg-[#00050A]">
                        {rowSpecs.map(row => (
                          <div
                            className="flex min-h-[72px] flex-col items-center justify-center gap-1 border-white/10 border-t px-6 py-3 text-center xl:flex-row xl:justify-center xl:gap-0 xl:py-0"
                            key={`${p.id}-${row.key}`}
                          >
                            <span className="font-bold text-slate-400 text-xs uppercase tracking-widest xl:hidden">
                              {row.label}
                            </span>
                            <span className="font-black text-lg text-white uppercase tracking-tighter">
                              {p[row.key]}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col items-center gap-3 border-white/10 border-t p-6">
                        <div className="flex items-center justify-center gap-2 text-sky-400">
                          <Check className="h-4 w-4" strokeWidth={4} />
                          <span className="font-black text-[15px] uppercase tracking-widest">
                            100% de cashback
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sky-500">
                          <Check className="h-4 w-4" strokeWidth={4} />
                          <span className="font-black text-[15px] uppercase tracking-widest">
                            Suporte 24/7 Ativo
                          </span>
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
            Quer ainda mais potência?{" "}
            <Link
              className="font-bold text-sky-400 decoration-sky-500/30 underline-offset-4 transition-colors hover:underline"
              href="/vds"
            >
              Escolha um VDS
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
