"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AD_KEYS,
  AD_TITLES,
  type AdKey,
  adItemFields,
  globalAds,
} from "../blocks/ads.js";
import { postPath } from "../blocks/helpers.js";
import { getBlockDefinition } from "../blocks/registry.js";
import type { FieldDef } from "../blocks/types.js";
import {
  BLOCK_ANCHOR,
  type Block,
  type Category,
  ENTER_EFFECTS,
  ENTER_LABELS,
  type EnterScreen,
  type Fx,
  HOVER_EFFECTS,
  HOVER_LABELS,
  HOVER_MS,
  type Post,
  type Site,
} from "../model/index.js";
import {
  customFonts,
  fontStack,
  SITE_FONTS,
  themeFont,
} from "../renderer/fonts.js";
import { themeVars } from "../renderer/styles.js";
import { VARIANT_TOKENS } from "../renderer/variant-tokens.js";
import { FieldInput, type ResolveChannel } from "./fields.js";
import { formatTranslate, parseTranslate } from "./free-move.js";
import { Icon, type IconName } from "./icons.js";
import { resolveSiteItem } from "./site-items.js";

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

/** Texto como aparece na tela: sem a marcação de negrito, link, título e lista que o bloco converte em HTML. */
const plain = (v: unknown) =>
  norm(
    String(v ?? "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*|__|`|\{\{|\}\}|\[\[|\]\]/g, "")
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "")
  );

/** Algum campo do item (inclusive de listas dentro do item, como as opções de um cartão) passa no teste. */
function hasValue(
  item: Record<string, unknown>,
  fields: FieldDef[],
  test: (v: unknown) => boolean
): boolean {
  return fields.some(f => {
    const v = item?.[f.key];
    if (f.kind !== "list") return test(v);
    return (
      Array.isArray(v) &&
      v.some(sub =>
        hasValue(sub as Record<string, unknown>, f.itemFields ?? [], test)
      )
    );
  });
}

