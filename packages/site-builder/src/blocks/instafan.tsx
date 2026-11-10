import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { str, yesNo } from "./sim-lib.js";
import type { BlockDefinition } from "./types.js";

/**
 * Blocos da página de vendas "InstaFanFortune" (prefixo `if`, escopo `.sb-if`, CSS em `renderer/instafan.ts`). Todo
 * texto, imagem e link é prop. Nos títulos, `**trecho**` vira negrito (`<b>`, como no original).
 *
 * As camadas decorativas (brilhos e grade de quadrados) ficam dentro do `ifHero` e transbordam por trás das seções
 * seguintes — por isso o hero precisa vir antes das demais seções.
 *
 * Ordem dos filhos (da qual dependem os caminhos de `Block.fx`): em `ifOffer`, `1.2` é o cartão e o botão de compra é o
 * filho 5 dele (`1.2.5`).
 */

/* ───────────────────────── peças comuns ───────────────────────── */

const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

/** `**trecho**` vira negrito; o resto é texto puro. */
function Rich({ text }: { text: string }): ReactNode {
  return text.split("**").map((t, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
      <b key={i}>{t}</b>
    ) : (
      t
    )
  );
}

const imageVar = (name: string, url: string) =>
  ({ [name]: cssUrl(url) }) as CSSProperties;

/** Duplo "check" de traço (o original usa o `check-double` do Font Awesome). */
function CheckIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 512 512">
      <path d="M40 290l95 95 185-215" />
      <path d="M205 400l35 35 235-285" />
    </svg>
  );
}

/* ───────────────────────── cabeçalho ───────────────────────── */

const ifHeader = defineBlock(
  z.object({ logo: str(), name: str("InstaFanFortune") }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "name", kind: "text", label: "Nome ao lado da logo" },
    ],
    group: "layout",
    label: "Cabeçalho (InstaFanFortune)",
    render: p => (
      <header className="if-head">
        <Img alt="" className="if-logo" src={p.logo} />
        <h2 className="if-h if-brand">{p.name}</h2>
      </header>
    ),
    type: "ifHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

const DECORS = [1, 2, 3, 4, 5, 6, 7, 8];

const ifHero = defineBlock(
  z.object({
    button1Label: str("SABER MAIS"),
    button1Url: str("#cp1"),
    button2Label: str("ADQUIRIR AGORA"),
    button2Url: str("#cpcompra"),
    gridImage: str(),
    image: str(),
    line1: str("Renda **expressiva**"),
    line2: str("hoje **sem aparecer**"),
    text: str(),
  }),
  {
    fields: [
      {
        key: "line1",
        kind: "text",
        label: "Título, linha 1 (**trecho** = negrito)",
      },
      { key: "line2", kind: "text", label: "Título, linha 2" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "button1Label", kind: "text", label: "Texto do botão azul" },
      { key: "button1Url", kind: "url", label: "Link do botão azul" },
      { key: "button2Label", kind: "text", label: "Texto do botão escuro" },
      { key: "button2Url", kind: "url", label: "Link do botão escuro" },
      { key: "image", kind: "image", label: "Imagem do hero" },
      {
        key: "gridImage",
        kind: "image",
        label: "Grade de quadrados (camada decorativa)",
      },
    ],
    group: "content",
    label: "Hero (InstaFanFortune)",
    render: (p, ctx) => (
      <section
        className="if-sec if-hero"
        style={imageVar("--if-grid", p.gridImage)}
      >
        {DECORS.map(n => (
          <div aria-hidden="true" className={`if-decor if-d${n}`} key={n} />
        ))}
        <div className="if-hero-copy">
          <h1 className="if-t">
            <Rich text={p.line1} />
          </h1>
          <h2 className="if-t">
            <Rich text={p.line2} />
          </h2>
          <p className="if-sub">{p.text}</p>
          <div className="if-spacer" />
          <div className="if-btns">
            {p.button1Label ? (
              <div className="if-btn-wrap">
                <a className="if-btn a" href={href(ctx, p.button1Url)}>
                  {p.button1Label}
                </a>
              </div>
            ) : null}
            {p.button2Label ? (
              <div className="if-btn-wrap">
                <a className="if-btn b" href={href(ctx, p.button2Url)}>
                  {p.button2Label}
                </a>
              </div>
            ) : null}
          </div>
        </div>
        <div className="if-hero-img">
          <Img alt="" src={p.image} />
        </div>
      </section>
    ),
    type: "ifHero",
  }
);

