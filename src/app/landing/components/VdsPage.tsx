"use client";

import { useRouter } from "next/navigation";
import { Cpu, HardDrive, ShieldCheck, Wallet } from "lucide-react";
import { Roboto } from "next/font/google";
import LottieMap from "./LottieMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

type VdsPlan = {
  name: string;
  oldPrice: string;
  newPrice: string;
  cents: string;
  cores: string;
  cpu: string;
  ram: string;
  storage: string;
  speed: string;
};

const vdsPlans: VdsPlan[] = [
  {
    name: "Cloud VDS S",
    oldPrice: "R$ 463,68",
    newPrice: "R$ 370,",
    cents: "94",
    cores: "3 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "24 GB de RAM",
    storage: "NVMe de 180 GB",
    speed: "Porta de 250 Mbit/s",
  },
  {
    name: "Cloud VDS M",
    oldPrice: "R$ 551,63",
    newPrice: "R$ 441,",
    cents: "30",
    cores: "4 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "32 GB de RAM",
    storage: "NVMe de 240 GB",
    speed: "Porta de 500 Mbit/s",
  },
  {
    name: "Cloud VDS L",
    oldPrice: "R$ 831,43",
    newPrice: "R$ 665,",
    cents: "14",
    cores: "6 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "48 GB de RAM",
    storage: "NVMe de 360 GB",
    speed: "Porta de 750 Mbit/s",
  },
  {
    name: "Cloud VDS XL",
    oldPrice: "R$ 1.103,25",
    newPrice: "R$ 882,",
    cents: "60",
    cores: "8 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "64 GB de RAM",
    storage: "NVMe de 480 GB",
    speed: "Porta de 1 Gbit/s",
  },
  {
    name: "Cloud VDS XXL",
    oldPrice: "R$ 1.558,95",
    newPrice: "R$ 1.247,",
    cents: "16",
    cores: "12 Núcleos Físicos",
    cpu: "AMD EPYC 7282 2.8 GHz",
    ram: "96 GB de RAM",
    storage: "NVMe de 720 GB",
    speed: "Porta de 1 Gbit/s",
  },
];

export function VdsPage() {
  const router = useRouter();
  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto w-full max-w-[min(92vw,1760px)] mt-[2rem]">
        <div className="flex flex-col justify-start pb-4 md:pb-6">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <Wallet className="h-4 w-4 text-emerald-500" />
              <span className={`${roboto.className} text-xs font-bold uppercase tracking-wider text-emerald-600`}>
                Cloud VDS por menos
              </span>
            </div>

            <h1 className={`${roboto.className} mx-auto max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl`}>
              Servidores Virtuais Dedicados:
              <br />
              O Equilíbrio Perfeito
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
              Obtenha o melhor dos dois mundos: VPS em nuvem e servidores dedicados, com ótimo preço. Cada VPS inclui:
            </p>

            <ul className="mx-auto mt-6 max-w-3xl space-y-3 text-left text-base text-slate-600">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                100% de RAM dedicada - sem compartilhamento, apenas velocidade.
              </li>
              <li className="flex items-start gap-2.5">
                <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                Processadores AMD de última geração - núcleos físicos dedicados.
              </li>
              <li className="flex items-start gap-2.5">
                <HardDrive className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                Armazenamento SSD NVMe de nível empresarial.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-3 scrollbar-thin md:mt-5">
          <div className="flex min-w-[1180px] gap-4 md:justify-center">
            {vdsPlans.map((plan) => (
              <article
                key={plan.name}
                className="w-[230px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-3.5">
                  <p className={`${roboto.className} text-[13px] font-bold tracking-wide text-slate-900`}>{plan.name}</p>
                  <p className="mt-2 text-xs font-medium text-rose-500 line-through opacity-70">{plan.oldPrice}</p>
                  <p className="mt-0.5 leading-none text-slate-900">
                    <span className="text-4xl font-extrabold">{plan.newPrice}</span>
                    <span className="align-top text-lg font-bold">{plan.cents}</span>
                    <span className="ml-1 text-[10px] font-medium text-slate-400">/mês</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-light leading-snug text-slate-400">12 meses</p>
                  <button
                    onClick={() => {
                      const planId = plan.name.split(" ").pop()?.toLowerCase();
                      const supportedPlans = ["s", "m", "l", "xl", "xxl"];
                      if (supportedPlans.includes(planId || "")) {
                        router.push(`/vds/configure/${planId}`);
                      } else {
                        window.open(`https://wa.me/558398849027?text=${encodeURIComponent(`Olá! Escolhi o plano ${plan.name} e gostaria de dar continuidade ao processo.`)}`, "_blank");
                      }
                    }}
                    className={`${roboto.className} mt-3 block w-full rounded-md border border-slate-200 bg-transparent py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50`}
                  >
                    Começar agora →
                  </button>
                </div>

                <div className="space-y-0 border-t border-slate-100 text-[11px] text-slate-600 md:text-xs">
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold first:border-t-0">{plan.cores}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 text-slate-400 font-medium">{plan.cpu}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">{plan.ram}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">{plan.storage}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">{plan.speed}</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold">Tráfego ilimitado*</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold text-emerald-600 uppercase tracking-wider text-[10px] font-extrabold">100% de cashback</p>
                  <p className="border-t border-slate-100 px-3 py-2.5 font-semibold text-sky-600 uppercase tracking-wider text-[10px] font-extrabold">Suporte 24/7 Ativo</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
          <h3 className={`${roboto.className} text-2xl font-bold text-slate-900 md:text-[2rem]`}>Firewall Grátis Incluso</h3>
          <p className="mt-2 text-lg text-slate-600">
            Bloqueie tráfego indesejado e defina regras personalizadas no seu Painel de Controle do Cliente.
          </p>
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
