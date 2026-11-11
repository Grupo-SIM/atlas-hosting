import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { BackgroundVideo } from "./shapes.js";
import { carFields, carSchema, int, lines, SiCar, str } from "./sim-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos da página de vendas "Academia do Corte" (prefixo `ac`, escopo `.sb-ac`, CSS em `renderer/corte.ts`).
 * Todo texto, imagem e link é prop. Oferta, FAQ e rodapé são os blocos comuns `ebook*` (`blocks/ebook.tsx`).
 *
 * **Véu verde** (prop comum `veilColor`/`veilAngle`/`veilOpacity` → `--ac-veil-*`): `div.ac-veil` absoluto com
 * `linear-gradient(<ângulo>deg, transparent 20%, <cor> 100%)`. **Marca d'água** (`mark`/`markOpacity`): `div.ac-mark`.
 * Camadas decorativas (vídeo de fundo, véu, marca d'água, retângulo verde) ficam **depois** do conteúdo e são absolutas,
 * então não deslocam os caminhos de `Block.fx`. Elementos sem texto/imagem não saem (os filhos seguintes sobem).
 *
 * Ordem dos filhos (`1` = a seção):
 * - `acHero`: `1.1` conteúdo (`.1` logo, `.2` h1, `.3` h2, `.4` texto, `.5` botão), `1.2` vídeo de fundo, `1.3` véu.
 * - `acFeatures`: `1.1` grade; `1.1.N` = cartão N (`.1` círculo com o ícone, `.2` título, `.3` texto).
 * - `acAbout`: `1.1` coluna da foto (`.1` foto, `.2` retângulo), `1.2` coluna do texto (`.1` título, `.2` texto, `.3` pergunta,
 *   `.4` botões, `.5` divisória, `.6` contadores; `1.2.6.N` = contador N: `.1` ícone, `.2` número, `.3` título, `.4` texto).
 * - `acVideo`: `1.1` título, `1.2` capa.
 * - `acBanner`: `1.1` conteúdo (`.1` título, `.2` segundo título, `.3` botão), `1.2` véu.
 * - `acCurriculum`: `1.1` cabeçalho, `1.2` grade (`1.2.N` = item N), `1.3` fechamento, `1.4` marca d'água.
 * - `acInstructor`: `1.1` cabeçalho (`.1` título, `.2` texto), `1.2` divisória, `1.3` mosaico (`1.3.N` = foto N).
 * - `acReviews`: `1.1` cabeçalho, `1.2` carrossel, `1.3` marca d'água.
 * - `acGuarantee`: `1.1` cabeçalho (`.1` título, `.2` texto), `1.2` linha (`.1` cartão de oferta — o filho —, `.2` caixa de
 *   chamada), `1.3` véu.
 */

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;
const color = (d: string) => z.string().regex(COLOR).default(d).catch(d);
const safeColor = (v: string, d: string) => (COLOR.test(v) ? v : d);

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
      return <strong key={i}>{t.slice(2, -2)}</strong>;
    if (t.startsWith("__") && t.endsWith("__") && t.length > 4)
      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
      return <u key={i}>{t.slice(2, -2)}</u>;
    return t;
  });
}

/* ───────────────────────── ícones ───────────────────────── */

const ICON_PATHS: Record<string, ReactNode> = {
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12.5 2.8 2.8L16 9.5" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
    </>
  ),
  star: (
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z" />
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
};

export const AC_ICON_NAMES = ["scissors", "star", "award", "clock", "users"];
const ICON_OPTIONS = [
  { label: "Tesoura", value: "scissors" },
  { label: "Estrela", value: "star" },
  { label: "Prêmio", value: "award" },
  { label: "Relógio", value: "clock" },
  { label: "Pessoas", value: "users" },
];

function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {ICON_PATHS[name] ?? ICON_PATHS.star}
    </svg>
  );
}

/* ───────────────────────── peças comuns ───────────────────────── */

