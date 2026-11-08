import { z } from "zod";
import { ELEMENT_PATH } from "./style.js";

/** Efeito de entrada: roda uma vez, quando o item aparece na tela ao rolar. */
export const ENTER_EFFECTS = [
  "fadeIn",
  "fadeInUp",
  "fadeInDown",
  "fadeInLeft",
  "fadeInRight",
  "zoomIn",
  "rotateIn",
] as const;
export type EnterEffect = (typeof ENTER_EFFECTS)[number];

/** Efeito ao passar o mouse. */
export const HOVER_EFFECTS = [
  "pop",
  "grow",
  "shrink",
  "lift",
  "shadow",
  "brighten",
  "dim",
  "rotate",
  "push",
] as const;
export type HoverEffect = (typeof HOVER_EFFECTS)[number];

export const ENTER_LABELS: Record<EnterEffect, string> = {
  fadeIn: "Aparecer",
  fadeInDown: "Descer suave",
  fadeInLeft: "Vir da esquerda",
  fadeInRight: "Vir da direita",
  fadeInUp: "Subir suave",
  rotateIn: "Girar ao entrar",
  zoomIn: "Zoom",
};

export const HOVER_LABELS: Record<HoverEffect, string> = {
  brighten: "Clarear",
  dim: "Esmaecer",
  grow: "Crescer",
  lift: "Subir",
  pop: "Pulsar",
  push: "Empurrar",
  rotate: "Girar",
  shadow: "Sombra",
  shrink: "Encolher",
};

/** Duração padrão do hover (ms) e limites do controle. */
export const HOVER_MS = { default: 300, max: 2000, min: 50 } as const;

/**
 * Efeitos de um item. A chave do mapa `Block.fx` é o caminho do elemento dentro do bloco
 * (`""` = o bloco inteiro, senão o mesmo `nth-child` de `ELEMENT_PATH`).
 */
export interface Fx {
  /** Conta os números do item de 0 até o valor final ao aparecer. */
  count?: boolean;
  /** Atraso da entrada, em ms. */
  delay?: number;
  /** Aplica o efeito a cada filho direto (cartões, ícones…), não ao item inteiro. */
  each?: boolean;
  enter?: EnterEffect;
  hover?: HoverEffect;
  /** Duração do efeito de hover, em ms (padrão `HOVER_MS.default`). */
  hoverMs?: number;
  /** Segue o mouse: −10..10 (0 = desligado). Positivo acompanha o ponteiro, negativo vai ao contrário. */
  mouse?: number;
  /** Parallax na rolagem: −10..10 (0 = desligado). Positivo atrasa o item, negativo adianta. */
  parallax?: number;
  /** Com `each`: soma esse atraso (ms) a cada filho seguinte, para os itens entrarem em sequência. */
  stagger?: number;
}

export const fxSchema: z.ZodType<Fx> = z.object({
  count: z.boolean().optional(),
  delay: z.number().min(0).max(3000).optional(),
  each: z.boolean().optional(),
  enter: z.enum(ENTER_EFFECTS).optional(),
  hover: z.enum(HOVER_EFFECTS).optional(),
  hoverMs: z.number().min(HOVER_MS.min).max(HOVER_MS.max).optional(),
  mouse: z.number().min(-10).max(10).optional(),
  parallax: z.number().min(-10).max(10).optional(),
  stagger: z.number().min(0).max(1000).optional(),
});

export const fxMapSchema = z
  .record(fxSchema)
  .refine(
    o => Object.keys(o).every(k => k === "" || ELEMENT_PATH.test(k)),
    "Caminho inválido"
  );

export const hasFx = (fx: Fx | undefined): fx is Fx =>
  !!fx &&
  (!!fx.enter ||
    !!fx.hover ||
    !!fx.count ||
    (fx.parallax ?? 0) !== 0 ||
    (fx.mouse ?? 0) !== 0);

/** Só os campos conhecidos e válidos — vale também para dado salvo antes da validação. */
export function cleanFx(fx: Fx | undefined): Fx | undefined {
  const parsed = fxSchema.safeParse(fx ?? {});
  if (!parsed.success) return undefined;
  const out = parsed.data;
  return hasFx(out) ? out : undefined;
}

const ENTER_FROM: Record<EnterEffect, string> = {
  fadeIn: "",
  fadeInDown: "transform:translateY(-40px)",
  fadeInLeft: "transform:translateX(-60px)",
  fadeInRight: "transform:translateX(60px)",
  fadeInUp: "transform:translateY(40px)",
  rotateIn: "transform:rotate(-200deg)",
  zoomIn: "transform:scale(.6)",
};

