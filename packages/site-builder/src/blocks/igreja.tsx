import { z } from "zod";
import { defineBlock } from "./define.js";
import { newTab, safeUrl } from "./helpers.js";
import {
  churchName,
  flag,
  HeadphonesIcon,
  hasStores,
  href,
  Img,
  isHome,
  MailIcon,
  mailTo,
  mapsLink,
  PinIcon,
  PodcastIcon,
  StarIcon,
  Stores,
  slugOf,
  splitList,
  str,
  telTo,
  th,
  VideoThumb,
  YES_NO,
} from "./igreja-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";

/**
 * Blocos globais do template "Comunidade Viva — Igreja" (`cv*`): topo com hambúrguer + gaveta (`cvNav`, no cabeçalho do
 * site), hero com foto em recorte diagonal (`cvHero`, só na home), "Explore mais conteúdo" (`cvExplore`), banner
 * institucional (`cvBanner`) e rodapé (`cvFooter`). As configurações globais (nome, vídeo, podcast, app, contatos,
 * endereço) vêm de `site.theme` (ver `VARIANT_TOKENS.igreja`). As páginas internas ficam em `igreja-pages.tsx`.
 */

/** Junta classes ignorando as falsas. */
const cls = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

const LINKS = z
  .array(z.object({ label: str(), url: str() }))
  .default([])
  .catch([]);

const LINK_FIELDS: FieldDef[] = [
  { key: "label", kind: "text", label: "Texto" },
  { key: "url", kind: "url", label: "Link" },
];

const isCurrent = (ctx: RenderContext, url: string) =>
  !url.startsWith("#") &&
  url !== "" &&
  url.replace(/^\/+|\/+$/g, "") === slugOf(ctx);

/* ───────────────────────── topo: barra + gaveta ───────────────────────── */

