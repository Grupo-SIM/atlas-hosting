import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { int, lines, SI_ICON_OPTIONS, SiCar, SiIcon, str } from "./sim-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";

/**
 * Blocos da página de vendas "Grana na Hora" (prefixo `gh`, escopo `.sb-gh`, CSS em `renderer/grana.ts`). O rodapé é o
 * bloco comum `ebookFooter`. Todo texto, imagem e link é prop.
 *
 * Ordem dos filhos (da qual dependem os caminhos de `Block.fx`; `1` = a seção):
 * - `ghHero`: `1.1` texto (`.1` título com palavra girando, `.2` texto, `.3` botão), `1.2` mosaico (`1.2.C` = coluna C, 1 ou 2;
 *   `1.2.C.N` = quadro N: duas imagens, a normal e a do hover). Os véus são pseudo-elementos.
 * - `ghFeatures`: `1.1` grade de destaques (`1.1.N`: `.1` ícone, `.2` título, `.3` texto), `1.2` "O mapa": `1.2.1` slider,
 *   `1.2.2` coluna de texto (`.1` sobretítulo + título + texto, `.2` toggle, `.3` botão).
 * - `ghBanner`: `1.1` coluna da caixa (`.1` caixa: título, texto, botão), `1.2` imagem, `1.3` chamada final (`.1` título, `.2` botão).
 * - `ghSteps`: `1.1` lista; `1.1.N` = passo N (linha), com os dois filhos **na ordem visual** (a partir do 2º passo a
 *   imagem vem antes do texto): texto = `.1` número, `.2` sobretítulo, `.3` título, `.4` texto, `.5` botão; cartão = `.1` legenda.
 * - `ghBonus`: `1.1` imagem (`.1` a foto), `1.2` painel (`.1` cabeçalho, `.2` lista; `1.2.2.N` = bônus N).
 * - `ghOffer`: `1.1` cabeçalho, `1.2` cartão (`.1` título, `.2` frase, `.3` preço, `.4` desconto, `.5` lista, `.6` botão).
 * - `ghTestimonials`: `1.1` área interna (o carrossel é o filho `1`).
 * - `ghFaq`: `1.1` área interna: `.1` cabeçalho (sobretítulo, título, texto), `.2` lista.
 *
 * Extensões genéricas que o template usa: palavra girando (`RotateWords`, runtime `[data-sb-rotate]`), carrossel em fade
 * (`SiCar transition="fade"`) e `Fx.parallaxScreens`.
 */

const list = <T extends z.ZodRawShape>(shape: T) =>
  z.array(z.object(shape)).default([]).catch([]);

const cls = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

/** `\n` vira quebra de linha. */
function multiline(text: string): ReactNode {
  return text.split("\n").flatMap((line, i) =>
    // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade da linha
    i ? [<br key={`br${i}`} />, line] : [line]
  );
}

const bgStyle = (image: string): CSSProperties | undefined =>
  image ? ({ "--gh-bg": cssUrl(image) } as CSSProperties) : undefined;

/* ───────────────────────── peças comuns ───────────────────────── */

function Btn({
  className,
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
    <a className={cls("gh-btn", className)} href={href(ctx, url)}>
      {label}
    </a>
  );
}

/**
 * Palavra girando: o HTML estático mostra só a primeira; o `fx-runtime` (`[data-sb-rotate]`) troca pelas demais a cada
 * `ms`, com efeito `flip` (gira no eixo X) ou `fade`. Palavras separadas por `|` no atributo `data-words`.
 */
export function RotateWords({
  effect = "flip",
  ms = 2500,
  words,
}: {
  effect?: "fade" | "flip";
  ms?: number;
  words: string;
}) {
  const all = lines(words).map(w => w.replaceAll("|", ""));
  if (!all.length) return null;
  return (
    <span
      className="sb-rot"
      data-ms={ms}
      data-sb-rotate={effect}
      data-words={all.join("|")}
    >
      <span className="sb-rot-w">{all[0]}</span>
    </span>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path d="m7 3 10 9-10 9" />
    </svg>
  );
}

