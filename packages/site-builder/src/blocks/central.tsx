import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import {
  href,
  Img,
  Inline,
  LinkButton,
  SocialIcon,
  safeUrl,
} from "./helpers.js";
import type { BlockDefinition, FieldDef } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos da variante `central` (home de marketing escura com verde neon). Todo texto, imagem, link,
 * quantidade e ícone é prop editável; o visual vem de `renderer/central.ts` (escopo `.sb-ct`).
 */
const str = (d = "") => z.string().default(d);
const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);

/* ───────────────────────── ícones ───────────────────────── */

/** Ícones de traço (viewBox 24) que o usuário escolhe nos cartões, selos e listas. */
const ICONS: Record<string, { label: string; path: ReactNode }> = {
  arrow: { label: "Seta", path: <path d="M7 17 17 7M9 7h8v8" /> },
  book: {
    label: "Livro",
    path: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
        <path d="M8 7h7M8 11h7" />
      </>
    ),
  },
  chart: {
    label: "Gráfico",
    path: <path d="M4 20V10M10 20V4M16 20v-7M2 20h20" />,
  },
  check: {
    label: "Confirmado",
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.5 3 3 5-6" />
      </>
    ),
  },
  coins: {
    label: "Dinheiro",
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6.5v11M15 9.3c0-1-1.3-1.6-3-1.6s-3 .7-3 2 1.3 1.7 3 2.1 3 .8 3 2.1-1.3 2-3 2-3-.6-3-1.6" />
      </>
    ),
  },
  devices: {
    label: "Notebook e celular",
    path: (
      <>
        <rect height="11" rx="1.5" width="15" x="2" y="4" />
        <path d="M1 18h17" />
        <rect height="9" rx="1.5" width="6" x="16" y="9" />
      </>
    ),
  },
  feather: {
    label: "Pena",
    path: (
      <>
        <path d="M20 4c-8 0-13 4-13 11l-3 5 5-3c7 0 11-6 11-13z" />
        <path d="m8 15 8-8" />
      </>
    ),
  },
  funnel: {
    label: "Funil",
    path: <path d="M3 4h18l-7 8.5V19l-4 2v-8.5z" />,
  },
  keyboard: {
    label: "Teclado",
    path: (
      <>
        <rect height="12" rx="2" width="20" x="2" y="6" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
      </>
    ),
  },
  layout: {
    label: "Layout",
    path: (
      <>
        <rect height="18" rx="2" width="18" x="3" y="3" />
        <path d="M3 9h18M9 21V9" />
      </>
    ),
  },
  mail: {
    label: "E-mail",
    path: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
  news: {
    label: "Jornal",
    path: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <path d="M7 8h5v4H7zM15 8h2M15 12h2M7 16h10" />
      </>
    ),
  },
  phone: {
    label: "Celular",
    path: (
      <>
        <rect height="20" rx="2.5" width="11" x="6.5" y="2" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
  report: {
    label: "Relatório",
    path: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 17v-3M12 17v-6M15 17v-4" />
      </>
    ),
  },
  shield: {
    label: "Escudo",
    path: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />,
  },
  star: {
    label: "Estrela",
    path: (
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
    ),
  },
  triangle: { label: "Triângulo", path: <path d="m12 3 9 16H3z" /> },
};

export const CENTRAL_ICON_OPTIONS = [
  { label: "Nenhum", value: "" },
  ...Object.entries(ICONS).map(([value, { label }]) => ({ label, value })),
];

const ICON_FIELD = (key = "icon", label = "Ícone"): FieldDef => ({
  key,
  kind: "select",
  label,
  options: CENTRAL_ICON_OPTIONS,
});

function Icon({ name }: { name: string }) {
  const def = ICONS[name];
  if (!def) return null;
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {def.path}
    </svg>
  );
}

function StarFilled() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5-4.8-4.6 6.6-.9z" />
    </svg>
  );
}

/** Bolinha aberta ao lado do rótulo das seções (eyebrow). */
export function Ring() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3a9 9 0 1 0 9 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

export function Eyebrow({ text }: { text: string }) {
  return text ? (
    <p className="sb-ct-eyebrow">
      <Ring />
      {text}
    </p>
  ) : null;
}

