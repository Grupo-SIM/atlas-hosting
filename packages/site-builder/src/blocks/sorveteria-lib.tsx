import type { ReactNode } from "react";
import { z } from "zod";
import type { Block } from "../model/index.js";
import { href } from "./helpers.js";
import type { RenderContext } from "./types.js";
import { flag, int, str } from "./zyrion-lib.js";

/**
 * Peças comuns dos blocos do template "Frescor" (prefixo `fr`, escopo `.sb-fr`): ícones próprios em SVG, a lista de
 * **unidades** (cadastrada uma vez no rodapé e lida por cartões, seletor, rodapé e JSON-LD), horário de funcionamento
 * (dias, abre, fecha, fuso) e links de WhatsApp. O visual vem de `renderer/sorveteria.ts`.
 */
export { flag, int, str };

/* ───────────────────────── ícones ───────────────────────── */

const PATHS: Record<string, ReactNode> = {
  close: <path d="M18 6 6 18M6 6l12 12" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  next: <path d="m9 18 6-6-6-6" />,
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.800 12 21 12 21z" />
      <circle cx="12" cy="9.500" r="2.500" />
    </>
  ),
  prev: <path d="m15 18-6-6 6-6" />,
};

export function FrIcon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {PATHS[name] ?? PATHS.next}
    </svg>
  );
}

const WHATSAPP_PATH =
  "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.49-8.41z";

