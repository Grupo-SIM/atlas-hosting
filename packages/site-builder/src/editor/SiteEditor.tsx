"use client";

import {
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getBlockDefinition } from "../blocks/registry.js";
import type { Site } from "../model/index.js";
import { resolveRoute } from "../renderer/routes.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { ConfirmDialog, type ConfirmRequest } from "./ConfirmDialog.js";
import { ContentPanel } from "./ContentPanel.js";
import { elementTree } from "./dom-tree.js";
import type { ResolveChannel } from "./fields.js";
import {
  collectSnapLines,
  formatTranslate,
  parseTranslate,
  type SnapLines,
  snap,
} from "./free-move.js";
import { type FocusHint, Inspector } from "./Inspector.js";
import { Icon } from "./icons.js";
import { type LayerSection, LayersPanel } from "./LayersPanel.js";
import { PagePicker, type RouteGroup } from "./PagePicker.js";
import { type PublishConfig, ReviewDialog } from "./ReviewDialog.js";
import { setMenu, setTheme, withAdBlocks } from "./site-ops.js";
import { startSort } from "./sort-drag.js";
import { editorCss } from "./styles.js";
import {
  ancestorsOf,
  type DropTarget,
  duplicateBlock,
  findBlock,
  insertBlock,
  insertBlockAt,
  moveBlock,
  moveBlockTo,
  removeBlock,
  rootBlocks,
  rootForRoute,
  rootLabel,
  rootOf,
  setBlockAnchor,
  setBlockHidden,
  setElementOrders,
  updateBlockFx,
  updateBlockProps,
  updateBlockStyle,
  updateElementStyle,
} from "./tree.js";
import type { ChangeEntry, EditMeta, SaveResult } from "./types.js";

export type { SaveResult } from "./types.js";

export interface SiteEditorProps {
  /** Prefixo das URLs do canvas (o editor intercepta os cliques, mas os hrefs precisam ser coerentes). */
  basePath?: string;
  /** Para onde o X do topo leva. */
  exitHref?: string;
  initialSite: Site;
  onPublish?: (site: Site, password?: string) => Promise<SaveResult>;
  /** Confere um canal do YouTube (link, @usuario ou ID). Sem isso, o campo aceita só o ID `UC…`. */
  onResolveChannel?: ResolveChannel;
  onSave: (site: Site) => Promise<SaveResult>;
  /** Envia o arquivo e devolve a URL pública. Sem isso, imagens aceitam só URL. */
  onUploadImage?: (file: File) => Promise<string>;
  /** Envia um arquivo de fonte e devolve nome + URL pública. Sem isso, só as fontes da lista. */
  onUploadFont?: (file: File) => Promise<{ name: string; url: string }>;
  /** Site de origem (template) para "Restaurar original". Sem isso o botão some. */
  originalSite?: Site;
  /** Onde e como publicar; sem isso o botão de publicar não aparece. */
  publish?: PublishConfig;
  /** Identifica o site para guardar a lista de alterações pendentes no navegador. */
  storageKey?: string;
}

type Device = "desktop" | "mobile" | "tablet";
type LeftTab = "camadas" | "chat" | "paginas";

const DEVICES: {
  icon: "monitor" | "smartphone" | "tablet";
  id: Device;
  label: string;
  width: number;
}[] = [
  { icon: "monitor", id: "desktop", label: "Desktop", width: 1280 },
  { icon: "tablet", id: "tablet", label: "Tablet", width: 820 },
  { icon: "smartphone", id: "mobile", label: "Celular", width: 390 },
];

