"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Check, Globe2, MessageCircle, Rocket, Star, Wallet } from "lucide-react";
import { Roboto } from "next/font/google";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LottieMap from "./LottieMap";

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
    eurOld: 4.50,
    eurNew: 3.60,
    eurBackup: 5.10,
    vcpu: "4 núcleos",
    ram: "8 GB",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1",
    traffic: "Porta de 200 Mbit/s",
  },
  {
    id: "20",
    name: "Cloud VPS 20",
    eurOld: 7.00,
    eurNew: 5.60,
    eurBackup: 7.60,
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
    eurOld: 14.00,
    eurNew: 11.20,
    eurBackup: 14.70,
    vcpu: "8 núcleos",
    ram: "24 GB",
    storage: "200 GB NVMe ou SSD 400 GB",
    snapshots: "3",
    traffic: "Porta de 600 Mbit/s",
  },
  {
    id: "40",
    name: "Cloud VPS 40",
    eurOld: 25.00,
    eurNew: 20.00,
    eurBackup: 26.00,
    vcpu: "12 núcleos",
    ram: "48 GB",
    storage: "250 GB NVMe ou SSD 500 GB",
    snapshots: "3",
    traffic: "Porta de 800 Mbit/s",
  },
  {
    id: "50",
    name: "Cloud VPS 50",
    eurOld: 37.00,
    eurNew: 29.60,
    eurBackup: 37.10,
    vcpu: "16 núcleos",
    ram: "64 GB",
    storage: "300 GB NVMe ou SSD 600 GB",
    snapshots: "3",
    traffic: "Porta de 1 Gbit/s",
  },
  {
    id: "60",
    name: "Cloud VPS 60",
    eurOld: 49.00,
    eurNew: 39.20,
    eurBackup: 48.70,
    vcpu: "18 núcleos",
    ram: "96 GB",
    storage: "350 GB NVMe ou SSD 700 GB",
    snapshots: "3",
    traffic: "Porta de 1 Gbit/s",
  },
];

const bullets = [
  "Melhor relação custo-benefício",
  "Tráfego ilimitado até 1 Gbit/s",
  "Proteção DDoS sempre ativa",
];