const cvNav = defineBlock(
  z.object({
    icon: str(),
    shortcuts: str("Agenda, Células"),
    socials: LINKS,
    socialsLabel: str("Redes sociais"),
  }),
  {
    fields: [
      { key: "icon", kind: "image", label: "Logo-ícone (~52px de largura)" },
      {
        key: "shortcuts",
        kind: "text",
        label:
          "Atalhos ao lado do hambúrguer (nomes dos itens do menu, separados por vírgula)",
      },
      { key: "socialsLabel", kind: "text", label: "Título das redes sociais" },
      {
        itemFields: LINK_FIELDS,
        key: "socials",
        kind: "list",
        label: "Redes sociais (submenu)",
      },
    ],
    group: "layout",
    label: "Topo com menu (Comunidade Viva)",
    render: (p, ctx) => {
      const items = ctx.site.menu.filter(m => !m.dynamic);
      const wanted = splitList(p.shortcuts).map(s => s.toLowerCase());
      const shortcuts = items.filter(m =>
        wanted.includes(m.label.toLowerCase())
      );
      const socials = p.socials.filter(s => s.label && s.url);
      const home = isHome(ctx);
      return (
        <div className={cls("cv-nav", home && "is-home")}>
          {/* biome-ignore lint/correctness/useUniqueElementIds: o botão e o fundo do menu usam label for=id; há um menu por página */}
          <input
            aria-label="Abrir menu"
            className="cv-burger-input"
            id="sb-burger"
            type="checkbox"
          />
          <div className="cv-bar">
            <div className="cv-bar-l">
              <label
                aria-label="Abrir menu"
                className="cv-burger"
                htmlFor="sb-burger"
              >
                <i />
                <i />
                <i />
              </label>
              <nav aria-label="Atalhos" className="cv-short">
                {shortcuts.map(m => (
                  <a href={href(ctx, m.href)} key={m.href + m.label}>
                    {m.label}
                  </a>
                ))}
                {socials.length ? (
                  <div className="cv-soc" data-cv-soc>
                    <button
                      aria-expanded="false"
                      aria-haspopup="true"
                      className="cv-soc-b"
                      type="button"
                    >
                      {p.socialsLabel}
                    </button>
                    <ul className="cv-soc-l">
                      {socials.map(s => (
                        <li key={s.label + s.url}>
                          <a href={safeUrl(s.url)} {...newTab(s.url)}>
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </nav>
            </div>
            <a
              aria-label={churchName(ctx)}
              className="cv-icon"
              href={href(ctx, "/")}
            >
              <Img src={p.icon} />
            </a>
          </div>
          <label
            aria-label="Fechar menu"
            className="cv-veil"
            htmlFor="sb-burger"
          />
          <aside aria-label="Menu" className="cv-drawer">
            <label
              aria-label="Fechar menu"
              className="cv-drawer-x"
              htmlFor="sb-burger"
            >
              ×
            </label>
            <ul>
              {items.map(m => (
                <li key={m.href + m.label}>
                  <a
                    aria-current={isCurrent(ctx, m.href) ? "page" : undefined}
                    href={href(ctx, m.href)}
                  >
                    {m.label}
                  </a>
                </li>
              ))}
              {socials.length ? (
                <li>
                  <span className="cv-d-title">{p.socialsLabel}</span>
                  <ul className="cv-d-soc">
                    {socials.map(s => (
                      <li key={s.label + s.url}>
                        <a href={safeUrl(s.url)} {...newTab(s.url)}>
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
            </ul>
          </aside>
        </div>
      );
    },
    type: "cvNav",
  }
);

/* ───────────────────────── hero (home) ───────────────────────── */

const cvHero = defineBlock(
  z.object({
    appTitle: str("Baixe nosso aplicativo:"),
    appTitleMobile: str("Nosso aplicativo"),
    listenBottom: str("AGORA"),
    listenTop: str("ESCUTE"),
    logo: str(),
    photo: str(),
    photoAlt: str("Pastores em um culto"),
    podcastLabel: str("Escute o nosso podcast"),
    rate1Label: str("Gostaram"),
    rate1Value: str("9.2"),
    rate2Label: str("Pontuação"),
    rate2Value: str("8.7"),
    ratings: flag("no"),
    thumb: str(),
    videoLabel: str("Assistir à mensagem de boas-vindas"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo horizontal (~330 × 60px)" },
      {
        key: "photo",
        kind: "image",
        label:
          "Foto da liderança (recortada em paralelogramo; no celular, tela cheia)",
      },
      { key: "photoAlt", kind: "text", label: "Descrição da foto" },
      {
        key: "thumb",
        kind: "image",
        label: "Miniatura do vídeo de boas-vindas (o link do vídeo é do tema)",
      },
      { key: "videoLabel", kind: "text", label: "Descrição do botão de vídeo" },
      { key: "appTitle", kind: "text", label: "Título do app (computador)" },
      { key: "appTitleMobile", kind: "text", label: "Título do app (celular)" },
      { key: "listenTop", kind: "text", label: "Círculo do podcast: 1ª linha" },
      {
        key: "listenBottom",
        kind: "text",
        label: "Círculo do podcast: 2ª linha",
      },
      {
        key: "podcastLabel",
        kind: "text",
        label: "Descrição do link do podcast",
      },
      {
        key: "ratings",
        kind: "select",
        label: "Mostrar os selos de nota (sem fonte; desligados por padrão)",
        options: YES_NO,
      },
      { key: "rate1Label", kind: "text", label: "Selo 1: rótulo" },
      { key: "rate1Value", kind: "text", label: "Selo 1: valor" },
      { key: "rate2Label", kind: "text", label: "Selo 2: rótulo" },
      { key: "rate2Value", kind: "text", label: "Selo 2: valor" },
    ],
    group: "layout",
    label: "Hero com foto em recorte (Comunidade Viva)",
    render: (p, ctx) => {
      const name = churchName(ctx);
      const video = th(ctx, "welcomeVideo");
      const podcast = th(ctx, "podcastUrl");
      const stores = hasStores(ctx);
      const rates =
        p.ratings === "yes"
          ? ([
              [p.rate1Label, p.rate1Value],
              [p.rate2Label, p.rate2Value],
            ] as const)
          : [];
      return (
        <section className="cv-hero">
          <div className="cv-hero-l">
            <h1 className="cv-h1">
              <Img alt={name} className="cv-logo-h" src={p.logo} />
              <span className="cv-name-m">{name}</span>
            </h1>
            <VideoThumb image={p.thumb} label={p.videoLabel} url={video} />
            {stores ? (
              <div className="cv-app">
                <p className="cv-app-t cv-app-td">{p.appTitle}</p>
                <p className="cv-app-t cv-app-tm">{p.appTitleMobile}</p>
                <Stores ctx={ctx} />
              </div>
            ) : null}
          </div>
          <div className="cv-hero-c">
            <div aria-hidden="true" className="cv-stripes">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="cv-photo">
              <Img alt={p.photoAlt} src={p.photo} />
            </div>
          </div>
          {podcast || rates.length ? (
            <div className="cv-hero-r">
              {podcast ? (
                <>
                  <div aria-hidden="true" className="cv-ring" />
                  <a
                    aria-label={p.podcastLabel}
                    className="cv-listen"
                    href={safeUrl(podcast)}
                    {...newTab(podcast)}
                  >
                    <b>
                      {p.listenTop}
                      <br />
                      {p.listenBottom}
                    </b>
                    <PodcastIcon />
                  </a>
                  <span aria-hidden="true" className="cv-player">
                    <HeadphonesIcon />
                  </span>
                </>
              ) : null}
              {rates.length ? (
                <div className="cv-rates">
                  {rates.map(([label, value]) => (
                    <span className="cv-rate" key={label + value}>
                      <StarIcon />
                      {label} <b>{value}</b>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      );
    },
    type: "cvHero",
  }
);

/* ───────────────────────── explore mais conteúdo ───────────────────────── */

const cvExplore = defineBlock(
  z.object({
    hideOn: str("privacidade, termos, 404"),
    items: z
      .array(z.object({ image: str(), text: str(), title: str(), url: str() }))
      .default([])
      .catch([]),
    mobileText: str(
      "Seja bem-vindo(a)! Nossos pastores têm uma mensagem para você. Toque e assista!"
    ),
    moreLabel: str("Ver mais"),
    moreUrl: str("/"),
    title: str("Explore mais conteúdo."),
    videoImage: str(),
    videoLabel: str("Assistir à mensagem de boas-vindas"),
    watermark: str("VIVA"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "watermark",
        kind: "text",
        label: "Marca d'água gigante atrás do título",
      },
      {
        key: "hideOn",
        kind: "text",
        label:
          "Esconder nestas páginas (endereços separados por vírgula; no editor sempre aparece)",
      },
      {
        key: "mobileText",
        kind: "text",
        label: "Texto do vídeo (só no celular)",
      },
      {
        key: "videoImage",
        kind: "image",
        label: "Miniatura do vídeo (celular)",
      },
      { key: "videoLabel", kind: "text", label: "Descrição do botão de vídeo" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem (16:9)" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "url", kind: "url", label: "Link do cartão" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
      {
        key: "moreLabel",
        kind: "text",
        label: "Texto do botão (vazio = sem botão)",
      },
      { key: "moreUrl", kind: "url", label: "Link do botão" },
    ],
    group: "content",
    label: "Explore mais conteúdo (Comunidade Viva)",
    render: (p, ctx) => {
      const hidden = splitList(p.hideOn).map(s => s.replace(/^\/+|\/+$/g, ""));
      if (ctx.mode === "view" && hidden.includes(slugOf(ctx))) return null;
      const video = th(ctx, "welcomeVideo");
      return (
        <section className="cv-explore">
          <div aria-hidden="true" className="cv-wm">
            {p.watermark}
          </div>
          <div className="cv-ex-in">
            <h2 className="cv-ex-title">{p.title}</h2>
            <div className="cv-ex-m" hidden={!video}>
              <p>{p.mobileText}</p>
              <VideoThumb
                image={p.videoImage}
                label={p.videoLabel}
                url={video}
              />
            </div>
            <div className="cv-cards">
              {p.items.map(it => (
                <a
                  className="cv-card"
                  href={href(ctx, it.url || "/")}
                  key={it.title + it.url}
                  {...newTab(it.url)}
                >
                  <div className="cv-card-img">
                    <Img alt="" src={it.image} />
                  </div>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </a>
              ))}
            </div>
            {p.moreLabel ? (
              <div className="cv-more-w">
                <a
                  className="cv-more"
                  href={href(ctx, p.moreUrl || "/")}
                  {...newTab(p.moreUrl)}
                >
                  {p.moreLabel}
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </a>
              </div>
            ) : null}
          </div>
        </section>
      );
    },
    type: "cvExplore",
  }
);

/* ───────────────────────── banner institucional ───────────────────────── */

const cvBanner = defineBlock(
  z.object({
    image: str(),
    line1: str("Uma família para caminhar com você."),
    line2: str("Estamos aqui para abençoar a sua vida."),
    mobileImage: str(),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Foto de fundo (louvor em palco)" },
      {
        key: "mobileImage",
        kind: "image",
        label: "Foto do celular (opcional; vazio = a mesma)",
      },
      { key: "line1", kind: "text", label: "Frase principal" },
      { key: "line2", kind: "text", label: "Frase secundária" },
    ],
    group: "content",
    label: "Banner institucional (Comunidade Viva)",
    render: p => (
      <section className="cv-banner">
        <div
          className={cls(
            "cv-banner-bg cv-banner-bg-d",
            p.mobileImage && "has-m"
          )}
        >
          <Img src={p.image} />
        </div>
        {p.mobileImage ? (
          <div className="cv-banner-bg cv-banner-bg-m">
            <Img src={p.mobileImage} />
          </div>
        ) : null}
        <div className="cv-banner-t">
          <h2>{p.line1}</h2>
          {p.line2 ? <p>{p.line2}</p> : null}
        </div>
      </section>
    ),
    type: "cvBanner",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const cvFooter = defineBlock(
  z.object({
    addressLabel: str("Sede:"),
    appTitle1: str("Fique conectado de qualquer lugar."),
    appTitle2: str("Baixe o aplicativo:"),
    brand: str(),
    links: LINKS,
    logo: str(),
    motto: str("Uma igreja para todas as gerações"),
    rights: str("Todos os direitos reservados."),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo vertical (branco, ~100px)" },
      { key: "addressLabel", kind: "text", label: "Rótulo do endereço" },
      {
        key: "appTitle1",
        kind: "text",
        label: "Chamada do app: 1ª linha (some sem links das lojas)",
      },
      { key: "appTitle2", kind: "text", label: "Chamada do app: 2ª linha" },
      {
        key: "brand",
        kind: "text",
        label: "Nome no copyright (vazio = nome da igreja do tema)",
      },
      { key: "rights", kind: "text", label: "Texto de direitos" },
      { key: "motto", kind: "text", label: "Frase do ministério" },
      {
        itemFields: LINK_FIELDS,
        key: "links",
        kind: "list",
        label: "Links de baixo (Privacidade, Termos…)",
      },
    ],
    group: "layout",
    label: "Rodapé (Comunidade Viva)",
    render: (p, ctx) => {
      const email = th(ctx, "contactEmail");
      const phone = th(ctx, "phone");
      const address = th(ctx, "address");
      const stores = hasStores(ctx);
      const mail = mailTo(ctx);
      const tel = telTo(ctx);
      return (
        <footer className="cv-foot">
          <div className="cv-foot-in">
            <div className="cv-foot-col">
              <Img
                alt={churchName(ctx)}
                className="cv-foot-logo"
                src={p.logo}
              />
            </div>
            <div className="cv-foot-col">
              <MailIcon />
              {mail ? <a href={mail}>{email}</a> : null}
              {tel ? <a href={tel}>{phone}</a> : null}
            </div>
            <div className="cv-foot-col">
              <PinIcon />
              {address ? (
                <a
                  href={mapsLink(address)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {p.addressLabel} {address}
                </a>
              ) : null}
            </div>
          </div>
          {stores ? (
            <div className="cv-foot-app">
              <p>
                {p.appTitle1}
                <br />
                {p.appTitle2}
              </p>
              <Stores ctx={ctx} />
            </div>
          ) : null}
          <div className="cv-foot-end">
            <b>
              © <span data-cv-year>{new Date().getFullYear()}</span> {p.rights}{" "}
              {p.brand || churchName(ctx)}
            </b>
            {p.motto ? <span>{p.motto}</span> : null}
            {p.links.filter(l => l.label && l.url).length ? (
              <span>
                {p.links
                  .filter(l => l.label && l.url)
                  .map((l, i) => (
                    <span key={l.label + l.url}>
                      {i ? " · " : ""}
                      <a href={href(ctx, l.url)} {...newTab(l.url)}>
                        {l.label}
                      </a>
                    </span>
                  ))}
              </span>
            ) : null}
          </div>
        </footer>
      );
    },
    type: "cvFooter",
  }
);

export const igrejaBlocks: BlockDefinition[] = [
  cvNav,
  cvHero,
  cvExplore,
  cvBanner,
  cvFooter,
];
