import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { carFields, carSchema, int, SiCar, str, yesNo } from "./sim-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { inlineVideoEmbed } from "./youtube.js";

/**
 * Blocos da página de vendas "O Outro Lado da Internet" (prefixo `ol`, escopo `.sb-ol`, CSS em
 * `renderer/outrolado.ts`). Todo texto, imagem e link é prop. O fundo e a altura mínima têm valores por tela
 * (computador, tablet ≤ 1024 e celular ≤ 767) pelas variáveis `--ol-bg*`/`--ol-h*`. O carrossel reaproveita o
 * `SiCar` (runtime `[data-si-car]` do `fx-runtime`); a capa do vídeo vira o player por `[data-ol-video]`.
 *
 * Ordem dos filhos (da qual dependem os caminhos de `Block.fx`): em `olOffer`, `1.1.2.1` é o cartão e o
 * botão de compra é o filho 5 dele (`1.1.2.1.5`).
 */

/* ───────────────────────── peças comuns ───────────────────────── */

const POSITIONS = [
  "center center",
  "center top",
  "center bottom",
  "left center",
  "right center",
] as const;

const POSITION_OPTIONS = [
  { label: "Centro", value: "center center" },
  { label: "Topo", value: "center top" },
  { label: "Embaixo", value: "center bottom" },
  { label: "Esquerda", value: "left center" },
  { label: "Direita", value: "right center" },
];

/** Fundo e altura mínima por tela (0 = altura automática). */
const screenSchema = (d: { h: number; ht: number; hm: number }) => ({
  bg: str(),
  bgMobile: str(),
  bgPosition: z.enum(POSITIONS).default("center center").catch("center center"),
  bgTablet: str(),
  minHeight: int(0, 3000, d.h),
  minHeightMobile: int(0, 3000, d.hm),
  minHeightTablet: int(0, 3000, d.ht),
});

const screenFields = (withBg = true): FieldDef[] => [
  ...(withBg
    ? ([
        { key: "bg", kind: "image", label: "Fundo (computador)" },
        {
          key: "bgTablet",
          kind: "image",
          label: "Fundo (tablet e celular, ≤ 1024px)",
        },
        {
          key: "bgMobile",
          kind: "image",
          label: "Fundo do celular (vazio = o do tablet)",
        },
        {
          key: "bgPosition",
          kind: "select",
          label: "Posição do fundo",
          options: POSITION_OPTIONS,
        },
      ] as FieldDef[])
    : []),
  { key: "minHeight", kind: "number", label: "Altura mínima (px, 0 = auto)" },
  {
    key: "minHeightTablet",
    kind: "number",
    label: "Altura mínima no tablet (px, 0 = auto)",
  },
  {
    key: "minHeightMobile",
    kind: "number",
    label: "Altura mínima no celular (px, 0 = auto)",
  },
];

interface ScreenProps {
  bg: string;
  bgMobile: string;
  bgPosition: string;
  bgTablet: string;
  minHeight: number;
  minHeightMobile: number;
  minHeightTablet: number;
}

function screenStyle(p: ScreenProps, extra: Record<string, string> = {}) {
  return {
    "--ol-bg": cssUrl(p.bg),
    ...(p.bgTablet ? { "--ol-bg-t": cssUrl(p.bgTablet) } : {}),
    ...(p.bgMobile ? { "--ol-bg-m": cssUrl(p.bgMobile) } : {}),
    "--ol-h": `${p.minHeight}px`,
    "--ol-h-m": `${p.minHeightMobile}px`,
    "--ol-h-t": `${p.minHeightTablet}px`,
    "--ol-pos": p.bgPosition,
    ...extra,
  } as CSSProperties;
}

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

/** `**trecho**` vira negrito verde; o resto é texto puro. */
function Rich({ text }: { text: string }): ReactNode {
  return text.split("**").map((t, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
      <strong key={i}>{t}</strong>
    ) : (
      t
    )
  );
}

const button = (key: string, label: string): FieldDef[] => [
  { key: `${key}Label`, kind: "text", label: `Texto do ${label}` },
  { key: `${key}Url`, kind: "url", label: `Link do ${label}` },
];