const bg = (url: string | undefined): CSSProperties =>
  ({ "--ct-img": cssUrl(url) }) as CSSProperties;

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

/* ───────────────────────── hero ───────────────────────── */

const ctHero = defineBlock(
  z.object({
    avatars: z.array(z.object({ alt: str(), src: str() })).default([]),
    buttonLabel: str("Ver Todos Os Posts"),
    buttonUrl: str("/categorias/"),
    chips: z.array(z.object({ label: str(), url: str("#") })).default([]),
    highlight: str("Marketing Digital"),
    panelImage: str(),
    proofLabel: str("Pessoas impactadas"),
    proofValue: str("+10M"),
    socials: z.array(z.object({ label: str(), url: str("#") })).default([]),
    taglines: z.array(z.object({ text: str() })).default([]),
    text: str(),
    title: str("Aprenda O Que Realmente Funciona No"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "highlight",
        kind: "text",
        label: "Palavras em destaque (cor de destaque)",
      },
      {
        itemFields: [
          { key: "src", kind: "image", label: "Foto" },
          { key: "alt", kind: "text", label: "Texto alternativo" },
        ],
        key: "avatars",
        kind: "list",
        label: "Fotos de pessoas (selo de prova social)",
      },
      { key: "proofValue", kind: "text", label: "Número do selo" },
      { key: "proofLabel", kind: "text", label: "Legenda do selo" },
      { key: "text", kind: "textarea", label: "Texto de apoio" },
      { key: "panelImage", kind: "image", label: "Foto de fundo do painel" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "chips",
        kind: "list",
        label: "Assuntos sobre a foto",
      },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
      {
        key: "videoUrl",
        kind: "url",
        label:
          "Vídeo do botão de play (YouTube ou Vimeo abre em popup; vazio = sem botão)",
      },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Rede (Instagram, YouTube…)" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "socials",
        kind: "list",
        label: "Redes sociais",
      },
      {
        itemFields: [{ key: "text", kind: "text", label: "Frase" }],
        key: "taglines",
        kind: "list",
        label: "Frases ao lado das redes",
      },
    ],
    group: "content",
    label: "Hero (título, prova social e painel)",
    render: (p, ctx) => (
      <section className="sb-container sb-ct-hero">
        <h1>
          {p.title}
          {p.highlight ? (
            <>
              {" "}
              <em>{p.highlight}</em>
            </>
          ) : null}
        </h1>
        <div className="sb-ct-intro">
          <div className="sb-ct-proof">
            {p.avatars.length ? (
              <div className="sb-ct-avatars">
                {p.avatars.map(a => (
                  <Img alt={a.alt} key={a.src + a.alt} src={a.src} />
                ))}
              </div>
            ) : null}
            {p.proofValue || p.proofLabel ? (
              <div>
                <strong>{p.proofValue}</strong>
                <span>{p.proofLabel}</span>
              </div>
            ) : null}
          </div>
          {p.text ? (
            <p>
              <Inline text={p.text} />
            </p>
          ) : null}
        </div>
        <div className="sb-ct-panel" style={bg(p.panelImage)}>
          <ul className="sb-ct-chips">
            {p.chips.map(c => (
              <li key={c.label + c.url}>
                <a href={href(ctx, c.url)}>{c.label}</a>
              </li>
            ))}
          </ul>
          <div className="sb-ct-panel-foot">
            <LinkButton
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
              variant="light"
            />
            {p.videoUrl ? (
              <a
                aria-label="Assistir ao vídeo"
                className="sb-ct-play"
                data-sb-video={popupVideoEmbed(p.videoUrl) ?? undefined}
                href={safeUrl(p.videoUrl)}
                rel="noopener"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m10 8 6 4-6 4z" fill="currentColor" />
                </svg>
                <span className="sb-ct-sr">Assistir ao vídeo</span>
              </a>
            ) : null}
          </div>
        </div>
        <div className="sb-ct-hero-foot">
          <div className="sb-socials">
            {p.socials.map(s => (
              <a
                aria-label={s.label}
                href={safeUrl(s.url)}
                key={s.label + s.url}
                title={s.label}
              >
                <SocialIcon label={s.label} />
              </a>
            ))}
          </div>
          <ul>
            {p.taglines.map(t => (
              <li key={t.text}>{t.text}</li>
            ))}
          </ul>
        </div>
      </section>
    ),
    type: "ctHero",
  }
);