/** Acordeão do "O mapa" (toggle) e do FAQ: `<details>` nativo, chevron à esquerda que vira para cima aberto. */
function Accordion({
  items,
  openFirst = false,
}: {
  items: { answer: string; question: string }[];
  openFirst?: boolean;
}) {
  return (
    <>
      {items.map((it, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do item
        <details className="gh-acc-item" key={i} open={openFirst && i === 0}>
          <summary>
            <Chevron className="gh-acc-ic" />
            <h6 className="gh-acc-t">{it.question}</h6>
          </summary>
          <div className="gh-acc-a">
            <p>{it.answer}</p>
          </div>
        </details>
      ))}
    </>
  );
}

/** Ícones do template; os demais nomes caem no conjunto do `sim-lib`. */
const GH_ICONS: Record<string, ReactNode> = {
  money: (
    <>
      <rect height="12" rx="2" width="20" x="2" y="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  network: (
    <>
      <rect height="6" rx="1" width="6" x="16" y="16" />
      <rect height="6" rx="1" width="6" x="2" y="16" />
      <rect height="6" rx="1" width="6" x="9" y="2" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="4.5" fill="currentColor" r="2.5" />
      <rect fill="currentColor" height="9" rx="2.5" width="5" x="9.5" y="8" />
      <ellipse cx="12" cy="18" rx="9" ry="3.2" />
    </>
  ),
};

const ICON_OPTIONS = [
  { label: "pessoa", value: "person" },
  { label: "dinheiro", value: "money" },
  { label: "rede", value: "network" },
  ...SI_ICON_OPTIONS,
];

function GhIcon({ name }: { name: string }) {
  const own = GH_ICONS[name];
  if (!own) return <SiIcon name={name} />;
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {own}
    </svg>
  );
}

const btnFields = (extra = ""): FieldDef[] => [
  { key: "buttonLabel", kind: "text", label: `Texto do botão${extra}` },
  { key: "buttonUrl", kind: "url", label: `Link do botão${extra}` },
];

/* ───────────────────────── hero ───────────────────────── */

const tileSchema = z.object({
  column: z.enum(["1", "2"]).default("1").catch("1"),
  hover: str(),
  hoverPos: z
    .enum(["center", "top", "bottom"])
    .default("center")
    .catch("center"),
  image: str(),
});

