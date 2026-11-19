"use client";

import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AdKey } from "../blocks/ads.js";
import { postPath } from "../blocks/helpers.js";
import { getBlockDefinition } from "../blocks/registry.js";
import type { Block, Site } from "../model/index.js";
import {
  FRAME_ZOOM_MAX,
  type Frame,
  formatFrame,
  frameDecls,
  isDefaultFrame,
  parseFrame,
} from "../model/style.js";
import { customFonts } from "../renderer/fonts.js";
import { resolveRoute } from "../renderer/routes.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { themeVars } from "../renderer/styles.js";
import { AiPanel } from "./AiPanel.js";
import { ConfirmDialog, type ConfirmRequest } from "./ConfirmDialog.js";
import { ContentPanel } from "./ContentPanel.js";
import { elementTree } from "./dom-tree.js";
import { ElementsPanel } from "./ElementsPanel.js";
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
import { inlineTarget } from "./inline-text.js";
import { type LayerSection, LayersPanel } from "./LayersPanel.js";
import { type LayerOp, reorderLayers } from "./layer-order.js";
import { type LiveColors, readLiveColors } from "./live-colors.js";
import { PostModal } from "./PostModal.js";
import {
  type LiveText,
  QuickBar,
  type QuickKind,
  type QuickMedia,
} from "./QuickBar.js";
import { applyMedia, mediaMode, mediaTarget } from "./quick-target.js";
import { type PublishConfig, ReviewDialog } from "./ReviewDialog.js";
import {
  applyReplica,
  blockPath,
  describeReplica,
  diffBlock,
  replicaTargets,
} from "./replicate.js";
import {
  addPostToPage,
  duplicatePost,
  renameCategory,
  setMenu,
  setTheme,
  updatePost,
  withAdBlocks,
} from "./site-ops.js";
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
import type { AiConfig, ChangeEntry, EditMeta, SaveResult } from "./types.js";
import { VideoPopup } from "./VideoPopup.js";

export type { SaveResult } from "./types.js";

export interface SiteEditorProps {
  /** Atlas IA (aba "IA"). Sem isso a aba continua "em breve". */
  ai?: AiConfig;
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
  /** Faixa fixa no topo da área central (ex.: aviso de modo Dev ao editar um template de demonstração). */
  banner?: ReactNode;
}

type Device = "desktop" | "mobile" | "tablet";

const PANELS_KEY = "sbe:panels";
const PANEL_MIN = 200;
const PANEL_MAX = 560;
type LeftTab = "camadas" | "chat" | "elementos" | "paginas";

/** Indicador "o endereço já abre?" ao lado do salvamento. */
const LIVE_PILL = {
  checking: {
    cls: "idle",
    hint: "verificando se o site já abre",
    text: "Verificando…",
  },
  live: { cls: "live", hint: "o site está no ar", text: "No ar" },
  no_dns: {
    cls: "wait",
    hint: "o DNS ainda está propagando; pode levar de minutos a algumas horas",
    text: "Aguardando DNS",
  },
  no_site: {
    cls: "wait",
    hint: "o DNS já aponta para o servidor; o HTTPS está sendo ativado",
    text: "Ativando HTTPS",
  },
} as const;

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
const itemName = (el: HTMLElement) =>
  el.classList.contains("sb-post-media")
    ? "mídia"
    : (ITEM_NAMES[el.tagName] ?? "área");

/** Imagem, vídeo ou player dentro da moldura da mídia de um post. */
const MEDIA_IN_FRAME = "img,video,iframe";

/** Elemento "clicável" sob o ponteiro: links e botões valem como um item só. */
function pickElement(target: HTMLElement): HTMLElement | null {
  const block = target.closest<HTMLElement>("[data-block-id]");
  if (!block) return null;
  // A mídia do post e a moldura dela são um item só: mover, redimensionar e dar borda ou sombra valem para a
  // moldura inteira. Se valessem para o vídeo de dentro, sobraria uma "caixa" atrás dele (a moldura corta o que sai).
  const frame = target.closest<HTMLElement>(".sb-post-media");
  if (frame && block.contains(frame)) return frame;
  // Imagem dentro de link continua sendo a imagem (para poder redimensionar).
  if (target instanceof HTMLImageElement) return target;
  const wrap = target.closest<HTMLElement>("a,button,.sb-header-search");
  return wrap && block.contains(wrap) ? wrap : target;
}

/**
 * Vídeo incorporado sob o ponteiro. No editor os iframes não recebem o mouse (senão o clique tocaria o
 * vídeo em vez de selecionar), então o clique cai no elemento de fora e o vídeo é achado pela posição.
 */
function frameAt(root: HTMLElement, x: number, y: number): HTMLElement | null {
  for (const frame of root.querySelectorAll<HTMLElement>("iframe")) {
    const r = frame.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
      return frame;
  }
  return null;
}

/**
 * Imagem sob o ponteiro, mesmo quando ela não recebe o mouse (anúncios têm `pointer-events:none`) ou
 * está coberta por um véu: procura pela posição, preferindo a menor (a mais específica).
 */