/* ───────────────────── carrossel de logos ───────────────────── */

/**
 * `@keyframes` do modo "um por vez" para `n` logos: em cada logo fica parado 1/3 do tempo e desliza
 * nos 2/3 restantes (no original: 0,5 s parado + 1 s deslizando). A trilha tem a lista duas vezes,
 * então andar `i/(2n)` da própria largura passa exatamente `i` logos, seja quantos forem visíveis.
 */
export function logoStepKeyframes(n: number): string {
  const pct = (x: number) => `${+(x * 100).toFixed(3)}%`;
  const at = (i: number) => `translateX(-${pct(i / (2 * n))})`;
  let kf = "";
  for (let i = 0; i < n; i++)
    kf += `${pct(i / n)},${pct((i + 1 / 3) / n)}{transform:${at(i)};animation-timing-function:ease}`;
  return `@keyframes sb-ct-step${n}{${kf}100%{transform:${at(n)}}}`;
}

const logoMarquee = defineBlock(
  z.object({
    logos: z
      .array(z.object({ alt: str(), src: str(), url: str() }))
      .default([]),
    motion: z.enum(["step", "continuous"]).default("step").catch("step"),
    secondsPerLogo: z.coerce.number().min(0.3).max(10).default(1.5).catch(1.5),
    showDesktop: int(1, 8, 5),
    showMobile: int(1, 8, 2),
    showTablet: int(1, 8, 4),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "src", kind: "image", label: "Logo" },
          { key: "alt", kind: "text", label: "Nome (texto alternativo)" },
          { key: "url", kind: "url", label: "Link (opcional)" },
        ],
        key: "logos",
        kind: "list",
        label: "Logos",
      },
      {
        key: "showDesktop",
        kind: "number",
        label: "Logos visíveis no computador",
      },
      { key: "showTablet", kind: "number", label: "Logos visíveis no tablet" },
      { key: "showMobile", kind: "number", label: "Logos visíveis no celular" },
      {
        key: "motion",
        kind: "select",
        label: "Movimento",
        options: [
          { label: "Um logo por vez (para e desliza)", value: "step" },
          { label: "Contínuo", value: "continuous" },
        ],
      },
      {
        key: "secondsPerLogo",
        kind: "number",
        label: "Segundos por logo (menor = mais rápido)",
      },
    ],
    group: "media",
    label: "Carrossel de logos",
    render: (p, ctx) => {
      if (!p.logos.length) return null;
      const edit = ctx.mode === "edit";
      const Logo = ({
        l,
        dup,
      }: {
        dup?: boolean;
        l: (typeof p.logos)[number];
      }) => {
        const img = <Img alt={dup ? "" : l.alt} src={l.src} />;
        return (
          <div
            aria-hidden={dup || undefined}
            className={dup ? "sb-ct-logo dup" : "sb-ct-logo"}
          >
            {l.url && !dup ? <a href={safeUrl(l.url)}>{img}</a> : img}
          </div>
        );
      };
      const n = p.logos.length;
      const step = p.motion === "step";
      return (
        <section
          className={edit ? "sb-ct-marquee is-static" : "sb-ct-marquee"}
          style={
            {
              "--ct-anim": step ? `sb-ct-step${n}` : "sb-ct-marquee",
              "--ct-dur": `${(p.logos.length * p.secondsPerLogo).toFixed(1)}s`,
              "--ct-show-d": p.showDesktop,
              "--ct-show-m": p.showMobile,
              "--ct-show-t": p.showTablet,
            } as CSSProperties
          }
        >
          <div className="sb-ct-marquee-track">
            {p.logos.map(l => (
              <Logo key={l.src + l.alt} l={l} />
            ))}
            {p.logos.map(l => (
              <Logo dup key={`d${l.src}${l.alt}`} l={l} />
            ))}
          </div>
          {step && !edit ? <style>{logoStepKeyframes(n)}</style> : null}
        </section>
      );
    },
    type: "logoMarquee",
  }
);

/* ───────────────────── texto + imagem + selo ───────────────────── */