export function FrWhatsapp({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}

/** Instagram desenhado para o template (quadrado arredondado, lente e ponto). */
export function FrInstagram({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4.200" />
      <circle cx="17.200" cy="6.800" fill="currentColor" r=".6" stroke="none" />
    </svg>
  );
}

/** Link `wa.me` ou `api.whatsapp.com`: pede o botão verde com ícone. */
export const isWhatsappUrl = (url: string) =>
  /^https?:\/\/(?:wa\.me\/|api\.whatsapp\.com\/)/i.test(url.trim());

/* ───────────────────────── unidades e horário ───────────────────────── */

export const DEFAULT_TZ = "America/Sao_Paulo";
export const DEFAULT_WA_MESSAGE =
  "Olá, {marca} ({unidade}). Gostaria de fazer um pedido!";

export const unitSchema = z.object({
  address: str(),
  city: str(),
  /** Abre e fecha ("14:00", "14h", "14h30"). Fechar antes de abrir = fecha na madrugada do dia seguinte. */
  close: str("23:00"),
  /** Dias em que abre: "todos", "seg-sab", "seg,qua,sex"… */
  days: str("todos"),
  /** Texto do horário por extenso; vazio = montado dos campos acima. */
  hours: str(),
  name: str(),
  neighborhood: str(),
  open: str("14:00"),
  /** Só números, com DDI e DDD. */
  phone: str(),
});
export type Unit = z.infer<typeof unitSchema>;

export const UNIT_FIELDS = [
  { key: "name", kind: "text", label: "Nome da unidade" },
  { key: "address", kind: "text", label: "Endereço" },
  { key: "neighborhood", kind: "text", label: "Bairro" },
  { key: "city", kind: "text", label: "Cidade e estado" },
  {
    key: "phone",
    kind: "text",
    label: "WhatsApp da unidade (só números, com DDI e DDD)",
  },
  {
    key: "days",
    kind: "text",
    label: "Dias que abre (todos, seg-sab, seg,qua,sex…)",
  },
  { key: "open", kind: "text", label: "Abre às (ex.: 14:00)" },
  {
    key: "close",
    kind: "text",
    label: "Fecha às (ex.: 23:00; antes de abrir = fecha na madrugada)",
  },
  {
    key: "hours",
    kind: "text",
    label: "Horário por extenso (vazio = montado dos campos acima)",
  },
] as const;

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
const DAY_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const plain = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const dayIndex = (token: string) =>
  DAY_KEYS.findIndex(k => token.trim().startsWith(k));

/**
 * Dias de funcionamento a partir de texto livre: "todos", "seg-sab", "seg a sex", "seg,qua e sex", "sex-dom".
 * Intervalos dão a volta na semana. Texto que não diz nada vira todos os dias.
 */
export function parseDays(text: string): number[] {
  const t = plain(text).trim();
  if (!t || /^(todos|diari|toda)/.test(t)) return ALL_DAYS;
  const parts = t
    .replace(/\s+(?:a|ate)\s+/g, "-")
    .replace(/\s+e\s+/g, ",")
    .split(/[,;/+]/);
  const out = new Set<number>();
  for (const part of parts) {
    const [a, b] = part.split("-");
    const i = dayIndex(a ?? "");
    if (i < 0) continue;
    if (b === undefined) {
      out.add(i);
      continue;
    }
    const j = dayIndex(b);
    if (j < 0) {
      out.add(i);
      continue;
    }
    for (let k = i; ; k = (k + 1) % 7) {
      out.add(k);
      if (k === j) break;
    }
  }
  return out.size ? [...out].sort((x, y) => x - y) : ALL_DAYS;
}

/** "14:00", "14h", "14h30", "14" → minutos desde 0h; texto inválido devolve `fallback`. */
export function parseClock(text: string, fallback: number): number {
  const m = /^\s*(\d{1,2})\s*(?:[:h]\s*(\d{1,2})?)?\s*$/i.exec(text);
  if (!m) return fallback;
  const h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (h > 24 || min > 59) return fallback;
  return (h % 24) * 60 + min;
}

const clock = (min: number) =>
  `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}`;

/** "Todos os dias", "Seg a sáb" ou "Seg, qua e sex". */
export function daysLabel(days: number[]): string {
  if (days.length === 7) return "Todos os dias";
  const run =
    days.length > 1 &&
    days.every((d, i) => i === 0 || d === (days[i - 1] ?? 0) + 1);
  if (run)
    return `${DAY_NAMES[days[0] ?? 0]} a ${DAY_NAMES[days[days.length - 1] ?? 0]}`;
  const names = days.map(d => DAY_NAMES[d]);
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`
    : (names[0] ?? "");
}

export interface HoursSpec {
  /** Minuto em que fecha. */
  c: number;
  /** Dias da semana (0 = domingo). */
  d: number[];
  /** Minuto em que abre. */
  o: number;
  tz: string;
}

export function hoursSpec(unit: Unit, tz: string): HoursSpec {
  return {
    c: parseClock(unit.close, 23 * 60),
    d: parseDays(unit.days),
    o: parseClock(unit.open, 14 * 60),
    tz,
  };
}

/** Horário por extenso: o texto do usuário ou "Todos os dias: 14h às 23h". */
export function hoursText(unit: Unit): string {
  if (unit.hours.trim()) return unit.hours.trim();
  const s = hoursSpec(unit, DEFAULT_TZ);
  return `${daysLabel(s.d)}: ${clock(s.o)} às ${clock(s.c)}`;
}

/** Fuso da loja (`theme.timezone`); nome inválido volta ao padrão em vez de quebrar o `Intl`. */
export function storeTimezone(ctx: RenderContext): string {
  const tz = (ctx.site.theme.timezone ?? "").trim();
  if (!tz) return DEFAULT_TZ;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TZ;
  }
}

const walk = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...walk(b.children ?? [])]);

/** Unidades do site: a lista do bloco `frFooter` (um lugar só para editar). */
export function getUnits(ctx: RenderContext): Unit[] {
  const footer = walk(ctx.site.footer).find(b => b.type === "frFooter");
  const raw = footer?.props.units;
  if (!Array.isArray(raw)) return [];
  const out: Unit[] = [];
  for (const u of raw) {
    const p = unitSchema.safeParse(u);
    if (p.success && p.data.name.trim()) out.push(p.data);
  }
  return out;
}

const DIGITS = /\D/g;
export const digits = (s: string) => s.replace(DIGITS, "");

/** Mensagem do WhatsApp com `{marca}` e `{unidade}` trocados. */
export function waMessage(ctx: RenderContext, unit: Unit): string {
  const tpl = (ctx.site.theme.waMessage ?? "").trim() || DEFAULT_WA_MESSAGE;
  return tpl
    .replaceAll("{marca}", ctx.site.name)
    .replaceAll("{unidade}", unit.name);
}

/** `https://wa.me/<número>?text=…` da unidade; vazio sem telefone. */
export function waUnitLink(ctx: RenderContext, unit: Unit): string {
  const n = digits(unit.phone);
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(waMessage(ctx, unit))}`;
}

/* ───────────────────────── links ───────────────────────── */

const norm = (s: string) => s.replace(/^\/+|\/+$/g, "");

/** O item do menu é a página atual? Âncoras (`/#cardapio`) nunca são a página atual. */
export const isCurrent = (ctx: RenderContext, url: string) =>
  !url.includes("#") && norm(url) === norm(ctx.path ?? "");

/** Âncora na home: local quando já estamos nela, senão volta para a home. */
export function anchorHref(ctx: RenderContext, url: string): string {
  if (!url.startsWith("#")) return href(ctx, url);
  return norm(ctx.path ?? "") === "" ? url : href(ctx, `/${url}`);
}

/** Dados estruturados `IceCreamShop`, um por unidade, a partir das props (nome, telefone, endereço, horário). */
export function unitsJsonLd(ctx: RenderContext, units: Unit[]): object[] {
  const tz = storeTimezone(ctx);
  return units.map(u => {
    const s = hoursSpec(u, tz);
    const phone = digits(u.phone);
    return {
      "@context": "https://schema.org",
      "@type": "IceCreamShop",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BR",
        addressLocality: u.city,
        streetAddress: [u.address, u.neighborhood].filter(Boolean).join(", "),
      },
      name: `${ctx.site.name} — ${u.name}`,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          closes: `${String(Math.floor(s.c / 60)).padStart(2, "0")}:${String(s.c % 60).padStart(2, "0")}`,
          dayOfWeek: s.d.map(d => DAY_EN[d]),
          opens: `${String(Math.floor(s.o / 60)).padStart(2, "0")}:${String(s.o % 60).padStart(2, "0")}`,
        },
      ],
      ...(phone ? { telephone: `+${phone}` } : {}),
    };
  });
}
