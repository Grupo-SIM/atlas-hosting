"use client";

import {
  ArrowLeft,
  Check,
  Globe2,
  MessageCircle,
  Rocket,
  Star,
  Wallet,
} from "lucide-react";
import { Roboto } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import {
  DISPLAY_CURRENCY_CHANGE_EVENT,
  readDisplayCurrency,
} from "@/lib/display-currency";
import {
  getVdsMonthlyEuro,
  getVdsOldMonthlyEuro,
  VDS_PLANS,
} from "@/lib/vds-catalog";
import {
  convertVpsPriceFromEuro,
  type VpsDisplayCurrency,
} from "@/lib/vps-price-display";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

interface VDSPlan {
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
}

const vdsPlans: VDSPlan[] = VDS_PLANS.map(plan => ({
  cores: plan.cores,
  eurNew: getVdsMonthlyEuro(plan.id, false, 24)!,
  eurOld: getVdsOldMonthlyEuro(plan.id, false)!,
  id: plan.id,
  name: plan.name,
  popular: plan.id === "m",
  port: plan.port,
  ram: plan.ram,
  storage: plan.storage,
  traffic: plan.traffic,
}));

const bullets = [
  "Hardware dedicado AMD EPYC™",
  "Armazenamento NVMe ultrarrápido",
  "Tráfego ilimitado com alta largura de banda",
];