function imageAt(
  root: HTMLElement,
  x: number,
  y: number
): HTMLImageElement | null {
  let best: HTMLImageElement | null = null;
  let bestArea = Number.POSITIVE_INFINITY;
  for (const img of root.querySelectorAll("img")) {
    const r = img.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    if (getComputedStyle(img).visibility === "hidden") continue;
    const area = r.width * r.height;
    if (area > 0 && area < bestArea) {
      best = img;
      bestArea = area;
    }
  }
  return best;
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

/** Elemento que só tem texto (um nó de texto e nada mais): o único tipo que dá para editar direto no canvas. */
function textLeaf(target: HTMLElement, block: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = target;
  for (let i = 0; el && el !== block && i < 3; i++, el = el.parentElement) {
    if (
      el.childNodes.length === 1 &&
      el.firstChild?.nodeType === Node.TEXT_NODE &&
      (el.textContent ?? "").trim()
    )
      return el;
  }
  return null;
}

const squash = (v: string) => v.replace(/[\s\u00a0]+/g, " ").trim();

/** Edição de texto em andamento no canvas. */
interface InlineEdit {
  el: HTMLElement;
  finish: (commit: boolean) => void;
}

/**
 * O que liga o item clicado aos campos do bloco que o guardam: o `src` da imagem, o ID do vídeo
 * incorporado ou o texto do item — e, num link, também o endereço (sem o `basePath` do editor), para
 * achar o campo do link mesmo quando o texto é só para leitor de tela (o play do vídeo, ícones).
 */
export function hintOf(
  el: Element | null | undefined,
  basePath: string,
  point?: { x: number; y: number }
): Omit<FocusHint, "n"> {
  if (!el) return { value: "" };
  const levels = linkLevels(el, basePath);
  const under = mediaUnder(el, point);
  const repeat = isRepeated(el) || undefined;
  // O bloco diz de qual campo é o elemento (logo em SVG, imagem repetida): vale mais que casar pelo texto.
  const field =
    el.closest("[data-sb-field]")?.getAttribute("data-sb-field") || undefined;
  // Num item repetido, o primeiro link dele aponta para o post/categoria que ele mostra.
  const itemHref = repeat
    ? stripBase(
        el
          .closest("[data-repeat-list] > *")
          ?.querySelector("a[href]")
          ?.getAttribute("href") ?? "",
        basePath
      ) || undefined
    : undefined;
  // Espaço de anúncio: a mídia pode vir dos anúncios do site, então não dá para achar pelo `src`.
  const adEl = el.closest(".sb-ad");
  if (adEl)
    return {
      ad: true,
      adKind:
        (adEl.getAttribute("data-ad-key") as AdKey | null) ??
        (adEl.classList.contains("sb-ad-banner") ? "banner" : "side"),
      value: "",
    };
  if (el instanceof HTMLImageElement)
    return {
      field,
      itemHref,
      levels,
      repeat,
      under,
      value: el.getAttribute("src") ?? "",
    };
  if (el instanceof HTMLVideoElement)
    return {
      field,
      itemHref,
      levels,
      repeat,
      under,
      value: el.getAttribute("src") ?? el.getAttribute("poster") ?? "",
    };
  if (el instanceof HTMLIFrameElement) {
    const src = el.getAttribute("src") ?? "";
    return {
      field,
      itemHref,
      levels,
      repeat,
      under,
      value: /\/(?:embed|video)\/([^/?#]+)/.exec(src)?.[1] ?? src,
    };
  }
  const href = stripBase(el.closest("a")?.getAttribute("href") ?? "", basePath);
  const parent = el.parentElement;
  return {
    field,
    href: href || undefined,
    itemHref,
    levels,
    // Só para trecho em destaque dentro de um título; um link não casa pelo texto do pai (a coluna do menu inteira
    // casaria com o campo "Título da coluna de menu" e escondia o campo de endereço do link).
    parentText:
      parent && !parent.classList.contains("sb-block") && el.tagName !== "A"
        ? (parent.textContent ?? "")
        : undefined,
    repeat,
    under,
    value: el.textContent ?? "",
  };
}

/**
 * Imagens e fundos (`style="…url()"`) empilhados no ponto clicado, dentro do mesmo bloco, de cima para baixo.
 * Uma capa por baixo de um véu, de um texto ou de uma imagem de "passar o mouse" não recebe o clique, e uma
 * seção com imagem de fundo é só um `div`: o painel acha o campo da imagem por esta lista.
 */
function mediaUnder(
  el: Element,
  point?: { x: number; y: number }
): string[] | undefined {
  const block = el.closest(".sb-block");
  if (!block) return undefined;
  const rect = el.getBoundingClientRect();
  const x = point?.x ?? rect.x + rect.width / 2;
  const y = point?.y ?? rect.y + rect.height / 2;
  const out: string[] = [];
  const add = (u: string | null | undefined) => {
    if (u && !out.includes(u)) out.push(u);
  };
  // Pela posição (não por `elementsFromPoint`): camadas decorativas têm `pointer-events:none` e ficariam de fora.
  const hits = Array.from(block.querySelectorAll("*")).filter(n => {
    if (n.closest(".sb-block") !== block || n instanceof SVGElement)
      return false;
    const r = n.getBoundingClientRect();
    return (
      r.width > 0 &&
      r.height > 0 &&
      x >= r.left &&
      x <= r.right &&
      y >= r.top &&
      y <= r.bottom
    );
  });
  for (const n of hits.reverse()) {
    if (n instanceof HTMLImageElement) add(n.getAttribute("src"));
    if (n instanceof HTMLVideoElement) {
      add(n.getAttribute("src"));
      add(n.getAttribute("poster"));
    }
    const bg = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(
      n.getAttribute("style") ?? ""
    );
    add(bg?.[1]);
  }
  const own = block.getAttribute("style") ?? "";
  add(/url\(\s*["']?([^"')]+)["']?\s*\)/.exec(own)?.[1]);
  return out.length ? out : undefined;
}

/**
 * Endereços dos links de cada contêiner acima do item (do mais próximo ao bloco), sem repetir: serve
 * para achar o post/categoria que um card mostra mesmo quando o clique não caiu num link.
 */
function linkLevels(el: Element, basePath: string): string[][] {
  const out: string[][] = [];
  // O link em que o clique caiu vale primeiro (um card tem o do post e o da categoria).
  const own = stripBase(el.closest("a")?.getAttribute("href") ?? "", basePath);
  if (own && !own.startsWith("#")) out.push([own]);
  for (
    let node = el.parentElement;
    node && !node.classList.contains("sb-block") && out.length < 9;
    node = node.parentElement
  ) {
    const hrefs = new Set<string>();
    for (const a of node.querySelectorAll("a[href]")) {
      const h = stripBase(a.getAttribute("href") ?? "", basePath);
      if (h && !h.startsWith("#")) hrefs.add(h);
    }
    if (hrefs.size) out.push([...hrefs]);
  }
  return out;
}

/** Endereço do link sem o `basePath` do editor (o mesmo formato salvo no site). */
const stripBase = (raw: string, basePath: string) =>
  basePath && raw.startsWith(`${basePath}/`) ? raw.slice(basePath.length) : raw;

/**
 * O item clicado está dentro de um item de lista cuja quantidade vem do campo `limit` do bloco
 * (linhas de um feed, cards de posts): os blocos marcam esse contêiner com `data-repeat-list`.
 */
const isRepeated = (el: Element) => !!el.closest("[data-repeat-list] > *");

export function SiteEditor({
  ai,
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
  banner,
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
  // A IA edita o site por conta própria: enquanto trabalha, o usuário não edita junto (as edições se perderiam).
  const [aiBusy, setAiBusy] = useState(false);
  const [aiOpened, setAiOpened] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [newPost, setNewPost] = useState(false);
  // Largura dos painéis (arrastando a borda). Sem valor, vale a largura padrão do CSS.
  const [panelW, setPanelW] = useState<{ left?: number; right?: number }>({});
  const panelWRef = useRef(panelW);
  panelWRef.current = panelW;
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
  /** Vídeo de um botão com popup aberto por Ctrl/Cmd + clique no canvas. */
  const [video, setVideo] = useState<{ label: string; src: string } | null>(
    null
  );
  const [, setDomTick] = useState(0);
  const [elPath, setElPath] = useState("");
  const [elName, setElName] = useState("");
  /** Enquadrando uma imagem (dois cliques): arrastar move a foto, a roda do mouse dá zoom. */
  const [framing, setFraming] = useState<{
    blockId: string;
    path: string;
  } | null>(null);
  const frameLive = useRef<Frame>({ x: 0, y: 0, z: 1 });
  const selBoxRef = useRef<HTMLDivElement | null>(null);
  const mediaBoxRef = useRef<HTMLDivElement | null>(null);
  const quickRef = useRef<HTMLDivElement | null>(null);
  // Onde foi o último clique no canvas: a lista "Neste ponto" mostra tudo o que está empilhado ali.
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  // Arrasto de uma forma em andamento e de onde ele partiu.
  const shapeDrag = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const hoverBoxRef = useRef<HTMLDivElement | null>(null);
  const guideVRef = useRef<HTMLDivElement | null>(null);
  const guideHRef = useRef<HTMLDivElement | null>(null);
  const justDragged = useRef(false);
  // Ferramentas como no Figma: seta (V) seleciona e edita; mãozinha (H, ou Espaço segurado) só movimenta a tela.
  const [tool, setTool] = useState<"hand" | "select">("select");
  const [spaceHeld, setSpaceHeld] = useState(false);
  const handActive = tool === "hand" || spaceHeld;
  const inlineEdit = useRef<InlineEdit | null>(null);
  // Troca a chave do site no canvas para o React refazer o DOM quando a edição de texto o bagunçou.
  const [frameKey, setFrameKey] = useState(0);
  /** Como arrastar no canvas: trocar de lugar (item ou bloco) ou deslocar livremente. */
  // Modo de arrastar fixo em "free" (movimento livre). O seletor Item | Bloco | Livre da barra está comentado mais
  // abaixo; para trazê-lo de volta, troque esta linha por `const [dragMode, setDragMode] = useState(...)` e descomente.
  const [dragMode] = useState<"block" | "free" | "item">("free");
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

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PANELS_KEY) ?? "{}");
      const ok = (n: unknown) =>
        typeof n === "number" && n >= PANEL_MIN && n <= PANEL_MAX
          ? n
          : undefined;
      setPanelW({ left: ok(saved.left), right: ok(saved.right) });
    } catch {}
  }, []);

  /** Arrasta a borda de um painel lateral; duplo clique volta ao tamanho padrão. */
  const startResize = (
    side: "left" | "right",
    e: PointerEvent<HTMLElement>
  ) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const panel = e.currentTarget.parentElement?.querySelector<HTMLElement>(
      side === "left" ? ".sbe-left" : ".sbe-right"
    );
    if (!panel) return;
    const x = e.clientX;
    const start = panel.getBoundingClientRect().width;
    let last: number | undefined;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = (ev: globalThis.PointerEvent) => {
      const dx = side === "left" ? ev.clientX - x : x - ev.clientX;
      const w = Math.round(
        Math.min(PANEL_MAX, Math.max(PANEL_MIN, start + dx))
      );
      last = w;
      setPanelW(p => ({ ...p, [side]: w }));
    };
    const up = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      try {
        if (last !== undefined)
          localStorage.setItem(
            PANELS_KEY,
            JSON.stringify({ ...panelWRef.current, [side]: last })
          );
      } catch {}
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  const resetPanel = (side: "left" | "right") => {
    setPanelW(p => {
      const next = { ...p, [side]: undefined };
      try {
        localStorage.setItem(PANELS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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
      // Um turno da IA (`ai:<id>`) é um passo só de desfazer, por mais que demore entre uma ferramenta e outra.
      const merge =
        meta.key !== undefined &&
        lastEdit.current.key === meta.key &&
        (meta.key.startsWith("ai:") || now - lastEdit.current.at < 1000);
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
        const extra = result.mesclar;
        if (extra && (extra.posts.length > 0 || extra.categories.length > 0)) {
          const junta = (s: Site): Site => {
            const ids = new Set(extra.posts.map(p => p.id));
            const cats = new Set(s.categories.map(c => c.id));
            return {
              ...s,
              categories: [
                ...s.categories,
                ...extra.categories.filter(c => !cats.has(c.id)),
              ],
              posts: [...extra.posts, ...s.posts.filter(p => !ids.has(p.id))],
            };
          };
          // O banco já tem `current` + os posts novos; se o usuário editou no meio, a edição continua pendente.
          savedRef.current = junta(current);
          setHistory(h => ({
            ...h,
            present:
              h.present === current ? savedRef.current : junta(h.present),
          }));
          flash(
            extra.posts.length === 1
              ? "Chegou 1 post da Produção de Conteúdo."
              : `Chegaram ${extra.posts.length} posts da Produção de Conteúdo.`
          );
          setSaveState("saved");
          setSaveError("");
          return true;
        }
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
  }, [flash]);

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
  const paintSelectionBox = () => {
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
    box.style.borderRadius = radiusOf(target);
  };

  /** Alças de redimensionar a mídia do post selecionado (quinas = reduz inteira; alça de baixo = corta a altura). */
  const paintMedia = () => {
    const root = canvasRef.current;
    const box = mediaBoxRef.current;
    if (!(root && box)) return;
    const block =
      selectedId && !handActive && !inlineEdit.current
        ? root.querySelector<HTMLElement>(`[data-block-id="${selectedId}"]`)
        : null;
    const isShape = Boolean(block?.dataset.blockType?.startsWith("shape"));
    const media =
      block?.dataset.blockType === "postItem"
        ? block.querySelector<HTMLElement>(".sb-post-media")
        : isShape
          ? (block?.querySelector<HTMLElement>(".sb-fig") ?? null)
          : null;
    // Qualquer outra imagem ou vídeo do site: as alças aparecem quando ela é o elemento selecionado.
    const picked = block && elPath ? elementAt(block, elPath) : null;
    const generic =
      !media &&
      block?.dataset.blockType !== "postItem" &&
      !isShape &&
      (picked instanceof HTMLImageElement ||
        picked instanceof HTMLVideoElement ||
        picked instanceof HTMLIFrameElement)
        ? picked
        : null;
    const target = media ?? generic;
    if (!target) {
      box.style.display = "none";
      return;
    }
    box.dataset.kind = isShape ? "shape" : generic ? "el" : "media";
    box.dataset.crop = generic instanceof HTMLIFrameElement ? "no" : "yes";
    box.dataset.align = isShape
      ? String(
          findBlock(siteRef.current, selectedId ?? "")?.props.align ?? "left"
        )
      : generic
        ? anchorOf(generic)
        : "center";
    const r = target.getBoundingClientRect();
    box.style.display = "block";
    box.style.left = `${r.left}px`;
    box.style.top = `${r.top}px`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;
    box.style.borderRadius = radiusOf(target);
  };

  /** De que lado o elemento está preso no espaço dele: define de onde ele cresce ao arrastar uma alça. */
  const anchorOf = (el: HTMLElement): "center" | "left" | "right" => {
    const parent = el.parentElement;
    if (!parent) return "center";
    const r = el.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    const left = r.left - p.left;
    const right = p.right - r.right;
    if (Math.abs(left - right) <= 6) return "center";
    return left < right ? "left" : "right";
  };

  /** Põe a barra de edição junto do elemento selecionado: em cima, ou embaixo quando não cabe. */
  const paintQuick = () => {
    const root = canvasRef.current;
    const bar = quickRef.current;
    if (!(root && bar && selectedId)) return;
    const block = root.querySelector<HTMLElement>(
      `[data-block-id="${selectedId}"]`
    );
    const target = block && elPath ? elementAt(block, elPath) : block;
    if (!target) return;
    const c = root.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const bw = bar.offsetWidth;
    const bh = bar.offsetHeight;
    let top = r.top - bh - 8;
    if (top < c.top + 4) top = Math.min(r.bottom + 8, c.bottom - bh - 4);
    top = Math.max(c.top + 4, top);
    const left = Math.max(c.left + 4, Math.min(r.left, c.right - bw - 4));
    bar.style.left = `${left}px`;
    bar.style.top = `${top}px`;
    // As janelas abrem para cima quando há espaço, para não cobrir o que está sendo editado.
    bar.dataset.pop = top - c.top >= 300 && top < r.top ? "up" : "down";
  };

  /** Tira o tamanho provisório do arrasto das formas: depois de gravar, quem manda é o estilo do elemento. */
  const clearLiveSize = () => {
    if (shapeDrag.current) return;
    for (const el of Array.from(
      canvasRef.current?.querySelectorAll<HTMLElement>("[data-live-size]") ?? []
    )) {
      el.style.removeProperty("width");
      el.style.removeProperty("height");
      el.style.removeProperty("object-fit");
      el.removeAttribute("data-live-size");
    }
  };

  const paintSelection = () => {
    clearLiveSize();
    paintSelectionBox();
    paintMedia();
    paintQuick();
  };
  useEffect(paintSelection);

  /**
   * Arrastar uma alça da mídia do post. Quina: muda a largura (em % do espaço do post) e a mídia continua
   * inteira, só menor. Alça de baixo: muda a altura da moldura, e a mídia é cortada para caber (vídeo em
   * retrato perde menos). Alças dos lados: estreitam ou alargam a moldura mantendo a altura, e a mídia é
   * cortada dos lados. Mostra ao vivo e grava ao soltar.
   */
  /**
   * Arrastar uma alça de uma forma (linha, retângulo, quadrado, círculo): grava a largura e a altura em px no
   * estilo do elemento. Quadrado e círculo mantêm os lados iguais; a linha engrossa pela alça de baixo.
   */
  const startShapeResize = (
    blockId: string,
    mode: "corner" | "height" | "side",
    corner: string
  ) => {
    const node = blockEl(blockId);
    const el = node?.querySelector<HTMLElement>(".sb-fig");
    const block = findBlock(siteRef.current, blockId);
    const wrap = el?.parentElement;
    const start = pointerStart.current;
    if (!(node && el && wrap && block && start)) return;
    const cs = getComputedStyle(wrap);
    const maxW =
      wrap.clientWidth -
      Number.parseFloat(cs.paddingLeft) -
      Number.parseFloat(cs.paddingRight);
    const w0 = el.offsetWidth;
    const h0 = el.offsetHeight;
    const align = String(block.props.align ?? "left");
    const side = corner.includes("w") ? -1 : 1;
    // Centrada, a forma cresce dos dois lados (o dobro do arrasto); alinhada, só pelo lado de fora.
    const factor =
      align === "center"
        ? 2 * side
        : align === "left"
          ? side === 1
            ? 1
            : 0
          : side === -1
            ? -1
            : 0;
    const square = el.classList.contains("sb-fig-eq");
    let w = w0;
    let h = h0;
    let moved = false;
    shapeDrag.current = true;
    const move = (ev: globalThis.PointerEvent) => {
      moved = true;
      const dx = (ev.clientX - start.x) / zoom;
      const dy = (ev.clientY - start.y) / zoom;
      if (mode !== "height") w = Math.min(maxW, Math.max(8, w0 + factor * dx));
      if (mode !== "side") h = Math.min(1200, Math.max(1, h0 + dy));
      if (square) {
        const size =
          mode === "side" ? w : mode === "height" ? h : Math.max(w, h);
        w = Math.min(maxW, size);
        h = w;
      }
      el.dataset.liveSize = "1";
      el.style.setProperty("width", `${Math.round(w)}px`, "important");
      el.style.setProperty("height", `${Math.round(h)}px`, "important");
      paintMedia();
      paintSelectionBox();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      shapeDrag.current = false;
      if (!moved) return;
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 0);
      edit(
        updateElementStyle(siteRef.current, blockId, pathWithin(el, node), {
          height: Math.round(h),
          width: Math.round(w),
        }),
        {
          id: blockId,
          key: `shape:${blockId}`,
          label: `Redimensionou · ${labelOf(block.type)}`,
        }
      );
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  /**
   * Arrastar as alças de qualquer imagem ou vídeo: a quina muda o tamanho todo (sem cortar); as alças dos lados e
   * a de baixo mudam a moldura e cortam o que passar. Grava largura e altura em px no estilo do elemento. Vídeo
   * de link (player) só muda de tamanho, porque tem proporção fixa.
   */
  const startElementResize = (
    blockId: string,
    mode: "corner" | "height" | "side",
    corner: string
  ) => {
    const node = blockEl(blockId);
    const el = node && elPath ? elementAt(node, elPath) : null;
    const block = findBlock(siteRef.current, blockId);
    const start = pointerStart.current;
    const parent = el?.parentElement;
    if (!(node && el && block && start && parent)) return;
    const path = pathWithin(el, node);
    const cs = getComputedStyle(parent);
    const maxW =
      parent.clientWidth -
      Number.parseFloat(cs.paddingLeft) -
      Number.parseFloat(cs.paddingRight);
    const iframe = el instanceof HTMLIFrameElement;
    const w0 = el.offsetWidth;
    const h0 = el.offsetHeight;
    const hadHeight = block.elStyles?.[path]?.height !== undefined;
    const side = corner.includes("w") ? -1 : 1;
    const anchor = anchorOf(el);
    const factor =
      anchor === "center"
        ? 2 * side
        : anchor === "left"
          ? side === 1
            ? 1
            : 0
          : side === -1
            ? -1
            : 0;
    // Corte só em imagem e vídeo de arquivo; o player de link e a quina só escalam.
    const crop = !iframe && (mode === "side" || mode === "height" || hadHeight);
    let w = w0;
    let h = h0;
    let moved = false;
    shapeDrag.current = true;
    const move = (ev: globalThis.PointerEvent) => {
      moved = true;
      const dx = (ev.clientX - start.x) / zoom;
      const dy = (ev.clientY - start.y) / zoom;
      if (mode === "height") {
        if (iframe) return;
        h = Math.min(3000, Math.max(24, h0 + dy));
      } else {
        w = Math.min(maxW, Math.max(24, w0 + factor * dx));
        if (mode === "corner" || iframe) h = h0 * (w / w0);
      }
      el.dataset.liveSize = "1";
      el.style.setProperty("width", `${Math.round(w)}px`, "important");
      if (crop || mode === "corner" || iframe) {
        el.style.setProperty("height", `${Math.round(h)}px`, "important");
      }
      if (crop) el.style.setProperty("object-fit", "cover", "important");
      paintMedia();
      paintSelectionBox();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      shapeDrag.current = false;
      if (!moved) return;
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 0);
      edit(
        updateElementStyle(
          siteRef.current,
          blockId,
          path,
          crop
            ? {
                height: Math.round(h),
                objectFit: "cover",
                width: Math.round(w),
              }
            : { height: undefined, width: Math.round(w) }
        ),
        {
          id: blockId,
          key: `el-size:${blockId}:${path}`,
          label: `${crop ? "Cortou" : "Redimensionou"} · ${labelOf(block.type)}`,
        }
      );
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const startMediaResize = (
    e: PointerEvent<HTMLElement>,
    mode: "corner" | "height" | "side",
    corner = "se"
  ) => {
    if (e.button !== 0 || !selectedId) return;
    e.preventDefault();
    e.stopPropagation();
    const blockId = selectedId;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    if (findBlock(siteRef.current, blockId)?.type.startsWith("shape")) {
      startShapeResize(blockId, mode, corner);
      return;
    }
    if (findBlock(siteRef.current, blockId)?.type !== "postItem") {
      startElementResize(blockId, mode, corner);
      return;
    }
    const media = canvasRef.current?.querySelector<HTMLElement>(
      `[data-block-id="${blockId}"] .sb-post-media`
    );
    const parent = media?.parentElement;
    const block = findBlock(siteRef.current, blockId);
    if (!(media && parent && block)) return;
    const cs = getComputedStyle(parent);
    const maxW =
      parent.clientWidth -
      Number.parseFloat(cs.paddingLeft) -
      Number.parseFloat(cs.paddingRight);
    const w0 = media.offsetWidth;
    const h0 = media.offsetHeight;
    const startX = e.clientX;
    const startY = e.clientY;
    const side = corner.includes("w") ? -1 : 1;
    let width = Number(block.props.mediaWidth) || 100;
    let ratio = Number(block.props.mediaRatio) || 0;
    let moved = false;
    const move = (ev: globalThis.PointerEvent) => {
      moved = true;
      if (mode === "side") {
        // Mesma conta da quina (a mídia é centrada), mas a altura fica como estava: a proporção muda e corta os lados.
        const w = Math.min(
          maxW,
          Math.max(maxW * 0.1, w0 + (side * 2 * (ev.clientX - startX)) / zoom)
        );
        width = Math.round((w / maxW) * 1000) / 10;
        ratio = Math.round(Math.min(4, Math.max(0.25, w / h0)) * 100) / 100;
        media.style.width = width >= 100 ? "" : `${width}%`;
        media.classList.add("is-cropped");
        media.style.aspectRatio = String(ratio);
      } else if (mode === "corner") {
        // A mídia fica centrada: a borda acompanha o ponteiro, então a largura muda o dobro do arrasto.
        const w = Math.min(
          maxW,
          Math.max(maxW * 0.1, w0 + (side * 2 * (ev.clientX - startX)) / zoom)
        );
        width = Math.round((w / maxW) * 1000) / 10;
        media.style.width = width >= 100 ? "" : `${width}%`;
      } else {
        const h = Math.max(40, h0 + (ev.clientY - startY) / zoom);
        ratio =
          Math.round(Math.min(4, Math.max(0.25, media.offsetWidth / h)) * 100) /
          100;
        media.classList.add("is-cropped");
        media.style.aspectRatio = String(ratio);
      }
      paintMedia();
      paintSelectionBox();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (!moved) return;
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 0);
      edit(
        updateBlockProps(
          siteRef.current,
          blockId,
          mode === "corner"
            ? { mediaWidth: width }
            : mode === "side"
              ? { mediaRatio: ratio, mediaWidth: width }
              : { mediaRatio: ratio }
        ),
        {
          id: blockId,
          key: `media:${blockId}:${mode}`,
          label: `${mode === "corner" ? "Redimensionou" : "Cortou"} · ${labelOf(block.type)}`,
        }
      );
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // As camadas leem o DOM do canvas; repinta depois que o site renderizou.
  useEffect(() => setDomTick(t => t + 1), [site, path, device]);

  // Se o bloco selecionado foi apagado (ex.: desfazer), limpa a seleção.
  useEffect(() => {
    if (selectedId && !findBlock(site, selectedId)) setSelectedId(null);
  }, [selectedId, site]);

  const selected = selectedId ? findBlock(site, selectedId) : undefined;
  const labelOf = (type: string) => getBlockDefinition(type)?.label ?? type;

  // Bloco de um post: guarda como estava ao ser selecionado. Se mudou algo de aparência/opção, o
  // painel mostra "Replicar nos outros posts" e, ao sair do bloco (outro bloco, outra página ou
  // "Revisar e publicar"), pergunta se aplica o mesmo no bloco equivalente dos outros posts.
  interface ReplicaWatch {
    before: Block;
    id: string;
    path: number[];
    postId: string;
  }
  const replicaWatch = useRef<ReplicaWatch | null>(null);
  const replicaFor = (w: ReplicaWatch | null, current: Site) => {
    if (!w || !current.posts.some(p => p.id === w.postId)) return undefined;
    const after = findBlock(current, w.id);
    const replica = after ? diffBlock(w.before, after) : undefined;
    if (!after || !replica) return undefined;
    const targets = replicaTargets(current, w.postId, w.before.type, w.path);
    return targets > 0 ? { after, replica, targets, watch: w } : undefined;
  };
  const askReplica = (pending: NonNullable<ReturnType<typeof replicaFor>>) => {
    const { after, replica, targets, watch } = pending;
    // Perguntou uma vez: a partir daqui o "antes" é o estado atual (aceitando ou não).
    if (replicaWatch.current === watch)
      replicaWatch.current = { ...watch, before: structuredClone(after) };
    const label = labelOf(watch.before.type);
    const plural = targets === 1 ? "outro post" : "outros posts";
    setConfirm({
      confirmLabel: "Replicar",
      message: `Você alterou ${describeReplica(watch.before.type, replica)} no bloco “${label}” deste post. Aplicar o mesmo no bloco equivalente de ${targets} ${plural}? Textos, imagens e links de cada post não mudam.`,
      onConfirm: () =>
        edit(
          applyReplica(
            siteRef.current,
            watch.postId,
            watch.before.type,
            watch.path,
            replica
          ),
          {
            kind: "Editado",
            label: `Replicou para ${targets} ${targets === 1 ? "post" : "posts"} · ${label}`,
          }
        ),
      title: "Replicar para os outros posts?",
    });
  };
  const pendingReplica =
    replicaWatch.current?.id === selectedId
      ? replicaFor(replicaWatch.current, site)
      : undefined;
  useEffect(() => {
    const current = siteRef.current;
    const pending = replicaFor(replicaWatch.current, current);
    replicaWatch.current = null;
    if (pending) askReplica(pending);
    if (!selectedId) return;
    const where = ancestorsOf(current, selectedId);
    if (!where?.root.startsWith("post:")) return;
    const postId = where.root.slice(5);
    const post = current.posts.find(p => p.id === postId);
    const block = findBlock(current, selectedId);
    const at = post ? blockPath(post.blocks, selectedId) : undefined;
    if (block && at) {
      replicaWatch.current = {
        before: structuredClone(block),
        id: selectedId,
        path: at,
        postId,
      };
    }
  }, [selectedId, path]);

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
  /** Cores que o item mostra no canvas (a do modelo inclusive): o painel mostra de cara e deixa trocar. */
  const readColors = useCallback(
    (blockId: string, elP: string): LiveColors | undefined => {
      const canvas = canvasRef.current;
      const block = canvas?.querySelector<HTMLElement>(
        `[data-block-id="${blockId}"]`
      );
      const el = block && elP ? elementAt(block, elP) : block;
      return canvas && el ? readLiveColors(el, canvas) : undefined;
    },
    []
  );
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
    setFocusHint(h => ({ n: h.n + 1, ...hintOf(el, basePath) }));
  };

  /** Rola o canvas, com animação, até o bloco (ou elemento) clicado nas camadas. */
  const revealInCanvas = (id: string, path = "") => {
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const block = blockEl(id);
      const target = block && path ? elementAt(block, path) : block;
      if (!(canvas && target)) return;
      const c = canvas.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      // Centraliza o que cabe na tela; o que é maior que a tela fica com o topo à vista.
      const gap = Math.max(24, (c.height - r.height) / 2);
      const top = canvas.scrollTop + (r.top - c.top) - gap;
      canvas.scrollTo({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        top: Math.max(0, top),
      });
    });
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
    // O elemento entra depois do selecionado (ou no fim da página): leva o olhar até ele.
    setTimeout(() => revealInCanvas(res.id), 200);
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
      if (aiBusy) return;
      if (mod && k === "s") {
        e.preventDefault();
        void save();
        return;
      }
      if (isTyping(e.target)) return;
      const onControl =
        e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLAnchorElement;
      if (e.code === "Space" && !(mod || onControl)) {
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if (!(mod || e.altKey) && (k === "v" || k === "h")) {
        setTool(k === "h" ? "hand" : "select");
        clearHover();
      } else if (mod && k === "z") {
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
        setFraming(null);
        setSelectedId(null);
        setReview(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Soltar o Espaço (ou perder o foco da janela) devolve a ferramenta que estava ativa.
  useEffect(() => {
    const release = () => setSpaceHeld(false);
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") release();
    };
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", release);
    };
  }, []);

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
    if (handActive) {
      e.preventDefault();
      return;
    }
    // Clique dentro do texto que está sendo editado só move o cursor.
    if (inlineEdit.current?.el.contains(e.target as Node)) return;
    // Alças da mídia: o clique nelas não troca a seleção.
    if ((e.target as HTMLElement).closest(".sbe-mediabox")) return;
    lastPoint.current = { x: e.clientX, y: e.clientY };
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
        const popup = anchor.getAttribute("data-sb-video");
        if (popup) {
          setVideo({
            label: anchor.getAttribute("aria-label") || "Vídeo",
            src: popup,
          });
          return;
        }
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
    const el = block
      ? pickElement(frameAt(target, e.clientX, e.clientY) ?? target)
      : null;
    if (block && el) {
      const path = pathWithin(el, block);
      setElPath(path);
      const text = (el.textContent ?? "").trim().slice(0, 24);
      setElName(path ? `${itemName(el)}${text ? ` · ${text}` : ""}` : "");
    }
    setFocusHint(h => ({
      n: h.n + 1,
      // A moldura da mídia do post é o item; o campo da mídia se acha pela imagem ou vídeo que ela guarda.
      ...hintOf(
        el?.classList.contains("sb-post-media")
          ? (el.querySelector(MEDIA_IN_FRAME) ?? el)
          : el,
        basePath,
        { x: e.clientX, y: e.clientY }
      ),
    }));
    // Clicar num texto já deixa escrever ali, com o cursor onde o clique caiu.
    if (block && !(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) {
      startInlineEdit(e, block, { caret: true, notify: false });
    }
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

  const frameImg = () => {
    const node = framing ? blockEl(framing.blockId) : null;
    const el = node && framing ? elementAt(node, framing.path) : null;
    return el instanceof HTMLImageElement ? el : null;
  };

  /** Mostra o enquadramento ao vivo no DOM (sem gravar): a moldura passa a cortar o que sobra. */
  const paintFrame = (img: HTMLImageElement, f: Frame) => {
    for (const [k, v] of Object.entries(frameDecls(f)))
      img.style.setProperty(k, v, "important");
    if (img.parentElement)
      img.parentElement.style.setProperty(
        "overflow",
        f.z > 1 ? "hidden" : "",
        "important"
      );
    paintSelection();
  };

  const clearPaintedFrame = (img: HTMLImageElement) => {
    for (const k of Object.keys(frameDecls({ x: 0, y: 0, z: 1 })))
      img.style.removeProperty(k);
    img.parentElement?.style.removeProperty("overflow");
  };

  const commitFrame = (f: Frame) => {
    if (!framing) return;
    const block = findBlock(siteRef.current, framing.blockId);
    if (!block) return;
    frameLive.current = f;
    edit(
      updateElementStyle(siteRef.current, framing.blockId, framing.path, {
        frame: isDefaultFrame(f) ? undefined : formatFrame(f),
      }),
      {
        id: framing.blockId,
        key: `frame:${framing.blockId}:${framing.path}`,
        label: `Enquadrou · ${labelOf(block.type)}`,
      }
    );
  };

  const currentFrame = (): Frame => {
    const block = framing ? findBlock(siteRef.current, framing.blockId) : null;
    return parseFrame(
      framing ? block?.elStyles?.[framing.path]?.frame : undefined
    );
  };

  const zoomFrame = (delta: number) => {
    const f = currentFrame();
    const z = Math.min(FRAME_ZOOM_MAX, Math.max(1, f.z + delta));
    commitFrame({ ...f, z: Math.round(z * 100) / 100 });
  };

  /** Arrastar a foto dentro da moldura: acompanha o ponteiro e grava ao soltar. */
  const startFramePan = (e: PointerEvent<HTMLDivElement>) => {
    const img = frameImg();
    if (!img) return;
    e.preventDefault();
    const f0 = currentFrame();
    const w = img.offsetWidth || 1;
    const h = img.offsetHeight || 1;
    const nw = img.naturalWidth || w;
    const nh = img.naturalHeight || h;
    const fit = Math.max(w / nw, h / nh);
    // Quanto a foto anda (px) por unidade de x/y: parte do corte (`object-position`) + parte do zoom.
    const sensX = (w * (f0.z - 1) + f0.z * Math.max(0, nw * fit - w)) / 200;
    const sensY = (h * (f0.z - 1) + f0.z * Math.max(0, nh * fit - h)) / 200;
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    let cur = f0;
    const move = (ev: globalThis.PointerEvent) => {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      document.body.style.cursor = "grabbing";
      cur = {
        ...f0,
        x: sensX > 0.01 ? Math.max(-100, Math.min(100, f0.x + dx / sensX)) : 0,
        y: sensY > 0.01 ? Math.max(-100, Math.min(100, f0.y + dy / sensY)) : 0,
      };
      paintFrame(img, cur);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.style.cursor = "";
      if (!moved) return;
      clearPaintedFrame(img);
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 0);
      commitFrame(cur);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  /** Roda do mouse sobre a imagem enquadrada = zoom (precisa de listener não passivo). */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!(framing && canvas)) return;
    const onWheel = (ev: WheelEvent) => {
      const img = frameImg();
      if (
        !(
          img &&
          imageAt(img.parentElement ?? img, ev.clientX, ev.clientY) === img
        )
      )
        return;
      ev.preventDefault();
      zoomFrame(-ev.deltaY * 0.003);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  });

  /**
   * Duplo clique num texto: edita ali mesmo, no canvas. Enter ou clicar fora confirma; Esc cancela.
   * Só quando dá para saber qual campo do bloco guarda o texto (ver `inlineTextPatch`); senão avisa e deixa
   * a edição para o painel da direita, que já está aberto naquele campo.
   */
  const startInlineEdit = (
    e: MouseEvent<HTMLDivElement>,
    block: HTMLElement,
    opts: { caret: boolean; notify: boolean }
  ) => {
    const blockId = block.dataset.blockId;
    const el = textLeaf(e.target as HTMLElement, block);
    const found = blockId ? findBlock(siteRef.current, blockId) : undefined;
    const def = found ? getBlockDefinition(found.type) : undefined;
    if (!(blockId && el && found && def)) return;
    // Botões, campos de formulário e a busca têm o próprio comportamento com o teclado.
    if (el.closest("button,input,select,textarea,.sb-header-search")) return;
    const node = el.firstChild as Text;
    const original = node.data;
    const hint = {
      n: 0,
      // A moldura da mídia do post é o item; o campo da mídia se acha pela imagem ou vídeo que ela guarda.
      ...hintOf(
        el?.classList.contains("sb-post-media")
          ? (el.querySelector(MEDIA_IN_FRAME) ?? el)
          : el,
        basePath,
        { x: e.clientX, y: e.clientY }
      ),
    };
    const post = route.kind === "post" ? route.post : undefined;
    const target = (site: Site, props: Record<string, unknown>, text: string) =>
      inlineTarget({
        currentPost: post,
        defaults: def.defaults,
        fields: def.fields,
        hint,
        newText: text,
        oldText: original,
        props,
        site,
      });
    if (!target(siteRef.current, found.props, original)) {
      if (opts.notify) {
        e.preventDefault();
        flash(
          "Esse texto tem formatação ou aparece em mais de um lugar. Edite pelo painel da direita."
        );
      }
      return;
    }
    e.preventDefault();
    clearHover();
    el.contentEditable = "plaintext-only";
    if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
    el.setAttribute("data-sbe-editing", "");
    // Onde caiu o clique (no meio da frase, por exemplo) fica o cursor; sem ponto, o texto vem todo selecionado.
    const doc = el.ownerDocument;
    let caret: Range | null = null;
    if (opts.caret) {
      const at = doc.caretPositionFromPoint?.(e.clientX, e.clientY);
      if (at && el.contains(at.offsetNode)) {
        caret = doc.createRange();
        caret.setStart(at.offsetNode, at.offset);
      } else {
        const r = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
        if (r && el.contains(r.startContainer)) caret = r;
      }
      caret?.collapse(true);
    }
    el.focus();
    const range = caret ?? doc.createRange();
    if (!caret) range.selectNodeContents(el);
    const sel = doc.defaultView?.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    let done = false;
    const finish = (commit: boolean) => {
      if (done) return;
      done = true;
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("keydown", onKey);
      const typed = squash(el.textContent ?? "");
      el.removeAttribute("contenteditable");
      el.removeAttribute("data-sbe-editing");
      inlineEdit.current = null;
      // O React ainda guarda o nó de texto original: devolve o texto de antes para ele atualizar do jeito dele.
      // Se a digitação trocou o nó (apagou tudo, colou HTML), o jeito seguro é refazer o canvas.
      if (el.childNodes.length === 1 && el.firstChild === node) {
        node.data = original;
      } else {
        setFrameKey(k => k + 1);
      }
      if (!commit || !typed || typed === squash(original)) return;
      const now = siteRef.current;
      const current = findBlock(now, blockId);
      const where = current ? target(now, current.props, typed) : null;
      if (!(current && where)) return;
      const key = `inline:${blockId}:${squash(original)}`;
      if (where.kind === "block") {
        edit(updateBlockProps(now, blockId, where.patch), {
          id: blockId,
          key,
          kind: "Editado",
          label: `Texto · ${labelOf(current.type)}`,
        });
      } else if (where.kind === "post") {
        edit(updatePost(now, where.id, where.patch), {
          key,
          kind: "Editado",
          label: `${where.what} do post · ${typed}`,
        });
      } else if (where.kind === "category") {
        edit(renameCategory(now, where.id, where.name), {
          key,
          kind: "Editado",
          label: `Categoria · ${typed}`,
        });
      } else {
        edit(setMenu(now, where.menu), {
          key,
          kind: "Editado",
          label: "Menu do site",
        });
      }
    };
    const onBlur = () => finish(true);
    const onKey = (ev: globalThis.KeyboardEvent) => {
      if (ev.key !== "Enter" && ev.key !== "Escape") return;
      ev.preventDefault();
      ev.stopPropagation();
      finish(ev.key === "Enter");
      el.blur();
    };
    el.addEventListener("blur", onBlur);
    el.addEventListener("keydown", onKey);
    inlineEdit.current = { el, finish };
  };

  const onCanvasDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (handActive || inlineEdit.current?.el.contains(e.target as Node)) return;
    const target = e.target as HTMLElement;
    const block = target.closest<HTMLElement>("[data-block-id]");
    const el = block ? imageAt(block, e.clientX, e.clientY) : null;
    if (block && !el && !target.closest("img")) {
      startInlineEdit(e, block, { caret: false, notify: true });
      return;
    }
    if (!(block?.dataset.blockId && el)) return;
    const path = pathWithin(el, block);
    if (!path) return;
    e.preventDefault();
    select(block.dataset.blockId);
    setElPath(path);
    setElName("imagem");
    setFraming({ blockId: block.dataset.blockId, path });
  };

  /** Mãozinha: arrastar o canvas rola a tela na direção do arrasto. */
  const startPan = (e: PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    const left = canvas.scrollLeft;
    const top = canvas.scrollTop;
    canvas.classList.add("panning");
    const move = (ev: globalThis.PointerEvent) => {
      canvas.scrollLeft = left - (ev.clientX - x);
      canvas.scrollTop = top - (ev.clientY - y);
    };
    const up = () => {
      canvas.classList.remove("panning");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onMovePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // O movimento livre só existe em tela larga; no tablet e no celular o arrasto reordena (Item), como antes.
    if (dragMode === "free" && device === "desktop") startFreeMove(e);
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
  /** Cantos do elemento para os contornos do editor acompanharem (um círculo tem contorno redondo, sem canto quadrado). */
  const radiusOf = (el: HTMLElement) => {
    const r = getComputedStyle(el).borderTopLeftRadius;
    return r.endsWith("%") ? r : `${(Number.parseFloat(r) || 0) * zoom}px`;
  };

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
    box.style.borderRadius = radiusOf(el);
    const label = box.firstElementChild as HTMLElement | null;
    const type = el.closest<HTMLElement>("[data-block-id]")?.dataset.blockType;
    if (label) label.textContent = `${type ?? ""} › ${itemName(el)}`;
  };
  const onCanvasOver = (e: MouseEvent<HTMLDivElement>) => {
    const el =
      handActive || inlineEdit.current
        ? null
        : pickElement(e.target as HTMLElement);
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
      // Com um elemento selecionado, o próprio bloco vira um passo clicável para voltar a editá-lo inteiro.
      ...(elPath ? [{ id: selected.id, label: labelOf(selected.type) }] : []),
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

  /** Estilo do elemento (ou do bloco inteiro) selecionado; vale para o painel e para a barra do canvas. */
  const applyStyleAt = (
    path: string,
    patch: Record<string, string | number | undefined>,
    what: string
  ) => {
    if (!selected) return;
    const now = siteRef.current;
    edit(
      path
        ? updateElementStyle(now, selected.id, path, patch)
        : updateBlockStyle(now, selected.id, patch),
      {
        id: selected.id,
        key: `${selected.id}-s${path}-${Object.keys(patch).join()}`,
        label: `${what} · ${labelOf(selected.type)}`,
      }
    );
  };
  const applyStyle = (
    patch: Record<string, string | number | undefined>,
    what: string
  ) => applyStyleAt(elPath, patch, what);

  /**
   * Muda a camada do elemento selecionado entre os que se sobrepõem a ele (irmãos dele; se nenhum encosta, os do
   * nível de cima). As camadas viram `z-index` de 1 em diante, só nos que mudam de lugar.
   */
  const changeLayer = (op: LayerOp) => {
    if (!(selected && elPath)) {
      flash(
        "Clique num elemento (texto, imagem ou caixa) para mudar a camada."
      );
      return;
    }
    const node = blockEl(selected.id);
    const target = node ? elementAt(node, elPath) : null;
    if (!(node && target)) return;
    // Encostar de leve (sub-pixel, bordas que se tocam) não é sobrepor: exige uns pixels de área em comum.
    const touches = (a: DOMRect, b: DOMRect) =>
      b.width > 0 &&
      b.height > 0 &&
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    // A pegada do elemento na tela (já com o deslocamento): o que ela cobre, em qualquer nível, conta como sobreposto.
    const footprint = target.getBoundingClientRect();
    let level: HTMLElement | null = null;
    let members: HTMLElement[] = [];
    for (let el: HTMLElement | null = target; el && el !== node; ) {
      const parent: HTMLElement | null = el.parentElement;
      if (!parent) break;
      const kids = Array.from(parent.children).filter(
        (c): c is HTMLElement =>
          c instanceof HTMLElement &&
          getComputedStyle(c).display !== "none" &&
          (c === el || touches(footprint, c.getBoundingClientRect()))
      );
      if (kids.length > 1) {
        level = el;
        members = kids;
        break;
      }
      el = parent;
    }
    if (!level) {
      flash(
        "Nada se sobrepõe a este elemento, então não há camadas para trocar."
      );
      return;
    }
    const zOf = (el: HTMLElement) =>
      Number.parseInt(getComputedStyle(el).zIndex, 10) || 0;
    // De trás para a frente: pelo z-index e, empatando, pela ordem na página (quem vem depois fica por cima).
    const sorted = members
      .map((el, i) => ({ el, i, z: zOf(el) }))
      .sort((a, b) => a.z - b.z || a.i - b.i)
      .map(m => m.el);
    const before = sorted.map(el => members.indexOf(el));
    const order = reorderLayers(
      before.map(String),
      String(members.indexOf(level)),
      op
    ).map(Number);
    if (order.join() === before.join()) {
      flash(
        op === "front" || op === "forward"
          ? "Já está na frente."
          : "Já está atrás."
      );
      return;
    }
    let next = siteRef.current;
    order.forEach((idx, n) => {
      const el = members[idx];
      if (!el) return;
      next = updateElementStyle(next, selected.id, pathWithin(el, node), {
        zIndex: n + 1,
        ...(getComputedStyle(el).position === "static"
          ? { position: "relative" }
          : {}),
      });
    });
    edit(next, {
      id: selected.id,
      key: `layer:${selected.id}:${elPath}`,
      label: `Camada · ${labelOf(selected.type)}`,
    });
  };

  // Barra de edição junto do que foi clicado: o que ela mostra depende do elemento (texto, caixa, imagem ou vídeo).
  const quick = (() => {
    if (!selected || framing || handActive || aiBusy) return null;
    const node = canvasRef.current ? blockEl(selected.id) : null;
    const el = node ? (elPath ? elementAt(node, elPath) : node) : null;
    if (!(el && canvasRef.current)) return null;
    const def = getBlockDefinition(selected.type);
    const vars = themeVars(site.theme);
    const resolve = (c: string) => {
      const m = /^var\((--sb-[a-z-]+)\)$/.exec(c);
      return m?.[1] ? (vars[m[1]] ?? c) : c;
    };
    const style = (elPath ? selected.elStyles?.[elPath] : selected.style) ?? {};
    const own = Array.from(el.childNodes).some(
      n => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim()
    );
    // Moldura da mídia do post: a barra mostra o que ela guarda (imagem ou vídeo).
    const inner = el.classList.contains("sb-post-media")
      ? el.querySelector(MEDIA_IN_FRAME)
      : null;
    const mediaEl = inner ?? el;
    const kind: QuickKind =
      mediaEl instanceof HTMLImageElement
        ? "image"
        : mediaEl instanceof HTMLVideoElement ||
            mediaEl instanceof HTMLIFrameElement
          ? "video"
          : elPath && own
            ? "text"
            : "box";
    const cs = getComputedStyle(el);
    const live: LiveText = {
      bold: Number.parseInt(cs.fontWeight, 10) >= 600,
      italic: cs.fontStyle === "italic",
      size: Number.parseFloat(cs.fontSize) || 16,
      underline: cs.textDecorationLine.includes("underline"),
    };
    let media: QuickMedia | undefined;
    if (def && (kind === "image" || kind === "video")) {
      const target = mediaTarget({
        currentPost,
        defaults: def.defaults,
        fields: def.fields,
        hint: focusHint,
        props: selected.props,
        site,
      });
      if (target) {
        const mode = mediaMode(target.value);
        media = {
          field:
            target.kind === "post"
              ? { key: "coverImage", kind: "image", label: "Imagem" }
              : target.field,
          mode: kind === "video" && mode === "image" ? "imported" : mode,
          onChange: value =>
            edit(
              applyMedia(siteRef.current, selected.id, target, value, {
                defaults: def.defaults,
                props: selected.props,
              }),
              {
                id: selected.id,
                key: `media:${selected.id}:${focusHint.n}`,
                label: `Mídia · ${labelOf(selected.type)}`,
              }
            ),
          onUpload: onUploadImage,
          value: target.value,
        };
      }
    }
    // Tudo o que está empilhado no ponto do último clique, de cima para baixo.
    const layers: {
      blockId: string;
      label: string;
      on: boolean;
      path: string;
    }[] = [];
    const pt = lastPoint.current;
    if (pt && canvasRef.current) {
      const seen = new Set<string>();
      for (const hit of document.elementsFromPoint(pt.x, pt.y)) {
        if (!(hit instanceof HTMLElement)) continue;
        const owner = hit.closest<HTMLElement>("[data-block-id]");
        const blockId = owner?.dataset.blockId;
        if (!(owner && blockId && canvasRef.current.contains(owner))) continue;
        const path = hit === owner ? "" : pathWithin(hit, owner);
        const key = `${blockId}:${path}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const text = (hit.textContent ?? "").trim().slice(0, 22);
        layers.push({
          blockId,
          label: path
            ? `${itemName(hit)}${text ? ` · ${text}` : ""}`
            : labelOf(owner.dataset.blockType ?? ""),
          on: blockId === selected.id && path === elPath,
          path,
        });
      }
    }
    // A mídia de um post fica numa moldura que corta; borda, cantos e sombra vão nela, senão a sombra seria cortada.
    const wrap =
      (kind === "image" || kind === "video") &&
      el.parentElement?.classList.contains("sb-post-media")
        ? el.parentElement
        : null;
    const effectPath = wrap && node ? pathWithin(wrap, node) : elPath;
    return {
      effectPath,
      effectStyle:
        (effectPath ? selected.elStyles?.[effectPath] : selected.style) ?? {},
      hasText: (el.textContent ?? "").trim().length > 0 && kind !== "image",
      kind,
      layers: layers.slice(0, 12),
      live: canvasRef.current
        ? readLiveColors(el, canvasRef.current)
        : undefined,
      liveText: live,
      media,
      resolve,
      style,
    };
  })();

  return (
    <div className={aiBusy ? "sbe sbe-ailock" : "sbe"}>
      <style>{editorCss}</style>

      {leftOpen ? (
        <aside
          className="sbe-panel-card sbe-left"
          style={panelW.left ? { width: panelW.left } : undefined}
        >
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
                className={leftTab === "elementos" ? "on" : ""}
                onClick={() => setLeftTab("elementos")}
                type="button"
              >
                <Icon name="layout-template" size={14} />
                Elementos
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
                onClick={() => {
                  setLeftTab("chat");
                  setAiOpened(true);
                }}
                type="button"
              >
                <Icon name="sparkles" size={14} />
                IA{ai ? null : <span className="sbe-soon">BREVE</span>}
              </button>
            </div>
          </div>

          {leftTab === "elementos" && (
            <ElementsPanel onAdd={type => addBlock(type)} />
          )}

          {leftTab === "camadas" && (
            <LayersPanel
              elPath={elPath}
              getElements={getElements}
              onAdd={addBlock}
              onInsert={insertAt}
              onLayer={changeLayer}
              onMove={moveTo}
              onSelect={id => {
                select(id);
                revealInCanvas(id);
              }}
              onSelectElement={(id, elementPath, label) => {
                selectElement(id, elementPath, label);
                revealInCanvas(id, elementPath);
              }}
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

          {ai && aiOpened ? (
            <div
              style={{
                display: leftTab === "chat" ? "flex" : "none",
                flex: 1,
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <AiPanel
                ai={ai}
                getContext={() => {
                  const current = siteRef.current;
                  const r = resolveRoute(current, path, "edit");
                  const picked = selectedId
                    ? findBlock(current, selectedId)
                    : undefined;
                  return {
                    currentRoot: rootForRoute(r),
                    currentTitle:
                      r.kind === "page"
                        ? r.page.title
                        : r.kind === "post"
                          ? r.post.title
                          : undefined,
                    selected: picked
                      ? { id: picked.id, type: picked.type }
                      : undefined,
                  };
                }}
                getSite={() => siteRef.current}
                onApply={(next, change, turn) =>
                  edit(next, {
                    key: turn,
                    kind: "Editado",
                    label: `IA · ${change ?? "Editou o site"}`,
                  })
                }
                onBusy={setAiBusy}
                onUploadImage={onUploadImage}
                storageKey={storageKey}
              />
            </div>
          ) : null}

          {!ai && leftTab === "chat" && (
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

          <div className="sbe-leftfoot">
            <button
              className="sbe-btn round"
              onClick={() => setNewPost(true)}
              title="Criar um post: escolha a categoria e o que ele mostra"
              type="button"
            >
              <Icon name="plus" size={14} />
              Novo post
            </button>
          </div>
        </aside>
      ) : null}

      {leftOpen ? (
        <div
          aria-hidden="true"
          className="sbe-resizer"
          onDoubleClick={() => resetPanel("left")}
          onPointerDown={e => startResize("left", e)}
          title="Arraste para ajustar · duplo clique volta ao padrão"
        />
      ) : null}
      <div className="sbe-center">
        {banner ? <div className="sbe-banner">{banner}</div> : null}
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
            <strong className="sbe-where" title={pageLabel}>
              {pageLabel}
            </strong>
          </div>
          <div aria-label="Ferramentas" className="sbe-tools" role="toolbar">
            <button
              aria-pressed={!handActive}
              className={handActive ? "sbe-ibtn" : "sbe-ibtn on"}
              onClick={() => {
                setTool("select");
                setSpaceHeld(false);
              }}
              title="Selecionar (V) — clique para inspecionar, duplo clique no texto para editar"
              type="button"
            >
              <Icon name="mouse-pointer-2" size={15} />
            </button>
            <button
              aria-pressed={handActive}
              className={handActive ? "sbe-ibtn on" : "sbe-ibtn"}
              onClick={() => {
                setTool("hand");
                clearHover();
              }}
              title="Mão (H) — arraste para mover a tela. Segure Espaço para usar rapidinho"
              type="button"
            >
              <Icon name="hand" size={15} />
            </button>
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
          {/* Seletor de modo de arrastar (Item | Bloco | Livre), desativado: o arrasto é sempre livre.
             Para reativar, descomente este bloco e o `setDragMode` na declaração de `dragMode`.
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
          */}
          <button
            aria-pressed={site.theme.ads === "on"}
            className={site.theme.ads === "on" ? "sbe-ads on" : "sbe-ads off"}
            onClick={() => setAds(site.theme.ads !== "on")}
            title="Mostrar ou esconder os espaços de anúncio"
            type="button"
          >
            <i aria-hidden="true" />
            Anúncios {site.theme.ads === "on" ? "ligados" : "desligados"}
          </button>
          {wide && publish?.domain && publish.liveStatus ? (
            <span
              className={`sbe-pill ${LIVE_PILL[publish.liveStatus].cls}`}
              title={`${publish.domain} — ${LIVE_PILL[publish.liveStatus].hint}`}
            >
              <i />
              {LIVE_PILL[publish.liveStatus].text}
            </span>
          ) : null}
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
              onClick={() =>
                // Alteração replicável pendente: pergunta antes; o próximo clique já abre a revisão.
                pendingReplica ? askReplica(pendingReplica) : setReview(true)
              }
              title="Revisar e publicar"
              type="button"
            >
              <Icon name="rocket" size={14} />
              {availW >= 420 ? "Revisar e publicar" : "Publicar"}
            </button>
          ) : null}
          <button
            aria-pressed={rightOpen}
            className={rightOpen ? "sbe-ibtn on" : "sbe-ibtn"}
            onClick={() => setRightOpen(o => !o)}
            title="Mostrar/ocultar o painel de propriedades"
            type="button"
          >
            <Icon
              name="panel-left"
              size={15}
              style={{ transform: "scaleX(-1)" }}
            />
          </button>
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
              {handActive
                ? "Arraste para mover a tela · V volta para a seta"
                : "Clique seleciona · Duplo clique edita o texto · H mão · Ctrl+Z desfaz"}
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
          className={["sbe-canvas", framing && "framing", handActive && "hand"]
            .filter(Boolean)
            .join(" ")}
          onClickCapture={onCanvasClick}
          onDoubleClickCapture={onCanvasDoubleClick}
          onDragStart={e => e.preventDefault()}
          onPointerDownCapture={e => {
            if (inlineEdit.current?.el.contains(e.target as Node)) return;
            if ((e.target as HTMLElement).closest(".sbe-mediabox")) return;
            // Mãozinha (ou botão do meio do mouse): arrastar leva a tela, sem selecionar nem mover nada.
            if (e.button === 1 || (handActive && e.button === 0)) {
              startPan(e);
              return;
            }
            if (framing && e.button === 0) {
              const img = frameImg();
              if (
                img &&
                imageAt(img.parentElement ?? img, e.clientX, e.clientY) === img
              ) {
                startFramePan(e);
                return;
              }
              setFraming(null);
            }
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
          <div className="sbe-mediabox" ref={mediaBoxRef}>
            {(["nw", "ne", "sw", "se"] as const).map(c => (
              <i
                className={`h ${c}`}
                key={c}
                onPointerDown={e => startMediaResize(e, "corner", c)}
                title="Arraste para diminuir ou aumentar, sem cortar"
              />
            ))}
            {(["w", "e"] as const).map(c => (
              <i
                className={`h ${c}`}
                key={c}
                onPointerDown={e => startMediaResize(e, "side", c)}
                title="Arraste para cortar a largura (o que passar da moldura some)"
              />
            ))}
            <i
              className="h s"
              onPointerDown={e => startMediaResize(e, "height")}
              title="Arraste para cortar a altura (o que passar da moldura some)"
            />
          </div>
          <div className="sbe-guide v" ref={guideVRef} />
          <div className="sbe-guide h" ref={guideHRef} />
          <div
            className="sbe-frame"
            style={
              {
                // Cabeçalho fixo (sticky) dos temas gruda na borda do padding de 16px do canvas, deixando
                // uma fresta por onde a página aparece ao rolar; este deslocamento o leva ao topo visível,
                // como no site publicado. Dividido pelo zoom porque o frame é escalado.
                "--sb-sticky-top": `${-16 / zoom}px`,
                background: site.theme.bg,
                width: devW,
                zoom,
              } as CSSProperties
            }
          >
            <SiteRenderer
              basePath={basePath}
              key={frameKey}
              mode="edit"
              narrow={device !== "desktop"}
              path={path}
              site={site}
            />
          </div>
        </div>

        {framing
          ? (() => {
              const rect = canvasRef.current?.getBoundingClientRect();
              return (
                <div
                  className="sbe-framebar"
                  style={{
                    left: rect ? rect.left + rect.width / 2 : "50%",
                    top: rect ? rect.top + 12 : 12,
                  }}
                >
                  <span>
                    Enquadrando: arraste a foto · roda do mouse = zoom
                  </span>
                  <button onClick={() => zoomFrame(-0.25)} type="button">
                    −
                  </button>
                  <button onClick={() => zoomFrame(0.25)} type="button">
                    +
                  </button>
                  <button
                    onClick={() => commitFrame({ x: 0, y: 0, z: 1 })}
                    type="button"
                  >
                    Restaurar
                  </button>
                  <button onClick={() => setFraming(null)} type="button">
                    Concluir
                  </button>
                </div>
              );
            })()
          : null}

        {quick ? (
          <QuickBar
            barRef={el => {
              quickRef.current = el;
            }}
            customFonts={customFonts(site.theme)}
            effectStyle={quick.effectStyle}
            hasText={quick.hasText}
            key={`${selected?.id}:${elPath}:${focusHint.n}`}
            kind={quick.kind}
            layers={quick.layers}
            liveColors={quick.live}
            liveText={quick.liveText}
            media={quick.media}
            onEffect={(patch, what) => {
              const path = quick.effectPath;
              // "Círculo" numa imagem ou vídeo: deixa a moldura quadrada, senão sai uma elipse (e sobra o retângulo).
              if (selected && patch.borderRadius === "50%") {
                const node = blockEl(selected.id);
                const el = node && path ? elementAt(node, path) : null;
                if (el?.classList.contains("sb-post-media")) {
                  edit(
                    updateBlockProps(
                      updateElementStyle(
                        siteRef.current,
                        selected.id,
                        path,
                        patch
                      ),
                      selected.id,
                      { mediaRatio: 1 }
                    ),
                    {
                      id: selected.id,
                      key: `${selected.id}-s${path}-circle`,
                      label: `${what} · ${labelOf(selected.type)}`,
                    }
                  );
                  return;
                }
                if (
                  el instanceof HTMLImageElement ||
                  el instanceof HTMLVideoElement
                ) {
                  const size = Math.round(
                    Math.min(el.offsetWidth, el.offsetHeight)
                  );
                  applyStyleAt(
                    path,
                    { ...patch, height: size, objectFit: "cover", width: size },
                    what
                  );
                  return;
                }
              }
              applyStyleAt(path, patch, what);
            }}
            onLayer={changeLayer}
            onPickLayer={(blockId, path, label) => {
              selectElement(blockId, path, label);
              revealInCanvas(blockId, path);
            }}
            onStyle={applyStyle}
            resolve={quick.resolve}
            style={quick.style}
          />
        ) : null}

        {video ? (
          <VideoPopup
            label={video.label}
            onClose={() => setVideo(null)}
            src={video.src}
          />
        ) : null}

        {confirm ? (
          <ConfirmDialog onClose={() => setConfirm(null)} request={confirm} />
        ) : null}

        {newPost ? (
          <PostModal
            initialPageId={currentPage?.id}
            onClose={() => setNewPost(false)}
            onCreate={form => {
              const res = addPostToPage(site, form);
              const page = site.pages.find(p => p.id === form.pageId);
              if (res.site === site || !page) return;
              edit(res.site, {
                id: res.id,
                kind: "Novo",
                label: `Post · ${page.title}`,
              });
              setNewPost(false);
              goTo(page.slug ? `/${page.slug}/` : "/");
              setSelectedId(res.id);
              // A página troca na tela antes de o post existir no canvas: espera e leva o olhar até ele.
              setTimeout(() => revealInCanvas(res.id), 250);
              flash(
                "Post adicionado ao fim da página. Use as setas ou arraste para subir."
              );
            }}
            onUploadImage={onUploadImage}
            site={site}
          />
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

      {rightOpen ? (
        <div
          aria-hidden="true"
          className="sbe-resizer"
          onDoubleClick={() => resetPanel("right")}
          onPointerDown={e => startResize("right", e)}
          title="Arraste para ajustar · duplo clique volta ao padrão"
        />
      ) : null}
      <aside
        className="sbe-panel-card sbe-right"
        hidden={!rightOpen}
        style={panelW.right ? { width: panelW.right } : undefined}
      >
        <Inspector
          crumbs={crumbs}
          currentPost={site.posts.find(
            p => postPath(p).replace(/\/$/, "") === path.replace(/\/$/, "")
          )}
          elLabel={elPath ? elName : ""}
          elPath={elPath}
          focusHint={focusHint}
          getLiveColors={readColors}
          onAction={blockAction}
          onAnchor={anchor =>
            selected &&
            edit(setBlockAnchor(site, selected.id, anchor), {
              id: selected.id,
              label: `Âncora · ${labelOf(selected.type)}`,
            })
          }
          onBlockProp={(blockId, key, value) =>
            edit(updateBlockProps(site, blockId, { [key]: value }), {
              key: `${blockId}-${key}`,
              label: "Texto do post",
            })
          }
          onCategory={(id, name) =>
            edit(renameCategory(site, id, name), {
              key: `cat-name-${id}`,
              label: `Categoria · ${name}`,
            })
          }
          onDuplicatePost={(postId, countKey, count) => {
            if (!selected) return;
            const copy = duplicatePost(site, postId);
            if (!copy) return;
            edit(
              updateBlockProps(copy.site, selected.id, { [countKey]: count }),
              {
                id: selected.id,
                key: `${selected.id}-dup-${copy.post.id}`,
                label: `Duplicou “${copy.post.title}” · ${labelOf(selected.type)}`,
              }
            );
          }}
          onFx={(patch, what) =>
            selected &&
            edit(updateBlockFx(site, selected.id, elPath, patch), {
              id: selected.id,
              key: `${selected.id}-fx${elPath}-${Object.keys(patch).join()}`,
              label: `${what} · ${labelOf(selected.type)}`,
            })
          }
          onLayer={changeLayer}
          onMenu={menu =>
            edit(setMenu(site, menu), {
              key: "menu-edit",
              label: "Menu do site",
            })
          }
          onOpenPath={goTo}
          onPost={(id, patch, what) =>
            edit(updatePost(site, id, patch), {
              key: `post-${id}-${Object.keys(patch).join()}`,
              label: `${what} do post · ${site.posts.find(p => p.id === id)?.title ?? ""}`,
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
          onReplicate={
            pendingReplica
              ? {
                  run: () => askReplica(pendingReplica),
                  targets: pendingReplica.targets,
                }
              : undefined
          }
          onResolveChannel={onResolveChannel}
          onSelect={select}
          onSiteName={name =>
            edit(
              { ...site, name: name || site.name },
              { key: "site-name", label: "Nome do site" }
            )
          }
          onStyle={applyStyle}
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