/** Acha, pelo texto/imagem que o elemento mostra, quais campos do bloco pertencem a ele. */
function matchFields(
  fields: FieldDef[],
  props: Record<string, unknown>,
  defaults: Record<string, unknown>,
  hint: string,
  exactOnly = false
): FieldMatch[] {
  const want = norm(hint);
  if (!want) return [];
  const valueOf = (key: string) => props[key] ?? defaults[key];
  // O texto da tela também pode trazer marcação que sobrou (ex.: `***` sem par), então compara sem ela dos dois lados.
  const wantPlain = plain(hint);
  const same = (v: unknown) =>
    norm(v) === want || plain(v) === want || plain(v) === wantPlain;
  const loose = (v: unknown) => {
    const n = norm(v);
    const pl = plain(v);
    return (
      (n.length >= 3 && (want.includes(n) || n.includes(want))) ||
      (pl.length >= 3 &&
        (want.includes(pl) ||
          pl.includes(want) ||
          wantPlain.includes(pl) ||
          pl.includes(wantPlain)))
    );
  };
  const scan = (test: (v: unknown) => boolean): FieldMatch[] => {
    const out: FieldMatch[] = [];
    for (const field of fields) {
      if (field.kind === "list") {
        const items = valueOf(field.key);
        if (!Array.isArray(items)) continue;
        items.forEach((item, index) => {
          const hit = hasValue(
            item as Record<string, unknown>,
            field.itemFields ?? [],
            test
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
  if (exact.length > 0 || exactOnly) return exact;
  const near = scan(loose);
  if (near.length > 0) return near;
  // Contador composto ("10K+", "+420%", "1,119+"): o número, o prefixo e o sufixo são campos separados.
  if (want.length <= 12 && /\d/.test(want)) {
    const piece = (v: unknown) => {
      const n = norm(v);
      return n.length >= 1 && n.length <= 6 && want.includes(n);
    };
    const hits = scan(piece);
    return hits.length <= 3 ? hits : [];
  }
  return near;
}

/** Campos do item: os que guardam o texto/imagem dele e, num link, o que guarda o endereço. */
export function matchItem(
  fields: FieldDef[],
  props: Record<string, unknown>,
  defaults: Record<string, unknown>,
  hint: FocusHint | undefined
): FieldMatch[] {
  if (hint?.ad) return adFields(fields);
  let out = matchFields(fields, props, defaults, hint?.value ?? "");
  // Trecho em destaque dentro de um título (<span>): o campo guarda o título inteiro, que é o texto do pai.
  if (out.length === 0 && hint?.parentText)
    out = matchFields(fields, props, defaults, hint.parentText);
  // Imagens e fundos empilhados no ponto clicado (seção com imagem de fundo, véu, imagem coberta): o campo
  // delas vale junto com o texto do item. Só entra o que bate exatamente com o valor guardado.
  if (hint?.under) {
    const have = new Set(
      out.map(m =>
        m.kind === "item" ? `${m.field.key}#${m.index}` : m.field.key
      )
    );
    for (const u of hint.under) {
      for (const m of matchFields(fields, props, defaults, u, true)) {
        const k = m.kind === "item" ? `${m.field.key}#${m.index}` : m.field.key;
        if (!have.has(k)) {
          have.add(k);
          out.push(m);
        }
      }
    }
  }
  const key = (m: FieldMatch) =>
    m.kind === "item" ? `${m.field.key}#${m.index}` : m.field.key;
  const seen = new Set(out.map(key));
  if (hint?.href && hint.href !== "#") {
    for (const m of matchFields(fields, props, defaults, hint.href, true)) {
      if (!seen.has(key(m))) out.push(m);
    }
  }
  return withRelated(fields, out, seen);
}

/**
 * Junta os campos `related` dos campos achados (ex.: clicar na foto do hero abre também a foto do
 * hover, que fica vazia ou escondida até passar o mouse). O grupo segue a ordem da definição.
 */
function withRelated(
  fields: FieldDef[],
  matches: FieldMatch[],
  seen: Set<string>
): FieldMatch[] {
  const order = (f: FieldDef) => fields.indexOf(f);
  return matches.flatMap(m => {
    if (m.kind !== "field" || !m.field.related) return [m];
    const extra = m.field.related
      .filter(k => !seen.has(k))
      .map(k => fields.find(f => f.key === k))
      .filter((f): f is FieldDef => Boolean(f));
    for (const f of extra) seen.add(f.key);
    return [m.field, ...extra]
      .sort((a, b) => order(a) - order(b))
      .map(field => ({ field, kind: "field" as const }));
  });
}

/**
 * Campos do anúncio do bloco: no bloco "Anúncio" são todos; nos blocos com anúncio embutido (ex.:
 * coluna lateral do feed), a lista de mídia (`adItemFields`) e os campos `adXxx` que a acompanham.
 */
function adFields(fields: FieldDef[]): FieldMatch[] {
  const isAdSlot = fields.some(
    f => f.key === "items" && f.itemFields === adItemFields
  );
  return fields
    .filter(
      f => isAdSlot || f.itemFields === adItemFields || /^ad[A-Z]/.test(f.key)
    )
    .map(field => ({ field, kind: "field" as const }));
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
      <div className="sbe-row">
        <button
          onClick={() =>
            onChange([
              ...items.slice(0, index + 1),
              structuredClone(item),
              ...items.slice(index + 1),
            ])
          }
          type="button"
        >
          Duplicar
        </button>
        <button
          onClick={() => onChange(items.filter((_, i) => i !== index))}
          type="button"
        >
          Remover
        </button>
      </div>
    </div>
  );
}

/**
 * Item repetido que vem do conteúdo do site (linhas de um feed de notícias, cards de posts). Num post,
 * "+1" duplica o post clicado (a cópia aparece logo abaixo dele); sem post, só aumenta a quantidade.
 */
function RepeatCount({
  field,
  onAdd,
  onChange,
  post,
  value,
}: {
  field: FieldDef;
  onAdd: () => void;
  onChange: (value: number) => void;
  post?: Post;
  value: number;
}) {
  return (
    <div className="sbe-list-item">
      <p className="sbe-hint">
        Este item se repete — {field.label}: {value}
      </p>
      <div className="sbe-row">
        <button onClick={onAdd} type="button">
          {post ? "+ Duplicar este item" : "+ Adicionar mais um"}
        </button>
        <button
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
          type="button"
        >
          − Um a menos
        </button>
      </div>
      <p className="sbe-hint">
        {post
          ? `Cria uma cópia de “${post.title}” logo abaixo. A cópia é um post novo: edite título, imagem e resumo aqui no painel e o texto completo no próprio post.`
          : "O novo item mostra o próximo conteúdo do site. Se não aparecer, não há mais."}
      </p>
    </div>
  );
}

export interface FocusHint {
  /** O item clicado está dentro de um espaço de anúncio: mostra os campos do anúncio do bloco. */
  ad?: boolean;
  /** Qual espaço publicitário global é (1 = faixas, 2 = lateral). */
  adKind?: AdKey;
  /** Endereço do link clicado, quando o item é (ou está dentro de) um link. */
  href?: string;
  /** Num item repetido, o endereço do primeiro link dele (o post ou a categoria que ele mostra). */
  itemHref?: string;
  /** Imagens e fundos empilhados no ponto clicado (de cima para baixo): acham o campo da imagem de uma seção ou de uma capa coberta. */
  under?: string[];
  /** Texto do elemento pai (um trecho em destaque dentro de um título só acha o campo pelo título inteiro). */
  parentText?: string;
  /** Links de cada contêiner acima do item (do mais próximo ao bloco): acham o post/categoria que ele mostra. */
  levels?: string[][];
  /** O item está numa lista cuja quantidade vem do campo `limit` do bloco (`data-repeat-list`). */
  repeat?: boolean;
  n: number;
  value: string;
}

interface Props {
  crumbs: { id?: string; label: string }[];
  elLabel?: string;
  elPath?: string;
  onMenu: (menu: Site["menu"]) => void;
  /** Muda uma prop de um bloco do conteúdo de um post (o corpo do post é desenhado pelo bloco do layout, sem camada própria). */
  onBlockProp: (blockId: string, key: string, value: unknown) => void;
  /** Post da página aberta no canvas (datas e capa do cabeçalho do post não têm link para ele). */
  currentPost?: Post;
  /** Muda título, capa, resumo, categoria ou data do post que o item clicado mostra. */
  onPost: (postId: string, patch: Partial<Post>, what: string) => void;
  /** Renomeia a categoria que o item clicado mostra. */
  onCategory: (categoryId: string, name: string) => void;
  /** Abre uma página/post do site no canvas (ex.: o post inteiro, para editar o texto). */
  onOpenPath: (path: string) => void;
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
  /** Alteração neste bloco de post que pode ir para os outros posts: mostra o botão de replicar. */
  onReplicate?: { run: () => void; targets: number };
  /** Duplica o post e muda a quantidade do bloco selecionado, num passo só (um Ctrl+Z desfaz). */
  onDuplicatePost: (postId: string, countKey: string, count: number) => void;
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

/**
 * Campos do post (e da categoria) que o item clicado mostra: o texto e a imagem dos cards vêm do post, não
 * do bloco, então são editados aqui (mesmos campos de Páginas → Posts).
 */
function SiteItemFields({
  category,
  onCategory,
  onOpenPath,
  onPost,
  onUpload,
  post,
  site,
}: {
  category?: Category;
  onCategory: (id: string, name: string) => void;
  onOpenPath: (path: string) => void;
  onPost: (id: string, patch: Partial<Post>, what: string) => void;
  onUpload?: (file: File) => Promise<string>;
  post?: Post;
  site: Site;
}) {
  return (
    <>
      {post ? (
        <div className="sbe-list-item">
          <p className="sbe-hint">
            Post: o texto e a imagem deste item vêm do post. Editar aqui muda em
            todos os lugares do site que mostram ele.
          </p>
          <FieldInput
            field={{ key: "title", kind: "text", label: "Título do post" }}
            onChange={v => onPost(post.id, { title: String(v) }, "Título")}
            value={post.title}
          />
          <FieldInput
            field={{
              key: "coverImage",
              kind: "image",
              label: "Imagem de capa",
            }}
            onChange={v =>
              onPost(post.id, { coverImage: v ? String(v) : null }, "Capa")
            }
            onUpload={onUpload}
            value={post.coverImage ?? ""}
          />
          <FieldInput
            field={{ key: "excerpt", kind: "textarea", label: "Resumo" }}
            onChange={v => onPost(post.id, { excerpt: String(v) }, "Resumo")}
            value={post.excerpt}
          />
          <FieldInput
            field={{
              key: "categoryId",
              kind: "select",
              label: "Categoria",
              options: [
                { label: "Sem categoria", value: "" },
                ...site.categories.map(c => ({ label: c.name, value: c.id })),
              ],
            }}
            onChange={v =>
              onPost(post.id, { categoryId: v ? String(v) : null }, "Categoria")
            }
            value={post.categoryId ?? ""}
          />
          <label className="sbe-field">
            <span>Data de publicação</span>
            <input
              onChange={e =>
                onPost(post.id, { publishedAt: e.target.value || null }, "Data")
              }
              type="date"
              value={post.publishedAt ?? ""}
            />
          </label>
          <div className="sbe-row">
            <button onClick={() => onOpenPath(postPath(post))} type="button">
              Abrir o post inteiro
            </button>
          </div>
        </div>
      ) : null}
      {category ? (
        <div className="sbe-list-item">
          <p className="sbe-hint">
            Categoria: o nome vale para o menu, os cards e a página da
            categoria.
          </p>
          <FieldInput
            field={{ key: "name", kind: "text", label: "Nome da categoria" }}
            onChange={v => onCategory(category.id, String(v))}
            value={category.name}
          />
        </div>
      ) : null}
    </>
  );
}

/** Espaço publicitário global (1 = faixas, 2 = lateral): imagens/vídeos, link e tempo; vale para todos os espaços do mesmo número. */
function GlobalAdFields({
  kind,
  onTheme,
  onUpload,
  site,
}: {
  kind: AdKey;
  onTheme: (patch: Record<string, string>, what: string) => void;
  onUpload?: (file: File) => Promise<string>;
  site: Site;
}) {
  const all = globalAds(site.theme);
  const cfg = all[kind];
  const save = (patch: Partial<typeof cfg>) =>
    onTheme(
      { adsConfig: JSON.stringify({ ...all, [kind]: { ...cfg, ...patch } }) },
      "Anúncios do site"
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h4 className="sbe-h">{AD_TITLES[kind]}</h4>
      <FieldInput
        field={{
          itemFields: adItemFields,
          key: "items",
          kind: "list",
          label: "Imagens e vídeos",
        }}
        onChange={v => save({ items: v as typeof cfg.items })}
        onUpload={onUpload}
        value={cfg.items}
      />
      <FieldInput
        field={{ key: "link", kind: "url", label: "Link" }}
        onChange={v => save({ link: String(v ?? "") })}
        value={cfg.link}
      />
      <FieldInput
        field={{ key: "seconds", kind: "number", label: "Segundos por imagem" }}
        onChange={v => save({ seconds: Number(v) || 6 })}
        value={cfg.seconds}
      />
    </div>
  );
}

/** Cores e conteúdo do tema que só existem em certos templates (`VARIANT_TOKENS`). */
function VariantSettings({
  onTheme,
  onUpload,
  site,
}: {
  onTheme: (patch: Record<string, string>, what: string) => void;
  onUpload?: (file: File) => Promise<string>;
  site: Site;
}) {
  const tokens = VARIANT_TOKENS[site.theme.variant ?? ""] ?? [];
  const colors = tokens.filter(t => t.kind === "color");
  const content = tokens.filter(t => t.kind !== "color");
  return (
    <>
      {colors.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h4 className="sbe-h">Cores do modelo</h4>
          <p className="sbe-hint">
            Cores específicas deste template (fundos, bordas, títulos…). Deixe
            vazio para voltar ao padrão.
          </p>
          {colors.map(tok => {
            const value = site.theme[tok.key] ?? "";
            const shown = value || tok.fallback;
            return (
              <div className="sbe-line" key={tok.key}>
                <span>{tok.label}</span>
                <input
                  aria-label={tok.label}
                  onChange={e =>
                    onTheme({ [tok.key]: e.target.value }, tok.label)
                  }
                  style={{ height: 28, padding: 0, width: 36 }}
                  type="color"
                  value={
                    /^#[0-9a-f]{6}/i.test(shown) ? shown.slice(0, 7) : "#000000"
                  }
                />
                <input
                  className="sbe-mono"
                  onChange={e =>
                    onTheme({ [tok.key]: e.target.value }, tok.label)
                  }
                  placeholder={tok.fallback}
                  type="text"
                  value={value}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      {content.map(tok => (
        <FieldInput
          field={{
            key: tok.key,
            kind: tok.kind === "image" ? "image" : "text",
            label: tok.label,
          }}
          key={tok.key}
          onChange={v => onTheme({ [tok.key]: String(v ?? "") }, tok.label)}
          onUpload={onUpload}
          value={site.theme[tok.key] ?? tok.fallback}
        />
      ))}
    </>
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
  onBlockProp,
  currentPost,
  onCategory,
  onOpenPath,
  onPost,
  onProp,
  onSelect,
  onSiteName,
  onStyle,
  onTheme,
  onResolveChannel,
  onUploadImage,
  onUploadFont,
  onDuplicatePost,
  onReplicate,
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
        ? matchItem(itemDef.fields, selected.props, itemDef.defaults, focusHint)
        : [],
    [focusHint?.n, selected?.id, elPath]
  );

  // Texto/imagem que vem de um post ou categoria do site (cards, destaques, listas): editados aqui mesmo.
  const siteItem = useMemo(
    () =>
      elPath
        ? resolveSiteItem(
            site,
            focusHint,
            itemMatches.length === 0,
            currentPost
          )
        : {},
    [
      focusHint?.n,
      selected?.id,
      elPath,
      site.posts,
      site.categories,
      currentPost?.id,
    ]
  );

  // Texto do corpo do post (parágrafos, títulos, listas): o bloco do layout o desenha sem camada própria,
  // então o campo vem do bloco de texto do próprio post.
  const postBlockHit = useMemo(() => {
    if (
      !(elPath && currentPost && focusHint?.value) ||
      siteItem.post ||
      siteItem.category
    )
      return undefined;
    const want = plain(focusHint.value);
    const walk = (
      blocks: Block[]
    ): { block: Block; matches: FieldMatch[] } | undefined => {
      for (const b of blocks) {
        const d = getBlockDefinition(b.type);
        if (d) {
          // Com campos do próprio bloco já achados, só vale o texto que está dentro de um trecho do post.
          const inside =
            want.length >= 8 &&
            d.fields.some(
              f =>
                f.kind !== "list" &&
                plain(b.props[f.key] ?? d.defaults[f.key]).includes(want)
            );
          if (inside || itemMatches.length === 0) {
            const matches = matchItem(d.fields, b.props, d.defaults, focusHint);
            if (matches.length > 0) return { block: b, matches };
          }
        }
        const deep = walk(b.children ?? []);
        if (deep) return deep;
      }
      return undefined;
    };
    return walk(currentPost.blocks);
  }, [
    focusHint?.n,
    selected?.id,
    elPath,
    currentPost,
    siteItem.post,
    siteItem.category,
  ]);

  // O texto clicado é o nome de um item do menu (ou de um subitem): vale o painel "Menu do site".
  const menuHit = (() => {
    const want = (focusHint?.value ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (!(elPath && want)) return false;
    return site.menu.some(m =>
      [m.label, ...(m.children ?? []).map(c => c.label)].some(
        l => l.replace(/\s+/g, " ").trim().toLowerCase() === want
      )
    );
  })();

  // Item repetido que não vem de uma lista do bloco: oferece mudar a quantidade (campo `limit`).
  const countField = itemDef?.fields.find(
    f => f.key === "limit" && f.kind === "number"
  );
  const countValue = Number(
    selected?.props.limit ?? itemDef?.defaults.limit ?? 0
  );
  const repeatCount =
    elPath &&
    focusHint?.repeat &&
    countField &&
    countValue > 0 &&
    !itemMatches.some(m => m.kind === "item")
      ? {
          field: countField,
          post: site.posts.find(p => postPath(p) === focusHint.itemHref),
          value: countValue,
        }
      : undefined;

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
              para enviar mídia só dele, ou configure abaixo o Espaço
              publicitário 1 (faixas) e os 2, 3 e 4 (coluna lateral): alterar um
              muda todos os espaços do mesmo número.
            </p>
            {site.theme.ads === "on"
              ? AD_KEYS.map(kind => (
                  <GlobalAdFields
                    key={kind}
                    kind={kind}
                    onTheme={onTheme}
                    onUpload={onUploadImage}
                    site={site}
                  />
                ))
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
            <VariantSettings
              onTheme={onTheme}
              onUpload={onUploadImage}
              site={site}
            />
            <FieldInput
              field={{
                key: "seoDescription",
                kind: "textarea",
                label: "Descrição do site (aparece no Google)",
              }}
              onChange={v =>
                onTheme(
                  { seoDescription: String(v ?? "") },
                  "Descrição do site"
                )
              }
              value={site.theme.seoDescription ?? ""}
            />
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
        {onReplicate ? (
          <div className="sbe-replicate">
            <p className="sbe-hint">
              Você alterou a aparência deste bloco neste post.
            </p>
            <button onClick={onReplicate.run} type="button">
              <Icon name="copy" size={13} />
              Replicar nos outros posts ({onReplicate.targets})
            </button>
          </div>
        ) : null}
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
            {repeatCount ? (
              <RepeatCount
                field={repeatCount.field}
                onAdd={() =>
                  repeatCount.post
                    ? onDuplicatePost(
                        repeatCount.post.id,
                        repeatCount.field.key,
                        repeatCount.value + 1
                      )
                    : onProp(repeatCount.field.key, repeatCount.value + 1)
                }
                onChange={v => onProp(repeatCount.field.key, v)}
                post={repeatCount.post}
                value={repeatCount.value}
              />
            ) : null}
            {postBlockHit ? (
              <div className="sbe-list-item">
                <p className="sbe-hint">
                  Texto do post: este trecho faz parte do conteúdo do post
                  aberto.
                </p>
                {postBlockHit.matches.map(m =>
                  m.kind === "field" ? (
                    <FieldInput
                      field={m.field}
                      key={m.field.key}
                      onChange={v =>
                        onBlockProp(postBlockHit.block.id, m.field.key, v)
                      }
                      onResolveChannel={onResolveChannel}
                      onUpload={onUploadImage}
                      value={
                        postBlockHit.block.props[m.field.key] ??
                        getBlockDefinition(postBlockHit.block.type)?.defaults[
                          m.field.key
                        ]
                      }
                    />
                  ) : null
                )}
              </div>
            ) : null}
            {itemMatches.length > 0 && def && !postBlockHit ? (
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
            ) : repeatCount ||
              siteItem.post ||
              siteItem.category ||
              postBlockHit ? null : (
              <p className="sbe-hint">
                {menuHit ||
                (elLabel === "link" &&
                  (selected.type === "header" || selected.type === "footer"))
                  ? "Os links do menu ficam em “Menu do site”, logo abaixo."
                  : focusHint?.ad
                    ? "Este espaço usa o anúncio global do site (vale para todos os espaços do mesmo número). Edite as imagens e o link logo abaixo."
                    : "Este item não tem texto ou imagem próprios para editar aqui. Para o conteúdo do bloco, selecione o bloco no caminho acima."}
              </p>
            )}
            {siteItem.post || siteItem.category ? (
              <SiteItemFields
                category={siteItem.category}
                onCategory={onCategory}
                onOpenPath={onOpenPath}
                onPost={onPost}
                onUpload={onUploadImage}
                post={siteItem.post}
                site={site}
              />
            ) : null}
            {focusHint?.ad && focusHint.adKind && itemMatches.length === 0 ? (
              <GlobalAdFields
                kind={focusHint.adKind}
                onTheme={onTheme}
                onUpload={onUploadImage}
                site={site}
              />
            ) : null}
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

        {(selected.type === "header" ||
          selected.type === "footer" ||
          (elPath && menuHit)) &&
        (!elPath ||
          ((elLabel === "link" || menuHit) && itemMatches.length === 0)) ? (
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
          {(
            [
              ["enterTablet", "Efeito no tablet (768–1024px)"],
              ["enterMobile", "Efeito no celular (até 767px)"],
            ] as const
          ).map(([key, label]) => (
            <div className="sbe-field" key={key}>
              <span>{label}</span>
              <select
                onChange={e =>
                  onFx(
                    { [key]: (e.target.value || undefined) as EnterScreen },
                    label
                  )
                }
                value={fx[key] ?? ""}
              >
                <option value="">
                  {key === "enterMobile"
                    ? "Igual ao tablet"
                    : "Igual ao computador"}
                </option>
                <option value="none">Nenhum nesta tela</option>
                {ENTER_EFFECTS.map(k => (
                  <option key={k} value={k}>
                    {ENTER_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {fx.enter || fx.enterTablet || fx.enterMobile ? (
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
          {fx.parallax ? (
            <div className="sbe-line">
              <span>Parallax só no computador</span>
              <button
                className={
                  fx.parallaxScreens === "desktop"
                    ? "sbe-toggle on"
                    : "sbe-toggle"
                }
                onClick={() =>
                  onFx(
                    {
                      parallaxScreens:
                        fx.parallaxScreens === "desktop"
                          ? undefined
                          : "desktop",
                    },
                    "Parallax só no computador"
                  )
                }
                type="button"
              >
                <span />
              </button>
            </div>
          ) : null}
          <Slider
            label="Seguir o mouse (negativo = ao contrário)"
            max={10}
            min={-10}
            onChange={v => onFx({ mouse: v || undefined }, "Seguir o mouse")}
            value={fx.mouse ?? 0}
          />
          {fx.enter === "pulse" ? (
            <div className="sbe-line">
              <span>Pulsar sem parar</span>
              <button
                className={fx.loop ? "sbe-toggle on" : "sbe-toggle"}
                onClick={() =>
                  onFx({ loop: fx.loop ? undefined : true }, "Pulso em loop")
                }
                type="button"
              >
                <span />
              </button>
            </div>
          ) : null}
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
          {fx.enter ||
          fx.enterTablet ||
          fx.enterMobile ||
          fx.hover ||
          fx.parallax ||
          fx.mouse ||
          fx.count ? (
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
              {fx.each && (fx.enter || fx.enterTablet || fx.enterMobile) ? (
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
                      enterMobile: undefined,
                      enterTablet: undefined,
                      hover: undefined,
                      hoverMs: undefined,
                      mouse: undefined,
                      parallax: undefined,
                      parallaxScreens: undefined,
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
            Entrada, parallax, seguir o mouse e contador aparecem na prévia e no
            site publicado; no editor o conteúdo fica parado para facilitar a
            edição.
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
          {(
            [
              ["hoverBackground", "Fundo ao passar o mouse", TEXT_PALETTE],
              ["hoverColor", "Cor do texto ao passar o mouse", TEXT_PALETTE],
              [
                "hoverBorderColor",
                "Cor da borda ao passar o mouse",
                TEXT_PALETTE,
              ],
            ] as const
          ).map(([key, label, colors]) => (
            <div className="sbe-field" key={key}>
              <span>{label}</span>
              <Swatches
                active={st[key] as string | undefined}
                colors={colors}
                onPick={c => set(key, label)(c)}
                resolve={resolve}
              />
              <input
                className="sbe-mono"
                onChange={e => set(key, label)(e.target.value)}
                placeholder="sem mudança"
                type="text"
                value={st[key] ?? ""}
              />
            </div>
          ))}
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
