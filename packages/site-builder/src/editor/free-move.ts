/**
 * Mover itens livremente no canvas. A posição é o deslocamento CSS `translate: Xpx Ypx` guardado no
 * estilo do bloco (ou do elemento): não mexe no fluxo da página e vale para qualquer template.
 */

export interface Offset {
  x: number;
  y: number;
}

const TRANSLATE = /^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px$/;

export function parseTranslate(value: unknown): Offset {
  const m = TRANSLATE.exec(String(value ?? "").trim());
  return m ? { x: Number(m[1]), y: Number(m[2]) } : { x: 0, y: 0 };
}

export const formatTranslate = (o: Offset): string =>
  `${Math.round(o.x)}px ${Math.round(o.y)}px`;

/** Linhas (em px de tela) às quais o item "gruda": bordas e centros dos vizinhos. */
export interface SnapLines {
  xs: number[];
  ys: number[];
}

const MIN_SIZE = 8;
const MAX_NODES = 400;

export function collectSnapLines(
  frame: HTMLElement,
  block: HTMLElement,
  dragged: HTMLElement
): SnapLines {
  const xs = new Set<number>();
  const ys = new Set<number>();
  const add = (r: DOMRect) => {
    for (const x of [r.left, r.left + r.width / 2, r.right])
      xs.add(Math.round(x * 2) / 2);
    for (const y of [r.top, r.top + r.height / 2, r.bottom])
      ys.add(Math.round(y * 2) / 2);
  };

  // A página inteira (bordas e centro) e os outros blocos.
  add(frame.getBoundingClientRect());
  for (const b of Array.from(
    frame.querySelectorAll<HTMLElement>(".sb-block")
  )) {
    if (b === block || b.contains(dragged)) continue;
    const r = b.getBoundingClientRect();
    if (r.width >= MIN_SIZE && r.height >= MIN_SIZE) add(r);
  }
  // Os itens do mesmo bloco, exceto o arrastado e quem o contém ou está dentro dele.
  const nodes = Array.from(block.querySelectorAll<HTMLElement>("*")).slice(
    0,
    MAX_NODES
  );
  for (const el of nodes) {
    if (el === dragged || dragged.contains(el) || el.contains(dragged))
      continue;
    if (["STYLE", "SCRIPT", "LINK"].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= MIN_SIZE && r.height >= MIN_SIZE) add(r);
  }
  return { xs: [...xs], ys: [...ys] };
}

interface Snapped {
  dx: number;
  dy: number;
  /** Posição (px de tela) da guia vertical/horizontal, quando encaixou. */
  gx?: number;
  gy?: number;
}

function best(
  edges: number[],
  delta: number,
  targets: number[],
  threshold: number
): { delta: number; guide?: number } {
  let pick: { diff: number; guide: number } | undefined;
  for (const edge of edges) {
    for (const t of targets) {
      const diff = t - (edge + delta);
      if (
        Math.abs(diff) <= threshold &&
        (!pick || Math.abs(diff) < Math.abs(pick.diff))
      )
        pick = { diff, guide: t };
    }
  }
  return pick ? { delta: delta + pick.diff, guide: pick.guide } : { delta };
}

/** Ajusta o deslocamento (px de tela) para encaixar nas bordas/centros próximos. */
export function snap(
  rect: { height: number; left: number; top: number; width: number },
  dx: number,
  dy: number,
  lines: SnapLines,
  threshold = 6
): Snapped {
  const sx = best(
    [rect.left, rect.left + rect.width / 2, rect.left + rect.width],
    dx,
    lines.xs,
    threshold
  );
  const sy = best(
    [rect.top, rect.top + rect.height / 2, rect.top + rect.height],
    dy,
    lines.ys,
    threshold
  );
  return { dx: sx.delta, dy: sy.delta, gx: sx.guide, gy: sy.guide };
}