interface History {
  future: Site[];
  past: Site[];
  present: Site;
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLInputElement ||
  t instanceof HTMLTextAreaElement ||
  t instanceof HTMLSelectElement ||
  (t instanceof HTMLElement && t.isContentEditable);

const pageUrl = (slug: string) => (slug ? `/${slug}/` : "/");

const ITEM_NAMES: Record<string, string> = {
  A: "link",
  BUTTON: "botão",
  H1: "título",
  H2: "título",
  H3: "título",
  H4: "título",
  IMG: "imagem",
  P: "texto",
  SPAN: "texto",
};
const itemName = (el: HTMLElement) => ITEM_NAMES[el.tagName] ?? "área";

/** Elemento "clicável" sob o ponteiro: links e botões valem como um item só. */
function pickElement(target: HTMLElement): HTMLElement | null {
  const block = target.closest<HTMLElement>("[data-block-id]");
  if (!block) return null;
  // Imagem dentro de link continua sendo a imagem (para poder redimensionar).
  if (target instanceof HTMLImageElement) return target;
  const wrap = target.closest<HTMLElement>("a,button,.sb-header-search");
  return wrap && block.contains(wrap) ? wrap : target;
}

/** Caminho `nth-child` do elemento dentro do bloco; vazio quando é o próprio bloco. */
function pathWithin(el: HTMLElement, block: HTMLElement): string {
  const parts: number[] = [];
  let cur: HTMLElement | null = el;
  while (cur && cur !== block) {
    const parent: HTMLElement | null = cur.parentElement;
    if (!parent) return "";
    parts.unshift(Array.prototype.indexOf.call(parent.children, cur) + 1);
    cur = parent;
  }
  return parts.join(".");
}

function elementAt(block: HTMLElement, path: string): HTMLElement | null {
  let cur: HTMLElement | null = block;
  for (const n of path.split(".")) {
    cur = (cur?.children[Number(n) - 1] as HTMLElement | undefined) ?? null;
  }
  return cur;
}

export function SiteEditor({
  basePath = "/site",
  exitHref,
  initialSite,
  onPublish,
  onResolveChannel,
  onSave,
  onUploadImage,
  onUploadFont,
  originalSite,
  publish,
  storageKey,
}: SiteEditorProps) {
  const [history, setHistory] = useState<History>({
    future: [],
    past: [],
    present: initialSite,
  });
  const site = history.present;
  const siteRef = useRef(site);
  siteRef.current = site;
  const savedRef = useRef(initialSite);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const lastEdit = useRef<{ at: number; key: string }>({ at: 0, key: "" });

  const [path, setPath] = useState("/");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>("camadas");
  const [leftOpen, setLeftOpen] = useState(true);
  const [device, setDevice] = useState<Device>("desktop");
  const [availW, setAvailW] = useState(900);
  const [saveState, setSaveState] = useState<
    "error" | "idle" | "saved" | "saving"
  >("idle");
  const [saveError, setSaveError] = useState("");
  const [review, setReview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [toast, setToast] = useState("");
  const [log, setLog] = useState<ChangeEntry[]>(() => {
    if (!storageKey) return [];
    try {
      const raw = localStorage.getItem(`sbe-log:${storageKey}`);
      return raw ? (JSON.parse(raw) as ChangeEntry[]) : [];
    } catch {
      return [];
    }
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLElement | null>(null);
  const [focusHint, setFocusHint] = useState<FocusHint>({ n: 0, value: "" });
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [, setDomTick] = useState(0);
  const [elPath, setElPath] = useState("");
  const [elName, setElName] = useState("");
  const selBoxRef = useRef<HTMLDivElement | null>(null);
  const hoverBoxRef = useRef<HTMLDivElement | null>(null);
  const guideVRef = useRef<HTMLDivElement | null>(null);
  const guideHRef = useRef<HTMLDivElement | null>(null);
  const justDragged = useRef(false);
  /** Como arrastar no canvas: trocar de lugar (item ou bloco) ou deslocar livremente. */
  const [dragMode, setDragMode] = useState<"block" | "free" | "item">("item");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const route = useMemo(() => resolveRoute(site, path, "edit"), [site, path]);
  const dirty = site !== savedRef.current;
  const mainRoot = rootForRoute(route);

  const flash = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  // Painel esquerdo começa fechado em tela estreita.
  useEffect(() => {
    if (window.innerWidth < 1200) setLeftOpen(false);
    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!(el && window.ResizeObserver)) return;
    const ro = new ResizeObserver(() => setAvailW(el.clientWidth));
    ro.observe(el);
    setAvailW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(`sbe-log:${storageKey}`, JSON.stringify(log));
    } catch {
      // sem armazenamento (janela privada): a lista vale só nesta sessão.
    }
  }, [log, storageKey]);

  /** Aplica a edição; `meta.key` agrupa edições seguidas do mesmo campo num único passo de desfazer. */
  const edit = useCallback((next: Site, meta: EditMeta = {}) => {
    setHistory(h => {
      const now = Date.now();
      const merge =
        meta.key !== undefined &&
        lastEdit.current.key === meta.key &&
        now - lastEdit.current.at < 1000;
      lastEdit.current = { at: now, key: meta.key ?? "" };
      return {
        future: [],
        past: merge ? h.past : [...h.past.slice(-99), h.present],
        present: next,
      };
    });
    const { label } = meta;
    if (label) {
      setLog(l =>
        l[l.length - 1]?.label === label
          ? l
          : [...l, { id: meta.id, kind: meta.kind ?? "Editado", label }].slice(
              -40
            )
      );
    }
  }, []);

  const undo = useCallback(() => {
    lastEdit.current = { at: 0, key: "" };
    setHistory(h => {
      const prev = h.past[h.past.length - 1];
      if (!prev) return h;
      return {
        future: [h.present, ...h.future],
        past: h.past.slice(0, -1),
        present: prev,
      };
    });
  }, []);
  const redo = useCallback(() => {
    lastEdit.current = { at: 0, key: "" };
    setHistory(h => {
      const [next, ...rest] = h.future;
      if (!next) return h;
      return { future: rest, past: [...h.past, h.present], present: next };
    });
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const current = siteRef.current;
    if (current === savedRef.current) return true;
    setSaveState("saving");
    try {
      const result = await onSaveRef.current(current);
      if (result.ok) {
        savedRef.current = current;
        setSaveState("saved");
        setSaveError("");
        return true;
      }
      setSaveState("error");
      setSaveError(result.error);
    } catch {
      setSaveState("error");
      setSaveError("Não foi possível salvar. Tente novamente.");
    }
    return false;
  }, []);

  // Salva sozinho um instante depois da última edição.
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => void save(), 1500);
    return () => clearTimeout(t);
  }, [dirty, save, site]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Destaque do bloco (ou do elemento) selecionado dentro do canvas.
  const paintSelection = () => {
    const root = canvasRef.current;
    const box = selBoxRef.current;
    if (!root) return;
    for (const el of Array.from(root.querySelectorAll("[data-selected]")))
      el.removeAttribute("data-selected");
    const block = selectedId
      ? root.querySelector<HTMLElement>(`[data-block-id="${selectedId}"]`)
      : null;
    const target = block && elPath ? elementAt(block, elPath) : null;
    if (block && !target) block.setAttribute("data-selected", "true");
    if (!box) return;
    if (!target) {
      box.style.display = "none";
      return;
    }
    const r = target.getBoundingClientRect();
    box.style.display = "block";
    box.style.left = `${r.left}px`;
    box.style.top = `${r.top}px`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;
  };
  useEffect(paintSelection);

