"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Rajdhani } from "next/font/google";
import { Switch } from "@/components/ui/switch";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  const [backupEnabled, setBackupEnabled] = useState(false);
  const gridCols = `minmax(14.5rem, 16rem) repeat(${plans.length}, minmax(0, 1fr))`;

  return (
    <section id="planos" className="relative bg-[#0a0e27] px-4 py-10 md:px-8 md:py-12">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1760px)] px-0">
        <div className="mb-6 text-center">
          <h2 className={`${rajdhani.className} text-2xl font-bold tracking-tight text-white md:text-4xl`}>
            Potência dedicada para tirar seus projetos do papel.
          </h2>
          <p className="mt-2 text-sm text-gray-400 md:text-base">
            Escolha o plano VPS ideal e escale com performance, estabilidade e suporte 24/7.
          </p>
        </div>
        <div className="w-full overflow-x-auto overflow-y-visible pb-4 scrollbar-thin">
          <div
            className="grid w-full min-w-[1700px] gap-x-3 gap-y-0 md:min-w-full"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="md:sticky md:left-0 md:z-20 rounded-tl-xl border border-white/10 border-b-0 bg-[#0d1225] p-3 text-left">
              <p className={`${rajdhani.className} text-[11px] font-bold uppercase tracking-wide text-white/90`}>
                Especificações da embalagem
              </p>
            </div>
            {plans.map((p, idx) => {
              const currentPrice = backupEnabled ? p.priceBackup : p.priceNew;
              const [priceSymbol, priceValue] = currentPrice.split(" ");
              const [priceMain, priceCents] = priceValue.split(",");

              return (
                <div
                  key={p.id}
                  className={`relative overflow-hidden rounded-t-xl border border-b-0 p-3.5 ${
                    p.popular
                      ? "border-[#01FC8D]/60 bg-[#0f1628] shadow-[0_0_28px_rgba(1,252,141,0.06)]"
                      : "border-white/10 bg-[#0d1225]"
                  } ${idx === plans.length - 1 ? "rounded-tr-xl" : ""}`}
                >
                  {p.popular ? (
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`${rajdhani.className} rounded-full bg-[#01FC8D] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-black`}
                      >
                        Mais vendido
                      </span>
                    </div>
                  ) : null}
                  <p className={`${rajdhani.className} pr-[4.5rem] text-[13px] font-bold tracking-wide text-white`}>{p.name}</p>
                  <div className="mt-2 flex flex-wrap items-end gap-1.5">
                    <span className="text-xs font-medium text-[#ff4d4d]/90 line-through">{p.priceOld}</span>
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-0.5 whitespace-nowrap">
                    <span className="text-[12px] font-bold text-white mb-0.5">{priceSymbol}</span>
                    <span className="text-2xl font-extrabold leading-none tracking-tight text-white md:text-3xl">
                      {priceMain},
                    </span>
                    <span className="text-base font-bold text-white">{priceCents}</span>
                    <span className="text-[10px] font-medium text-gray-400 ml-1">/mês</span>
                  </div>
                  <p className="mt-0.5 text-[10px] font-light leading-snug text-gray-500">12 meses</p>
                  <Link
                    href={`https://wa.me/558398849027?text=${encodeURIComponent(
                      `Olá! Escolhi o plano ${p.name} ${
                        backupEnabled ? "com Backup Automático" : ""
                      } e gostaria de dar continuidade ao processo.`
                    )}`}
                    target="_blank"
                    className={`${rajdhani.className} mt-3 block w-full rounded-md py-2 text-center text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      p.popular
                        ? "bg-[#01FC8D] text-black shadow-[0_4px_14px_rgba(1,252,141,0.2)] hover:bg-[#01FC8D]/90"
                        : "border border-white/20 bg-transparent text-white hover:bg-white/5"
                    }`}
                  >
                    Começar agora →
                  </Link>
                  <p className="mt-2 text-[10px] font-semibold text-[#01FC8D]">100% de cashback</p>
                  <p className="mt-1 text-[10px] font-semibold text-[#38bdf8]">Suporte 24/7</p>
                </div>
              );
            })}

            <div className="md:sticky md:left-0 md:z-20 flex flex-col justify-center gap-1.5 border border-white/10 border-t-0 bg-[#0d1225] p-3 text-left">
              <span className="text-xs font-medium text-white/85">VPS com backup automático</span>
              <div className="flex items-center gap-2">
                <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} />
                <span className="text-[11px] text-gray-500">{backupEnabled ? "Ativado" : "Desativado"}</span>
              </div>
            </div>
            {plans.map((p) => (
              <div
                key={`b-${p.id}`}
                className={`flex items-center justify-center border border-t-0 px-2 py-2.5 text-center text-[11px] text-gray-400 ${
                  p.popular ? "border-[#01FC8D]/60 bg-[#0f1628]" : "border-white/10 bg-[#0d1225]"
                }`}
              >
                {backupEnabled ? <Check className="h-4 w-4 text-[#01FC8D]" strokeWidth={2.8} /> : null}
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
                  className={`md:sticky md:left-0 md:z-20 flex flex-col justify-center border border-white/10 border-t-0 bg-[#0d1225] p-3 text-left ${
                    row.key === "traffic" ? "rounded-b-xl border-b" : ""
                  }`}
                >
                  <span className="text-[11px] font-semibold leading-tight text-white/90">{row.label}</span>
                  {"sub" in row && row.sub ? (
                    <span className="mt-0.5 text-[9px] leading-tight text-gray-500">{row.sub}</span>
                  ) : null}
                </div>
                {plans.map((p) => (
                  <div
                    key={`${row.key}-${p.id}`}
                    className={`flex items-center border border-t-0 px-2 py-2.5 text-center text-[11px] font-light leading-snug text-gray-300 md:text-xs ${
                      p.popular ? "border-[#01FC8D]/60 bg-[#0f1628]" : "border-white/10 bg-[#0d1225]"
                    } ${row.key === "traffic" ? "rounded-b-xl border-b" : ""} ${
                      row.key === "traffic" ? "border-b" : ""
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
          <p className="text-sm text-gray-400 md:text-right">
            Quer ainda mais potência?{" "}
            <Link href="/vds" className="font-semibold text-[#01FC8D] underline-offset-2 hover:underline">
              Escolha um VDS
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
