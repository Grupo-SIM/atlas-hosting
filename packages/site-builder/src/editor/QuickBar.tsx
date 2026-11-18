"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { FieldDef } from "../blocks/types.js";
import { fontStack, SITE_FONTS } from "../renderer/fonts.js";
import { uploadSizeError } from "../upload-limits.js";
import { FieldInput } from "./fields.js";
import { Icon } from "./icons.js";
import { LAYER_OPS, type LayerOp } from "./layer-order.js";
import type { LiveColors } from "./live-colors.js";
import type { MediaMode } from "./quick-target.js";

const RECENT_KEY = "sbe:recent-colors";
const HEX = /^#[0-9a-f]{6}$/i;

/** Cores usadas por último (neste navegador), da mais nova para a mais antiga. */
function readRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((c): c is string => typeof c === "string" && HEX.test(c))
      : [];
  } catch {
    return [];
  }
}

function rememberColor(hex: string): string[] {
  const next = [
    hex.toLowerCase(),
    ...readRecent().filter(c => c.toLowerCase() !== hex.toLowerCase()),
  ].slice(0, 10);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

/** Cores do site (as do tema acompanham o tema) e algumas básicas. */
const PALETTE = [
  "var(--sb-accent)",
  "var(--sb-fg)",
  "var(--sb-bg)",
  "var(--sb-card)",
  "var(--sb-muted)",
  "#ffffff",
  "#0f172a",
  "#94a3b8",
  "#38bdf8",
  "#FFB800",
  "#34d399",
  "#f43f5e",
];

/** Fecha ao clicar fora ou apertar Esc. */
function usePopover(startOpen = false) {
  const [open, setOpen] = useState(startOpen);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  return { open, ref, setOpen };
}

/** Botão de cor com a lista: últimas cores, cores do site e uma cor qualquer (seletor ou código). */
function ColorMenu({
  allowNone,
  label,
  onPick,
  resolve,
  value,
}: {
  allowNone?: boolean;
  label: string;
  onPick: (color: string) => void;
  resolve: (color: string) => string;
  /** Cor que o elemento mostra agora (hex), para o quadradinho e o seletor. */
  value?: string;
}) {
  const { open, ref, setOpen } = usePopover();
  const [recent, setRecent] = useState<string[]>([]);
  const [hex, setHex] = useState("");
  useEffect(() => {
    if (open) {
      setRecent(readRecent());
      setHex(value ?? "");
    }
  }, [open, value]);

  const pick = (color: string) => {
    onPick(color);
    const shown = resolve(color);
    if (HEX.test(shown)) setRecent(rememberColor(shown));
  };

  return (
    <div className="sbq-menu" ref={ref}>
      <button
        aria-expanded={open}
        className={open ? "sbq-btn on" : "sbq-btn"}
        onClick={() => setOpen(o => !o)}
        title={label}
        type="button"
      >
        <i
          className="sbq-dot"
          style={value ? { background: value } : undefined}
        />
        {label}
        <Icon name="chevron-down" size={12} />
      </button>
      {open ? (
        <div className="sbq-pop sbq-colors">
          {recent.length > 0 ? (
            <>
              <b>Últimas cores</b>
              <div className="sbq-sw">
                {recent.map(c => (
                  <button
                    key={c}
                    onClick={() => pick(c)}
                    style={{ background: c }}
                    title={c}
                    type="button"
                  />
                ))}
              </div>
            </>
          ) : null}
          <b>Cores do site</b>
          <div className="sbq-sw">
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => pick(c)}
                style={{ background: resolve(c) }}
                title={c}
                type="button"
              />
            ))}
            {allowNone ? (
              <button
                className="none"
                onClick={() => onPick("transparent")}
                title="Sem cor"
                type="button"
              />
            ) : null}
          </div>
          <b>Escolher outra cor</b>
          <div className="sbq-custom">
            <input
              aria-label="Escolher a cor"
              onChange={e => {
                setHex(e.target.value);
                pick(e.target.value);
              }}
              type="color"
              value={HEX.test(hex) ? hex : "#000000"}
            />
            <input
              onChange={e => setHex(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && HEX.test(hex)) pick(hex);
              }}
              placeholder="#000000"
              type="text"
              value={hex}
            />
            <button
              className="sbq-use"
              disabled={!HEX.test(hex)}
              onClick={() => pick(hex)}
              type="button"
            >
              Usar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type QuickKind = "box" | "image" | "text" | "video";

