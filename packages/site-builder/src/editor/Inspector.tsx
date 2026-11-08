"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { adItemFields, globalAds } from "../blocks/ads.js";
import { getBlockDefinition } from "../blocks/registry.js";
import type { FieldDef } from "../blocks/types.js";
import {
  BLOCK_ANCHOR,
  type Block,
  ENTER_EFFECTS,
  ENTER_LABELS,
  type Fx,
  HOVER_EFFECTS,
  HOVER_LABELS,
  HOVER_MS,
  type Site,
} from "../model/index.js";
import {
  customFonts,
  fontStack,
  SITE_FONTS,
  themeFont,
} from "../renderer/fonts.js";
import { themeVars } from "../renderer/styles.js";
import { FieldInput, type ResolveChannel } from "./fields.js";
import { formatTranslate, parseTranslate } from "./free-move.js";
import { Icon, type IconName } from "./icons.js";

type StyleValue = string | number | undefined;

/** Tokens do tema aparecem como swatches; o valor gravado é a variável CSS do site. */
const TOKEN_COLORS = [
  "var(--sb-accent)",
  "var(--sb-fg)",
  "var(--sb-bg)",
  "var(--sb-card)",
  "var(--sb-muted)",
];
const BASE_COLORS = [
  "#ffffff",
  "#0f172a",
  "#94a3b8",
  "#38bdf8",
  "#FFB800",
  "#34d399",
  "#f43f5e",
];
const TEXT_PALETTE = [...TOKEN_COLORS, ...BASE_COLORS];
const BOX_PALETTE = [...TEXT_PALETTE, "transparent"];

const THEME_SWATCHES = {
  accent: ["#5ce1f5", "#22c55e", "#8b5cf6", "#f97316", "#e11d48", "#eab308"],
  bg: ["#030712", "#0b1220", "#111111", "#0f1a14", "#1a1022", "#ffffff"],
  card: ["#0b1437", "#111827", "#1c1c1c", "#13221a", "#24152f", "#f3f4f6"],
  fg: ["#ffffff", "#e5e7eb", "#111827", "#1d1c1a"],
  muted: ["#9fb0d0", "#94a3b8", "#6b7280", "#a8a29e"],
} as const;

const THEME_LABELS: Record<keyof typeof THEME_SWATCHES, string> = {
  accent: "Cor principal",
  bg: "Fundo da página",
  card: "Superfície (cartões)",
  fg: "Texto",
  muted: "Texto secundário",
};

const num = (v: StyleValue) => {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

function Swatches({
  active,
  big,
  colors,
  onPick,
  resolve,
}: {
  active?: string;
  big?: boolean;
  colors: readonly string[];
  onPick: (value: string) => void;
  resolve: (value: string) => string;
}) {
  return (
    <div className={big ? "sbe-sw big" : "sbe-sw"}>
      {colors.map(c => (
        <button
          className={[
            active === c ? "on" : "",
            c === "transparent" ? "none" : "",
          ]
            .join(" ")
            .trim()}
          key={c}
          onClick={() => onPick(c)}
          style={c === "transparent" ? undefined : { background: resolve(c) }}
          title={c}
          type="button"
        />
      ))}
    </div>
  );
}

const fontLabel = (v: string) => /^'([^']+)'/.exec(v)?.[1] ?? v;

