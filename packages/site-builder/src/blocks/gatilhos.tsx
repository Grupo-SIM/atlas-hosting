import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, newTab } from "./helpers.js";
import { carSchema, int, SiCar, str, yesNo } from "./sim-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos da página de vendas "Gatilhos Mentais" (prefixo `gm`, escopo `.sb-gm`, CSS em `renderer/gatilhos.ts`).
 * Todo texto, imagem e link é prop. Oferta, FAQ e rodapé são os blocos comuns `ebook*` (`blocks/ebook.tsx`).
 *
 * Títulos: `title` (antes) + `highlight` (destaque) + `after` (depois). Em geral o destaque é ciano e o resto branco;
 * no hero é o contrário (`gm-inv`).
 *
 * Ordem dos filhos (caminhos de `Block.fx`; `1` = a seção):
 * - `gmHero`: `1.1` contêiner; `1.1.1` coluna esquerda (`.1` título, `.2` botão + contador), `1.1.2` arte (vazia), `1.1.3`
 *   coluna direita (`.1` botão de vídeo + link, `.2` texto).
 * - `gmFeatures`: `1.1.1` título, `1.1.2` texto, `1.1.3.N` = cartão N (o cartão **externo**: a entrada age nele; o hover
 *   que sobe e preenche é do `.gm-card-in`, por dentro, para não brigar com a `transition` da entrada).
 * - `gmTrustStrip`: `1.1.1` título, `1.1.2.N` = item N (`.1` = o ícone, `.2` = a legenda).
 * - `gmSplit`: `1.1.1` imagem, `1.1.2` texto (`.1` título, `.2` parágrafo, `.3` botão).
 * - `gmTriggers`: `1.1.1` coluna fixa (`.1` título, `.2` texto, `.3` botão), `1.1.2.N` = cartão N.
 * - `gmBonus`: `1.1.1` título, `1.1.2` texto, `1.1.3.N` = coluna N, `1.1.4` botão final.
 * - `gmReviews`: `1.1.1` título, `1.1.2` carrossel, `1.1.3.N` = número N.
 * - `gmGuarantee`: `1.1.1` texto (`.1` título, `.2` parágrafo, `.3` botão), `1.1.2` selo.
 * - `gmHeading`: `1.1.1` título, `1.1.2` texto.
 */

/* ───────────────────────── peças comuns ───────────────────────── */

/** Junta classes ignorando as falsas (template literal com espaço à frente é estragado pelo sorter de classes do Biome). */
const cls = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

const list = <T extends z.ZodRawShape>(shape: T) =>
  z.array(z.object(shape)).default([]).catch([]);

const ICON_PATHS: Record<string, ReactNode> = {
  book: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.6 6.5a3 3 0 0 0 .4-1.4M6 5.1a3 3 0 0 0 .4 1.4" />
    </>
  ),
  chat: (
    <>
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6M10 22h4" />
    </>
  ),
  loader: (
    <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.2 16.2l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.2 7.8l2.8-2.8" />
  ),
  medal: (
    <>
      <path d="M7.2 15 2.7 7.1a2 2 0 0 1 .1-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.1a2 2 0 0 1 .1 2.2L16.8 15" />
      <path d="M11 12 5.1 2.2M13 12l5.9-9.8M8 7h8" />
      <circle cx="12" cy="17" r="5" />
      <path d="M12 18v-2h-.5" />
    </>
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6" />
    </>
  ),
  star: (
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  timer: (
    <>
      <path d="M10 2h4M12 14l3-3" />
      <circle cx="12" cy="14" r="8" />
    </>
  ),
  video: (
    <>
      <path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 10.5" />
      <rect height="12" rx="2" width="14" x="2" y="6" />
    </>
  ),
};
export const GM_ICON_NAMES = Object.keys(ICON_PATHS) as [string, ...string[]];
const ICON_OPTIONS = GM_ICON_NAMES.map(value => ({ label: value, value }));
const icon = (d: string) => z.string().default(d).catch(d);

function Icon({ name }: { name: string }) {
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths}
    </svg>
  );
}

/** Título com destaque: antes (cor base) + destaque + depois (cor base). Partes vazias não saem. */
function Title({
  after,
  as: Tag = "h2",
  before,
  className,
  highlight,
  inverse = false,
}: {
  after: string;
  as?: "h1" | "h2" | "h3";
  before: string;
  className: string;
  highlight: string;
  inverse?: boolean;
}) {
  if (!(before || highlight || after)) return null;
  return (
    <Tag className={cls(className, inverse && "gm-inv")}>
      {before ? <span className="gm-a">{before}</span> : null}
      {before && highlight ? " " : null}
      {highlight ? <span className="gm-b">{highlight}</span> : null}
      {after ? (
        <>
          {before || highlight ? " " : null}
          <span className="gm-a">{after}</span>
        </>
      ) : null}
    </Tag>
  );
}