/** Props do véu verde (`div.ac-veil`) — o mesmo em todas as seções com foto. */
const veilSchema = (d: { color: string; opacity: number }) => ({
  veilAngle: int(0, 360, 240),
  veilColor: color(d.color),
  veilOpacity: int(0, 100, d.opacity),
});
const veilFields: FieldDef[] = [
  { key: "veilColor", kind: "color", label: "Véu: cor final" },
  { key: "veilAngle", kind: "number", label: "Véu: ângulo (graus)" },
  { key: "veilOpacity", kind: "number", label: "Véu: opacidade (%)" },
];
const veilVars = (p: {
  veilAngle: number;
  veilColor: string;
  veilOpacity: number;
}) =>
  ({
    "--ac-veil-a": `${p.veilAngle}deg`,
    "--ac-veil-c": safeColor(p.veilColor, "#002715"),
    "--ac-veil-o": p.veilOpacity / 100,
  }) as CSSProperties;

const Veil = () => <div aria-hidden="true" className="ac-veil" />;

const markSchema = {
  mark: str(),
  markOpacity: int(0, 100, 4),
};
const markFields: FieldDef[] = [
  { key: "mark", kind: "image", label: "Marca d'água (centralizada)" },
  { key: "markOpacity", kind: "number", label: "Marca d'água: opacidade (%)" },
];
const Mark = ({ opacity, url }: { opacity: number; url: string }) =>
  url ? (
    <div
      aria-hidden="true"
      className="ac-mark"
      style={
        {
          "--ac-mark": cssUrl(url),
          "--ac-mark-o": opacity / 100,
        } as CSSProperties
      }
    />
  ) : null;

/** Botão: contorno branco, no hover enche de branco; `solid` = branco com texto preto, no hover verde-escuro. */
function Btn({
  ctx,
  icon = "chevron",
  label,
  solid = false,
  url,
}: {
  ctx: RenderContext;
  icon?: string;
  label: string;
  solid?: boolean;
  url: string;
}) {
  if (!label) return null;
  return (
    <a className={cls("ac-btn", solid && "solid")} href={href(ctx, url)}>
      <span>{label}</span>
      {icon && icon !== "none" ? <Icon name={icon} /> : null}
    </a>
  );
}

const sectionBg = (url: string) =>
  url ? ({ "--ac-bg": cssUrl(url) } as CSSProperties) : {};

/** Contador do `fx-runtime`: conta de `from` (`data-from`) até o valor; o texto já traz o valor final. */
function Count({
  from,
  ms,
  prefix,
  suffix,
  value,
}: {
  from: number;
  ms: number;
  prefix: string;
  suffix: string;
  value: number;
}) {
  return (
    <span
      data-from={from || undefined}
      data-ms={ms}
      data-prefix={prefix || undefined}
      data-sb-count={value}
      data-suffix={suffix || undefined}
    >
      {`${prefix}${value}${suffix}`}
    </span>
  );
}

/* ───────────────────────── hero ───────────────────────── */