/** Fonte do texto: lista do Google Fonts, fontes enviadas pelo usuário e envio de arquivo novo. */
function FontPicker({
  custom,
  onPick,
  onTheme,
  onUploadFont,
  value,
}: {
  custom: { name: string; url: string }[];
  onPick: (v: string | undefined) => void;
  onTheme: (patch: Record<string, string>, what: string) => void;
  onUploadFont?: (file: File) => Promise<{ name: string; url: string }>;
  value: string | undefined;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const known = value
    ? [...SITE_FONTS, ...custom.map(c => c.name)].some(
        f => fontLabel(value) === f
      )
    : true;

  const upload = async (file: File | undefined) => {
    if (!(file && onUploadFont)) return;
    setBusy(true);
    setError("");
    try {
      const { name, url } = await onUploadFont(file);
      const next = [
        ...custom.filter(c => c.name !== name),
        { name, url },
      ].slice(-20);
      onTheme({ fontFiles: JSON.stringify(next) }, `Fonte ${name}`);
      onPick(fontStack(name));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sbe-field">
      <span>Fonte</span>
      <select
        onChange={e => onPick(e.target.value || undefined)}
        value={value ?? ""}
      >
        <option value="">Herdar do tema</option>
        {!known && value ? (
          <option value={value}>{fontLabel(value)}</option>
        ) : null}
        {custom.length ? (
          <optgroup label="Minhas fontes">
            {custom.map(c => (
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
      {onUploadFont ? (
        <label className="sbe-btn" style={{ cursor: "pointer" }}>
          {busy ? "Enviando..." : "+ Enviar arquivo de fonte"}
          <input
            accept=".woff2,.woff,.ttf,.otf"
            disabled={busy}
            hidden
            onChange={e => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
            type="file"
          />
        </label>
      ) : null}
      {error ? <p className="sbe-hint">{error}</p> : null}
    </div>
  );
}

function Seg<T extends string | number>({
  options,
  value,
  onPick,
}: {
  onPick: (v: T) => void;
  options: { icon?: IconName; label?: string; title?: string; value: T }[];
  value: T | undefined;
}) {
  return (
    <div className="sbe-seg mini">
      {options.map(o => (
        <button
          className={value === o.value ? "on" : ""}
          key={String(o.value)}
          onClick={() => onPick(o.value)}
          title={o.title}
          type="button"
        >
          {o.icon ? <Icon name={o.icon} size={13} /> : o.label}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  max,
  min = 0,
  onChange,
  suffix,
  value,
}: {
  label: string;
  max: number;
  min?: number;
  onChange: (v: number) => void;
  suffix?: string;
  value: number;
}) {
  return (
    <div className="sbe-line">
      <span>{label}</span>
      <input
        max={max}
        min={min}
        onChange={e => onChange(Number(e.target.value))}
        type="range"
        value={value}
      />
      {suffix ? (
        <span style={{ flex: "none", textAlign: "right", width: 36 }}>
          {value}
          {suffix}
        </span>
      ) : (
        <input
          className="sbe-num"
          onChange={e => onChange(Number(e.target.value) || 0)}
          type="text"
          value={value}
        />
      )}
    </div>
  );
}

/** Seções abertas/fechadas pelo usuário: lembradas entre seleções (por escopo + título). */
const sectionMemory = new Map<string, boolean>();

/** Seção recolhível (dropdown) do painel. Só o conteúdo começa aberto. */
function Section({
  children,
  defaultOpen = false,
  scope = "block",
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  scope?: string;
  title: string;
}) {
  const memo = `${scope}:${title}`;
  const [open, setOpen] = useState(sectionMemory.get(memo) ?? defaultOpen);
  return (
    <div className={open ? "sbe-sec open" : "sbe-sec closed"}>
      <button
        aria-expanded={open}
        className="sbe-sec-head"
        onClick={() => {
          sectionMemory.set(memo, !open);
          setOpen(!open);
        }}
        type="button"
      >
        <h4 className="sbe-h">{title}</h4>
        <Icon name={open ? "chevron-down" : "chevron-right"} size={14} />
      </button>
      {open ? <div className="sbe-sec-body">{children}</div> : null}
    </div>
  );
}

/** Campo (ou item de lista) do bloco que mostra o texto/imagem do elemento clicado. */
type FieldMatch =
  | { field: FieldDef; kind: "field" }
  | { field: FieldDef; index: number; kind: "item" };

const norm = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();

/** Acha, pelo texto/imagem que o elemento mostra, quais campos do bloco pertencem a ele. */
function matchFields(
  fields: FieldDef[],
  props: Record<string, unknown>,
  defaults: Record<string, unknown>,
  hint: string
): FieldMatch[] {
  const want = norm(hint);
  if (!want) return [];
  const valueOf = (key: string) => props[key] ?? defaults[key];
  const same = (v: unknown) => norm(v) === want;
  const loose = (v: unknown) => {
    const n = norm(v);
    return n.length >= 3 && (want.includes(n) || n.includes(want));
  };
  const scan = (test: (v: unknown) => boolean): FieldMatch[] => {
    const out: FieldMatch[] = [];
    for (const field of fields) {
      if (field.kind === "list") {
        const items = valueOf(field.key);
        if (!Array.isArray(items)) continue;
        items.forEach((item, index) => {
          const hit = (field.itemFields ?? []).some(
            f =>
              f.kind !== "list" &&
              test((item as Record<string, unknown>)[f.key])
          );
          if (hit) out.push({ field, index, kind: "item" });
        });
      } else if (test(valueOf(field.key))) {
        out.push({ field, kind: "field" });
      }
    }
    return out;
  };
  const exact = scan(same);
  return exact.length > 0 ? exact : scan(loose);
}

/** Os campos de UM item de uma lista (ex.: um card), sem mostrar a lista inteira. */
function ItemFields({
  index,
  list,
  onChange,
  onResolveChannel,
  onUpload,
  value,
}: {
  index: number;
  list: FieldDef;
  onChange: (value: unknown) => void;
  onResolveChannel?: ResolveChannel;
  onUpload?: (file: File) => Promise<string>;
  value: unknown;
}) {
  const items = Array.isArray(value)
    ? (value as Record<string, unknown>[])
    : [];
  const item = items[index];
  if (!item) return null;
  return (
    <div className="sbe-list-item">
      <p className="sbe-hint">
        {list.label}: item {index + 1}
      </p>
      {(list.itemFields ?? [])
        .filter(f => !f.showWhen || item[f.showWhen.key] === f.showWhen.equals)
        .map(f => (
          <FieldInput
            field={f}
            key={f.key}
            onChange={v =>
              onChange(
                items.map((it, i) => (i === index ? { ...it, [f.key]: v } : it))
              )
            }
            onResolveChannel={onResolveChannel}
            onUpload={onUpload}
            value={item[f.key]}
          />
        ))}
    </div>
  );
}

export interface FocusHint {
  n: number;
  value: string;
}

interface Props {
  crumbs: { id?: string; label: string }[];
  elLabel?: string;
  elPath?: string;
  onMenu: (menu: Site["menu"]) => void;
  onAction: (action: "delete" | "down" | "duplicate" | "hide" | "up") => void;
  onAnchor: (anchor: string) => void;
  onFx: (patch: Partial<Record<keyof Fx, Fx[keyof Fx]>>, what: string) => void;
  onProp: (key: string, value: unknown) => void;
  onSelect: (id: string) => void;
  onSiteName: (name: string) => void;
  onStyle: (patch: Record<string, StyleValue>, what: string) => void;
  onTheme: (patch: Record<string, string>, what: string) => void;
  onResolveChannel?: ResolveChannel;
  onUploadImage?: (file: File) => Promise<string>;
  onUploadFont?: (file: File) => Promise<{ name: string; url: string }>;
  focusHint?: FocusHint;
  selected?: Block;
  site: Site;
}

/**
 * Nome do bloco para links `#nome` (ex.: botão "Saber mais" com link `#sabermais`). Grava ao sair do
 * campo; o que não for válido (`BLOCK_ANCHOR`) é avisado e não é salvo.
 */
function AnchorInput({
  onCommit,
  value,
}: {
  onCommit: (anchor: string) => void;
  value: string;
}) {
  const [draft, setDraft] = useState(value);
  const clean = draft.trim();
  const ok = clean === "" || BLOCK_ANCHOR.test(clean);
  return (
    <label className="sbe-field">
      <span>Nome para links (#)</span>
      <input
        onBlur={() => ok && clean !== value && onCommit(clean)}
        onChange={e => setDraft(e.target.value)}
        placeholder="ex.: sabermais"
        type="text"
        value={draft}
      />
      <small>
        {ok
          ? clean
            ? `Links para #${clean} rolam até este bloco.`
            : "Vazio = sem âncora."
          : "Use letras, números, - ou _, começando com letra."}
      </small>
    </label>
  );
}

/** Painel direito: propriedades do bloco selecionado ou, sem seleção, o tema do site. */
export function Inspector({
  crumbs,
  elLabel,
  elPath,
  focusHint,
  onAction,
  onAnchor,
  onFx,
  onMenu,
  onProp,
  onSelect,
  onSiteName,
  onStyle,
  onTheme,
  onResolveChannel,
  onUploadImage,
  onUploadFont,
  selected,
  site,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  // Clique num item do site: leva o foco ao campo que guarda aquele texto/imagem/link.
  useEffect(() => {
    if (!focusHint?.value) return;
    const fields = root.current?.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >(".sbe-field input[type=text], .sbe-field textarea");
    const norm = (v: string) => v.replace(/\s+/g, " ").trim();
    const want = norm(focusHint.value);
    const hit = Array.from(fields ?? []).find(f => norm(f.value) === want);
    if (!hit) return;
    hit.scrollIntoView({ block: "center" });
    hit.focus();
    hit.select();
  }, [focusHint?.n]);

  // Campos que pertencem ao item clicado: decididos no clique (o texto muda enquanto se digita).
  const itemDef = selected ? getBlockDefinition(selected.type) : undefined;
  const itemMatches = useMemo(
    () =>
      elPath && selected && itemDef
        ? matchFields(
            itemDef.fields,
            selected.props,
            itemDef.defaults,
            focusHint?.value ?? ""
          )
        : [],
    [focusHint?.n, selected?.id, elPath]
  );

  const vars = themeVars(site.theme);
  const resolve = (c: string) => {
    const m = /^var\((--sb-[a-z-]+)\)$/.exec(c);
    return m?.[1] ? (vars[m[1]] ?? c) : c;
  };

  if (!selected) {
    return (
      <>
        <div className="sbe-selhead">
          <div className="row">
            <Icon name="palette" size={15} style={{ color: "#6a5ad8" }} />
            <div className="name">Página inteira</div>
            <span className="sbe-chip">Tema</span>
          </div>
        </div>
        <div className="sbe-scroll">
          <div className="sbe-pad" style={{ gap: 18, padding: 16 }}>
            <p className="sbe-hint">
              Clique em qualquer bloco do site para editar. Aqui você ajusta o
              tema do site inteiro.
            </p>
            <div className="sbe-field">
              <span className="sbe-h">Nome do site</span>
              <input
                onChange={e => onSiteName(e.target.value)}
                type="text"
                value={site.name}
              />
            </div>
            <FieldInput
              field={{
                key: "favicon",
                kind: "image",
                label: "Favicon (ícone da aba no site publicado)",
              }}
              onChange={v => onTheme({ favicon: String(v ?? "") }, "Favicon")}
              onUpload={onUploadImage}
              value={site.theme.favicon ?? ""}
            />
            <div className="sbe-line">
              <span>Anúncios no site</span>
              <button
                className={
                  site.theme.ads === "on" ? "sbe-toggle on" : "sbe-toggle"
                }
                onClick={() =>
                  onTheme(
                    { ads: site.theme.ads === "on" ? "off" : "on" },
                    "Anúncios"
                  )
                }
                type="button"
              >
                <span />
              </button>
            </div>
            <p className="sbe-hint">
              Liga os espaços de anúncio do template. Depois clique num espaço
              para enviar imagens ou vídeos, ou configure abaixo os anúncios que
              valem para o site inteiro.
            </p>
            {site.theme.ads === "on"
              ? (["banner", "side"] as const).map(kind => {
                  const all = globalAds(site.theme);
                  const cfg = all[kind];
                  const save = (patch: Partial<typeof cfg>) =>
                    onTheme(
                      {
                        adsConfig: JSON.stringify({
                          ...all,
                          [kind]: { ...cfg, ...patch },
                        }),
                      },
                      "Anúncios do site"
                    );
                  return (
                    <div
                      key={kind}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <h4 className="sbe-h">
                        {kind === "banner"
                          ? "Anúncios do site — faixa larga (topo)"
                          : "Anúncios do site — coluna lateral"}
                      </h4>
                      <FieldInput
                        field={{
                          itemFields: adItemFields,
                          key: "items",
                          kind: "list",
                          label: "Imagens e vídeos",
                        }}
                        onChange={v => save({ items: v as typeof cfg.items })}
                        onUpload={onUploadImage}
                        value={cfg.items}
                      />
                      <FieldInput
                        field={{ key: "link", kind: "url", label: "Link" }}
                        onChange={v => save({ link: String(v ?? "") })}
                        value={cfg.link}
                      />
                      <FieldInput
                        field={{
                          key: "seconds",
                          kind: "number",
                          label: "Segundos por imagem",
                        }}
                        onChange={v => save({ seconds: Number(v) || 6 })}
                        value={cfg.seconds}
                      />
                    </div>
                  );
                })
              : null}
            {(
              Object.keys(THEME_SWATCHES) as (keyof typeof THEME_SWATCHES)[]
            ).map(key => (
              <div
                key={key}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <h4 className="sbe-h">{THEME_LABELS[key]}</h4>
                <Swatches
                  active={site.theme[key]}
                  big
                  colors={THEME_SWATCHES[key]}
                  onPick={c => onTheme({ [key]: c }, THEME_LABELS[key])}
                  resolve={c => c}
                />
                <input
                  className="sbe-mono"
                  onChange={e =>
                    onTheme({ [key]: e.target.value }, THEME_LABELS[key])
                  }
                  type="text"
                  value={site.theme[key] ?? ""}
                />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h4 className="sbe-h">Fonte</h4>
              {SITE_FONTS.map(f => (
                <button
                  className="sbe-btn"
                  key={f}
                  onClick={() =>
                    onTheme(
                      { fontBody: fontStack(f), fontHeading: fontStack(f) },
                      "Fonte"
                    )
                  }
                  style={{
                    borderColor: themeFont(site.theme) === f ? "#1d1c1a" : "",
                    fontFamily: fontStack(f),
                    fontSize: 14,
                    padding: "9px 12px",
                  }}
                  type="button"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const def = getBlockDefinition(selected.type);
  const label = def?.label ?? selected.type;
  const st = (elPath ? selected.elStyles?.[elPath] : selected.style) ?? {};
  const set = (prop: string, what: string) => (v: StyleValue) =>
    onStyle({ [prop]: v }, what);
  const strSetter = (prop: string, what: string) => (raw: string) => {
    const v = raw.trim();
    onStyle({ [prop]: /^\d+(\.\d+)?$/.test(v) ? Number(v) : v }, what);
  };
  const fx: Fx = selected.fx?.[elPath ?? ""] ?? {};
  const textPick = (c: string) => set("color", "Cor do texto")(c);

  return (
    <div ref={root} style={{ display: "contents" }}>
      <div className="sbe-selhead">
        <div className="row">
          <Icon name="box" size={15} style={{ color: "#6a5ad8" }} />
          <div className="name">{elPath ? elLabel || "Elemento" : label}</div>
          <span className="sbe-chip">{elPath ? "Elemento" : "Bloco"}</span>
        </div>
        <div className="sbe-crumbs">
          {crumbs.map(c => (
            <button
              disabled={!c.id}
              key={c.id ?? c.label}
              onClick={() => c.id && onSelect(c.id)}
              style={{ cursor: c.id ? "pointer" : "default" }}
              type="button"
            >
              {c.label}
              <Icon name="chevron-right" size={10} />
            </button>
          ))}
        </div>
      </div>

      <div className="sbe-scroll">
        {elPath ? null : (
          <div className="sbe-actions">
            {(
              [
                ["duplicate", "Duplicar (Ctrl+D)", "copy"],
                [
                  "hide",
                  selected.hidden ? "Mostrar" : "Ocultar",
                  selected.hidden ? "eye" : "eye-off",
                ],
                ["up", "Mover para cima", "arrow-up"],
                ["down", "Mover para baixo", "arrow-down"],
                ["delete", "Excluir (Delete)", "trash-2"],
              ] as const
            ).map(([action, title, icon]) => (
              <button
                className={action === "delete" ? "danger" : ""}
                key={action}
                onClick={() => onAction(action)}
                title={title}
                type="button"
              >
                <Icon name={icon} size={14} />
              </button>
            ))}
          </div>
        )}

        {elPath ? (
          <Section defaultOpen scope="el" title="Conteúdo do item">
            {itemMatches.length > 0 && def ? (
              itemMatches.map(m =>
                m.kind === "field" ? (
                  <FieldInput
                    field={m.field}
                    key={m.field.key}
                    onChange={v => onProp(m.field.key, v)}
                    onResolveChannel={onResolveChannel}
                    onUpload={onUploadImage}
                    value={
                      selected.props[m.field.key] ?? def.defaults[m.field.key]
                    }
                  />
                ) : (
                  <ItemFields
                    index={m.index}
                    key={`${m.field.key}-${m.index}`}
                    list={m.field}
                    onChange={v => onProp(m.field.key, v)}
                    onResolveChannel={onResolveChannel}
                    onUpload={onUploadImage}
                    value={
                      selected.props[m.field.key] ?? def.defaults[m.field.key]
                    }
                  />
                )
              )
            ) : (
              <p className="sbe-hint">
                {elLabel === "link" &&
                (selected.type === "header" || selected.type === "footer")
                  ? "Os links do menu ficam em “Menu do site”, logo abaixo."
                  : "Este item não tem texto ou imagem próprios para editar aqui. Para o conteúdo do bloco, selecione o bloco no caminho acima."}
              </p>
            )}
          </Section>
        ) : def && def.fields.length > 0 ? (
          <Section defaultOpen title="Conteúdo">
            {def.fields.map(field => (
              <FieldInput
                field={field}
                key={field.key}
                onChange={v => onProp(field.key, v)}
                onResolveChannel={onResolveChannel}
                onUpload={onUploadImage}
                value={selected.props[field.key] ?? def.defaults[field.key]}
              />
            ))}
          </Section>
        ) : null}

        {elPath ? null : (
          <Section title="Âncora">
            <AnchorInput
              key={selected.id}
              onCommit={onAnchor}
              value={selected.anchor ?? ""}
            />
          </Section>
        )}

        <Section scope={elPath ? "el" : "block"} title="Tamanho">
          {(
            [
              ["width", "Largura", 1600],
              ["height", "Altura", 800],
            ] as const
          ).map(([key, label, max]) => {
            const v = st[key];
            const px = typeof v === "number" ? v : Number.parseFloat(String(v));
            return (
              <div className="sbe-line" key={key}>
                <span>{label}</span>
                <input
                  max={max}
                  min={0}
                  onChange={e =>
                    onStyle({ [key]: Number(e.target.value) }, label)
                  }
                  type="range"
                  value={Number.isFinite(px) ? px : 0}
                />
                <input
                  className="sbe-num"
                  onChange={e => strSetter(key, label)(e.target.value)}
                  placeholder="auto"
                  type="text"
                  value={v ?? ""}
                />
                <button
                  className="sbe-ibtn"
                  disabled={v === undefined}
                  onClick={() => onStyle({ [key]: "" }, label)}
                  title="Automático"
                  type="button"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            );
          })}
          <p className="sbe-hint">
            Número = pixels; também aceita %, rem… Deixe um dos dois em auto
            para não deformar a imagem.
          </p>
        </Section>

        {(selected.type === "header" || selected.type === "footer") &&
        (!elPath || (elLabel === "link" && itemMatches.length === 0)) ? (
          <Section
            defaultOpen={Boolean(elPath)}
            scope={elPath ? "el" : "block"}
            title="Menu do site"
          >
            <p className="sbe-hint">Vale para o cabeçalho e o rodapé.</p>
            {site.menu.map((item, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: itens do menu não têm id
              <div className="sbe-list-item" key={i}>
                <label className="sbe-field">
                  <span>Nome do link</span>
                  <input
                    onChange={e =>
                      onMenu(
                        site.menu.map((m, j) =>
                          j === i ? { ...m, label: e.target.value } : m
                        )
                      )
                    }
                    type="text"
                    value={item.label}
                  />
                </label>
                <label className="sbe-field">
                  <span>Endereço</span>
                  <input
                    onChange={e =>
                      onMenu(
                        site.menu.map((m, j) =>
                          j === i ? { ...m, href: e.target.value } : m
                        )
                      )
                    }
                    type="text"
                    value={item.href}
                  />
                </label>
                <div className="sbe-row">
                  <button
                    onClick={() => onMenu(site.menu.filter((_, j) => j !== i))}
                    type="button"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                onMenu([...site.menu, { href: "/", label: "Novo link" }])
              }
              type="button"
            >
              + Adicionar link
            </button>
          </Section>
        ) : null}

        <Section scope={elPath ? "el" : "block"} title="Posição">
          {(["x", "y"] as const).map(axis => {
            const pos = parseTranslate(st.translate);
            return (
              <div className="sbe-line" key={axis}>
                <span>
                  {axis === "x" ? "Mover na horizontal" : "Mover na vertical"}
                </span>
                <input
                  className="sbe-num"
                  onChange={e => {
                    const n = Number(e.target.value.replace(",", "."));
                    if (!Number.isFinite(n)) return;
                    const next = { ...pos, [axis]: n };
                    set(
                      "translate",
                      "Posição"
                    )(
                      next.x === 0 && next.y === 0
                        ? undefined
                        : formatTranslate(next)
                    );
                  }}
                  type="text"
                  value={pos[axis]}
                />
              </div>
            );
          })}
          <p className="sbe-hint">
            Arraste o item no canvas (Shift = um eixo só, Alt = sem encaixe) ou
            use as setas do teclado (Shift = 10 px). Só vale em tela larga.
          </p>
          {st.translate ? (
            <button
              className="sbe-btn"
              onClick={() => set("translate", "Posição")(undefined)}
              type="button"
            >
              Voltar ao lugar original
            </button>
          ) : null}
        </Section>

        {elLabel === "imagem" ? null : (
          <Section scope={elPath ? "el" : "block"} title="Tipografia">
            <FontPicker
              custom={customFonts(site.theme)}
              onPick={v => set("fontFamily", "Fonte")(v)}
              onTheme={onTheme}
              onUploadFont={onUploadFont}
              value={st.fontFamily as string | undefined}
            />
            <div className="sbe-line">
              <span>Tamanho</span>
              <input
                max={96}
                min={8}
                onChange={e =>
                  set("fontSize", "Tamanho")(Number(e.target.value))
                }
                type="range"
                value={num(st.fontSize) || 16}
              />
              <input
                className="sbe-num"
                onChange={e =>
                  set(
                    "fontSize",
                    "Tamanho"
                  )(e.target.value === "" ? undefined : Number(e.target.value))
                }
                placeholder="auto"
                type="text"
                value={st.fontSize ?? ""}
              />
            </div>
            <div className="sbe-field">
              <span>Peso</span>
              <Seg
                onPick={v => set("fontWeight", "Peso")(v)}
                options={[
                  { label: "Fino", value: 300 },
                  { label: "Normal", value: 400 },
                  { label: "Médio", value: 500 },
                  { label: "Negrito", value: 700 },
                  { label: "Black", value: 900 },
                ]}
                value={num(st.fontWeight) || undefined}
              />
            </div>
            <div className="sbe-field">
              <span>Cor do texto</span>
              <Swatches
                active={st.color as string | undefined}
                colors={TEXT_PALETTE}
                onPick={textPick}
                resolve={resolve}
              />
              <input
                className="sbe-mono"
                onChange={e => set("color", "Cor do texto")(e.target.value)}
                placeholder="herdar do tema"
                type="text"
                value={st.color ?? ""}
              />
            </div>
            <div className="sbe-line">
              <span>Alinhamento</span>
              <div style={{ width: 110 }}>
                <Seg
                  onPick={v => set("textAlign", "Alinhamento")(v)}
                  options={[
                    { icon: "align-left", value: "left" },
                    { icon: "align-center", value: "center" },
                    { icon: "align-right", value: "right" },
                  ]}
                  value={(st.textAlign as string | undefined) ?? "left"}
                />
              </div>
            </div>
            <div className="sbe-line">
              <span>Maiúsculas</span>
              <button
                className={
                  st.textTransform === "uppercase"
                    ? "sbe-toggle on"
                    : "sbe-toggle"
                }
                onClick={() =>
                  set(
                    "textTransform",
                    "Maiúsculas"
                  )(st.textTransform === "uppercase" ? undefined : "uppercase")
                }
                type="button"
              >
                <span />
              </button>
            </div>
          </Section>
        )}

        <Section scope={elPath ? "el" : "block"} title="Efeitos">
          <div className="sbe-field">
            <span>Entrada (ao rolar até aqui)</span>
            <select
              onChange={e =>
                onFx(
                  { enter: (e.target.value || undefined) as Fx["enter"] },
                  "Efeito de entrada"
                )
              }
              value={fx.enter ?? ""}
            >
              <option value="">Nenhum</option>
              {ENTER_EFFECTS.map(k => (
                <option key={k} value={k}>
                  {ENTER_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          {fx.enter ? (
            <Slider
              label="Atraso (ms)"
              max={2000}
              onChange={v => onFx({ delay: v }, "Atraso do efeito")}
              value={fx.delay ?? 0}
            />
          ) : null}
          <div className="sbe-field">
            <span>Ao passar o mouse</span>
            <select
              onChange={e =>
                onFx(
                  { hover: (e.target.value || undefined) as Fx["hover"] },
                  "Efeito de hover"
                )
              }
              value={fx.hover ?? ""}
            >
              <option value="">Nenhum</option>
              {HOVER_EFFECTS.map(k => (
                <option key={k} value={k}>
                  {HOVER_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          {fx.hover ? (
            <Slider
              label="Duração do hover (ms)"
              max={HOVER_MS.max}
              min={HOVER_MS.min}
              onChange={v =>
                onFx(
                  {
                    hoverMs: Math.min(
                      HOVER_MS.max,
                      Math.max(HOVER_MS.min, Math.round(v))
                    ),
                  },
                  "Duração do hover"
                )
              }
              value={fx.hoverMs ?? HOVER_MS.default}
            />
          ) : null}
          <Slider
            label="Parallax"
            max={10}
            min={-10}
            onChange={v => onFx({ parallax: v }, "Parallax")}
            value={fx.parallax ?? 0}
          />
          <div className="sbe-line">
            <span>Contar números de 0 até o valor</span>
            <button
              className={fx.count ? "sbe-toggle on" : "sbe-toggle"}
              onClick={() =>
                onFx({ count: fx.count ? undefined : true }, "Contador")
              }
              type="button"
            >
              <span />
            </button>
          </div>
          {fx.enter || fx.hover || fx.parallax || fx.count ? (
            <>
              <div className="sbe-line">
                <span>Aplicar a cada item de dentro</span>
                <button
                  className={fx.each ? "sbe-toggle on" : "sbe-toggle"}
                  onClick={() =>
                    onFx(
                      { each: fx.each ? undefined : true },
                      "Efeito por item"
                    )
                  }
                  type="button"
                >
                  <span />
                </button>
              </div>
              {fx.each && fx.enter ? (
                <Slider
                  label="Atraso entre itens (ms)"
                  max={600}
                  onChange={v => onFx({ stagger: v }, "Atraso entre itens")}
                  value={fx.stagger ?? 0}
                />
              ) : null}
              <button
                className="sbe-btn"
                onClick={() =>
                  onFx(
                    {
                      count: undefined,
                      delay: undefined,
                      each: undefined,
                      enter: undefined,
                      hover: undefined,
                      hoverMs: undefined,
                      parallax: undefined,
                      stagger: undefined,
                    },
                    "Remover efeitos"
                  )
                }
                type="button"
              >
                Remover efeitos
              </button>
            </>
          ) : null}
          <p className="sbe-hint">
            Entrada, parallax e contador aparecem na prévia e no site publicado;
            no editor o conteúdo fica parado para facilitar a edição.
          </p>
        </Section>

        <Section scope={elPath ? "el" : "block"} title="Caixa">
          <div className="sbe-field">
            <span>Fundo</span>
            <Swatches
              active={st.background as string | undefined}
              colors={BOX_PALETTE}
              onPick={c => set("background", "Fundo")(c)}
              resolve={resolve}
            />
            <input
              className="sbe-mono"
              onChange={e => set("background", "Fundo")(e.target.value)}
              placeholder="nenhum"
              type="text"
              value={st.background ?? ""}
            />
          </div>
          <Slider
            label="Arredondamento"
            max={64}
            onChange={set("borderRadius", "Arredondamento")}
            value={num(st.borderRadius)}
          />
          <div className="sbe-line">
            <span>Espaçamento interno</span>
            <input
              className="sbe-sm"
              onChange={e =>
                strSetter("padding", "Espaçamento")(e.target.value)
              }
              placeholder="ex: 16 ou 8px 24px"
              style={{ width: 120 }}
              type="text"
              value={st.padding ?? ""}
            />
          </div>
          <div className="sbe-line">
            <span>Margem externa</span>
            <input
              className="sbe-sm"
              onChange={e => strSetter("margin", "Margem")(e.target.value)}
              placeholder="ex: 0 0 24px"
              style={{ width: 120 }}
              type="text"
              value={st.margin ?? ""}
            />
          </div>
          <div className="sbe-line">
            <span>Borda</span>
            <input
              className="sbe-num"
              onChange={e => {
                const w = Number(e.target.value) || 0;
                onStyle(
                  w
                    ? {
                        borderColor: st.borderColor ?? "rgba(255,255,255,0.2)",
                        borderStyle: "solid",
                        borderWidth: w,
                      }
                    : { borderWidth: undefined },
                  "Borda"
                );
              }}
              type="text"
              value={st.borderWidth ?? 0}
            />
            <span style={{ color: "#9a968e", flex: "none" }}>px</span>
          </div>
          <Swatches
            active={st.borderColor as string | undefined}
            colors={BOX_PALETTE}
            onPick={c =>
              onStyle(
                {
                  borderColor: c,
                  borderStyle: "solid",
                  borderWidth: st.borderWidth || 1,
                },
                "Cor da borda"
              )
            }
            resolve={resolve}
          />
          <Slider
            label="Opacidade"
            max={100}
            onChange={v => set("opacity", "Opacidade")(v / 100)}
            suffix="%"
            value={Math.round(
              (st.opacity === undefined ? 1 : num(st.opacity)) * 100
            )}
          />
          <div className="sbe-line">
            <span>Largura máxima</span>
            <input
              className="sbe-sm"
              onChange={e =>
                strSetter("maxWidth", "Largura máxima")(e.target.value)
              }
              placeholder="livre"
              style={{ width: 80 }}
              type="text"
              value={st.maxWidth ?? ""}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