const titleFields: FieldDef[] = [
  { key: "title", kind: "text", label: "Título" },
  { key: "highlight", kind: "text", label: "Trecho em verde do título" },
];

/** Título com o trecho final em verde. */
function Title({
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
    <Tag className={`ol-h ${className}`}>
      {title}
      {highlight ? (
        <>
          {" "}
          <span className="ol-hl">{highlight}</span>
        </>
      ) : null}
    </Tag>
  );
}

function ScrollButton({
  ctx,
  glow,
  label,
  url,
}: {
  ctx: RenderContext;
  glow: boolean;
  label: string;
  url: string;
}) {
  if (!label) return null;
  return (
    <a className={`ol-scroll${glow ? "glow" : ""}`} href={href(ctx, url)}>
      {label}
    </a>
  );
}

/* ───────────────────────── ícones ───────────────────────── */

const ICONS: Record<string, ReactNode> = {
  unlock: (
    <>
      <rect height="11" rx="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 3 3.2M2 2l20 20" />
    </>
  ),
  virus: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
    </>
  ),
  wifi: (
    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
  ),
};

const ICON_OPTIONS = [
  { label: "Usuários riscados", value: "users" },
  { label: "Wi-Fi", value: "wifi" },
  { label: "Vírus", value: "virus" },
  { label: "Cadeado aberto", value: "unlock" },
];

/* ───────────────────────── hero ───────────────────────── */

const olHero = defineBlock(
  z.object({
    ...screenSchema({ h: 1008, hm: 780, ht: 1103 }),
    badgeLabel: str("ESTÁ PREPARADO?"),
    badgeUrl: str("#pt1"),
    buttonLabel: str("descobrir"),
    buttonUrl: str("#pt1"),
    highlight: str("INTERNET"),
    subtitle: str("Você não tem ideia do que te aguarda!"),
    title: str("O OUTRO LADO DA"),
  }),
  {
    fields: [
      ...screenFields(),
      ...button("badge", "selo do topo"),
      ...titleFields,
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      ...button("button", "botão"),
    ],
    group: "content",
    label: "Hero (O Outro Lado da Internet)",
    render: (p, ctx) => (
      <section className="ol-sec ol-hero" style={screenStyle(p)}>
        {p.badgeLabel ? (
          <a className="ol-badge" href={href(ctx, p.badgeUrl)}>
            {p.badgeLabel}
          </a>
        ) : null}
        <div className="ol-in">
          <div className="ol-hero-text">
            <Title
              className="ol-hero-title"
              highlight={p.highlight}
              tag="h1"
              title={p.title}
            />
            <p className="ol-hero-sub">{p.subtitle}</p>
            <ScrollButton
              ctx={ctx}
              glow
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
        </div>
      </section>
    ),
    type: "olHero",
  }
);

/* ───────────────────────── mundo perigoso ───────────────────────── */

const olDanger = defineBlock(
  z.object({
    ...screenSchema({ h: 920, hm: 1043, ht: 1153 }),
    buttonLabel: str("Entender..."),
    buttonUrl: str("#pt2"),
    highlight: str("PERIGOSO"),
    icons: z
      .array(z.object({ icon: str("wifi") }))
      .default([])
      .catch([]),
    list: str(),
    text: str(),
    title: str("A INTERNET É UM MUNDO"),
  }),
  {
    fields: [
      ...screenFields(),
      ...titleFields,
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
        ],
        key: "icons",
        kind: "list",
        label: "Ícones",
      },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (parágrafos separados por linha em branco)",
      },
      { key: "list", kind: "textarea", label: "Lista (um item por linha)" },
      ...button("button", "botão"),
    ],
    group: "content",
    label: "Mundo perigoso (O Outro Lado da Internet)",
    render: (p, ctx) => (
      <section className="ol-sec ol-danger" style={screenStyle(p)}>
        <div className="ol-in">
          <div className="ol-danger-col">
            <Title
              className="ol-danger-title"
              highlight={p.highlight}
              title={p.title}
            />
            <div className="ol-icons">
              {p.icons.map((it, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ícones podem repetir
                <span className="ol-icon" key={i}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    {ICONS[it.icon] ?? ICONS.wifi}
                  </svg>
                </span>
              ))}
            </div>
            {paragraphs(p.text).map(t => (
              <p key={t}>{t}</p>
            ))}
            <div className="ol-list">
              {lines(p.list).map(t => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <div className="ol-danger-act">
              <ScrollButton
                ctx={ctx}
                glow={false}
                label={p.buttonLabel}
                url={p.buttonUrl}
              />
            </div>
          </div>
        </div>
      </section>
    ),
    type: "olDanger",
  }
);