const acHero = defineBlock(
  z.object({
    buttonIcon: z
      .enum(["chevron", "scissors", "none"])
      .default("scissors")
      .catch("scissors"),
    buttonLabel: str("QUERO APRENDER"),
    buttonUrl: str("#oferta"),
    logo: str(),
    logoAlt: str("Logo"),
    logoWidth: int(20, 400, 90),
    minHeight: int(0, 200, 110),
    poster: str(),
    subtitle: str(),
    text: str(),
    title: str(),
    videoUrl: str(),
    ...veilSchema({ color: "#002715", opacity: 100 }),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h1)" },
      { key: "subtitle", kind: "text", label: "Subtítulo (h2)" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      {
        key: "buttonIcon",
        kind: "select",
        label: "Ícone do botão",
        options: [
          { label: "Tesoura", value: "scissors" },
          { label: "Seta ›", value: "chevron" },
          { label: "Sem ícone", value: "none" },
        ],
      },
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoAlt", kind: "text", label: "Texto alternativo do logo" },
      { key: "logoWidth", kind: "number", label: "Largura do logo (px)" },
      {
        key: "videoUrl",
        kind: "url",
        label: "Vídeo de fundo do YouTube (mudo, em laço)",
      },
      { key: "poster", kind: "image", label: "Imagem de reserva do fundo" },
      {
        key: "minHeight",
        kind: "number",
        label: "Altura mínima (% da altura da tela)",
      },
      ...veilFields,
    ],
    group: "layout",
    label: "Hero (Academia do Corte)",
    render: (p, ctx) => (
      <section
        className="ac-sec ac-hero"
        style={
          {
            "--ac-h": `${p.minHeight}vh`,
            ...veilVars(p),
            ...(p.logo ? { "--ac-logo-w": `${p.logoWidth}px` } : {}),
          } as CSSProperties
        }
      >
        <div className="ac-hero-in">
          {p.logo ? (
            <Img alt={p.logoAlt} className="ac-logo" src={p.logo} />
          ) : null}
          {p.title ? <h1 className="ac-h1">{p.title}</h1> : null}
          {p.subtitle ? <h2 className="ac-hero-sub">{p.subtitle}</h2> : null}
          {p.text ? <p className="ac-hero-p">{p.text}</p> : null}
          <Btn
            ctx={ctx}
            icon={p.buttonIcon}
            label={p.buttonLabel}
            url={p.buttonUrl}
          />
        </div>
        <BackgroundVideo
          edit={ctx.mode === "edit"}
          poster={p.poster}
          url={p.videoUrl}
        />
        <Veil />
      </section>
    ),
    type: "acHero",
  }
);

/* ───────────────────────── diferenciais ───────────────────────── */

