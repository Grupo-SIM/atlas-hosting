"use client";

import Link from "next/link";
import { HardDrive, ShieldCheck } from "lucide-react";
import { Roboto } from "next/font/google";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type StoragePlan = {
  name: string;
  oldPrice: string;
  newPrice: string;
  cents: string;
  vcpu: string;
  ram: string;
  storage: string;
  speed: string;
  popular?: boolean;
};

const storagePlans: StoragePlan[] = [
  {
    name: "Storage VPS 10 (S)",
    oldPrice: "R$ 52,74",
    newPrice: "R$ 42,",
    cents: "19",
    vcpu: "2 núcleos de vCPU",
    ram: "4 GB de RAM",
    storage: "300 GB SSD",
    speed: "Porta de 200 Mbit/s",
  },
  {
    name: "Storage VPS 20 (M)",
    oldPrice: "R$ 82,04",
    newPrice: "R$ 65,",
    cents: "63",
    vcpu: "3 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "400 GB SSD",
    speed: "Porta de 300 Mbit/s",
    popular: true,
  },
  {
    name: "Storage VPS 30 (L)",
    oldPrice: "R$ 164,08",
    newPrice: "R$ 131,",
    cents: "26",
    vcpu: "6 núcleos de vCPU",
    ram: "18 GB de RAM",
    storage: "1 TB SSD",
    speed: "Porta de 600 Mbit/s",
  },
  {
    name: "Storage VPS 40 (XL)",
    oldPrice: "R$ 293,00",
    newPrice: "R$ 234,",
    cents: "40",
    vcpu: "8 núcleos de vCPU",
    ram: "30 GB de RAM",
    storage: "1.2 TB SSD",
    speed: "Porta de 800 Mbit/s",
  },
  {
    name: "Storage VPS 50 (XXL)",
    oldPrice: "R$ 433,64",
    newPrice: "R$ 346,",
    cents: "91",
    vcpu: "14 núcleos de vCPU",
    ram: "50 GB de RAM",
    storage: "1.4 TB SSD",
    speed: "Porta de 1 Gbit/s",
  },
];

export function VpsStoragePage() {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1760px)] mt-[2rem]">
        <div className="flex flex-col justify-start pb-4 md:pb-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <HardDrive className="h-4 w-4 text-emerald-500" />
              <span className={`${roboto.className} text-xs font-bold uppercase tracking-wider text-emerald-600`}>
                Nova linha de VPS de armazenamento
              </span>
            </div>

            <h1 className={`${roboto.className} max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl`}>
              Melhor VPS com armazenamento SSD pelo menor preço
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
              Obtenha muito espaço de armazenamento com o melhor custo-benefício do mercado. Nosso VPS para
              armazenamento pode ser usado para qualquer aplicação ou projeto.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-3 scrollbar-thin md:mt-5">
          <div className="flex min-w-[1180px] gap-4 md:justify-center">
            {storagePlans.map((plan) => (
              <article
                key={plan.name}
                className={`w-[230px] shrink-0 overflow-hidden rounded-xl border bg-white shadow-sm ${plan.popular
                    ? "border-emerald-500/60 ring-1 ring-emerald-500/10"
                    : "border-slate-200"
                  }`}
              >
                <div className="relative p-3.5">
                  {plan.popular ? (
                    <span className={`${roboto.className} absolute right-2.5 top-2.5 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm`}>
                      Valor imbatível
                    </span>
                  ) : null}
                  <p className={`${roboto.className} pr-[4.5rem] text-[13px] font-bold tracking-wide text-slate-900`}>
                    {plan.name}
                  </p>
                  <p className="mt-2 text-xs font-medium text-rose-500 line-through opacity-70">{plan.oldPrice}</p>
                  <p className="mt-0.5 leading-none text-slate-900">
                    <span className="text-4xl font-extrabold">{plan.newPrice}</span>
                    <span className="align-top text-lg font-bold">{plan.cents}</span>
                    <span className="ml-1 text-[10px] font-medium text-slate-400">/mês</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-light leading-snug text-slate-400">por um período de 12 meses</p>
                  <Link
                    href={`/vps-armazenamento/configure/${plan.name.match(/\d+/)?.[0] || "10"}`}
                    className={`${roboto.className} mt-3 block w-full rounded-md border border-slate-200 bg-transparent py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50`}
                  >
                    Começar agora →
                  </Link>
                </div>

                <div className="space-y-0 border-t border-slate-100 text-[11px] text-slate-600 md:text-xs">
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold first:border-t-0">{plan.vcpu}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">{plan.ram}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">{plan.storage}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">{plan.speed}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">Tráfego ilimitado*</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold text-emerald-600">100% de cashback</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold text-sky-600 text-xs uppercase tracking-wider font-extrabold">Suporte 24/7 Ativo</p>
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