const ghHero = defineBlock(
  z.object({
    bgImage: str(),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#oferta"),
    text: str(),
    tiles: z.array(tileSchema).default([]).catch([]),
    titlePrefix: str(),
    wordEffect: z.enum(["flip", "fade"]).default("flip").catch("flip"),
    wordMs: int(800, 10000, 2500),
    words: str(),
  }),
  {
    fields: [
      { key: "titlePrefix", kind: "text", label: "Título (antes da palavra)" },
      {
        key: "words",
        kind: "textarea",
        label: "Palavras que se alternam (uma por linha; a 1ª vale sem JS)",
      },
      {
        key: "wordEffect",
        kind: "select",
        label: "Efeito da troca",
        options: [
          { label: "Girar (flip)", value: "flip" },
          { label: "Esmaecer", value: "fade" },
        ],
      },
      { key: "wordMs", kind: "number", label: "Tempo entre trocas (ms)" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...btnFields(),
      { key: "bgImage", kind: "image", label: "Imagem de fundo" },
      {
        itemFields: [
          {
            key: "image",
            kind: "image",
            label: "Imagem",
            related: ["hover", "hoverPos"],
          },
          { key: "hover", kind: "image", label: "Imagem ao passar o mouse" },
          {
            key: "hoverPos",
            kind: "select",
            label: "Posição da imagem do hover",
            options: [
              { label: "Centro", value: "center" },
              { label: "Topo", value: "top" },
              { label: "Base", value: "bottom" },
            ],
          },
          {
            key: "column",
            kind: "select",
            label: "Coluna (a 1ª sobe, a 2ª desce)",
            options: [
              { label: "Coluna 1", value: "1" },
              { label: "Coluna 2", value: "2" },
            ],
          },
        ],
        key: "tiles",
        kind: "list",
        label: "Quadros do mosaico (somem no celular)",
      },
    ],
    group: "layout",
    label: "Grana: hero com palavra girando e mosaico",
    render: (p, ctx) => {
      const cols = (["1", "2"] as const).map(c =>
        p.tiles.filter(t => t.column === c)
      );
      return (
        <section className="gh-hero" style={bgStyle(p.bgImage)}>
          <div className="gh-hero-copy">
            <h1 className="gh-h gh-hero-title">
              {p.titlePrefix}
              {p.titlePrefix && p.words ? " " : null}
              <RotateWords
                effect={p.wordEffect}
                ms={p.wordMs}
                words={p.words}
              />
            </h1>
            {p.text ? <p className="gh-hero-p">{p.text}</p> : null}
            <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
          <div aria-hidden="true" className="gh-mosaic">
            {cols.map((tiles, c) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a coluna é identificada pela posição
              <div className="gh-mcol" key={c}>
                {tiles.map((t, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do quadro
                  <div className="gh-tile" key={i}>
                    <img alt="" loading="lazy" src={t.image} />
                    {t.hover ? (
                      <img
                        alt=""
                        className="alt"
                        loading="lazy"
                        src={t.hover}
                        style={
                          t.hoverPos === "center"
                            ? undefined
                            : { objectPosition: `center ${t.hoverPos}` }
                        }
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    },
    type: "ghHero",
  }
);

/* ───────────────────────── destaques + "O mapa" ───────────────────────── */

const ghFeatures = defineBlock(
  z.object({
    bgImage: str(),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#oferta"),
    delay: int(500, 30000, 5000),
    eyebrow: str(),
    items: list({ icon: str("star"), text: str(), title: str() }),
    slides: list({ alt: str(), image: str() }),
    speed: int(100, 5000, 500),
    text: str(),
    title: str(),
    toggle: list({ answer: str(), question: str() }),
  }),
  {
    fields: [
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
        label: "Destaques (4 em linha)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Texto alternativo" },
        ],
        key: "slides",
        kind: "list",
        label: "Imagens do slider (troca em fade)",
      },
      { key: "delay", kind: "number", label: "Tempo parado do slider (ms)" },
      { key: "speed", kind: "number", label: "Duração do fade (ms)" },
      { key: "eyebrow", kind: "text", label: "Sobretítulo" },
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "question", kind: "text", label: "Título" },
          { key: "answer", kind: "textarea", label: "Texto" },
        ],
        key: "toggle",
        kind: "list",
        label: "Toggle (começa fechado)",
      },
      ...btnFields(),
      { key: "bgImage", kind: "image", label: "Imagem de fundo" },
    ],
    group: "content",
    label: "Grana: destaques, slider e toggle",
    render: (p, ctx) => (
      <section className="gh-feat" style={bgStyle(p.bgImage)}>
        <div className="gh-feat-in">
          <div className="gh-feat-grid">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do destaque
              <div className="gh-feat-item" key={i}>
                <span className="gh-feat-ic">
                  <GhIcon name={it.icon} />
                </span>
                <h4 className="gh-h gh-h4">{it.title}</h4>
                {it.text ? <p>{it.text}</p> : null}
              </div>
            ))}
          </div>
          <div className="gh-map">
            <div className="gh-map-slider gh-car">
              <SiCar
                arrows="inside"
                dots
                items={p.slides.map(s => (
                  <Img alt={s.alt} key={s.image} src={s.image} />
                ))}
                p={{
                  delay: p.delay,
                  gap: 0,
                  perView: 1,
                  perViewMobile: 1,
                  perViewTablet: 1,
                  speed: p.speed,
                }}
                transition="fade"
              />
            </div>
            <div className="gh-map-copy">
              <div className="gh-map-head">
                {p.eyebrow ? <p className="gh-eyebrow">{p.eyebrow}</p> : null}
                {p.title ? <h2 className="gh-h gh-h2">{p.title}</h2> : null}
                {p.text ? <p>{p.text}</p> : null}
              </div>
              <div className="gh-map-toggle">
                <Accordion
                  items={p.toggle.map(t => ({
                    answer: t.answer,
                    question: t.question,
                  }))}
                />
              </div>
              <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
            </div>
          </div>
        </div>
      </section>
    ),
    type: "ghFeatures",
  }
);

/* ───────────────────────── "Vire o Jogo" ───────────────────────── */