const titleSchema = (d: {
  after?: string;
  highlight: string;
  title: string;
}) => ({
  after: str(d.after ?? ""),
  highlight: str(d.highlight),
  title: str(d.title),
});
const titleFields = (prefix = ""): FieldDef[] => [
  { key: "title", kind: "text", label: `${prefix}Título: parte inicial` },
  { key: "highlight", kind: "text", label: `${prefix}Título: destaque` },
  { key: "after", kind: "text", label: `${prefix}Título: parte final` },
];

function Btn({
  className = "",
  ctx,
  label,
  url,
}: {
  className?: string;
  ctx: RenderContext;
  label: string;
  url: string;
}) {
  if (!label) return null;
  return (
    <a className={cls("gm-btn", className)} href={href(ctx, url)}>
      {label}
    </a>
  );
}

const fmtThousands = (n: number) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Contador do `fx-runtime` (`data-sb-count`): conta de 0 até o valor em 3,5 s; o texto já traz o valor final. */
function Count({ prefix = "", value }: { prefix?: string; value: number }) {
  return (
    <span
      data-ms="3500"
      data-prefix={prefix || undefined}
      data-sb-count={value}
      data-sep={value >= 1000 ? "." : undefined}
    >
      {`${prefix}${fmtThousands(value)}`}
    </span>
  );
}

/** Fundo e altura mínima por tela. */
const bgVar = (name: string, url: string) =>
  url ? { [name]: cssUrl(url) } : {};

/* ───────────────────────── hero ───────────────────────── */

