import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { carSchema, int, SiCar, str } from "./sim-lib.js";
import type { BlockDefinition, FieldDef } from "./types.js";
import { inlineVideoEmbed } from "./youtube.js";

/**
 * Blocos da página de vendas "VSL Milionário" (prefixo `vm`, escopo `.sb-vm`, CSS em `renderer/vslmilionario.ts`).
 * Todo texto, imagem e link é prop. Oferta, FAQ e rodapé são os blocos comuns `ebook*` (`blocks/ebook.tsx`).
 *
 * **Camadas decorativas** (`overlayImage`, `overlayPosition`, `overlaySize`, `overlayOpacity`; o depoimento tem uma 2ª,
 * `overlay2*`): `<div class="vm-layer">` absoluto, sempre o **último** filho da seção, então não desloca os caminhos de
 * `Block.fx` do conteúdo.
 *
 * Ordem dos filhos (caminhos de `Block.fx`; `1` = a seção):
 * - `vmHero`: `1.1.1` coluna de texto (`.1` título, `.2` subtítulo, `.3` botão).
 * - `vmHighlights`: `1.1.1.N` = cartão N.
 * - `vmMethod`: `1.1.1` texto, `1.1.2.1` imagem, `1.1.2.2` vídeo flutuante.
 * - `vmFeatures`: `1.1` cabeçalho, `1.2.N` = cartão N (grade).
 * - `vmStats`: `1.1.1` texto, `1.1.2` coluna vazia; `2` = faixa de números (fora da seção, sobe sobre ela), `2.1` a faixa.
 * - `vmBenefits`: `1.1` cabeçalho, `1.2.N` = cartão N (grade).
 * - `vmBonus`: `1.1.1` texto, `1.1.2.N` = cartão N.
 * - `vmGuarantee`: `1.1.1` bloco centralizado.
 * - `vmTestimonials`: `1.1` cabeçalho, `1.2` carrossel.
 */

/* ───────────────────────── peças comuns ───────────────────────── */

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}|\n/)
    .map(p => p.trim())
    .filter(Boolean);

const POSITIONS = [
  "center",
  "top left",
  "top center",
  "top right",
  "bottom left",
  "bottom center",
  "bottom right",
] as const;
type Position = (typeof POSITIONS)[number];
const SIZE = /^(cover|contain|auto|\d{1,4}px|\d{1,3}%)$/;

const position = (d: Position) => z.enum(POSITIONS).default(d).catch(d);
const size = (d: string) => z.string().regex(SIZE).default(d).catch(d);

const layerShape = (d: {
  image?: string;
  opacity?: number;
  position?: Position;
  size?: string;
}) => ({
  overlayImage: str(d.image ?? ""),
  overlayOpacity: int(0, 100, d.opacity ?? 50),
  overlayPosition: position(d.position ?? "center"),
  overlaySize: size(d.size ?? "cover"),
});

const layer2Shape = (d: {
  image?: string;
  opacity?: number;
  position?: Position;
  size?: string;
}) => ({
  overlay2Image: str(d.image ?? ""),
  overlay2Opacity: int(0, 100, d.opacity ?? 50),
  overlay2Position: position(d.position ?? "center"),
  overlay2Size: size(d.size ?? "cover"),
});

const layerFieldsFor = (prefix: "overlay" | "overlay2", n = ""): FieldDef[] => [
  { key: `${prefix}Image`, kind: "image", label: `Camada decorativa${n}` },
  {
    key: `${prefix}Position`,
    kind: "select",
    label: `Camada${n}: posição`,
    options: POSITIONS.map(value => ({ label: value, value })),
  },
  {
    key: `${prefix}Size`,
    kind: "text",
    label: `Camada${n}: tamanho (cover, auto, 250px, 50%)`,
  },
  {
    key: `${prefix}Opacity`,
    kind: "number",
    label: `Camada${n}: opacidade (%)`,
  },
];

