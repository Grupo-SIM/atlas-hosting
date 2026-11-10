import type { CSSProperties } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { int, str, yesNo } from "./sim-lib.js";
import type { BlockDefinition } from "./types.js";

/**
 * Blocos comuns de **página de vendas de e-book** (cartão de oferta, perguntas frequentes e rodapé de copyright).
 * Não dependem de variante: cores, fonte e alturas vêm por props e viram variáveis `--eb-*` no próprio bloco; o CSS
 * (`renderer/ebook.ts`, `.eb-*`) vai junto do CSS base do site. Usados pelo template `habilidades-comunicacao`
 * (o `outro-lado-internet` tem versões próprias `ol*`, que podem migrar para estes).
 *
 * Ordem dos filhos (da qual dependem os caminhos de `Block.fx`):
 * - `ebookOffer`: `1` = seção, `1.1` = cartão; dentro dele `1.1.1` título, `1.1.2` frase, `1.1.3` "de/por",
 *   `1.1.4` preço, `1.1.5` botão de compra, `1.1.6` selos (só existe com a imagem). Elementos sem texto não saem.
 * - `ebookFaq`: `1` = seção, `1.1` título, `1.2` lista (cada pergunta é um `details`).
 */

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;
const color = (d: string) => z.string().regex(COLOR).default(d).catch(d);
const FONT = /^[\w\s',-]+$/;
const font = (d: string) => z.string().regex(FONT).default(d).catch(d);

/** Valor de cor/fonte vindo das props (já validado pelo schema; o `safe` cobre o caso de a prop vir fora dele). */
const safeColor = (v: string, d: string) => (COLOR.test(v) ? v : d);
const safeFont = (v: string, d: string) => (FONT.test(v) ? v : d);

/* ───────────────────────── oferta ───────────────────────── */

const ebookOffer = defineBlock(
  z.object({
    accent: color("#DE41FF"),
    buttonFrom: color("#DE41FF"),
    buttonLabel: str("ADQUIRIR AGORA"),
    buttonTo: color("#023131"),
    buttonUrl: str(),
    cardBg: color("rgba(0,0,0,.5)"),
    cardTitle: str("OFERTA ESPECIAL"),
    cashback: str("100% de cashback instantaneamente!"),
    cashbackStyle: z.enum(["text", "marker"]).default("text").catch("text"),
    fontFamily: font("'Montserrat', sans-serif"),
    from: str("R$37,00"),
    fromLabel: str("DE"),
    price: str("R$24,90"),
    priceLabel: str("POR APENAS"),
    stamps: str(),
    textColor: color("#FFFFFF"),
  }),
  {
    fields: [
      { key: "cardTitle", kind: "text", label: "Título do cartão" },
      { key: "cashback", kind: "text", label: "Frase de destaque" },
      {
        key: "cashbackStyle",
        kind: "select",
        label: "Destaque da frase",
        options: [
          { label: "Texto na cor de destaque", value: "text" },
          { label: "Marca-texto atrás da frase", value: "marker" },
        ],
      },
      { key: "fromLabel", kind: "text", label: "Antes do preço antigo" },
      { key: "from", kind: "text", label: "Preço antigo (riscado)" },
      { key: "priceLabel", kind: "text", label: "Depois do preço antigo" },
      { key: "price", kind: "text", label: "Preço" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão de compra" },
      { key: "buttonUrl", kind: "url", label: "Link do botão de compra" },
      { key: "stamps", kind: "image", label: "Selos de compra" },
      {
        key: "accent",
        kind: "color",
        label: "Cor de destaque (borda e brilho)",
      },
      { key: "textColor", kind: "color", label: "Cor do texto" },
      {
        key: "cardBg",
        kind: "text",
        label: "Fundo do cartão (#cor ou rgba())",
      },
      { key: "buttonFrom", kind: "color", label: "Botão: cor de cima" },
      { key: "buttonTo", kind: "color", label: "Botão: cor de baixo" },
      {
        key: "fontFamily",
        kind: "text",
        label: "Fonte (ex.: 'Montserrat', sans-serif)",
      },
    ],
    group: "content",
    label: "Oferta de e-book (cartão de preço)",
    render: (p, ctx) => (
      <section
        className={`eb-offer eb-cash-${p.cashbackStyle}`}
        style={
          {
            "--eb-accent": safeColor(p.accent, "#DE41FF"),
            "--eb-btn-a": safeColor(p.buttonFrom, "#DE41FF"),
            "--eb-btn-b": safeColor(p.buttonTo, "#023131"),
            "--eb-card": safeColor(p.cardBg, "rgba(0,0,0,.5)"),
            "--eb-font": safeFont(p.fontFamily, "'Montserrat', sans-serif"),
            "--eb-text": safeColor(p.textColor, "#FFFFFF"),
          } as CSSProperties
        }
      >
        <div className="eb-card">
          {p.cardTitle ? <h2 className="eb-title">{p.cardTitle}</h2> : null}
          {p.cashback ? (
            <p className="eb-cash">
              <span>{p.cashback}</span>
            </p>
          ) : null}
          {p.from || p.priceLabel ? (
            <p className="eb-from">
              {p.fromLabel} {p.from ? <del>{p.from}</del> : null}
              <br />
              {p.priceLabel}
            </p>
          ) : null}
          {p.price ? <p className="eb-price">{p.price}</p> : null}
          {p.buttonLabel ? (
            <a className="eb-buy" href={href(ctx, p.buttonUrl)}>
              {p.buttonLabel}
            </a>
          ) : null}
          {p.stamps ? (
            <Img
              alt="Ambiente seguro | 7 dias de garantia"
              className="eb-stamps"
              src={p.stamps}
            />
          ) : null}
        </div>
      </section>
    ),
    type: "ebookOffer",
  }
);

/* ───────────────────────── perguntas frequentes ───────────────────────── */

const ebookFaq = defineBlock(
  z.object({
    accent: color("#DE41FF"),
    answerColor: color("#B8BDC2"),
    bg: color("#0B0B0B"),
    fontFamily: font("'Roboto', sans-serif"),
    items: z
      .array(z.object({ answer: str(), question: str() }))
      .default([])
      .catch([]),
    lineColor: color("#D5D8DC"),
    minHeight: int(0, 3000, 600),
    minHeightMobile: int(0, 3000, 553),
    minHeightTablet: int(0, 3000, 370),
    openFirst: yesNo("yes"),
    textColor: color("#FCFCFC"),
    title: str("DÚVIDAS FREQUENTES"),
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
      {
        key: "accent",
        kind: "color",
        label: "Cor de destaque (título e ícone)",
      },
      { key: "textColor", kind: "color", label: "Cor das perguntas" },
      { key: "answerColor", kind: "color", label: "Cor das respostas" },
      { key: "lineColor", kind: "color", label: "Cor das bordas" },
      { key: "bg", kind: "color", label: "Cor de fundo" },
      {
        key: "fontFamily",
        kind: "text",
        label: "Fonte (ex.: 'Roboto', sans-serif)",
      },
      { key: "minHeight", kind: "number", label: "Altura mínima (px)" },
      {
        key: "minHeightTablet",
        kind: "number",
        label: "Altura mínima no tablet e laptop (px)",
      },
      {
        key: "minHeightMobile",
        kind: "number",
        label: "Altura mínima no celular (px)",
      },
    ],
    group: "content",
    label: "Perguntas frequentes de e-book",
    render: p => (
      <section
        className="eb-faq"
        style={
          {
            "--eb-accent": safeColor(p.accent, "#DE41FF"),
            "--eb-answer": safeColor(p.answerColor, "#B8BDC2"),
            "--eb-bg": safeColor(p.bg, "#0B0B0B"),
            "--eb-font": safeFont(p.fontFamily, "'Roboto', sans-serif"),
            "--eb-h": `${p.minHeight}px`,
            "--eb-h-m": `${p.minHeightMobile}px`,
            "--eb-h-t": `${p.minHeightTablet}px`,
            "--eb-line": safeColor(p.lineColor, "#D5D8DC"),
            "--eb-text": safeColor(p.textColor, "#FCFCFC"),
          } as CSSProperties
        }
      >
        <h2 className="eb-faq-h">{p.title}</h2>
        <div className="eb-faq-list">
          {p.items.map((it, i) => (
            <details
              className="eb-faq-item"
              key={it.question + i}
              name="sb-eb-faq"
              open={i === 0 && p.openFirst === "yes"}
            >
              <summary>
                <svg
                  aria-hidden="true"
                  className="eb-faq-ic"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14" />
                  <path className="v" d="M12 5v14" />
                </svg>
                <span>{it.question}</span>
              </summary>
              <div className="eb-faq-a">{it.answer}</div>
            </details>
          ))}
        </div>
      </section>
    ),
    type: "ebookFaq",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const ebookFooter = defineBlock(
  z.object({
    bg: color("#181717"),
    copyright: str("© SIM Intermediações — Todos os direitos reservados."),
    textColor: color("#FFFFFF"),
  }),
  {
    fields: [
      { key: "copyright", kind: "text", label: "Texto do rodapé" },
      { key: "bg", kind: "color", label: "Cor de fundo" },
      { key: "textColor", kind: "color", label: "Cor do texto" },
    ],
    group: "layout",
    label: "Rodapé de e-book (copyright)",
    render: p => (
      <footer
        className="eb-foot"
        style={
          {
            "--eb-bg": safeColor(p.bg, "#181717"),
            "--eb-text": safeColor(p.textColor, "#FFFFFF"),
          } as CSSProperties
        }
      >
        <div className="eb-foot-in">
          <p>{p.copyright}</p>
        </div>
      </footer>
    ),
    type: "ebookFooter",
  }
);

export const ebookBlocks: BlockDefinition[] = [
  ebookOffer,
  ebookFaq,
  ebookFooter,
];
