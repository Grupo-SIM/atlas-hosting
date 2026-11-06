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
  "gap",
  "height",
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
      .filter(([k]) => k !== "translate")
      .map(([k, v]) => {
        const prop = k.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
        const value =
          typeof v === "number" && !UNITLESS.has(k) && v !== 0 ? `${v}px` : v;
        return `${prop}:${value}!important`;
      })
      .join(";");
    if (decls) css += `[data-block-id="${id}"]${selector}{${decls}}`;
    css += translateCss(`[data-block-id="${id}"]${selector}`, style.translate);
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
