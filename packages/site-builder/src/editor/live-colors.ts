/**
 * Cores que o elemento mostra de verdade no canvas (fundo e texto), lidas do DOM. O painel usa para mostrar de cara
 * a cor que já está lá (a do modelo, vinda do CSS do template), e não só o que o usuário definiu à mão.
 */
export interface LiveColors {
  /** Fundo visível, em hex (`#rrggbb`). */
  background?: string;
  /** De onde veio: o próprio elemento, um elemento de dentro que o cobre, ou o de fora. */
  backgroundFrom?: "inner" | "parent" | "self";
  /** O elemento tem imagem ou degradê de fundo (a cor fica por trás dela). */
  backgroundImage?: boolean;
  /** Cor do texto, em hex. */
  color?: string;
}

const hex2 = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");

/**
 * Converte o que `getComputedStyle` devolve (`rgb()`, `rgba()` ou `color(srgb …)`, que é como o navegador mostra
 * `color-mix`) em hex + opacidade. Formato desconhecido → `undefined`.
 */
export function parseCssColor(
  css: string
): { alpha: number; hex: string } | undefined {
  const text = css.trim().toLowerCase();
  if (text === "transparent") return { alpha: 0, hex: "#000000" };
  const rgb =
    /^rgba?\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+(-?[\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(
      text
    );
  if (rgb) {
    const a = rgb[4] === undefined ? 1 : alphaOf(rgb[4]);
    return {
      alpha: a,
      hex: `#${hex2(Number(rgb[1]))}${hex2(Number(rgb[2]))}${hex2(Number(rgb[3]))}`,
    };
  }
  const srgb =
    /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(
      text
    );
  if (srgb) {
    const a = srgb[4] === undefined ? 1 : alphaOf(srgb[4]);
    return {
      alpha: a,
      hex: `#${hex2(Number(srgb[1]) * 255)}${hex2(Number(srgb[2]) * 255)}${hex2(Number(srgb[3]) * 255)}`,
    };
  }
  return undefined;
}

function alphaOf(raw: string): number {
  const n = raw.endsWith("%") ? Number.parseFloat(raw) / 100 : Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
}

/** Abaixo disto o fundo conta como "sem fundo" (véu quase invisível não é a cor do elemento). */
const MIN_ALPHA = 0.15;

function solidBackground(el: Element): string | undefined {
  const parsed = parseCssColor(getComputedStyle(el).backgroundColor);
  return parsed && parsed.alpha >= MIN_ALPHA ? parsed.hex : undefined;
}

/** O filho que cobre quase todo o elemento (ex.: o `<section>` dentro do wrapper do bloco). */
function coveringChild(el: Element): Element | undefined {
  const box = el.getBoundingClientRect();
  const area = box.width * box.height;
  if (area <= 0) return undefined;
  for (const child of Array.from(el.children)) {
    const r = child.getBoundingClientRect();
    if (r.width * r.height >= area * 0.9) return child;
  }
  return undefined;
}

/**
 * Lê as cores visíveis de `el`: o fundo é o do próprio elemento; se ele for transparente, o do filho que o cobre
 * (até 4 níveis) ou, por último, o do elemento de fora (até `root`). A cor do texto é a calculada do elemento.
 */
export function readLiveColors(el: Element, root: Element): LiveColors {
  const style = getComputedStyle(el);
  const text = parseCssColor(style.color);
  const out: LiveColors = {
    backgroundImage:
      style.backgroundImage !== "none" && style.backgroundImage !== ""
        ? true
        : undefined,
    color: text?.hex,
  };

  const own = solidBackground(el);
  if (own) return { ...out, background: own, backgroundFrom: "self" };

  let inner: Element | undefined = el;
  for (let depth = 0; depth < 4 && inner; depth++) {
    inner = coveringChild(inner);
    const found = inner && solidBackground(inner);
    if (found) return { ...out, background: found, backgroundFrom: "inner" };
  }

  for (
    let node = el.parentElement;
    node && root.contains(node);
    node = node.parentElement
  ) {
    const found = solidBackground(node);
    if (found) return { ...out, background: found, backgroundFrom: "parent" };
  }
  return out;
}
