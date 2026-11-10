import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, newTab } from "./helpers.js";
import type { BlockDefinition, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos do tema Resolvit (landing clara de método de saúde, azul `#0028ff`). Todo texto, imagem, link e item é
 * prop editável; o visual vem de `renderer/resolvit.ts` (escopo `.sb-rv`). A ordem dos filhos de cada bloco é a que
 * `Block.fx` do template usa nos caminhos (`nth-child`): não reordene sem atualizar o template.
 */
const str = (d = "") => z.string().default(d).catch(d);

const bg = (url: string) => ({ "--rv-bg": cssUrl(url) }) as CSSProperties;

const ICONS = {
  arrow: (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 11h11.200l-4.600-4.600L13 5l7 7-7 7-1.400-1.400 4.600-4.600H5z" />
    </svg>
  ),
  heart: (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.5 5c2 0 3.5 1.1 5.5 3.2C14 6.1 15.500 5 17.500 5 21 5 22.800 8.600 21.500 11.800 19.500 16.400 12 21 12 21z" />
    </svg>
  ),
  play: (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5.500 6.500 4.500-6.500 4.500z" />
    </svg>
  ),
  shield: (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2 4 5v6c0 5 3.400 9.300 8 11 4.600-1.700 8-6 8-11V5zm-1.200 14.500L7 12.700l1.400-1.400 2.400 2.400 4.800-4.800 1.400 1.400z" />
    </svg>
  ),
} as const;

const ICON_OPTIONS = [
  { label: "Escudo", value: "shield" },
  { label: "Coração", value: "heart" },
];

const iconOf = (v: string) => (v === "heart" ? ICONS.heart : ICONS.shield);

function Btn({
  className,
  ctx,
  label,
  url,
}: {
  className: string;
  ctx: RenderContext;
  label: string;
  url: string;
}) {
  if (!label) return null;
  return (
    <a className={className} href={href(ctx, url)} {...newTab(url)}>
      {label}
    </a>
  );
}

const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

/* ───────────────────────── cabeçalho e hero ───────────────────────── */

const rvHeader = defineBlock(
  z.object({
    buttonLabel: str("Acessar agora"),
    buttonUrl: str("#oferta"),
    logo: str(),
    logoUrl: str("/"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
    ],
    group: "layout",
    label: "Cabeçalho Resolvit",
    render: (p, ctx) => (
      <header className="sb-rv-head">
        <div className="sb-rv-wrap sb-rv-head-in">
          <a className="sb-rv-logo" href={href(ctx, p.logoUrl)}>
            <Img alt="Logo" src={p.logo} />
          </a>
          <Btn
            className="sb-rv-btn"
            ctx={ctx}
            label={p.buttonLabel}
            url={p.buttonUrl}
          />
        </div>
      </header>
    ),
    type: "rvHeader",
  }
);

const rvHero = defineBlock(
  z.object({
    buttonLabel: str("Começar Minha Transformação"),
    buttonUrl: str("#oferta"),
    text: str(),
    title: str("Título principal"),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
    ],
    group: "content",
    label: "Hero Resolvit",
    // filhos: 1 = h1, 2 = texto, 3 = botão
    render: (p, ctx) => (
      <section className="sb-rv-hero">
        <div className="sb-rv-wrap sb-rv-hero-in">
          <h1>{p.title}</h1>
          <p className="sb-rv-hero-text">{p.text}</p>
          <Btn
            className="sb-rv-btn shadow"
            ctx={ctx}
            label={p.buttonLabel}
            url={p.buttonUrl}
          />
        </div>
      </section>
    ),
    type: "rvHero",
  }
);

/* ───────────────────────── confiança e dor ───────────────────────── */

const rvTrust = defineBlock(
  z.object({
    cards: z
      .array(z.object({ icon: str("shield"), text: str(), title: str() }))
      .default([]),
    image: str(),
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
          { key: "text", kind: "text", label: "Texto" },
        ],
        key: "cards",
        kind: "list",
        label: "Cartões",
      },
      { key: "image", kind: "image", label: "Foto (caixa azul)" },
    ],
    group: "content",
    label: "Cartões de confiança (Resolvit)",
    // filhos: 1 = coluna dos cartões (cada cartão é um filho), 2 = caixa da foto
    render: p => (
      <section className="sb-rv-wrap sb-rv-trust">
        <div className="sb-rv-trust-cards">
          {p.cards.map((c, i) => (
            <div className="sb-rv-tcard" key={`${c.title}-${i}`}>
              <span className="sb-rv-ticon">{iconOf(c.icon)}</span>
              <h5>{c.title}</h5>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
        <div className="sb-rv-photo">
          <Img alt="" src={p.image} />
        </div>
      </section>
    ),
    type: "rvTrust",
  }
);

const rvPain = defineBlock(
  z.object({
    heading: str(),
    imageA: str(),
    imageB: str(),
    text: str(),
    title1: str("QUANTO VALE PARA VOCÊ"),
    title2: str("PARAR AS DORES?"),
    videoLabel: str("Assista agora:"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "title1", kind: "text", label: "Faixa — linha 1" },
      { key: "title2", kind: "text", label: "Faixa — linha 2 (azul)" },
      { key: "heading", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "videoLabel", kind: "text", label: "Chamada do vídeo" },
      { key: "videoUrl", kind: "url", label: "Vídeo (YouTube ou Vimeo)" },
      { key: "imageA", kind: "image", label: "Foto 1" },
      { key: "imageB", kind: "image", label: "Foto 2" },
    ],
    group: "content",
    label: "Dor e vídeo (Resolvit)",
    // filhos: 1 = faixa de título, 2 = texto + vídeo, 3 = foto 1, 4 = foto 2
    render: p => {
      const embed = popupVideoEmbed(p.videoUrl);
      return (
        <section className="sb-rv-wrap sb-rv-pain">
          <div className="sb-rv-pain-title">
            <h2>{p.title1}</h2>
            <h2 className="blue">{p.title2}</h2>
          </div>
          <div className="sb-rv-pain-copy">
            <h2>{p.heading}</h2>
            <p>{p.text}</p>
            <h6>{p.videoLabel}</h6>
            {p.videoUrl ? (
              <a
                aria-label="Assistir ao vídeo"
                className="sb-rv-play"
                data-sb-video={embed ?? undefined}
                href={p.videoUrl}
                {...newTab(p.videoUrl)}
              >
                {ICONS.play}
              </a>
            ) : null}
          </div>
          <div className="sb-rv-pain-img a">
            <Img alt="" src={p.imageA} />
          </div>
          <div className="sb-rv-pain-img b">
            <Img alt="" src={p.imageB} />
          </div>
        </section>
      );
    },
    type: "rvPain",
  }
);

/* ───────────────────────── método e mudança ───────────────────────── */

const rvMethod = defineBlock(
  z.object({
    background: str(),
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    text: str(),
    title: str("Método"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
      { key: "background", kind: "image", label: "Imagem de fundo (opcional)" },
    ],
    group: "content",
    label: "Método (Resolvit)",
    // filhos: 1 = título, 2 = texto, 3 = botão
    render: (p, ctx) => (
      <section className="sb-rv-method" style={bg(p.background)}>
        <div className="sb-rv-wrap sb-rv-method-in">
          <h2>{p.title}</h2>
          <p>{p.text}</p>
          <Btn
            className="sb-rv-btn shadow"
            ctx={ctx}
            label={p.buttonLabel}
            url={p.buttonUrl}
          />
        </div>
      </section>
    ),
    type: "rvMethod",
  }
);

const rvChange = defineBlock(
  z.object({
    background: str(),
    boxText: str(),
    boxUrl: str("#"),
    image: str(),
    titleBlack: str("Real"),
    titleBlue: str("Mudança"),
  }),
  {
    fields: [
      { key: "titleBlue", kind: "text", label: "Título — palavra azul" },
      { key: "titleBlack", kind: "text", label: "Título — palavra preta" },
      { key: "background", kind: "image", label: "Imagem de fundo do título" },
      { key: "boxText", kind: "textarea", label: "Texto da caixa azul" },
      { key: "boxUrl", kind: "url", label: "Link da caixa azul" },
      { key: "image", kind: "image", label: "Foto (só no computador)" },
    ],
    group: "content",
    label: "Mudança real (Resolvit)",
    // filhos: 1 = título, 2 = caixa azul, 3 = foto
    render: (p, ctx) => (
      <section className="sb-rv-wrap sb-rv-change">
        <div className="sb-rv-change-title" style={bg(p.background)}>
          <h2 className="blue">{p.titleBlue}</h2>
          <h2>{p.titleBlack}</h2>
          <span className="sb-rv-ticon plain">{ICONS.arrow}</span>
        </div>
        <a className="sb-rv-change-box" href={href(ctx, p.boxUrl)}>
          <h5>{p.boxText}</h5>
        </a>
        <div className="sb-rv-change-img">
          <Img alt="" src={p.image} />
        </div>
      </section>
    ),
    type: "rvChange",
  }
);

/* ───────────────────────── o que você recebe ───────────────────────── */

const rvReceive = defineBlock(
  z.object({
    items: z
      .array(
        z.object({ image: str(), text: str(), title: str(), url: str("#") })
      )
      .default([]),
    title: str("O que você vai receber?"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem de fundo" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "O que você recebe (Resolvit)",
    // filhos: 1 = título, 2 = grade (um cartão por filho)
    render: (p, ctx) => (
      <section className="sb-rv-wrap sb-rv-receive">
        <h2>{p.title}</h2>
        <div className="sb-rv-rgrid">
          {p.items.map((it, i) => (
            <a
              className="sb-rv-rcard"
              href={href(ctx, it.url)}
              key={`${it.title}-${i}`}
              style={bg(it.image)}
            >
              <h5>{it.title}</h5>
              <p>{it.text}</p>
            </a>
          ))}
        </div>
      </section>
    ),
    type: "rvReceive",
  }
);

/* ───────────────────────── resultados (depoimentos) ───────────────────────── */

const rvResults = defineBlock(
  z.object({
    image: str(),
    items: z
      .array(z.object({ image: str(), name: str(), quote: str(), role: str() }))
      .default([]),
    kicker: str("Quem Já Viveu"),
    seconds: z.coerce.number().int().min(2).max(30).default(5).catch(5),
    text: str(),
    title: str("Resultados Reais"),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Foto (caixa azul)" },
      { key: "kicker", kind: "text", label: "Título pequeno" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "quote", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Legenda" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
      { key: "seconds", kind: "number", label: "Segundos entre os slides" },
    ],
    group: "content",
    label: "Resultados reais (Resolvit)",
    // filhos: 1 = caixa azul com a foto, 2 = coluna de texto + carrossel
    render: p => (
      <section className="sb-rv-wrap sb-rv-results">
        <div className="sb-rv-results-photo">
          <Img alt="" src={p.image} />
        </div>
        <div className="sb-rv-results-copy">
          <h2>{p.kicker}</h2>
          <h2 className="blue">{p.title}</h2>
          <p>{p.text}</p>
          <div className="sb-cslider sb-rv-car" data-sec={p.seconds}>
            <div className="sb-cslider-track">
              {p.items.map((t, i) => (
                <figure className="sb-rv-t" key={`${t.name}-${i}`}>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <Img alt="" src={t.image} />
                    <cite>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </cite>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="sb-rv-dots">
              {p.items.map((t, i) => (
                <button
                  aria-label={`Depoimento ${i + 1}`}
                  className={i === 0 ? "on" : undefined}
                  key={`${t.name}-${i}`}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    type: "rvResults",
  }
);

/* ───────────────────────── passos ───────────────────────── */

const rvSteps = defineBlock(
  z.object({
    background: str(),
    items: z.array(z.object({ text: str(), title: str() })).default([]),
    text: str(),
    title: str("Seu Novo Começo"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título do passo" },
          { key: "text", kind: "textarea", label: "Texto do passo" },
        ],
        key: "items",
        kind: "list",
        label: "Passos (numerados na ordem)",
      },
      { key: "background", kind: "image", label: "Imagem de fundo" },
    ],
    group: "content",
    label: "Passos (Resolvit)",
    // filhos: 1 = título, 2 = subtítulo, 3 = lista (um passo por filho)
    render: p => (
      <section className="sb-rv-steps" style={bg(p.background)}>
        <div className="sb-rv-steps-ov" />
        <div className="sb-rv-steps-in">
          <h2>{p.title}</h2>
          <p className="sb-rv-steps-sub">{p.text}</p>
          <div className="sb-rv-steps-list">
            {p.items.map((it, i) => (
              <div className="sb-rv-step" key={`${it.title}-${i}`}>
                <span className="sb-rv-num">{i + 1}</span>
                <h6>{it.title}</h6>
                <p>{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "rvSteps",
  }
);

const rvBanner = defineBlock(z.object({ image: str() }), {
  fields: [{ key: "image", kind: "image", label: "Imagem" }],
  group: "media",
  label: "Faixa de imagem (Resolvit)",
  render: p => (
    <div className="sb-rv-wrap sb-rv-banner">
      <Img alt="" src={p.image} />
    </div>
  ),
  type: "rvBanner",
});

/* ───────────────────────── oferta ───────────────────────── */

const rvOffer = defineBlock(
  z.object({
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#"),
    cardTitle: str(),
    currency: str("R$"),
    features: str(),
    kicker: str("Oferta Exclusiva"),
    period: str(),
    price: str("347"),
    title: str("Acesso Imediato"),
  }),
  {
    fields: [
      { key: "kicker", kind: "text", label: "Título pequeno" },
      { key: "title", kind: "text", label: "Título" },
      { key: "cardTitle", kind: "text", label: "Cartão — título" },
      { key: "currency", kind: "text", label: "Moeda" },
      { key: "price", kind: "text", label: "Preço" },
      { key: "period", kind: "text", label: "Texto ao lado do preço" },
      {
        key: "features",
        kind: "textarea",
        label: "Itens inclusos (um por linha)",
      },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link (checkout)" },
    ],
    group: "content",
    label: "Oferta (Resolvit)",
    // filhos: 1 = títulos, 2 = cartão de preço
    render: (p, ctx) => (
      <section className="sb-rv-wrap sb-rv-offer">
        <div className="sb-rv-offer-title">
          <h2>{p.kicker}</h2>
          <h2 className="blue">{p.title}</h2>
        </div>
        <div className="sb-rv-price">
          <h3>{p.cardTitle}</h3>
          <div className="sb-rv-price-v">
            <span className="cur">{p.currency}</span>
            <span className="int">{p.price}</span>
            <span className="per">{p.period}</span>
          </div>
          <ul>
            {lines(p.features).map((f, i) => (
              <li key={`${f}-${i}`}>{f}</li>
            ))}
          </ul>
          <Btn
            className="sb-rv-price-btn"
            ctx={ctx}
            label={p.buttonLabel}
            url={p.buttonUrl}
          />
        </div>
      </section>
    ),
    type: "rvOffer",
  }
);

/* ───────────────────────── FAQ e rodapé ───────────────────────── */

const rvFaq = defineBlock(
  z.object({
    image: str(),
    items: z.array(z.object({ answer: str(), question: str() })).default([]),
    text: str(),
    title: str("FAQs"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "question", kind: "text", label: "Pergunta" },
          { key: "answer", kind: "textarea", label: "Resposta" },
        ],
        key: "items",
        kind: "list",
        label: "Perguntas",
      },
      { key: "image", kind: "image", label: "Foto lateral" },
    ],
    group: "content",
    label: "Perguntas frequentes (Resolvit)",
    // filhos: 1 = cabeçalho, 2 = lista e foto
    render: (p, ctx) => {
      const group = `sb-rv-faq-${ctx.path?.length ?? 0}`;
      return (
        <section className="sb-rv-faq">
          <div className="sb-rv-wrap sb-rv-faq-in">
            <div className="sb-rv-faq-head">
              <h2>{p.title}</h2>
              <p>{p.text}</p>
            </div>
            <div className="sb-rv-faq-body">
              <div className="sb-rv-faq-list">
                {p.items.map((it, i) => (
                  <details key={`${it.question}-${i}`} name={group}>
                    <summary>{it.question}</summary>
                    <div className="sb-rv-faq-a">{it.answer}</div>
                  </details>
                ))}
              </div>
              <div className="sb-rv-faq-img" style={bg(p.image)} />
            </div>
          </div>
        </section>
      );
    },
    type: "rvFaq",
  }
);

const rvFooter = defineBlock(z.object({ text: str() }), {
  fields: [{ key: "text", kind: "text", label: "Texto do rodapé" }],
  group: "layout",
  label: "Rodapé Resolvit",
  render: p => (
    <footer className="sb-rv-foot">
      <p>{p.text}</p>
    </footer>
  ),
  type: "rvFooter",
});

export const resolvitBlocks: BlockDefinition[] = [
  rvHeader,
  rvHero,
  rvTrust,
  rvPain,
  rvMethod,
  rvChange,
  rvReceive,
  rvResults,
  rvSteps,
  rvBanner,
  rvOffer,
  rvFaq,
  rvFooter,
];