/* ───────────────────────── método, benefícios e sobre ───────────────────────── */

/** Largura do texto, deslocamento e recuo à direita de cada linha do original (computador). */
const ITEM_LAYOUT = [
  { im: 26.5, ml: 0, r: 41, tw: 1041, w: 83 },
  { im: 30.5, ml: 25, r: 10, tw: 794, w: 95 },
  { im: 30.5, ml: 0, r: 17, tw: 561, w: 95 },
];

const ifBenefits = defineBlock(
  z.object({
    aboutBg: str(),
    aboutText: str(),
    aboutTitle: str("Sobre"),
    boxBg: str(),
    boxTitle: str("Vendas **todos os dias**"),
    items: z
      .array(z.object({ image: str(), text: str(), title: str() }))
      .default([])
      .catch([]),
    tabs: z
      .array(z.object({ title: str() }))
      .default([])
      .catch([]),
    tabsBg: str(),
    title: str("Método **atemporal** para a **liberdade**"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (**trecho** = negrito)" },
      { key: "tabsBg", kind: "image", label: "Contorno azul das 3 abas" },
      {
        itemFields: [{ key: "title", kind: "text", label: "Texto da aba" }],
        key: "tabs",
        kind: "list",
        label: "Abas (3)",
      },
      { key: "boxTitle", kind: "text", label: "Título da caixa à direita" },
      { key: "boxBg", kind: "image", label: "Moldura azul das caixas" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Ícone" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "text", label: "Subtítulo" },
        ],
        key: "items",
        kind: "list",
        label: "Benefícios (3)",
      },
      { key: "aboutTitle", kind: "text", label: "Título da caixa Sobre" },
      {
        key: "aboutText",
        kind: "textarea",
        label: "Texto do Sobre (linha em branco = novo parágrafo)",
      },
    ],
    group: "content",
    label: "Método e Sobre (InstaFanFortune)",
    render: p => (
      <section
        className="if-sec if-ben"
        style={
          {
            ...imageVar("--if-tabs", p.tabsBg),
            ...imageVar("--if-frame", p.boxBg),
          } as CSSProperties
        }
      >
        <h2 className="if-h if-ben-title">
          <Rich text={p.title} />
        </h2>
        <div className="if-tabs">
          {p.tabs.map((t, i) => (
            <div className="if-tab" key={t.title + i}>
              <h2 className="if-h if-tab-t">{t.title}</h2>
            </div>
          ))}
        </div>
        <div className="if-box-row">
          <div className="if-box">
            <h2 className="if-h if-box-t">
              <Rich text={p.boxTitle} />
            </h2>
          </div>
        </div>
        <div className="if-items">
          {p.items.map((it, i) => {
            const l = ITEM_LAYOUT[Math.min(i, ITEM_LAYOUT.length - 1)];
            return (
              <div
                className="if-item"
                key={it.title + i}
                style={
                  {
                    "--im": `${l?.im}px`,
                    "--iw": `${l?.w}px`,
                    "--ml": `${l?.ml}px`,
                    "--r": `${l?.r}px`,
                    "--tw": `${l?.tw}px`,
                  } as CSSProperties
                }
              >
                <Img alt="" className="if-item-img" src={it.image} />
                <div className="if-item-txt">
                  <h2 className="if-h if-item-t">{it.title}</h2>
                  <p className="if-item-s">{it.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="if-about">
          <div className="if-about-row">
            <div
              className="if-about-box"
              style={imageVar("--if-frame", p.aboutBg || p.boxBg)}
            >
              <h2 className="if-h if-about-t">
                <b>{p.aboutTitle}</b>
              </h2>
            </div>
          </div>
          <div className="if-about-txt">
            {paragraphs(p.aboutText).map((t, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: ordem fixa
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "ifBenefits",
  }
);

/* ───────────────────────── pilares e passos ───────────────────────── */

const ifPillars = defineBlock(
  z.object({
    line: str(),
    pillText: str(),
    pillTitle: str("RESULTADO GARANTIDO!"),
    steps: z
      .array(z.object({ label: str(), number: str() }))
      .default([])
      .catch([]),
    title1: str("GANHE DINHEIRO"),
    title2: str("SEM APARECER"),
    title3: str("ESTRATÉGIA ATEMPORAL"),
    triangle: str(),
  }),
  {
    fields: [
      { key: "triangle", kind: "image", label: "Triângulo de fundo" },
      { key: "line", kind: "image", label: "Linha decorativa do topo" },
      { key: "title1", kind: "text", label: "Título 1" },
      { key: "title2", kind: "text", label: "Título 2 (extranegrito)" },
      { key: "title3", kind: "text", label: "Título 3 (fino)" },
      { key: "pillTitle", kind: "text", label: "Título da caixa" },
      { key: "pillText", kind: "textarea", label: "Texto da caixa" },
      {
        itemFields: [
          { key: "number", kind: "text", label: "Número" },
          { key: "label", kind: "text", label: "Texto" },
        ],
        key: "steps",
        kind: "list",
        label: "Passos",
      },
    ],
    group: "content",
    label: "Pilares e passos (InstaFanFortune)",
    render: p => (
      <section className="if-sec if-pil">
        <div className="if-pil-in" style={imageVar("--if-tri", p.triangle)}>
          {p.line ? <Img alt="" className="if-line" src={p.line} /> : null}
          <h2 className="if-h if-t1">
            <b>{p.title1}</b>
          </h2>
          <h2 className="if-h if-t2">{p.title2}</h2>
          <h2 className="if-h if-t3">{p.title3}</h2>
          <div className="if-pill">
            <div className="if-pill-col t">
              <h2 className="if-h if-pill-t">{p.pillTitle}</h2>
            </div>
            <div className="if-pill-col p">
              <h2 className="if-h if-pill-p">{p.pillText}</h2>
            </div>
            <div className="if-pill-col i">
              <svg
                aria-hidden="true"
                className="if-pill-i"
                viewBox="0 0 448 512"
              >
                <path d="M224 256a128 128 0 1 0 0-256 128 128 0 1 0 0 256zm-96 55.2C54 332.9 0 401.3 0 482.6 0 498.8 13.2 512 29.4 512h389.2c16.2 0 29.4-13.2 29.4-29.4 0-81.3-54-149.7-128-171.4l-48 76.8-24-48 24-40H176l24 40-24 48-48-76.8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="if-steps">
          {p.steps.map((s, i) => (
            <div className="if-step" key={s.label + i}>
              <h2 className="if-h if-step-n">{s.number}</h2>
              <h2 className="if-h if-step-l">{s.label}</h2>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "ifPillars",
  }
);

/* ───────────────────────── rumo ao sucesso ───────────────────────── */

const CARD_CLASS = ["a", "b", "c"];

const ifFeatures = defineBlock(
  z.object({
    arrow: str(),
    boxBg: str(),
    cards: z
      .array(z.object({ items: str() }))
      .default([])
      .catch([]),
    title: str("Rumo ao sucesso"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "boxBg", kind: "image", label: "Moldura azul do título" },
      { key: "arrow", kind: "image", label: "Seta (aparece só no celular)" },
      {
        itemFields: [
          {
            key: "items",
            kind: "textarea",
            label: "Itens (um por linha)",
          },
        ],
        key: "cards",
        kind: "list",
        label: "Cartões (3)",
      },
    ],
    group: "content",
    label: "Rumo ao sucesso (InstaFanFortune)",
    render: p => (
      <section
        className="if-sec if-feat"
        style={imageVar("--if-frame", p.boxBg)}
      >
        <div className="if-feat-row">
          <div className="if-feat-box">
            <h2 className="if-h if-feat-title">
              <b>{p.title}</b>
            </h2>
          </div>
        </div>
        <div className="if-fcs">
          {p.cards.map((c, i) => (
            <div
              className="if-fc-wrap"
              key={`${CARD_CLASS[i] ?? "a"}-${c.items.slice(0, 12)}`}
            >
              {p.arrow ? (
                <Img alt="" className="if-arrow" src={p.arrow} />
              ) : null}
              <div className={`if-fc ${CARD_CLASS[i] ?? "a"}`}>
                {lines(c.items).map((t, j) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: ordem fixa
                  <div className="if-fc-row" key={j}>
                    <CheckIcon className="if-fc-ic" />
                    <p className="if-fc-txt">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "ifFeatures",
  }
);

/* ───────────────────────── risco zero + oferta ───────────────────────── */

const ifOffer = defineBlock(
  z.object({
    buttonLabel: str("ADQUIRIR AGORA"),
    buttonUrl: str(),
    cardTitle: str("OFERTA ESPECIAL"),
    cashback: str("100% de cashback instantaneamente!"),
    from: str("R$37,00"),
    fromLabel: str("DE"),
    price: str("R$19,99"),
    priceLabel: str("POR APENAS"),
    riskText: str(),
    riskTitle: str("ZERO RISCO!"),
    stamps: str(),
  }),
  {
    fields: [
      { key: "riskTitle", kind: "text", label: "Título do risco zero" },
      { key: "riskText", kind: "textarea", label: "Texto do risco zero" },
      { key: "cardTitle", kind: "text", label: "Título do cartão" },
      { key: "cashback", kind: "text", label: "Frase em azul" },
      { key: "fromLabel", kind: "text", label: "Antes do preço antigo" },
      { key: "from", kind: "text", label: "Preço antigo (riscado)" },
      { key: "priceLabel", kind: "text", label: "Depois do preço antigo" },
      { key: "price", kind: "text", label: "Preço" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão de compra" },
      { key: "buttonUrl", kind: "url", label: "Link do botão de compra" },
      { key: "stamps", kind: "image", label: "Selos de compra" },
    ],
    group: "content",
    label: "Oferta (InstaFanFortune)",
    render: (p, ctx) => (
      <section className="if-sec if-offer">
        <div className="if-risk">
          <h2 className="if-h if-risk-t">
            <b>{p.riskTitle}</b>
          </h2>
          <p className="if-risk-p">{p.riskText}</p>
        </div>
        <div className="if-card">
          <h2 className="if-h if-card-t">{p.cardTitle}</h2>
          <p className="if-cash">{p.cashback}</p>
          <p className="if-from">
            {p.fromLabel} <del>{p.from}</del>
            <br />
            {p.priceLabel}
          </p>
          <p className="if-price">{p.price}</p>
          <a className="if-buy" href={href(ctx, p.buttonUrl)}>
            {p.buttonLabel}
          </a>
          {p.stamps ? (
            <Img
              alt="Ambiente seguro | 7 dias de garantia"
              className="if-stamps"
              src={p.stamps}
            />
          ) : null}
        </div>
      </section>
    ),
    type: "ifOffer",
  }
);

/* ───────────────────────── FAQ ───────────────────────── */

const ifFaq = defineBlock(
  z.object({
    items: z
      .array(z.object({ answer: str(), question: str() }))
      .default([])
      .catch([]),
    openFirst: yesNo("yes"),
    title: str("Dúvidas Frequentes"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "openFirst",
        kind: "select",
        label: "Primeiro item",
        options: [
          { label: "Começa aberto", value: "yes" },
          { label: "Começa fechado", value: "no" },
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
    ],
    group: "content",
    label: "Perguntas frequentes (InstaFanFortune)",
    render: p => (
      <section className="if-sec if-faq">
        <div className="if-faq-in">
          <h2 className="if-faq-h">{p.title}</h2>
          {p.items.map((it, i) => (
            <details
              className="if-faq-item"
              key={it.question + i}
              name="sb-if-faq"
              open={i === 0 && p.openFirst === "yes"}
            >
              <summary>
                <svg
                  aria-hidden="true"
                  className="if-faq-ic"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 8h12" />
                  <path className="v" d="M8 2v12" />
                </svg>
                <span>{it.question}</span>
              </summary>
              <div className="if-faq-a">
                <p>{it.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    ),
    type: "ifFaq",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const ifFooter = defineBlock(z.object({ copyright: str() }), {
  fields: [{ key: "copyright", kind: "text", label: "Texto do rodapé" }],
  group: "layout",
  label: "Rodapé (InstaFanFortune)",
  render: p => (
    <footer className="if-foot">
      <p>{p.copyright}</p>
    </footer>
  ),
  type: "ifFooter",
});

export const instafanBlocks: BlockDefinition[] = [
  ifHeader,
  ifHero,
  ifBenefits,
  ifPillars,
  ifFeatures,
  ifOffer,
  ifFaq,
  ifFooter,
];