const gmHero = defineBlock(
  z.object({
    bg: str(),
    bgMobile: str(),
    bgTablet: str(),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#d1"),
    counterLabel: str("Gatilhos Mentais"),
    counterPrefix: str("+"),
    counterValue: int(0, 1_000_000, 24),
    highlight: str(),
    text: str(),
    title: str(),
    videoLabel: str("ASSISTA ESSE VÍDEO"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título: parte inicial (ciano)" },
      { key: "highlight", kind: "text", label: "Título: destaque (branco)" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "counterValue", kind: "number", label: "Contador: valor" },
      { key: "counterPrefix", kind: "text", label: "Contador: prefixo" },
      { key: "counterLabel", kind: "text", label: "Contador: legenda" },
      { key: "videoUrl", kind: "url", label: "Vídeo (YouTube ou Vimeo)" },
      { key: "videoLabel", kind: "text", label: "Texto do link do vídeo" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "bg", kind: "image", label: "Fundo (computador)" },
      { key: "bgTablet", kind: "image", label: "Fundo (tablet)" },
      { key: "bgMobile", kind: "image", label: "Fundo (celular)" },
    ],
    group: "layout",
    label: "Hero (Gatilhos Mentais)",
    render: (p, ctx) => {
      const embed = popupVideoEmbed(p.videoUrl);
      const videoProps = {
        "data-sb-video": embed ?? undefined,
        ...newTab(p.videoUrl),
      };
      return (
        <section
          className="gm-sec gm-hero"
          style={
            {
              ...bgVar("--gm-bg", p.bg),
              ...bgVar("--gm-bg-t", p.bgTablet || p.bg),
              ...bgVar("--gm-bg-m", p.bgMobile || p.bgTablet || p.bg),
            } as CSSProperties
          }
        >
          <div className="gm-hero-in">
            <div className="gm-hero-l">
              <Title
                after=""
                as="h1"
                before={p.title}
                className="gm-h1"
                highlight={p.highlight}
                inverse
              />
              <div className="gm-acts">
                <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
                <div className="gm-count">
                  <span className="gm-count-num">
                    <Count prefix={p.counterPrefix} value={p.counterValue} />
                  </span>
                  <span className="gm-count-cap">{p.counterLabel}</span>
                </div>
              </div>
            </div>
            <div className="gm-hero-c" />
            <div className="gm-hero-r">
              {p.videoUrl ? (
                <div className="gm-vrow">
                  <a
                    aria-label={p.videoLabel || "Assistir ao vídeo"}
                    className="gm-play"
                    href={p.videoUrl}
                    {...videoProps}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M6 3l14 9-14 9z" />
                    </svg>
                  </a>
                  {p.videoLabel ? (
                    <a className="gm-vlink" href={p.videoUrl} {...videoProps}>
                      {p.videoLabel}
                    </a>
                  ) : null}
                </div>
              ) : null}
              {p.text ? <p className="gm-p">{p.text}</p> : null}
            </div>
          </div>
        </section>
      );
    },
    type: "gmHero",
  }
);

/* ───────────────────────── recursos ───────────────────────── */

const gmFeatures = defineBlock(
  z.object({
    ...titleSchema({
      highlight: "Sua forma de vender",
      title: "Transformando",
    }),
    items: list({ icon: icon("lightbulb"), text: str(), title: str() }),
    text: str(),
  }),
  {
    fields: [
      ...titleFields(),
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
    ],
    group: "content",
    label: "Cartões de recursos (Gatilhos Mentais)",
    render: p => (
      <section className="gm-sec gm-features">
        <div className="gm-in">
          <Title
            after={p.after}
            before={p.title}
            className="gm-h2"
            highlight={p.highlight}
          />
          {p.text ? <p className="gm-lead">{p.text}</p> : null}
          <div className="gm-cards">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
              <article className="gm-card" key={i}>
                <div className="gm-card-in">
                  <span className="gm-ico">
                    <Icon name={it.icon} />
                  </span>
                  <h4>{it.title}</h4>
                  <p>{it.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "gmFeatures",
  }
);

/* ───────────────────────── faixa de confiança ───────────────────────── */

const gmTrustStrip = defineBlock(
  z.object({
    ...titleSchema({
      after: "de quem vive de vendas",
      highlight: "Confiança",
      title: "",
    }),
    items: list({ icon: icon("target"), label: str() }),
  }),
  {
    fields: [
      ...titleFields(),
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          { key: "label", kind: "text", label: "Legenda" },
        ],
        key: "items",
        kind: "list",
        label: "Itens",
      },
    ],
    group: "content",
    label: "Faixa de confiança (Gatilhos Mentais)",
    render: p => (
      <section className="gm-sec gm-trust">
        <div className="gm-in gm-trust-in">
          <Title
            after={p.after}
            as="h3"
            before={p.title}
            className="gm-h3"
            highlight={p.highlight}
          />
          <div className="gm-trust-items">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do item
              <div className="gm-trust-item" key={i}>
                <span className="gm-trust-ico">
                  <Icon name={it.icon} />
                </span>
                <span className="gm-trust-label">{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "gmTrustStrip",
  }
);

/* ───────────────────────── imagem + texto ───────────────────────── */

const gmSplit = defineBlock(
  z.object({
    ...titleSchema({ highlight: "Persuasão", title: "Domine a Arte da" }),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#d1"),
    image: str(),
    imageAlt: str(),
    text: str(),
  }),
  {
    fields: [
      ...titleFields(),
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "image", kind: "image", label: "Imagem" },
      { key: "imageAlt", kind: "text", label: "Descrição da imagem" },
    ],
    group: "content",
    label: "Imagem e texto (Gatilhos Mentais)",
    render: (p, ctx) => (
      <section className="gm-sec gm-split">
        <div className="gm-in gm-split-in">
          <div className="gm-split-img">
            <Img alt={p.imageAlt} src={p.image} />
          </div>
          <div className="gm-split-txt">
            <Title
              after={p.after}
              before={p.title}
              className="gm-h2"
              highlight={p.highlight}
            />
            {p.text ? <p className="gm-p">{p.text}</p> : null}
            <Btn
              className="sm"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
        </div>
      </section>
    ),
    type: "gmSplit",
  }
);

/* ───────────────────────── gatilhos (cartões com hover revelador) ───────────────────────── */

const gmTriggers = defineBlock(
  z.object({
    ...titleSchema({
      after: "imediata",
      highlight: "Desejo e Urgência",
      title: "Gatilhos que geram",
    }),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#d1"),
    items: list({
      icon: icon("timer"),
      image: str(),
      text: str(),
      title: str(),
    }),
    linkLabel: str("Saber Mais"),
    linkUrl: str("#d1"),
    text: str(),
  }),
  {
    fields: [
      ...titleFields(),
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "image", kind: "image", label: "Foto de fundo" },
          {
            key: "icon",
            kind: "select",
            label: "Ícone (aparece no hover; vazio = nenhum)",
            options: [{ label: "(nenhum)", value: "" }, ...ICON_OPTIONS],
          },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
      {
        key: "linkLabel",
        kind: "text",
        label: "Link que aparece no hover (vazio = sem link)",
      },
      { key: "linkUrl", kind: "url", label: "Destino do link do hover" },
    ],
    group: "content",
    label: "Gatilhos com hover revelador (Gatilhos Mentais)",
    render: (p, ctx) => (
      <section
        className={cls(
          "gm-sec",
          "gm-triggers",
          ctx.mode === "edit" && "is-edit"
        )}
      >
        <div className="gm-in gm-trig-in">
          <div className="gm-trig-l">
            <Title
              after={p.after}
              before={p.title}
              className="gm-h2 gm-lc"
              highlight={p.highlight}
            />
            {p.text ? <p className="gm-p">{p.text}</p> : null}
            <Btn
              className="sm"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
          <div className="gm-trig-grid">
            {p.items.map((it, i) => (
              <article
                className="gm-tcard"
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
                key={i}
                style={
                  it.image
                    ? ({ "--gm-timg": cssUrl(it.image) } as CSSProperties)
                    : undefined
                }
              >
                <span className="gm-tico">
                  <Icon name={it.icon} />
                </span>
                <h4>{it.title}</h4>
                <p>{it.text}</p>
                {p.linkLabel ? (
                  <a className="gm-more" href={href(ctx, p.linkUrl)}>
                    {p.linkLabel}
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "gmTriggers",
  }
);

/* ───────────────────────── bônus ───────────────────────── */

const gmBonus = defineBlock(
  z.object({
    ...titleSchema({ highlight: "Exclusivos", title: "Bônus" }),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#d1"),
    items: list({ image: str(), text: str(), title: str() }),
    linkLabel: str("Adquirir agora"),
    linkUrl: str("#d1"),
    stairs: int(0, 400, 163),
    stairs3: int(0, 400, 24),
    text: str(),
  }),
  {
    fields: [
      ...titleFields(),
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Descrição" },
        ],
        key: "items",
        kind: "list",
        label: "Bônus",
      },
      { key: "linkLabel", kind: "text", label: "Link de cada bônus" },
      { key: "linkUrl", kind: "url", label: "Destino do link de cada bônus" },
      {
        key: "stairs",
        kind: "number",
        label: "Degrau da coluna do meio (px, só no computador)",
      },
      {
        key: "stairs3",
        kind: "number",
        label: "Degrau da terceira coluna (px, só no computador)",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão final" },
      { key: "buttonUrl", kind: "url", label: "Link do botão final" },
    ],
    group: "content",
    label: "Bônus em escada (Gatilhos Mentais)",
    render: (p, ctx) => (
      <section className="gm-sec gm-bonus">
        <div
          className="gm-in gm-bbox"
          style={
            {
              "--gm-stairs": `${p.stairs}px`,
              "--gm-stairs3": `${p.stairs3}px`,
            } as CSSProperties
          }
        >
          <Title
            after={p.after}
            before={p.title}
            className="gm-h2"
            highlight={p.highlight}
          />
          {p.text ? <p className="gm-bsub">{p.text}</p> : null}
          <div className="gm-bcols">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade da coluna
              <div className="gm-bcol" key={i}>
                <Img alt={it.title} className="gm-bimg" src={it.image} />
                <div className="gm-bcard">
                  <h4>{it.title}</h4>
                  <p>{it.text}</p>
                  {p.linkLabel ? (
                    <a className="gm-more" href={href(ctx, p.linkUrl)}>
                      {p.linkLabel}
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="gm-bcta">
            <Btn
              className="sm"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
        </div>
      </section>
    ),
    type: "gmBonus",
  }
);

/* ───────────────────────── reviews + números ───────────────────────── */

const QUOTE = (
  <svg aria-hidden="true" className="gm-quote" viewBox="0 0 24 24">
    <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
  </svg>
);

const gmReviews = defineBlock(
  z.object({
    ...carSchema({
      delay: 3500,
      gap: 30,
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
    }),
    counters: list({
      icon: icon("brain"),
      label: str(),
      prefix: str("+"),
      value: int(0, 1_000_000_000, 0),
    }),
    items: list({ image: str(), name: str(), text: str() }),
    pause: yesNo("yes"),
    title: str("REVIEWS"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
      { key: "perView", kind: "number", label: "Por tela (computador)" },
      { key: "perViewTablet", kind: "number", label: "Por tela (tablet)" },
      { key: "perViewMobile", kind: "number", label: "Por tela (celular)" },
      { key: "gap", kind: "number", label: "Espaço entre depoimentos (px)" },
      { key: "delay", kind: "number", label: "Tempo parado (ms)" },
      { key: "speed", kind: "number", label: "Duração da troca (ms)" },
      {
        key: "pause",
        kind: "select",
        label: "Pausar com o mouse em cima",
        options: [
          { label: "Sim", value: "yes" },
          { label: "Não", value: "no" },
        ],
      },
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          { key: "prefix", kind: "text", label: "Prefixo (ex.: +)" },
          { key: "value", kind: "number", label: "Valor" },
          { key: "label", kind: "text", label: "Legenda" },
        ],
        key: "counters",
        kind: "list",
        label: "Números",
      },
    ],
    group: "content",
    label: "Reviews e números (Gatilhos Mentais)",
    render: p => (
      <section className="gm-sec gm-reviews">
        <div className="gm-in">
          {p.title ? (
            <h2 className="gm-h2 gm-rtitle">
              <span className="gm-b">{p.title}</span>
            </h2>
          ) : null}
          <SiCar
            arrows="none"
            className="gm-car"
            items={p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do slide
              <figure className="gm-review" key={i}>
                {QUOTE}
                <blockquote>{it.text}</blockquote>
                <figcaption>
                  <Img alt={it.name} className="gm-avatar" src={it.image} />
                  <b>{it.name}</b>
                </figcaption>
              </figure>
            ))}
            p={p}
            pause={p.pause === "yes"}
          />
          <div className="gm-stats">
            {p.counters.map((c, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do número
              <div className="gm-stat" key={i}>
                <span className="gm-stat-ico">
                  <Icon name={c.icon} />
                </span>
                <span className="gm-stat-txt">
                  <span className="gm-stat-num">
                    <Count prefix={c.prefix} value={c.value} />
                  </span>
                  <span className="gm-stat-cap">{c.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "gmReviews",
  }
);

/* ───────────────────────── garantia ───────────────────────── */

const gmGuarantee = defineBlock(
  z.object({
    ...titleSchema({ highlight: "100% SEGURA", title: "COMPRA" }),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#d1"),
    image: str(),
    imageAlt: str("Selo de 7 dias de garantia"),
    text: str(),
  }),
  {
    fields: [
      ...titleFields(),
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "image", kind: "image", label: "Selo" },
      { key: "imageAlt", kind: "text", label: "Descrição do selo" },
    ],
    group: "content",
    label: "Garantia (Gatilhos Mentais)",
    render: (p, ctx) => (
      <section className="gm-sec gm-guarantee">
        <div className="gm-in gm-g-in">
          <div className="gm-g-txt">
            <Title
              after={p.after}
              before={p.title}
              className="gm-h2"
              highlight={p.highlight}
            />
            {p.text ? <p className="gm-p">{p.text}</p> : null}
            <Btn
              className="md"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
          <div className="gm-g-img">
            <Img alt={p.imageAlt} src={p.image} />
          </div>
        </div>
      </section>
    ),
    type: "gmGuarantee",
  }
);

/* ───────────────────────── título de seção ───────────────────────── */

const gmHeading = defineBlock(
  z.object({
    ...titleSchema({ highlight: "JOGO", title: "MUDE SEU" }),
    padBottom: int(0, 400, 50),
    padTop: int(0, 400, 100),
    padTopTablet: int(0, 400, 60),
    text: str(),
  }),
  {
    fields: [
      ...titleFields(),
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "padTop", kind: "number", label: "Espaço acima (px)" },
      {
        key: "padTopTablet",
        kind: "number",
        label: "Espaço acima no tablet e celular (px)",
      },
      { key: "padBottom", kind: "number", label: "Espaço abaixo (px)" },
    ],
    group: "content",
    label: "Título de seção centralizado (Gatilhos Mentais)",
    render: p => (
      <section
        className="gm-sec gm-sechead"
        style={
          {
            "--gm-pb": `${p.padBottom}px`,
            "--gm-pt": `${p.padTop}px`,
            "--gm-pt-t": `${p.padTopTablet}px`,
          } as CSSProperties
        }
      >
        <div className="gm-in">
          <Title
            after={p.after}
            before={p.title}
            className="gm-h2"
            highlight={p.highlight}
          />
          {p.text ? <p className="gm-lead">{p.text}</p> : null}
        </div>
      </section>
    ),
    type: "gmHeading",
  }
);

export const gatilhosBlocks: BlockDefinition[] = [
  gmHero,
  gmFeatures,
  gmTrustStrip,
  gmSplit,
  gmTriggers,
  gmBonus,
  gmReviews,
  gmHeading,
  gmGuarantee,
];