/** Camada decorativa: imagem posicionada com opacidade, atrás do conteúdo. Sem imagem não sai. */
function Layer({
  image,
  opacity,
  pos,
  sz,
}: {
  image: string;
  opacity: number;
  pos: string;
  sz: string;
}) {
  if (!image) return null;
  return (
    <div
      aria-hidden="true"
      className="vm-layer"
      style={
        {
          "--vm-ov": cssUrl(image),
          "--vm-ov-o": opacity / 100,
          "--vm-ov-p": pos,
          "--vm-ov-s": SIZE.test(sz) ? sz : "cover",
        } as CSSProperties
      }
    />
  );
}

interface LayerProps {
  overlayImage: string;
  overlayOpacity: number;
  overlayPosition: string;
  overlaySize: string;
}
const L1 = (p: LayerProps) => (
  <Layer
    image={p.overlayImage}
    opacity={p.overlayOpacity}
    pos={p.overlayPosition}
    sz={p.overlaySize}
  />
);

/** Sobretítulo (h6) + título (h2). Sem sobretítulo ou título o elemento não sai. */
function Head({
  eyebrow,
  title,
  align = "center",
}: {
  align?: "center" | "left";
  eyebrow: string;
  title: string;
}) {
  return (
    <div className={`vm-head ${align}`}>
      {eyebrow ? <h6 className="vm-eyebrow">{eyebrow}</h6> : null}
      {title ? <h2 className="vm-h2">{title}</h2> : null}
    </div>
  );
}

const headSchema = (d: { eyebrow: string; title: string }) => ({
  eyebrow: str(d.eyebrow),
  title: str(d.title),
});
const headFields: FieldDef[] = [
  { key: "eyebrow", kind: "text", label: "Sobretítulo" },
  { key: "title", kind: "text", label: "Título" },
];

function Btn({
  className = "",
  ctx,
  label,
  url,
}: {
  className?: string;
  ctx: Parameters<typeof href>[0];
  label: string;
  url: string;
}) {
  if (!label) return null;
  return (
    <a className={`vm-btn ${className}`.trim()} href={href(ctx, url)}>
      {label}
    </a>
  );
}

/* ícones de traço fino (o original usa o ElementsKit/Font Awesome) */
const ICONS: Record<string, ReactNode> = {
  camera: (
    <>
      <path d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  certificate: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="m8.2 14 -1.2 8 5-3 5 3-1.2-8" />
      <path d="m9.5 9 1.8 1.8L15 7.3" />
    </>
  ),
  film: (
    <>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5" />
    </>
  ),
  money: (
    <>
      <rect height="12" rx="2" width="20" x="2" y="6" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  play: (
    <>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
  video: (
    <>
      <path d="m16 13 5.2 3.2a.5.5 0 0 0 .8-.4V8.2a.5.5 0 0 0-.8-.4L16 11" />
      <rect height="12" rx="2" width="14" x="2" y="6" />
    </>
  ),
};
export const VM_ICON_OPTIONS = Object.keys(ICONS)
  .sort()
  .map(value => ({
    label:
      {
        camera: "Câmera fotográfica",
        certificate: "Certificado",
        film: "Filme (claquete)",
        money: "Nota de dinheiro",
        play: "Filme com play",
        video: "Câmera de vídeo",
      }[value] ?? value,
    value,
  }));

function Icon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      className="vm-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      viewBox="0 0 24 24"
    >
      {ICONS[name] ?? ICONS.play}
    </svg>
  );
}

const list = <T extends z.ZodRawShape>(shape: T) =>
  z.array(z.object(shape)).default([]).catch([]);

/* ───────────────────────── hero ───────────────────────── */

