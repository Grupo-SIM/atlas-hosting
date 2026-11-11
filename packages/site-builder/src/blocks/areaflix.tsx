import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { frameProps } from "./frame.js";
import { href, Img, newTab } from "./helpers.js";
import type { BlockDefinition, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos do tema ÁreaFlix (landing escura de plataforma de cursos, gradiente amarelo→laranja). Todo texto,
 * imagem, link e item é prop editável; o visual vem de `renderer/areaflix.ts` (escopo `.sb-af`).
 */
const str = (d = "") => z.string().default(d);

const bg = (url: string) => ({ "--af-bg": cssUrl(url) }) as CSSProperties;

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

const buttonFields = [
  { key: "button1Label", kind: "text", label: "Botão com contorno — texto" },
  { key: "button1Url", kind: "url", label: "Botão com contorno — link" },
  { key: "button2Label", kind: "text", label: "Botão em gradiente — texto" },
  { key: "button2Url", kind: "url", label: "Botão em gradiente — link" },
] as const;

/* ───────────────────────── cabeçalho ───────────────────────── */

const afHeader = defineBlock(
  z.object({
    button1Label: str("Área admin"),
    button1Url: str("#"),
    button2Label: str("Área do Aluno"),
    button2Url: str("#"),
    logo: str(),
    logoUrl: str("/"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
      ...buttonFields,
    ],
    group: "layout",
    label: "Cabeçalho ÁreaFlix",
    render: (p, ctx) => (
      <header className="sb-af-head">
        <div className="sb-af-wrap sb-af-head-in">
          <span aria-hidden="true" className="sb-af-head-gap" />
          <a className="sb-af-logo" href={href(ctx, p.logoUrl)}>
            <Img alt="Logo" src={p.logo} />
          </a>
          <div className="sb-af-btns sb-af-head-btns">
            <Btn
              className="sb-af-btn ghost"
              ctx={ctx}
              label={p.button1Label}
              url={p.button1Url}
            />
            <Btn
              className="sb-af-btn fill"
              ctx={ctx}
              label={p.button2Label}
              url={p.button2Url}
            />
          </div>
        </div>
      </header>
    ),
    type: "afHeader",
  }
);

/* ───────────────────────── hero e introdução ───────────────────────── */

const afHero = defineBlock(
  z.object({
    background: str(),
    button1Label: str("Fazer minha assinatura"),
    button1Url: str("#"),
    button2Label: str("Ver plataforma por dentro"),
    button2Url: str("#"),
    text: str(),
    title: str("Sua própria plataforma"),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...buttonFields,
      { key: "background", kind: "image", label: "Imagem de fundo" },
    ],
    group: "content",
    label: "Hero ÁreaFlix",
    render: (p, ctx) => (
      <section className="sb-af-hero" style={bg(p.background)}>
        <div className="sb-af-hero-in">
          <h1>{p.title}</h1>
          <p className="sb-af-hero-text">{p.text}</p>
          <div className="sb-af-btns">
            <Btn
              className="sb-af-btn ghost"
              ctx={ctx}
              label={p.button1Label}
              url={p.button1Url}
            />
            <Btn
              className="sb-af-btn fill"
              ctx={ctx}
              label={p.button2Label}
              url={p.button2Url}
            />
          </div>
        </div>
      </section>
    ),
    type: "afHero",
  }
);

const afIntro = defineBlock(
  z.object({ text: str(), title: str("Título da seção") }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
    ],
    group: "content",
    label: "Introdução ÁreaFlix",
    render: p => (
      <section className="sb-af-intro">
        <div className="sb-af-wrap">
          <h3>{p.title}</h3>
          <p>{p.text}</p>
        </div>
      </section>
    ),
    type: "afIntro",
  }
);

/* ───────────────────────── cartões com hover ───────────────────────── */

const PLAY_ICON = (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10.5" stroke="currentColor" />
    <path d="M10 8.2v7.6l6-3.8z" stroke="currentColor" strokeLinejoin="round" />
  </svg>
);

const afCtaCards = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          buttonLabel: str("Assinar"),
          buttonUrl: str("#"),
          image: str(),
          text: str(),
          title: str(),
        })
      )
      .default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem do cartão" },
          { key: "title", kind: "text", label: "Título (aparece no hover)" },
          { key: "text", kind: "textarea", label: "Texto (aparece no hover)" },
          { key: "buttonLabel", kind: "text", label: "Texto do botão" },
          { key: "buttonUrl", kind: "url", label: "Link do botão" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "Cartões com hover (ÁreaFlix)",
    render: (p, ctx) => (
      <section className="sb-af-cta">
        {p.items.map((it, i) => (
          <div className="sb-af-cta-cell" key={`${it.title}-${i}`}>
            <div className="sb-af-cta-card">
              <div className="sb-af-cta-bg" style={bg(it.image)} />
              <div className="sb-af-cta-ov" />
              <div className="sb-af-cta-item">{PLAY_ICON}</div>
              <h5 className="sb-af-cta-item">{it.title}</h5>
              <div className="sb-af-cta-item">{it.text}</div>
              <div className="sb-af-cta-item">
                <Btn
                  className="sb-af-cta-btn"
                  ctx={ctx}
                  label={it.buttonLabel}
                  url={it.buttonUrl}
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    ),
    type: "afCtaCards",
  }
);

const afBoxes = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), text: str(), title: str() }))
      .default([]),
    text: str(),
    title: str("Título da seção"),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Caixas",
      },
    ],
    group: "content",
    label: "Caixas com imagem (ÁreaFlix)",
    render: p => (
      <section className="sb-af-boxes">
        <div className="sb-af-wrap sb-af-boxes-col">
          <h2>{p.title}</h2>
          <p className="sb-af-boxes-text">{p.text}</p>
          <div className="sb-af-box-grid">
            {p.items.map((it, i) => (
              <div className="sb-af-box-cell" key={`${it.title}-${i}`}>
                <div className="sb-af-box">
                  <Img alt="" src={it.image} />
                  <div className="sb-af-box-body">
                    <h3>{it.title}</h3>
                    <p>{it.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "afBoxes",
  }
);

/* ───────────────────────── vídeo ───────────────────────── */

const afVideoSplit = defineBlock(
  z.object({
    background: str(),
    buttonLabel: str("Fazer minha assinatura"),
    buttonUrl: str("#"),
    text: str(),
    title: str("Veja a plataforma"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "videoUrl", kind: "url", label: "Vídeo (YouTube ou Vimeo)" },
      { key: "background", kind: "image", label: "Imagem de fundo" },
    ],
    group: "media",
    label: "Texto e vídeo (ÁreaFlix)",
    render: (p, ctx) => {
      const src = popupVideoEmbed(p.videoUrl);
      return (
        <section className="sb-af-video" style={bg(p.background)}>
          <div className="sb-af-wrap sb-af-video-in">
            <div className="sb-af-video-text">
              <h2>{p.title}</h2>
              <p>{p.text}</p>
              <Btn
                className="sb-af-pill"
                ctx={ctx}
                label={p.buttonLabel}
                url={p.buttonUrl}
              />
            </div>
            <div className="sb-af-video-side">
              <div className="sb-af-video-frame">
                {src ? (
                  <iframe
                    allow="fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    {...frameProps(ctx, src)}
                    title={p.title}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "afVideoSplit",
  }
);

/* ───────────────────────── planos ───────────────────────── */

const lines = (text: string) => text.split("\n").map(l => l.trim());

const afPricing = defineBlock(
  z.object({
    features: str(),
    guaranteeText: str(),
    guaranteeTitle: str(),
    plans: z
      .array(
        z.object({
          buttonLabel: str("Assinar plano"),
          buttonUrl: str("#"),
          details: str(),
          name: str(),
          price: str(),
          values: str(),
        })
      )
      .default([]),
    subtitle: str(),
    title: str("Planos"),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        key: "features",
        kind: "textarea",
        label: "Linhas da tabela (uma por linha)",
      },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome do plano" },
          {
            key: "values",
            kind: "textarea",
            label: "Valores (um por linha, na ordem das linhas da tabela)",
          },
          { key: "price", kind: "text", label: "Preço" },
          { key: "details", kind: "textarea", label: "Detalhes do preço" },
          { key: "buttonLabel", kind: "text", label: "Texto do botão" },
          { key: "buttonUrl", kind: "url", label: "Link do botão (checkout)" },
        ],
        key: "plans",
        kind: "list",
        label: "Planos (colunas)",
      },
      { key: "guaranteeTitle", kind: "text", label: "Garantia — título" },
      { key: "guaranteeText", kind: "textarea", label: "Garantia — texto" },
    ],
    group: "content",
    label: "Tabela de planos (ÁreaFlix)",
    render: (p, ctx) => {
      const rows = lines(p.features).filter(Boolean);
      const values = p.plans.map(plan => lines(plan.values));
      return (
        <section className="sb-af-wrap sb-af-price">
          <h2>{p.title}</h2>
          <p className="sb-af-price-sub">{p.subtitle}</p>
          <div className="sb-af-table-box">
            <table className="sb-af-table">
              <tbody>
                <tr>
                  <th aria-label="Recurso" />
                  {p.plans.map((plan, i) => (
                    <th key={`${plan.name}-${i}`}>{plan.name}</th>
                  ))}
                </tr>
                {rows.map((row, r) => (
                  <tr key={`${row}-${r}`}>
                    <td className="feature">{row}</td>
                    {values.map((v, c) => {
                      const value = v[r] ?? "";
                      return (
                        <td key={`${c}-${value}`}>
                          {/\d/.test(value) ? (
                            value
                          ) : (
                            <span className="sb-af-soon">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="feature" />
                  {p.plans.map((plan, i) => (
                    <td key={`${plan.name}-${i}`}>
                      <div className="sb-af-plan-price">{plan.price}</div>
                      <div className="sb-af-plan-info">{plan.details}</div>
                      <Btn
                        className="sb-af-pill"
                        ctx={ctx}
                        label={plan.buttonLabel}
                        url={plan.buttonUrl}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <h3>{p.guaranteeTitle}</h3>
          <p className="sb-af-guarantee">{p.guaranteeText}</p>
        </section>
      );
    },
    type: "afPricing",
  }
);

/* ───────────────────────── depoimentos e FAQ ───────────────────────── */

const afTestimonials = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), name: str(), quote: str(), role: str() }))
      .default([]),
    seconds: z.coerce.number().int().min(2).max(30).default(5).catch(5),
    text: str(),
    title: str("Depoimentos"),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "quote", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Profissão" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
      { key: "seconds", kind: "number", label: "Segundos entre os slides" },
    ],
    group: "content",
    label: "Carrossel de depoimentos (ÁreaFlix)",
    render: p => (
      <section className="sb-af-testi">
        <div className="sb-af-wrap sb-af-testi-in">
          <h2>{p.title}</h2>
          <p>{p.text}</p>
          <div className="sb-cslider sb-af-car" data-sec={p.seconds}>
            <div className="sb-cslider-track">
              {p.items.map((t, i) => (
                <figure className="sb-af-t" key={`${t.name}-${i}`}>
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
            <div className="sb-cslider-nav">
              <button aria-label="Anterior" type="button">
                ‹
              </button>
              <button aria-label="Próximo" type="button">
                ›
              </button>
            </div>
            <div className="sb-af-dots">
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
    type: "afTestimonials",
  }
);

const afFaq = defineBlock(
  z.object({
    items: z.array(z.object({ answer: str(), question: str() })).default([]),
    kicker: str("FAQ"),
    text: str(),
    title: str("Perguntas Frequentes"),
  }),
  {
    fields: [
      { key: "kicker", kind: "text", label: "Texto acima do título" },
      { key: "title", kind: "textarea", label: "Título" },
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
    ],
    group: "content",
    label: "Perguntas frequentes (ÁreaFlix)",
    render: (p, ctx) => {
      const group = `sb-af-faq-${ctx.path?.length ?? 0}`;
      return (
        <section className="sb-af-faq">
          <div className="sb-af-wrap sb-af-faq-in">
            <div className="sb-af-faq-side">
              <h6>{p.kicker}</h6>
              <h2>{p.title}</h2>
              <p>{p.text}</p>
            </div>
            <div className="sb-af-faq-list">
              {p.items.map((it, i) => (
                <details
                  key={`${it.question}-${i}`}
                  name={group}
                  open={i === 0}
                >
                  <summary>{it.question}</summary>
                  <div className="sb-af-faq-a">{it.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    },
    type: "afFaq",
  }
);

const afFooter = defineBlock(z.object({ text: str() }), {
  fields: [{ key: "text", kind: "text", label: "Texto do rodapé" }],
  group: "layout",
  label: "Rodapé ÁreaFlix",
  render: p => (
    <footer className="sb-af-foot">
      <p>{p.text}</p>
    </footer>
  ),
  type: "afFooter",
});

export const areaflixBlocks: BlockDefinition[] = [
  afHeader,
  afHero,
  afIntro,
  afCtaCards,
  afBoxes,
  afVideoSplit,
  afPricing,
  afTestimonials,
  afFaq,
  afFooter,
];
