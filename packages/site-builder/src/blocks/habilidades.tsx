import { z } from "zod";
import { defineBlock } from "./define.js";
import { FA_ICONS } from "./hc-icons.js";
import { href, Img, Inline } from "./helpers.js";
import { screenFields, screenSchema, screenStyle } from "./screens.js";
import { int, str } from "./sim-lib.js";
import type { BlockDefinition, FieldDef } from "./types.js";

/**
 * Blocos da página de vendas "Habilidades de Comunicação" (prefixo `hc`, escopo `.sb-hc`, CSS em
 * `renderer/habilidades.ts`). Todo texto, imagem e link é prop. Fundo e altura mínima têm valores por tela
 * (computador, tablet ≤ 1024px e celular ≤ 767px) pelas variáveis `--hc-bg*`/`--hc-h*` (`blocks/screens.tsx`).
 * O cartão de oferta, o FAQ e o rodapé são os blocos comuns `ebook*` (`blocks/ebook.tsx`).
 *
 * Ordem dos filhos (da qual dependem os caminhos de `Block.fx`; `1` é sempre a seção):
 * - `hcHero`: `1.1` barra do topo (`1.1.1` logo, `1.1.2` botão "Comprar E-Book"); `1.2` linha de texto com `1.2.1`
 *   coluna = `1.2.1.1` título, `1.2.1.2` subtítulo e `1.2.1.3` botão.
 * - `hcBenefits`: `1.1` título (`1.1.1`) e subtítulo (`1.1.2`); `1.2` linhas, `1.2.R` linha, `1.2.R.C` cartão,
 *   `1.2.R.C.1` ícone e `1.2.R.C.2` texto (3 cartões por linha).
 * - `hcChapters`: `1.1` grade e `1.1.N` cartão com `.1` imagem, `.2` título, `.3` descrição e `.4` rótulo.
 * - `hcBonus` (contêiner: o cartão de oferta entra como filho): `1.1` linha de bônus (`1.1.1` coluna do título com
 *   `1.1.1.1` o título, `1.1.2` lista de bônus e `1.1.2.N` cada item), `1.2` espaço dos filhos, `1.3` suporte.
 */

const ICON_OPTIONS = [
  { label: "Arco", value: "archway" },
  { label: "Pessoas carregando", value: "people-carry" },
  { label: "Pessoas com setas", value: "people-arrows" },
  { label: "Cérebro", value: "brain" },
  { label: "Balão com reticências", value: "comment-dots" },
  { label: "Cabeça tossindo", value: "head-side-cough" },
];

const urlField = (key: string, label: string): FieldDef[] => [
  { key: `${key}Label`, kind: "text", label: `Texto do ${label}` },
  { key: `${key}Url`, kind: "url", label: `Link do ${label}` },
];

/** Ícone Font Awesome (`FA_ICONS`) desenhado com `currentColor`; nome desconhecido não desenha nada. */
function Fa({ className, name }: { className?: string; name: string }) {
  const icon = FA_ICONS[name];
  if (!icon) return null;
  return (
    <svg aria-hidden="true" className={className} viewBox={icon[0]}>
      <path d={icon[1]} />
    </svg>
  );
}

/** Título com o trecho final em destaque (cor de destaque do tema). */
function HlTitle({
  className,
  highlight,
  tag: Tag = "h2",
  title,
}: {
  className: string;
  highlight: string;
  tag?: "h1" | "h2";
  title: string;
}) {
  return (
    <Tag className={`hc-h ${className}`}>
      {title}
      {highlight ? (
        <>
          {" "}
          <span className="hc-hl">{highlight}</span>
        </>
      ) : null}
    </Tag>
  );
}

const titleFields: FieldDef[] = [
  { key: "title", kind: "text", label: "Título" },
  {
    key: "highlight",
    kind: "text",
    label: "Trecho em destaque no fim do título",
  },
];

/* ───────────────────────── hero ───────────────────────── */

