import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { int, lines, str, yesNo } from "./sim-lib.js";
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
 * - `ebookFaq`: `1` = seção, `1.1` título (com `eyebrow`, vira um contêiner com sobretítulo + título), `1.2` lista (cada
 *   pergunta é um `details`; com `columns: 2` a lista tem 2 colunas, `1.2.1` e `1.2.2`).
 *
 * Opções extras (todas opcionais; no padrão o HTML é o de sempre, então os templates antigos não mudam):
 * - `ebookOffer`: `variant: "light"` (cartão claro com borda fina), `fromInline` ("DE: R$497,00" numa linha, riscado na cor
 *   de destaque), `discount` (selo de desconto, entre o preço e o botão), `bullets` (lista com check, uma por linha, logo
 *   depois do selo) e `buttonShape: "pill"` (largura total, degradê diagonal, hover sólido na 2ª cor). Com os novos
 *   elementos o botão de compra passa a ser o filho depois deles (ex.: título 1, frase 2, de/por 3, preço 4, desconto 5,
 *   lista 6, botão 7).
 * - `ebookFaq`: `columns` (1|2, a lista se divide ao meio), `itemStyle: "cards"` (cartão com borda, raio e degradê, seta
 *   para baixo/cima), `iconSide` (esquerda|direita), `eyebrow` (sobretítulo) e `headingFont`.
 * - `ebookFooter`: `veilColor`/`veilOpacity` (véu radial transparente → cor, por cima do fundo), `divider` (linha de largura total acima do texto), `bgImage` (imagem de fundo no topo), `roomy`
 *   (espaçamento 3em/2em do Elementor) e `fontSize`.
 */

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;
const color = (d: string) => z.string().regex(COLOR).default(d).catch(d);
const FONT = /^[\w\s',-]+$/;
const font = (d: string) => z.string().regex(FONT).default(d).catch(d);

/** Junta classes ignorando as falsas (evita template literal com espaço à frente, que o sorter de classes do Biome estraga). */
const cls = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

/** Valor de cor/fonte vindo das props (já validado pelo schema; o `safe` cobre o caso de a prop vir fora dele). */
const safeColor = (v: string, d: string) => (COLOR.test(v) ? v : d);
const safeFont = (v: string, d: string) => (FONT.test(v) ? v : d);

/* ───────────────────────── oferta ───────────────────────── */

const ebookOffer = defineBlock(
  z.object({
    accent: color("#DE41FF"),
    airy: yesNo("no"),
    borderColor: color("#FFFFFF2B"),
    bullets: str(),
    buttonFrom: color("#DE41FF"),
    buttonLabel: str("ADQUIRIR AGORA"),
    buttonShape: z.enum(["rect", "pill"]).default("rect").catch("rect"),
    buttonTo: color("#023131"),
    buttonUrl: str(),
    cardBg: color("rgba(0,0,0,.5)"),
    cardTitle: str("OFERTA ESPECIAL"),
    cashback: str("100% de cashback instantaneamente!"),
    cashbackStyle: z.enum(["text", "marker"]).default("text").catch("text"),
    cashSize: int(0, 80, 0),
    discount: str(),
    dividerColor: color("#F8F8F8"),
    fontFamily: font("'Montserrat', sans-serif"),
    from: str("R$37,00"),
    fromInline: yesNo("no"),
    fromLabel: str("DE"),
    padBottom: int(0, 400, 0),
    padBottomMobile: int(0, 400, 0),
    padBottomTablet: int(0, 400, 0),
    price: str("R$24,90"),
    priceLabel: str("POR APENAS"),
    pullUp: int(0, 400, 0),
    sectionBg: color(""),
    sectionImage: str(),
    stamps: str(),
    textColor: color("#FFFFFF"),
    titleColor: color(""),
    titleFont: font(""),
    variant: z.enum(["glow", "light"]).default("glow").catch("glow"),
    veilFrom: color(""),
    veilTo: color(""),
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
      {
        key: "cashSize",
        kind: "number",
        label: "Tamanho da frase de destaque (px, 0 = padrão)",
      },
      {
        key: "airy",
        kind: "select",
        label: "Espaçamento do cartão escuro",
        options: [
          { label: "Compacto (padrão)", value: "no" },
          { label: "Arejado (preço antigo leve, linhas soltas)", value: "yes" },
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
        key: "variant",
        kind: "select",
        label: "Estilo do cartão",
        options: [
          { label: "Escuro com brilho", value: "glow" },
          { label: "Claro com borda fina", value: "light" },
        ],
      },
      {
        key: "fromInline",
        kind: "select",
        label: "Preço antigo",
        options: [
          { label: "Em duas linhas (DE / POR APENAS)", value: "no" },
          { label: "Numa linha só (DE: R$…)", value: "yes" },
        ],
      },
      { key: "discount", kind: "text", label: "Selo de desconto (opcional)" },
      {
        key: "bullets",
        kind: "textarea",
        label: "Lista com check (um item por linha)",
      },
      {
        key: "buttonShape",
        kind: "select",
        label: "Formato do botão",
        options: [
          { label: "Retangular (degradê vertical)", value: "rect" },
          {
            label: "Pílula de largura total (degradê diagonal)",
            value: "pill",
          },
        ],
      },
      {
        key: "accent",
        kind: "color",
        label: "Cor de destaque (borda e brilho)",
      },
      { key: "textColor", kind: "color", label: "Cor do texto" },
      {
        key: "titleColor",
        kind: "color",
        label: "Cor do título do cartão (vazio = a do texto)",
      },
      {
        key: "cardBg",
        kind: "text",
        label: "Fundo do cartão (#cor ou rgba())",
      },
      { key: "buttonFrom", kind: "color", label: "Botão: cor de cima" },
      { key: "buttonTo", kind: "color", label: "Botão: cor de baixo" },
      {
        key: "borderColor",
        kind: "color",
        label: "Borda do cartão (estilo claro)",
      },
      {
        key: "dividerColor",
        kind: "color",
        label: "Divisória da lista (estilo claro)",
      },
      {
        key: "fontFamily",
        kind: "text",
        label: "Fonte (ex.: 'Montserrat', sans-serif)",
      },
      {
        key: "titleFont",
        kind: "text",
        label: "Fonte do título e do preço (vazio = a mesma)",
      },
      { key: "sectionBg", kind: "color", label: "Fundo da seção (opcional)" },
      { key: "sectionImage", kind: "image", label: "Imagem de fundo da seção" },
      {
        key: "veilFrom",
        kind: "text",
        label: "Véu sobre a imagem: cor do topo (#cor ou rgba())",
      },
      {
        key: "veilTo",
        kind: "text",
        label: "Véu sobre a imagem: cor da base",
      },
      {
        key: "pullUp",
        kind: "number",
        label: "Subir o cartão sobre a seção anterior (px)",
      },
      { key: "padBottom", kind: "number", label: "Espaço abaixo (px)" },
      {
        key: "padBottomTablet",
        kind: "number",
        label: "Espaço abaixo no tablet (px)",
      },
      {
        key: "padBottomMobile",
        kind: "number",
        label: "Espaço abaixo no celular (px)",
      },
    ],
    group: "content",
    label: "Oferta de e-book (cartão de preço)",
    render: (p, ctx) => {
      const hasSec = !!(
        p.sectionBg ||
        p.sectionImage ||
        p.pullUp ||
        p.padBottom
      );
      const veil =
        p.veilFrom && p.veilTo
          ? `radial-gradient(at top center, ${safeColor(p.veilFrom, "transparent")} 0%, ${safeColor(p.veilTo, "transparent")} 65%)`
          : "";
      const secBg = [veil, p.sectionImage ? cssUrl(p.sectionImage) : ""]
        .filter(Boolean)
        .join(", ");
      return (
        <section
          className={cls(
            "eb-offer",
            `eb-cash-${p.cashbackStyle}`,
            p.variant === "light" && "eb-light",
            hasSec && "has-sec",
            p.airy === "yes" && "eb-airy"
          )}
          style={
            {
              "--eb-accent": safeColor(p.accent, "#DE41FF"),
              "--eb-btn-a": safeColor(p.buttonFrom, "#DE41FF"),
              "--eb-btn-b": safeColor(p.buttonTo, "#023131"),
              "--eb-card": safeColor(p.cardBg, "rgba(0,0,0,.5)"),
              "--eb-font": safeFont(p.fontFamily, "'Montserrat', sans-serif"),
              "--eb-text": safeColor(p.textColor, "#FFFFFF"),
              ...(p.variant === "light"
                ? {
                    "--eb-border": safeColor(p.borderColor, "#FFFFFF2B"),
                    "--eb-divider": safeColor(p.dividerColor, "#F8F8F8"),
                  }
                : {}),
              ...(p.titleFont
                ? { "--eb-title-font": safeFont(p.titleFont, "inherit") }
                : {}),
              ...(p.titleColor
                ? { "--eb-title-color": safeColor(p.titleColor, "#FFFFFF") }
                : {}),
              ...(p.cashSize ? { "--eb-cash-fs": `${p.cashSize}px` } : {}),
              ...(hasSec
                ? {
                    "--eb-pb": `${p.padBottom}px`,
                    "--eb-pb-m": `${p.padBottomMobile || p.padBottomTablet || p.padBottom}px`,
                    "--eb-pb-t": `${p.padBottomTablet || p.padBottom}px`,
                    "--eb-pull": `${p.pullUp}px`,
                  }
                : {}),
              ...(p.sectionBg
                ? { backgroundColor: safeColor(p.sectionBg, "transparent") }
                : {}),
              ...(secBg ? { backgroundImage: secBg } : {}),
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
            {p.fromInline === "yes" ? (
              p.from ? (
                <p className="eb-from eb-from-inline">
                  <del>
                    {p.fromLabel ? `${p.fromLabel} ` : ""}
                    {p.from}
                  </del>
                </p>
              ) : null
            ) : p.from || p.priceLabel ? (
              <p className="eb-from">
                {p.fromLabel} {p.from ? <del>{p.from}</del> : null}
                <br />
                {p.priceLabel}
              </p>
            ) : null}
            {p.price ? <p className="eb-price">{p.price}</p> : null}
            {p.discount ? <p className="eb-discount">{p.discount}</p> : null}
            {lines(p.bullets).length ? (
              <ul className="eb-list">
                {lines(p.bullets).map((t, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do item
                  <li key={i}>
                    <svg
                      aria-hidden="true"
                      className="eb-check"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m8 12.5 2.8 2.8L16 9.5" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {p.buttonLabel ? (
              <a
                className={cls("eb-buy", p.buttonShape === "pill" && "eb-pill")}
                href={href(ctx, p.buttonUrl)}
              >
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
      );
    },
    type: "ebookOffer",
  }
);

/* ───────────────────────── perguntas frequentes ───────────────────────── */

const ebookFaq = defineBlock(
  z.object({
    accent: color("#DE41FF"),
    answerColor: color("#B8BDC2"),
    bg: color("#0B0B0B"),
    columns: z.coerce.number().int().min(1).max(2).default(1).catch(1),
    eyebrow: str(),
    fontFamily: font("'Roboto', sans-serif"),
    headingFont: font(""),
    iconSide: z.enum(["left", "right"]).default("left").catch("left"),
    itemStyle: z.enum(["lines", "cards"]).default("lines").catch("lines"),
    items: z
      .array(z.object({ answer: str(), question: str() }))
      .default([])
      .catch([]),
    lineColor: color("#D5D8DC"),
    minHeight: int(0, 3000, 600),
    minHeightMobile: int(0, 3000, 553),
    minHeightTablet: int(0, 3000, 370),
    openFirst: yesNo("yes"),
    padBottom: int(0, 300, 0),
    padTop: int(0, 300, 0),
    textColor: color("#FCFCFC"),
    title: str("DÚVIDAS FREQUENTES"),
    titleSize: int(0, 100, 0),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Sobretítulo (opcional)" },
      { key: "title", kind: "text", label: "Título" },
      {
        key: "columns",
        kind: "select",
        label: "Colunas",
        options: [
          { label: "1 coluna", value: "1" },
          { label: "2 colunas (a lista se divide ao meio)", value: "2" },
        ],
      },
      {
        key: "itemStyle",
        kind: "select",
        label: "Estilo dos itens",
        options: [
          { label: "Linhas (+/−)", value: "lines" },
          { label: "Cartões com seta", value: "cards" },
        ],
      },
      {
        key: "iconSide",
        kind: "select",
        label: "Lado do ícone",
        options: [
          { label: "Esquerda", value: "left" },
          { label: "Direita", value: "right" },
        ],
      },
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
      {
        key: "headingFont",
        kind: "text",
        label: "Fonte do título e das perguntas (vazio = a mesma)",
      },
      {
        key: "titleSize",
        kind: "number",
        label: "Tamanho do título no computador (px, 0 = padrão)",
      },
      {
        key: "padTop",
        kind: "number",
        label: "Espaço acima no computador (px, 0 = padrão)",
      },
      {
        key: "padBottom",
        kind: "number",
        label: "Espaço abaixo no computador (px, 0 = padrão)",
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
    render: p => {
      const cards = p.itemStyle === "cards";
      const half = Math.ceil(p.items.length / 2);
      const cols =
        p.columns === 2
          ? [p.items.slice(0, half), p.items.slice(half)]
          : [p.items];
      const title = <h2 className="eb-faq-h">{p.title}</h2>;
      return (
        <section
          className={cls(
            "eb-faq",
            cards && "eb-cards",
            p.iconSide === "right" && "eb-icon-right"
          )}
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
              ...(p.headingFont
                ? { "--eb-title-font": safeFont(p.headingFont, "inherit") }
                : {}),
              ...(p.titleSize ? { "--eb-h-fs": `${p.titleSize}px` } : {}),
              ...(p.padTop ? { "--eb-pt": `${p.padTop}px` } : {}),
              ...(p.padBottom ? { "--eb-pbm": `${p.padBottom}px` } : {}),
            } as CSSProperties
          }
        >
          {p.eyebrow ? (
            <div className="eb-faq-head">
              <span className="eb-faq-eyebrow">{p.eyebrow}</span>
              {title}
            </div>
          ) : (
            title
          )}
          <div className={cls("eb-faq-list", p.columns === 2 && "eb-cols")}>
            {cols.map((items, c) => {
              const rows = items.map((it, i) => (
                <details
                  className="eb-faq-item"
                  key={it.question + i}
                  name={p.columns === 2 ? `sb-eb-faq-${c}` : "sb-eb-faq"}
                  open={i === 0 && p.openFirst === "yes"}
                >
                  <summary>
                    {cards ? (
                      <svg
                        aria-hidden="true"
                        className="eb-faq-chev"
                        viewBox="0 0 24 24"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        className="eb-faq-ic"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14" />
                        <path className="v" d="M12 5v14" />
                      </svg>
                    )}
                    <span>{it.question}</span>
                  </summary>
                  <div className="eb-faq-a">{it.answer}</div>
                </details>
              ));
              return p.columns === 2 ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: a coluna é identificada pela posição
                <div className="eb-faq-col" key={c}>
                  {rows}
                </div>
              ) : (
                rows
              );
            })}
          </div>
        </section>
      );
    },
    type: "ebookFaq",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const ebookFooter = defineBlock(
  z.object({
    bg: color("#181717"),
    bgImage: str(),
    copyright: str("© SIM Intermediações — Todos os direitos reservados."),
    divider: yesNo("no"),
    dividerColor: color("#FFFFFF2B"),
    fontFamily: font(""),
    fontSize: int(0, 40, 0),
    roomy: yesNo("no"),
    textColor: color("#FFFFFF"),
    textMargin: int(0, 200, 0),
    veilColor: color(""),
    veilOpacity: int(0, 100, 50),
  }),
  {
    fields: [
      { key: "copyright", kind: "text", label: "Texto do rodapé" },
      { key: "bg", kind: "color", label: "Cor de fundo" },
      {
        key: "bgImage",
        kind: "image",
        label: "Imagem de fundo (topo, cobrir)",
      },
      { key: "textColor", kind: "color", label: "Cor do texto" },
      {
        key: "veilColor",
        kind: "text",
        label: "Véu radial: cor das bordas (vazio = sem véu)",
      },
      { key: "veilOpacity", kind: "number", label: "Véu: opacidade (%)" },
      {
        key: "fontFamily",
        kind: "text",
        label: "Fonte (vazio = a do site)",
      },
      {
        key: "textMargin",
        kind: "number",
        label: "Margem acima e abaixo do texto (px, 0 = padrão)",
      },
      {
        key: "fontSize",
        kind: "number",
        label: "Tamanho do texto (px, 0 = padrão)",
      },
      {
        key: "divider",
        kind: "select",
        label: "Linha divisória acima do texto",
        options: [
          { label: "Não", value: "no" },
          { label: "Sim", value: "yes" },
        ],
      },
      { key: "dividerColor", kind: "color", label: "Cor da linha divisória" },
      {
        key: "roomy",
        kind: "select",
        label: "Espaçamento",
        options: [
          { label: "Compacto", value: "no" },
          { label: "Amplo (3em em cima, 2em embaixo)", value: "yes" },
        ],
      },
    ],
    group: "layout",
    label: "Rodapé de e-book (copyright)",
    render: p => (
      <footer
        className={cls(
          "eb-foot",
          p.bgImage && "has-img",
          p.roomy === "yes" && "roomy",
          p.veilColor && "has-veil"
        )}
        style={
          {
            "--eb-bg": safeColor(p.bg, "#181717"),
            "--eb-text": safeColor(p.textColor, "#FFFFFF"),
            ...(p.bgImage ? { "--eb-bg-img": cssUrl(p.bgImage) } : {}),
            ...(p.veilColor
              ? {
                  "--eb-veil": safeColor(p.veilColor, "#000000"),
                  "--eb-veil-o": p.veilOpacity / 100,
                }
              : {}),
            ...(p.fontFamily
              ? { "--eb-ff": safeFont(p.fontFamily, "inherit") }
              : {}),
            ...(p.textMargin ? { "--eb-tm": `${p.textMargin}px` } : {}),
            ...(p.fontSize ? { "--eb-fs": `${p.fontSize}px` } : {}),
            ...(p.divider === "yes"
              ? { "--eb-div": safeColor(p.dividerColor, "#FFFFFF2B") }
              : {}),
          } as CSSProperties
        }
      >
        {p.divider === "yes" ? <hr className="eb-foot-div" /> : null}
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
