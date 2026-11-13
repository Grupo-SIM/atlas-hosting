/** Estilo por bloco, editado no painel de propriedades. Só estas propriedades CSS são aceitas. */
export const BLOCK_STYLE_KEYS = [
  "alignItems",
  "background",
  "borderColor",
  "borderRadius",
  "borderStyle",
  "borderWidth",
  "color",
  "display",
  "flexDirection",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "frame",
  "gap",
  "height",
  "hoverBackground",
  "hoverBorderColor",
  "hoverColor",
  "margin",
  "maxWidth",
  "opacity",
  "order",
  "padding",
  "textAlign",
  "textTransform",
  "translate",
  "width",
] as const;

export type BlockStyleKey = (typeof BLOCK_STYLE_KEYS)[number];
export type BlockStyle = Partial<Record<BlockStyleKey, string | number>>;

const allowed = new Set<string>(BLOCK_STYLE_KEYS);

/** Valores vão para `style` do React (escapados), mas `;{}<>` nunca fazem sentido num valor CSS. */
const safeValue = (v: string | number) =>
  typeof v === "number" ? Number.isFinite(v) : !/[;{}<>]/.test(v);

/** Descarta chaves fora da lista e valores suspeitos — vale para dado salvo antes da validação também. */
export function cleanStyle(
  style: Record<string, string | number> | undefined
): BlockStyle | undefined {
  if (!style) return undefined;
  const out: BlockStyle = {};
  for (const [key, value] of Object.entries(style)) {
    if (allowed.has(key) && safeValue(value)) {
      out[key as BlockStyleKey] = value;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export const isValidStyle = (style: Record<string, string | number>) =>
  Object.entries(style).every(([k, v]) => allowed.has(k) && safeValue(v));

/** Caminho de um elemento dentro do bloco: posições `nth-child` separadas por ponto (ex.: "1.2.1"). */
export const ELEMENT_PATH = /^\d{1,3}(\.\d{1,3}){0,11}$/;

const UNITLESS = new Set(["opacity", "fontWeight", "order"]);

/** Cores "ao passar o mouse": viram uma regra `:hover`, nunca estilo inline. */
export const HOVER_STYLE_PROPS = {
  hoverBackground: "background",
  hoverBorderColor: "border-color",
  hoverColor: "color",
} as const;

const isHoverKey = (k: string): k is keyof typeof HOVER_STYLE_PROPS =>
  k in HOVER_STYLE_PROPS;

/** Regra `:hover` com as cores de hover do estilo (vazio se não houver nenhuma). */
export function hoverCss(
  selector: string,
  style: Record<string, string | number> | undefined
): string {
  if (!style) return "";
  const decls = Object.entries(style)
    .filter(
      ([k, v]) =>
        isHoverKey(k) &&
        v !== undefined &&
        v !== null &&
        String(v).trim() !== ""
    )
    .map(
      ([k, v]) =>
        `${HOVER_STYLE_PROPS[k as keyof typeof HOVER_STYLE_PROPS]}:${v}!important`
    )
    .join(";");
  return decls ? `${selector}:hover{${decls}}` : "";
}

/** CSS (com `!important`, para vencer estilos inline do bloco) dos estilos por elemento de um bloco. */
export function elementStylesCss(
  blockId: string,
  elStyles: Record<string, Record<string, string | number>> | undefined
): string {
  if (!elStyles) return "";
  const id = blockId.replace(/["<>]/g, "");
  let css = "";
  for (const [path, raw] of Object.entries(elStyles)) {
    const style = ELEMENT_PATH.test(path) ? cleanStyle(raw) : undefined;
    if (!style) continue;
    const selector = path
      .split(".")
      .map(n => `>:nth-child(${Number(n)})`)
      .join("");
    const decls = Object.entries(style)
      .filter(([k]) => k !== "translate" && k !== "frame" && !isHoverKey(k))
      .map(([k, v]) => {
        const prop = k.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
        const value =
          typeof v === "number" && !UNITLESS.has(k) && v !== 0 ? `${v}px` : v;
        return `${prop}:${value}!important`;
      })
      .join(";");
    if (decls) css += `[data-block-id="${id}"]${selector}{${decls}}`;
    css += hoverCss(`[data-block-id="${id}"]${selector}`, style);
    css += translateCss(`[data-block-id="${id}"]${selector}`, style.translate);
    css += frameCss(
      `[data-block-id="${id}"]${selector}`,
      `[data-block-id="${id}"]${selector.split(">:nth-child").slice(0, -1).join(">:nth-child")}`,
      style.frame
    );
    if (style.fontFamily)
      css += fontFamilyCss(`[data-block-id="${id}"]${selector} *`, style);
  }
  return css;
}

/** A fonte escolhida vale também para os filhos, que costumam ter `font-family` próprio. */
export function fontFamilyCss(
  selector: string,
  style: BlockStyle | undefined
): string {
  const family = style?.fontFamily;
  return family ? `${selector}{font-family:${family}!important}` : "";
}

const TRANSLATE_VALUE = /^-?\d+(\.\d+)?px -?\d+(\.\d+)?px$/;

/**
 * Deslocamento livre (`translate: Xpx Ypx`). Só vale em tela larga: no celular/tablet o item volta
 * ao lugar, senão ele sairia da tela. `.sb-narrow` é o preview estreito do editor.
 */
export function translateCss(
  selector: string,
  value: string | number | undefined
): string {
  if (typeof value !== "string" || !TRANSLATE_VALUE.test(value)) return "";
  return `@media (min-width:861px){${selector}{translate:${value}!important}}.sb-narrow ${selector}{translate:none!important}`;
}

/**
 * Enquadramento de imagem: zoom e posição dentro da moldura. Guardado como `"zoom x y"` (ex.: `"1.5 -20 10"`):
 * zoom de 1 a 4 e x/y de -100 a 100 (% do quanto a foto pode andar para cada lado; positivo empurra a foto
 * para a direita/baixo). O zoom é `scale` dentro da moldura, que passa a cortar o que sobra (`overflow:hidden`).
 */
export interface Frame {
  x: number;
  y: number;
  z: number;
}

export const FRAME_ZOOM_MAX = 4;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : 0));

export function parseFrame(value: unknown): Frame {
  const [z, x, y] = String(value ?? "")
    .trim()
    .split(/\s+/)
    .map(Number);
  return {
    x: clamp(x ?? 0, -100, 100),
    y: clamp(y ?? 0, -100, 100),
    z: clamp(z ?? 1, 1, FRAME_ZOOM_MAX) || 1,
  };
}

export const isDefaultFrame = (f: Frame) => f.z <= 1 && f.x === 0 && f.y === 0;

export const formatFrame = (f: Frame): string =>
  `${Math.round(clamp(f.z, 1, FRAME_ZOOM_MAX) * 100) / 100} ${Math.round(clamp(f.x, -100, 100))} ${Math.round(clamp(f.y, -100, 100))}`;

/** Declarações CSS (sem `!important`) do enquadramento, como pares propriedade/valor. */
export function frameDecls(f: Frame): Record<string, string> {
  const shift = (f.z - 1) / 2;
  return {
    "object-fit": "cover",
    "object-position": `${50 - f.x / 2}% ${50 - f.y / 2}%`,
    transform:
      f.z > 1
        ? `translate(${(f.x * shift).toFixed(2)}%,${(f.y * shift).toFixed(2)}%) scale(${f.z})`
        : "none",
  };
}

const FRAME_VALUE = /^\d+(\.\d+)? -?\d+ -?\d+$/;

export function frameCss(
  selector: string,
  parentSelector: string,
  value: string | number | undefined
): string {
  if (typeof value !== "string" || !FRAME_VALUE.test(value.trim())) return "";
  const f = parseFrame(value);
  if (isDefaultFrame(f)) return "";
  const decls = Object.entries(frameDecls(f))
    .map(([k, v]) => `${k}:${v}!important`)
    .join(";");
  return `${selector}{${decls}}${f.z > 1 ? `${parentSelector}{overflow:hidden!important}` : ""}`;
}