/* ───────────────────────── curiosidade + carrossel ───────────────────────── */

const olCuriosity = defineBlock(
  z.object({
    ...screenSchema({ h: 790, hm: 0, ht: 790 }),
    ...carSchema({
      delay: 2000,
      gap: 7,
      perView: 4,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 1000,
    }),
    highlight: str("outro mundo?"),
    images: z
      .array(z.object({ alt: str(), image: str() }))
      .default([])
      .catch([]),
    text: str(),
    title: str("Qual o tamanho da sua curiosidade sobre esse"),
  }),
  {
    fields: [
      ...screenFields(false),
      ...titleFields,
      {
        key: "text",
        kind: "textarea",
        label:
          "Texto (parágrafos separados por linha em branco; **trecho** = verde em negrito)",
      },
      ...carFields(),
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem (retrato 9:16)" },
          { key: "alt", kind: "text", label: "Descrição (acessibilidade)" },
        ],
        key: "images",
        kind: "list",
        label: "Imagens do carrossel",
      },
    ],
    group: "content",
    label: "Curiosidade e carrossel (O Outro Lado da Internet)",
    render: p => (
      <section
        className="ol-sec ol-cur"
        style={screenStyle({ ...p, bg: "", bgMobile: "", bgTablet: "" })}
      >
        <div className="ol-cur-row">
          <Title
            className="ol-cur-title"
            highlight={p.highlight}
            title={p.title}
          />
          <div className="ol-cur-text">
            {paragraphs(p.text).map(t => (
              <p key={t}>
                <Rich text={t} />
              </p>
            ))}
          </div>
        </div>
        <div className="ol-car">
          <SiCar
            arrows="inside"
            items={p.images.map(it => (
              <Img alt={it.alt} key={it.image} src={it.image} />
            ))}
            p={p}
          />
        </div>
      </section>
    ),
    type: "olCuriosity",
  }
);

/* ───────────────────────── vídeo ───────────────────────── */

const olVideo = defineBlock(
  z.object({
    ...screenSchema({ h: 873, hm: 0, ht: 365 }),
    poster: str(),
    videoUrl: str("https://player.vimeo.com/video/830588189"),
  }),
  {
    fields: [
      ...screenFields(),
      { key: "poster", kind: "image", label: "Capa do vídeo" },
      { key: "videoUrl", kind: "url", label: "Vídeo (Vimeo ou YouTube)" },
    ],
    group: "media",
    label: "Vídeo com capa (O Outro Lado da Internet)",
    render: p => {
      const src = inlineVideoEmbed(p.videoUrl);
      return (
        <section className="ol-sec ol-video" style={screenStyle(p)}>
          <div className="ol-in">
            <div className="ol-vframe">
              <a
                aria-label="Reproduzir vídeo"
                className="ol-vposter"
                data-ol-video={src ?? undefined}
                href={p.videoUrl || "#"}
                style={{ "--ol-poster": cssUrl(p.poster) } as CSSProperties}
              >
                <span className="ol-play">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M6 3l14 9-14 9z" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </section>
      );
    },
    type: "olVideo",
  }
);

/* ───────────────────────── oferta ───────────────────────── */

