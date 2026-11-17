import type { CSSProperties } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import {
  anchorHref,
  flag,
  hex,
  int,
  isCurrent,
  org,
  Pic,
  paragraphs,
  SV_ICON_OPTIONS,
  SvIcon,
  SvSocial,
  socialBg,
  str,
  telHref,
} from "./fundacao-lib.js";
import { formatDate, href, newTab, postPath, visiblePosts } from "./helpers.js";
import { SiCar } from "./sim-lib.js";
import type { BlockDefinition, FieldDef } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos da home e do cabeçalho/rodapé do template "Semente Viva — Fundação / ONG" (`sv*`): `svHeader` (barra verde
 * do topo + barra branca fixa ao rolar + busca + gaveta), `svHero` (fotos em fade), `svAreas` (cartões de atuação),
 * `svAbout` (fotos em círculo), `svDonateBand` ("Seja um colaborador"), `svSocialCarousel` (notícias ou redes em
 * coverflow), `svProjects` (vídeo e fotos redondas) e `svFooter`. Os dados da fundação (nome, CNPJ, endereço, contatos,
 * horário, PIX) ficam em `site.theme` (veja `org()` em `fundacao-lib.tsx`). Cada bloco comenta a ordem dos filhos de que
 * `Block.fx` depende.
 */

const linkItem = z.object({ label: str(), url: str() });
const linkList = z.array(linkItem).default([]).catch([]);
const LINK_FIELDS: FieldDef[] = [
  { key: "label", kind: "text", label: "Texto" },
  { key: "url", kind: "url", label: "Link" },
];
const SOCIAL_FIELDS: FieldDef[] = [
  {
    key: "label",
    kind: "text",
    label: "Rede (Instagram, Facebook, YouTube, WhatsApp, TikTok, X)",
  },
  { key: "url", kind: "url", label: "Link do perfil (vazio = não aparece)" },
];

const photoItem = z.object({ alt: str(), image: str() });
const PHOTO_FIELDS: FieldDef[] = [
  { key: "image", kind: "image", label: "Foto" },
  { key: "alt", kind: "text", label: "Descrição da foto" },
];

/** Redes com endereço preenchido (sem endereço o ícone não aparece: nada de link morto). */
const liveSocials = (items: { label: string; url: string }[]) =>
  items.filter(s => s.label.trim() && s.url.trim());

function Socials({
  ctx,
  items,
}: {
  ctx: Parameters<typeof href>[0];
  items: { label: string; url: string }[];
}) {
  const live = liveSocials(items);
  if (!live.length) return null;
  return (
    <div className="sv-socs">
      {live.map(s => (
        <a
          aria-label={s.label}
          className="sv-soc"
          href={href(ctx, s.url)}
          key={s.label + s.url}
          style={{ "--c": socialBg(s.label) } as CSSProperties}
          {...newTab(s.url)}
        >
          <SvSocial label={s.label} />
        </a>
      ))}
    </div>
  );
}

/** Partículas em CSS puro (12 pontos); a prop liga e desliga por seção. */
const Parts = ({ dark }: { dark?: boolean }) => (
  <div aria-hidden="true" className={dark ? "sv-parts on-dark" : "sv-parts"} />
);

/** Carrossel de uma foto por vez: o tempo parado é o intervalo menos a duração da transição. */
const carProps = (seconds: number, speed: number) => ({
  delay: Math.max(0, seconds * 1000 - speed),
  gap: 0,
  perView: 1,
  perViewMobile: 1,
  perViewTablet: 1,
  speed,
});

/* ───────────────────────── cabeçalho ───────────────────────── */

