"use client";

import { Fragment, useState, useEffect } from "react";
import { Check, Star, Wallet, Rocket, MessageCircle, Globe2, ArrowLeft } from "lucide-react";
import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LottieMap from "./LottieMap";
import { convertVpsPriceFromEuro, type VpsDisplayCurrency } from "@/lib/vps-price-display";
import { DISPLAY_CURRENCY_CHANGE_EVENT, readDisplayCurrency } from "@/lib/display-currency";
import {
  VDS_PLANS,
  getVdsMonthlyEuro,
  getVdsOldMonthlyEuro,
} from "@/lib/vds-catalog";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type VDSPlan = {
  id: string;
  name: string;
  eurOld: number;
  eurNew: number;
  popular?: boolean;
  cores: string;
  ram: string;
  storage: string;
  port: string;
  traffic: string;
};

const vdsPlans: VDSPlan[] = VDS_PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  eurOld: getVdsOldMonthlyEuro(plan.id, false)!,
  eurNew: getVdsMonthlyEuro(plan.id, false, 24)!,
  popular: plan.id === "m",
  cores: plan.cores,
  ram: plan.ram,
  storage: plan.storage,
  port: plan.port,
  traffic: plan.traffic,
}));

const bullets = [
  "Hardware dedicado AMD EPYC™",
  "Armazenamento NVMe ultrarrápido",
  "Tráfego ilimitado com alta largura de banda",
];