const olOffer = defineBlock(
  z.object({
    ...screenSchema({ h: 1252, hm: 0, ht: 1252 }),
    buttonLabel: str("ADQUIRIR AGORA"),
    buttonUrl: str(),
    cardBg: str("#FFFFFF"),
    cardTitle: str("OFERTA ESPECIAL"),
    cashback: str("100% de cashback instantaneamente!"),
    from: str("R$49,90"),
    fromLabel: str("DE"),
    leftText: str(
      "Você está a um clique de mudar a sua percepção para sempre!"
    ),
    leftTitle: str("Quanto vale a sua segurança?"),
    price: str("R$37,00"),
    priceLabel: str("POR APENAS"),
    seal: str(),
    stamps: str(),
  }),
  {
    fields: [
      ...screenFields(),
      { key: "leftTitle", kind: "text", label: "Título da esquerda" },
      { key: "leftText", kind: "text", label: "Texto da esquerda" },
      { key: "seal", kind: "image", label: "Selo de garantia" },
      { key: "cardBg", kind: "color", label: "Fundo do cartão" },
      { key: "cardTitle", kind: "text", label: "Título do cartão" },
      { key: "cashback", kind: "text", label: "Frase com marca-texto verde" },
      { key: "fromLabel", kind: "text", label: "Antes do preço antigo" },
      { key: "from", kind: "text", label: "Preço antigo (riscado)" },
      { key: "priceLabel", kind: "text", label: "Depois do preço antigo" },
      { key: "price", kind: "text", label: "Preço" },
      ...button("button", "botão de compra"),
      { key: "stamps", kind: "image", label: "Selos de compra" },
    ],
    group: "content",
    label: "Oferta (O Outro Lado da Internet)",
    render: (p, ctx) => (
      <section
        className="ol-sec ol-offer"
        style={screenStyle(p, {
          "--ol-card": /^#[0-9a-f]{3,8}$/i.test(p.cardBg) ? p.cardBg : "#fff",
        })}
      >
        <div className="ol-offer-in">
          <div className="ol-offer-left">
            <h2>{p.leftTitle}</h2>
            <p>{p.leftText}</p>
            <Img alt="7 dias de garantia" className="ol-seal" src={p.seal} />
          </div>
          <div className="ol-offer-right">
            <div className="ol-card">
              <h2 className="ol-card-title">{p.cardTitle}</h2>
              <p className="ol-cash">
                <span>{p.cashback}</span>
              </p>
              <p className="ol-from">
                {p.fromLabel} <del>{p.from}</del>
                <br />
                {p.priceLabel}
              </p>
              <p className="ol-price">{p.price}</p>
              <a className="ol-buy" href={href(ctx, p.buttonUrl)}>
                {p.buttonLabel}
              </a>
              {p.stamps ? (
                <Img
                  alt="Ambiente seguro | 7 dias de garantia"
                  className="ol-stamps"
                  src={p.stamps}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    ),
    type: "olOffer",
  }
);

/* ───────────────────────── FAQ ───────────────────────── */

const olFaq = defineBlock(
  z.object({
    items: z
      .array(z.object({ answer: str(), question: str() }))
      .default([])
      .catch([]),
    openFirst: yesNo("yes"),
    title: str("PERGUNTAS FREQUENTES"),
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
    label: "Perguntas frequentes (O Outro Lado da Internet)",
    render: p => (
      <section className="ol-sec ol-faq">
        <div className="ol-faq-in">
          <div className="ol-faq-top" />
          <h2 className="ol-h ol-faq-h">{p.title}</h2>
          <div className="ol-faq-gap" />
          {p.items.map((it, i) => (
            <details
              className="ol-faq-item"
              key={it.question + i}
              name="sb-ol-faq"
              open={i === 0 && p.openFirst === "yes"}
            >
              <summary>
                <svg
                  aria-hidden="true"
                  className="ol-faq-ic"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14" />
                  <path className="v" d="M12 5v14" />
                </svg>
                <span>{it.question}</span>
              </summary>
              <div className="ol-faq-a">{it.answer}</div>
            </details>
          ))}
        </div>
      </section>
    ),
    type: "olFaq",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const olFooter = defineBlock(z.object({ copyright: str() }), {
  fields: [{ key: "copyright", kind: "text", label: "Texto do rodapé" }],
  group: "layout",
  label: "Rodapé (O Outro Lado da Internet)",
  render: p => (
    <footer className="ol-foot">
      <div className="ol-foot-in">
        <p>{p.copyright}</p>
      </div>
    </footer>
  ),
  type: "olFooter",
});

export const outroladoBlocks: BlockDefinition[] = [
  olHero,
  olDanger,
  olCuriosity,
  olVideo,
  olOffer,
  olFaq,
  olFooter,
];
