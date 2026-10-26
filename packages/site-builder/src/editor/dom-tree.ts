export interface ElementNode {
  children: ElementNode[];
  label: string;
  path: string;
}

const NAMES: Record<string, string> = {
  A: "link",
  BUTTON: "botão",
  H1: "título",
  H2: "título",
  H3: "título",
  H4: "título",
  H5: "título",
  H6: "título",
  IMG: "imagem",
  INPUT: "campo",
  LABEL: "texto",
  NAV: "menu",
  P: "texto",
  SPAN: "texto",
  SVG: "ícone",
  TEXTAREA: "campo",
  UL: "lista",
};

/** Elementos que valem como um item só, sem descer ao que há dentro. */
const ATOMIC = new Set([
  "A",
  "BUTTON",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "IMG",
  "INPUT",
  "LABEL",
  "P",
  "SVG",
  "TEXTAREA",
]);

export const elementName = (el: Element) =>
  NAMES[el.tagName.toUpperCase()] ?? "área";

export function elementLabel(el: Element): string {
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 24);
  return `${elementName(el)}${text ? ` · ${text}` : ""}`;
}

/**
 * Árvore de itens editáveis dentro de um bloco renderizado. Contêineres sem significado próprio
 * (um `div` com um filho só, por exemplo) são pulados; blocos filhos ficam de fora, pois já
 * aparecem na árvore de blocos. O caminho é o mesmo `nth-child` usado em `elStyles`.
 */
export function elementTree(block: HTMLElement): ElementNode[] {
  const walk = (parent: Element, prefix: number[]): ElementNode[] => {
    const out: ElementNode[] = [];
    Array.from(parent.children).forEach((el, i) => {
      const tag = el.tagName.toUpperCase();
      if (tag === "STYLE" || tag === "SCRIPT" || tag === "LINK") return;
      if (el.hasAttribute("data-block-id")) return;
      const at = [...prefix, i + 1];
      const path = at.join(".");
      const atomic =
        ATOMIC.has(tag) ||
        (el.children.length === 0 && (el.textContent ?? "").trim() !== "");
      if (atomic) {
        out.push({ children: [], label: elementLabel(el), path });
        return;
      }
      const kids = walk(el, at);
      if (kids.length > 1) {
        out.push({ children: kids, label: elementName(el), path });
      } else {
        out.push(...kids);
      }
    });
    return out;
  };
  return walk(block, []);
}