const vmHero = defineBlock(
  z.object({
    bg: str(),
    bgMobile: str(),
    bgPosition: str("100% 0"),
    bgPositionMobile: str("center"),
    bgPositionTablet: str("87% 0"),
    bgTablet: str(),
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    subtitle: str("E a maioria desperdiça esse tempo"),
    title: str("Você tem apenas 8 segundos para vender…"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h1)" },
      { key: "subtitle", kind: "text", label: "Subtítulo (h4)" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "bg", kind: "image", label: "Fundo (computador)" },
      {
        key: "bgPosition",
        kind: "text",
        label: "Posição do fundo (ex.: 100% 0)",
      },
      {
        key: "bgTablet",
        kind: "image",
        label: "Fundo no tablet (vazio = o mesmo)",
      },
      { key: "bgPositionTablet", kind: "text", label: "Posição no tablet" },
      {
        key: "bgMobile",
        kind: "image",
        label: "Fundo no celular (vazio = o mesmo)",
      },
      { key: "bgPositionMobile", kind: "text", label: "Posição no celular" },
    ],
    group: "content",
    label: "Hero (VSL Milionário)",
    render: (p, ctx) => {
      const pos = (v: string, d: string) =>
        /^[\w\s%.-]{1,40}$/.test(v) ? v : d;
      return (
        <section
          className="vm-sec vm-hero"
          style={
            {
              "--vm-bg": cssUrl(p.bg),
              "--vm-bg-m": cssUrl(p.bgMobile || p.bg),
              "--vm-bg-t": cssUrl(p.bgTablet || p.bg),
              "--vm-pos": pos(p.bgPosition, "100% 0"),
              "--vm-pos-m": pos(p.bgPositionMobile, "center"),
              "--vm-pos-t": pos(p.bgPositionTablet, "87% 0"),
            } as CSSProperties
          }
        >
          <div className="vm-in vm-hero-in">
            <div className="vm-hero-copy">
              <h1 className="vm-h1">{p.title}</h1>
              {p.subtitle ? (
                <h4 className="vm-hero-sub">{p.subtitle}</h4>
              ) : null}
              <Btn
                className="lg"
                ctx={ctx}
                label={p.buttonLabel}
                url={p.buttonUrl}
              />
            </div>
          </div>
          <div aria-hidden="true" className="vm-veil" />
        </section>
      );
    },
    type: "vmHero",
  }
);

/* ───────────────────────── destaques ───────────────────────── */

const vmHighlights = defineBlock(
  z.object({
    items: list({
      icon: str("film"),
      text: str(),
      title: str(),
    }),
  }),
  {
    fields: [
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: VM_ICON_OPTIONS,
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Descrição" },
        ],
        key: "items",
        kind: "list",
        label: "Destaques",
      },
    ],
    group: "content",
    label: "Três destaques sobre o hero (VSL Milionário)",
    render: p => (
      <section className="vm-sec vm-hl">
        <div className="vm-in">
          <div className="vm-hl-grid">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
              <article className="vm-glass vm-hl-card" key={i}>
                <Icon name={it.icon} />
                <h4 className="vm-h4">{it.title}</h4>
                <p className="vm-small">{it.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "vmHighlights",
  }
);

/* ───────────────────────── método (texto + imagem + vídeo flutuante) ───────────────────────── */

