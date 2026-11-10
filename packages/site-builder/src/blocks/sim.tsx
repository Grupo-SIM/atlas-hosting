import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, Inline, newTab } from "./helpers.js";
import {
  bg,
  int,
  lines,
  parseLinks,
  SI_ICON_OPTIONS,
  SiButton,
  SiCar,
  SiIcon,
  SiSocial,
  str,
  VideoButton,
  yesNo,
} from "./sim-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";

/**
 * Blocos do tema SIM Intermediações (prefixo `si`): site institucional escuro com roxo, migrado de
 * simintermediacoes.com (Elementor). Todo texto, imagem, link e item é prop editável; o visual vem de
 * `renderer/sim.ts` (escopo `.sb-si`). Os caminhos de `Block.fx` do template dependem da ordem dos filhos
 * de cada bloco, descrita no comentário de cada um.
 */

const icon = () => z.string().default("star").catch("star");
const iconField = (key = "icon", label = "Ícone"): FieldDef => ({
  key,
  kind: "select",
  label,
  options: SI_ICON_OPTIONS,
});

const textureFields: FieldDef[] = [
  { key: "texture", kind: "image", label: "Textura de fundo" },
  { key: "textureOpacity", kind: "number", label: "Opacidade da textura (%)" },
];
const textureSchema = (opacity: number) => ({
  texture: str(),
  textureOpacity: int(0, 100, opacity),
});
const texStyle = (p: { texture: string; textureOpacity: number }) =>
  ({
    "--si-tex": cssUrl(p.texture),
    "--si-tex-o": p.textureOpacity / 100,
  }) as CSSProperties;

const SCREEN_OPTIONS = [
  { label: "Todas as telas", value: "all" },
  { label: "Só no tablet", value: "tablet" },
  { label: "Computador e celular", value: "notTablet" },
];
const screens = () =>
  z.enum(["all", "tablet", "notTablet"]).default("all").catch("all");

/** No editor todos os itens aparecem; no site, os "só tablet"/"sem tablet" somem conforme a tela. */
const onAttr = (ctx: RenderContext, on: string) =>
  ctx.mode === "edit" || on === "all" ? undefined : on;

/* ───────────────────────── cabeçalho ───────────────────────── */

const linkItem = z.object({ label: str(), url: str("#") });
const linkFields = (label: string): FieldDef => ({
  itemFields: [
    { key: "label", kind: "text", label: "Texto" },
    { key: "url", kind: "url", label: "Link" },
  ],
  key: "items",
  kind: "list",
  label,
});

const isCurrent = (ctx: RenderContext, url: string) => {
  const here = (ctx.path ?? "").replace(/\/+$/, "") || "/";
  const there = url.replace(/\/+$/, "") || "/";
  return there.startsWith("/") && !there.includes("#") && here === there;
};

