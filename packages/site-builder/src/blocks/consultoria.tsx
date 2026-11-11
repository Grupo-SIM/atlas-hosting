import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, newTab } from "./helpers.js";
import { int, str, yesNo } from "./sim-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos da página de vendas "Consultoria Financeira" (prefixo `cf`, escopo `.sb-cf`, CSS em `renderer/consultoria.ts`).
 * Todo texto, imagem e link é prop. Oferta, FAQ e rodapé são os blocos comuns `ebook*` (`blocks/ebook.tsx`).
 *
 * **Título em duas fontes** (`Title`): `*trecho*` sai na serifada itálica (`<em class="cf-it">`) e `\n` quebra a linha (cada
 * linha é um `span.cf-l`, então `fx` com `each` entra linha por linha). O resto do texto é escapado; sem HTML no campo.
 * **Texto**: `**negrito**` e `__sublinhado__`. **Textura** (`texture`, o "wireframe" `68.png`): vira `--cf-tex` no bloco e
 * entra por `::before` nos cartões `.cf-tex`. **Editor**: no modo edição os blocos com animação própria (ondas do play)
 * ganham `cf-static`; os contadores já trazem o valor final no texto.
 *
 * Ordem dos filhos (`1` = a seção; só existem os elementos preenchidos, os seguintes sobem):
 * - `cfHero`: `1.1` conteúdo (`.1` frase, `.2` h1; `1.1.2.N` = linha N; em cada linha, os pedaços em ordem — com a pílula de
 *   imagem entrando **antes do 1º trecho em itálico** da 1ª linha e o botão de play **no fim da última** linha).
 * - `cfStats`: `1.1` grade; `1.1.N` = cartão N (`.1` rótulo, `.2` número + sufixo).
 * - `cfAbout`: `1.1` metade da foto, `1.2` metade do texto (`.1` título — cada linha é um filho —, `.2` texto, `.3` linha de ação
 *   com `.1` botão e `.2` autor, `.4` divisória, `.5` caixa de ícones; `1.2.5.N` = item N).
 * - `cfServices`: `1.1` conteúdo (`.1` título, `.2` texto, `.3` grade; `1.1.3.N` = cartão N: `.1` ícone, `.2` título, `.3` texto).
 * - `cfWordStrip`: `1.1` linha; `1.1.N` = coluna N.
 * - `cfBonus`: `1.1` parte dos cartões (`.1` conteúdo: `.1` cabeçalho — `.1` título, `.2` coluna da direita com `.1` texto e `.2`
 *   botão —, `.2` grade; `1.1.1.2.N` = cartão N), `1.2` faixa "e muito mais…".
 * - `cfTopics`: `1.1` conteúdo (`.1` título, `.2` texto, `.3` colunas; `1.1.3.1`/`1.1.3.2` = esquerda/direita, filhos = cartões).
 * - `cfTestimonials`: `1.1` conteúdo (`.1` cabeçalho — `.1` título, `.2` direita —, `.2` linha; `1.1.2.N` = cartão N).
 */

const cls = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

const list = <T extends z.ZodRawShape>(shape: T) =>
  z.array(z.object(shape)).default([]).catch([]);

/** `**negrito**` e `__sublinhado__` no meio de um texto. */
function rich(text: string): ReactNode {
  if (!(text.includes("**") || text.includes("__"))) return text;
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__)/).map((t, i) => {
    if (t.startsWith("**") && t.endsWith("**") && t.length > 4)
      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
      return <strong key={i}>{rich(t.slice(2, -2))}</strong>;
    if (t.startsWith("__") && t.endsWith("__") && t.length > 4)
      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
      return <u key={i}>{t.slice(2, -2)}</u>;
    return t;
  });
}

/* ───────────────────────── ícones ───────────────────────── */

