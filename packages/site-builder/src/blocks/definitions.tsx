import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { AdBox, adBlocks, adItemFields, adItemsSchema } from "./ads.js";
import { areaflixBlocks } from "./areaflix.js";
import { centralBlocks, Eyebrow } from "./central.js";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  ExcerptCard,
  formatDate,
  href,
  Img,
  Inline,
  LinkButton,
  newTab,
  PostCard,
  postPath,
  SocialIcon,
  safeUrl,
  visiblePosts,
  wpDate,
} from "./helpers.js";
import { marketplaceBlocks } from "./marketplace.js";
import { patrimonialBlocks } from "./patrimonial.js";
import { portalHubBlocks } from "./portal-hub.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { isYouTubeChannelId, latestVideoEmbed, videoEmbed } from "./youtube.js";

const str = (d = "") => z.string().default(d);

const SHOW_OPTIONS = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

const linkFields = (label = "Botão"): FieldDef[] => [
  { key: "buttonLabel", kind: "text", label: `${label} — texto` },
  { key: "buttonUrl", kind: "url", label: `${label} — link` },
];

/** Link interno do menu aponta para a rota atual? (`/blogs` = `/blogs/`; links externos e `#` nunca.) */
const samePath = (link: string, path: string | undefined) => {
  if (!path || !link.startsWith("/") || link.startsWith("//")) return false;
  const norm = (s: string) =>
    `/${s.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "")}`;
  return norm(link) === norm(path);
};

