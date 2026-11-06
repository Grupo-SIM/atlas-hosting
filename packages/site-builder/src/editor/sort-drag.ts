/**
 * Reordenar arrastando, com troca ao vivo: ao passar sobre um irmão, ele e o item arrastado trocam de
 * lugar com animação (FLIP). A ordem é aplicada com CSS `order` (inline durante o arrasto, depois
 * gravada no estilo pelo editor), então não mexe na árvore DOM que o React controla.
 */

export interface SortOptions {
  /** Deslocamento livre já salvo no item (`translate`), em px CSS. */
  base: { x: number; y: number };
  el: HTMLElement;
  /** Irmãos (incluindo `el`) na ordem visual atual. */
  items: HTMLElement[];
  /** Soltou: ordem final e se o pai teve que virar flex para a ordem valer. */
  onDrop: (finalOrder: HTMLElement[], converted: boolean) => void;
  /** O arrasto passou do limite e começou de fato. */
  onStart?: () => void;
  parent: HTMLElement;
  /** O pai tem o estilo em `style` do React: não desfazer o `display` inline depois de gravar. */
  parentIsReactStyled: boolean;
  /** Área rolável (para rolar sozinha perto da borda). */
  scroller: HTMLElement | null;
  startX: number;
  startY: number;
  /** Zoom CSS do quadro do canvas (px de tela / px CSS). */
  zoom: number;
}

const EASE = "cubic-bezier(.2,.8,.2,1)";
const THRESHOLD = 4;

const FLEX_OR_GRID = /flex|grid/;

/** Começa a acompanhar o ponteiro; devolve a função que cancela. */
export function startSort(o: SortOptions): () => void {
  const { el, items, parent, zoom, base } = o;
  const list = items.slice();
  let started = false;
  let converted = false;
  let px = o.startX;
  let py = o.startY;
  let raf = 0;
  let rect0: DOMRect | null = null;
  let ex = { x: 0, y: 0 };

  const place = () => {
    if (!rect0) return { cx: 0, cy: 0 };
    const r = el.getBoundingClientRect();
    // Onde o item estaria sem o deslocamento do arrasto (o "espaço" dele no layout).
    const slotL = r.left - ex.x * zoom;
    const slotT = r.top - ex.y * zoom;
    ex = {
      x: (rect0.left + (px - o.startX) - slotL) / zoom,
      y: (rect0.top + (py - o.startY) - slotT) / zoom,
    };
    el.style.setProperty(
      "translate",
      `${base.x + ex.x}px ${base.y + ex.y}px`,
      "important"
    );
    return { cx: slotL + r.width / 2, cy: slotT + r.height / 2 };
  };

  const applyOrder = () => {
    for (let k = 0; k < list.length; k++)
      list[k]?.style.setProperty("order", String(k));
  };

  const reorder = (hit: HTMLElement) => {
    const others = list.filter(i => i !== el);
    const first = new Map(others.map(i => [i, i.getBoundingClientRect()]));
    // O destino é o índice do vizinho ANTES de tirar o item: assim ele toma o lugar do vizinho.
    const to = list.indexOf(hit);
    list.splice(list.indexOf(el), 1);
    list.splice(to, 0, el);
    // Sem transform, para medir onde cada um vai ficar de verdade.
    for (const it of others) {
      it.style.transition = "none";
      it.style.transform = "";
    }
    applyOrder();
    const moves: [HTMLElement, number, number][] = [];
    for (const [it, f] of first) {
      const l = it.getBoundingClientRect();
      const dx = (f.left - l.left) / zoom;
      const dy = (f.top - l.top) / zoom;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) moves.push([it, dx, dy]);
    }
    for (const [it, dx, dy] of moves)
      it.style.transform = `translate(${dx}px, ${dy}px)`;
    void parent.offsetWidth; // força o layout antes de animar
    for (const [it] of moves) {
      it.style.transition = `transform 220ms ${EASE}`;
      it.style.transform = "";
    }
  };

  const swapIfOver = (slot: { cx: number; cy: number }) => {
    for (const it of list) {
      if (it === el) continue;
      const b = it.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      if (px < b.left || px > b.right || py < b.top || py > b.bottom) continue;
      // Troca quando o ponteiro está mais perto do espaço do vizinho que do próprio.
      const dT = Math.hypot(
        px - (b.left + b.width / 2),
        py - (b.top + b.height / 2)
      );
      const dE = Math.hypot(px - slot.cx, py - slot.cy);
      if (dT < dE) reorder(it);
      return;
    }
  };

  const autoScroll = () => {
    const sc = o.scroller;
    if (!sc) return;
    const r = sc.getBoundingClientRect();
    const edge = 56;
    if (py < r.top + edge) sc.scrollTop -= Math.ceil((r.top + edge - py) / 4);
    else if (py > r.bottom - edge)
      sc.scrollTop += Math.ceil((py - (r.bottom - edge)) / 4);
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    autoScroll();
    swapIfOver(place());
  };

  const begin = () => {
    started = true;
    o.onStart?.();
    rect0 = el.getBoundingClientRect();
    if (!FLEX_OR_GRID.test(getComputedStyle(parent).display)) {
      parent.style.setProperty("display", "flex");
      parent.style.setProperty("flex-direction", "column");
      converted = true;
    }
    applyOrder();
    el.style.transition = "none";
    el.style.setProperty("z-index", "60");
    el.style.setProperty("pointer-events", "none");
    el.style.setProperty("box-shadow", "0 12px 32px rgba(0,0,0,.28)");
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    raf = requestAnimationFrame(frame);
  };

  const cleanup = (keepParent: boolean) => {
    for (const it of list) {
      it.style.removeProperty("order");
      it.style.removeProperty("transform");
      it.style.removeProperty("transition");
    }
    for (const p of ["z-index", "pointer-events", "box-shadow", "translate"])
      el.style.removeProperty(p);
    if (converted && !keepParent) {
      parent.style.removeProperty("display");
      parent.style.removeProperty("flex-direction");
    }
  };

  const onMove = (ev: PointerEvent) => {
    px = ev.clientX;
    py = ev.clientY;
    if (!started && Math.hypot(px - o.startX, py - o.startY) >= THRESHOLD)
      begin();
  };

  const stop = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    cancelAnimationFrame(raf);
  };

  const finish = (commit: boolean) => {
    stop();
    if (!started) return;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    // O item desliza até o lugar final; a ordem já foi aplicada, então os vizinhos não se mexem.
    el.style.transition = `translate 170ms ${EASE}, box-shadow 170ms`;
    el.style.setProperty("translate", `${base.x}px ${base.y}px`, "important");
    el.style.removeProperty("box-shadow");
    const keepParent = commit && o.parentIsReactStyled;
    if (commit) o.onDrop(list.slice(), converted);
    setTimeout(() => cleanup(keepParent), 200);
  };

  function onUp() {
    finish(true);
  }
  function onCancel() {
    finish(false);
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  return () => finish(false);
}