const hcHero = defineBlock(
  z.object({
    ...screenSchema({ h: 760, hm: 0, ht: 137 }),
    buttonLabel: str("ADQUIRIR AGORA"),
    buttonUrl: str("#pt1"),
    highlight: str("MUDAR!"),
    logo: str(),
    logoAlt: str("Habilidades de Comunicação"),
    subtitle: str(
      "Desenvolva a habilidade mais desejada pelo mercado de trabalho."
    ),
    title: str("AGORA TODAS AS ÁREAS DA SUA VIDA PODEM"),
    topButtonLabel: str("Comprar E-Book"),
    topButtonUrl: str("#pt1"),
  }),
  {
    fields: [
      ...screenFields(),
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoAlt", kind: "text", label: "Descrição da logo" },
      ...urlField("topButton", "botão do topo (escondido no celular)"),
      ...titleFields,
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      ...urlField("button", "botão principal"),
    ],
    group: "content",
    label: "Hero (Habilidades de Comunicação)",
    render: (p, ctx) => (
      <section className="hc-sec hc-hero" style={screenStyle(p, "hc")}>
        <div className="hc-bar">
          <div className="hc-bar-l">
            <Img alt={p.logoAlt} src={p.logo} />
          </div>
          <div className="hc-bar-r">
            {p.topButtonLabel ? (
              <a className="hc-buy" href={href(ctx, p.topButtonUrl)}>
                {p.topButtonLabel}
              </a>
            ) : null}
          </div>
        </div>
        <div className="hc-hero-row">
          <div className="hc-hero-text">
            <HlTitle
              className="hc-hero-title"
              highlight={p.highlight}
              tag="h1"
              title={p.title}
            />
            <p className="hc-hero-sub">{p.subtitle}</p>
            {p.buttonLabel ? (
              <a className="hc-pill" href={href(ctx, p.buttonUrl)}>
                {p.buttonLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    ),
    type: "hcHero",
  }
);

/* ───────────────────────── "Imagine…" + benefícios ───────────────────────── */

const BENEFIT_DEFAULTS = [
  {
    icon: "archway",
    text: "Construindo confiança e credibilidade necessária para a sua comunicação.",
  },
  {
    icon: "people-carry",
    text: "Técnicas testadas e validadas de como finalmente se conectar com seu público.",
  },
  {
    icon: "people-arrows",
    text: "Gerenciar conflitos, negociações e palestras de forma eficaz.",
  },
  {
    icon: "brain",
    text: "Todos os recursos para transformar seu *mindset* e dominar a comunicação.",
  },
  {
    icon: "comment-dots",
    text: "Técnicas modernas para você começar a usar hoje mesmo.",
  },
  {
    icon: "head-side-cough",
    text: "Linguagem corporal, tom de voz, contato visual e hipnose.",
  },
];

const hcBenefits = defineBlock(
  z.object({
    ...screenSchema({ h: 1000, hm: 160, ht: 0 }),
    items: z
      .array(z.object({ icon: str("archway"), text: str() }))
      .default(BENEFIT_DEFAULTS)
      .catch(BENEFIT_DEFAULTS),
    subtitle: str(
      "Técnicas avançadas e práticas comprovadas para melhorar suas habilidades de comunicação verbal e não verbal."
    ),
    title: str(
      "Imagine poder expressar suas ideias de maneira clara e convincente, conquistando a atenção e o respeito das pessoas ao seu redor!"
    ),
  }),
  {
    fields: [
      ...screenFields(),
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          {
            key: "text",
            kind: "textarea",
            label: "Texto (*itálico* entre asteriscos)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Benefícios (3 por linha no computador)",
      },
    ],
    group: "content",
    label: "Benefícios (Habilidades de Comunicação)",
    render: p => {
      const rows: (typeof p.items)[] = [];
      for (let i = 0; i < p.items.length; i += 3)
        rows.push(p.items.slice(i, i + 3));
      return (
        <section className="hc-sec hc-ben" style={screenStyle(p, "hc")}>
          <div className="hc-ben-in">
            <h2 className="hc-h hc-ben-h">{p.title}</h2>
            <p className="hc-ben-sub">{p.subtitle}</p>
          </div>
          <div className="hc-ben-rows">
            {rows.map((row, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a posição da linha é a identidade
              <div className={`hc-ben-row r${r % 2}`} key={r}>
                {row.map((it, i) => (
                  <div
                    className="hc-ben-card"
                    // biome-ignore lint/suspicious/noArrayIndexKey: itens podem repetir
                    key={i}
                  >
                    <span className="hc-ben-ic">
                      <Fa name={it.icon} />
                    </span>
                    <p className="hc-h hc-ben-t">
                      <Inline text={it.text} />
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    },
    type: "hcBenefits",
  }
);

/* ───────────────────────── capítulos ───────────────────────── */

const CHAPTER_DEFAULTS = [
  {
    alt: "",
    image: "",
    text: "Entenda porque o sucesso em qualquer área da sua vida depende de uma comunicação assertiva.",
    title: "POR QUE A COMUNICAÇÃO É IMPORTANTE?",
  },
];

const hcChapters = defineBlock(
  z.object({
    ...screenSchema({ h: 1100, hm: 0, ht: 0 }),
    items: z
      .array(z.object({ alt: str(), image: str(), text: str(), title: str() }))
      .default(CHAPTER_DEFAULTS)
      .catch(CHAPTER_DEFAULTS),
    label: str("CAPÍTULO"),
    tabletLabelSize: int(6, 20, 12),
  }),
  {
    fields: [
      ...screenFields(),
      {
        key: "label",
        kind: "text",
        label: 'Palavra do rótulo (ex.: "CAPÍTULO" → "CAPÍTULO 1")',
      },
      {
        key: "tabletLabelSize",
        kind: "number",
        label: "Tamanho do rótulo no tablet (px)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem (3:2)" },
          { key: "alt", kind: "text", label: "Descrição da imagem" },
          { key: "title", kind: "text", label: "Título (o #N sai da posição)" },
          { key: "text", kind: "textarea", label: "Descrição" },
        ],
        key: "items",
        kind: "list",
        label: "Capítulos (3 por linha no computador)",
      },
    ],
    group: "content",
    label: "Capítulos (Habilidades de Comunicação)",
    render: p => (
      <section
        className="hc-sec hc-chap"
        style={screenStyle(p, "hc", {
          "--hc-label-t": `${p.tabletLabelSize}px`,
        })}
      >
        <div className="hc-chap-grid">
          {p.items.map((it, i) => (
            <article
              className="hc-chap-card"
              // biome-ignore lint/suspicious/noArrayIndexKey: capítulos podem repetir título
              key={i}
            >
              <Img alt={it.alt} src={it.image} />
              <h3 className="hc-h hc-chap-t">
                {it.title}{" "}
                <span className="hc-hl hc-chap-n">{`#${i + 1}`}</span>
              </h3>
              <p className="hc-chap-d">{it.text}</p>
              {p.label ? (
                <p className="hc-h hc-chap-l">{`${p.label} ${i + 1}`}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    ),
    type: "hcChapters",
  }
);

/* ───────────────────────── bônus + oferta + suporte ───────────────────────── */

const BONUS_DEFAULTS = [
  {
    text: "1. Como se tornar 1% melhor em qualquer coisa todos os dias – Hábitos Atômicos",
  },
  { text: "2. A arte da GUERRA – Sun Tzu (24 Lições)" },
  { text: "3. 48 leis psicológicas do poder – Robert Greene" },
];

const hcBonus = defineBlock(
  z.object({
    ...screenSchema({ h: 718, hm: 0, ht: 0 }),
    highlight: str("EXCLUSIVOS!"),
    items: z
      .array(z.object({ text: str() }))
      .default(BONUS_DEFAULTS)
      .catch(BONUS_DEFAULTS),
    supportText: str("Equipe profissional à disposição."),
    supportTitle: str("TENHA O MELHOR SUPORTE!"),
    title: str("3 BÔNUS"),
  }),
  {
    fields: [
      ...screenFields(),
      ...titleFields,
      {
        itemFields: [{ key: "text", kind: "text", label: "Bônus" }],
        key: "items",
        kind: "list",
        label: "Bônus (estrela amarela ao passar o mouse)",
      },
      { key: "supportTitle", kind: "text", label: "Título do suporte" },
      { key: "supportText", kind: "text", label: "Texto do suporte" },
    ],
    group: "content",
    label: "Bônus, oferta e suporte (Habilidades de Comunicação)",
    render: (p, _ctx, children) => (
      <section className="hc-sec hc-bonus" style={screenStyle(p, "hc")}>
        <div className="hc-bonus-row">
          <div className="hc-bonus-l">
            <HlTitle
              className="hc-bonus-h"
              highlight={p.highlight}
              title={p.title}
            />
          </div>
          <ul className="hc-bonus-list">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: bônus podem repetir
              <li key={i}>
                <Fa className="hc-star" name="star" />
                <span className="hc-bonus-t">{it.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hc-bonus-slot">{children}</div>
        {p.supportTitle || p.supportText ? (
          <div className="hc-support">
            {p.supportTitle ? (
              <p className="hc-h hc-support-h">{p.supportTitle}</p>
            ) : null}
            {p.supportText ? (
              <p className="hc-support-t">{p.supportText}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    ),
    type: "hcBonus",
  }
);

export const habilidadesBlocks: BlockDefinition[] = [
  hcHero,
  hcBenefits,
  hcChapters,
  hcBonus,
];