const header = defineBlock(
  z.object({
    buttonLabel: str("Marketplace"),
    buttonUrl: str("#"),
    featuredLabel: str(),
    featuredUrl: str("#"),
    /** Altura da barra em px (estilo Portal); logo, busca e botão escalam junto. 77 = padrão. */
    height: z.coerce.number().min(36).max(140).default(77).catch(77),
    /** Posição da imagem da logo quando solta do nome (`logoLayout: "split"`), em % da largura. */
    imgX: z.coerce.number().min(0).max(100).default(40).catch(40),
    logo: str(),
    /** `split` = imagem e nome são dois itens, cada um com a sua posição (estilo Portal). */
    logoLayout: z
      .enum(["together", "split"])
      .default("together")
      .catch("together"),
    logoText: str("Meu Site"),
    /** Posição horizontal da logo na barra, em % da largura (estilo Portal). Arrastar no editor. */
    logoX: z.coerce.number().min(0).max(100).default(50).catch(50),
    /** Fundo do menu lateral do celular (tema 007SpyHacker). Só `#rrggbb`: vai direto para o CSS. */
    menuBg: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .default("#00060b")
      .catch("#00060b"),
    searchLabel: str("BUSCAR"),
    topLinks: z.array(z.object({ label: str(), url: str("#") })).default([]),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoText", kind: "text", label: "Nome ao lado do logo" },
      {
        key: "logoLayout",
        kind: "select",
        label: "Logo e nome (estilo Portal)",
        options: [
          { label: "Juntos (arrastam juntos)", value: "together" },
          { label: "Separados (arraste cada um)", value: "split" },
        ],
      },
      {
        key: "logoX",
        kind: "number",
        label:
          "Posição do nome/logo em % (0 = esquerda, 50 = centro; ou arraste no canvas)",
      },
      {
        key: "imgX",
        kind: "number",
        label: "Posição da imagem da logo em % (só com logo e nome separados)",
      },
      { key: "searchLabel", kind: "text", label: "Texto da busca" },
      {
        key: "height",
        kind: "number",
        label:
          "Altura da barra em px (36–140; padrão 77) — letras escalam junto",
      },
      {
        key: "menuBg",
        kind: "color",
        label: "Fundo do menu lateral no celular (tema 007SpyHacker)",
      },
      ...linkFields(),
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "topLinks",
        kind: "list",
        label: "Faixa de links no topo (estilo Portal)",
      },
      {
        key: "featuredLabel",
        kind: "text",
        label: "Assunto em destaque abaixo da barra (estilo Portal)",
      },
      { key: "featuredUrl", kind: "url", label: "Assunto em destaque — link" },
    ],
    group: "layout",
    label: "Cabeçalho",
    render: (p, ctx) => (
      <>
        {p.topLinks.length ? (
          <div className="sb-topbar">
            <div className="sb-container">
              {p.topLinks.map(l => (
                <a href={href(ctx, l.url)} key={l.label + l.url}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
        <header
          className={
            ctx.current.category
              ? "sb-header sb-container sb-header-section"
              : "sb-header sb-container"
          }
          style={
            {
              "--sb-hh": `${p.height}px`,
              "--sb-hs": p.height / 77,
              "--sb-ix": p.imgX / 100,
              "--sb-lx": p.logoX / 100,
              // Logo também como imagem de fundo (a gaveta do menu do tema Marketplace repete a logo no topo).
              ...(p.logo ? { "--sb-logo": cssUrl(p.logo) } : {}),
              "--sb-menu-bg": p.menuBg,
            } as CSSProperties
          }
        >
          {/* biome-ignore lint/correctness/useUniqueElementIds: o menu do celular usa o label for=id; há um só cabeçalho por página */}
          <input
            aria-label="Abrir menu"
            className="sb-burger-input"
            id="sb-burger"
            type="checkbox"
          />
          <label className="sb-burger" htmlFor="sb-burger">
            <i />
            <i />
            <i />
          </label>
          {p.logoLayout === "split" && p.logo ? (
            <a className="sb-logo-img" href={href(ctx, "/")}>
              <Img alt={p.logoText || ctx.site.name} src={p.logo} />
            </a>
          ) : null}
          <a className="sb-logo" href={href(ctx, "/")}>
            {p.logo && p.logoLayout !== "split" ? (
              <Img alt={p.logoText || ctx.site.name} src={p.logo} />
            ) : null}
            {p.logoText ? <strong>{p.logoText}</strong> : null}
          </a>
          <nav className="sb-nav">
            {ctx.site.menu.map(item => {
              const subs =
                item.dynamic === "categories"
                  ? ctx.site.categories.map(c => ({
                      href: categoryPath(c),
                      label: c.name,
                    }))
                  : (item.children ?? []);
              return (
                <div
                  className={
                    subs.length ? "sb-nav-item has-sub" : "sb-nav-item"
                  }
                  key={item.href + item.label}
                >
                  <a
                    aria-current={
                      samePath(item.href, ctx.path) ? "page" : undefined
                    }
                    href={href(ctx, item.href)}
                  >
                    {item.label}
                    {subs.length ? <i aria-hidden="true" /> : null}
                  </a>
                  {subs.length ? (
                    <div className="sb-nav-sub">
                      {subs.map(s => (
                        <a href={href(ctx, s.href)} key={s.href + s.label}>
                          {s.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: fundo escuro do menu lateral; clicar fora fecha o menu via label do checkbox */}
          <label
            aria-hidden="true"
            className="sb-burger-backdrop"
            htmlFor="sb-burger"
          />
          <form
            action={href(ctx, "/pesquisa/")}
            className="sb-header-search"
            method="get"
          >
            <input
              aria-label={p.searchLabel || "Buscar"}
              name="q"
              placeholder={p.searchLabel}
              type="search"
            />
          </form>
          <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          {ctx.current.category ? (
            <span className="sb-header-title">{ctx.current.category.name}</span>
          ) : null}
        </header>
        {p.featuredLabel ? (
          <div className="sb-subbar">
            <div className="sb-container">
              <a href={href(ctx, p.featuredUrl)}>{p.featuredLabel}</a>
            </div>
          </div>
        ) : null}
      </>
    ),
    type: "header",
  }
);

const footer = defineBlock(
  z.object({
    contactTitle: str("Fale conosco"),
    copyright: str("Copyright © Meu Site"),
    email: str(),
    extraLinks: z.array(z.object({ label: str(), url: str("#") })).default([]),
    helpText: str(),
    logo: str(),
    logoText: str("Meu Site"),
    menuTitle: str("Menu"),
    socials: z.array(z.object({ label: str(), url: str("#") })).default([]),
    socialsTitle: str("Redes Sociais"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoText", kind: "text", label: "Nome" },
      { key: "menuTitle", kind: "text", label: "Título da coluna de menu" },
      { key: "contactTitle", kind: "text", label: "Título de contato" },
      { key: "socialsTitle", kind: "text", label: "Título das redes sociais" },
      { key: "email", kind: "text", label: "E-mail de contato" },
      { key: "helpText", kind: "text", label: "Texto de apoio" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Rede" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "socials",
        kind: "list",
        label: "Redes sociais",
      },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "extraLinks",
        kind: "list",
        label: "Links extras no menu do rodapé",
      },
      { key: "copyright", kind: "text", label: "Copyright" },
    ],
    group: "layout",
    label: "Rodapé",
    render: (p, ctx) => (
      <footer className="sb-footer">
        <div className="sb-container sb-footer-grid">
          <div className="sb-footer-brand">
            {p.logo ? (
              <Img alt={p.logoText || ctx.site.name} src={p.logo} />
            ) : null}
            {p.logoText ? <strong>{p.logoText}</strong> : null}
          </div>
          <div>
            {p.menuTitle ? <h4>{p.menuTitle}</h4> : null}
            {ctx.site.menu.map(item => (
              <a href={href(ctx, item.href)} key={item.href + item.label}>
                {item.label}
              </a>
            ))}
            {p.extraLinks.map(l => (
              <a href={safeUrl(l.url)} key={l.url + l.label}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            {p.contactTitle ? <h4>{p.contactTitle}</h4> : null}
            {p.email ? (
              <a className="sb-footer-mail" href={`mailto:${p.email}`}>
                <svg
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 512 512"
                >
                  <path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z" />
                </svg>
                {p.email}
              </a>
            ) : null}
            {p.helpText ? <span>{p.helpText}</span> : null}
            {p.socialsTitle ? <h4>{p.socialsTitle}</h4> : null}
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
        </div>
        <div className="sb-container sb-footer-bottom">
          <span>{p.copyright}</span>
          <span>
            {ctx.site.pages
              .filter(pg =>
                ["termos-de-uso", "politica-de-privacidade"].includes(pg.slug)
              )
              .map(pg => (
                <a href={href(ctx, `/${pg.slug}/`)} key={pg.id}>
                  {pg.title}
                </a>
              ))}
          </span>
        </div>
      </footer>
    ),
    type: "footer",
  }
);

const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z";

const whatsappFloat = defineBlock(
  z.object({
    label: str("Entre nas nossas comunidades"),
    url: str("#"),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Texto" },
      { key: "url", kind: "url", label: "Link" },
    ],
    group: "layout",
    label: "Botão flutuante WhatsApp",
    render: p => (
      <a className="sb-float" href={safeUrl(p.url)}>
        <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d={WHATSAPP_PATH} />
        </svg>
        <span>{p.label}</span>
      </a>
    ),
    type: "whatsappFloat",
  }
);

const hero = defineBlock(
  z.object({
    backgroundImage: str(),
    buttonLabel: str("Explorar Conteúdos →"),
    buttonUrl: str("#conteudos"),
    text: str("Título principal do seu site"),
  }),
  {
    fields: [
      { key: "backgroundImage", kind: "image", label: "Imagem de fundo" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...linkFields(),
    ],
    group: "content",
    label: "Hero",
    render: (p, ctx) => (
      <section
        className="sb-hero"
        style={
          p.backgroundImage
            ? { backgroundImage: `url(${JSON.stringify(p.backgroundImage)})` }
            : undefined
        }
      >
        <div className="sb-container">
          <h1>{p.text}</h1>
          <LinkButton
            ctx={ctx}
            label={p.buttonLabel}
            size="lg"
            url={p.buttonUrl}
          />
        </div>
      </section>
    ),
    type: "hero",
  }
);

const heading = defineBlock(
  z.object({
    align: z.enum(["left", "center"]).default("left"),
    eyebrow: str(),
    level: z.enum(["h1", "h2", "h3", "h4"]).default("h2"),
    subtitle: str(),
    text: str("Título"),
    watermark: str(),
  }),
  {
    fields: [
      { key: "text", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        key: "eyebrow",
        kind: "text",
        label: "Rótulo pequeno acima do título (tema Central)",
      },
      { key: "watermark", kind: "text", label: "Texto grande ao fundo" },
      {
        key: "level",
        kind: "select",
        label: "Nível",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
          { label: "H4", value: "h4" },
        ],
      },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento",
        options: [
          { label: "Esquerda", value: "left" },
          { label: "Centro", value: "center" },
        ],
      },
    ],
    group: "content",
    label: "Título",
    render: p => {
      const Tag = p.level;
      return (
        <div className={`sb-container sb-heading sb-align-${p.align}`}>
          {p.watermark ? (
            <span aria-hidden="true" className="sb-watermark">
              {p.watermark}
            </span>
          ) : null}
          <Eyebrow text={p.eyebrow} />
          <Tag>{p.text}</Tag>
          {p.subtitle ? <p className="sb-sub">{p.subtitle}</p> : null}
        </div>
      );
    },
    type: "heading",
  }
);

/**
 * Parágrafos seguidos que começam com "• " viram uma lista (sem o marcador no texto). Dentro de um
 * parágrafo, cada linha com "• " é um item; linha sem marcador continua o item anterior.
 */
/**
 * Classe da busca da categoria. Fica fora do JSX porque a regra `useSortedClasses` do Biome, no
 * `--write`, tira o espaço de `" l-compact"` dentro do `className` e cola as duas classes.
 */
const catSearchClass = (layout: string) =>
  ["sb-container sb-mag sb-cat-search", layout === "compact" && "l-compact"]
    .filter(Boolean)
    .join(" ");

function groupBullets(paras: string[]): (string | string[])[] {
  const out: (string | string[])[] = [];
  for (const para of paras) {
    if (para.startsWith("• ")) {
      const last = out.at(-1);
      const items: string[] = Array.isArray(last) ? last : [];
      if (items !== last) out.push(items);
      for (const line of para.split("\n").map(l => l.trimEnd())) {
        if (line.startsWith("• ")) items.push(line.slice(2));
        else if (items.length) items[items.length - 1] += ` ${line.trim()}`;
      }
    } else out.push(para);
  }
  return out;
}

const text = defineBlock(z.object({ text: str("Escreva seu texto aqui.") }), {
  fields: [
    {
      key: "text",
      kind: "textarea",
      label:
        "Texto (linha em branco separa parágrafos; **negrito**, *itálico*, [texto](link))",
    },
  ],
  group: "content",
  label: "Texto",
  render: p => (
    <div className="sb-container sb-text">
      {groupBullets(p.text.split(/\n{2,}/)).map(part =>
        Array.isArray(part) ? (
          <ul className="sb-list" key={part.join("\n")}>
            {part.map(item => (
              <li key={item}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={part}>
            <Inline text={part} />
          </p>
        )
      )}
    </div>
  ),
  type: "text",
});

const image = defineBlock(z.object({ alt: str(), src: str(), url: str() }), {
  fields: [
    { key: "src", kind: "image", label: "Imagem" },
    { key: "alt", kind: "text", label: "Texto alternativo" },
    { key: "url", kind: "url", label: "Link ao clicar (opcional)" },
  ],
  group: "media",
  label: "Imagem",
  render: (p, ctx) => (
    <div className="sb-container sb-image">
      {p.url ? (
        <a href={href(ctx, p.url)} {...newTab(p.url)}>
          <Img alt={p.alt} src={p.src} />
        </a>
      ) : (
        <Img alt={p.alt} src={p.src} />
      )}
    </div>
  ),
  type: "image",
});

const button = defineBlock(
  z.object({
    buttonLabel: str("Clique aqui"),
    buttonUrl: str("#"),
    variant: z.enum(["primary", "wide"]).default("primary"),
  }),
  {
    fields: [
      ...linkFields(),
      {
        key: "variant",
        kind: "select",
        label: "Aparência",
        options: [
          { label: "Padrão", value: "primary" },
          { label: "Largo (link na bio)", value: "wide" },
        ],
      },
    ],
    group: "content",
    label: "Botão",
    render: (p, ctx) => (
      <div className="sb-container sb-align-center">
        <LinkButton
          ctx={ctx}
          label={p.buttonLabel}
          url={p.buttonUrl}
          variant={p.variant}
        />
      </div>
    ),
    type: "button",
  }
);

const videoGrid = defineBlock(
  z.object({
    title: str("Últimas novidades:"),
    videos: z.array(z.object({ title: str(), youtubeId: str() })).default([]),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título do vídeo" },
          {
            key: "youtubeId",
            kind: "text",
            label:
              "Link do vídeo no YouTube (ex.: https://www.youtube.com/watch?v=…; um ID de canal mostra o último vídeo dele)",
          },
        ],
        key: "videos",
        kind: "list",
        label: "Vídeos",
      },
    ],
    group: "media",
    label: "Vídeos do YouTube",
    render: p => (
      <section className="sb-container">
        <h2>{p.title}</h2>
        <div className="sb-grid sb-grid-3">
          {p.videos.map(v => {
            const id = v.youtubeId.trim();
            const src = isYouTubeChannelId(id)
              ? latestVideoEmbed(id)
              : (videoEmbed(id) ?? null);
            return src ? (
              <iframe
                allowFullScreen
                className="sb-video"
                key={v.youtubeId}
                loading="lazy"
                src={src}
                title={v.title || "Vídeo"}
              />
            ) : null;
          })}
        </div>
      </section>
    ),
    type: "videoGrid",
  }
);

const channelVideos = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          channel: z
            .object({ id: str(), input: str(), name: str() })
            .default({}),
          mode: z.enum(["latest", "specific"]).default("latest"),
          title: str(),
          video: str(),
        })
      )
      .default([]),
    title: str("Vídeos dos canais"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da seção" },
      {
        itemFields: [
          { key: "channel", kind: "youtubeChannel", label: "Canal" },
          {
            key: "mode",
            kind: "select",
            label: "O que mostrar",
            options: [
              { label: "Sempre o último vídeo do canal", value: "latest" },
              { label: "Um vídeo específico", value: "specific" },
            ],
          },
          {
            key: "video",
            kind: "text",
            label: "Link do vídeo",
            showWhen: { equals: "specific", key: "mode" },
          },
          { key: "title", kind: "text", label: "Título (opcional)" },
        ],
        key: "items",
        kind: "list",
        label: "Canais",
      },
    ],
    group: "media",
    label: "Vídeos de canais",
    render: (p, ctx) => {
      const players = p.items.flatMap((item, i) => {
        const src =
          item.mode === "specific"
            ? videoEmbed(item.video)
            : latestVideoEmbed(item.channel.id);
        const title =
          item.title || item.channel.name || item.channel.input || "Vídeo";
        if (src)
          return [
            // biome-ignore lint/suspicious/noArrayIndexKey: itens da lista não têm id estável
            <figure className="sb-channel-video" key={`${i}-${src}`}>
              <iframe
                allowFullScreen
                className="sb-video"
                loading="lazy"
                src={src}
                title={title}
              />
              {item.title || item.channel.name ? (
                <figcaption>{item.title || item.channel.name}</figcaption>
              ) : null}
            </figure>,
          ];
        // No site publicado, item incompleto some; no editor mostra o que falta.
        return ctx.mode === "edit"
          ? [
              // biome-ignore lint/suspicious/noArrayIndexKey: itens da lista não têm id estável
              <div className="sb-channel-video sb-channel-empty" key={i}>
                {item.mode === "specific"
                  ? "Cole o link do vídeo"
                  : "Escolha o canal"}
              </div>,
            ]
          : [];
      });
      return (
        <section className="sb-container">
          {p.title ? <h2>{p.title}</h2> : null}
          <div className="sb-grid sb-grid-3">{players}</div>
        </section>
      );
    },
    type: "channelVideos",
  }
);

const categoryGrid = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str("/categorias/"),
    headImage: str(),
    images: z.array(z.object({ src: str(), text: str() })).default([]),
    items: z.array(z.object({ category: str(), label: str() })).default([]),
    /** Onde fica o nome: faixa no topo (padrão), legenda embaixo da foto ou etiqueta sobre a foto. */
    labelStyle: z
      .enum(["head", "caption", "tag"])
      .default("head")
      .catch("head"),
    limit: z.coerce.number().default(0),
    showCount: z.enum(["yes", "no"]).default("no").catch("no"),
    subtitle: str(),
    title: str("Categorias"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        key: "labelStyle",
        kind: "select",
        label: "Nome da categoria",
        options: [
          { label: "Faixa no topo do card", value: "head" },
          { label: "Legenda embaixo da foto", value: "caption" },
          { label: "Etiqueta sobre a foto", value: "tag" },
        ],
      },
      {
        key: "showCount",
        kind: "select",
        label: "Mostrar a quantidade de posts, ex.: (3)",
        options: SHOW_OPTIONS,
      },
      {
        itemFields: [
          { key: "src", kind: "image", label: "Imagem" },
          { key: "text", kind: "textarea", label: "Descrição" },
        ],
        key: "images",
        kind: "list",
        label: "Imagens e textos dos cards (na ordem das categorias)",
      },
      {
        key: "headImage",
        kind: "image",
        label: "Fundo da faixa do nome (opcional, todos os cards)",
      },
      {
        itemFields: [
          { key: "category", kind: "text", label: "Slug da categoria" },
          { key: "label", kind: "text", label: "Texto do card (vazio = nome)" },
        ],
        key: "items",
        kind: "list",
        label: "Ordem e textos dos cards (vazio = todas as categorias)",
      },
      { key: "limit", kind: "number", label: "Máx. de cards (0 = todos)" },
      ...linkFields(),
    ],
    group: "blog",
    label: "Grade de categorias",
    render: (p, ctx) => {
      // Com `items`, a ordem e o texto de cada card vêm daí; senão, todas as categorias.
      const chosen = p.items.length
        ? p.items.flatMap(it => {
            const c = ctx.site.categories.find(x => x.slug === it.category);
            return c ? [{ ...c, name: it.label || c.name }] : [];
          })
        : ctx.site.categories;
      const cats = p.limit > 0 ? chosen.slice(0, p.limit) : chosen;
      const posts =
        p.showCount === "yes" ? visiblePosts(ctx.site, ctx.mode) : [];
      const countOf = (id: string) =>
        posts.filter(post => post.categoryId === id).length;
      return (
        <section
          className={
            p.labelStyle === "head"
              ? "sb-container"
              : `sb-container sb-cat-l-${p.labelStyle}`
          }
          style={
            p.headImage
              ? ({ "--cat-head-img": cssUrl(p.headImage) } as CSSProperties)
              : undefined
          }
        >
          {p.title ? <h2>{p.title}</h2> : null}
          {p.subtitle ? <p className="sb-sub">{p.subtitle}</p> : null}
          <div className="sb-grid sb-grid-3" data-repeat-list="">
            {cats.map((c, i) => (
              <a
                className={`sb-card sb-cat-card${p.images[i]?.src ? "" : "plain"}`}
                href={href(ctx, categoryPath(c))}
                key={c.id}
              >
                <span className="sb-cat-head">
                  <span>
                    {c.name}
                    {p.showCount === "yes" ? (
                      <em className="sb-cat-count"> ({countOf(c.id)})</em>
                    ) : null}
                  </span>
                  <svg
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="3.2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 17 17 7M9 6h9v9" />
                  </svg>
                </span>
                {p.images[i]?.src ? <Img src={p.images[i]?.src} /> : null}
                {p.images[i]?.text ? (
                  <small className="sb-cat-text">{p.images[i]?.text}</small>
                ) : null}
              </a>
            ))}
          </div>
          <div className="sb-align-center">
            <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
        </section>
      );
    },
    type: "categoryGrid",
  }
);

const stats = defineBlock(
  z.object({
    backgroundImage: str(),
    items: z
      .array(z.object({ label: str(), suffix: str(), value: str() }))
      .default([]),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "backgroundImage", kind: "image", label: "Imagem de fundo" },
      {
        itemFields: [
          { key: "value", kind: "text", label: "Número" },
          { key: "suffix", kind: "text", label: "Sufixo (+, %)" },
          { key: "label", kind: "text", label: "Legenda" },
        ],
        key: "items",
        kind: "list",
        label: "Números",
      },
    ],
    group: "content",
    label: "Contadores",
    render: p => (
      <section className="sb-container sb-align-center sb-stats-wrap">
        {p.backgroundImage ? <Img alt="" src={p.backgroundImage} /> : null}
        {p.title ? <h2>{p.title}</h2> : null}
        <div className="sb-stats">
          {p.items.map(i => (
            <div key={i.label + i.value}>
              <strong>
                {i.value}
                <small>{i.suffix}</small>
              </strong>
              <span>{i.label}</span>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "stats",
  }
);

const cardGrid = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str(),
    cards: z
      .array(
        z.object({ image: str(), tag: str(), title: str(), url: str("#") })
      )
      .default([]),
    title: str("Ferramentas & Soluções"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      ...linkFields("Botão do título"),
      {
        itemFields: [
          { key: "tag", kind: "text", label: "Etiqueta" },
          { key: "title", kind: "text", label: "Título" },
          { key: "image", kind: "image", label: "Imagem" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "cards",
        kind: "list",
        label: "Cards (o primeiro vira destaque largo)",
      },
    ],
    group: "content",
    label: "Cards de destaque",
    render: (p, ctx) => {
      const [first, ...rest] = p.cards;
      return (
        <section className="sb-container">
          <div className="sb-row-between">
            <h2>{p.title}</h2>
            <LinkButton
              ctx={ctx}
              label={p.buttonLabel}
              size="lg"
              url={p.buttonUrl}
            />
          </div>
          {first ? (
            <a className="sb-card sb-feature" href={href(ctx, first.url)}>
              <Img src={first.image} />
              <div>
                {first.tag ? <span className="sb-tag">{first.tag}</span> : null}
                <h3>{first.title}</h3>
              </div>
            </a>
          ) : null}
          <div className="sb-grid sb-grid-3">
            {rest.map(c => (
              <a
                className="sb-card sb-feature sb-feature-tall"
                href={href(ctx, c.url)}
                key={c.title}
              >
                <Img src={c.image} />
                <div>
                  {c.tag ? <span className="sb-tag">{c.tag}</span> : null}
                  <h3>{c.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      );
    },
    type: "cardGrid",
  }
);

const featuredPost = defineBlock(
  z.object({
    backgroundImage: str(),
    backgroundImage2: str(),
    backgroundImage3: str(),
    buttonLabel: str("Ver Mais"),
    label: str("Melhor Post"),
    postSlug: str(),
    showImage: z.enum(["yes", "no"]).default("yes"),
    sideImage: str(),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Rótulo" },
      {
        key: "backgroundImage",
        kind: "image",
        label: "Ondas ao fundo (camada 1)",
      },
      {
        key: "backgroundImage3",
        kind: "image",
        label: "Ondas ao fundo (camada 2)",
      },
      {
        key: "backgroundImage2",
        kind: "image",
        label: "Ondas ao fundo (camada 3, na frente)",
      },
      { key: "sideImage", kind: "image", label: "Imagem decorativa ao lado" },
      {
        key: "postSlug",
        kind: "text",
        label: "Slug do post (vazio = mais recente)",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      {
        key: "showImage",
        kind: "select",
        label: "Mostrar a imagem do post",
        options: SHOW_OPTIONS,
      },
    ],
    group: "blog",
    label: "Post em destaque",
    render: (p, ctx) => {
      const posts = visiblePosts(ctx.site, ctx.mode);
      const post = posts.find(x => x.slug === p.postSlug) ?? posts[0];
      if (!post) return null;
      return (
        <section
          className={
            p.showImage === "yes"
              ? "sb-featured-wrap"
              : "sb-featured-wrap sb-featured-text"
          }
        >
          {p.backgroundImage ? (
            <Img alt="" className="w1" src={p.backgroundImage} />
          ) : null}
          {p.backgroundImage3 ? (
            <Img alt="" className="w3" src={p.backgroundImage3} />
          ) : null}
          {p.backgroundImage2 ? (
            <Img alt="" className="w2" src={p.backgroundImage2} />
          ) : null}
          <div className="sb-container sb-featured-inner">
            {p.sideImage ? <Img alt="" src={p.sideImage} /> : null}
            <div className="sb-card sb-featured-post">
              {p.label ? (
                <h3>
                  {p.label}
                  <i />
                </h3>
              ) : null}
              {p.showImage === "yes" ? <Img src={post.coverImage} /> : null}
              <p>{post.title}</p>
              <LinkButton
                ctx={ctx}
                label={p.buttonLabel}
                url={postPath(post)}
                variant="light"
              />
            </div>
          </div>
        </section>
      );
    },
    type: "featuredPost",
  }
);

const testimonials = defineBlock(
  z.object({
    items: z
      .array(
        z.object({ avatar: str(), name: str(), quote: str(), role: str() })
      )
      .default([]),
    subtitle: str(),
    title: str("O que dizem sobre nós"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          { key: "quote", kind: "textarea", label: "Depoimento" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
          { key: "avatar", kind: "image", label: "Foto" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
    ],
    group: "content",
    label: "Depoimentos",
    render: p => (
      <section className="sb-container">
        <div className="sb-align-center">
          <h2>{p.title}</h2>
          {p.subtitle ? <p className="sb-sub">{p.subtitle}</p> : null}
        </div>
        <div className="sb-grid sb-grid-3">
          {p.items.map(t => (
            <figure className="sb-card sb-testimonial" key={t.name + t.quote}>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <Img className="sb-avatar" src={t.avatar} />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    ),
    type: "testimonials",
  }
);

const splitSection = defineBlock(
  z.object({
    buttonLabel: str("Ver Mais →"),
    buttonUrl: str("#"),
    decoration: str(),
    image: str(),
    text: str(),
    title: str("Título da seção"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "image", kind: "image", label: "Imagem" },
      {
        key: "decoration",
        kind: "image",
        label: "Imagem decorativa (opcional)",
      },
      ...linkFields(),
    ],
    group: "content",
    label: "Texto + imagem",
    render: (p, ctx) => (
      <section className="sb-container sb-split">
        {p.decoration ? (
          <Img alt="" className="sb-split-deco" src={p.decoration} />
        ) : null}
        <div>
          <h2>{p.title}</h2>
          <p>{p.text}</p>
          <LinkButton
            ctx={ctx}
            label={p.buttonLabel}
            size="lg"
            url={p.buttonUrl}
          />
        </div>
        <Img src={p.image} />
      </section>
    ),
    type: "splitSection",
  }
);

function filterPosts(
  posts: ReturnType<typeof visiblePosts>,
  query: Record<string, string>,
  categoryId?: string
) {
  const q = (query.q ?? "").trim().toLowerCase();
  return posts.filter(
    p =>
      (!categoryId || p.categoryId === categoryId) &&
      (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q))
  );
}

const CAROUSEL_JS = `(function(){document.querySelectorAll('.sb-mag-main').forEach(function(box){if(box.dataset.ready)return;box.dataset.ready='1';var t=box.querySelector('.sb-mag-track'),d=box.querySelectorAll('.sb-mag-dots button');if(!t||d.length<2)return;function cur(){return Math.round(t.scrollLeft/t.clientWidth)}function mark(){var i=cur();d.forEach(function(b,j){b.className=j===i?'on':''})}function go(i){t.scrollTo({left:i*t.clientWidth,behavior:'smooth'})}d.forEach(function(b,j){b.onclick=function(){go(j)}});t.addEventListener('scroll',mark,{passive:true});mark();setInterval(function(){if(box.matches(':hover'))return;go((cur()+1)%d.length)},5000)})})();`;

const postExplorer = defineBlock(
  z.object({
    layout: z.enum(["grid", "magazine"]).default("grid"),
    limit: z.coerce.number().default(6),
    title: str("Todos os conteúdos"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "layout",
        kind: "select",
        label: "Aparência",
        options: [
          { label: "Grade de cards", value: "grid" },
          { label: "Destaque + lista", value: "magazine" },
        ],
      },
      { key: "limit", kind: "number", label: "Quantidade de posts" },
    ],
    group: "blog",
    label: "Busca + lista de posts",
    render: (p, ctx) => {
      const cat = ctx.site.categories.find(c => c.slug === ctx.query.category);
      const posts = filterPosts(
        visiblePosts(ctx.site, ctx.mode),
        ctx.query,
        cat?.id
      ).slice(0, p.limit);
      if (p.layout === "magazine") {
        const slides = posts.slice(0, 3);
        const side = posts.slice(3, 6);
        const catName = (post: (typeof posts)[number]) =>
          categoryOf(ctx.site, post)?.name ?? "";
        return (
          // biome-ignore lint/correctness/useUniqueElementIds: âncora fixa (#conteudos) usada pelo botão do hero
          <section className="sb-container" id="conteudos">
            <h2 className="sb-align-center">{p.title}</h2>
            <form
              action={href(ctx, "/pesquisa/")}
              className="sb-mag"
              method="get"
            >
              <div className="sb-mag-search">
                <input
                  defaultValue={ctx.query.q ?? ""}
                  name="q"
                  placeholder="Digite aqui..."
                  type="search"
                />
                <button className="sb-btn sb-btn-primary" type="submit">
                  Pesquisar
                </button>
              </div>
              <div className="sb-mag-cats">
                <strong>Categorias</strong>
                <select defaultValue={ctx.query.category ?? ""} name="category">
                  <option value="">Selecionar categoria</option>
                  {ctx.site.categories.map(c => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {slides.length ? (
                <div className="sb-mag-main">
                  <div className="sb-mag-track">
                    {slides.map(post => (
                      <a
                        className="sb-mag-slide"
                        href={href(ctx, postPath(post))}
                        key={post.id}
                      >
                        <Img alt={post.title} src={post.coverImage} />
                        <small>{catName(post)}</small>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                      </a>
                    ))}
                  </div>
                  {slides.length > 1 ? (
                    <div className="sb-mag-dots">
                      {slides.map((post, i) => (
                        <button
                          aria-label={`Notícia ${i + 1}`}
                          className={i === 0 ? "on" : ""}
                          key={post.id}
                          type="button"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="sb-mag-side">
                {side.slice(0, 3).map(post => (
                  <a href={href(ctx, postPath(post))} key={post.id}>
                    <Img alt={post.title} src={post.coverImage} />
                    <span>
                      <h3>{post.title}</h3>
                      <em>Ver mais »</em>
                    </span>
                  </a>
                ))}
              </div>
            </form>
            {posts.length === 0 ? (
              <p className="sb-align-center">Nenhum conteúdo encontrado.</p>
            ) : null}
            {/* Pontos e troca automática do carrossel; script fixo, sem conteúdo do usuário. */}
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: script constante */}
            <script dangerouslySetInnerHTML={{ __html: CAROUSEL_JS }} />
          </section>
        );
      }
      return (
        // biome-ignore lint/correctness/useUniqueElementIds: âncora fixa (#conteudos) usada pelo botão do hero
        <section className="sb-container" id="conteudos">
          <h2 className="sb-align-center">{p.title}</h2>
          <form
            action={href(ctx, "/pesquisa/")}
            className="sb-filter"
            method="get"
          >
            <input
              defaultValue={ctx.query.q ?? ""}
              name="q"
              placeholder="Digite aqui..."
              type="search"
            />
            <select defaultValue={ctx.query.category ?? ""} name="category">
              <option value="">Selecionar categoria</option>
              {ctx.site.categories.map(c => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button className="sb-btn sb-btn-primary" type="submit">
              Pesquisar
            </button>
          </form>
          <div className="sb-grid sb-grid-3" data-repeat-list="">
            {posts.map(post => (
              <PostCard ctx={ctx} key={post.id} post={post} />
            ))}
          </div>
          {posts.length === 0 ? (
            <p className="sb-align-center">Nenhum conteúdo encontrado.</p>
          ) : null}
        </section>
      );
    },
    type: "postExplorer",
  }
);

const postList = defineBlock(
  z.object({
    buttonLabel: str("Acessar"),
    cardStyle: z
      .enum(["compact", "excerpt", "grid", "archive", "product"])
      .default("compact"),
    emptyText: str(),
    includeCurrent: z.enum(["yes", "no"]).default("no"),
    limit: z.coerce.number().default(6),
    nextLabel: str("Próxima »"),
    nextUrl: str(),
    offset: z.coerce.number().default(0),
    prevLabel: str("« Anterior"),
    prevUrl: str(),
    title: str("Mais conteúdos como esse:"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "limit", kind: "number", label: "Quantidade" },
      {
        key: "offset",
        kind: "number",
        label: "Pular os primeiros (paginação)",
      },
      { key: "prevUrl", kind: "url", label: "Link da página anterior" },
      { key: "prevLabel", kind: "text", label: "Texto do botão anterior" },
      { key: "nextUrl", kind: "url", label: "Link da próxima página" },
      { key: "nextLabel", kind: "text", label: "Texto do botão próxima" },
      {
        key: "emptyText",
        kind: "text",
        label: "Mensagem quando não há resultados (vazio = nada)",
      },
      {
        key: "cardStyle",
        kind: "select",
        label: "Estilo do card",
        options: [
          { label: "Imagem + categoria + título", value: "compact" },
          { label: "Imagem + título + resumo + botão", value: "excerpt" },
          {
            label: "Grade: imagem, título, categoria e resumo (tema Central)",
            value: "grid",
          },
          {
            label:
              "Arquivo: imagem com etiqueta, título, resumo e Ler mais (tema Central)",
            value: "archive",
          },
          {
            label: "Produto: imagem, título e link opcional (tema Marketplace)",
            value: "product",
          },
        ],
      },
      {
        key: "buttonLabel",
        kind: "text",
        label:
          "Texto do botão (estilo com resumo) / do link do produto (vazio = sem link)",
      },
      {
        key: "includeCurrent",
        kind: "select",
        label: "Incluir o post aberto na lista",
        options: SHOW_OPTIONS,
      },
    ],
    group: "blog",
    label: "Lista de posts (relacionados / categoria)",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode).filter(
        x => p.includeCurrent === "yes" || x.id !== ctx.current.post?.id
      );
      // Na página de pesquisa o filtro de categoria vem do select (?category=).
      const queryCategory = ctx.site.categories.find(
        c => c.slug === ctx.query.category
      );
      const posts = filterPosts(
        all,
        ctx.query,
        ctx.current.category?.id ?? queryCategory?.id
      ).slice(p.offset, p.offset + p.limit);
      return (
        <section className="sb-container">
          {p.title ? <h2>{p.title}</h2> : null}
          {posts.length === 0 && p.emptyText ? (
            <p className="sb-align-center sb-empty">{p.emptyText}</p>
          ) : null}
          <div
            className={
              p.cardStyle === "excerpt"
                ? "sb-grid sb-grid-3 sb-related"
                : "sb-grid sb-grid-3"
            }
            data-repeat-list=""
          >
            {posts.map(post =>
              p.cardStyle === "excerpt" ? (
                <ExcerptCard
                  buttonLabel={p.buttonLabel}
                  ctx={ctx}
                  key={post.id}
                  post={post}
                />
              ) : p.cardStyle === "grid" ||
                p.cardStyle === "archive" ||
                p.cardStyle === "product" ? (
                <PostCard
                  ctx={ctx}
                  key={post.id}
                  moreLabel={p.buttonLabel}
                  post={post}
                  variant={p.cardStyle}
                />
              ) : (
                <PostCard compact ctx={ctx} key={post.id} post={post} />
              )
            )}
          </div>
          {p.prevUrl || p.nextUrl ? (
            <nav className="sb-pager">
              {p.prevUrl ? (
                <a
                  className="sb-btn sb-btn-primary"
                  href={href(ctx, p.prevUrl)}
                >
                  {p.prevLabel}
                </a>
              ) : null}
              {p.nextUrl ? (
                <a
                  className="sb-btn sb-btn-primary"
                  href={href(ctx, p.nextUrl)}
                >
                  {p.nextLabel}
                </a>
              ) : null}
            </nav>
          ) : null}
        </section>
      );
    },
    type: "postList",
  }
);

const shortDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
        year: "numeric",
      })
    : "";

const newsFront = defineBlock(
  z.object({
    leadImage: str(),
    relatedCount: z.coerce.number().default(3),
  }),
  {
    fields: [
      {
        key: "leadImage",
        kind: "image",
        label: "Imagem de fundo do destaque (opcional)",
      },
      {
        key: "relatedCount",
        kind: "number",
        label: "Links relacionados na manchete",
      },
    ],
    group: "blog",
    label: "Manchete (destaque + 2 fotos)",
    render: (p, ctx) => {
      const [lead, ...rest] = visiblePosts(ctx.site, ctx.mode);
      if (!lead) return null;
      const photos = rest.slice(0, 2);
      const related = rest.slice(2, 2 + p.relatedCount);
      const kicker = (post: typeof lead) =>
        categoryOf(ctx.site, post)?.name ?? "";
      return (
        <section className="sb-container sb-news-front">
          <div
            className={
              p.leadImage ? "sb-news-lead sb-news-lead-img" : "sb-news-lead"
            }
          >
            {p.leadImage ? <Img alt="" src={p.leadImage} /> : null}
            <span className="sb-news-kicker">{kicker(lead)}</span>
            <a className="sb-news-lead-title" href={href(ctx, postPath(lead))}>
              {lead.title}
            </a>
            {related.length ? (
              <ul>
                {related.map(post => (
                  <li key={post.id}>
                    <a href={href(ctx, postPath(post))}>{post.title}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="sb-news-photos">
            {photos.map(post => (
              <a
                className="sb-news-photo"
                href={href(ctx, postPath(post))}
                key={post.id}
              >
                <Img alt="" src={post.coverImage} />
                <span className="sb-news-kicker">{kicker(post)}</span>
                <strong>{post.title}</strong>
              </a>
            ))}
          </div>
        </section>
      );
    },
    type: "newsFront",
  }
);

const newsFeed = defineBlock(
  z.object({
    adItems: adItemsSchema,
    adLink: str(),
    adSeconds: z.coerce.number().min(2).max(60).default(6).catch(6),
    fromCategory: z.enum(["yes", "no"]).default("no"),
    limit: z.coerce.number().default(8),
    moreLabel: str(),
    moreUrl: str("#"),
    popularTitle: str("Mais lidas"),
    showSide: z.enum(["yes", "no"]).default("yes"),
    skip: z.coerce.number().default(5),
  }),
  {
    fields: [
      {
        key: "fromCategory",
        kind: "select",
        label: "Mostrar só a categoria da página (layout de categoria)",
        options: SHOW_OPTIONS,
      },
      { key: "skip", kind: "number", label: "Pular as primeiras notícias" },
      { key: "limit", kind: "number", label: "Quantidade de notícias" },
      {
        key: "showSide",
        kind: "select",
        label: "Mostrar coluna lateral",
        options: SHOW_OPTIONS,
      },
      { key: "popularTitle", kind: "text", label: "Título da coluna lateral" },
      {
        itemFields: adItemFields,
        key: "adItems",
        kind: "list",
        label:
          "Anúncio abaixo da coluna lateral (imagens/vídeos; só com Anúncios ligados)",
      },
      { key: "adLink", kind: "url", label: "Anúncio lateral — link" },
      {
        key: "adSeconds",
        kind: "number",
        label: "Anúncio lateral — segundos por imagem",
      },
      {
        key: "moreLabel",
        kind: "text",
        label: "Botão do fim da lista — texto",
      },
      { key: "moreUrl", kind: "url", label: "Botão do fim da lista — link" },
    ],
    group: "blog",
    label: "Feed de notícias + mais lidas",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode).filter(
        x =>
          p.fromCategory !== "yes" ||
          !ctx.current.category ||
          x.categoryId === ctx.current.category.id
      );
      const feed = all.slice(p.skip, p.skip + p.limit);
      // Com botão no fim, o resto da lista já vem no HTML, escondido, e o botão revela aos poucos.
      const extra = p.moreLabel ? all.slice(p.skip + p.limit) : [];
      const popular = all.slice(0, 5);
      if (feed.length === 0) return null;
      return (
        <section className="sb-container sb-news-feedwrap">
          <div className="sb-news-feed" data-repeat-list="">
            {[...feed, ...extra].map((post, i) => {
              const cat = categoryOf(ctx.site, post);
              return (
                <article
                  className="sb-news-row"
                  hidden={i >= feed.length}
                  key={post.id}
                >
                  <a
                    className="sb-news-row-img"
                    href={href(ctx, postPath(post))}
                  >
                    <Img alt={post.title} src={post.coverImage} />
                  </a>
                  <div>
                    {cat ? (
                      <span className="sb-news-kicker">{cat.name}</span>
                    ) : null}
                    <h3>
                      <a href={href(ctx, postPath(post))}>{post.title}</a>
                    </h3>
                    <p>{post.excerpt}</p>
                    <time>
                      {shortDate(post.publishedAt)}
                      {cat ? ` — Em ${cat.name}` : ""}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
          {p.showSide === "yes" ? (
            <div className="sb-news-sidecol">
              <aside className="sb-news-side">
                <h4>{p.popularTitle}</h4>
                <ol>
                  {popular.map(post => (
                    <li key={post.id}>
                      <a href={href(ctx, postPath(post))}>{post.title}</a>
                    </li>
                  ))}
                </ol>
              </aside>
              <AdBox
                ctx={ctx}
                items={p.adItems}
                label="Publicidade"
                link={p.adLink}
                seconds={p.adSeconds}
                size="side"
              />
            </div>
          ) : null}
          {p.moreLabel && extra.length > 0 ? (
            <button
              className="sb-news-more"
              data-step={Math.max(1, p.limit)}
              type="button"
            >
              {p.moreLabel}
            </button>
          ) : p.moreLabel ? (
            <a className="sb-news-more" href={href(ctx, p.moreUrl)}>
              {p.moreLabel}
            </a>
          ) : null}
        </section>
      );
    },
    type: "newsFeed",
  }
);

const newsSection = defineBlock(
  z.object({
    categorySlug: str(),
    limit: z.coerce.number().default(4),
    title: str("Mais notícias"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da editoria" },
      {
        key: "categorySlug",
        kind: "text",
        label: "Slug da categoria (vazio = todas)",
      },
      { key: "limit", kind: "number", label: "Quantidade de notícias" },
    ],
    group: "blog",
    label: "Editoria (título + notícias)",
    render: (p, ctx) => {
      const cat = ctx.site.categories.find(c => c.slug === p.categorySlug);
      const posts = visiblePosts(ctx.site, ctx.mode)
        .filter(x => !cat || x.categoryId === cat.id)
        .slice(0, p.limit);
      if (posts.length === 0) return null;
      return (
        <section className="sb-container sb-news-section">
          <h2 className="sb-news-title">
            <a href={cat ? href(ctx, categoryPath(cat)) : "#"}>{p.title}</a>
          </h2>
          <div className="sb-news-cards" data-repeat-list="">
            {posts.map(post => (
              <a
                className="sb-news-card"
                href={href(ctx, postPath(post))}
                key={post.id}
              >
                <Img alt={post.title} src={post.coverImage} />
                <span className="sb-news-kicker">
                  {categoryOf(ctx.site, post)?.name ?? ""}
                </span>
                <h3>{post.title}</h3>
                <time>{shortDate(post.publishedAt)}</time>
              </a>
            ))}
          </div>
        </section>
      );
    },
    type: "newsSection",
  }
);

const shortVideos = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          duration: str("1 min"),
          image: str(),
          title: str(),
          url: str("#"),
          video: str(),
        })
      )
      .default([]),
    title: str("Vídeos curtos"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem (vertical)" },
          { key: "title", kind: "text", label: "Título" },
          { key: "duration", kind: "text", label: "Duração (ex.: 1 min)" },
          { key: "url", kind: "url", label: "Link (se não houver vídeo)" },
          {
            key: "video",
            kind: "url",
            label: "Vídeo do YouTube (abre no centro da tela)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Vídeos",
      },
    ],
    group: "media",
    label: "Vídeos curtos (carrossel vertical)",
    render: (p, ctx) => {
      if (p.items.length === 0) return null;
      return (
        <section className="sb-container sb-shorts">
          <div className="sb-shorts-head">
            <h2>{p.title}</h2>
            <div className="sb-shorts-nav">
              <button aria-label="Anterior" type="button">
                ‹
              </button>
              <button aria-label="Próximo" type="button">
                ›
              </button>
            </div>
          </div>
          <div className="sb-shorts-track">
            {p.items.map(item => (
              <a
                className="sb-short"
                data-reel={videoEmbed(item.video) ?? ""}
                data-title={item.title}
                href={href(ctx, item.url)}
                key={item.title + item.url}
              >
                <Img alt="" src={item.image} />
                <span className="sb-short-time">{item.duration}</span>
                <span aria-hidden="true" className="sb-short-play" />
                <strong>{item.title}</strong>
              </a>
            ))}
          </div>
        </section>
      );
    },
    type: "shortVideos",
  }
);

const categorySearch = defineBlock(
  z.object({
    buttonLabel: str("Pesquisar"),
    categoriesLabel: str("Categorias"),
    layout: z.enum(["wide", "compact"]).default("wide").catch("wide"),
    placeholder: str("Digite aqui..."),
    selectLabel: str("Selecionar categoria"),
  }),
  {
    fields: [
      {
        key: "layout",
        kind: "select",
        label: "Disposição",
        options: [
          { label: "Busca larga, categorias ao lado", value: "wide" },
          {
            label: "Busca compacta à esquerda, categorias à direita",
            value: "compact",
          },
        ],
      },
      { key: "placeholder", kind: "text", label: "Texto do campo de busca" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "categoriesLabel", kind: "text", label: "Título das categorias" },
      {
        key: "selectLabel",
        kind: "text",
        label: "Texto do seletor de categoria",
      },
    ],
    group: "blog",
    label: "Busca da categoria",
    render: (p, ctx) => (
      <form
        action={href(ctx, "/pesquisa/")}
        className={catSearchClass(p.layout)}
        method="get"
      >
        <div className="sb-mag-search">
          <input
            defaultValue={ctx.query.q ?? ""}
            name="q"
            placeholder={p.placeholder}
            type="search"
          />
          <button className="sb-btn sb-btn-primary" type="submit">
            {p.buttonLabel}
          </button>
        </div>
        <div className="sb-mag-cats">
          <strong>{p.categoriesLabel}</strong>
          <select
            defaultValue={ctx.current.category?.slug ?? ""}
            name="category"
          >
            <option value="">{p.selectLabel}</option>
            {ctx.site.categories.map(c => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    ),
    type: "categorySearch",
  }
);

const categoryHeader = defineBlock(
  z.object({
    backLabel: str("Voltar"),
    backUrl: str("/categorias/"),
    title: str(),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título (vazio = nome da categoria)",
      },
      { key: "backLabel", kind: "text", label: "Texto do voltar" },
      { key: "backUrl", kind: "url", label: "Link do voltar" },
    ],
    group: "blog",
    label: "Cabeçalho de categoria",
    render: (p, ctx) => (
      <div className="sb-container sb-cat-header">
        <h1>{p.title || ctx.current.category?.name || "Categoria"}</h1>
        <a className="sb-btn sb-btn-primary" href={href(ctx, p.backUrl)}>
          {p.backLabel}
        </a>
      </div>
    ),
    type: "categoryHeader",
  }
);

const postHeader = defineBlock(
  z.object({
    backgroundImage: str(),
    showCover: z.enum(["yes", "no"]).default("yes"),
    watermark: str(),
  }),
  {
    fields: [
      {
        key: "backgroundImage",
        kind: "image",
        label: "Imagem de fundo do título (tema Central)",
      },
      { key: "watermark", kind: "text", label: "Texto grande ao fundo" },
      {
        key: "showCover",
        kind: "select",
        label: "Mostrar imagem, categoria e data aqui",
        options: SHOW_OPTIONS,
      },
    ],
    group: "blog",
    label: "Cabeçalho do post",
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      return (
        <div
          className="sb-container sb-post-header sb-heading"
          style={
            p.backgroundImage
              ? ({ "--ct-img": cssUrl(p.backgroundImage) } as CSSProperties)
              : undefined
          }
        >
          {p.watermark ? (
            <span aria-hidden="true" className="sb-watermark">
              {p.watermark}
            </span>
          ) : null}
          <h1>{post.title}</h1>
          {p.showCover === "yes" ? <PostMeta ctx={ctx} /> : null}
        </div>
      );
    },
    type: "postHeader",
  }
);

function PostMeta({ ctx }: { ctx: RenderContext }) {
  const post = ctx.current.post;
  if (!post) return null;
  const cat = categoryOf(ctx.site, post);
  const variant = ctx.site.theme.variant;
  return (
    <>
      <Img src={post.coverImage} />
      {cat ? <span className="sb-tag">{cat.name}</span> : null}
      {variant === "central" ? (
        <h2 className="sb-ct-post-title">{post.title}</h2>
      ) : null}
      <time>
        {variant === "spyhacker" || variant === "central"
          ? wpDate(post.publishedAt)
          : formatDate(post.publishedAt)}
      </time>
    </>
  );
}

const postContent = defineBlock(
  z.object({ showMeta: z.enum(["yes", "no"]).default("no") }),
  {
    fields: [
      {
        key: "showMeta",
        kind: "select",
        label: "Mostrar imagem, categoria e data antes do texto",
        options: SHOW_OPTIONS,
      },
    ],
    group: "blog",
    label: "Conteúdo do post",
    render: (p, ctx) => (
      <div className="sb-post-content">
        {p.showMeta === "yes" ? (
          <div className="sb-post-meta">
            <PostMeta ctx={ctx} />
          </div>
        ) : null}
        {ctx.current.post ? ctx.renderBlocks(ctx.current.post.blocks) : null}
      </div>
    ),
    type: "postContent",
  }
);

const sidebarBanner = defineBlock(
  z.object({
    buttonLabel: str("Pesquisar"),
    categoriesTitle: str("Categorias"),
    image: str(),
    placeholder: str("Digite aqui..."),
    selectLabel: str("Selecionar categoria"),
    url: str("#"),
  }),
  {
    fields: [
      { key: "placeholder", kind: "text", label: "Texto do campo de busca" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "categoriesTitle", kind: "text", label: "Título das categorias" },
      {
        key: "selectLabel",
        kind: "text",
        label: "Texto do seletor de categoria",
      },
      { key: "image", kind: "image", label: "Banner" },
      { key: "url", kind: "url", label: "Link" },
    ],
    group: "blog",
    label: "Barra lateral (busca + categorias + banner)",
    render: (p, ctx) => (
      <aside className="sb-sidebar">
        <form
          action={href(ctx, "/pesquisa/")}
          className="sb-filter"
          method="get"
        >
          <input name="q" placeholder={p.placeholder} type="search" />
          <button className="sb-btn sb-btn-primary" type="submit">
            {p.buttonLabel}
          </button>
        </form>
        <h4>{p.categoriesTitle}</h4>
        <form action={href(ctx, "/pesquisa/")} method="get">
          <select className="sb-select" name="category">
            <option value="">{p.selectLabel}</option>
            {ctx.site.categories.map(c => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </form>
        {p.image ? (
          <a href={safeUrl(p.url)}>
            <Img src={p.image} />
          </a>
        ) : null}
      </aside>
    ),
    type: "sidebarBanner",
  }
);

const SHARE_NETWORKS = ["facebook", "twitter", "linkedin"] as const;

const postShare = defineBlock(
  z.object({ label: str("Compartilhar este Post:") }),
  {
    fields: [{ key: "label", kind: "text", label: "Texto" }],
    group: "blog",
    label: "Compartilhar post",
    // O link de cada rede é montado no clique (`nav-runtime`), com o endereço da página aberta.
    render: (p, ctx) =>
      ctx.current.post ? (
        <div className="sb-container sb-share">
          {p.label ? <span>{p.label}</span> : null}
          <div>
            {SHARE_NETWORKS.map(n => (
              <button
                aria-label={`Compartilhar no ${n === "twitter" ? "X" : n}`}
                data-share={n}
                key={n}
                type="button"
              >
                <ShareIcon network={n} />
              </button>
            ))}
          </div>
        </div>
      ) : null,
    type: "postShare",
  }
);

function ShareIcon({ network }: { network: (typeof SHARE_NETWORKS)[number] }) {
  if (network === "linkedin")
    return (
      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 448 512">
        <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
      </svg>
    );
  if (network === "twitter")
    return (
      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 512 512">
        <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
      </svg>
    );
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 512 512">
      <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
    </svg>
  );
}

const postNav = defineBlock(
  z.object({ nextLabel: str("Próximo"), prevLabel: str("Anterior") }),
  {
    fields: [
      { key: "prevLabel", kind: "text", label: "Texto do anterior" },
      { key: "nextLabel", kind: "text", label: "Texto do próximo" },
    ],
    group: "blog",
    label: "Post anterior / próximo",
    // Anterior = o post publicado logo antes deste; próximo = o logo depois.
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      const posts = visiblePosts(ctx.site, ctx.mode);
      const i = posts.findIndex(x => x.id === post.id);
      const prev = i >= 0 ? posts[i + 1] : undefined;
      const next = i > 0 ? posts[i - 1] : undefined;
      return (
        <nav className="sb-container sb-post-nav">
          {prev ? (
            <a className="sb-post-nav-prev" href={href(ctx, postPath(prev))}>
              <i aria-hidden="true">←</i>
              <span>
                <small>{p.prevLabel}</small>
                <b>{prev.title}</b>
              </span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a className="sb-post-nav-next" href={href(ctx, postPath(next))}>
              <span>
                <small>{p.nextLabel}</small>
                <b>{next.title}</b>
              </span>
              <i aria-hidden="true">→</i>
            </a>
          ) : null}
        </nav>
      );
    },
    type: "postNav",
  }
);

/** Contêiner de duas colunas: filho 0 = principal, filho 1 = lateral. */
const twoColumns = defineBlock(z.object({}), {
  fields: [],
  group: "layout",
  label: "Duas colunas",
  render: (_p, _ctx, children) => (
    <div className="sb-container sb-two-cols">
      <div className="sb-col-main">{children[0]}</div>
      <div className="sb-col-side">{children[1]}</div>
    </div>
  ),
  type: "twoColumns",
});

const linkCards = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), name: str(), url: str("#") }))
      .default([]),
    title: str("Nossos blogs"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome" },
          { key: "url", kind: "url", label: "Link" },
          { key: "image", kind: "image", label: "Imagem" },
        ],
        key: "items",
        kind: "list",
        label: "Itens",
      },
    ],
    group: "content",
    label: "Cards de links externos",
    render: p => (
      <section className="sb-container">
        {p.title ? <h2>{p.title}</h2> : null}
        <div className="sb-link-cards">
          {p.items.map(i => (
            <a
              className="sb-card sb-link-card"
              href={safeUrl(i.url)}
              key={i.name}
            >
              <Img src={i.image} />
              <span className="sb-cat-head">
                <span>{i.name}</span>
                <b aria-hidden="true">↗</b>
              </span>
            </a>
          ))}
        </div>
      </section>
    ),
    type: "linkCards",
  }
);

const socialIcons = defineBlock(
  z.object({
    items: z.array(z.object({ label: str(), url: str("#") })).default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          {
            key: "label",
            kind: "text",
            label: "Rede (Instagram, YouTube, X…)",
          },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Redes",
      },
    ],
    group: "content",
    label: "Ícones de redes sociais",
    render: p => (
      <div className="sb-container sb-social-row">
        {p.items.map(i => (
          <a
            aria-label={i.label}
            href={safeUrl(i.url)}
            key={i.label + i.url}
            title={i.label}
          >
            <SocialIcon label={i.label} />
          </a>
        ))}
      </div>
    ),
    type: "socialIcons",
  }
);

export const blockDefinitions: BlockDefinition[] = [
  socialIcons,
  header,
  footer,
  whatsappFloat,
  hero,
  heading,
  text,
  image,
  button,
  videoGrid,
  channelVideos,
  categoryGrid,
  stats,
  cardGrid,
  featuredPost,
  testimonials,
  splitSection,
  postExplorer,
  postList,
  newsFront,
  newsFeed,
  shortVideos,
  ...portalHubBlocks,
  ...centralBlocks,
  ...marketplaceBlocks,
  ...patrimonialBlocks,
  ...areaflixBlocks,
  ...adBlocks,
  newsSection,
  categoryHeader,
  categorySearch,
  postHeader,
  postContent,
  postShare,
  postNav,
  sidebarBanner,
  twoColumns,
  linkCards,
];