const vmMethod = defineBlock(
  z.object({
    ...headSchema({
      eyebrow: "o poder de persuadir",
      title: "O Método por trás dos VSL's que Realmente Vendem",
    }),
    ...layerShape({
      image: "",
      opacity: 50,
      position: "bottom left",
      size: "250px",
    }),
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    image: str(),
    poster: str(),
    text: str(),
    videoFrame: int(0, 40, 12),
    videoRatio: z.enum(["4/3", "16/9", "1/1"]).default("4/3").catch("4/3"),
    videoUrl: str(),
  }),
  {
    fields: [
      ...headFields,
      {
        key: "text",
        kind: "textarea",
        label: "Parágrafos (um por linha)",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "image", kind: "image", label: "Imagem de fundo da mídia" },
      { key: "videoUrl", kind: "url", label: "Vídeo (Vimeo ou YouTube)" },
      { key: "poster", kind: "image", label: "Capa do vídeo" },
      {
        key: "videoRatio",
        kind: "select",
        label: "Proporção do vídeo",
        options: [
          { label: "4:3", value: "4/3" },
          { label: "16:9", value: "16/9" },
          { label: "1:1", value: "1/1" },
        ],
      },
      { key: "videoFrame", kind: "number", label: "Moldura do vídeo (px)" },
      ...layerFieldsFor("overlay"),
    ],
    group: "media",
    label: "Método com vídeo flutuante (VSL Milionário)",
    render: (p, ctx) => {
      const src = inlineVideoEmbed(p.videoUrl);
      return (
        <section className="vm-sec vm-method">
          <div className="vm-in vm-method-in">
            <div className="vm-method-text">
              <Head align="left" eyebrow={p.eyebrow} title={p.title} />
              {paragraphs(p.text).map((t, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do parágrafo
                <p className="vm-p" key={i}>
                  {t}
                </p>
              ))}
              <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
            </div>
            <div className="vm-method-media">
              <Img alt="" className="vm-method-img" src={p.image} />
              <div
                className="vm-vframe"
                style={
                  {
                    "--vm-frame": `${p.videoFrame}px`,
                    "--vm-ratio": p.videoRatio,
                  } as CSSProperties
                }
              >
                <a
                  aria-label="Reproduzir vídeo"
                  className="vm-vposter"
                  data-ol-video={src ?? undefined}
                  href={p.videoUrl || "#"}
                  style={{ "--vm-poster": cssUrl(p.poster) } as CSSProperties}
                >
                  <svg
                    aria-hidden="true"
                    className="vm-play"
                    viewBox="0 0 80 80"
                  >
                    <circle cx="40" cy="40" r="37" />
                    <path d="M33 26.5 55 40 33 53.5z" />
                  </svg>
                  <span className="vm-sr">Reproduzir vídeo</span>
                </a>
              </div>
            </div>
          </div>
          {L1(p)}
        </section>
      );
    },
    type: "vmMethod",
  }
);

/* ───────────────────────── "segredos revelados" (6 cartões) ───────────────────────── */

const vmFeatures = defineBlock(
  z.object({
    ...headSchema({
      eyebrow: "O Que entregamos?",
      title: "Literalmente os Segredos Revelados",
    }),
    ...layerShape({
      image: "",
      opacity: 50,
      position: "center",
      size: "cover",
    }),
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    items: list({ image: str(), text: str(), title: str() }),
  }),
  {
    fields: [
      ...headFields,
      { key: "buttonLabel", kind: "text", label: "Texto do botão dos cartões" },
      { key: "buttonUrl", kind: "url", label: "Link do botão dos cartões" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Ícone 3D" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
      ...layerFieldsFor("overlay"),
    ],
    group: "content",
    label: "Cartões de vidro com ícone 3D (VSL Milionário)",
    render: (p, ctx) => (
      <section className="vm-sec vm-features">
        <div className="vm-in">
          <Head eyebrow={p.eyebrow} title={p.title} />
          <div className="vm-grid3">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
              <article className="vm-glass soft vm-fcard" key={i}>
                <Img alt="" className="vm-3d" src={it.image} />
                <h4 className="vm-h4">{it.title}</h4>
                <p className="vm-body">{it.text}</p>
                <Btn
                  className="sm"
                  ctx={ctx}
                  label={p.buttonLabel}
                  url={p.buttonUrl}
                />
              </article>
            ))}
          </div>
        </div>
        {L1(p)}
      </section>
    ),
    type: "vmFeatures",
  }
);

/* ───────────────────────── "+10 mil" + faixa de números ───────────────────────── */

/** Valor exibido: "4.9" com o separador escolhido (a prop do `data-sb-count` fica sempre com ponto). */
const shown = (v: string, dsep: string) =>
  dsep === "," ? v.replace(".", ",") : v;