const svHeader = defineBlock(
  z.object({
    donateLabel: str("Doe agora"),
    donateUrl: str("/doacao/"),
    logo: str(),
    searchButton: str("Buscar"),
    searchLabel: str("Buscar nas notícias"),
    searchPlaceholder: str("Buscar nas notícias…"),
    searchUrl: str("/noticias/"),
    socials: linkList,
    topLinks: linkList,
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo (186 × 92 px)" },
      {
        itemFields: LINK_FIELDS,
        key: "topLinks",
        kind: "list",
        label: "Links da barra verde do topo",
      },
      {
        itemFields: SOCIAL_FIELDS,
        key: "socials",
        kind: "list",
        label: "Redes sociais (barra do topo)",
      },
      { key: "donateLabel", kind: "text", label: "Botão de doação — texto" },
      { key: "donateUrl", kind: "url", label: "Botão de doação — link" },
      { key: "searchLabel", kind: "text", label: "Busca — nome do botão" },
      {
        key: "searchPlaceholder",
        kind: "text",
        label: "Busca — texto de exemplo",
      },
      { key: "searchButton", kind: "text", label: "Busca — texto do botão" },
      { key: "searchUrl", kind: "url", label: "Busca — página de resultados" },
    ],
    group: "layout",
    label: "Cabeçalho (Semente Viva)",
    render: (p, ctx) => {
      const o = org(ctx);
      const items = ctx.site.menu.filter(m => !m.dynamic);
      const link = (m: { href: string; label: string }) => (
        <li key={m.href + m.label}>
          <a
            aria-current={isCurrent(ctx, m.href) ? "page" : undefined}
            href={anchorHref(ctx, m.href)}
          >
            {m.label}
          </a>
        </li>
      );
      const logo = p.logo ? <Pic alt="" eager src={p.logo} /> : null;
      return (
        <div className="sv-head" data-sv-head="1">
          {/* biome-ignore lint/correctness/useUniqueElementIds: o botão e o fundo da gaveta usam label for=id; há um menu por página */}
          <input
            aria-label="Abrir menu"
            className="sv-burger-input"
            id="sb-burger"
            type="checkbox"
          />
          {/* biome-ignore lint/correctness/useUniqueElementIds: a lupa e o campo usam label for=id; há uma busca por página */}
          <input
            aria-label={p.searchLabel}
            className="sv-search-input"
            id="sv-search"
            type="checkbox"
          />
          <div className="sv-top">
            <div className="sv-top-l">
              {p.topLinks
                .filter(l => l.label.trim() && l.url.trim())
                .map(l => (
                  <a href={anchorHref(ctx, l.url)} key={l.label + l.url}>
                    {l.label}
                  </a>
                ))}
              <Socials ctx={ctx} items={p.socials} />
            </div>
            <div className="sv-top-r">
              {o.address ? (
                <span className="sv-info">
                  <SvIcon name="pin" />
                  {o.address}
                </span>
              ) : null}
              {o.email ? (
                <a className="sv-info" href={`mailto:${o.email}`}>
                  <SvIcon name="mail" />
                  {o.email}
                </a>
              ) : null}
            </div>
          </div>
          <div className="sv-barw">
            <header className="sv-bar">
              <a
                aria-label={ctx.site.name}
                className="sv-logo"
                href={href(ctx, "/")}
              >
                {logo}
              </a>
              <nav aria-label="Menu principal" className="sv-nav">
                <ul className="sv-menu">{items.map(link)}</ul>
              </nav>
              <div className="sv-bar-r">
                <label
                  aria-label={p.searchLabel}
                  className="sv-sbtn"
                  htmlFor="sv-search"
                  title={p.searchLabel}
                >
                  <SvIcon name="search" />
                </label>
                {p.donateLabel ? (
                  <a
                    className="sv-btn sv-btn-green sv-hdonate"
                    href={anchorHref(ctx, p.donateUrl || "/doacao/")}
                  >
                    {p.donateLabel}
                  </a>
                ) : null}
                <label
                  aria-label="Abrir menu"
                  className="sv-burger-btn"
                  htmlFor="sb-burger"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.200"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                </label>
              </div>
              {/* biome-ignore lint/a11y/useSemanticElements: <search> ainda não existe nos tipos do React */}
              <form
                action={href(ctx, p.searchUrl || "/noticias/")}
                className="sv-sform"
                method="get"
                role="search"
              >
                <input
                  aria-label={p.searchLabel}
                  name="q"
                  placeholder={p.searchPlaceholder}
                  type="search"
                />
                <button className="sv-btn sv-btn-green" type="submit">
                  {p.searchButton}
                </button>
              </form>
            </header>
          </div>
          <aside aria-label="Menu" className="sv-drawer">
            <label
              aria-label="Fechar menu"
              className="sv-drawer-bg"
              htmlFor="sb-burger"
            />
            <div className="sv-drawer-in">
              <label
                aria-label="Fechar menu"
                className="sv-drawer-x"
                htmlFor="sb-burger"
              >
                <SvIcon name="close" />
              </label>
              <a
                aria-label={ctx.site.name}
                className="sv-drawer-logo"
                href={href(ctx, "/")}
              >
                {logo}
              </a>
              <ul className="sv-drawer-menu">{items.map(link)}</ul>
              {p.donateLabel ? (
                <a
                  className="sv-btn sv-btn-green"
                  href={anchorHref(ctx, p.donateUrl || "/doacao/")}
                >
                  {p.donateLabel}
                </a>
              ) : null}
              <Socials ctx={ctx} items={p.socials} />
            </div>
          </aside>
        </div>
      );
    },
    type: "svHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

/** Filhos do bloco (para `Block.fx`): 1 = `section.sv-hero` → 1.1 = carrossel, 1.2 = título + botões. */
const svHero = defineBlock(
  z.object({
    fadeMs: int(100, 3000, 500),
    line1: str("Construindo o amanhã:"),
    line2: str("juntos, plantamos sementes de um futuro melhor"),
    primaryLabel: str("Doe agora"),
    primaryUrl: str("/doacao/"),
    secondaryLabel: str("Conheça nossos projetos"),
    secondaryUrl: str("#projetos"),
    seconds: int(2, 30, 5),
    slides: z.array(photoItem).default([]).catch([]),
    veil: str("#00000059"),
  }),
  {
    fields: [
      {
        itemFields: PHOTO_FIELDS,
        key: "slides",
        kind: "list",
        label: "Fotos do fundo (em sequência, com fade)",
      },
      { key: "seconds", kind: "number", label: "Segundos entre as fotos" },
      { key: "fadeMs", kind: "number", label: "Duração do fade (ms)" },
      { key: "veil", kind: "color", label: "Véu escuro sobre as fotos" },
      { key: "line1", kind: "text", label: "Título — 1ª linha" },
      { key: "line2", kind: "text", label: "Título — 2ª linha" },
      { key: "primaryLabel", kind: "text", label: "Botão branco — texto" },
      { key: "primaryUrl", kind: "url", label: "Botão branco — link" },
      {
        key: "secondaryLabel",
        kind: "text",
        label: "Botão de contorno — texto",
      },
      { key: "secondaryUrl", kind: "url", label: "Botão de contorno — link" },
    ],
    group: "content",
    label: "Hero com fotos em fade (Semente Viva)",
    render: (p, ctx) => (
      <section
        className="sv-hero"
        style={{ "--sv-veil": hex(p.veil, "#00000059") } as CSSProperties}
      >
        <SiCar
          arrows="none"
          items={p.slides.map((s, i) => (
            <Pic
              alt={s.alt}
              className="sv-hero-img"
              eager={i === 0}
              key={s.image + s.alt}
              src={s.image}
            />
          ))}
          p={carProps(p.seconds, p.fadeMs)}
          pause={false}
          transition="fade"
        />
        <div className="sv-hero-in">
          <h1>
            <span>{p.line1}</span>
            <span>{p.line2}</span>
          </h1>
          <div className="sv-hero-btns">
            {p.primaryLabel ? (
              <a
                className="sv-btn sv-btn-white"
                href={anchorHref(ctx, p.primaryUrl || "/doacao/")}
              >
                {p.primaryLabel}
              </a>
            ) : null}
            {p.secondaryLabel ? (
              <a
                className="sv-btn sv-btn-ghost"
                href={anchorHref(ctx, p.secondaryUrl || "#projetos")}
              >
                {p.secondaryLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    ),
    type: "svHero",
  }
);

/* ───────────────────────── áreas de atuação ───────────────────────── */

const areaItem = z.object({
  icon: str("heart"),
  text: str(),
  title: str(),
});

/** Filhos (para `Block.fx`): 1 = seção; com título, 1.1 = cabeçalho e 1.2 = grade; sem título, 1.1 = grade. */
const svAreas = defineBlock(
  z.object({
    eyebrow: str(),
    items: z.array(areaItem).default([]).catch([]),
    overlap: flag("yes"),
    subtitle: str(),
    title: str(),
  }),
  {
    fields: [
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: SV_ICON_OPTIONS,
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Áreas de atuação",
      },
      {
        key: "overlap",
        kind: "select",
        label: "Sobrepor os cartões ao pé do hero",
        options: [
          { label: "Sim (home)", value: "yes" },
          { label: "Não (páginas internas)", value: "no" },
        ],
      },
      { key: "eyebrow", kind: "text", label: "Rótulo (vazio = sem cabeçalho)" },
      { key: "title", kind: "text", label: "Título da seção" },
      { key: "subtitle", kind: "textarea", label: "Subtítulo da seção" },
    ],
    group: "content",
    label: "Áreas de atuação (Semente Viva)",
    render: p => (
      <section
        className={p.overlap === "yes" ? "sv-areas is-over" : "sv-areas"}
      >
        {p.title ? (
          <div className="sv-sec-head">
            {p.eyebrow ? <p className="sv-eyebrow">{p.eyebrow}</p> : null}
            <h2>{p.title}</h2>
            {p.subtitle ? <p>{p.subtitle}</p> : null}
          </div>
        ) : null}
        <div className="sv-areas-grid">
          {p.items.map((a, i) => (
            <article
              className={i % 2 ? "sv-area is-blue" : "sv-area"}
              key={a.title + a.text}
            >
              <span className="sv-ico">
                <SvIcon name={a.icon} />
              </span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </article>
          ))}
        </div>
      </section>
    ),
    type: "svAreas",
  }
);

/* ───────────────────────── quem somos ───────────────────────── */

/** Filhos (para `Block.fx`): 1 = seção → 1.1 = partículas, 1.2 = grade (1.2.1 = círculo de fotos, 1.2.2 = texto). */
const svAbout = defineBlock(
  z.object({
    bottomGap: int(0, 400, 60),
    eyebrow: str("Quem somos"),
    fadeMs: int(100, 3000, 500),
    linkLabel: str("Conheça nossa história"),
    linkUrl: str("/quem-somos/"),
    more: str(),
    particles: flag("yes"),
    photos: z.array(photoItem).default([]).catch([]),
    seconds: int(2, 30, 5),
    tag: str("DESDE 2012"),
    text: str(
      "A Fundação Semente Viva é uma instituição sem fins lucrativos, mantida por doações e parcerias, que leva esporte, educação e cuidado a crianças, jovens e idosos da nossa cidade."
    ),
    title: str("Nascemos para cuidar de quem mais precisa"),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Rótulo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto de destaque" },
      {
        key: "more",
        kind: "textarea",
        label: "Mais parágrafos (um por linha; vazio = só o destaque)",
      },
      {
        key: "linkLabel",
        kind: "text",
        label: "Link — texto (vazio = sem link)",
      },
      { key: "linkUrl", kind: "url", label: "Link — destino" },
      {
        key: "tag",
        kind: "text",
        label: "Rótulo sobre a foto (blob verde; vazio = sem rótulo)",
      },
      {
        itemFields: PHOTO_FIELDS,
        key: "photos",
        kind: "list",
        label: "Fotos do círculo",
      },
      { key: "seconds", kind: "number", label: "Segundos entre as fotos" },
      { key: "fadeMs", kind: "number", label: "Duração da troca (ms)" },
      {
        key: "particles",
        kind: "select",
        label: "Partículas no fundo",
        options: [
          { label: "Ligadas", value: "yes" },
          { label: "Desligadas", value: "no" },
        ],
      },
      {
        key: "bottomGap",
        kind: "number",
        label: "Espaço embaixo (px; na home 200 deixa o cartão verde subir)",
      },
    ],
    group: "content",
    label: "Quem somos — fotos em círculo (Semente Viva)",
    render: (p, ctx) => (
      <section
        className="sv-about"
        style={{ "--sv-pb": `${p.bottomGap}px` } as CSSProperties}
      >
        {p.particles === "yes" ? <Parts /> : null}
        <div className="sv-about-in">
          <div className="sv-circ">
            <SiCar
              arrows="inside"
              dots
              items={p.photos.map(s => (
                <Pic
                  alt={s.alt}
                  className="sv-circ-img"
                  key={s.image + s.alt}
                  src={s.image}
                />
              ))}
              p={carProps(p.seconds, p.fadeMs)}
            />
            {p.tag ? <span className="sv-circ-tag">{p.tag}</span> : null}
          </div>
          <div className="sv-about-txt">
            {p.eyebrow ? <p className="sv-eyebrow">{p.eyebrow}</p> : null}
            <h2>{p.title}</h2>
            <p className="sv-lead">{p.text}</p>
            {paragraphs(p.more).map(t => (
              <p className="sv-more" key={t}>
                {t}
              </p>
            ))}
            {p.linkLabel && p.linkUrl ? (
              <a className="sv-link" href={anchorHref(ctx, p.linkUrl)}>
                {p.linkLabel}
                <SvIcon name="arrow" />
              </a>
            ) : null}
          </div>
        </div>
      </section>
    ),
    type: "svAbout",
  }
);

/* ───────────────────────── faixa "Seja um colaborador" ───────────────────────── */

/** Filhos (para `Block.fx`): 1 = seção → 1.1 = partículas (se ligadas), cartão = último filho. */
const svDonateBand = defineBlock(
  z.object({
    buttonLabel: str("Quero doar"),
    buttonUrl: str("/doacao/"),
    particles: flag("yes"),
    title: str("Seja um colaborador"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
      {
        key: "particles",
        kind: "select",
        label: "Partículas no fundo",
        options: [
          { label: "Ligadas", value: "yes" },
          { label: "Desligadas", value: "no" },
        ],
      },
    ],
    group: "content",
    label: "Faixa “Seja um colaborador” (Semente Viva)",
    render: (p, ctx) => (
      <section className="sv-green sv-band">
        {p.particles === "yes" ? <Parts dark /> : null}
        <div className="sv-band-card">
          <h2>{p.title}</h2>
          {p.buttonLabel ? (
            <a
              className="sv-btn sv-btn-white"
              href={anchorHref(ctx, p.buttonUrl || "/doacao/")}
            >
              {p.buttonLabel}
            </a>
          ) : null}
        </div>
      </section>
    ),
    type: "svDonateBand",
  }
);

/* ───────────────────────── notícias / redes em coverflow ───────────────────────── */

const svSocialCarousel = defineBlock(
  z.object({
    count: int(1, 8, 3),
    eyebrow: str("Notícias da fundação"),
    items: linkList,
    moreLabel: str("Ver todas as notícias"),
    moreUrl: str("/noticias/"),
    particles: flag("yes"),
    seconds: int(2, 30, 5),
    source: z.enum(["news", "social"]).default("news").catch("news"),
    speed: int(100, 3000, 300),
    title: str("Acompanhe nossas ações"),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Rótulo" },
      { key: "title", kind: "text", label: "Título" },
      {
        key: "source",
        kind: "select",
        label: "O que o carrossel mostra",
        options: [
          { label: "Últimas notícias do site", value: "news" },
          { label: "Redes sociais (lista abaixo)", value: "social" },
        ],
      },
      { key: "count", kind: "number", label: "Quantas notícias (1 a 8)" },
      {
        itemFields: SOCIAL_FIELDS,
        key: "items",
        kind: "list",
        label: "Redes (quando o carrossel mostra redes)",
      },
      {
        key: "moreLabel",
        kind: "text",
        label: "Link final — texto (vazio = sem link)",
      },
      { key: "moreUrl", kind: "url", label: "Link final — destino" },
      { key: "seconds", kind: "number", label: "Segundos entre os cartões" },
      { key: "speed", kind: "number", label: "Duração da troca (ms)" },
      {
        key: "particles",
        kind: "select",
        label: "Partículas no fundo",
        options: [
          { label: "Ligadas", value: "yes" },
          { label: "Desligadas", value: "no" },
        ],
      },
    ],
    group: "content",
    label: "Notícias em coverflow (Semente Viva)",
    render: (p, ctx) => {
      const posts = visiblePosts(ctx.site, ctx.mode).slice(0, p.count);
      const socials = liveSocials(p.items);
      const slides =
        p.source === "social"
          ? socials.map(s => (
              <a
                className="sv-cf-card is-social"
                href={href(ctx, s.url)}
                key={s.label + s.url}
                {...newTab(s.url)}
              >
                <i style={{ "--c": socialBg(s.label) } as CSSProperties}>
                  <SvSocial label={s.label} />
                </i>
                {s.label}
              </a>
            ))
          : posts.map(post => (
              <a
                className="sv-cf-card"
                href={href(ctx, postPath(post))}
                key={post.id}
              >
                <Pic alt={post.title} src={post.coverImage} />
                <div>
                  <time>{formatDate(post.publishedAt)}</time>
                  <h3>{post.title}</h3>
                </div>
              </a>
            ));
      return (
        <section className="sv-green sv-news-band">
          {p.particles === "yes" ? <Parts dark /> : null}
          <div className="sv-news-head">
            {p.eyebrow ? <p className="sv-eyebrow">{p.eyebrow}</p> : null}
            <h2>{p.title}</h2>
          </div>
          <div className="sv-cf">
            <SiCar
              arrows="inside"
              dots
              effect="coverflow"
              items={slides}
              p={carProps(p.seconds, p.speed)}
            />
          </div>
          {p.moreLabel && p.moreUrl && p.source === "news" ? (
            <div className="sv-cf-more">
              <a
                className="sv-btn sv-btn-ghost"
                href={anchorHref(ctx, p.moreUrl)}
              >
                {p.moreLabel}
              </a>
            </div>
          ) : null}
        </section>
      );
    },
    type: "svSocialCarousel",
  }
);

/* ───────────────────────── projetos ───────────────────────── */

const floatItem = z.object({
  alt: str(),
  image: str(),
  keep: flag("no"),
  size: int(80, 280, 150),
  x: int(-10, 100, 10),
  y: int(0, 100, 20),
});

/** Filhos (para `Block.fx`): 1 = seção → 1.1 = mapa, 1.2…1.7 = fotos, 1.8 = conteúdo (título, subtítulo, play, "conheça"). */
const svProjects = defineBlock(
  z.object({
    linkLabel: str("Conheça"),
    linkUrl: str("/como-atuamos/"),
    particles: flag("no"),
    photos: z.array(floatItem).default([]).catch([]),
    playLabel: str("Assistir ao vídeo dos projetos"),
    subtitle: str(
      "Esporte, cursos, educação, cuidado com os idosos e muito mais."
    ),
    title1: str("PROJETOS"),
    title2: str("DESENVOLVIDOS"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "title1", kind: "text", label: "Título — 1ª linha" },
      { key: "title2", kind: "text", label: "Título — 2ª linha" },
      { key: "subtitle", kind: "textarea", label: "Subtítulo" },
      {
        key: "videoUrl",
        kind: "url",
        label: "Vídeo (link do YouTube ou Vimeo; vazio = sem botão de play)",
      },
      {
        key: "playLabel",
        kind: "text",
        label: "Botão de play — nome (leitor de tela)",
      },
      {
        key: "linkLabel",
        kind: "text",
        label: "Link grande — texto (vazio = sem link)",
      },
      { key: "linkUrl", kind: "url", label: "Link grande — destino" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          { key: "alt", kind: "text", label: "Descrição da foto" },
          { key: "size", kind: "number", label: "Diâmetro (80 a 280 px)" },
          {
            key: "x",
            kind: "number",
            label: "Posição horizontal (% da largura)",
          },
          { key: "y", kind: "number", label: "Posição vertical (% da altura)" },
          {
            key: "keep",
            kind: "select",
            label: "Aparece no celular",
            options: [
              { label: "Sim", value: "yes" },
              { label: "Não", value: "no" },
            ],
          },
        ],
        key: "photos",
        kind: "list",
        label: "Fotos redondas",
      },
      {
        key: "particles",
        kind: "select",
        label: "Partículas no fundo",
        options: [
          { label: "Ligadas", value: "yes" },
          { label: "Desligadas", value: "no" },
        ],
      },
    ],
    group: "content",
    label: "Projetos desenvolvidos (Semente Viva)",
    render: (p, ctx) => {
      const embed = p.videoUrl ? popupVideoEmbed(p.videoUrl) : null;
      return (
        <section className="sv-proj">
          <div aria-hidden="true" className="sv-map" />
          {p.particles === "yes" ? <Parts /> : null}
          {p.photos.map((f, i) => (
            <figure
              className={[
                "sv-float",
                f.keep === "yes" ? "is-keep" : "",
                f.x < 8 || f.x > 85 ? "is-far" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={f.image + f.alt}
              style={
                {
                  "--d": `${-(i * 1.3).toFixed(1)}s`,
                  "--sz": `${f.size}px`,
                  "--x": `${f.x}%`,
                  "--y": `${f.y}%`,
                } as CSSProperties
              }
            >
              <Pic alt={f.alt} src={f.image} />
            </figure>
          ))}
          <div className="sv-proj-in">
            <h2>
              {p.title1}
              {p.title2 ? (
                <>
                  <br />
                  {p.title2}
                </>
              ) : null}
            </h2>
            {p.subtitle ? <p className="sv-sub">{p.subtitle}</p> : null}
            {p.videoUrl ? (
              <a
                aria-label={p.playLabel}
                className="sv-play"
                data-sb-video={embed ?? undefined}
                href={href(ctx, p.videoUrl)}
                {...newTab(p.videoUrl)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m7 4 13 8-13 8z" />
                </svg>
              </a>
            ) : null}
            {p.linkLabel ? (
              p.linkUrl ? (
                <a className="sv-conheca" href={href(ctx, p.linkUrl)}>
                  {p.linkLabel}
                </a>
              ) : (
                <span className="sv-conheca">{p.linkLabel}</span>
              )
            ) : null}
          </div>
        </section>
      );
    },
    type: "svProjects",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const svFooter = defineBlock(
  z.object({
    about: str(
      "Uma instituição sem fins lucrativos, mantida por doações e parcerias, que leva esporte, educação e cuidado a quem mais precisa."
    ),
    addressLabel: str("Endereço:"),
    cnpjLabel: str("CNPJ:"),
    contactTitle: str("Contato"),
    copyright: str("Copyright © {ano} {nome}. Todos os direitos reservados."),
    emailLabel: str("E-mail:"),
    hoursLabel: str("Horário:"),
    logo: str(),
    menuTitle: str("Menu"),
    phoneLabel: str("Telefone:"),
    socials: linkList,
    socialsTitle: str("Redes sociais"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo claro (para fundo verde)" },
      { key: "about", kind: "textarea", label: "Texto sob o logo" },
      {
        key: "contactTitle",
        kind: "text",
        label: "Coluna de contato — título",
      },
      { key: "addressLabel", kind: "text", label: "Rótulo do endereço" },
      { key: "emailLabel", kind: "text", label: "Rótulo do e-mail" },
      { key: "phoneLabel", kind: "text", label: "Rótulo do telefone" },
      { key: "hoursLabel", kind: "text", label: "Rótulo do horário" },
      { key: "cnpjLabel", kind: "text", label: "Rótulo do CNPJ" },
      { key: "menuTitle", kind: "text", label: "Coluna do menu — título" },
      { key: "socialsTitle", kind: "text", label: "Coluna das redes — título" },
      {
        itemFields: SOCIAL_FIELDS,
        key: "socials",
        kind: "list",
        label: "Redes sociais",
      },
      {
        key: "copyright",
        kind: "text",
        label: "Direitos ({ano} = ano atual, {nome} = nome da fundação)",
      },
    ],
    group: "layout",
    label: "Rodapé (Semente Viva)",
    render: (p, ctx) => {
      const o = org(ctx);
      const items = ctx.site.menu.filter(m => !m.dynamic);
      const year = String(new Date().getFullYear());
      const parts = p.copyright.replaceAll("{nome}", o.name).split("{ano}");
      const tel = telHref(o.phone);
      return (
        <footer className="sv-foot">
          <div className="sv-foot-in">
            <div>
              {p.logo ? (
                <a
                  aria-label={ctx.site.name}
                  className="sv-foot-logo"
                  href={href(ctx, "/")}
                >
                  <Pic alt="" src={p.logo} />
                </a>
              ) : null}
              <p className="sv-foot-about">{p.about}</p>
            </div>
            <div>
              <h4>{p.contactTitle}</h4>
              <dl>
                {o.address ? (
                  <div>
                    <dt>{p.addressLabel}</dt>
                    <dd>{o.address}</dd>
                  </div>
                ) : null}
                {o.email ? (
                  <div>
                    <dt>{p.emailLabel}</dt>
                    <dd>
                      <a href={`mailto:${o.email}`}>{o.email}</a>
                    </dd>
                  </div>
                ) : null}
                {o.phone ? (
                  <div>
                    <dt>{p.phoneLabel}</dt>
                    <dd>{tel ? <a href={tel}>{o.phone}</a> : o.phone}</dd>
                  </div>
                ) : null}
                {o.hours ? (
                  <div>
                    <dt>{p.hoursLabel}</dt>
                    <dd>{o.hours}</dd>
                  </div>
                ) : null}
                {o.cnpj ? (
                  <div>
                    <dt>{p.cnpjLabel}</dt>
                    <dd>{o.cnpj}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <div>
              <h4>{p.menuTitle}</h4>
              <nav aria-label="Menu do rodapé" className="sv-foot-menu">
                {items.map(m => (
                  <a href={anchorHref(ctx, m.href)} key={m.href + m.label}>
                    {m.label}
                  </a>
                ))}
              </nav>
            </div>
            <div>
              <h4>{p.socialsTitle}</h4>
              <Socials ctx={ctx} items={p.socials} />
            </div>
          </div>
          <p className="sv-copy">
            {parts.map((t, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do trecho
              <span key={i}>
                {i > 0 ? <span data-sv-year="1">{year}</span> : null}
                {t}
              </span>
            ))}
          </p>
        </footer>
      );
    },
    type: "svFooter",
  }
);

export const fundacaoBlocks: BlockDefinition[] = [
  svHeader,
  svHero,
  svAreas,
  svAbout,
  svDonateBand,
  svSocialCarousel,
  svProjects,
  svFooter,
];