const ctSplit = defineBlock(
  z.object({
    badgeIcon: str(),
    badgeImage: str(),
    badgeLabel: str(),
    badgeNote: str(),
    badgeStars: int(0, 5, 0),
    badgeValue: str(),
    buttonLabel: str(),
    buttonUrl: str("#"),
    eyebrow: str(),
    image: str(),
    imageAlt: str(),
    items: z.array(z.object({ icon: str("check"), text: str() })).default([]),
    quote: str(),
    quotes: z
      .array(
        z.object({
          avatar: str(),
          name: str(),
          role: str(),
          text: str(),
        })
      )
      .default([]),
    text: str(),
    title: str("Título da seção"),
    variant: z.enum(["feature", "spotlight", "story"]).default("feature"),
  }),
  {
    fields: [
      {
        key: "variant",
        kind: "select",
        label: "Disposição",
        options: [
          { label: "Texto à esquerda, imagem à direita", value: "feature" },
          {
            label: "Imagem à esquerda, texto e lista à direita",
            value: "spotlight",
          },
          {
            label: "Texto e imagem à esquerda, depoimentos à direita",
            value: "story",
          },
        ],
      },
      { key: "eyebrow", kind: "text", label: "Rótulo acima do título" },
      { key: "title", kind: "text", label: "Título" },
      { key: "quote", kind: "text", label: "Citação (itálico, opcional)" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (linha em branco separa parágrafos)",
      },
      {
        itemFields: [
          ICON_FIELD(),
          { key: "text", kind: "text", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Lista com ícones",
      },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
      { key: "image", kind: "image", label: "Imagem" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da imagem" },
      ICON_FIELD("badgeIcon", "Selo sobre a imagem — ícone"),
      { key: "badgeValue", kind: "text", label: "Selo — número" },
      { key: "badgeStars", kind: "number", label: "Selo — estrelas (0 a 5)" },
      { key: "badgeLabel", kind: "text", label: "Selo — legenda" },
      { key: "badgeNote", kind: "text", label: "Selo — texto menor" },
      { key: "badgeImage", kind: "image", label: "Selo — imagem de fundo" },
      {
        itemFields: [
          { key: "avatar", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
          { key: "text", kind: "textarea", label: "Depoimento" },
        ],
        key: "quotes",
        kind: "list",
        label: "Depoimentos (disposição com depoimentos)",
      },
    ],
    group: "content",
    label: "Texto + imagem com selo",
    render: (p, ctx) => {
      const hasBadge =
        p.badgeIcon || p.badgeValue || p.badgeLabel || p.badgeStars > 0;
      return (
        <section className={`sb-container sb-ct-split v-${p.variant}`}>
          <div className="sb-ct-split-text">
            <Eyebrow text={p.eyebrow} />
            <h2>{p.title}</h2>
            {p.quote ? <p className="sb-ct-quote">{p.quote}</p> : null}
            {paragraphs(p.text).map(t => (
              <p key={t}>
                <Inline text={t} />
              </p>
            ))}
            {p.items.length ? (
              <ul className="sb-ct-checks">
                {p.items.map(i => (
                  <li key={i.text}>
                    <span className="ic">
                      <Icon name={i.icon} />
                    </span>
                    <b>{i.text}</b>
                  </li>
                ))}
              </ul>
            ) : null}
            <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
          <div className="sb-ct-split-media">
            <Img alt={p.imageAlt} src={p.image} />
            {hasBadge ? (
              <div className="sb-ct-badge" style={bg(p.badgeImage)}>
                {p.badgeIcon ? (
                  <span className="ic">
                    <Icon name={p.badgeIcon} />
                  </span>
                ) : null}
                {p.badgeValue ? <strong>{p.badgeValue}</strong> : null}
                {p.badgeStars > 0 ? (
                  <span aria-hidden="true" className="stars">
                    {Array.from({ length: p.badgeStars }, (_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa de estrelas
                      <StarFilled key={i} />
                    ))}
                  </span>
                ) : null}
                {p.badgeLabel ? <b>{p.badgeLabel}</b> : null}
                {p.badgeNote ? <span>{p.badgeNote}</span> : null}
              </div>
            ) : null}
          </div>
          {p.quotes.length ? (
            <div className="sb-ct-quotes">
              {p.quotes.map(q => (
                <figure className="sb-ct-quote-card" key={q.name + q.text}>
                  <header>
                    {q.avatar ? <Img alt={q.name} src={q.avatar} /> : null}
                    <div>
                      <strong>{q.name}</strong>
                      <small>{q.role}</small>
                    </div>
                  </header>
                  <p>{q.text}</p>
                </figure>
              ))}
            </div>
          ) : null}
        </section>
      );
    },
    type: "ctSplit",
  }
);

/* ───────────────────── grade de cartões ───────────────────── */

const featureGrid = defineBlock(
  z.object({
    columns: int(1, 4, 3),
    items: z
      .array(
        z.object({
          icon: str(),
          image: str(),
          kicker: str(),
          linkLabel: str(),
          tag: str(),
          text: str(),
          title: str(),
          url: str(),
        })
      )
      .default([]),
    style: z.enum(["simple", "icon", "numbered", "product"]).default("icon"),
  }),
  {
    fields: [
      {
        key: "style",
        kind: "select",
        label: "Aparência",
        options: [
          { label: "Só título, em caixas", value: "simple" },
          { label: "Ícone, título, texto e link", value: "icon" },
          { label: "Numerado (01, 02, 03…) com ícone", value: "numbered" },
          {
            label: "Produto (foto de fundo, etiqueta e botão)",
            value: "product",
          },
        ],
      },
      {
        key: "columns",
        kind: "number",
        label: "Colunas no computador (1 a 4)",
      },
      {
        itemFields: [
          ICON_FIELD(),
          { key: "image", kind: "image", label: "Imagem de fundo (opcional)" },
          { key: "tag", kind: "text", label: "Etiqueta (produto)" },
          {
            key: "kicker",
            kind: "text",
            label: "Chamada acima do título (produto)",
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "linkLabel", kind: "text", label: "Texto do link/botão" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "Grade de cartões",
    render: (p, ctx) => (
      <section className={`sb-container sb-ct-fg v-${p.style}`}>
        <div
          className="sb-ct-fg-grid"
          style={{ "--ct-cols": p.columns } as CSSProperties}
        >
          {p.items.map((it, i) => {
            const link = it.url ? href(ctx, it.url) : "";
            if (p.style === "simple")
              return (
                <div className="item" key={it.title + i}>
                  <h3>{it.title}</h3>
                </div>
              );
            if (p.style === "numbered")
              return (
                <div className="col" key={it.title + i}>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="item">
                    {it.icon ? (
                      <span className="ic">
                        <Icon name={it.icon} />
                      </span>
                    ) : null}
                    <h3>{it.title}</h3>
                    {it.text ? <p>{it.text}</p> : null}
                  </div>
                </div>
              );
            if (p.style === "product")
              return (
                <div className="item" key={it.title + i}>
                  <Img alt="" src={it.image} />
                  {it.tag ? <span className="tag">{it.tag}</span> : <span />}
                  <div className="inner">
                    {it.kicker ? (
                      <span className="kicker">{it.kicker}</span>
                    ) : null}
                    <h3>{it.title}</h3>
                    {it.text ? <p>{it.text}</p> : null}
                    {it.linkLabel ? (
                      <LinkButton
                        ctx={ctx}
                        label={it.linkLabel}
                        url={it.url || "#"}
                      />
                    ) : null}
                  </div>
                </div>
              );
            const inner = (
              <>
                {it.icon ? (
                  <span className="ic">
                    <Icon name={it.icon} />
                  </span>
                ) : null}
                <h3>{it.title}</h3>
                {it.text ? <p>{it.text}</p> : null}
                {it.linkLabel ? (
                  <span className="more">{it.linkLabel}</span>
                ) : null}
              </>
            );
            return link ? (
              <a
                className="item"
                href={link}
                key={it.title + i}
                style={bg(it.image)}
              >
                {inner}
              </a>
            ) : (
              <div className="item" key={it.title + i} style={bg(it.image)}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    ),
    type: "featureGrid",
  }
);

/* ───────────────────── banners ───────────────────── */

const ctBanner = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str("#"),
    code: str("404"),
    image: str(),
    mode: z.enum(["title", "cta", "error"]).default("title"),
    text: str(),
    title: str("Título da página"),
  }),
  {
    fields: [
      {
        key: "mode",
        kind: "select",
        label: "Tipo",
        options: [
          { label: "Título da página (h1)", value: "title" },
          { label: "Chamada com texto e botão", value: "cta" },
          { label: "Erro (404)", value: "error" },
        ],
      },
      { key: "image", kind: "image", label: "Imagem de fundo" },
      { key: "code", kind: "text", label: "Número grande (tipo Erro)" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
    ],
    group: "content",
    label: "Banner (título ou chamada)",
    render: (p, ctx) => (
      <section
        className={`sb-container sb-ct-banner m-${p.mode}`}
        style={bg(p.image)}
      >
        <div className="sb-ct-banner-card">
          {p.mode === "title" ? (
            <h1>{p.title}</h1>
          ) : (
            <>
              {p.mode === "error" && p.code ? (
                <p className="code">{p.code}</p>
              ) : null}
              {p.mode === "error" ? <h1>{p.title}</h1> : <h2>{p.title}</h2>}
              {paragraphs(p.text).map(t => (
                <p key={t}>
                  <Inline text={t} />
                </p>
              ))}
              <LinkButton
                ctx={ctx}
                label={p.buttonLabel}
                url={p.buttonUrl}
                variant={p.mode === "cta" ? "light" : "primary"}
              />
            </>
          )}
        </div>
      </section>
    ),
    type: "ctBanner",
  }
);

/* ───────────────────── rodapé ───────────────────── */

/** "Texto | endereço" por linha → links. Linha sem "|" usa o próprio texto (e-mail vira mailto:). */
function parseLinks(raw: string): { label: string; url: string }[] {
  return raw
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const [label = "", ...rest] = line.split("|");
      const url = rest.join("|").trim();
      const text = label.trim();
      return {
        label: text,
        url:
          url ||
          (text.includes("@") && !text.includes(" ") ? `mailto:${text}` : ""),
      };
    });
}

const ctFooter = defineBlock(
  z.object({
    columns: z.array(z.object({ links: str(), title: str() })).default([]),
    copyright: str("© Todos os direitos reservados."),
    logo: str(),
    logoText: str("Meu Site"),
    socials: z.array(z.object({ label: str(), url: str("#") })).default([]),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoText", kind: "text", label: "Nome ao lado do logo" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Rede (Instagram, YouTube…)" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "socials",
        kind: "list",
        label: "Redes sociais",
      },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título da coluna" },
          {
            key: "links",
            kind: "textarea",
            label: "Links (um por linha: Texto | endereço)",
          },
        ],
        key: "columns",
        kind: "list",
        label: "Colunas",
      },
      { key: "copyright", kind: "text", label: "Copyright" },
    ],
    group: "layout",
    label: "Rodapé (colunas livres)",
    render: (p, ctx) => (
      <footer className="sb-footer sb-ct-footer">
        <div className="sb-container sb-ct-foot">
          <div className="sb-ct-foot-brand">
            <a className="sb-logo" href={href(ctx, "/")}>
              {p.logo ? (
                <Img alt={p.logoText || ctx.site.name} src={p.logo} />
              ) : null}
              {p.logoText ? <strong>{p.logoText}</strong> : null}
            </a>
            <div className="sb-socials">
              {p.socials.map(s => (
                <a
                  aria-label={s.label}
                  href={safeUrl(s.url)}
                  key={s.label + s.url}
                  title={s.label}
                >
                  <SocialIcon label={s.label} />
                </a>
              ))}
            </div>
          </div>
          {p.columns.map(c => (
            <div key={c.title}>
              {c.title ? <h4>{c.title}</h4> : null}
              {parseLinks(c.links).map(l =>
                l.url ? (
                  <a href={href(ctx, l.url)} key={l.label + l.url}>
                    {l.label}
                  </a>
                ) : (
                  <span key={l.label}>{l.label}</span>
                )
              )}
            </div>
          ))}
        </div>
        <div className="sb-container sb-ct-foot-bottom">
          <span>{p.copyright}</span>
        </div>
      </footer>
    ),
    type: "ctFooter",
  }
);

export const centralBlocks: BlockDefinition[] = [
  ctHero,
  logoMarquee,
  ctSplit,
  featureGrid,
  ctBanner,
  ctFooter,
];