const acFeatures = defineBlock(
  z.object({
    items: list({ image: str(), text: str(), title: str() }),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Ícone (PNG branco)" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Diferenciais",
      },
    ],
    group: "content",
    label: "Diferenciais (4 cartões com ícone)",
    render: p => (
      <section className="ac-sec ac-features">
        <div className="ac-feat-grid">
          {p.items.map((it, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
            <div className="ac-feat" key={i}>
              <span className="ac-ring">
                <Img alt="" className="ac-feat-img" src={it.image} />
              </span>
              <h4 className="ac-h4">{it.title}</h4>
              <p className="ac-small">{it.text}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "acFeatures",
  }
);

/* ───────────────────────── curso rápido + contadores ───────────────────────── */

const acAbout = defineBlock(
  z.object({
    button2Label: str("CORTE AVANÇADO"),
    button2Url: str("#oferta"),
    buttonLabel: str("CORTE BÁSICO"),
    buttonUrl: str("#oferta"),
    counters: list({
      from: int(0, 1_000_000, 0),
      icon: z.string().default("star").catch("star"),
      ms: int(100, 20000, 1000),
      prefix: str(),
      suffix: str(),
      text: str(),
      title: str(),
      value: int(0, 1_000_000, 0),
    }),
    image: str(),
    imageAlt: str(),
    question: str(),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h2)" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (um parágrafo por linha; **negrito**)",
      },
      { key: "question", kind: "text", label: "Pergunta acima dos botões" },
      { key: "buttonLabel", kind: "text", label: "Botão 1: texto" },
      { key: "buttonUrl", kind: "url", label: "Botão 1: link" },
      { key: "button2Label", kind: "text", label: "Botão 2: texto" },
      { key: "button2Url", kind: "url", label: "Botão 2: link" },
      { key: "image", kind: "image", label: "Foto (preto e branco)" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da foto" },
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          { key: "prefix", kind: "text", label: "Antes do número (ex.: +)" },
          { key: "from", kind: "number", label: "Valor inicial" },
          { key: "value", kind: "number", label: "Valor final" },
          { key: "suffix", kind: "text", label: "Depois do número (ex.: %)" },
          { key: "ms", kind: "number", label: "Duração da contagem (ms)" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "counters",
        kind: "list",
        label: "Contadores",
      },
    ],
    group: "content",
    label: "Curso rápido (foto, textos, botões e contadores)",
    render: (p, ctx) => (
      <section className="ac-sec ac-about">
        <div className="ac-about-in">
          <div className="ac-about-media">
            <Img alt={p.imageAlt} className="ac-about-img" src={p.image} />
            <div aria-hidden="true" className="ac-about-rect" />
          </div>
          <div className="ac-about-txt">
            {p.title ? <h2 className="ac-h2 ac-h2-md">{p.title}</h2> : null}
            {lines(p.text).length ? (
              <div className="ac-cols">
                {lines(p.text).map((t, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do parágrafo
                  <p key={i}>{rich(t)}</p>
                ))}
              </div>
            ) : null}
            {p.question ? <h5 className="ac-h5">{p.question}</h5> : null}
            {p.buttonLabel || p.button2Label ? (
              <div className="ac-btns">
                <Btn ctx={ctx} label={p.buttonLabel} solid url={p.buttonUrl} />
                <Btn
                  ctx={ctx}
                  label={p.button2Label}
                  solid
                  url={p.button2Url}
                />
              </div>
            ) : null}
            <hr className="ac-hr" />
            <div className="ac-counters">
              {p.counters.map((c, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do contador
                <div className="ac-counter" key={i}>
                  <span className="ac-counter-ico">
                    <Icon name={c.icon} />
                  </span>
                  <span className="ac-counter-num">
                    <Count
                      from={c.from}
                      ms={c.ms}
                      prefix={c.prefix}
                      suffix={c.suffix}
                      value={c.value}
                    />
                  </span>
                  <h4 className="ac-h4">{c.title}</h4>
                  <p className="ac-small">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    type: "acAbout",
  }
);

/* ───────────────────────── vídeo ───────────────────────── */

const acVideo = defineBlock(
  z.object({
    cover: str(),
    title: str("Assista ao vídeo"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (verde)" },
      {
        key: "videoUrl",
        kind: "url",
        label: "Vídeo (YouTube ou Vimeo; abre em popup)",
      },
      { key: "cover", kind: "image", label: "Capa" },
    ],
    group: "media",
    label: "Vídeo com capa (abre em popup)",
    render: p => {
      const embed = popupVideoEmbed(p.videoUrl);
      return (
        <section className="ac-sec ac-video">
          {p.title ? (
            <h3 className="ac-eyebrow ac-eyebrow-lg">{p.title}</h3>
          ) : null}
          {p.videoUrl || p.cover ? (
            <a
              aria-label={p.title || "Assistir ao vídeo"}
              className="ac-vcover"
              data-sb-video={embed ?? undefined}
              href={p.videoUrl || "#"}
              {...(/^https?:\/\//i.test(p.videoUrl)
                ? { rel: "noopener noreferrer", target: "_blank" }
                : {})}
            >
              <Img alt="" className="ac-vcover-img" src={p.cover} />
              <span className="ac-play">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zM9.5 7.5v9l7.5-4.5z" />
                </svg>
              </span>
            </a>
          ) : null}
        </section>
      );
    },
    type: "acVideo",
  }
);

/* ───────────────────────── faixa com foto ───────────────────────── */

const acBanner = defineBlock(
  z.object({
    align: z.enum(["left", "center"]).default("left").catch("left"),
    bg: str(),
    buttonLabel: str(),
    buttonUrl: str("#oferta"),
    minHeight: int(0, 200, 40),
    title: str(),
    title2: str(),
    titleWidth: int(10, 100, 50),
    ...veilSchema({ color: "#033F21", opacity: 50 }),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h2)" },
      { key: "title2", kind: "text", label: "Segundo título (opcional)" },
      {
        key: "titleWidth",
        kind: "number",
        label: "Largura do título (% da coluna)",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento",
        options: [
          { label: "À esquerda", value: "left" },
          { label: "Centralizado", value: "center" },
        ],
      },
      { key: "bg", kind: "image", label: "Foto de fundo" },
      {
        key: "minHeight",
        kind: "number",
        label: "Altura mínima (% da altura da tela)",
      },
      ...veilFields,
    ],
    group: "layout",
    label: "Faixa com foto e véu verde",
    render: (p, ctx) => (
      <section
        className={cls(
          "ac-sec",
          "ac-banner",
          p.align === "center" && "is-center"
        )}
        style={
          {
            "--ac-h": `${p.minHeight}vh`,
            "--ac-tw": `${p.titleWidth}%`,
            ...sectionBg(p.bg),
            ...veilVars(p),
          } as CSSProperties
        }
      >
        <div className="ac-banner-in">
          {p.title ? <h2 className="ac-h2 ac-bt">{p.title}</h2> : null}
          {p.title2 ? <h2 className="ac-h2 ac-bt">{p.title2}</h2> : null}
          <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
        </div>
        <Veil />
      </section>
    ),
    type: "acBanner",
  }
);

/* ───────────────────────── conteúdo do curso ───────────────────────── */

const acCurriculum = defineBlock(
  z.object({
    closing: str("e muito mais..."),
    eyebrow: str(),
    items: list({ title: str() }),
    text: str(),
    title: str(),
    ...markSchema,
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Sobretítulo (verde)" },
      { key: "title", kind: "text", label: "Título (h2)" },
      { key: "text", kind: "text", label: "Texto" },
      {
        itemFields: [{ key: "title", kind: "text", label: "Item" }],
        key: "items",
        kind: "list",
        label: "Itens (3 colunas, lidos por coluna)",
      },
      { key: "closing", kind: "text", label: "Fechamento" },
      ...markFields,
    ],
    group: "content",
    label: "Conteúdo do curso (grade com check)",
    render: p => {
      const rows = Math.max(1, Math.ceil(p.items.length / 3));
      return (
        <section className="ac-sec ac-curriculum">
          <div className="ac-cur-in">
            <header className="ac-head">
              {p.eyebrow ? (
                <span className="ac-eyebrow">{p.eyebrow}</span>
              ) : null}
              {p.title ? (
                <h2 className="ac-h2 ac-h2-md ac-head-t">{p.title}</h2>
              ) : null}
              {p.text ? <p className="ac-head-p">{p.text}</p> : null}
            </header>
            <div
              className="ac-cur-grid"
              style={{ "--ac-rows": rows } as CSSProperties}
            >
              {p.items.map((it, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do item
                <div className="ac-cur-item" key={i}>
                  <h4 className="ac-h4">{it.title}</h4>
                  <Icon name="check-circle" />
                </div>
              ))}
            </div>
            {p.closing ? <h3 className="ac-more">{p.closing}</h3> : null}
          </div>
          <Mark opacity={p.markOpacity} url={p.mark} />
        </section>
      );
    },
    type: "acCurriculum",
  }
);

/* ───────────────────────── instrutor + mosaico ───────────────────────── */

const acInstructor = defineBlock(
  z.object({
    items: list({
      image: str(),
      linkLabel: str("COMECE AGORA"),
      title: str(),
      url: str("#oferta"),
    }),
    text: str(),
    title: str("QUEM SOU EU?"),
    ...veilSchema({ color: "#002715", opacity: 100 }),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h2)" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          { key: "title", kind: "text", label: "Legenda" },
          { key: "linkLabel", kind: "text", label: "Texto do link" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Mosaico (a 1ª foto é a grande)",
      },
      ...veilFields,
    ],
    group: "content",
    label: "Quem sou eu + mosaico de fotos",
    render: (p, ctx) => (
      <section className="ac-sec ac-instructor" style={veilVars(p)}>
        <div className="ac-ins-in">
          <div className="ac-ins-head">
            {p.title ? <h2 className="ac-h2 ac-h2-md">{p.title}</h2> : null}
            {p.text ? <p className="ac-ins-p">{p.text}</p> : null}
          </div>
          <hr className="ac-hr" />
          <div className="ac-mosaic">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade da foto
              <div className={cls("ac-tile", i === 0 && "big")} key={i}>
                <Img alt={it.title} className="ac-tile-img" src={it.image} />
                <Veil />
                <div className="ac-cap">
                  <h4 className="ac-h4">
                    <a href={href(ctx, it.url)}>{it.title}</a>
                  </h4>
                  {it.linkLabel ? (
                    <a className="ac-cap-link" href={href(ctx, it.url)}>
                      {it.linkLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "acInstructor",
  }
);

/* ───────────────────────── reviews ───────────────────────── */

const acReviews = defineBlock(
  z.object({
    eyebrow: str("Reviews"),
    items: list({ image: str(), name: str(), role: str(), text: str() }),
    pause: z.enum(["yes", "no"]).default("yes").catch("yes"),
    text: str(),
    title: str(),
    ...carSchema({
      delay: 4000,
      gap: 30,
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 1000,
    }),
    ...markSchema,
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Sobretítulo (verde)" },
      { key: "title", kind: "text", label: "Título (h2)" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (**negrito**, __sublinhado__)",
      },
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Função" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
      ...carFields([
        {
          key: "pause",
          kind: "select",
          label: "Pausar ao passar o mouse",
          options: [
            { label: "Sim", value: "yes" },
            { label: "Não", value: "no" },
          ],
        },
      ]),
      ...markFields,
    ],
    group: "content",
    label: "Reviews em carrossel",
    render: p => (
      <section className="ac-sec ac-reviews">
        <div className="ac-rev-in">
          <header className="ac-head left">
            {p.eyebrow ? <span className="ac-eyebrow">{p.eyebrow}</span> : null}
            {p.title ? (
              <h2 className="ac-h2 ac-h2-md ac-head-t">{p.title}</h2>
            ) : null}
            {p.text ? <p className="ac-head-p">{rich(p.text)}</p> : null}
          </header>
          <SiCar
            arrows="outside"
            className="ac-car"
            dots
            items={p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do slide
              <figure className="ac-review" key={i}>
                <blockquote>{it.text}</blockquote>
                <figcaption>
                  <Img alt={it.name} className="ac-avatar" src={it.image} />
                  <span>
                    <b>{it.name}</b>
                    <em>{it.role}</em>
                  </span>
                </figcaption>
              </figure>
            ))}
            p={p}
            pause={p.pause === "yes"}
          />
        </div>
        <Mark opacity={p.markOpacity} url={p.mark} />
      </section>
    ),
    type: "acReviews",
  }
);

/* ───────────────────────── garantia + oferta ───────────────────────── */

const acGuarantee = defineBlock(
  z.object({
    aside: str(),
    bg: str(),
    text: str(),
    title: str("GARANTIA DE SATISFAÇÃO"),
    ...veilSchema({ color: "#002715", opacity: 100 }),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h2)" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (**negrito**)",
      },
      {
        key: "aside",
        kind: "textarea",
        label: "Caixa de chamada ao lado da oferta",
      },
      { key: "bg", kind: "image", label: "Foto de fundo" },
      ...veilFields,
    ],
    group: "layout",
    label: "Garantia + oferta (contêiner: o cartão de oferta fica dentro)",
    render: (p, _ctx, children) => (
      <section
        className="ac-sec ac-guarantee"
        style={{ ...sectionBg(p.bg), ...veilVars(p) } as CSSProperties}
      >
        <div className="ac-g-head">
          {p.title ? <h2 className="ac-h2 ac-h2-md">{p.title}</h2> : null}
          {p.text ? <p className="ac-g-p">{rich(p.text)}</p> : null}
        </div>
        <div className="ac-g-row">
          <div className="ac-g-offer">{children}</div>
          {p.aside ? (
            <div className="ac-callout">
              <p>{p.aside}</p>
            </div>
          ) : null}
        </div>
        <Veil />
      </section>
    ),
    type: "acGuarantee",
  }
);

export const corteBlocks: BlockDefinition[] = [
  acHero,
  acFeatures,
  acAbout,
  acVideo,
  acBanner,
  acCurriculum,
  acInstructor,
  acReviews,
  acGuarantee,
];
