"use client";

import { Loader, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  atlasFee,
  buyerTotal,
  formatBrl,
} from "@/lib/template-exclusivity/rules";
import { saveResaleSettings, saveTemplateExclusivities } from "./actions";

/* ------------------------------------------------------------------ Revenda */

export function ResaleSettingsForm(props: {
  feePercent: number;
  minPriceBrl: number;
}) {
  const router = useRouter();
  const [fee, setFee] = useState(String(props.feePercent).replace(".", ","));
  const [min, setMin] = useState(props.minPriceBrl);
  const [busy, setBusy] = useState(false);

  const feeNumber = Number(fee.replace(",", ".")) || 0;
  const clean = feeNumber === props.feePercent && min === props.minPriceBrl;

  return (
    <div className="grid rounded-lg border bg-card md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <form
        className="flex flex-col gap-4 px-6 py-5"
        onSubmit={async event => {
          event.preventDefault();
          setBusy(true);
          const result = await saveResaleSettings({
            feePercent: feeNumber,
            minPriceBrl: min,
          });
          setBusy(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Configuração de revenda salva.");
          router.refresh();
        }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-base">Revenda</h2>
          <p className="text-[13px] text-muted-foreground leading-[1.45]">
            O comprador paga o valor fechado + a taxa do Atlas. O dono define o
            mínimo de venda, nunca abaixo do piso. Vale para as próximas
            faturas.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[13px]" htmlFor="resale-fee">
              Taxa do Atlas
            </Label>
            <div className="relative w-[110px]">
              <Input
                className="pr-8"
                id="resale-fee"
                inputMode="decimal"
                onChange={event =>
                  setFee(event.target.value.replace(/[^\d,.]/g, ""))
                }
                value={fee}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>
          <div className="flex w-40 flex-col gap-1.5">
            <Label className="text-[13px]" htmlFor="resale-min">
              Piso de venda
            </Label>
            <MoneyInput id="resale-min" onChange={setMin} value={min} />
          </div>
          <Button disabled={busy || clean} type="submit">
            {busy && <Loader className="mr-2 size-4 animate-spin" />}
            {clean ? "Salvo" : "Salvar"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col justify-center gap-3 border-t px-6 py-5 md:border-t-0 md:border-l">
        <span className="text-muted-foreground text-xs">
          Simulação · venda fechada pelo piso
        </span>
        <div className="flex flex-col gap-2 text-[13px]">
          <SimLine label="Valor acordado" value={formatBrl(min)} />
          <SimLine
            label={`Taxa do Atlas (${String(feeNumber).replace(".", ",")}%)`}
            value={`+ ${formatBrl(atlasFee(min, feeNumber))}`}
          />
          <div className="h-px bg-border" />
          <SimLine
            label="Comprador paga"
            strong
            value={formatBrl(buyerTotal(min, feeNumber))}
          />
          <SimLine label="Dono recebe na carteira" value={formatBrl(min)} />
        </div>
      </div>
    </div>
  );
}

function SimLine({
  label,
  strong,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${strong ? "font-medium" : ""}`}
    >
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* --------------------------------------------------------------- Templates */

export type AdminOwnerStatus = "active" | "past_due" | "reserved";

export interface AdminTemplateRow {
  annualPriceBrl: number;
  enabled: boolean;
  id: string;
  name: string;
  negotiations: { awaitingPayment: boolean; open: number };
  owner: {
    email: string;
    name: string;
    status: AdminOwnerStatus;
    /** Linha de apoio já formatada no servidor (vencimento, reserva). */
    sub: string;
  } | null;
  swatch: string;
  /** Miniatura pré-gerada do site (4:3); `null` cai na cor de fundo do tema. */
  thumb: { h: number; src: string; w: number } | null;
}

type Filter = "all" | "enabled" | "owned" | "free";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Todos", value: "all" },
  { label: "Aceitam", value: "enabled" },
  { label: "Com dono", value: "owned" },
  { label: "Livres", value: "free" },
];

const PILL: Record<
  AdminOwnerStatus | "available" | "off",
  { className: string; label: string }
> = {
  active: {
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    label: "Ativa",
  },
  available: {
    className: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    label: "À venda",
  },
  off: {
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    label: "Livre para todos",
  },
  past_due: {
    className: "bg-red-500/15 text-red-700 dark:text-red-300",
    label: "Em atraso",
  },
  reserved: {
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    label: "Checkout em andamento",
  },
};

const GRID =
  "grid grid-cols-[minmax(0,1.3fr)_150px_250px_minmax(0,1.3fr)_minmax(0,0.9fr)] gap-4";

type Draft = Record<string, { annualPriceBrl: number; enabled: boolean }>;

export function TemplatesTable({ rows }: { rows: AdminTemplateRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft>({});
  const [busy, setBusy] = useState(false);

  // Depois de salvar, o servidor manda os valores novos: rascunho limpo.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reage só aos dados novos
  useEffect(() => setDraft({}), [rows]);

  const current = (row: AdminTemplateRow) =>
    draft[row.id] ?? {
      annualPriceBrl: row.annualPriceBrl,
      enabled: row.enabled,
    };

  const isDirty = (row: AdminTemplateRow) => {
    const value = draft[row.id];
    return Boolean(
      value &&
        (value.enabled !== row.enabled ||
          value.annualPriceBrl !== row.annualPriceBrl)
    );
  };

  const patch = (
    row: AdminTemplateRow,
    change: Partial<{ annualPriceBrl: number; enabled: boolean }>
  ) =>
    setDraft(prev => ({ ...prev, [row.id]: { ...current(row), ...change } }));

  const counts: Record<Filter, number> = {
    all: rows.length,
    enabled: rows.filter(row => row.enabled).length,
    free: rows.filter(row => !row.enabled).length,
    owned: rows.filter(row => row.owner).length,
  };

  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    row =>
      (filter === "all" ||
        (filter === "enabled" && row.enabled) ||
        (filter === "owned" && row.owner) ||
        (filter === "free" && !row.enabled)) &&
      (!q ||
        `${row.name} ${row.id} ${row.owner ? `${row.owner.name} ${row.owner.email}` : ""}`
          .toLowerCase()
          .includes(q))
  );

  const dirtyRows = useMemo(
    () => rows.filter(isDirty),
    // biome-ignore lint/correctness/useExhaustiveDependencies: isDirty lê draft
    [rows, draft]
  );

  const saveAll = async () => {
    const missing = dirtyRows.find(
      row => current(row).enabled && !(current(row).annualPriceBrl > 0)
    );
    if (missing) {
      toast.error(`Informe o preço anual de ${missing.name}.`);
      return;
    }
    setBusy(true);
    const result = await saveTemplateExclusivities(
      dirtyRows.map(row => ({ ...current(row), templateId: row.id }))
    );
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      dirtyRows.length === 1 ? "Template atualizado." : "Templates atualizados."
    );
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col rounded-lg border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
          <h2 className="mr-2 font-semibold text-base">Templates</h2>
          <div className="flex gap-0.5 rounded-lg border bg-background p-[3px]">
            {FILTERS.map(item => (
              <button
                className={`flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-[13px] ${
                  filter === item.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                key={item.value}
                onClick={() => setFilter(item.value)}
                type="button"
              >
                {item.label}
                <span className="text-[11px] text-muted-foreground">
                  {counts[item.value]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <label className="flex h-[34px] w-full items-center gap-2 rounded-md border bg-background px-2.5 sm:w-60">
            <Search className="size-[14px] shrink-0 text-muted-foreground" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] outline-none"
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar template ou dono"
              value={query}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div
              className={`${GRID} border-b px-5 py-2.5 text-muted-foreground text-xs`}
            >
              <span>Template</span>
              <span>Status</span>
              <span>Preço anual</span>
              <span>Dono atual</span>
              <span>Negociações</span>
            </div>

            {visible.map(row => {
              const value = current(row);
              const dirty = isDirty(row);
              // Com dono (ou reserva), a exclusividade ligada não pode ser desligada.
              const locked = Boolean(row.owner) && row.enabled;
              const pill =
                PILL[
                  row.owner
                    ? row.owner.status
                    : value.enabled
                      ? "available"
                      : "off"
                ];
              const initials = row.owner
                ? row.owner.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(word => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "";
              return (
                <div
                  className={`${GRID} items-center border-b px-5 py-3.5 ${dirty ? "bg-amber-400/[0.06]" : ""}`}
                  key={row.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="relative h-[42px] w-14 shrink-0 overflow-hidden rounded-[5px] border"
                      style={{ background: row.swatch }}
                    >
                      {row.thumb && (
                        // biome-ignore lint/performance/noImgElement: miniatura estática pré-gerada
                        <img
                          alt={row.name}
                          className="absolute inset-0 size-full object-cover object-top"
                          decoding="async"
                          height={row.thumb.h}
                          loading="lazy"
                          src={row.thumb.src}
                          width={row.thumb.w}
                        />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="truncate">{row.name}</span>
                        {dirty && (
                          <span className="shrink-0 font-normal text-[11px] text-amber-600 dark:text-amber-300">
                            · alterado
                          </span>
                        )}
                      </div>
                      <div className="truncate font-mono text-muted-foreground text-xs">
                        {row.id}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-xs ${pill.className}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {pill.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Switch
                      checked={value.enabled}
                      className={locked ? "cursor-not-allowed opacity-45" : ""}
                      onCheckedChange={checked => {
                        if (locked) {
                          toast.error(
                            "Este template tem dono: a exclusividade não pode ser desligada."
                          );
                          return;
                        }
                        patch(row, { enabled: checked });
                      }}
                      title={
                        locked
                          ? "Tem dono: não dá para desligar"
                          : value.enabled
                            ? "Desligar exclusividade"
                            : "Ligar exclusividade"
                      }
                    />
                    <div
                      className={`w-[150px] ${value.enabled ? "" : "opacity-40"}`}
                    >
                      <MoneyInput
                        className="h-[34px] text-[13px]"
                        disabled={!value.enabled}
                        onChange={price =>
                          patch(row, { annualPriceBrl: price })
                        }
                        value={value.annualPriceBrl}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs">/ano</span>
                  </div>

                  <div className="min-w-0">
                    {row.owner ? (
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-[11px]">
                          {initials || "?"}
                        </span>
                        <div className="min-w-0">
                          <div
                            className="truncate text-[13px]"
                            title={row.owner.email}
                          >
                            {row.owner.name || row.owner.email}
                          </div>
                          <div
                            className={`truncate text-xs ${
                              row.owner.status === "past_due"
                                ? "text-red-600 dark:text-red-300"
                                : "text-muted-foreground"
                            }`}
                          >
                            {row.owner.sub}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-teal-600 dark:text-teal-300">
                        <span className="size-1.5 rounded-full bg-current" />
                        Sem dono
                      </span>
                    )}
                  </div>

                  <div
                    className={`text-[13px] ${row.negotiations.open ? "" : "text-muted-foreground"}`}
                  >
                    {row.negotiations.open === 0
                      ? "—"
                      : `${row.negotiations.open} aberta${row.negotiations.open > 1 ? "s" : ""}${
                          row.negotiations.awaitingPayment
                            ? " · 1 aguardando pagamento"
                            : ""
                        }`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {visible.length === 0 && (
          <div className="p-10 text-center text-[13px] text-muted-foreground">
            Nenhum template encontrado.
          </div>
        )}
        <div className="px-5 py-3 text-muted-foreground text-xs">
          Templates com dono não podem ter a exclusividade desligada; o preço
          novo vale para a próxima compra e para as próximas renovações.
        </div>
      </div>

      {dirtyRows.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-[10px] bg-foreground py-2.5 pr-2.5 pl-[18px] text-background text-sm shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
          <span>
            {dirtyRows.length}{" "}
            {dirtyRows.length === 1
              ? "template alterado"
              : "templates alterados"}
          </span>
          <button
            className="h-[34px] rounded-md border border-background/25 px-3 text-[13px] disabled:opacity-60"
            disabled={busy}
            onClick={() => setDraft({})}
            type="button"
          >
            Descartar
          </button>
          <button
            className="flex h-[34px] items-center rounded-md bg-background px-3.5 font-medium text-[13px] text-foreground disabled:opacity-60"
            disabled={busy}
            onClick={saveAll}
            type="button"
          >
            {busy && <Loader className="mr-2 size-4 animate-spin" />}
            Salvar alterações
          </button>
        </div>
      )}
    </>
  );
}