export function VdsPage() {
  const router = useRouter();
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

  const gridCols = `minmax(14.5rem, 16rem) repeat(${vdsPlans.length}, minmax(0, 1fr))`;

  return (
    <div className="w-full min-w-0 bg-transparent">
      <section
        className="relative bg-transparent px-4 py-2 md:px-8 md:py-10"
        id="plans"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 mx-auto mt-[2rem] w-full max-w-[min(92vw,1760px)] px-0">
          <div className="flex flex-col justify-start pb-4 md:pb-6">
            <div className="mx-auto w-full max-w-3xl text-left">
              <Link
                className="group mb-8 flex items-center gap-2 font-bold text-sky-500 text-sm transition-all hover:text-sky-400"
                href="/#planos"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar para o site
              </Link>
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded border border-white/20 bg-white/5 px-3 py-1.5 shadow-xl backdrop-blur-md">
                <span
                  className={`${roboto.className} flex items-center gap-2 font-bold text-[11px] text-sky-400 uppercase tracking-widest`}
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                  Cloud VDS por menos
                </span>
              </div>
              <h1
                className={`${roboto.className} text-left font-black text-3xl text-white uppercase leading-tight tracking-tight md:text-[3rem]`}
              >
                O poder do servidor dedicado <br />
                <span className="text-sky-500">com preço de Cloud</span>.
              </h1>
              <ul className="mx-auto mt-6 max-w-xl space-y-3 text-left text-base text-slate-400">
                {bullets.map(t => (
                  <li className="flex items-start gap-2.5" key={t}>
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-sky-500"
                      strokeWidth={2.5}
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 mr-auto flex max-w-2xl flex-wrap items-center justify-start gap-3 text-base text-slate-400">
                <span className="font-medium text-white">
                  Nossos clientes dizem
                </span>
                <span className="font-semibold text-white">Excelente</span>
                <span className="flex text-sky-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      className="h-4 w-4 fill-current"
                      key={i}
                      strokeWidth={0}
                    />
                  ))}
                </span>
                <span className="text-slate-500">
                  4,5 de 5 com base em 9.032 avaliações
                </span>
              </div>
            </div>
          </div>

          {/* Mobile plan cards */}
          <div className="mt-4 space-y-4 pb-4 xl:hidden">
            {vdsPlans.map(p => {
              const { priceSymbol, priceMain, priceCents } = getPriceParts(
                p.eurNew
              );
              return (
                <div
                  className={`relative rounded-xl border bg-[#01101A] p-5 backdrop-blur-md ${p.popular ? "border-sky-500" : "border-white/10"}`}
                  key={`m-${p.id}`}
                >
                  {p.popular && (
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`${roboto.className} rounded-full bg-sky-500 px-2 py-0.5 font-extrabold text-[10px] text-white uppercase tracking-wide`}
                      >
                        Mais vendido
                      </span>
                    </div>
                  )}
                  <p
                    className={`${roboto.className} pr-[4.5rem] font-bold text-white text-xl tracking-wide`}
                  >
                    {p.name}
                  </p>
                  <span className="font-medium text-rose-500 text-sm line-through opacity-70">
                    {formatBRL(p.eurOld)}
                  </span>
                  <div className="mt-4 flex items-baseline gap-0.5 whitespace-nowrap">
                    <span className="mb-0.5 font-bold text-sky-400 text-sm">
                      {priceSymbol}
                    </span>
                    <span className="font-extrabold text-3xl text-sky-400 leading-none tracking-tight">
                      {priceMain},
                    </span>
                    <span className="font-bold text-sky-400 text-xl">
                      {priceCents}
                    </span>
                    <span className="ml-1 font-medium text-slate-400 text-sm">
                      /mês
                    </span>
                  </div>
                  <p className="font-light text-slate-400 text-xs">24 meses</p>
                  <button
                    className={`${roboto.className} mt-3 block w-full rounded-md py-3 text-center font-bold text-[13px] uppercase tracking-wide transition-all ${p.popular ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400" : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
                    onClick={() =>
                      router.push(`/vds/configure/${p.id}?duration=24`)
                    }
                  >
                    Começar agora →
                  </button>
                  <p className="mt-2 text-center font-semibold text-sky-400 text-sm uppercase tracking-wide">
                    100% de cashback
                  </p>
                  <div className="mt-4 space-y-2 border-white/10 border-t pt-4">
                    {[
                      { label: "Núcleos", value: p.cores },
                      { label: "RAM", value: p.ram },
                      { label: "Armazenamento", value: p.storage },
                      { label: "Velocidade da Porta", value: p.port },
                      { label: "Tráfego", value: p.traffic },
                    ].map(spec => (
                      <div
                        className="flex justify-between text-sm"
                        key={spec.label}
                      >
                        <span className="font-medium text-slate-400">
                          {spec.label}
                        </span>
                        <span className="ml-2 text-right font-bold text-white">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="scrollbar-thin mt-4 hidden w-full overflow-x-auto overflow-y-visible pt-1 pb-4 xl:mt-5 xl:block">
            <div
              className="grid w-full min-w-[1500px] gap-x-3 gap-y-0 xl:min-w-full"
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* corner */}
              <div className="rounded-tl-xl border-white/10 border-t border-r border-b-0 border-l bg-[#000B12] p-3 text-left shadow-xl backdrop-blur-md xl:sticky xl:left-0 xl:z-20">
                <p
                  className={`${roboto.className} font-bold text-base text-white uppercase tracking-wide`}
                >
                  Especificações da máquina
                </p>
              </div>
              {vdsPlans.map((p, idx) => {
                const { priceSymbol, priceMain, priceCents } = getPriceParts(
                  p.eurNew
                );

                return (
                  <div
                    className={`relative flex min-h-[480px] flex-col justify-between overflow-hidden rounded-t-xl border-white/10 border-t border-r border-b border-l p-5 shadow-2xl backdrop-blur-md ${
                      p.popular
                        ? "border-sky-500 bg-[#01101A]"
                        : "border-white/10 bg-[#01101A]"
                    } ${idx === vdsPlans.length - 1 ? "rounded-tr-xl" : ""}`}
                    key={p.id}
                  >
                    {p.popular ? (
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`${roboto.className} rounded-full bg-sky-500 px-2 py-0.5 font-extrabold text-[10px] text-white uppercase tracking-wide`}
                        >
                          Mais vendido
                        </span>
                      </div>
                    ) : null}
                    <p
                      className={`${roboto.className} pr-[4.5rem] font-bold text-2xl text-white tracking-wide`}
                    >
                      {p.name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-1.5">
                      <span className="font-medium text-lg text-rose-500 line-through opacity-70">
                        {formatBRL(p.eurOld)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-0.5 whitespace-nowrap">
                      <span className="mb-0.5 font-bold text-sky-400 text-sm">
                        {priceSymbol}
                      </span>
                      <span className="font-extrabold text-4xl text-sky-400 leading-none tracking-tight md:text-5xl">
                        {priceMain},
                      </span>
                      <span className="font-bold text-2xl text-sky-400 md:text-2xl">
                        {priceCents}
                      </span>
                      <span className="ml-1 font-medium text-slate-400 text-sm">
                        /mês
                      </span>
                    </div>
                    <p className="mt-0.5 font-light text-slate-400 text-sm leading-snug">
                      24 meses
                    </p>
                    <button
                      className={`${roboto.className} mt-3 block w-full rounded-md py-3 text-center font-bold text-[13px] uppercase tracking-wide transition-all ${
                        p.popular
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
                          : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() =>
                        router.push(`/vds/configure/${p.id}?duration=24`)
                      }
                    >
                      Começar agora →
                    </button>
                    <p className="mt-2 text-center font-semibold text-sky-400 text-sm uppercase tracking-wide">
                      100% de cashback
                    </p>
                    <p className="mt-1 text-center font-semibold text-sky-500 text-sm uppercase tracking-wide">
                      Suporte 24/7 Ativo
                    </p>
                  </div>
                );
              })}

              {[
                { key: "cores" as const, label: "Núcleos" },
                { key: "ram" as const, label: "RAM" },
                { key: "storage" as const, label: "Armazenamento" },
                { key: "port" as const, label: "Velocidade da Porta" },
                { key: "traffic" as const, label: "Tráfego" },
              ].map(row => (
                <Fragment key={row.key}>
                  <div
                    className={`flex flex-col justify-center border-white/10 border-t-0 border-r border-b-0 border-l bg-[#000B12] p-3 text-left shadow-xl backdrop-blur-md xl:sticky xl:left-0 xl:z-20 ${
                      row.key === "traffic" ? "rounded-bl-xl border-b" : ""
                    }`}
                  >
                    <span className="font-bold text-lg text-white leading-tight">
                      {row.label}
                    </span>
                  </div>
                  {vdsPlans.map((p, colIdx) => (
                    <div
                      className={`flex items-center border-white/10 border-t-0 border-r border-b border-l px-2 py-5 text-center font-bold text-white text-xl leading-snug ${
                        p.popular
                          ? "border-sky-500 bg-[#01101A]"
                          : "border-white/10 bg-[#01101A]"
                      } ${row.key === "traffic" ? "rounded-b-xl border-b-white/20" : ""}`}
                      key={`${row.key}-${p.id}`}
                    >
                      <span className="w-full">{p[row.key]}</span>
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-end md:text-left">
            <p className="font-medium text-sm text-white md:text-right">
              Hardware dedicado AMD EPYC™ de última geração.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 pt-14 pb-4 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-[min(92vw,1280px)]">
          <div className="mx-auto max-w-4xl text-center">
            <h2
              className={`${roboto.className} font-black text-4xl text-white uppercase tracking-tight md:text-[2.8rem]`}
            >
              Potência bruta para{" "}
              <span className="text-sky-500">projetos críticos</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-400 text-xl">
              O VDS combina o isolamento de um servidor dedicado com a
              flexibilidade da nuvem.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md md:grid-cols-2 md:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl leading-tight">
                  AMD EPYC™
                </h3>
                <p className="mt-1 text-base text-slate-400 leading-relaxed">
                  Performance superior com processadores de classe enterprise.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl leading-tight">
                  Isolamento
                </h3>
                <p className="mt-1 text-base text-slate-400 leading-relaxed">
                  Recursos 100% dedicados para sua aplicação.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl leading-tight">
                  Baixa Latência
                </h3>
                <p className="mt-1 text-base text-slate-400 leading-relaxed">
                  Conectividade premium em escala global.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-2.5 text-sky-400">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl leading-tight">
                  Gerenciamento
                </h3>
                <p className="mt-1 text-base text-slate-400 leading-relaxed">
                  Painel completo para controle total do seu VDS.
                </p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="mx-auto mt-16 max-w-5xl text-center md:mt-24">
            <h3
              className={`${roboto.className} font-black text-3xl text-white uppercase leading-[1.05] tracking-tight md:text-[3.5rem]`}
            >
              9 regiões, 11 localidades,
              <br />
              <span className="text-sky-500">disponibilidade global</span>.
            </h3>
            <p className="mx-auto mt-4 max-w-3xl px-4 font-medium text-lg text-slate-300 leading-relaxed md:mt-8 md:px-0 md:text-xl">
              Dos EUA ao Reino Unido, da Europa à Ásia e Austrália, escolha a
              localização ideal para baixa latência em todo o mundo.
            </p>
          </div>

          {/* Map Section - Alone, like in home route */}
          <div className="relative mt-0 overflow-hidden pt-20 pb-10 md:py-24">
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-40">
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
