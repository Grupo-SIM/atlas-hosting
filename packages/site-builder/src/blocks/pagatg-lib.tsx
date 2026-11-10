import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { href, newTab } from "./helpers.js";
import { int, str, yesNo } from "./sim-lib.js";
import type { FieldDef, RenderContext } from "./types.js";

export { int, lines, SiCar as PgCar, str, yesNo } from "./sim-lib.js";

/**
 * Peças comuns dos blocos do tema PagaTG (prefixo `pg`, escopo `.sb-pg`): ícones, botões, cabeçalho de seção
 * (sobretítulo + título + texto) e a "camada de fundo" (imagem por cima da cor com opacidade, opcionalmente fixa).
 * O visual vem de `renderer/pagatg.ts`.
 */

/* ───────────────────────── ícones ───────────────────────── */

const ICONS: Record<string, ReactNode> = {
  "arrow-long": <path d="M3 12h18m-5-5 5 5-5 5" />,
  "arrow-right": <path d="M5 12h14m-7-7 7 7-7 7" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  copyright: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
    </>
  ),
  feather: (
    <>
      <path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" />
      <path d="M16 8 2 22M17.5 15H9" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  "pie-chart": (
    <>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </>
  ),
  "question-circle": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  star: (
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
};

export const PG_ICON_OPTIONS = Object.keys(ICONS)
  .sort()
  .map(value => ({ label: value, value }));

export function PgIcon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {ICONS[name] ?? ICONS.star}
    </svg>
  );
}

/* ───────────────────────── botões ───────────────────────── */

export const buttonVariant = (d: "grad" | "outline" = "outline") =>
  z.enum(["outline", "grad"]).default(d).catch(d);

export function PgButton({
  ctx,
  full = false,
  label,
  url,
  variant = "outline",
}: {
  ctx: RenderContext;
  full?: boolean;
  label: string;
  url: string;
  variant?: "grad" | "outline";
}) {
  if (!label) return null;
  return (
    <a
      className={`pg-btn ${variant}${full ? "full" : ""}`}
      href={href(ctx, url)}
      {...newTab(url)}
    >
      {label}
    </a>
  );
}

/* ───────────────────────── cabeçalho de seção ───────────────────────── */

export const headSchema = (d: {
  eyebrow?: string;
  text?: string;
  title?: string;
}) => ({
  eyebrow: str(d.eyebrow ?? ""),
  text: str(d.text ?? ""),
  title: str(d.title ?? ""),
});

export const headFields = (h2 = "Título"): FieldDef[] => [
  { key: "eyebrow", kind: "text", label: "Sobretítulo" },
  { key: "title", kind: "text", label: h2 },
  { key: "text", kind: "textarea", label: "Texto" },
];

/** Filhos (caminho `…N.1/2/3`): 1 sobretítulo (se houver), 2 título, 3 texto (se houver). */
export function PgHead({
  align = "center",
  eyebrow,
  level = 2,
  text,
  title,
}: {
  align?: "center" | "left";
  eyebrow: string;
  level?: 1 | 2;
  text: string;
  title: string;
}) {
  const H = `h${level}` as "h2";
  return (
    <div className={`pg-sechead ${align}`}>
      {eyebrow ? <span className="pg-eyebrow">{eyebrow}</span> : null}
      <H>{title}</H>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

/* ───────────────────────── camada de fundo ───────────────────────── */

export const layerSchema = (d: {
  fixed?: "no" | "yes";
  opacity: number;
  repeat?: "no" | "yes";
  url?: string;
}) => ({
  overlayFixed: yesNo(d.fixed ?? "no"),
  overlayImage: str(d.url ?? ""),
  overlayOpacity: int(0, 100, d.opacity),
  overlayRepeat: yesNo(d.repeat ?? "no"),
});

export const layerFields: FieldDef[] = [
  { key: "overlayImage", kind: "image", label: "Imagem de fundo (camada)" },
  {
    key: "overlayOpacity",
    kind: "number",
    label: "Opacidade da imagem de fundo (%)",
  },
  {
    key: "overlayFixed",
    kind: "select",
    label: "Fundo fixo ao rolar (computador)",
    options: [
      { label: "Não", value: "no" },
      { label: "Sim", value: "yes" },
    ],
  },
  {
    key: "overlayRepeat",
    kind: "select",
    label: "Repetir a imagem de fundo",
    options: [
      { label: "Não (cobrir)", value: "no" },
      { label: "Sim (repetir)", value: "yes" },
    ],
  },
];

export interface LayerProps {
  overlayFixed: "no" | "yes";
  overlayImage: string;
  overlayOpacity: number;
  overlayRepeat: "no" | "yes";
}

export const layerClass = (p: LayerProps, extra = "") =>
  `pg-layer${p.overlayFixed === "yes" ? " fixed" : ""}${p.overlayRepeat === "yes" ? " repeat" : ""}${extra ? ` ${extra}` : ""}`;

export const layerStyle = (p: LayerProps): CSSProperties =>
  ({
    "--pg-ov": cssUrl(p.overlayImage),
    "--pg-ov-o": p.overlayOpacity / 100,
  }) as CSSProperties;

export const bgImg = (url: string): CSSProperties =>
  ({ "--pg-img": cssUrl(url) }) as CSSProperties;

export const itemList = <T extends z.ZodRawShape>(shape: T) =>
  z.array(z.object(shape)).default([]).catch([]);