  // As camadas leem o DOM do canvas; repinta depois que o site renderizou.
  useEffect(() => setDomTick(t => t + 1), [site, path, device]);

  // Se o bloco selecionado foi apagado (ex.: desfazer), limpa a seleção.
  useEffect(() => {
    if (selectedId && !findBlock(site, selectedId)) setSelectedId(null);
  }, [selectedId, site]);

  const selected = selectedId ? findBlock(site, selectedId) : undefined;
  const labelOf = (type: string) => getBlockDefinition(type)?.label ?? type;

  const goTo = (next: string) => {
    setPath(next);
    setSelectedId(null);
  };

  const select = (id: string | null) => {
    setSelectedId(id);
    setElPath("");
    if (!id) return;
    // Em páginas de blocos de cabeçalho/rodapé o canvas já mostra tudo; só garante o painel certo.
    setLeftTab(t => (t === "chat" ? "camadas" : t));
  };

  const blockEl = (id: string) =>
    canvasRef.current?.querySelector<HTMLElement>(`[data-block-id="${id}"]`);
  const getElements = (id: string) => {
    const el = blockEl(id);
    return el ? elementTree(el) : [];
  };
  const selectElement = (id: string, path: string, label: string) => {
    select(id);
    setElPath(path);
    setElName(label);
    const block = blockEl(id);
    const el = block ? elementAt(block, path) : null;
    setFocusHint(h => ({
      n: h.n + 1,
      value:
        el instanceof HTMLImageElement
          ? (el.getAttribute("src") ?? "")
          : (el?.textContent ?? ""),
    }));
  };

  const addBlock = (type: string) => {
    const key = (selectedId && rootOf(site, selectedId)) || mainRoot;
    if (!rootBlocks(site, key)) return;
    const res = insertBlock(site, key, type, selectedId ?? undefined);
    edit(res.site, {
      id: res.id,
      kind: "Novo",
      label: `Adicionou · ${labelOf(type)}`,
    });
    setSelectedId(res.id);
  };

  /** Arrastar e soltar nas camadas: mover um bloco existente. */
  const moveTo = (id: string, target: DropTarget) => {
    const next = moveBlockTo(site, id, target);
    if (next === site) return;
    const block = findBlock(site, id);
    edit(next, {
      id,
      label: `Moveu · ${labelOf(block?.type ?? "")}`,
    });
    setSelectedId(id);
  };

  /** Arrastar da lista "Adicionar bloco" direto para um ponto das camadas. */
  const insertAt = (type: string, target: DropTarget) => {
    const res = insertBlockAt(site, type, target);
    if (res.site === site) return;
    edit(res.site, {
      id: res.id,
      kind: "Novo",
      label: `Adicionou · ${labelOf(type)}`,
    });
    setSelectedId(res.id);
  };

  /** Liga/desliga os anúncios; ao ligar, garante o bloco de anúncio em cada página. */
  const setAds = (on: boolean) => {
    const themed = setTheme(site, { ads: on ? "on" : "off" });
    edit(on ? withAdBlocks(themed) : themed, {
      key: "theme-ads",
      kind: "Tema",
      label: "Tema · Anúncios",
    });
  };

  const blockAction = (
    action: "delete" | "down" | "duplicate" | "hide" | "up"
  ) => {
    if (!selected) return;
    const name = labelOf(selected.type);
    if (action === "delete") {
      edit(removeBlock(site, selected.id), {
        kind: "Removido",
        label: `Excluiu · ${name}`,
      });
      setSelectedId(null);
    } else if (action === "duplicate") {
      const res = duplicateBlock(site, selected.id);
      edit(res.site, { id: res.id, kind: "Novo", label: `Duplicou · ${name}` });
      if (res.id) setSelectedId(res.id);
    } else if (action === "hide") {
      toggleHidden(selected.id);
    } else {
      edit(moveBlock(site, selected.id, action === "up" ? -1 : 1), {
        id: selected.id,
        label: `${action === "up" ? "Moveu para cima" : "Moveu para baixo"} · ${name}`,
      });
    }
  };