const ghBanner = defineBlock(
  z.object({
    boxImage: str(),
    buttonLabel: str("Adquirir agora"),
    buttonUrl: str("#oferta"),
    endButtonLabel: str("Adquirir agora"),
    endButtonUrl: str("#oferta"),
    endTitle: str(),
    image: str(),
    imageAlt: str(),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "boxImage", kind: "image", label: "Imagem de fundo da 1ª coluna" },
      { key: "title", kind: "text", label: "Título da caixa" },
      { key: "text", kind: "textarea", label: "Texto da caixa" },
      ...btnFields(" da caixa"),
      { key: "image", kind: "image", label: "Imagem central" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da imagem" },
      { key: "endTitle", kind: "textarea", label: "Chamada final" },
      { key: "endButtonLabel", kind: "text", label: "Texto do botão final" },
      { key: "endButtonUrl", kind: "url", label: "Link do botão final" },
    ],
    group: "layout",
    label: "Grana: três colunas (caixa, imagem, chamada)",
    render: (p, ctx) => (
      <section className="gh-ban">
        <div
          className="gh-ban-1"
          style={
            p.boxImage
              ? ({ "--gh-img": cssUrl(p.boxImage) } as CSSProperties)
              : undefined
          }
        >
          <div className="gh-ban-box">
            {p.title ? <h4 className="gh-h gh-h4">{p.title}</h4> : null}
            {p.text ? <p>{p.text}</p> : null}
            <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
        </div>
        <div className="gh-ban-2">
          <Img alt={p.imageAlt} src={p.image} />
        </div>
        <div className="gh-ban-3">
          {p.endTitle ? (
            <h2 className="gh-h gh-h2">{multiline(p.endTitle)}</h2>
          ) : null}
          <Btn ctx={ctx} label={p.endButtonLabel} url={p.endButtonUrl} />
        </div>
      </section>
    ),
    type: "ghBanner",
  }
);

/* ───────────────────────── passos 01 / 02 ───────────────────────── */

const ghSteps = defineBlock(
  z.object({
    bgImage: str(),
    steps: list({
      buttonLabel: str("Adquirir agora"),
      buttonUrl: str("#oferta"),
      caption: str(),
      eyebrow: str(),
      image: str(),
      number: str(),
      text: str(),
      title: str(),
    }),
  }),
  {
    fields: [
      { key: "bgImage", kind: "image", label: "Imagem de fundo" },
      {
        itemFields: [
          { key: "number", kind: "text", label: "Número (vazado)" },
          { key: "eyebrow", kind: "text", label: "Sobretítulo" },
          { key: "title", kind: "textarea", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "buttonLabel", kind: "text", label: "Texto do botão" },
          { key: "buttonUrl", kind: "url", label: "Link do botão" },
          { key: "image", kind: "image", label: "Imagem do cartão" },
          { key: "caption", kind: "text", label: "Legenda do cartão" },
        ],
        key: "steps",
        kind: "list",
        label: "Passos (o texto alterna de lado, começando à esquerda)",
      },
    ],
    group: "content",
    label: "Grana: passos numerados com cartão de imagem",
    render: (p, ctx) => (
      <section className="gh-steps" style={bgStyle(p.bgImage)}>
        <div className="gh-steps-in">
          {p.steps.map((s, i) => {
            const copy = (
              <div className="gh-step-copy" key="copy">
                {s.number ? <p className="gh-num">{s.number}</p> : null}
                {s.eyebrow ? <p className="gh-eyebrow">{s.eyebrow}</p> : null}
                {s.title ? <h3 className="gh-h gh-h2">{s.title}</h3> : null}
                {s.text ? <p>{s.text}</p> : null}
                <Btn ctx={ctx} label={s.buttonLabel} url={s.buttonUrl} />
              </div>
            );
            const card = (
              <div
                className="gh-step-card"
                key="card"
                style={
                  s.image
                    ? ({ "--gh-img": cssUrl(s.image) } as CSSProperties)
                    : undefined
                }
              >
                {s.caption ? (
                  <h4 className="gh-h gh-h4 gh-step-cap">{s.caption}</h4>
                ) : null}
              </div>
            );
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do passo
              <div className={cls("gh-step", i % 2 === 1 && "rev")} key={i}>
                {i % 2 === 1 ? [card, copy] : [copy, card]}
              </div>
            );
          })}
        </div>
      </section>
    ),
    type: "ghSteps",
  }
);