/** Como o texto está agora na tela (lido do DOM), para os botões mostrarem o estado certo. */
export interface LiveText {
  bold: boolean;
  italic: boolean;
  size: number;
  underline: boolean;
}

export interface QuickMedia {
  field: FieldDef;
  mode: MediaMode;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<string>;
  value: string;
}

const tail = (url: string) => {
  try {
    return decodeURIComponent(url.split(/[?#]/)[0]?.split("/").pop() ?? url);
  } catch {
    return url;
  }
};

/** Vídeo que veio de um link (YouTube, Instagram…): mostra o link e deixa trocar. */
function LinkEditor({ media }: { media: QuickMedia }) {
  const [draft, setDraft] = useState(media.value);
  useEffect(() => setDraft(media.value), [media.value]);
  const apply = () => media.onChange(draft.trim());
  return (
    <div className="sbq-stack">
      <label className="sbe-field">
        <span>Link do vídeo</span>
        <input
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") apply();
          }}
          placeholder="Cole o link do YouTube, Instagram, TikTok…"
          type="text"
          value={draft}
        />
      </label>
      <div className="sbe-row">
        <button
          className="sbe-btn dark"
          disabled={draft.trim() === media.value.trim()}
          onClick={apply}
          type="button"
        >
          Aplicar link
        </button>
        <button
          className="sbe-btn danger"
          onClick={() => media.onChange("")}
          type="button"
        >
          Remover
        </button>
      </div>
    </div>
  );
}

/**
 * Vídeo importado (arquivo): remover ou importar outro. O novo vídeo é enviado e fica guardado à parte; ele só
 * entra no site (e só aparece no canvas) quando se clica em Salvar.
 */
function ImportedEditor({ media }: { media: QuickMedia }) {
  const [staged, setStaged] = useState<{ name: string; url: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const picker = useRef<HTMLInputElement>(null);

  const choose = async (file: File | undefined) => {
    if (!(file && media.onUpload)) return;
    if (!file.type.startsWith("video/")) {
      setError("Envie um arquivo de vídeo.");
      return;
    }
    const tooBig = uploadSizeError(file, "video");
    if (tooBig) {
      setError(tooBig);
      return;
    }
    setBusy(true);
    setError("");
    try {
      setStaged({ name: file.name, url: await media.onUpload(file) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sbq-stack">
      <div className="sbq-file">
        <Icon name="file-text" size={14} />
        <span title={media.value}>{tail(media.value)}</span>
      </div>
      {staged ? (
        <div className="sbq-staged">
          <p>
            <b>{staged.name}</b> está pronto. O vídeo novo só aparece no site
            depois de salvar.
          </p>
          <div className="sbe-row">
            <button
              className="sbe-btn dark"
              onClick={() => {
                media.onChange(staged.url);
                setStaged(null);
              }}
              type="button"
            >
              Salvar
            </button>
            <button
              className="sbe-btn"
              onClick={() => setStaged(null)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="sbe-row">
          {media.onUpload ? (
            <button
              className="sbe-btn"
              disabled={busy}
              onClick={() => picker.current?.click()}
              type="button"
            >
              <Icon name="upload" size={13} />
              {busy ? "Enviando..." : "Importar novo vídeo"}
            </button>
          ) : null}
          <button
            className="sbe-btn danger"
            disabled={busy}
            onClick={() => media.onChange("")}
            type="button"
          >
            <Icon name="trash-2" size={13} />
            Remover vídeo
          </button>
        </div>
      )}
      <input
        accept="video/*"
        hidden
        onChange={e => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void choose(file);
        }}
        ref={picker}
        type="file"
      />
      {error ? <small className="sbe-error">{error}</small> : null}
    </div>
  );
}

/** Janela de edição da imagem ou do vídeo clicado; abre sozinha ao clicar. */
function MediaMenu({ media }: { media: QuickMedia }) {
  const { open, ref, setOpen } = usePopover(true);
  const label =
    media.mode === "image"
      ? "Imagem"
      : media.mode === "link"
        ? "Vídeo (link)"
        : "Vídeo (importado)";
  return (
    <div className="sbq-menu" ref={ref}>
      <button
        aria-expanded={open}
        className={open ? "sbq-btn on" : "sbq-btn"}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        {label}
        <Icon name="chevron-down" size={12} />
      </button>
      {open ? (
        <div className="sbq-pop sbq-media">
          {media.mode === "image" ? (
            <FieldInput
              field={{ ...media.field, label: "Imagem" }}
              onChange={v => media.onChange(String(v ?? ""))}
              onUpload={media.onUpload}
              value={media.value}
            />
          ) : media.mode === "link" ? (
            <LinkEditor media={media} />
          ) : (
            <ImportedEditor media={media} />
          )}
        </div>
      ) : null}
    </div>
  );
}

export interface LayerHit {
  blockId: string;
  label: string;
  on: boolean;
  path: string;
}

/** Camadas: ver o que está empilhado onde se clicou (e escolher) e mandar o elemento para frente ou para trás. */
function LayersMenu({
  layers,
  onLayer,
  onPick,
}: {
  layers: LayerHit[];
  onLayer: (op: LayerOp) => void;
  onPick: (blockId: string, path: string, label: string) => void;
}) {
  const { open, ref, setOpen } = usePopover();
  return (
    <div className="sbq-menu" ref={ref}>
      <button
        aria-expanded={open}
        className={open ? "sbq-btn on" : "sbq-btn"}
        onClick={() => setOpen(o => !o)}
        title="Camadas: o que está na frente e o que está atrás"
        type="button"
      >
        <Icon name="layers" size={13} />
        Camadas
        <Icon name="chevron-down" size={12} />
      </button>
      {open ? (
        <div className="sbq-pop sbq-layers">
          <b>Ordem do elemento</b>
          <div className="sbq-ops">
            {LAYER_OPS.map(o => (
              <button key={o.op} onClick={() => onLayer(o.op)} type="button">
                {o.label}
              </button>
            ))}
          </div>
          {layers.length > 0 ? (
            <>
              <b>Neste ponto (de cima para baixo)</b>
              <div className="sbq-stack-list">
                {layers.map(l => (
                  <button
                    className={l.on ? "on" : ""}
                    key={`${l.blockId}:${l.path}`}
                    onClick={() => onPick(l.blockId, l.path, l.label)}
                    type="button"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const Toggle = ({
  children,
  on,
  onClick,
  title,
}: {
  children: ReactNode;
  on: boolean;
  onClick: () => void;
  title: string;
}) => (
  <button
    aria-pressed={on}
    className={on ? "sbq-tog on" : "sbq-tog"}
    onClick={onClick}
    title={title}
    type="button"
  >
    {children}
  </button>
);

/**
 * Barra que aparece junto do que foi clicado no canvas: cor (últimas cores, cores do site e qualquer cor) e, no
 * texto, fonte, tamanho, negrito, itálico e sublinhado; na imagem ou no vídeo, a janela de troca.
 */
export function QuickBar({
  barRef,
  customFonts,
  hasText,
  kind,
  layers,
  liveColors,
  liveText,
  media,
  onLayer,
  onPickLayer,
  onStyle,
  resolve,
  style,
}: {
  barRef: (el: HTMLDivElement | null) => void;
  customFonts: { name: string; url: string }[];
  hasText: boolean;
  kind: QuickKind;
  layers: LayerHit[];
  liveColors?: LiveColors;
  liveText?: LiveText;
  media?: QuickMedia;
  onLayer: (op: LayerOp) => void;
  onPickLayer: (blockId: string, path: string, label: string) => void;
  onStyle: (patch: Record<string, string | number>, what: string) => void;
  resolve: (color: string) => string;
  style: Record<string, string | number | undefined>;
}) {
  const isMedia = kind === "image" || kind === "video";
  const size = Number(style.fontSize) || Math.round(liveText?.size ?? 16);
  const bold = style.fontWeight
    ? Number(style.fontWeight) >= 600
    : (liveText?.bold ?? false);
  const italic = style.fontStyle
    ? style.fontStyle === "italic"
    : (liveText?.italic ?? false);
  const underline = style.textDecoration
    ? String(style.textDecoration).includes("underline")
    : (liveText?.underline ?? false);
  const textColor =
    typeof style.color === "string" ? resolve(style.color) : liveColors?.color;
  const bg =
    typeof style.background === "string"
      ? resolve(style.background)
      : liveColors?.background;

  return (
    <div className="sbq-bar" ref={barRef}>
      {isMedia ? (
        media ? (
          <MediaMenu key={media.value} media={media} />
        ) : (
          <span className="sbq-note">
            Edite esta mídia pelo painel da direita.
          </span>
        )
      ) : (
        <>
          {kind === "text" ? (
            <>
              <select
                aria-label="Fonte"
                className="sbq-font"
                onChange={e => onStyle({ fontFamily: e.target.value }, "Fonte")}
                value={String(style.fontFamily ?? "")}
              >
                <option value="">Fonte do tema</option>
                {customFonts.length ? (
                  <optgroup label="Minhas fontes">
                    {customFonts.map(c => (
                      <option key={c.name} value={fontStack(c.name)}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="Google Fonts">
                  {SITE_FONTS.map(f => (
                    <option key={f} value={fontStack(f)}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="sbq-size" title="Tamanho da letra">
                <button
                  onClick={() =>
                    onStyle({ fontSize: Math.max(8, size - 1) }, "Tamanho")
                  }
                  type="button"
                >
                  −
                </button>
                <input
                  aria-label="Tamanho da letra"
                  max={160}
                  min={8}
                  onChange={e => {
                    const n = Number(e.target.value);
                    if (n >= 8 && n <= 160) onStyle({ fontSize: n }, "Tamanho");
                  }}
                  type="number"
                  value={size}
                />
                <button
                  onClick={() =>
                    onStyle({ fontSize: Math.min(160, size + 1) }, "Tamanho")
                  }
                  type="button"
                >
                  +
                </button>
              </div>
            </>
          ) : null}
          {hasText ? (
            <ColorMenu
              label="Texto"
              onPick={c => onStyle({ color: c }, "Cor do texto")}
              resolve={resolve}
              value={textColor}
            />
          ) : null}
          {kind === "text" ? (
            <>
              <Toggle
                on={bold}
                onClick={() =>
                  onStyle({ fontWeight: bold ? 400 : 700 }, "Negrito")
                }
                title="Negrito"
              >
                <b>B</b>
              </Toggle>
              <Toggle
                on={italic}
                onClick={() =>
                  onStyle(
                    { fontStyle: italic ? "normal" : "italic" },
                    "Itálico"
                  )
                }
                title="Itálico"
              >
                <i>I</i>
              </Toggle>
              <Toggle
                on={underline}
                onClick={() =>
                  onStyle(
                    { textDecoration: underline ? "none" : "underline" },
                    "Sublinhado"
                  )
                }
                title="Sublinhado"
              >
                <u>U</u>
              </Toggle>
            </>
          ) : null}
          <ColorMenu
            allowNone
            label="Fundo"
            onPick={c => onStyle({ background: c }, "Cor de fundo")}
            resolve={resolve}
            value={bg}
          />
        </>
      )}
      <LayersMenu layers={layers} onLayer={onLayer} onPick={onPickLayer} />
    </div>
  );
}