const siHeader = defineBlock(
  z.object({
    items: z.array(linkItem).default([]).catch([]),
    logo: str(),
    logoBottom: int(-200, 200, -50),
    logoHeight: int(20, 400, 180),
    logoTop: int(-200, 200, -30),
    logoUrl: str("/"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
      { key: "logoHeight", kind: "number", label: "Altura da logo (px)" },
      {
        key: "logoTop",
        kind: "number",
        label: "Compensação da logo — em cima (px)",
      },
      {
        key: "logoBottom",
        kind: "number",
        label: "Compensação da logo — embaixo (px)",
      },
      linkFields("Itens do menu"),
    ],
    group: "layout",
    label: "Cabeçalho SIM (menu lateral no celular)",
    render: (p, ctx) => {
      const menu = (cls: string) => (
        <ul className={cls}>
          {p.items.map((it, i) => (
            <li key={`${it.label}-${i}`}>
              <a
                aria-current={isCurrent(ctx, it.url) ? "page" : undefined}
                href={href(ctx, it.url)}
                {...newTab(it.url)}
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      );
      return (
        <header
          className="si-head"
          style={
            {
              "--si-logo-b": `${p.logoBottom}px`,
              "--si-logo-h": `${p.logoHeight}px`,
              "--si-logo-t": `${p.logoTop}px`,
            } as CSSProperties
          }
        >
          <input
            aria-hidden="true"
            className="si-burger-input"
            id="sb-burger"
            tabIndex={-1}
            type="checkbox"
          />
          <div className="si-head-in">
            <a className="si-logo" href={href(ctx, p.logoUrl)}>
              <Img alt="SIM Intermediações" src={p.logo} />
            </a>
            <nav aria-label="Menu principal" className="si-nav">
              {menu("si-menu")}
            </nav>
            <label
              aria-label="Abrir menu"
              className="si-burger"
              htmlFor="sb-burger"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
          <label className="si-veil" htmlFor="sb-burger">
            <span className="si-sr">Fechar menu</span>
          </label>
          <aside aria-label="Menu" className="si-drawer">
            <label
              aria-label="Fechar menu"
              className="si-drawer-x"
              htmlFor="sb-burger"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </label>
            <a className="si-drawer-logo" href={href(ctx, p.logoUrl)}>
              <Img alt="SIM Intermediações" src={p.logo} />
            </a>
            {menu("si-drawer-menu")}
          </aside>
        </header>
      );
    },
    type: "siHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

/** Filhos de `.si-hero-in` (caminho `1.1.N`): 1 selo, 2 título, 3 linha do botão + vídeo (só os que existem). */
const siHero = defineBlock(
  z.object({
    badge: str(),
    badgeIcon: icon(),
    buttonLabel: str(),
    buttonUrl: str("#"),
    layout: z.enum(["home", "page"]).default("home").catch("home"),
    title: str("Título"),
    videoUrl: str(),
    ...textureSchema(5),
    texturePosition: int(-600, 600, -223),
  }),
  {
    fields: [
      { key: "badge", kind: "text", label: "Selo (texto)" },
      iconField("badgeIcon", "Selo (ícone)"),
      { key: "title", kind: "textarea", label: "Título" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
      {
        key: "videoUrl",
        kind: "text",
        label: "Vídeo do botão de play (YouTube ou Vimeo)",
      },
      {
        key: "layout",
        kind: "select",
        label: "Altura",
        options: [
          { label: "Home (alto, sem borda)", value: "home" },
          { label: "Página interna (680 px, com borda)", value: "page" },
        ],
      },
      ...textureFields,
      {
        key: "texturePosition",
        kind: "number",
        label: "Posição vertical da textura (px)",
      },
    ],
    group: "content",
    label: "Hero SIM (selo, título, botão e vídeo)",
    render: (p, ctx) => (
      <section
        className={`si-hero ${p.layout}`}
        style={
          {
            ...texStyle(p),
            "--si-tex-y": `${p.texturePosition}px`,
          } as CSSProperties
        }
      >
        <div className="si-hero-in">
          {p.badge ? (
            <div className="si-badge">
              <i>
                <SiIcon name={p.badgeIcon} />
              </i>
              <span>{p.badge}</span>
            </div>
          ) : null}
          <h1>{p.title}</h1>
          {p.buttonLabel || p.videoUrl ? (
            <div className="si-hero-row">
              <SiButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
              <VideoButton url={p.videoUrl} />
            </div>
          ) : null}
        </div>
      </section>
    ),
    type: "siHero",
  }
);

/* ───────────────────────── benefícios em arco ───────────────────────── */

const orbitItem = z.object({
  icon: icon(),
  offset: int(-200, 200, 0),
  title: str(),
});
const orbitFields = (key: string, label: string): FieldDef => ({
  itemFields: [
    { key: "title", kind: "text", label: "Título" },
    iconField(),
    { key: "offset", kind: "number", label: "Deslocamento lateral (px)" },
  ],
  key,
  kind: "list",
  label,
});

/** `.si-orbit-in` (1.1): 1 coluna esquerda, 2 imagem, 3 coluna direita; cada benefício é filho da coluna (1.1.1.N). */
const siOrbit = defineBlock(
  z.object({
    image: str(),
    left: z.array(orbitItem).default([]).catch([]),
    right: z.array(orbitItem).default([]).catch([]),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem do centro" },
      orbitFields("left", "Benefícios à esquerda"),
      orbitFields("right", "Benefícios à direita"),
    ],
    group: "content",
    label: "Benefícios em arco (SIM)",
    render: p => {
      const col = (side: "left" | "right", items: typeof p.left) => (
        <div className={`si-orbit-col ${side}`}>
          {items.map((it, i) => (
            <div
              className="si-orbit-item"
              key={`${it.title}-${i}`}
              style={{ "--si-off": `${it.offset}px` } as CSSProperties}
            >
              <i>
                <SiIcon name={it.icon} />
              </i>
              <h4>{it.title}</h4>
            </div>
          ))}
        </div>
      );
      return (
        <section className="si-orbit">
          <div className="si-orbit-in">
            {col("left", p.left)}
            <div className="si-orbit-mid">
              <Img alt="" src={p.image} />
            </div>
            {col("right", p.right)}
          </div>
        </section>
      );
    },
    type: "siOrbit",
  }
);

/* ───────────────────────── título em degradê ───────────────────────── */

const siGradientTitle = defineBlock(
  z.object({ title: str("Título em degradê"), url: str() }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "url", kind: "url", label: "Link (opcional)" },
    ],
    group: "content",
    label: "Título grande em degradê (SIM)",
    render: (p, ctx) => {
      const h = (
        <h2>
          <span>{p.title}</span>
        </h2>
      );
      return (
        <section className="si-gt">
          {p.url ? (
            <a href={href(ctx, p.url)} {...newTab(p.url)}>
              {h}
            </a>
          ) : (
            h
          )}
        </section>
      );
    },
    type: "siGradientTitle",
  }
);

/* ───────────────────────── "Somos especialistas" ───────────────────────── */

const feat = z.object({
  accent: yesNo(),
  icon: icon(),
  text: str(),
  title: str(),
});

/**
 * `.si-about-in` (1.1): 1 coluna do texto, 2 cartão da foto. Na coluna (1.1.1): 1 título, 2 texto, 3 link,
 * 4 divisória, 5 lista de itens (1.1.1.5.N).
 */
const siAbout = defineBlock(
  z.object({
    image: str(),
    imagePosition: int(-800, 800, -149),
    items: z.array(feat).default([]).catch([]),
    linkLabel: str(),
    linkUrl: str("#"),
    text: str(),
    title: str("Título da seção"),
    ...textureSchema(0),
  }),
  {
    fields: [
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "linkLabel", kind: "text", label: "Link — texto" },
      { key: "linkUrl", kind: "url", label: "Link — endereço" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "text", label: "Texto" },
          iconField(),
          {
            key: "accent",
            kind: "select",
            label: "Ícone",
            options: [
              { label: "Neutro (roxo ao passar o mouse)", value: "no" },
              { label: "Roxo (neutro ao passar o mouse)", value: "yes" },
            ],
          },
        ],
        key: "items",
        kind: "list",
        label: "Itens com ícone",
      },
      { key: "image", kind: "image", label: "Foto do cartão" },
      {
        key: "imagePosition",
        kind: "number",
        label: "Posição horizontal da foto (px, só computador)",
      },
    ],
    group: "content",
    label: "Sobre com cartão de foto (SIM)",
    render: (p, ctx) => (
      <section className="si-about">
        <div className="si-about-in">
          <div className="si-about-text">
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            {p.linkLabel ? (
              <a
                className="si-link"
                href={href(ctx, p.linkUrl)}
                {...newTab(p.linkUrl)}
              >
                <span>{p.linkLabel}</span>
                <i>
                  <SiIcon name="arrow-right" />
                </i>
              </a>
            ) : (
              <span hidden />
            )}
            <hr className="si-divider" />
            <div className="si-feats">
              {p.items.map((it, i) => (
                <div className="si-feat" key={`${it.title}-${i}`}>
                  <i className={`si-sq ${it.accent === "yes" ? "on" : ""}`}>
                    <SiIcon name={it.icon} />
                  </i>
                  <div>
                    <h4>{it.title}</h4>
                    <p>{it.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="si-about-photo"
            style={
              {
                ...bg(p.image),
                "--si-photo-x": `${p.imagePosition}px`,
              } as CSSProperties
            }
          />
        </div>
        <svg
          aria-hidden="true"
          className="si-curve"
          preserveAspectRatio="none"
          viewBox="0 0 1000 100"
        >
          <path d="M500,97C211.6,97,0,18,0,0h1000C1000,18,788.4,97,500,97z" />
        </svg>
      </section>
    ),
    type: "siAbout",
  }
);

/* ───────────────────────── esteira de logos ───────────────────────── */

const siLogos = defineBlock(
  z.object({
    delay: int(0, 30000, 500),
    gap: int(0, 100, 0),
    logos: z
      .array(z.object({ alt: str(), image: str() }))
      .default([])
      .catch([]),
    perView: int(1, 8, 5),
    perViewMobile: int(1, 8, 2),
    perViewTablet: int(1, 8, 4),
    speed: int(100, 5000, 1000),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Logo" },
          { key: "alt", kind: "text", label: "Nome (acessibilidade)" },
        ],
        key: "logos",
        kind: "list",
        label: "Logos",
      },
      { key: "perView", kind: "number", label: "Logos por tela (computador)" },
      {
        key: "perViewTablet",
        kind: "number",
        label: "Logos por tela (tablet)",
      },
      {
        key: "perViewMobile",
        kind: "number",
        label: "Logos por tela (celular)",
      },
      { key: "gap", kind: "number", label: "Espaço entre logos (px)" },
      { key: "delay", kind: "number", label: "Tempo parado entre passes (ms)" },
      { key: "speed", kind: "number", label: "Duração da transição (ms)" },
    ],
    group: "media",
    label: "Esteira de logos (SIM)",
    render: p => (
      <section className="si-logos">
        <div className="si-logos-box">
          <SiCar
            arrows="none"
            className="si-logos-car"
            items={p.logos.map((l, i) => (
              <Img alt={l.alt} key={`${l.image}-${i}`} src={l.image} />
            ))}
            p={p}
            pause={false}
          />
        </div>
      </section>
    ),
    type: "siLogos",
  }
);

/* ───────────────────────── serviços e produtos ───────────────────────── */

const card = z.object({
  accent: yesNo(),
  buttonLabel: str(),
  buttonUrl: str("#"),
  icon: icon(),
  screens: screens(),
  text: str(),
  textured: yesNo(),
  title: str(),
  videoUrl: str(),
});

/**
 * `.si-wrap` (1.1): 1 título, 2 grade de cartões (1.1.2.N). O botão "Ver portfólio" da home é o bloco `siCta`.
 * `screens` repete o original, que tem uma seção só do tablet e outra só de computador e celular.
 */
const siServices = defineBlock(
  z.object({
    cards: z.array(card).default([]).catch([]),
    columns: int(1, 3, 2),
    title: str(),
    ...textureSchema(12),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da seção" },
      {
        key: "columns",
        kind: "number",
        label: "Colunas (computador; 1 no celular)",
      },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          iconField(),
          {
            key: "accent",
            kind: "select",
            label: "Ícone",
            options: [
              { label: "Neutro (roxo ao passar o mouse)", value: "no" },
              { label: "Roxo (neutro ao passar o mouse)", value: "yes" },
            ],
          },
          {
            key: "textured",
            kind: "select",
            label: "Textura fixa",
            options: [
              { label: "Só ao passar o mouse", value: "no" },
              { label: "Sempre", value: "yes" },
            ],
          },
          { key: "buttonLabel", kind: "text", label: "Botão — texto" },
          { key: "buttonUrl", kind: "url", label: "Botão — link" },
          {
            key: "videoUrl",
            kind: "text",
            label: "Vídeo (botão de play, abre em popup)",
          },
          {
            key: "screens",
            kind: "select",
            label: "Aparece em",
            options: SCREEN_OPTIONS,
          },
        ],
        key: "cards",
        kind: "list",
        label: "Cartões",
      },
      ...textureFields,
    ],
    group: "content",
    label: "Cartões de serviço/produto (SIM)",
    render: (p, ctx) => (
      <section className="si-services" style={texStyle(p)}>
        <div className="si-wrap">
          {p.title ? <h2>{p.title}</h2> : <span hidden />}
          <div
            className="si-cards"
            style={{ "--si-cols": p.columns } as CSSProperties}
          >
            {p.cards.map((c, i) => (
              <article
                className={`si-card ${c.textured === "yes" ? "tex" : ""}`}
                data-on={onAttr(ctx, c.screens)}
                key={`${c.title}-${i}`}
              >
                <div className="si-card-head">
                  <h4>{c.title}</h4>
                  <i className={`si-sq ${c.accent === "yes" ? "on" : ""}`}>
                    <SiIcon name={c.icon} />
                  </i>
                </div>
                <hr className="si-divider" />
                <p>{c.text}</p>
                {c.buttonLabel || c.videoUrl ? (
                  <div className="si-card-actions">
                    <SiButton
                      ctx={ctx}
                      label={c.buttonLabel}
                      url={c.buttonUrl}
                    />
                    <VideoButton pulse={false} url={c.videoUrl} />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "siServices",
  }
);

/* ───────────────────────── botão avulso ───────────────────────── */

const siCta = defineBlock(
  z.object({
    align: z
      .enum(["center", "left", "right"])
      .default("center")
      .catch("center"),
    label: str("Entrar em contato"),
    marginBottom: int(0, 400, 0),
    marginTop: int(-300, 300, 0),
    minHeight: int(0, 400, 120),
    url: str("#"),
    variant: z.enum(["solid", "outline"]).default("solid").catch("solid"),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Texto" },
      { key: "url", kind: "url", label: "Link" },
      {
        key: "variant",
        kind: "select",
        label: "Estilo",
        options: [
          { label: "Roxo cheio", value: "solid" },
          { label: "Contorno branco", value: "outline" },
        ],
      },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento",
        options: [
          { label: "Centro", value: "center" },
          { label: "Esquerda", value: "left" },
          { label: "Direita", value: "right" },
        ],
      },
      {
        key: "minHeight",
        kind: "number",
        label: "Altura mínima da faixa (px)",
      },
      {
        key: "marginTop",
        kind: "number",
        label: "Margem em cima (px; negativa sobe para a seção acima)",
      },
      { key: "marginBottom", kind: "number", label: "Margem embaixo (px)" },
    ],
    group: "content",
    label: "Botão em faixa (SIM)",
    render: (p, ctx) => (
      <div
        className={`si-cta ${p.align}`}
        style={
          {
            "--si-cta-b": `${p.marginBottom}px`,
            "--si-cta-h": `${p.minHeight}px`,
            "--si-cta-t": `${p.marginTop}px`,
          } as CSSProperties
        }
      >
        <SiButton
          className={p.variant === "outline" ? "outline" : ""}
          ctx={ctx}
          label={p.label}
          url={p.url}
        />
      </div>
    ),
    type: "siCta",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const testi = z.object({
  avatar: str(),
  name: str(),
  role: str(),
  stars: yesNo("yes"),
  text: str(),
});

const Stars = () => (
  <div aria-label="5 estrelas" className="si-stars" role="img">
    {[0, 1, 2, 3, 4].map(n => (
      <SiIcon key={n} name="star" />
    ))}
  </div>
);

const Quote = () => (
  <svg aria-hidden="true" className="si-quote" viewBox="0 0 24 24">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

/** Texto do depoimento; linhas que começam com `->` viram uma lista com marcador. */
function TestiText({ text }: { text: string }) {
  const rows = text.split("\n").filter(l => l.trim());
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length)
      out.push(
        <ul className="si-arrows" key={`l${out.length}`}>
          {list.map((l, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
            <li key={i}>{l}</li>
          ))}
        </ul>
      );
    list = [];
  };
  for (const r of rows) {
    if (r.trim().startsWith("->")) list.push(r.trim().slice(2).trim());
    else {
      flush();
      out.push(
        <p key={`p${out.length}`}>
          <Inline text={r} />
        </p>
      );
    }
  }
  flush();
  return <blockquote>{out}</blockquote>;
}

function Testi({ t }: { t: z.infer<typeof testi> }) {
  return (
    <figure className="si-t">
      <Quote />
      <TestiText text={t.text} />
      <figcaption>
        {t.avatar ? <Img alt={t.name} src={t.avatar} /> : null}
        <div>
          <strong>{t.name}</strong>
          {t.role ? <span>{t.role}</span> : null}
        </div>
      </figcaption>
      {t.stars === "yes" ? <Stars /> : null}
    </figure>
  );
}

/**
 * `layout` `grid`: coluna fixa à esquerda (1.1.1: título, selo) + grade 2×2 com linhas (1.1.2.N).
 * `cards`: título e cartões de texto (1.1.2.N, como Visão/Valores/Missão). `slider`: imagem + título/texto (1.1.1)
 * e carrossel de depoimentos (1.1.2).
 */
const siTestimonials = defineBlock(
  z.object({
    image: str(),
    items: z.array(testi).default([]).catch([]),
    layout: z.enum(["grid", "cards", "slider"]).default("grid").catch("grid"),
    text: str(),
    title: str(),
    titleFont: z.enum(["anek", "poppins"]).default("anek").catch("anek"),
    ...textureSchema(23),
  }),
  {
    fields: [
      {
        key: "layout",
        kind: "select",
        label: "Disposição",
        options: [
          { label: "Coluna fixa + grade com linhas", value: "grid" },
          { label: "Cartões de texto", value: "cards" },
          { label: "Imagem + carrossel", value: "slider" },
        ],
      },
      { key: "title", kind: "textarea", label: "Título" },
      {
        key: "titleFont",
        kind: "select",
        label: "Fonte do título",
        options: [
          { label: "Anek Devanagari", value: "anek" },
          { label: "Poppins", value: "poppins" },
        ],
      },
      { key: "text", kind: "textarea", label: "Texto abaixo do título" },
      { key: "image", kind: "image", label: "Imagem (selo ou lateral)" },
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "name", kind: "text", label: "Nome / título" },
          { key: "role", kind: "text", label: "Cargo" },
          { key: "avatar", kind: "image", label: "Foto" },
          {
            key: "stars",
            kind: "select",
            label: "Estrelas",
            options: [
              { label: "Mostrar", value: "yes" },
              { label: "Esconder", value: "no" },
            ],
          },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos / cartões",
      },
      ...textureFields,
    ],
    group: "content",
    label: "Depoimentos (SIM)",
    render: p => {
      const heading = p.title ? (
        <h2 className={p.titleFont === "poppins" ? "poppins" : undefined}>
          {p.title}
        </h2>
      ) : (
        <span hidden />
      );
      if (p.layout === "cards")
        return (
          <section className="si-testi cards" style={texStyle(p)}>
            <div className="si-wrap">
              {heading}
              <div className="si-tcards">
                {p.items.map((t, i) => (
                  <Testi key={`${t.name}-${i}`} t={t} />
                ))}
              </div>
            </div>
          </section>
        );
      if (p.layout === "slider")
        return (
          <section className="si-testi slider" style={texStyle(p)}>
            <div className="si-wrap si-testi-in">
              <div className="si-testi-side">
                <Img alt="" src={p.image} />
                {heading}
                {p.text ? <p>{p.text}</p> : null}
              </div>
              <SiCar
                arrows="none"
                className="si-tcar"
                dots
                items={p.items.map((t, i) => (
                  <Testi key={`${t.name}-${i}`} t={t} />
                ))}
                p={{
                  delay: 5000,
                  gap: 0,
                  perView: 1,
                  perViewMobile: 1,
                  perViewTablet: 1,
                  speed: 600,
                }}
              />
            </div>
          </section>
        );
      return (
        <section className="si-testi grid" style={texStyle(p)}>
          <div className="si-wrap si-testi-in">
            <div className="si-testi-side">
              {heading}
              <Img alt="" src={p.image} />
            </div>
            <div className="si-tgrid">
              {p.items.map((t, i) => (
                <Testi key={`${t.name}-${i}`} t={t} />
              ))}
            </div>
          </div>
        </section>
      );
    },
    type: "siTestimonials",
  }
);

/* ───────────────────────── planos ───────────────────────── */

const plan = z.object({
  buttonLabel: str("Entrar em contato"),
  buttonUrl: str("#"),
  featured: yesNo(),
  features: str(),
  name: str(),
  screens: screens(),
});

/** `.si-wrap` (1.1): 1 título, 2 grade (1.1.2.N = um plano cada). */
const siPlans = defineBlock(
  z.object({
    plans: z.array(plan).default([]).catch([]),
    title: str("Adquirir Serviços"),
    ...textureSchema(10),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome do plano" },
          {
            key: "features",
            kind: "textarea",
            label: "Itens (um por linha)",
          },
          { key: "buttonLabel", kind: "text", label: "Botão — texto" },
          { key: "buttonUrl", kind: "url", label: "Botão — link" },
          {
            key: "featured",
            kind: "select",
            label: "Destaque",
            options: [
              { label: "Normal", value: "no" },
              { label: "Destacado (degradê + botão roxo)", value: "yes" },
            ],
          },
          {
            key: "screens",
            kind: "select",
            label: "Aparece em",
            options: SCREEN_OPTIONS,
          },
        ],
        key: "plans",
        kind: "list",
        label: "Planos",
      },
      ...textureFields,
    ],
    group: "content",
    label: "Planos com lista de itens (SIM)",
    render: (p, ctx) => (
      <section className="si-plans" style={texStyle(p)}>
        <div className="si-wrap">
          <h2>{p.title}</h2>
          <div className="si-plan-grid">
            {p.plans.map((pl, i) => (
              <article
                className={`si-plan ${pl.featured === "yes" ? "featured" : ""}`}
                data-on={onAttr(ctx, pl.screens)}
                key={`${pl.name}-${i}`}
              >
                <header>
                  <h4>{pl.name}</h4>
                </header>
                <div className="si-plan-body">
                  <SiButton
                    className={pl.featured === "yes" ? "" : "outline"}
                    ctx={ctx}
                    label={pl.buttonLabel}
                    url={pl.buttonUrl}
                  />
                  <ul className="si-checks">
                    {lines(pl.features).map((f, k) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
                      <li key={k}>
                        <i>
                          <SiIcon name="check" />
                        </i>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "siPlans",
  }
);

/* ───────────────────────── perguntas frequentes ───────────────────────── */

const siFaq = defineBlock(
  z.object({
    items: z
      .array(z.object({ answer: str(), question: str() }))
      .default([])
      .catch([]),
    title: str("Perguntas frequentes"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "question", kind: "text", label: "Pergunta" },
          {
            key: "answer",
            kind: "textarea",
            label: "Resposta (aceita [texto](link))",
          },
        ],
        key: "items",
        kind: "list",
        label: "Perguntas",
      },
    ],
    group: "content",
    label: "Perguntas frequentes (SIM)",
    render: (p, ctx) => {
      const group = `si-faq-${ctx.path?.length ?? 0}`;
      return (
        <section className="si-faq">
          <div className="si-wrap">
            <h2>{p.title}</h2>
            <div className="si-faq-list">
              {p.items.map((it, i) => (
                <details
                  key={`${it.question}-${i}`}
                  name={group}
                  open={i === 0}
                >
                  <summary>
                    <i aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path className="h" d="M5 12h14" />
                        <path className="v" d="M12 5v14" />
                      </svg>
                    </i>
                    <span>{it.question}</span>
                  </summary>
                  <div className="si-faq-a">
                    {it.answer.split("\n").map((l, k) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
                      <p key={k}>
                        <Inline text={l} />
                      </p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    },
    type: "siFaq",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const siFooter = defineBlock(
  z.object({
    cnpj: str(),
    contactTitle: str("Contato"),
    email: str(),
    legal: str(),
    legalTitle: str("Políticas e Termos"),
    logo: str(),
    logoUrl: str("/"),
    menu: str(),
    menuTitle: str("Menu"),
    phone: str(),
    phoneUrl: str(),
    rights: str(),
    socials: str(),
    ...textureSchema(11),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
      { key: "menuTitle", kind: "text", label: "Coluna 1 — título" },
      {
        key: "menu",
        kind: "textarea",
        label: "Coluna 1 — links (Texto | endereço, um por linha)",
      },
      { key: "contactTitle", kind: "text", label: "Coluna 2 — título" },
      { key: "phone", kind: "text", label: "Telefone (texto)" },
      { key: "phoneUrl", kind: "url", label: "Telefone (link)" },
      { key: "email", kind: "text", label: "E-mail" },
      {
        key: "socials",
        kind: "textarea",
        label: "Redes sociais (rede | endereço, uma por linha)",
      },
      { key: "legalTitle", kind: "text", label: "Coluna 3 — título" },
      {
        key: "legal",
        kind: "textarea",
        label: "Coluna 3 — links (Texto | endereço)",
      },
      { key: "cnpj", kind: "text", label: "CNPJ (linha de baixo, esquerda)" },
      {
        key: "rights",
        kind: "text",
        label: "Direitos (linha de baixo, direita)",
      },
      ...textureFields,
    ],
    group: "layout",
    label: "Rodapé SIM",
    render: (p, ctx) => {
      const linkList = (text: string) => (
        <ul className="si-flinks">
          {parseLinks(text).map((l, i) => (
            <li key={`${l.label}-${i}`}>
              <a href={href(ctx, l.url)} {...newTab(l.url)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      );
      return (
        <footer className="si-foot" style={texStyle(p)}>
          <div className="si-foot-in">
            <div className="si-foot-logo">
              <a href={href(ctx, p.logoUrl)}>
                <Img alt="SIM Intermediações" src={p.logo} />
              </a>
            </div>
            <div className="si-foot-cols">
              <div className="si-fcol">
                <h4>{p.menuTitle}</h4>
                {linkList(p.menu)}
              </div>
              <div className="si-fcol">
                <h4>{p.contactTitle}</h4>
                <ul className="si-fcontact">
                  {p.phone ? (
                    <li>
                      <i>
                        <SiIcon name="phone" />
                      </i>
                      <a href={href(ctx, p.phoneUrl || "#")}>{p.phone}</a>
                    </li>
                  ) : null}
                  {p.email ? (
                    <li>
                      <i>
                        <SiIcon name="mail" />
                      </i>
                      <a href={`mailto:${p.email}`}>{p.email}</a>
                    </li>
                  ) : null}
                </ul>
                <div className="si-socials">
                  {parseLinks(p.socials).map((s, i) => (
                    <a
                      aria-label={s.label}
                      href={href(ctx, s.url)}
                      key={`${s.label}-${i}`}
                      {...newTab(s.url)}
                    >
                      <SiSocial name={s.label} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="si-fcol">
                <h4>{p.legalTitle}</h4>
                {linkList(p.legal)}
              </div>
            </div>
          </div>
          <hr className="si-divider" />
          <div className="si-foot-end">
            <span>{p.cnpj}</span>
            <span>{p.rights}</span>
          </div>
        </footer>
      );
    },
    type: "siFooter",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const siNotFound = defineBlock(
  z.object({
    buttonLabel: str("Voltar para o início"),
    buttonUrl: str("/"),
    text: str(
      "Parece que o link que apontava para aqui estava quebrado. Que tal voltar ao início?"
    ),
    title: str("Esta página não existe."),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
    ],
    group: "content",
    label: "Página não encontrada (SIM)",
    render: (p, ctx) => (
      <section className="si-404">
        <h1>{p.title}</h1>
        <p>{p.text}</p>
        <SiButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
      </section>
    ),
    type: "siNotFound",
  }
);

export const simBlocks: BlockDefinition[] = [
  siHeader,
  siHero,
  siOrbit,
  siGradientTitle,
  siAbout,
  siLogos,
  siServices,
  siCta,
  siTestimonials,
  siPlans,
  siFaq,
  siFooter,
  siNotFound,
];