export function VdsPage() {
  const router = useRouter();
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

  const gridCols = `minmax(14.5rem, 16rem) repeat(${vdsPlans.length}, minmax(0, 1fr))`;

  return (
    <div className="w-full min-w-0 bg-transparent">
      <section id="plans" className="relative bg-transparent px-4 py-2 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1760px)] px-0 mt-[2rem]">
          <div className="flex flex-col justify-start pb-4 md:pb-6">
            <div className="mx-auto max-w-3xl text-left w-full">
              <Link href="/#planos" className="group mb-8 flex items-center gap-2 text-sm font-bold text-sky-500 transition-all hover:text-sky-400">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar para o site
              </Link>
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded border border-white/20 bg-white/5 px-3 py-1.5 shadow-xl backdrop-blur-md">
                <span className={`${roboto.className} text-[11px] font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2`}>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                  Cloud VDS por menos
                </span>
              </div>
              <h1
                className={`${roboto.className} text-left text-3xl font-black leading-tight tracking-tight text-white md:text-[3rem] uppercase`}
              >
                O poder do servidor dedicado <br /><span className="text-sky-500">com preço de Cloud</span>.
              </h1>
              <ul className="mx-auto mt-6 max-w-xl space-y-3 text-left text-base text-slate-400">
                {bullets.map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" strokeWidth={2.5} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mr-auto mt-8 flex max-w-2xl flex-wrap items-center justify-start gap-3 text-base text-slate-400">
                <span className="text-white font-medium">Nossos clientes dizem</span>
                <span className="font-semibold text-white">Excelente</span>
                <span className="flex text-sky-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                </span>
                <span className="text-slate-500">4,5 de 5 com base em 9.032 avaliações</span>
              </div>
            </div>
          </div>

          {/* Mobile plan cards */}
          <div className="xl:hidden mt-4 space-y-4 pb-4">
            {vdsPlans.map((p) => {
              const { priceSymbol, priceMain, priceCents } = getPriceParts(p.eurNew);
              return (
                <div key={`m-${p.id}`} className={`relative rounded-xl border p-5 bg-[#01101A] backdrop-blur-md ${p.popular ? "border-sky-500" : "border-white/10"}`}>
                  {p.popular && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`${roboto.className} rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white`}>Mais vendido</span>
                    </div>
                  )}
                  <p className={`${roboto.className} pr-[4.5rem] text-xl font-bold tracking-wide text-white`}>{p.name}</p>
                  <span className="text-sm font-medium text-rose-500 line-through opacity-70">{formatBRL(p.eurOld)}</span>
                  <div className="mt-4 flex items-baseline gap-0.5 whitespace-nowrap">
                    <span className="text-sm font-bold text-sky-400 mb-0.5">{priceSymbol}</span>
                    <span className="text-3xl font-extrabold leading-none tracking-tight text-sky-400">{priceMain},</span>
                    <span className="text-xl font-bold text-sky-400">{priceCents}</span>
                    <span className="text-sm font-medium text-slate-400 ml-1">/mês</span>
                  </div>
                  <p className="text-xs font-light text-slate-400">24 meses</p>
                  <button onClick={() => router.push(`/vds/configure/${p.id}?duration=24`)} className={`${roboto.className} mt-3 block w-full rounded-md py-3 text-center text-[13px] font-bold uppercase tracking-wide transition-all ${p.popular ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400" : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                    Começar agora →
                  </button>
                  <p className="mt-2 text-sm font-semibold text-sky-400 uppercase tracking-wide text-center">100% de cashback</p>
                  <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {[
                      { label: "Núcleos", value: p.cores },
                      { label: "RAM", value: p.ram },
                      { label: "Armazenamento", value: p.storage },
                      { label: "Velocidade da Porta", value: p.port },
                      { label: "Tráfego", value: p.traffic },
                    ].map((spec) => (
                      <div key={spec.label} className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">{spec.label}</span>
                        <span className="text-white font-bold text-right ml-2">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden xl:block mt-4 w-full overflow-x-auto overflow-y-visible pt-1 pb-4 scrollbar-thin xl:mt-5">
            <div
              className="grid w-full min-w-[1500px] gap-x-3 gap-y-0 xl:min-w-full"
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* corner */}
               <div className="xl:sticky xl:left-0 xl:z-20 rounded-tl-xl border-l border-r border-t border-b-0 border-white/10 bg-[#000B12] p-3 text-left shadow-xl backdrop-blur-md">
                <p className={`${roboto.className} text-base font-bold uppercase tracking-wide text-white`}>
                  Especificações da máquina
                </p>
              </div>
              {vdsPlans.map((p, idx) => {
                const { priceSymbol, priceMain, priceCents } = getPriceParts(p.eurNew);

                return (
                  <div
                    key={p.id}
                    className={`relative overflow-hidden rounded-t-xl border-l border-r border-t border-b border-white/10 p-5 shadow-2xl backdrop-blur-md min-h-[480px] flex flex-col justify-between ${p.popular ? "border-sky-500 bg-[#01101A]" : "border-white/10 bg-[#01101A]"
                      } ${idx === vdsPlans.length - 1 ? "rounded-tr-xl" : ""}`}
                  >
                    {p.popular ? (
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`${roboto.className} rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white`}
                        >
                          Mais vendido
                        </span>
                      </div>
                    ) : null}
                    <p className={`${roboto.className} pr-[4.5rem] text-2xl font-bold tracking-wide text-white`}>{p.name}</p>
                    <div className="mt-2 flex flex-wrap items-end gap-1.5">
                      <span className="text-lg font-medium text-rose-500 line-through opacity-70">{formatBRL(p.eurOld)}</span>
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-0.5 whitespace-nowrap">
                      <span className="text-sm font-bold text-sky-400 mb-0.5">{priceSymbol}</span>
                      <span className="text-4xl font-extrabold leading-none tracking-tight text-sky-400 md:text-5xl">
                        {priceMain},
                      </span>
                      <span className="text-2xl font-bold text-sky-400 md:text-2xl">{priceCents}</span>
                      <span className="text-sm font-medium text-slate-400 ml-1">/mês</span>
                    </div>
                    <p className="mt-0.5 text-sm font-light leading-snug text-slate-400">24 meses</p>
                    <button
                      onClick={() => router.push(`/vds/configure/${p.id}?duration=24`)}
                      className={`${roboto.className} mt-3 block w-full rounded-md py-3 text-center text-[13px] font-bold uppercase tracking-wide transition-all ${p.popular
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
                        : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      Começar agora →
                    </button>
                    <p className="mt-2 text-sm font-semibold text-sky-400 uppercase tracking-wide text-center">100% de cashback</p>
                    <p className="mt-1 text-sm font-semibold text-sky-500 uppercase tracking-wide text-center">Suporte 24/7 Ativo</p>
                  </div>
                );
              })}

              {[
                { label: "Núcleos", key: "cores" as const },
                { label: "RAM", key: "ram" as const },
                { label: "Armazenamento", key: "storage" as const },
                { label: "Velocidade da Porta", key: "port" as const },
                { label: "Tráfego", key: "traffic" as const },
              ].map((row) => (
                <Fragment key={row.key}>
                  <div
                    className={`xl:sticky xl:left-0 xl:z-20 flex flex-col justify-center border-l border-r border-t-0 border-b-0 border-white/10 bg-[#000B12] p-3 text-left shadow-xl backdrop-blur-md ${row.key === "traffic" ? "rounded-bl-xl border-b" : ""
                      }`}
                  >
                    <span className="text-lg font-bold leading-tight text-white">{row.label}</span>
                  </div>
                  {vdsPlans.map((p, colIdx) => (
                    <div
                      key={`${row.key}-${p.id}`}
                      className={`flex items-center px-2 py-5 text-center text-xl font-bold leading-snug text-white border-l border-r border-t-0 border-b border-white/10 ${p.popular ? "border-sky-500 bg-[#01101A]" : "border-white/10 bg-[#01101A]"
                        } ${row.key === "traffic" ? "rounded-b-xl border-b-white/20" : ""}`}
                    >
                      <span className="w-full">{p[row.key]}</span>
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-end md:text-left">
            <p className="text-sm text-white md:text-right font-medium">
              Hardware dedicado AMD EPYC™ de última geração.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 pt-14 pb-4 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-[min(92vw,1280px)]">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className={`${roboto.className} text-4xl font-black tracking-tight text-white md:text-[2.8rem] uppercase`}>
              Potência bruta para <span className="text-sky-500">projetos críticos</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-400">
              O VDS combina o isolamento de um servidor dedicado com a flexibilidade da nuvem.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">AMD EPYC™</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Performance superior com processadores de classe enterprise.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Isolamento</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Recursos 100% dedicados para sua aplicação.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Baixa Latência</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Conectividade premium em escala global.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Gerenciamento</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-400">
                  Painel completo para controle total do seu VDS.
                </p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="mx-auto mt-16 md:mt-24 max-w-5xl text-center">
            <h3 className={`${roboto.className} text-3xl font-black tracking-tight text-white md:text-[3.5rem] uppercase leading-[1.05]`}>
              9 regiões, 11 localidades,<br />
              <span className="text-sky-500">disponibilidade global</span>.
            </h3>
            <p className="mx-auto mt-4 md:mt-8 max-w-3xl text-lg md:text-xl text-slate-300 font-medium leading-relaxed px-4 md:px-0">
              Dos EUA ao Reino Unido, da Europa à Ásia e Austrália, escolha a localização ideal para baixa latência em todo o mundo.
            </p>
          </div>

          {/* Map Section - Alone, like in home route */}
          <div className="relative mt-0 pt-20 pb-10 md:py-24 overflow-hidden">
            <div className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center opacity-40">
              <div className="w-[150%] max-w-[1600px] scale-[1.3]">
                <LottieMap />
              </div>
            </div>
            {/* Spacer to give height */}
            <div className="relative min-h-[220px] md:min-h-[500px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
