import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";

const str = (d = "") => z.string().default(d).catch(d);
const num = (min: number, max: number, d: number) =>
  z.coerce.number().min(min).max(max).default(d).catch(d);
const align = z
  .enum(["left", "center", "right"])
  .default("center")
  .catch("center");
const JUSTIFY = {
  center: "center",
  left: "flex-start",
  right: "flex-end",
} as const;
const ALIGN_FIELD = {
  key: "align",
  kind: "select" as const,
  label: "Alinhamento na página",
  options: [
    { label: "Esquerda", value: "left" },
    { label: "Centro", value: "center" },
    { label: "Direita", value: "right" },
  ],
};

const row = (a: keyof typeof JUSTIFY, children: ReactNode) => (
  <div
    className="sb-container sb-gfx-row"
    style={{ justifyContent: JUSTIFY[a] }}
  >
    {children}
  </div>
);

/** Selo: etiqueta curta ("Novo", "-30%", "Mais vendido"). */
const badge = defineBlock(
  z.object({
    align,
    background: str("#e11d48"),
    color: str("#ffffff"),
    shape: z.enum(["pill", "round", "square"]).default("pill").catch("pill"),
    size: num(10, 40, 14),
    text: str("Novo"),
  }),
  {
    fields: [
      { key: "text", kind: "text", label: "Texto do selo" },
      { key: "background", kind: "color", label: "Cor do fundo" },
      { key: "color", kind: "color", label: "Cor do texto" },
      {
        key: "shape",
        kind: "select",
        label: "Formato",
        options: [
          { label: "Pílula", value: "pill" },
          { label: "Cantos redondos", value: "round" },
          { label: "Quadrado", value: "square" },
        ],
      },
      { key: "size", kind: "number", label: "Tamanho da letra (px)" },
      ALIGN_FIELD,
    ],
    group: "graphics",
    label: "Selo",
    render: p =>
      row(
        p.align,
        <span
          className={`sb-badge sb-badge-${p.shape}`}
          style={{ background: p.background, color: p.color, fontSize: p.size }}
        >
          {p.text}
        </span>
      ),
    type: "badge",
  }
);

const DIVIDERS = [
  { label: "Linha", value: "solid" },
  { label: "Tracejada", value: "dashed" },
  { label: "Pontilhada", value: "dotted" },
  { label: "Dupla", value: "double" },
  { label: "Onda", value: "wave" },
  { label: "Estrelas", value: "stars" },
] as const;