  const toggleHidden = (id: string) => {
    const block = findBlock(site, id);
    if (!block) return;
    edit(setBlockHidden(site, id, !block.hidden), {
      id,
      kind: block.hidden ? "Editado" : "Oculto",
      label: `${block.hidden ? "Mostrou" : "Ocultou"} · ${labelOf(block.type)}`,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && k === "s") {
        e.preventDefault();
        void save();
        return;
      }
      if (isTyping(e.target)) return;
      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && k === "d" && selectedId) {
        e.preventDefault();
        blockAction("duplicate");
      } else if ((k === "delete" || k === "backspace") && selectedId) {
        e.preventDefault();
        blockAction("delete");
      } else if (
        selectedId &&
        device === "desktop" &&
        ["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(k)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        nudge(
          k === "arrowleft" ? -step : k === "arrowright" ? step : 0,
          k === "arrowup" ? -step : k === "arrowdown" ? step : 0
        );
      } else if (k === "escape") {
        setSelectedId(null);
        setReview(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Site que já estava com anúncios ligados: cria os blocos de anúncio que faltam (uma vez, ao abrir).
  useEffect(() => {
    const first = siteRef.current;
    if (first.theme.ads !== "on") return;
    const next = withAdBlocks(first);
    if (next !== first) {
      edit(next, { key: "theme-ads", kind: "Tema", label: "Tema · Anúncios" });
    }
  }, []);

  const onCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (justDragged.current) {
      justDragged.current = false;
      e.preventDefault();
      return;
    }
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) {
      e.preventDefault();
      // Clique comum só seleciona para editar; Ctrl/Cmd + clique abre o link.
      if (e.ctrlKey || e.metaKey) {
        const href = anchor.getAttribute("href") ?? "";
        if (href.length > 1 && href.startsWith("#")) {
          target.ownerDocument
            .getElementById(href.slice(1))
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (href.startsWith(basePath)) {
          goTo(href.slice(basePath.length) || "/");
          return;
        }
      }
    }
    const block = target.closest<HTMLElement>("[data-block-id]");
    select(block?.dataset.blockId ?? null);
    const el = block ? pickElement(target) : null;
    if (block && el) {
      const path = pathWithin(el, block);
      setElPath(path);
      const text = (el.textContent ?? "").trim().slice(0, 24);
      setElName(path ? `${itemName(el)}${text ? ` · ${text}` : ""}` : "");
    }
    const value =
      el instanceof HTMLImageElement
        ? (el.getAttribute("src") ?? "")
        : (el?.textContent ?? "");
    setFocusHint(h => ({ n: h.n + 1, value }));
  };

  const showGuides = (gx?: number, gy?: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const v = guideVRef.current;
    const h = guideHRef.current;
    if (!(rect && v && h)) return;
    if (gx === undefined) v.style.display = "none";
    else {
      v.style.display = "block";
      v.style.left = `${gx}px`;
      v.style.top = `${rect.top}px`;
      v.style.height = `${rect.height}px`;
    }
    if (gy === undefined) h.style.display = "none";
    else {
      h.style.display = "block";
      h.style.top = `${gy}px`;
      h.style.left = `${rect.left}px`;
      h.style.width = `${rect.width}px`;
    }
  };

  /** Grava o deslocamento (bloco ou elemento) e, em texto em linha, garante que o `translate` valha. */
  const commitOffset = (
    blockId: string,
    elP: string,
    x: number,
    y: number,
    inline: boolean,
    key: string
  ) => {
    const block = findBlock(siteRef.current, blockId);
    if (!block) return;
    const zero = x === 0 && y === 0;
    const patch = {
      ...(inline && !zero ? { display: "inline-block" } : {}),
      translate: zero ? undefined : formatTranslate({ x, y }),
    };
    edit(
      elP
        ? updateElementStyle(siteRef.current, blockId, elP, patch)
        : updateBlockStyle(siteRef.current, blockId, patch),
      { id: blockId, key, label: `Moveu · ${labelOf(block.type)}` }
    );
  };

  /**
   * Mover qualquer item livremente: segure e arraste. Dentro do item já selecionado arrasta ele;
   * senão, o item sob o ponteiro. Encaixa nas bordas/centros vizinhos (Alt desliga), Shift trava
   * o eixo. O deslocamento aparece ao vivo no DOM e só vai para o site quando solta.
   */
  const startFreeMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || device !== "desktop" || e.ctrlKey || e.metaKey)
      return;
    const target = e.target as HTMLElement;
    if (target.closest(".sb-header .sb-logo, .sb-header .sb-logo-img")) return;
    const picked = pickElement(target);
    const pickedBlock = picked?.closest<HTMLElement>("[data-block-id]");
    if (!(picked && pickedBlock)) return;

    const selBlock = selectedId ? blockEl(selectedId) : null;
    const selEl = selBlock
      ? elPath
        ? elementAt(selBlock, elPath)
        : selBlock
      : null;
    const useSel = Boolean(selBlock && selEl?.contains(target));
    const node = useSel && selBlock ? selBlock : pickedBlock;
    const el = useSel && selEl ? selEl : picked;
    const blockId = node.dataset.blockId;
    if (!blockId) return;
    const elP = useSel ? elPath : pathWithin(el, node);
    const block = findBlock(siteRef.current, blockId);
    if (!block) return;

    const base = parseTranslate(
      elP ? block.elStyles?.[elP]?.translate : block.style?.translate
    );
    const startX = e.clientX;
    const startY = e.clientY;
    const frame = node.closest<HTMLElement>(".sbe-frame");
    let started = false;
    let inline = false;
    let rect: DOMRect | null = null;
    let lines: SnapLines | null = null;
    let off = { ...base };

    const move = (ev: globalThis.PointerEvent) => {
      let dx = ev.clientX - startX;
      let dy = ev.clientY - startY;
      if (!started) {
        if (Math.hypot(dx, dy) < 4) return;
        started = true;
        rect = el.getBoundingClientRect();
        lines = frame ? collectSnapLines(frame, node, el) : null;
        inline = getComputedStyle(el).display === "inline";
        if (inline)
          el.style.setProperty("display", "inline-block", "important");
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        setSelectedId(blockId);
        setElPath(elP);
        const text = (el.textContent ?? "").trim().slice(0, 24);
        setElName(elP ? `${itemName(el)}${text ? ` · ${text}` : ""}` : "");
      }
      if (ev.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      let gx: number | undefined;
      let gy: number | undefined;
      if (lines && rect && !ev.altKey) {
        const s = snap(rect, dx, dy, lines);
        dx = s.dx;
        dy = s.dy;
        gx = s.gx;
        gy = s.gy;
      }
      off = { x: base.x + dx / zoom, y: base.y + dy / zoom };
      el.style.setProperty("translate", formatTranslate(off), "important");
      showGuides(gx, gy);
      paintSelection();
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (!started) return;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      showGuides();
      el.style.removeProperty("translate");
      if (inline) el.style.removeProperty("display");
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 0);
      commitOffset(
        blockId,
        elP,
        Math.round(off.x),
        Math.round(off.y),
        inline,
        `move:${blockId}:${elP}`
      );
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  /**
   * Reordenar arrastando: o item acompanha o mouse e, ao passar sobre um irmão, os dois trocam de
   * lugar ao vivo. "Item" move o componente sob o ponteiro (sobe até achar um nível com irmãos);
   * "Bloco" move o bloco inteiro. Shift inverte o modo só nesse arrasto.
   */
  const startSortMove = (
    e: PointerEvent<HTMLDivElement>,
    wantBlock: boolean
  ) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    if (target.closest(".sb-header .sb-logo, .sb-header .sb-logo-img")) return;
    const picked = pickElement(target);
    const pickedBlock = picked?.closest<HTMLElement>("[data-block-id]");
    if (!(picked && pickedBlock)) return;

    const selBlock = selectedId ? blockEl(selectedId) : null;
    const selEl = selBlock
      ? elPath
        ? elementAt(selBlock, elPath)
        : selBlock
      : null;
    const useSel = Boolean(selBlock && selEl?.contains(target));
    const node = useSel && selBlock ? selBlock : pickedBlock;
    let el: HTMLElement = useSel && selEl ? selEl : picked;
    const blockId = node.dataset.blockId;
    if (!blockId) return;

    const isItem = (c: Element) =>
      !["STYLE", "SCRIPT", "LINK"].includes(c.tagName);
    const siblingsOf = (x: HTMLElement) =>
      Array.from(x.parentElement?.children ?? []).filter(
        isItem
      ) as HTMLElement[];

    let block = wantBlock;
    if (!block) {
      // Sobe até um nível que tenha irmãos para trocar; sem nenhum, move o bloco todo.
      while (el !== node && siblingsOf(el).length < 2 && el.parentElement)
        el = el.parentElement;
      if (el === node) block = true;
    }

    let items: HTMLElement[];
    let parent: HTMLElement | null;
    if (block) {
      el = node;
      parent = node.parentElement;
      if (!parent || parent.classList.contains("sb")) return;
      items = Array.from(parent.children).filter(
        c => (c as HTMLElement).dataset.blockId
      ) as HTMLElement[];
      if (items.length < 2) return;
    } else {
      parent = el.parentElement;
      if (!parent) return;
      items = siblingsOf(el);
    }

    // Ordem visual de hoje (CSS `order` salvo, senão a do DOM).
    const orderOf = (x: HTMLElement) =>
      Number.parseInt(getComputedStyle(x).order, 10) || 0;
    items = items
      .map((x, i) => ({ i, o: orderOf(x), x }))
      .sort((a, b) => a.o - b.o || a.i - b.i)
      .map(v => v.x);
    const startOrder = items.slice();

    const elP = block ? "" : pathWithin(el, node);
    const model = findBlock(siteRef.current, blockId);
    if (!model) return;
    const base = parseTranslate(
      elP ? model.elStyles?.[elP]?.translate : model.style?.translate
    );
    const parentPath = block ? "" : pathWithin(parent, node);

    startSort({
      base,
      el,
      items,
      onDrop: (finalOrder, converted) => {
        justDragged.current = true;
        setTimeout(() => {
          justDragged.current = false;
        }, 0);
        const same = finalOrder.every((x, i) => x === startOrder[i]);
        if (same) return;
        if (block) {
          const at = finalOrder.indexOf(el);
          const next = finalOrder[at + 1];
          const prev = finalOrder[at - 1];
          const ref = next ?? prev;
          if (!ref?.dataset.blockId) return;
          const moved = moveBlockTo(siteRef.current, blockId, {
            id: ref.dataset.blockId,
            place: next ? "before" : "after",
          });
          if (moved === siteRef.current) return;
          edit(moved, {
            id: blockId,
            label: `Moveu · ${labelOf(model.type)}`,
          });
          return;
        }
        edit(
          setElementOrders(
            siteRef.current,
            blockId,
            finalOrder.map((x, k) => ({ order: k, path: pathWithin(x, node) })),
            converted
              ? {
                  patch: { display: "flex", flexDirection: "column" },
                  path: parentPath,
                }
              : undefined
          ),
          { id: blockId, label: `Reordenou · ${labelOf(model.type)}` }
        );
      },
      onStart: () => {
        setSelectedId(blockId);
        setElPath(elP);
        const text = (el.textContent ?? "").trim().slice(0, 24);
        setElName(elP ? `${itemName(el)}${text ? ` · ${text}` : ""}` : "");
      },
      parent,
      parentIsReactStyled: !block && parent === node,
      scroller: canvasRef.current,
      startX: e.clientX,
      startY: e.clientY,
      zoom,
    });
  };

  const onMovePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (dragMode === "free") startFreeMove(e);
    else startSortMove(e, (dragMode === "block") !== e.shiftKey);
  };