/**
 * Hover que é transição: propriedade animada e o valor sob o mouse. Propriedades próprias (`scale`,
 * `translate`, `rotate`) para não brigar com o `transform` do próprio item. `pop` é animação.
 */
const HOVER_TO: Record<
  Exclude<HoverEffect, "pop" | "push">,
  [string, string]
> = {
  brighten: ["filter", "brightness(1.15)"],
  dim: ["opacity", ".7"],
  grow: ["scale", "1.08"],
  lift: ["translate", "0 -6px"],
  rotate: ["rotate", "3deg"],
  shadow: ["box-shadow", "0 14px 32px rgba(0,0,0,.28)"],
  shrink: ["scale", ".9"],
};

function targetSelector(blockId: string, path: string): string {
  const id = blockId.replace(/["<>\\]/g, "");
  const nth = path
    ? path
        .split(".")
        .map(n => `>:nth-child(${Number(n)})`)
        .join("")
    : "";
  return `[data-block-id="${id}"]${nth}`;
}

/**
 * CSS dos efeitos de um bloco. O estado inicial da entrada só vale com `.sb-js` (a classe que o
 * script de efeitos põe na raiz): sem JS, ou no editor, o conteúdo aparece normalmente.
 * `scale` e `translate` (propriedades próprias) evitam brigar com o `transform` do próprio item.
 */
export function fxCss(
  blockId: string,
  fx: Record<string, Fx> | undefined
): string {
  if (!fx) return "";
  let css = "";
  for (const [path, raw] of Object.entries(fx)) {
    const f = path === "" || ELEMENT_PATH.test(path) ? cleanFx(raw) : undefined;
    if (!f) continue;
    const sel = targetSelector(blockId, path) + (f.each ? ">*" : "");
    const transitions: string[] = [];
    const d = Math.round(f.delay ?? 0);
    if (f.enter) {
      transitions.push(`opacity .8s ease ${d}ms`, `transform .8s ease ${d}ms`);
      const from = ENTER_FROM[f.enter];
      css += `@media (prefers-reduced-motion:no-preference){.sb-js ${sel}:not(.sb-in){opacity:0;${from}}}`;
    }
    const ms = Math.round(f.hoverMs ?? HOVER_MS.default);
    const hoverTo =
      f.hover && f.hover !== "pop" && f.hover !== "push"
        ? HOVER_TO[f.hover]
        : null;
    const hoverTransition = hoverTo ? `${hoverTo[0]} ${ms}ms ease` : "";
    if (hoverTo) {
      transitions.push(hoverTransition);
      css += `${sel}:hover{${hoverTo[0]}:${hoverTo[1]}}`;
    }
    // `pop` e `push` são animações (sobe/desce e volta), não transições.
    if (f.hover === "pop" || f.hover === "push")
      css += `${sel}:hover{animation:sb-fx-${f.hover} ${ms}ms}`;
    if (transitions.length)
      css += `${sel}{transition:${transitions.join(",")}}`;
    // Entrada em sequência: o n-ésimo filho espera `stagger` ms a mais que o anterior (até 12 itens).
    const stagger = Math.round(f.stagger ?? 0);
    if (f.enter && f.each && stagger > 0) {
      const rest = hoverTransition ? `,${hoverTransition}` : "";
      for (let n = 2; n <= 12; n++) {
        const dn = d + (n - 1) * stagger;
        css += `${sel.slice(0, -2)}>:nth-child(${n}){transition:opacity .8s ease ${dn}ms,transform .8s ease ${dn}ms${rest}}`;
      }
    }
  }
  return css;
}

/** O que o script de efeitos precisa saber: caminho, entrada, contador, parallax e seguir o mouse. */
export interface FxRuntimeEntry {
  c?: 1;
  e?: 1;
  each?: 1;
  m?: number;
  p: string;
  s?: number;
}

export function fxRuntimeData(
  fx: Record<string, Fx> | undefined
): FxRuntimeEntry[] {
  if (!fx) return [];
  const out: FxRuntimeEntry[] = [];
  for (const [path, raw] of Object.entries(fx)) {
    const f = path === "" || ELEMENT_PATH.test(path) ? cleanFx(raw) : undefined;
    if (!f) continue;
    const entry: FxRuntimeEntry = { p: path };
    if (f.enter) entry.e = 1;
    if (f.count) entry.c = 1;
    if (f.parallax) entry.s = f.parallax;
    if (f.mouse) entry.m = f.mouse;
    if (f.each) entry.each = 1;
    if (entry.e || entry.c || entry.s || entry.m) out.push(entry);
  }
  return out;
}
