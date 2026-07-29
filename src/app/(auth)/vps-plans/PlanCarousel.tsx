"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Check } from "lucide-react";
import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { PlanCardData } from "./page";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const rowSpecs = [
  { key: "cores" as const, label: "Núcleos de vCPU" },
  { key: "ram" as const, label: "RAM" },
  { key: "storage" as const, label: "Armazenamento" },
  { key: "port" as const, label: "Velocidade da Porta" },
];

function formatBrl(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(v);
}

function getPriceParts(v: number) {
  const [whole, cents] = v.toFixed(2).split(".");
  return {
    priceCents: cents,
    priceMain: new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 0,
    }).format(Number(whole)),
  };
}

export function PlanCarousel({
  plans,
  showBackupToggle = false,
}: {
  plans: PlanCardData[];
  showBackupToggle?: boolean;
}) {
  const router = useRouter();
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });

  return (
    <div className="space-y-4">
      {showBackupToggle && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-5 py-4 backdrop-blur-md xl:hidden">
          <Switch
            checked={backupEnabled}
            className="data-[state=checked]:bg-sky-500"
            onCheckedChange={setBackupEnabled}
          />
          <div>
            <span className="font-black text-foreground text-sm uppercase tracking-widest">
              Backup automático
            </span>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {backupEnabled ? "Ativado" : "Desativado"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-stretch justify-start gap-4 xl:flex-row">
        {/* Card de especificações fixo */}
        <div className="hidden shrink-0 xl:block xl:w-[240px]">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-muted/40 shadow-2xl backdrop-blur-md transition-all">
            <div className="flex h-[220px] flex-col items-center justify-center gap-4 border-border border-b p-6 text-center">
              <p
                className={`${roboto.className} font-black text-lg text-sky-500 uppercase tracking-[0.2em]`}
              >
                Especificações
              </p>
              {showBackupToggle && (
                <div className="flex flex-col items-center gap-3">
                  <span className="font-black text-foreground text-sm uppercase tracking-tighter">
                    Backup automático
                  </span>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={backupEnabled}
                      className="data-[state=checked]:bg-sky-500"
                      onCheckedChange={setBackupEnabled}
                    />
                    <span className="font-bold text-foreground text-sm">
                      {backupEnabled ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-grow bg-muted/20">
              {rowSpecs.map((row, i) => (
                <div
                  className={`flex h-[72px] flex-col items-center justify-center border-border border-t px-6 text-center ${i === rowSpecs.length - 1 ? "border-b-0" : ""}`}
                  key={row.key}
                >
                  <span className="font-black text-foreground text-sm uppercase leading-none tracking-widest">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slider de cartões de planos */}
        <div
          className="flex-grow cursor-grab overflow-hidden active:cursor-grabbing"
          ref={emblaRef}
        >
          <div className="flex gap-4 px-2 py-2">
            {plans.map(p => {
              const currentPriceBrl =
                showBackupToggle &&
                backupEnabled &&
                p.priceBrlBackup !== undefined
                  ? p.priceBrlBackup
                  : p.priceBrl;
              const { priceMain, priceCents } = getPriceParts(currentPriceBrl);
              const href =
                showBackupToggle && p.priceBrlBackup !== undefined
                  ? `${p.href}&backup=${backupEnabled}`
                  : p.href;

              return (
                <div
                  className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] 2xl:flex-[0_0_24%]"
                  key={p.id}
                >
                  <div
                    className={`flex h-full flex-col rounded-2xl border bg-card shadow-2xl backdrop-blur-md transition-all duration-300 ${
                      p.popular
                        ? "border-sky-500 ring-2 ring-sky-500/20"
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className="relative flex h-[220px] flex-col justify-between border-border border-b p-6">
                      {p.popular && (
                        <div className="absolute top-5 right-5">
                          <span className="rounded-full bg-sky-500 px-2.5 py-1 font-extrabold text-[10px] text-white uppercase tracking-widest shadow-lg">
                            Mais vendido
                          </span>
                        </div>
                      )}
                      <div>
                        <p
                          className={`${roboto.className} mb-3 font-black text-foreground text-xl uppercase tracking-tighter`}
                        >
                          {p.name}
                        </p>
                        {p.oldPriceBrl > p.priceBrl && (
                          <span className="mb-1 block text-rose-500 text-sm line-through opacity-70">
                            {formatBrl(p.oldPriceBrl)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1 whitespace-nowrap text-foreground">
                          <span className="mb-1 font-bold text-sm">R$</span>
                          <span className="font-black text-4xl">
                            {priceMain},
                          </span>
                          <span className="font-black text-xl">
                            {priceCents}
                          </span>
                          <span className="ml-1 font-medium text-xs opacity-40">
                            /mês
                          </span>
                        </div>
                      </div>

                      <button
                        className={`${roboto.className} block w-full rounded-xl py-2.5 text-center font-black text-xs uppercase tracking-[0.15em] transition-all ${
                          p.popular
                            ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
                            : "border-2 border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        onClick={() => router.push(href)}
                      >
                        Configurar →
                      </button>
                    </div>

                    <div className="flex-grow bg-card">
                      {rowSpecs.map(row => (
                        <div
                          className="flex min-h-[72px] flex-col items-center justify-center gap-1 border-border border-t px-4 py-3 text-center xl:flex-row xl:gap-0 xl:py-0"
                          key={`${p.id}-${row.key}`}
                        >
                          <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest xl:hidden">
                            {row.label}
                          </span>
                          <span className="font-black text-base text-foreground uppercase tracking-tighter">
                            {p[row.key]}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center gap-2 border-border border-t p-4">
                      <div className="flex items-center justify-center gap-2 text-sky-500">
                        <Check className="h-3.5 w-3.5" strokeWidth={4} />
                        <span className="font-black text-[12px] uppercase tracking-widest">
                          100% de cashback
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sky-500">
                        <Check className="h-3.5 w-3.5" strokeWidth={4} />
                        <span className="font-black text-[12px] uppercase tracking-widest">
                          Suporte 24/7 ativo
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
    </div>
  );
}