/* ───────────────────────── bônus ───────────────────────── */

const ghBonus = defineBlock(
  z.object({
    bonusLabel: str("Bônus"),
    buttonLabel: str("Acessar"),
    buttonUrl: str("#oferta"),
    eyebrow: str(),
    image: str(),
    imageAlt: str(),
    items: list({
      credit: str(),
      icon: str("star"),
      image: str(),
      title: str(),
    }),
    title: str(),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem (sobre o fundo roxo)" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da imagem" },
      { key: "eyebrow", kind: "text", label: "Sobretítulo" },
      { key: "title", kind: "textarea", label: "Título" },
      {
        key: "bonusLabel",
        kind: "text",
        label: 'Rótulo do número ("Bônus" → Bônus 1, Bônus 2…)',
      },
      ...btnFields(" de cada bônus"),
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          { key: "credit", kind: "text", label: "Linha de crédito" },
          {
            key: "icon",
            kind: "select",
            label: "Ícone da miniatura (sem imagem)",
            options: ICON_OPTIONS,
          },
          { key: "image", kind: "image", label: "Miniatura (opcional)" },
        ],
        key: "items",
        kind: "list",
        label: "Bônus",
      },
    ],
    group: "content",
    label: "Grana: bônus (imagem sobre roxo + lista)",
    render: (p, ctx) => (
      <section className="gh-bonus">
        <div className="gh-bonus-img">
          <Img alt={p.imageAlt} src={p.image} />
        </div>
        <div className="gh-bonus-panel">
          <div className="gh-bonus-head">
            {p.eyebrow ? <p className="gh-eyebrow">{p.eyebrow}</p> : null}
            {p.title ? <h2 className="gh-h gh-h2">{p.title}</h2> : null}
          </div>
          <div className="gh-bonus-list">
            {p.items.map((b, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do bônus
              <div className="gh-bonus-item" key={i}>
                <div className="gh-bthumb">
                  {b.image ? (
                    <img alt="" loading="lazy" src={b.image} />
                  ) : (
                    <GhIcon name={b.icon} />
                  )}
                </div>
                <div className="gh-bonus-txt">
                  <h4 className="gh-h gh-h4">{b.title}</h4>
                  {b.credit ? <p>{b.credit}</p> : null}
                </div>
                <div className="gh-bonus-side">
                  <h4 className="gh-h gh-h4">
                    {p.bonusLabel} {i + 1}
                  </h4>
                  <Btn
                    className="sm"
                    ctx={ctx}
                    label={p.buttonLabel}
                    url={p.buttonUrl}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "ghBonus",
  }
);

/* ───────────────────────── oferta ───────────────────────── */

const ghOffer = defineBlock(
  z.object({
    bgImage: str(),
    bullets: str(),
    buttonLabel: str("ADQUIRIR AGORA"),
    buttonUrl: str(),
    cardKicker: str(),
    cardTitle: str(),
    discount: str(),
    eyebrow: str(),
    lead: str(),
    price: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Sobretítulo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "lead", kind: "textarea", label: "Texto" },
      { key: "cardTitle", kind: "text", label: "Título do cartão" },
      { key: "cardKicker", kind: "text", label: "Frase colorida do cartão" },
      { key: "price", kind: "text", label: "Preço" },
      { key: "discount", kind: "text", label: "Desconto" },
      {
        key: "bullets",
        kind: "textarea",
        label: "Lista com check (um item por linha)",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão de compra" },
      { key: "buttonUrl", kind: "url", label: "Link do botão de compra" },
      { key: "bgImage", kind: "image", label: "Imagem de fundo" },
    ],
    group: "content",
    label: "Grana: oferta (cartão de preço)",
    render: (p, ctx) => (
      <section className="gh-offer" style={bgStyle(p.bgImage)}>
        <div className="gh-offer-head">
          {p.eyebrow ? <p className="gh-eyebrow">{p.eyebrow}</p> : null}
          {p.title ? <h2 className="gh-h gh-h2">{p.title}</h2> : null}
          {p.lead ? <p className="gh-offer-lead">{p.lead}</p> : null}
        </div>
        <div className="gh-offer-card">
          {p.cardTitle ? (
            <h2 className="gh-h gh-offer-title">{p.cardTitle}</h2>
          ) : null}
          {p.cardKicker ? (
            <p className="gh-h gh-offer-kicker">{p.cardKicker}</p>
          ) : null}
          {p.price ? <p className="gh-offer-price">{p.price}</p> : null}
          {p.discount ? <p className="gh-offer-disc">{p.discount}</p> : null}
          {lines(p.bullets).length ? (
            <ul className="gh-offer-list">
              {lines(p.bullets).map((t, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do item
                <li key={i}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Btn
            className="lg"
            ctx={ctx}
            label={p.buttonLabel}
            url={p.buttonUrl}
          />
        </div>
      </section>
    ),
    type: "ghOffer",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const ghTestimonials = defineBlock(
  z.object({
    bgImage: str(),
    delay: int(500, 30000, 5000),
    items: list({ name: str(), photo: str(), role: str(), text: str() }),
    speed: int(100, 5000, 500),
  }),
  {
    fields: [
      { key: "bgImage", kind: "image", label: "Imagem de fundo" },
      { key: "delay", kind: "number", label: "Tempo parado entre passes (ms)" },
      { key: "speed", kind: "number", label: "Duração da transição (ms)" },
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
          { key: "photo", kind: "image", label: "Foto" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos (1 por vez)",
      },
    ],
    group: "content",
    label: "Grana: carrossel de depoimentos",
    render: p => (
      <section className="gh-test" style={bgStyle(p.bgImage)}>
        <div className="gh-test-in">
          <div className="gh-test-car gh-car">
            <SiCar
              arrows="inside"
              dots
              items={p.items.map((t, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do depoimento
                <figure className="gh-tq" key={i}>
                  <p className="gh-tq-text">{t.text}</p>
                  <div className="gh-tq-who">
                    {t.photo ? (
                      <img
                        alt={t.name}
                        className="gh-tq-photo"
                        loading="lazy"
                        src={t.photo}
                      />
                    ) : null}
                    <div>
                      <h4 className="gh-h gh-tq-name">{t.name}</h4>
                      <p className="gh-tq-role">{t.role}</p>
                    </div>
                  </div>
                </figure>
              ))}
              p={{
                delay: p.delay,
                gap: 0,
                perView: 1,
                perViewMobile: 1,
                perViewTablet: 1,
                speed: p.speed,
              }}
            />
          </div>
        </div>
      </section>
    ),
    type: "ghTestimonials",
  }
);

/* ───────────────────────── FAQ ───────────────────────── */

const ghFaq = defineBlock(
  z.object({
    bgImage: str(),
    eyebrow: str(),
    intro: str(),
    items: list({ answer: str(), question: str() }),
    openFirst: z.enum(["yes", "no"]).default("no").catch("no"),
    title: str(),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Sobretítulo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "intro", kind: "textarea", label: "Texto" },
      {
        key: "openFirst",
        kind: "select",
        label: "Primeira pergunta",
        options: [
          { label: "Fechada", value: "no" },
          { label: "Aberta", value: "yes" },
        ],
      },
      {
        itemFields: [
          { key: "question", kind: "text", label: "Pergunta" },
          { key: "answer", kind: "textarea", label: "Resposta" },
        ],
        key: "items",
        kind: "list",
        label: "Perguntas",
      },
      { key: "bgImage", kind: "image", label: "Imagem de fundo" },
    ],
    group: "content",
    label: "Grana: perguntas frequentes (chevron e linhas)",
    render: p => (
      <section className="gh-faq" style={bgStyle(p.bgImage)}>
        <div className="gh-faq-in">
          <div className="gh-faq-head">
            {p.eyebrow ? <p className="gh-eyebrow">{p.eyebrow}</p> : null}
            {p.title ? <h2 className="gh-h gh-h2">{p.title}</h2> : null}
            {p.intro ? <p>{p.intro}</p> : null}
          </div>
          <div className="gh-faq-list">
            <Accordion items={p.items} openFirst={p.openFirst === "yes"} />
          </div>
        </div>
      </section>
    ),
    type: "ghFaq",
  }
);

export const granaBlocks: BlockDefinition[] = [
  ghHero,
  ghFeatures,
  ghBanner,
  ghSteps,
  ghBonus,
  ghOffer,
  ghTestimonials,
  ghFaq,
];
