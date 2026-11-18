/** Sombras: monta e lê o texto CSS que o editor grava (`box-shadow` e `text-shadow`). */
export interface Shadow {
  /** 0–1 */
  alpha: number;
  blur: number;
  /** `#rrggbb` */
  color: string;
  spread: number;
  x: number;
  y: number;
}

export const SHADOW_PRESETS: { id: string; label: string; shadow?: Shadow }[] =
  [
    { id: "none", label: "Nenhuma" },
    {
      id: "soft",
      label: "Suave",
      shadow: {
        alpha: 0.18,
        blur: 12,
        color: "#000000",
        spread: 0,
        x: 0,
        y: 4,
      },
    },
    {
      id: "medium",
      label: "Média",
      shadow: {
        alpha: 0.28,
        blur: 24,
        color: "#000000",
        spread: 0,
        x: 0,
        y: 10,
      },
    },
    {
      id: "strong",
      label: "Forte",
      shadow: {
        alpha: 0.4,
        blur: 44,
        color: "#000000",
        spread: 0,
        x: 0,
        y: 20,
      },
    },
  ];

/** Animações contínuas (os quadros estão em `renderer/styles.ts`, `@keyframes sbf-*`). */
export const ANIMATIONS: { label: string; value: string }[] = [
  { label: "Nenhuma", value: "" },
  { label: "Flutuar", value: "sbf-float 3s ease-in-out infinite" },
  { label: "Pulsar", value: "sbf-pulse 1.6s ease-in-out infinite" },
  { label: "Girar", value: "sbf-spin 6s linear infinite" },
  { label: "Balançar", value: "sbf-swing 2.4s ease-in-out infinite" },
  { label: "Piscar", value: "sbf-blink 1.4s ease-in-out infinite" },
  { label: "Quicar", value: "sbf-bounce 1.6s ease infinite" },
  { label: "Tremer", value: "sbf-shake .8s ease-in-out infinite" },
];

const hex2 = (n: number) => n.toString(16).padStart(2, "0");

const rgbaOf = (hex: string, alpha: number) => {
  const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000";
  const n = (i: number) => Number.parseInt(h.slice(i, i + 2), 16);
  return `rgba(${n(1)},${n(3)},${n(5)},${Math.round(alpha * 100) / 100})`;
};

/** `X Ypx desfoque [espalhamento] rgba()`; o texto não tem espalhamento. */
export function formatShadow(s: Shadow, text = false): string {
  const len = [s.x, s.y, s.blur, ...(text ? [] : [s.spread])]
    .map(n => `${Math.round(n)}px`)
    .join(" ");
  return `${len} ${rgbaOf(s.color, s.alpha)}`;
}

const SHADOW =
  /^(-?\d+(?:\.\d+)?)px (-?\d+(?:\.\d+)?)px (\d+(?:\.\d+)?)px (?:(-?\d+(?:\.\d+)?)px )?rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/;

/** Lê o que `formatShadow` escreveu; sombra escrita à mão (outro formato) devolve `null`. */
export function parseShadow(css: unknown): Shadow | null {
  const m = typeof css === "string" ? SHADOW.exec(css.trim()) : null;
  if (!m) return null;
  const n = (i: number) => Number(m[i] ?? 0);
  return {
    alpha: Math.min(1, Math.max(0, n(8))),
    blur: n(3),
    color: `#${hex2(n(5))}${hex2(n(6))}${hex2(n(7))}`,
    spread: n(4),
    x: n(1),
    y: n(2),
  };
}

/** Qual predefinição a sombra é (ou `custom` quando foi ajustada); sem sombra = `none`. */
export function presetOf(css: unknown, text = false): string {
  if (!css || css === "none") return "none";
  for (const p of SHADOW_PRESETS) {
    if (p.shadow && formatShadow(p.shadow, text) === css) return p.id;
  }
  return "custom";
}