  /** Setas do teclado empurram o item selecionado (Shift = 10 px). */
  const nudge = (dx: number, dy: number) => {
    if (!selectedId) return;
    const block = findBlock(site, selectedId);
    const node = blockEl(selectedId);
    if (!(block && node)) return;
    const target = elPath ? elementAt(node, elPath) : node;
    const base = parseTranslate(
      elPath ? block.elStyles?.[elPath]?.translate : block.style?.translate
    );
    const inline = target
      ? getComputedStyle(target).display === "inline"
      : false;
    commitOffset(
      selectedId,
      elPath,
      base.x + dx,
      base.y + dy,
      inline,
      `nudge:${selectedId}:${elPath}`
    );
  };

  /** Arrastar a logo do cabeçalho na horizontal: grava `logoX` (% da largura da barra). */
  const onLogoPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const logo = (e.target as HTMLElement).closest<HTMLElement>(
      ".sb-header .sb-logo, .sb-header .sb-logo-img"
    );
    const imgItem = logo?.classList.contains("sb-logo-img") ?? false;
    const bar = logo?.closest<HTMLElement>(".sb-header");
    const id = bar?.closest<HTMLElement>("[data-block-id]")?.dataset.blockId;
    if (!(logo && bar && id)) return;
    e.preventDefault();
    const startRect = logo.getBoundingClientRect();
    const grab = e.clientX - (startRect.left + startRect.width / 2);
    // A posição é em % da área de conteúdo (a barra menos o recuo lateral), não da tela inteira.
    const area = () => {
      const b = bar.getBoundingClientRect();
      const scale = bar.offsetWidth ? b.width / bar.offsetWidth : 1;
      const pad = Number.parseFloat(getComputedStyle(bar).paddingLeft) * scale;
      return { left: b.left + pad, width: b.width - 2 * pad };
    };
    if (area().width <= 0) return;
    const half = (startRect.width / 2 / area().width) * 100;
    let pct = Number.NaN;
    const move = (ev: globalThis.PointerEvent) => {
      const a = area();
      const raw = ((ev.clientX - grab - a.left) / a.width) * 100;
      pct = Math.round(Math.min(100 - half, Math.max(half, raw)) * 10) / 10;
      bar.style.setProperty(imgItem ? "--sb-ix" : "--sb-lx", String(pct / 100));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (Number.isNaN(pct)) return;
      const prop = imgItem ? "imgX" : "logoX";
      edit(updateBlockProps(siteRef.current, id, { [prop]: pct }), {
        id,
        key: `${prop}:${id}`,
        label: imgItem ? "Moveu a logo" : "Moveu o nome",
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // Contorno em overlay: o fundo dos blocos filhos cobriria um outline no próprio bloco.
  const paintHover = () => {
    const box = hoverBoxRef.current;
    const el = hoverRef.current;
    if (!box) return;
    if (!el) {
      box.style.display = "none";
      return;
    }
    const r = el.getBoundingClientRect();
    box.style.display = "block";
    box.style.left = `${r.left}px`;
    box.style.top = `${r.top}px`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;
    const label = box.firstElementChild as HTMLElement | null;
    const type = el.closest<HTMLElement>("[data-block-id]")?.dataset.blockType;
    if (label) label.textContent = `${type ?? ""} › ${itemName(el)}`;
  };
  const onCanvasOver = (e: MouseEvent<HTMLDivElement>) => {
    const el = pickElement(e.target as HTMLElement);
    if (el === hoverRef.current) return;
    hoverRef.current = el;
    paintHover();
  };
  const clearHover = () => {
    hoverRef.current = null;
    paintHover();
  };

  const doPublish = async (password?: string) => {
    if (!onPublish) return;
    setPublishing(true);
    setPublishError("");
    try {
      if (!(await save())) {
        setPublishError("Não foi possível salvar antes de publicar.");
        return;
      }
      const result = await onPublish(siteRef.current, password);
      if (!result.ok) {
        setPublishError(result.error);
        return;
      }
      setLog([]);
      setReview(false);
      flash(
        publish?.domain ? `Publicado em ${publish.domain}` : "Site publicado"
      );
    } catch {
      setPublishError("Não foi possível publicar. Tente novamente.");
    } finally {
      setPublishing(false);
    }
  };

  const restoreOriginal = () => {
    if (!originalSite) return;
    setConfirm({
      confirmLabel: "Restaurar",
      message: "Suas alterações serão desfeitas (dá para voltar com Ctrl+Z).",
      onConfirm: () => {
        edit(structuredClone(originalSite), {
          kind: "Removido",
          label: "Restaurou o site original",
        });
        setLog([]);
        setSelectedId(null);
        setPath("/");
      },
      title: "Restaurar o site original do template?",
    });
  };

  // Estrutura exibida nas camadas: o que aparece no canvas.
  const layerSections: LayerSection[] = [
    { blocks: site.header, key: "header", label: "Cabeçalho" },
    ...(mainRoot === "header"
      ? []
      : [
          {
            blocks: rootBlocks(site, mainRoot) ?? [],
            key: mainRoot,
            label: rootLabel(site, mainRoot),
          },
        ]),
    ...(mainRoot.startsWith("post:")
      ? [
          {
            blocks: site.postLayout,
            key: "postLayout",
            label: "Layout dos posts",
          },
        ]
      : []),
    { blocks: site.footer, key: "footer", label: "Rodapé" },
  ];

  const crumbs = (() => {
    if (!selected) return [];
    const found = ancestorsOf(site, selected.id);
    if (!found) return [];
    return [
      { label: rootLabel(site, found.root) },
      ...found.ancestors.map(b => ({ id: b.id, label: labelOf(b.type) })),
    ];
  })();

  const dev = DEVICES.find(d => d.id === device) ?? DEVICES[0];
  const devW = dev?.width ?? 1280;
  const zoom = Math.max(0.05, Math.min(1, (availW - 32) / devW));
  const wide = availW >= 620;

  const pageLabel =
    route.kind === "page"
      ? route.page.title
      : route.kind === "post"
        ? route.post.title
        : route.kind === "category"
          ? route.category.name
          : "Página";
  const routeGroups: RouteGroup[] = [
    {
      items: site.pages.map(p => ({ label: p.title, value: pageUrl(p.slug) })),
      label: "Páginas",
    },
    {
      items: site.posts.map(p => ({ label: p.title, value: `/${p.slug}/` })),
      label: "Posts",
    },
    {
      items: site.categories.map(c => ({
        label: c.name,
        value: `/category/${c.slug}/`,
      })),
      label: "Categorias",
    },
  ];
  if (!routeGroups.some(g => g.items.some(o => o.value === path)))
    routeGroups.unshift({
      items: [{ label: pageLabel, value: path }],
      label: "Atual",
    });

  const changes = log.length;
  const changesLabel = changes
    ? `${changes} ${changes === 1 ? "alteração" : "alterações"}`
    : "Sem alterações";
  const pill =
    saveState === "saving" || (dirty && saveState !== "error")
      ? { cls: "saving", text: "Salvando…" }
      : saveState === "error"
        ? { cls: "error", text: "Erro ao salvar" }
        : { cls: "", text: changesLabel };

  const currentPage = route.kind === "page" ? route.page : undefined;
  const currentPost = route.kind === "post" ? route.post : undefined;

  return (
    <div className="sbe">
      <style>{editorCss}</style>

      {leftOpen ? (
        <aside className="sbe-panel-card sbe-left">
          <div style={{ borderBottom: "1px solid var(--line2)", padding: 10 }}>
            <div className="sbe-seg">
              <button
                className={leftTab === "camadas" ? "on" : ""}
                onClick={() => setLeftTab("camadas")}
                type="button"
              >
                <Icon name="layers" size={14} />
                Camadas
              </button>
              <button
                className={leftTab === "paginas" ? "on" : ""}
                onClick={() => setLeftTab("paginas")}
                type="button"
              >
                <Icon name="file-text" size={14} />
                Páginas
              </button>
              <button
                className={leftTab === "chat" ? "on" : ""}
                onClick={() => setLeftTab("chat")}
                type="button"
              >
                <Icon name="sparkles" size={14} />
                IA<span className="sbe-soon">BREVE</span>
              </button>
            </div>
          </div>

          {leftTab === "camadas" && (
            <LayersPanel
              elPath={elPath}
              getElements={getElements}
              onAdd={addBlock}
              onInsert={insertAt}
              onMove={moveTo}
              onSelect={select}
              onSelectElement={selectElement}
              onToggleHidden={toggleHidden}
              sections={layerSections}
              selectedId={selectedId}
            />
          )}

          {leftTab === "paginas" && (
            <div className="sbe-scroll">
              <ContentPanel
                confirm={setConfirm}
                currentPage={currentPage}
                currentPost={currentPost}
                edit={edit}
                goTo={goTo}
                onUploadImage={onUploadImage}
                setPath={setPath}
                site={site}
              />
            </div>
          )}

          {leftTab === "chat" && (
            <>
              <div className="sbe-empty">
                <div className="ico">
                  <Icon name="sparkles" size={20} />
                </div>
                <span className="tag">EM BREVE</span>
                <h4>Editar com a IA</h4>
                <p>
                  Em breve você poderá pedir mudanças no site conversando com a
                  Atlas IA. Por enquanto, edite pelo painel lateral.
                </p>
                <button
                  className="sbe-btn round"
                  onClick={() => setLeftTab("camadas")}
                  type="button"
                >
                  Ver camadas
                </button>
              </div>
              <div className="sbe-fake-input">
                Pergunte qualquer coisa…
                <span>
                  <Icon name="arrow-up" size={14} />
                </span>
              </div>
            </>
          )}
        </aside>
      ) : null}

      <div className="sbe-center">
        <div className="sbe-top">
          <button
            className="sbe-ibtn"
            onClick={() => setLeftOpen(o => !o)}
            title="Mostrar/ocultar painel"
            type="button"
          >
            <Icon name="panel-left" size={15} />
          </button>
          <div className="sbe-crumb">
            <Icon name="globe" size={14} />
            <span>{publish?.domain ?? site.name}</span>
            <Icon name="chevron-right" size={12} />
            <PagePicker
              current={pageLabel}
              groups={routeGroups}
              onPick={goTo}
              value={path}
            />
          </div>
          <div style={{ display: "flex", flexShrink: 0, gap: 2 }}>
            <button
              className="sbe-ibtn"
              disabled={history.past.length === 0}
              onClick={undo}
              title="Desfazer (Ctrl+Z)"
              type="button"
            >
              <Icon name="undo-2" size={15} />
            </button>
            <button
              className="sbe-ibtn"
              disabled={history.future.length === 0}
              onClick={redo}
              title="Refazer (Ctrl+Shift+Z)"
              type="button"
            >
              <Icon name="redo-2" size={15} />
            </button>
          </div>
          <div
            className="sbe-seg mini"
            title="Como arrastar no canvas (Shift inverte Item/Bloco)"
          >
            {(
              [
                ["item", "Item"],
                ["block", "Bloco"],
                ["free", "Livre"],
              ] as const
            ).map(([value, label]) => (
              <button
                className={dragMode === value ? "on" : ""}
                key={value}
                onClick={() => setDragMode(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className={site.theme.ads === "on" ? "sbe-lime" : "sbe-btn"}
            onClick={() => setAds(site.theme.ads !== "on")}
            title="Mostrar ou esconder os espaços de anúncio"
            type="button"
          >
            Anúncios {site.theme.ads === "on" ? "ligados" : "desligados"}
          </button>
          {wide ? (
            <span
              className={`sbe-pill ${pill.cls}`}
              title={saveState === "error" ? saveError : undefined}
            >
              <i />
              {pill.text}
            </span>
          ) : null}
          {publish ? (
            <button
              className="sbe-lime"
              onClick={() => setReview(true)}
              title="Revisar e publicar"
              type="button"
            >
              <Icon name="rocket" size={14} />
              {availW >= 420 ? "Revisar e publicar" : "Publicar"}
            </button>
          ) : null}
          {exitHref ? (
            <a
              className="sbe-ibtn"
              href={exitHref}
              style={{ marginLeft: 2 }}
              title="Sair do editor"
            >
              <Icon name="x" size={16} />
            </a>
          ) : null}
        </div>

        <div className="sbe-bar2">
          <div className="sbe-seg">
            {DEVICES.map(d => (
              <button
                className={device === d.id ? "on" : ""}
                key={d.id}
                onClick={() => setDevice(d.id)}
                title={d.label}
                type="button"
              >
                <Icon name={d.icon} size={14} />
              </button>
            ))}
          </div>
          <span className="sbe-muted">
            {devW}px · {Math.round(zoom * 100)}%
          </span>
          <span className="sbe-spacer" />
          {wide ? (
            <span className="sbe-muted">
              Clique para selecionar · Ctrl+clique abre links · Ctrl+Z desfaz
            </span>
          ) : null}
          {originalSite ? (
            <button
              className="sbe-link"
              onClick={restoreOriginal}
              type="button"
            >
              Restaurar original
            </button>
          ) : null}
        </div>

        {/* biome-ignore lint/a11y/noStaticElementInteractions: o canvas recebe clique, hover e arrasto dos itens */}
        <div
          className="sbe-canvas"
          onClickCapture={onCanvasClick}
          onDragStart={e => e.preventDefault()}
          onPointerDownCapture={e => {
            onLogoPointerDown(e);
            onMovePointerDown(e);
          }}
          onPointerLeave={clearHover}
          onPointerOver={onCanvasOver}
          onScroll={() => {
            paintHover();
            paintSelection();
          }}
          onSubmitCapture={e => e.preventDefault()}
          ref={canvasRef}
        >
          <div className="sbe-hoverbox" ref={hoverBoxRef}>
            <span />
          </div>
          <div className="sbe-selbox" ref={selBoxRef} />
          <div className="sbe-guide v" ref={guideVRef} />
          <div className="sbe-guide h" ref={guideHRef} />
          <div
            className="sbe-frame"
            style={{
              background: site.theme.bg,
              width: devW,
              zoom,
            }}
          >
            <SiteRenderer
              basePath={basePath}
              mode="edit"
              narrow={device !== "desktop"}
              path={path}
              site={site}
            />
          </div>
        </div>

        {confirm ? (
          <ConfirmDialog onClose={() => setConfirm(null)} request={confirm} />
        ) : null}

        {review && publish ? (
          <ReviewDialog
            changes={log}
            error={publishError}
            onClose={() => setReview(false)}
            onPick={id => {
              setReview(false);
              select(id);
            }}
            onPublish={pw => void doPublish(pw)}
            publish={{
              ...publish,
              // Salva antes de abrir a configuração: ela publica o que está gravado.
              onSetup: publish.onSetup
                ? () => {
                    void save().then(ok => {
                      if (!ok) {
                        setPublishError(
                          "Não foi possível salvar antes de publicar."
                        );
                        return;
                      }
                      setReview(false);
                      publish.onSetup?.();
                    });
                  }
                : undefined,
            }}
            publishing={publishing}
            subtitle={changesLabel}
          />
        ) : null}
      </div>

      <aside className="sbe-panel-card sbe-right">
        <Inspector
          crumbs={crumbs}
          elLabel={elPath ? elName : ""}
          elPath={elPath}
          focusHint={focusHint}
          onAction={blockAction}
          onAnchor={anchor =>
            selected &&
            edit(setBlockAnchor(site, selected.id, anchor), {
              id: selected.id,
              label: `Âncora · ${labelOf(selected.type)}`,
            })
          }
          onFx={(patch, what) =>
            selected &&
            edit(updateBlockFx(site, selected.id, elPath, patch), {
              id: selected.id,
              key: `${selected.id}-fx${elPath}-${Object.keys(patch).join()}`,
              label: `${what} · ${labelOf(selected.type)}`,
            })
          }
          onMenu={menu =>
            edit(setMenu(site, menu), {
              key: "menu-edit",
              label: "Menu do site",
            })
          }
          onProp={(key, value) =>
            selected &&
            edit(updateBlockProps(site, selected.id, { [key]: value }), {
              id: selected.id,
              key: `${selected.id}-${key}`,
              label: `Editou · ${labelOf(selected.type)}`,
            })
          }
          onResolveChannel={onResolveChannel}
          onSelect={select}
          onSiteName={name =>
            edit(
              { ...site, name: name || site.name },
              { key: "site-name", label: "Nome do site" }
            )
          }
          onStyle={(patch, what) =>
            selected &&
            edit(
              elPath
                ? updateElementStyle(site, selected.id, elPath, patch)
                : updateBlockStyle(site, selected.id, patch),
              {
                id: selected.id,
                key: `${selected.id}-s${elPath}-${Object.keys(patch).join()}`,
                label: `${what} · ${labelOf(selected.type)}`,
              }
            )
          }
          onTheme={(patch, what) => {
            if (patch.ads !== undefined) {
              setAds(patch.ads === "on");
              return;
            }
            edit(setTheme(site, patch), {
              key: `theme-${Object.keys(patch).join()}`,
              kind: "Tema",
              label: `Tema · ${what}`,
            });
          }}
          onUploadFont={onUploadFont}
          onUploadImage={onUploadImage}
          selected={selected}
          site={site}
        />
      </aside>

      {toast ? (
        <div className="sbe-toast">
          <Icon name="circle-check" size={15} />
          {toast}
        </div>
      ) : null}
    </div>
  );
}