const vmStats = defineBlock(
  z.object({
    ...layerShape({
      image: "",
      opacity: 30,
      position: "bottom center",
      size: "cover",
    }),
    counters: list({ label: str(), suffix: str(), value: str("0") }),
    decimalSep: z.enum([".", ","]).default(".").catch("."),
    text: str(),
    title: str("+10 mil profissionais já aceleraram seus resultados"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "value", kind: "text", label: "Valor (ex.: 10 ou 4.9)" },
          { key: "suffix", kind: "text", label: "Depois do número (ex.: K+)" },
          { key: "label", kind: "text", label: "Legenda" },
        ],
        key: "counters",
        kind: "list",
        label: "Números",
      },
      {
        key: "decimalSep",
        kind: "select",
        label: "Separador decimal",
        options: [
          { label: "Ponto (4.9), como o original", value: "." },
          { label: "Vírgula (4,9)", value: "," },
        ],
      },
      ...layerFieldsFor("overlay"),
    ],
    group: "content",
    label: "Prova social com contadores (VSL Milionário)",
    render: p => (
      <>
        <section className="vm-sec vm-stats">
          <div className="vm-in vm-stats-in">
            <div className="vm-stats-text">
              <h2 className="vm-h2">{p.title}</h2>
              {p.text ? <p className="vm-body">{p.text}</p> : null}
            </div>
            <div className="vm-stats-side" />
          </div>
          {L1(p)}
        </section>
        <div className="vm-strip-wrap">
          <div className="vm-glass vm-strip">
            {p.counters.map((c, i) => {
              const v = c.value.replace(",", ".");
              const num = Number.isFinite(Number(v)) ? v : "0";
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do contador
                <div className="vm-counter" key={i}>
                  <span
                    className="vm-num"
                    data-dsep={p.decimalSep === "," ? "," : undefined}
                    data-ms="2000"
                    data-sb-count={num}
                    data-suffix={c.suffix || undefined}
                  >
                    {shown(num, p.decimalSep)}
                    {c.suffix}
                  </span>
                  <span className="vm-label">{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </>
    ),
    type: "vmStats",
  }
);

/* ───────────────────────── "alta conversão" (cartões sólidos) ───────────────────────── */

const vmBenefits = defineBlock(
  z.object({
    ...headSchema({ eyebrow: "Máximo resultado", title: "ALTA CONVERSÃO" }),
    ...layerShape({
      image: "",
      opacity: 50,
      position: "top left",
      size: "auto",
    }),
    items: list({ icon: str("certificate"), text: str(), title: str() }),
  }),
  {
    fields: [
      ...headFields,
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: VM_ICON_OPTIONS,
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Benefícios",
      },
      ...layerFieldsFor("overlay"),
    ],
    group: "content",
    label: "Benefícios em cartões sólidos (VSL Milionário)",
    render: p => (
      <section className="vm-sec vm-benefits">
        <div className="vm-in">
          <Head eyebrow={p.eyebrow} title={p.title} />
          <div className="vm-ben-grid">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
              <article className="vm-solid" key={i}>
                <Icon name={it.icon} />
                <div className="vm-solid-txt">
                  <h4 className="vm-h4">{it.title}</h4>
                  <p className="vm-body">{it.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        {L1(p)}
      </section>
    ),
    type: "vmBenefits",
  }
);

/* ───────────────────────── bônus ───────────────────────── */

const vmBonus = defineBlock(
  z.object({
    ...headSchema({
      eyebrow: "Achou que era só isso?",
      title: "BÔNUS EXCLUSIVOS",
    }),
    ...layerShape({
      image: "",
      opacity: 50,
      position: "bottom center",
      size: "cover",
    }),
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    items: list({ image: str(), text: str(), title: str() }),
    text: str("Comprovados na prática por especialistas de marketing digital."),
  }),
  {
    fields: [
      ...headFields,
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Ícone 3D" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Descrição" },
        ],
        key: "items",
        kind: "list",
        label: "Bônus",
      },
      ...layerFieldsFor("overlay"),
    ],
    group: "content",
    label: "Bônus (VSL Milionário)",
    render: (p, ctx) => (
      <section className="vm-sec vm-bonus">
        <div className="vm-in vm-bonus-in">
          <div className="vm-bonus-text">
            <Head align="left" eyebrow={p.eyebrow} title={p.title} />
            {p.text ? <p className="vm-body">{p.text}</p> : null}
            <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
          <div className="vm-bonus-list">
            {p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
              <article className="vm-glass vm-bcard" key={i}>
                <Img alt="" className="vm-3d" src={it.image} />
                <div>
                  <h4 className="vm-h4">{it.title}</h4>
                  <p className="vm-body">{it.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        {L1(p)}
      </section>
    ),
    type: "vmBonus",
  }
);

/* ───────────────────────── garantia ───────────────────────── */

const vmGuarantee = defineBlock(
  z.object({
    ...headSchema({ eyebrow: "E se eu não gostar?", title: "É IMPOSSÍVEL!" }),
    ...layerShape({
      image: "",
      opacity: 30,
      position: "center",
      size: "cover",
    }),
    text: str(),
  }),
  {
    fields: [
      ...headFields,
      { key: "text", kind: "textarea", label: "Texto" },
      ...layerFieldsFor("overlay"),
    ],
    group: "content",
    label: "Garantia sobre foto (VSL Milionário)",
    render: p => (
      <section className="vm-sec vm-guarantee">
        <div className="vm-in vm-guar-in">
          <div className="vm-gbox">
            <Head eyebrow={p.eyebrow} title={p.title} />
            {p.text ? <p className="vm-body">{p.text}</p> : null}
          </div>
        </div>
        {L1(p)}
      </section>
    ),
    type: "vmGuarantee",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const vmTestimonials = defineBlock(
  z.object({
    ...headSchema({
      eyebrow: "TRANSFORMAÇÕES REAIS",
      title: "Quem já teve resultados",
    }),
    ...layerShape({
      image: "",
      opacity: 50,
      position: "bottom right",
      size: "250px",
    }),
    ...layer2Shape({
      image: "",
      opacity: 50,
      position: "top left",
      size: "100px",
    }),
    ...carSchema({
      delay: 5000,
      gap: 35,
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
    }),
    items: list({ image: str(), name: str(), role: str(), text: str() }),
  }),
  {
    fields: [
      ...headFields,
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
      { key: "perView", kind: "number", label: "Por tela (computador)" },
      { key: "perViewTablet", kind: "number", label: "Por tela (tablet)" },
      { key: "perViewMobile", kind: "number", label: "Por tela (celular)" },
      { key: "gap", kind: "number", label: "Espaço entre slides (px)" },
      { key: "delay", kind: "number", label: "Tempo parado (ms)" },
      { key: "speed", kind: "number", label: "Duração da troca (ms)" },
      ...layerFieldsFor("overlay", " 1"),
      ...layerFieldsFor("overlay2", " 2"),
    ],
    group: "content",
    label: "Depoimentos em carrossel (VSL Milionário)",
    render: p => (
      <section className="vm-sec vm-testi">
        <div className="vm-in">
          <Head eyebrow={p.eyebrow} title={p.title} />
          <SiCar
            advance="page"
            arrows="outside"
            className="vm-tcar"
            items={p.items.map((it, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do slide
              <figure className="vm-tslide" key={i}>
                <blockquote className="vm-quote">{it.text}</blockquote>
                <figcaption className="vm-who">
                  <Img alt={it.name} className="vm-avatar" src={it.image} />
                  <span>
                    <b className="vm-name">{it.name}</b>
                    <span className="vm-role">{it.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
            p={p}
          />
        </div>
        {L1(p)}
        <Layer
          image={p.overlay2Image}
          opacity={p.overlay2Opacity}
          pos={p.overlay2Position}
          sz={p.overlay2Size}
        />
      </section>
    ),
    type: "vmTestimonials",
  }
);

export const vslmilionarioBlocks: BlockDefinition[] = [
  vmHero,
  vmHighlights,
  vmMethod,
  vmFeatures,
  vmStats,
  vmBenefits,
  vmBonus,
  vmGuarantee,
  vmTestimonials,
];