/** Divisor decorativo entre seções. */
const divider = defineBlock(
  z.object({
    align,
    color: str("#94a3b8"),
    kind: z
      .enum(["solid", "dashed", "dotted", "double", "wave", "stars"])
      .default("solid")
      .catch("solid"),
    thickness: num(1, 12, 2),
    width: num(5, 100, 60),
  }),
  {
    fields: [
      {
        key: "kind",
        kind: "select",
        label: "Tipo",
        options: DIVIDERS.map(d => ({ label: d.label, value: d.value })),
      },
      { key: "color", kind: "color", label: "Cor" },
      { key: "thickness", kind: "number", label: "Espessura (px, 1–12)" },
      { key: "width", kind: "number", label: "Largura em % (5–100)" },
      ALIGN_FIELD,
    ],
    group: "graphics",
    label: "Divisor",
    render: p => {
      const id = `dv-${p.color.replace(/[^a-z0-9]/gi, "")}-${p.thickness}`;
      return row(
        p.align,
        <div
          className="sb-divider"
          style={{ color: p.color, width: `${p.width}%` }}
        >
          {p.kind === "wave" ? (
            <svg aria-hidden="true" height={p.thickness * 4 + 4} width="100%">
              <defs>
                <pattern
                  height={p.thickness * 4 + 4}
                  id={id}
                  patternUnits="userSpaceOnUse"
                  width={p.thickness * 8 + 8}
                >
                  <path
                    d={`M0 ${p.thickness * 2 + 2} Q${p.thickness * 2 + 2} 0 ${p.thickness * 4 + 4} ${p.thickness * 2 + 2} T${p.thickness * 8 + 8} ${p.thickness * 2 + 2}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={p.thickness}
                  />
                </pattern>
              </defs>
              <rect fill={`url(#${id})`} height="100%" width="100%" />
            </svg>
          ) : p.kind === "stars" ? (
            <span className="sb-divider-stars">✦ ✦ ✦</span>
          ) : (
            <hr
              style={{
                borderTop: `${p.kind === "double" ? p.thickness * 3 : p.thickness}px ${p.kind} currentColor`,
              }}
            />
          )}
        </div>
      );
    },
    type: "divider",
  }
);

/** Barra de progresso com legenda. */
const progress = defineBlock(
  z.object({
    color: str("#22c55e"),
    height: num(4, 40, 12),
    label: str("Progresso"),
    showValue: z.enum(["yes", "no"]).default("yes").catch("yes"),
    track: str("#e2e8f0"),
    value: num(0, 100, 70),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Legenda" },
      { key: "value", kind: "number", label: "Valor em % (0–100)" },
      { key: "color", kind: "color", label: "Cor da barra" },
      { key: "track", kind: "color", label: "Cor do fundo da barra" },
      { key: "height", kind: "number", label: "Espessura (px)" },
      {
        key: "showValue",
        kind: "select",
        label: "Mostrar o número",
        options: [
          { label: "Sim", value: "yes" },
          { label: "Não", value: "no" },
        ],
      },
    ],
    group: "graphics",
    label: "Barra de progresso",
    render: p => (
      <div className="sb-container sb-progress">
        <div className="sb-progress-head">
          <span>{p.label}</span>
          {p.showValue === "yes" ? <b>{p.value}%</b> : null}
        </div>
        <div
          className="sb-progress-track"
          style={{ background: p.track, height: p.height }}
        >
          <i style={{ background: p.color, width: `${p.value}%` }} />
        </div>
      </div>
    ),
    type: "progress",
  }
);

/** Ícones simples (traço de 24×24). */
export const ICONS: Record<string, { label: string; paths: string[] }> = {
  arrow: { label: "Seta", paths: ["M5 12h14", "m12 5 7 7-7 7"] },
  bolt: { label: "Raio", paths: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"] },
  cart: {
    label: "Carrinho",
    paths: [
      "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
      "M9 21.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z",
      "M19 21.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z",
    ],
  },
  check: { label: "Certo", paths: ["M20 6 9 17l-5-5"] },
  clock: {
    label: "Relógio",
    paths: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"],
  },
  download: {
    label: "Baixar",
    paths: [
      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
      "m7 10 5 5 5-5",
      "M12 15V3",
    ],
  },
  globe: {
    label: "Mundo",
    paths: [
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
      "M2 12h20",
      "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    ],
  },
  heart: {
    label: "Coração",
    paths: [
      "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z",
    ],
  },
  lock: {
    label: "Cadeado",
    paths: [
      "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
      "M7 11V7a5 5 0 0 1 10 0v4",
    ],
  },
  mail: {
    label: "E-mail",
    paths: [
      "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
      "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
    ],
  },
  phone: {
    label: "Telefone",
    paths: [
      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
    ],
  },
  pin: {
    label: "Local",
    paths: [
      "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z",
      "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    ],
  },
  play: { label: "Reproduzir", paths: ["M5 3l14 9-14 9V3z"] },
  search: {
    label: "Buscar",
    paths: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "m21 21-4.3-4.3"],
  },
  shield: {
    label: "Escudo",
    paths: [
      "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    ],
  },
  star: {
    label: "Estrela",
    paths: [
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    ],
  },
  user: {
    label: "Pessoa",
    paths: [
      "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
      "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    ],
  },
};

/** Ícone solto, com cor, tamanho e preenchimento opcional. */
const iconBlock = defineBlock(
  z.object({
    align,
    color: str("#6a5ad8"),
    fill: z.enum(["yes", "no"]).default("no").catch("no"),
    icon: z.string().default("star").catch("star"),
    size: num(16, 240, 48),
    stroke: num(1, 4, 2),
  }),
  {
    fields: [
      {
        key: "icon",
        kind: "select",
        label: "Ícone",
        options: Object.entries(ICONS).map(([value, i]) => ({
          label: i.label,
          value,
        })),
      },
      { key: "color", kind: "color", label: "Cor" },
      { key: "size", kind: "number", label: "Tamanho (px)" },
      { key: "stroke", kind: "number", label: "Espessura do traço (1–4)" },
      {
        key: "fill",
        kind: "select",
        label: "Preenchido",
        options: [
          { label: "Só o contorno", value: "no" },
          { label: "Preenchido", value: "yes" },
        ],
      },
      ALIGN_FIELD,
    ],
    group: "graphics",
    label: "Ícone",
    render: p => {
      const def = ICONS[p.icon] ?? ICONS.star;
      return row(
        p.align,
        <svg
          aria-hidden="true"
          fill={p.fill === "yes" ? p.color : "none"}
          height={p.size}
          stroke={p.color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={p.stroke}
          viewBox="0 0 24 24"
          width={p.size}
        >
          {def?.paths.map(d => (
            <path d={d} key={d} />
          ))}
        </svg>
      );
    },
    type: "iconBlock",
  }
);

/** Faixa de texto que rola sem parar (promoções, avisos, nomes de marcas). */
const marquee = defineBlock(
  z.object({
    background: str("#0f172a"),
    color: str("#ffffff"),
    direction: z.enum(["left", "right"]).default("left").catch("left"),
    size: num(12, 64, 18),
    speed: num(5, 120, 30),
    text: str("PROMOÇÃO • FRETE GRÁTIS • NOVIDADES • "),
  }),
  {
    fields: [
      {
        key: "text",
        kind: "text",
        label: "Texto (ele se repete; termine com o separador)",
      },
      { key: "background", kind: "color", label: "Cor do fundo" },
      { key: "color", kind: "color", label: "Cor do texto" },
      { key: "size", kind: "number", label: "Tamanho da letra (px)" },
      { key: "speed", kind: "number", label: "Segundos por volta (5–120)" },
      {
        key: "direction",
        kind: "select",
        label: "Direção",
        options: [
          { label: "Para a esquerda", value: "left" },
          { label: "Para a direita", value: "right" },
        ],
      },
    ],
    group: "graphics",
    label: "Faixa rolante",
    render: p => {
      const unit = p.text || " ";
      const line = Array.from({ length: 8 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: repetição idêntica do mesmo texto
        <span key={i}>{unit}</span>
      ));
      return (
        <div
          className="sb-marquee"
          style={
            {
              "--mq-dir": p.direction === "left" ? "normal" : "reverse",
              "--mq-dur": `${p.speed}s`,
              background: p.background,
              color: p.color,
              fontSize: p.size,
            } as CSSProperties
          }
        >
          <div className="sb-marquee-track">
            <div>{line}</div>
            <div aria-hidden="true">{line}</div>
          </div>
        </div>
      );
    },
    type: "marquee",
  }
);

export const graphicsBlocks = [badge, divider, progress, iconBlock, marquee];