const ICON_PATHS: Record<string, ReactNode> = {
  blocks: (
    <>
      <rect height="8" rx="1" width="8" x="3" y="3" />
      <rect height="8" rx="1" width="8" x="13" y="3" />
      <rect height="8" rx="1" width="8" x="3" y="13" />
      <path d="M13 17h8m-4-4v8" />
    </>
  ),
  contract: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  family: (
    <>
      <circle cx="7" cy="6" r="3" />
      <circle cx="17" cy="6" r="3" />
      <circle cx="12" cy="14" r="2.2" />
      <path d="M2 21v-3a4 4 0 0 1 4-4h2m8 0h2a4 4 0 0 1 4 4v3M9 21v-2a3 3 0 0 1 6 0v2" />
    </>
  ),
  "money-bag": (
    <>
      <path d="M9 3h6l-1.5 3h-3z" />
      <path d="M8.5 6C5 9 4 13 4 16a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5c0-3-1-7-4.5-10" />
      <path d="M12 10v8m2-6.5c-.5-.6-1.2-.8-2-.8s-2 .4-2 1.4 1 1.3 2 1.6 2 .6 2 1.6-1.2 1.4-2 1.4-1.5-.3-2-.9" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-30 12 12)" />
      <circle cx="19" cy="7" fill="currentColor" r="1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" fill="currentColor" r="1.2" />
    </>
  ),
  umbrella: (
    <>
      <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" />
      <path d="M12 12v6a2 2 0 0 0 4 0M12 3V2" />
    </>
  ),
  "user-clock": (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h2" />
      <circle cx="17" cy="17" r="4" />
      <path d="M17 15v2l1.2 1" />
    </>
  ),
};

export const CF_ICON_NAMES = Object.keys(ICON_PATHS) as [string, ...string[]];
const ICON_OPTIONS = [
  { label: "Pessoa com relógio", value: "user-clock" },
  { label: "Blocos", value: "blocks" },
  { label: "Família", value: "family" },
  { label: "Órbita", value: "orbit" },
  { label: "Contrato", value: "contract" },
  { label: "Alvo", value: "target" },
  { label: "Guarda-sol", value: "umbrella" },
  { label: "Saco de dinheiro", value: "money-bag" },
  { label: "Olho", value: "eye" },
];

const iconName = z.enum(CF_ICON_NAMES).default("target").catch("target");

function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" className="cf-ic" viewBox="0 0 24 24">
      {ICON_PATHS[name] ?? ICON_PATHS.target}
    </svg>
  );
}

const Star = () => (
  <svg aria-hidden="true" className="cf-ic fill" viewBox="0 0 24 24">
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z" />
  </svg>
);

/* ───────────────────────── peças comuns ───────────────────────── */

/** `*trecho*` → itálico serifado. */
function emph(line: string): ReactNode[] {
  return line.split(/(\*[^*\n]+\*)/).map((t, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
      <em className="cf-it" key={i}>
        {t.slice(1, -1)}
      </em>
    ) : (
      t
    )
  );
}

/** Título em duas fontes: `*itálico*` e `\n` (cada linha num `span.cf-l`). */
function Title({
  center,
  className,
  text,
}: {
  center?: boolean;
  className?: string;
  text: string;
}) {
  return (
    <h2 className={cls("cf-h cf-h2", center && "cf-center", className)}>
      {text.split("\n").map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade da linha
        <span className="cf-l" key={i}>
          {emph(line)}
        </span>
      ))}
    </h2>
  );
}

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8m-3-3 3 3-3 3" />
  </svg>
);

/** Botão em pílula (ou o link ciano, sem fundo) com a seta em círculo depois do texto. */
function Btn({
  ctx,
  label,
  link,
  url,
}: {
  ctx: RenderContext;
  label: string;
  link?: boolean;
  url: string;
}) {
  if (!label) return null;
  return (
    <a
      className={cls("cf-btn", link && "link")}
      href={href(ctx, url)}
      {...newTab(url)}
    >
      <span>{label}</span>
      <Arrow />
    </a>
  );
}

const texStyle = (texture: string) =>
  (texture ? { "--cf-tex": cssUrl(texture) } : {}) as CSSProperties;

/** Cabeçalho dividido (título à esquerda; texto + botão à direita), igual nos bônus e nos depoimentos. */
function SplitHead({
  ctx,
  label,
  text,
  title,
  url,
}: {
  ctx: RenderContext;
  label: string;
  text: string;
  title: string;
  url: string;
}) {
  return (
    <div className="cf-split">
      <Title className="cf-split-l" text={title} />
      <div className="cf-split-r">
        {text ? <p className="cf-p">{text}</p> : null}
        <Btn ctx={ctx} label={label} url={url} />
      </div>
    </div>
  );
}

