"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Roboto } from "next/font/google";
import useEmblaCarousel from "embla-carousel-react";
import { Switch } from "@/components/ui/switch";
import type { PlanCardData } from "./page";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const rowSpecs = [
  { label: "Núcleos de vCPU", key: "cores" as const },
  { label: "RAM", key: "ram" as const },
  { label: "Armazenamento", key: "storage" as const },
  { label: "Velocidade da Porta", key: "port" as const },
];

function formatBrl(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function getPriceParts(v: number) {
  const [whole, cents] = v.toFixed(2).split(".");
  return {
    priceMain: new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Number(whole)),
    priceCents: cents,
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
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start", containScroll: "trimSnaps" });

  return (
    <div className="space-y-4">
      {showBackupToggle && (
        <div className="xl:hidden flex items-center gap-3 border border-border bg-muted/40 rounded-2xl px-5 py-4 backdrop-blur-md">
          <Switch
            checked={backupEnabled}
            onCheckedChange={setBackupEnabled}
            className="data-[state=checked]:bg-sky-500"
          />
          <div>
            <span className="text-sm font-black text-foreground uppercase tracking-widest">Backup automático</span>
            <p className="text-xs text-muted-foreground mt-0.5">{backupEnabled ? "Ativado" : "Desativado"}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-4">
        {/* Card de especificações fixo */}
        <div className="hidden xl:block xl:w-[240px] shrink-0">
          <div className="bg-muted/40 border border-border rounded-2xl h-full flex flex-col shadow-2xl transition-all backdrop-blur-md">
            <div className="p-6 h-[220px] flex flex-col items-center justify-center gap-4 border-b border-border text-center">
              <p className={`${roboto.className} text-lg font-black uppercase tracking-[0.2em] text-sky-500`}>
                Especificações
              </p>
              {showBackupToggle && (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm font-black text-foreground uppercase tracking-tighter">
                    Backup automático
                  </span>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={backupEnabled}
                      onCheckedChange={setBackupEnabled}
                      className="data-[state=checked]:bg-sky-500"
                    />
                    <span className="text-sm font-bold text-foreground">
                      {backupEnabled ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-grow bg-muted/20">
              {rowSpecs.map((row, i) => (
                <div
                  key={row.key}
                  className={`px-6 h-[72px] flex flex-col justify-center items-center text-center border-t border-border ${i === rowSpecs.length - 1 ? "border-b-0" : ""}`}
                >
                  <span className="text-sm font-black text-foreground uppercase tracking-widest leading-none">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slider de cartões de planos */}
        <div className="flex-grow overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-4 px-2 py-2">
            {plans.map((p) => {
              const currentPriceBrl =
                showBackupToggle && backupEnabled && p.priceBrlBackup !== undefined ? p.priceBrlBackup : p.priceBrl;
              const { priceMain, priceCents } = getPriceParts(currentPriceBrl);
              const href = showBackupToggle && p.priceBrlBackup !== undefined ? `${p.href}&backup=${backupEnabled}` : p.href;

              return (
                <div key={p.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] 2xl:flex-[0_0_24%] min-w-0">
                  <div
                    className={`bg-card border rounded-2xl h-full flex flex-col transition-all duration-300 shadow-2xl backdrop-blur-md ${
                      p.popular ? "border-sky-500 ring-2 ring-sky-500/20" : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className="p-6 h-[220px] flex flex-col justify-between border-b border-border relative">
                      {p.popular && (
                        <div className="absolute top-5 right-5">
                          <span className="rounded-full bg-sky-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg">
                            Mais vendido
                          </span>
                        </div>
                      )}
                      <div>
                        <p className={`${roboto.className} text-xl font-black text-foreground mb-3 uppercase tracking-tighter`}>
                          {p.name}
                        </p>
                        {p.oldPriceBrl > p.priceBrl && (
                          <span className="text-sm text-rose-500 line-through mb-1 block opacity-70">
                            {formatBrl(p.oldPriceBrl)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1 whitespace-nowrap text-foreground">
                          <span className="text-sm font-bold mb-1">R$</span>
                          <span className="text-4xl font-black">{priceMain},</span>
                          <span className="text-xl font-black">{priceCents}</span>
                          <span className="text-xs font-medium opacity-40 ml-1">/mês</span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(href)}
                        className={`${roboto.className} block w-full rounded-xl py-2.5 text-center text-xs font-black uppercase tracking-[0.15em] transition-all ${
                          p.popular
                            ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
                            : "border-2 border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        Configurar →
                      </button>
                    </div>

                    <div className="flex-grow bg-card">
                      {rowSpecs.map((row) => (
                        <div
                          key={`${p.id}-${row.key}`}
                          className="min-h-[72px] flex flex-col xl:flex-row items-center justify-center border-t border-border px-4 py-3 xl:py-0 text-center gap-1 xl:gap-0"
                        >
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest xl:hidden">
                            {row.label}
                          </span>
                          <span className="text-base font-black text-foreground uppercase tracking-tighter">
                            {p[row.key]}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-border flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center gap-2 text-sky-500">
                        <Check className="h-3.5 w-3.5" strokeWidth={4} />
                        <span className="text-[12px] font-black uppercase tracking-widest">100% de cashback</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sky-500">
                        <Check className="h-3.5 w-3.5" strokeWidth={4} />
                        <span className="text-[12px] font-black uppercase tracking-widest">Suporte 24/7 ativo</span>
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