export function VpsCloudPage() {
  const router = useRouter();
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [currentRate, setCurrentRate] = useState(11.72);

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

  const gridCols = `minmax(14.5rem, 16rem) repeat(${plans.length}, minmax(0, 1fr))`;

  return (
    <div className="w-full min-w-0 bg-slate-50">
      <section className="relative bg-slate-50 px-4 py-8 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1760px)] px-0 mt-[2rem]">
          <div className="flex flex-col justify-start pb-4 md:pb-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="h-3 w-1 rounded-sm bg-emerald-500" />
                <span className={`${roboto.className} text-[11px] font-bold uppercase tracking-widest text-emerald-600`}>
                  VPS em nuvem
                </span>
              </div>
              <h1
                className={`${roboto.className} text-center text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-[2.35rem]`}
              >
                O melhor VPS em nuvem em termos de custo-benefício do mundo.
              </h1>
              <ul className="mx-auto mt-6 max-w-xl space-y-3 text-left text-sm text-slate-600">
                {bullets.map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                <span className="text-slate-900 font-medium">Nossos clientes dizem</span>
                <span className="font-semibold text-slate-900">Excelente</span>
                <span className="flex text-emerald-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                </span>
                <span className="text-slate-400">4,5 de 5 com base em 9.032 avaliações</span>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto overflow-y-visible pt-1 pb-4 scrollbar-thin md:mt-5">
            <div
              className="grid w-full min-w-[1700px] gap-x-3 gap-y-0 md:min-w-full"
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* corner */}
              <div className="md:sticky md:left-0 md:z-20 rounded-tl-xl border border-slate-200 border-b-0 bg-white p-3 text-left shadow-sm">
                <p className={`${roboto.className} text-sm font-bold uppercase tracking-wide text-slate-800`}>
                  Especificações da embalagem
                </p>
              </div>
              {plans.map((p, idx) => {
                const currentEurPrice = backupEnabled ? p.eurBackup : p.eurNew;
                const formattedPrice = formatBRL(currentEurPrice).replace(/\u00A0/g, " ");
                const priceParts = formattedPrice.split(" ");
                const priceSymbol = priceParts[0];
                const priceValue = priceParts.slice(1).join("");
                const [priceMain, priceCents] = priceValue.split(",");

                return (
                  <div
                    key={p.id}
                    className={`relative overflow-hidden rounded-t-xl border border-b-0 p-3.5 shadow-sm ${p.popular
                        ? "border-emerald-500/60 bg-white ring-1 ring-emerald-500/20"
                        : "border-slate-200 bg-white"
                      } ${idx === plans.length - 1 ? "rounded-tr-xl" : ""}`}
                  >
                    {p.popular ? (
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`${roboto.className} rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white`}
                        >
                          Mais vendido
                        </span>
                      </div>
                    ) : null}
                    <p className={`${roboto.className} pr-[4.5rem] text-base font-bold tracking-wide text-slate-900`}>{p.name}</p>
                    <div className="mt-2 flex flex-wrap items-end gap-1.5">
                      <span className="text-xs font-medium text-rose-500 line-through opacity-70">{formatBRL(p.eurOld)}</span>
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-0.5 whitespace-nowrap">
                      <span className="text-[12px] font-bold text-slate-900 mb-0.5">{priceSymbol}</span>
                      <span className="text-xl font-extrabold leading-none tracking-tight text-slate-900 md:text-4xl">
                        {priceMain},
                      </span>
                      <span className="text-xl font-bold text-slate-900">{priceCents}</span>
                      <span className="text-xs font-medium text-slate-400 ml-1">/mês</span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-light leading-snug text-slate-400">12 meses</p>
                    <button
                      onClick={() => router.push(`/vps/configure/${p.id}`)}
                      className={`${roboto.className} mt-3 block w-full rounded-md py-2 text-center text-[11px] font-bold uppercase tracking-wide transition-colors ${p.popular
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                          : "border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      Começar agora →
                    </button>
                    <p className="mt-2 text-xs font-semibold text-emerald-600">100% de cashback</p>
                    <p className="mt-1 text-xs font-semibold text-sky-600">Suporte 24/7 Ativo</p>
                  </div>
                );
              })}

              {/* toggle row */}
              <div className="md:sticky md:left-0 md:z-20 flex flex-col justify-center gap-1.5 border border-slate-200 border-t-0 bg-white p-3 text-left shadow-sm">
                <span className="text-xs font-medium text-slate-700">VPS com backup automático</span>
                <div className="flex items-center gap-2">
                  <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} />
                  <span className="text-[11px] text-slate-500">{backupEnabled ? "Ativado" : "Desativado"}</span>
                </div>
              </div>
              {plans.map((p) => (
                <div
                  key={`b-${p.id}`}
                  className={`flex items-center justify-center border border-t-0 px-2 py-2.5 text-center text-[11px] text-slate-400 ${p.popular ? "border-emerald-500/60 bg-white ring-1 ring-emerald-500/10" : "border-slate-200 bg-white"
                    }`}
                >
                  {backupEnabled ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.8} /> : null}
                </div>
              ))}

              {[
                { label: "Núcleos de vCPU", key: "vcpu" as const },
                { label: "RAM (GB)", key: "ram" as const },
                {
                  label: "NVMe (GB) / SSD (GB)",
                  sub: "+ Espaço de armazenamento extra",
                  key: "storage" as const,
                },
                { label: "Instantâneos", key: "snapshots" as const },
                { label: "Tráfego (entrada ilimitada)", key: "traffic" as const },
              ].map((row) => (
                <Fragment key={row.key}>
                  <div
                    className={`md:sticky md:left-0 md:z-20 flex flex-col justify-center border border-slate-200 border-t-0 bg-white p-3 text-left shadow-sm ${row.key === "traffic" ? "rounded-b-xl border-b" : ""
                      }`}
                  >
                    <span className="text-base font-semibold leading-tight text-slate-800">{row.label}</span>
                    {"sub" in row && row.sub ? (
                      <span className="mt-0.5 text-[9px] leading-tight text-slate-400">{row.sub}</span>
                    ) : null}
                  </div>
                  {plans.map((p, colIdx) => (
                    <div
                      key={`${row.key}-${p.id}`}
                      className={`flex items-center border border-t-0 px-2 py-2.5 text-center text-lg font-bold leading-snug text-slate-700 ${p.popular ? "border-emerald-500/60 bg-white ring-1 ring-emerald-500/10" : "border-slate-200 bg-white"
                        } ${row.key === "traffic" ? "rounded-b-xl border-b" : ""} ${row.key === "traffic" ? "border-b" : ""
                        }`}
                    >
                      <span className="w-full">{p[row.key]}</span>
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-end md:text-left">
            <p className="text-sm text-slate-400 md:text-right">
              Quer ainda mais potência?{" "}
              <Link href="/vds" className="font-semibold text-emerald-600 underline-offset-2 hover:underline">
                Escolha um VDS
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-[min(92vw,1280px)]">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className={`${roboto.className} text-3xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]`}>
              Construído pensando nas suas necessidades.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
              Projetamos todos os nossos planos de VPS para oferecer o valor e o desempenho que seus projetos exigem.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-2.5 text-emerald-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-slate-900">A partir de {formatBRL(plans[0].eurNew)} por mês</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                  Comece com um preço justo e escale quando estiver pronto, sem taxas ocultas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-2.5 text-emerald-600">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-slate-900">VPS 20: o melhor VPS por {formatBRL(plans[1].eurNew)}/mês</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                  Definimos o melhor custo-benefício para quem precisa de mais performance gastando menos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-2.5 text-emerald-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-slate-900">Desenvolvido com base no seu feedback</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                  Você pediu melhor desempenho, maior confiabilidade e suporte ágil. Nós entregamos os três.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-2.5 text-emerald-600">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-slate-900">Valor incomparável em todos os planos</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                  Obtenha mais poder de processamento, memória e armazenamento pelo seu dinheiro.
                </p>
              </div>
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
    </div>
  );
}