const splitSchema = {
  buttonLabel: str("Adquirir Consultoria"),
  buttonUrl: str("#d1"),
  text: str(),
  title: str(),
};
const splitFields: FieldDef[] = [
  {
    key: "title",
    kind: "textarea",
    label: "Título (*itálico*; uma linha por linha)",
  },
  { key: "text", kind: "textarea", label: "Texto ao lado do título" },
  { key: "buttonLabel", kind: "text", label: "Texto do botão" },
  { key: "buttonUrl", kind: "url", label: "Link do botão" },
];

const textureField: FieldDef = {
  key: "texture",
  kind: "image",
  label: "Textura dos cartões (wireframe)",
};

/* ───────────────────────── hero ───────────────────────── */

const cfHero = defineBlock(
  z.object({
    bg: str(),
    intro: str(),
    pill: str(),
    playLabel: str("Assistir ao vídeo"),
    title: str("GESTÃO *FINANCEIRA*\nFÁCIL *E SEGURA*"),
    videoUrl: str(),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título (*itálico*; uma linha por linha)",
      },
      { key: "intro", kind: "textarea", label: "Frase acima do título" },
      { key: "pill", kind: "image", label: "Imagem da pílula (1ª linha)" },
      {
        key: "videoUrl",
        kind: "url",
        label: "Vídeo do botão de play (YouTube ou Vimeo; abre em popup)",
      },
      { key: "playLabel", kind: "text", label: "Texto alternativo do play" },
      { key: "bg", kind: "image", label: "Textura de ondas do fundo" },
    ],
    group: "layout",
    label: "Hero (Consultoria Financeira)",
    render: (p, ctx) => {
      const embed = popupVideoEmbed(p.videoUrl);
      const lines = p.title.split("\n");
      const last = lines.length - 1;
      return (
        <section
          className={cls("cf-sec cf-hero", ctx.mode === "edit" && "cf-static")}
          style={
            {
              ...(p.bg ? { "--cf-wave": cssUrl(p.bg) } : {}),
              ...(p.pill ? { "--cf-pill": cssUrl(p.pill) } : {}),
            } as CSSProperties
          }
        >
          <div className="cf-in cf-hero-in">
            {p.intro ? <p className="cf-hero-p">{p.intro}</p> : null}
            <h1 className="cf-hero-h">
              {lines.map((line, i) => {
                const parts = line
                  .split(/(\*[^*\n]+\*)/)
                  .map((t, k) => ({
                    it: k % 2 === 1,
                    s: k % 2 ? t.slice(1, -1) : t,
                  }))
                  .filter(t => t.s.trim() !== "");
                const pillAt =
                  i === 0 && p.pill ? parts.findIndex(t => t.it) : -2;
                const nodes: ReactNode[] = [];
                parts.forEach((t, k) => {
                  if (pillAt === k)
                    nodes.push(<span className="cf-pill" key="pill" />);
                  nodes.push(
                    t.it ? (
                      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
                      <em className="cf-it" key={k}>
                        {t.s.trim()}
                      </em>
                    ) : (
                      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
                      <span className="cf-t" key={k}>
                        {t.s.trim()}
                      </span>
                    )
                  );
                });
                // pílula sem trecho em itálico na linha: vai para o fim
                if (i === 0 && p.pill && pillAt === -1)
                  nodes.push(<span className="cf-pill" key="pill" />);
                if (i === last && p.videoUrl)
                  nodes.push(
                    <a
                      aria-label={p.playLabel}
                      className="cf-play"
                      data-sb-video={embed ?? undefined}
                      href={href(ctx, p.videoUrl)}
                      key="play"
                      {...newTab(p.videoUrl)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M7 4.5v15l13-7.5z" />
                      </svg>
                    </a>
                  );
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade da linha
                  <span className={`cf-hl cf-hl-${i + 1}`} key={i}>
                    {nodes}
                  </span>
                );
              })}
            </h1>
          </div>
        </section>
      );
    },
    type: "cfHero",
  }
);

/* ───────────────────────── números ───────────────────────── */

const cfStats = defineBlock(
  z.object({
    items: list({
      highlight: yesNo("no"),
      label: str(),
      suffix: str("%"),
      value: str("0"),
    }),
    ms: int(200, 10000, 2000),
    texture: str(),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "label", kind: "text", label: "Rótulo" },
          { key: "value", kind: "text", label: "Valor final (número)" },
          { key: "suffix", kind: "text", label: "Depois do número (ex.: %)" },
          {
            key: "highlight",
            kind: "select",
            label: "Cartão",
            options: [
              { label: "Padrão", value: "no" },
              { label: "Em destaque (degradê e textura)", value: "yes" },
            ],
          },
        ],
        key: "items",
        kind: "list",
        label: "Números",
      },
      { key: "ms", kind: "number", label: "Duração da contagem (ms)" },
      textureField,
    ],
    group: "content",
    label: "Números com contador (cartões)",
    render: p => (
      <section className="cf-sec cf-stats" style={texStyle(p.texture)}>
        <div className="cf-in cf-stats-grid">
          {p.items.map((it, i) => {
            const n = Number(it.value.replace(",", "."));
            const counts = it.value.trim() !== "" && Number.isFinite(n);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
              <div
                className={cls(
                  "cf-stat",
                  it.highlight === "yes" && "hl cf-tex"
                )}
                key={i}
              >
                <h2 className="cf-h6">{it.label}</h2>
                <div className="cf-num">
                  <span
                    className="cf-n"
                    data-ms={counts ? p.ms : undefined}
                    data-sb-count={counts ? n : undefined}
                  >
                    {it.value}
                  </span>
                  {it.suffix ? (
                    <span className="cf-pc">{it.suffix}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    ),
    type: "cfStats",
  }
);

/* ───────────────────────── você merece… ───────────────────────── */

const cfAbout = defineBlock(
  z.object({
    authorName: str(),
    authorPhoto: str(),
    authorRole: str(),
    buttonLabel: str("Adquirir Consultoria"),
    buttonUrl: str("#d1"),
    items: list({ icon: iconName, text: str(), title: str() }),
    photo: str(),
    photoAlt: str(),
    text: str(),
    texture: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "photo", kind: "image", label: "Foto (encostada embaixo)" },
      { key: "photoAlt", kind: "text", label: "Texto alternativo da foto" },
      {
        key: "title",
        kind: "textarea",
        label: "Título (*itálico*; uma linha por linha)",
      },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (**negrito**, __sublinhado__)",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "authorPhoto", kind: "image", label: "Foto do autor" },
      { key: "authorName", kind: "text", label: "Nome do autor" },
      { key: "authorRole", kind: "text", label: "Cargo do autor" },
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Caixa de ícones",
      },
      textureField,
    ],
    group: "layout",
    label: "Foto + texto, autor e caixa de ícones",
    render: (p, ctx) => (
      <section className="cf-sec cf-about" style={texStyle(p.texture)}>
        <div className="cf-ab-photo">
          <div className="cf-ab-photo-in">
            <Img alt={p.photoAlt} src={p.photo} />
          </div>
        </div>
        <div className="cf-ab-text">
          {p.title ? <Title text={p.title} /> : null}
          {p.text ? <p className="cf-p">{rich(p.text)}</p> : null}
          <div className="cf-ab-act">
            <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
            {p.authorName || p.authorPhoto ? (
              <div className="cf-author">
                {p.authorPhoto ? (
                  <Img alt={p.authorName} src={p.authorPhoto} />
                ) : null}
                <div>
                  <b>{p.authorName}</b>
                  {p.authorRole ? <span>{p.authorRole}</span> : null}
                </div>
              </div>
            ) : null}
          </div>
          <hr className="cf-ab-hr" />
          {p.items.length ? (
            <div className="cf-ab-box cf-tex">
              {p.items.map((it, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do item
                <div className="cf-ab-item" key={i}>
                  <span className="cf-ab-ic">
                    <Icon name={it.icon} />
                  </span>
                  <div>
                    <h3 className="cf-h6">{it.title}</h3>
                    <p className="cf-p">{it.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    ),
    type: "cfAbout",
  }
);

/* ───────────────────────── estratégias ───────────────────────── */

const cfServices = defineBlock(
  z.object({
    items: list({ icon: iconName, text: str(), title: str() }),
    text: str(),
    texture: str(),
    title: str("*estratégias que* funcionam na prática"),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título (*itálico*)" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
      textureField,
    ],
    group: "content",
    label: "Estratégias (grade de cartões com ícone)",
    render: p => (
      <section className="cf-sec cf-svc" style={texStyle(p.texture)}>
        <div className="cf-in">
          {p.title ? <Title center text={p.title} /> : null}
          {p.text ? <p className="cf-p cf-svc-p">{p.text}</p> : null}
          <div className="cf-svc-grid">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
              <div className="cf-svc-card cf-tex" key={i}>
                <span className="cf-svc-ic">
                  <Icon name={it.icon} />
                </span>
                <h3 className="cf-h3">{it.title}</h3>
                <p className="cf-p cf-svc-p2">{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "cfServices",
  }
);

/* ───────────────────────── faixa de palavras ───────────────────────── */

const cfWordStrip = defineBlock(
  z.object({ items: list({ alt: str(), image: str() }) }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Texto alternativo (a palavra)" },
        ],
        key: "items",
        kind: "list",
        label: "Palavras",
      },
    ],
    group: "content",
    label: "Faixa de palavras (imagens que acendem)",
    render: p => (
      <section className="cf-sec cf-ws">
        <div className="cf-in cf-ws-row">
          {p.items.map((it, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade da coluna
            <div className="cf-ws-col" key={i}>
              <Img alt={it.alt} className="cf-ws-img" src={it.image} />
            </div>
          ))}
        </div>
      </section>
    ),
    type: "cfWordStrip",
  }
);

/* ───────────────────────── bônus ───────────────────────── */

const cfBonus = defineBlock(
  z.object({
    ...splitSchema,
    items: list({ image: str(), title: str() }),
    linkLabel: str("Adquirir"),
    linkUrl: str("#d1"),
    moreImage: str(),
    moreOpacity: int(0, 100, 47),
    moreTitle: str("e muito mais..."),
    overlap: int(0, 600, 270),
    tag: str("Bônus Exclusivo"),
  }),
  {
    fields: [
      ...splitFields,
      { key: "tag", kind: "text", label: "Etiqueta da imagem (★ + texto)" },
      { key: "linkLabel", kind: "text", label: "Texto do link dos cartões" },
      { key: "linkUrl", kind: "url", label: "Link dos cartões" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "title", kind: "text", label: "Título" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões de bônus",
      },
      { key: "moreTitle", kind: "text", label: "Título da faixa de baixo" },
      { key: "moreImage", kind: "image", label: "Textura da faixa de baixo" },
      {
        key: "moreOpacity",
        kind: "number",
        label: "Opacidade da textura (%)",
      },
      {
        key: "overlap",
        kind: "number",
        label: "Quanto os cartões entram na faixa (px)",
      },
    ],
    group: "layout",
    label: "Bônus (cartões sobre a faixa 'e muito mais…')",
    render: (p, ctx) => (
      <section
        className="cf-sec cf-bonus"
        style={
          {
            "--cf-more-o": p.moreOpacity / 100,
            "--cf-ov": `${p.overlap}px`,
            ...(p.moreImage ? { "--cf-more-img": cssUrl(p.moreImage) } : {}),
          } as CSSProperties
        }
      >
        <div className="cf-bn-top">
          <div className="cf-in">
            <SplitHead
              ctx={ctx}
              label={p.buttonLabel}
              text={p.text}
              title={p.title}
              url={p.buttonUrl}
            />
            <div className="cf-bn-grid">
              {p.items.map((it, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
                <div className="cf-bn-card" key={i}>
                  <div
                    className="cf-bn-img"
                    style={
                      it.image
                        ? ({ "--cf-bn-img": cssUrl(it.image) } as CSSProperties)
                        : undefined
                    }
                  >
                    {p.tag ? (
                      <span className="cf-bn-tag">
                        <Star />
                        {p.tag}
                      </span>
                    ) : null}
                  </div>
                  <div className="cf-bn-foot">
                    <h3 className="cf-h3">{it.title}</h3>
                    <Btn ctx={ctx} label={p.linkLabel} link url={p.linkUrl} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="cf-more">
          <div className="cf-in">
            {p.moreTitle ? <Title center text={p.moreTitle} /> : null}
          </div>
        </div>
      </section>
    ),
    type: "cfBonus",
  }
);

/* ───────────────────────── simples, direto, eficaz ───────────────────────── */

const cfTopics = defineBlock(
  z.object({
    items: list({
      column: z.enum(["left", "right"]).default("left").catch("left"),
      icon: iconName,
      text: str(),
      title: str(),
    }),
    linkLabel: str("Adquirir consultoria"),
    linkUrl: str("#d1"),
    text: str(),
    title: str("simples. *direto.* Eficaz."),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título (*itálico*)" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "linkLabel", kind: "text", label: "Texto do link dos cartões" },
      { key: "linkUrl", kind: "url", label: "Link dos cartões" },
      {
        itemFields: [
          {
            key: "column",
            kind: "select",
            label: "Coluna",
            options: [
              { label: "Esquerda", value: "left" },
              { label: "Direita", value: "right" },
            ],
          },
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Tópicos",
      },
    ],
    group: "content",
    label: "Tópicos (2 colunas de cartões horizontais)",
    render: (p, ctx) => {
      const card = (it: (typeof p.items)[number], i: number) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
        <div className="cf-tp-card" key={i}>
          <div className="cf-tp-ic">
            <i>
              <Icon name={it.icon} />
            </i>
          </div>
          <div className="cf-tp-body">
            <h3 className="cf-h4">{it.title}</h3>
            <p className="cf-p">{it.text}</p>
            <Btn ctx={ctx} label={p.linkLabel} link url={p.linkUrl} />
          </div>
        </div>
      );
      return (
        <section className="cf-sec cf-tp">
          <div className="cf-in">
            {p.title ? <Title center text={p.title} /> : null}
            {p.text ? <p className="cf-p cf-tp-p">{p.text}</p> : null}
            <div className="cf-tp-cols">
              <div className="cf-tp-col l">
                {p.items.filter(it => it.column !== "right").map(card)}
              </div>
              <div className="cf-tp-col r">
                {p.items.filter(it => it.column === "right").map(card)}
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "cfTopics",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const cfTestimonials = defineBlock(
  z.object({
    ...splitSchema,
    items: list({
      featured: yesNo("no"),
      hideTablet: yesNo("no"),
      name: str(),
      photo: str(),
      text: str(),
    }),
    texture: str(),
  }),
  {
    fields: [
      ...splitFields,
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome" },
          { key: "photo", kind: "image", label: "Foto" },
          { key: "text", kind: "textarea", label: "Depoimento" },
          {
            key: "featured",
            kind: "select",
            label: "Cartão",
            options: [
              { label: "Padrão", value: "no" },
              { label: "Em destaque (degradê e textura)", value: "yes" },
            ],
          },
          {
            key: "hideTablet",
            kind: "select",
            label: "No tablet",
            options: [
              { label: "Mostrar", value: "no" },
              { label: "Esconder", value: "yes" },
            ],
          },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
      textureField,
    ],
    group: "content",
    label: "Depoimentos (cartões fixos)",
    render: (p, ctx) => (
      <section className="cf-sec cf-ts" style={texStyle(p.texture)}>
        <div className="cf-in">
          <SplitHead
            ctx={ctx}
            label={p.buttonLabel}
            text={p.text}
            title={p.title}
            url={p.buttonUrl}
          />
          <div className="cf-ts-row">
            {p.items.map((it, i) => (
              <figure
                className={cls(
                  "cf-ts-card",
                  it.featured === "yes" && "hl cf-tex",
                  it.hideTablet === "yes" && "cf-hide-t"
                )}
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
                key={i}
              >
                <svg
                  aria-hidden="true"
                  className="cf-quote cf-ic fill"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 21c3 0 5-2 5-5H5v-7h6v7c0 4-3 7-8 7zm10 0c3 0 5-2 5-5h-3v-7h6v7c0 4-3 7-8 7z" />
                </svg>
                <blockquote className="cf-p">{it.text}</blockquote>
                <div aria-hidden="true" className="cf-stars">
                  {[0, 1, 2, 3, 4].map(n => (
                    <Star key={n} />
                  ))}
                </div>
                {it.photo ? <Img alt={it.name} src={it.photo} /> : null}
                {it.name ? (
                  <figcaption className="cf-ts-name">{it.name}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "cfTestimonials",
  }
);

export const consultoriaBlocks: BlockDefinition[] = [
  cfHero,
  cfStats,
  cfAbout,
  cfServices,
  cfWordStrip,
  cfBonus,
  cfTopics,
  cfTestimonials,
];
