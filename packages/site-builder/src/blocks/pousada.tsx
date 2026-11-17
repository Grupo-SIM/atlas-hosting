import { z } from "zod";
import { defineBlock } from "./define.js";
import { href, Img, newTab, SocialIcon, safeUrl } from "./helpers.js";
import {
  albumOf,
  anchorHref,
  bookLink,
  flag,
  Gallery,
  type GalleryData,
  galleryId,
  int,
  mailHref,
  PHOTO_FIELDS,
  photoList,
  str,
  telHref,
  VV_ICON_OPTIONS,
  VvButton,
  VvIcon,
  VvWhatsapp,
  waLink,
  YES_NO,
} from "./pousada-lib.js";
import { SiCar } from "./sim-lib.js";
import type { BlockDefinition, RenderContext } from "./types.js";

/**
 * Blocos do template "Vereda Viva — Pousada e Camping" (`vv*`): menu fixo com gaveta, hero em carrossel, história com
 * linha do tempo, quartos e experiências com modal de fotos, missão/visão/valores, "Venha nos visitar" com mapa,
 * rodapé, botão flutuante do WhatsApp e a página 404. As configurações globais (URL de reserva, WhatsApp, e-mail,
 * telefone, endereço do mapa, modo escuro) vêm de `site.theme` (ver `VARIANT_TOKENS.pousada`).
 */

const norm = (s: string) => s.replace(/^\/+|\/+$/g, "");

const isCurrent = (ctx: RenderContext, url: string) =>
  !url.startsWith("#") && norm(url) === norm(ctx.path ?? "") && url !== "";

/* ───────────────────────── menu fixo ───────────────────────── */

const vvNav = defineBlock(
  z.object({
    logo: str(),
    reserveLabel: str("Reservar"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo (~50px de largura)" },
      { key: "reserveLabel", kind: "text", label: "Texto do botão de reserva" },
    ],
    group: "layout",
    label: "Menu fixo (Vereda Viva)",
    render: (p, ctx) => {
      const reserve = bookLink(ctx);
      const items = ctx.site.menu.filter(m => !m.dynamic);
      return (
        <div className="vv-nav-wrap">
          {/* biome-ignore lint/correctness/useUniqueElementIds: o botão e o fundo do menu usam label for=id; há um menu por página */}
          <input
            aria-label="Abrir menu"
            className="vv-burger-input"
            id="sb-burger"
            type="checkbox"
          />
          <nav aria-label="Menu principal" className="vv-nav">
            <a
              aria-label={ctx.site.name}
              className="vv-nav-logo"
              href={href(ctx, "/")}
            >
              {p.logo ? <Img alt="" src={p.logo} /> : null}
            </a>
            <ul className="vv-menu">
              {items.map(m => (
                <li key={m.href + m.label}>
                  <a
                    aria-current={isCurrent(ctx, m.href) ? "page" : undefined}
                    href={anchorHref(ctx, m.href)}
                  >
                    {m.label}
                  </a>
                </li>
              ))}
              <li>
                <a className="vv-menu-cta" href={reserve} {...newTab(reserve)}>
                  {p.reserveLabel}
                </a>
              </li>
            </ul>
            <label
              aria-label="Abrir menu"
              className="vv-burger-btn"
              htmlFor="sb-burger"
            >
              <VvIcon name="menu" />
            </label>
          </nav>
          <label
            aria-label="Fechar menu"
            className="vv-veil"
            htmlFor="sb-burger"
          />
          <aside aria-label="Menu" className="vv-drawer">
            <label
              aria-label="Fechar menu"
              className="vv-drawer-x"
              htmlFor="sb-burger"
            >
              <VvIcon name="close" />
            </label>
            <ul>
              {items.map(m => (
                <li key={m.href + m.label}>
                  <a href={anchorHref(ctx, m.href)}>{m.label}</a>
                </li>
              ))}
              <li>
                <a
                  className="vv-btn vv-btn-blue"
                  href={reserve}
                  {...newTab(reserve)}
                >
                  {p.reserveLabel}
                </a>
              </li>
            </ul>
          </aside>
        </div>
      );
    },
    type: "vvNav",
  }
);

/* ───────────────────────── hero em carrossel ───────────────────────── */

const slideItem = z.object({ alt: str(), image: str() });

/** Carrossel de uma foto por vez, em fade de 0,8 s. */
const carDefaults = {
  gap: 0,
  perView: 1,
  perViewMobile: 1,
  perViewTablet: 1,
  speed: 800,
};

const vvHero = defineBlock(
  z.object({
    arrowLabel: str("Ir para a próxima seção"),
    arrowUrl: str("#pousada"),
    autoplay: flag("yes"),
    line1: str("Um lugar incrível para"),
    line2: str("momentos especiais"),
    logo: str(),
    seconds: int(2, 30, 6),
    slides: z.array(slideItem).default([]).catch([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          { key: "alt", kind: "text", label: "Descrição da foto" },
        ],
        key: "slides",
        kind: "list",
        label: "Fotos do topo (tela cheia)",
      },
      { key: "logo", kind: "image", label: "Logo (até 370px de largura)" },
      {
        key: "line1",
        kind: "text",
        label: "Frase, linha 1 (é o título da página)",
      },
      { key: "line2", kind: "text", label: "Frase, linha 2" },
      {
        key: "autoplay",
        kind: "select",
        label: "Trocar as fotos sozinho",
        options: YES_NO,
      },
      { key: "seconds", kind: "number", label: "Segundos entre as fotos" },
      { key: "arrowUrl", kind: "url", label: "Destino da seta para baixo" },
      {
        key: "arrowLabel",
        kind: "text",
        label: "Texto da seta (leitor de tela)",
      },
    ],
    group: "content",
    label: "Topo com carrossel (Vereda Viva)",
    render: (p, ctx) => (
      <section className="vv-hero">
        <SiCar
          arrows="inside"
          autoplay={p.autoplay === "yes"}
          items={p.slides.map((s, i) => (
            <Img alt={s.alt} key={s.image + i} src={s.image} />
          ))}
          p={{
            ...carDefaults,
            delay: p.seconds * 1000,
          }}
          pause={false}
          transition="fade"
        />
        <div className="vv-hero-in">
          {p.logo ? (
            <div className="vv-hero-logo">
              <Img alt="" src={p.logo} />
            </div>
          ) : null}
          <h1 className="vv-hero-h1">
            <span className="vv-sr">{ctx.site.name}: </span>
            {p.line1}
            <br />
            {p.line2}
          </h1>
          <a
            aria-label={p.arrowLabel}
            className="vv-down"
            href={anchorHref(ctx, p.arrowUrl)}
          >
            <VvIcon name="arrow-down" />
          </a>
        </div>
        <div aria-hidden="true" className="vv-hero-fade" />
      </section>
    ),
    type: "vvHero",
  }
);

/* ───────────────────────── "A nossa pousada" + linha do tempo ───────────────────────── */

const storyItem = z.object({
  caption: str(),
  date: str(),
  icon: z
    .enum(VV_ICON_OPTIONS.map(o => o.value) as [string, ...string[]])
    .default("star")
    .catch("star"),
  text: str(),
  title: str(),
  year: str(),
});

const vvStory = defineBlock(
  z.object({
    contactLabel: str("Fale Conosco"),
    items: z.array(storyItem).default([]).catch([]),
    reserveLabel: str("Reservar"),
    roomsLabel: str("Ver Quartos"),
    roomsUrl: str("#acomodacoes"),
    title1: str("A NOSSA"),
    title2: str("POUSADA"),
  }),
  {
    fields: [
      { key: "title1", kind: "text", label: "Título, linha 1" },
      { key: "title2", kind: "text", label: "Título, linha 2" },
      { key: "reserveLabel", kind: "text", label: "Botão azul (reserva)" },
      { key: "contactLabel", kind: "text", label: "Botão verde (WhatsApp)" },
      { key: "roomsLabel", kind: "text", label: "Botão azul (ver quartos)" },
      { key: "roomsUrl", kind: "url", label: "Destino de “ver quartos”" },
      {
        itemFields: [
          { key: "year", kind: "text", label: "Ano (selo)" },
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: VV_ICON_OPTIONS,
          },
          { key: "date", kind: "text", label: "Data curta" },
          { key: "caption", kind: "text", label: "Legenda da data" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Linha do tempo",
      },
    ],
    group: "content",
    label: "A nossa pousada + linha do tempo (Vereda Viva)",
    render: (p, ctx) => {
      let group = -1;
      return (
        <section className="vv-story">
          <div className="vv-story-in">
            <h2 className="vv-story-title">
              <span>{p.title1}</span> <span>{p.title2}</span>
            </h2>
            <div className="vv-story-btns">
              <VvButton
                className="vv-btn-blue"
                href={bookLink(ctx)}
                icon="key"
                label={p.reserveLabel}
              />
              <VvButton
                className="vv-btn-green"
                href={waLink(ctx) || anchorHref(ctx, "#visite")}
                icon="whatsapp"
                label={p.contactLabel}
              />
              <VvButton
                className="vv-btn-blue"
                href={anchorHref(ctx, p.roomsUrl)}
                icon="house"
                label={p.roomsLabel}
              />
            </div>
            <ol className="vv-tl">
              {p.items.map((it, i) => {
                const first = i === 0 || it.year !== p.items[i - 1]?.year;
                if (first) group++;
                return (
                  <li
                    className={`vv-tl-item ${i % 2 === 0 ? "is-left" : "is-right"} ${first ? "is-first" : ""} g${group % 2}`}
                    // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do item
                    key={i}
                  >
                    <div className="vv-tl-year">
                      {first ? <span>{it.year}</span> : null}
                    </div>
                    <div className="vv-tl-meta">
                      <b>{it.date}</b>
                      <span>{it.caption}</span>
                    </div>
                    <div className="vv-tl-dot">
                      <VvIcon name={it.icon} />
                    </div>
                    <div className="vv-tl-card">
                      <h3>{it.title}</h3>
                      <p>{it.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      );
    },
    type: "vvStory",
  }
);

/* ───────────────────────── acomodações ───────────────────────── */

const roomItem = z.object({
  bookUrl: str(),
  image: str(),
  name: str(),
  photos: photoList,
  text: str(),
});

const vvRooms = defineBlock(
  z.object({
    items: z.array(roomItem).default([]).catch([]),
    moreLabel: str("Ver mais+"),
    reserveLabel: str("Reservar"),
    showModalInEditor: flag("no"),
    title: str("Acomodações"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "reserveLabel", kind: "text", label: "Texto do botão de reserva" },
      { key: "moreLabel", kind: "text", label: "Texto do botão do modal" },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome" },
          {
            key: "text",
            kind: "textarea",
            label: "Capacidade ou descrição",
          },
          { key: "image", kind: "image", label: "Foto de capa" },
          PHOTO_FIELDS,
          {
            key: "bookUrl",
            kind: "url",
            label: "URL de reserva deste quarto (vazio = a do site)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Quartos e áreas",
      },
      {
        key: "showModalInEditor",
        kind: "select",
        label: "Mostrar o modal do 1º quarto aberto no editor",
        options: YES_NO,
      },
    ],
    group: "content",
    label: "Acomodações (Vereda Viva)",
    render: (p, ctx) => {
      const edit = ctx.mode === "edit";
      const galleries: GalleryData[] = p.items.map((it, i) => ({
        id: galleryId("q", i),
        photos: albumOf(it.image, it.photos),
        reserve: {
          href: bookLink(ctx, it.bookUrl),
          label: p.reserveLabel,
        },
        text: it.text,
        title: it.name,
      }));
      return (
        <section className="vv-rooms">
          <div className="vv-rooms-in">
            <h2 className="vv-sec-title">{p.title}</h2>
            <div className="vv-room-grid">
              {p.items.map((it, i) => {
                const book = bookLink(ctx, it.bookUrl);
                return (
                  <article
                    className="vv-room"
                    // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do quarto
                    key={i}
                  >
                    <Img alt={it.name} className="vv-room-img" src={it.image} />
                    <div className="vv-room-body">
                      <h3>{it.name}</h3>
                      <p>{it.text}</p>
                      <div className="vv-room-actions">
                        <a
                          className="vv-btn vv-btn-o-blue"
                          href={safeUrl(book)}
                          {...newTab(book)}
                        >
                          {p.reserveLabel}
                        </a>
                        <button
                          className="vv-btn vv-btn-o-green"
                          popoverTarget={galleryId("q", i)}
                          type="button"
                        >
                          {p.moreLabel}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {edit ? (
              p.showModalInEditor === "yes" && galleries[0] ? (
                <Gallery data={galleries[0]} isStatic />
              ) : null
            ) : (
              galleries.map(g => <Gallery data={g} key={g.id} />)
            )}
          </div>
        </section>
      );
    },
    type: "vvRooms",
  }
);

/* ───────────────────────── experiências ───────────────────────── */

const expItem = z.object({
  extraLabel: str(),
  extraUrl: str(),
  image: str(),
  kind: z.enum(["photo", "solid"]).default("photo").catch("photo"),
  photos: photoList,
  text: str(),
  title: str(),
});

const vvExperiences = defineBlock(
  z.object({
    imagesLabel: str("Ver Imagens"),
    items: z.array(expItem).default([]).catch([]),
    showModalInEditor: flag("no"),
    title: str("Experiências Oferecidas"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "imagesLabel", kind: "text", label: "Texto do botão de fotos" },
      {
        itemFields: [
          {
            key: "kind",
            kind: "select",
            label: "Tipo de cartão",
            options: [
              { label: "Com foto e álbum", value: "photo" },
              { label: "Sólido, sem foto", value: "solid" },
            ],
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          {
            key: "image",
            kind: "image",
            label: "Foto de capa",
            showWhen: { equals: "photo", key: "kind" },
          },
          {
            ...PHOTO_FIELDS,
            showWhen: { equals: "photo", key: "kind" },
          },
          {
            key: "extraLabel",
            kind: "text",
            label: "Segundo botão (texto; vazio = sem botão)",
            showWhen: { equals: "photo", key: "kind" },
          },
          {
            key: "extraUrl",
            kind: "url",
            label: "Segundo botão (link; vazio = sem botão)",
            showWhen: { equals: "photo", key: "kind" },
          },
        ],
        key: "items",
        kind: "list",
        label: "Experiências",
      },
      {
        key: "showModalInEditor",
        kind: "select",
        label: "Mostrar o modal da 1ª experiência aberto no editor",
        options: YES_NO,
      },
    ],
    group: "content",
    label: "Experiências (Vereda Viva)",
    render: (p, ctx) => {
      const edit = ctx.mode === "edit";
      const galleries = p.items.map<GalleryData | null>((it, i) =>
        it.kind === "solid"
          ? null
          : {
              id: galleryId("e", i),
              photos: albumOf(it.image, it.photos),
              reserve: null,
              text: it.text,
              title: it.title,
            }
      );
      let cycle = -1;
      return (
        <section className="vv-exp">
          <div className="vv-exp-in">
            <h2 className="vv-sec-title">{p.title}</h2>
            <div className="vv-exp-grid">
              {p.items.map((it, i) => {
                if (it.kind === "solid")
                  return (
                    <article
                      className="vv-xc vv-xc-solid"
                      // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
                      key={i}
                    >
                      <h3>{it.title}</h3>
                      <p>{it.text}</p>
                    </article>
                  );
                cycle++;
                return (
                  <article
                    className={`vv-xc vv-xc-${cycle % 3}`}
                    // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
                    key={i}
                  >
                    <Img alt={it.title} className="vv-xc-img" src={it.image} />
                    <div className="vv-xc-body">
                      <h3>{it.title}</h3>
                      <p>{it.text}</p>
                      <div className="vv-xc-actions">
                        <button
                          className="vv-xc-btn"
                          popoverTarget={galleryId("e", i)}
                          type="button"
                        >
                          <VvIcon name="image" />
                          {p.imagesLabel}
                        </button>
                        {it.extraLabel && it.extraUrl ? (
                          <a
                            className="vv-xc-btn vv-xc-extra"
                            href={safeUrl(href(ctx, it.extraUrl))}
                            {...newTab(it.extraUrl)}
                          >
                            <VvIcon name="mask" />
                            {it.extraLabel}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {edit
              ? p.showModalInEditor === "yes"
                ? (() => {
                    const g = galleries.find(Boolean);
                    return g ? <Gallery data={g} isStatic /> : null;
                  })()
                : null
              : galleries.map(g =>
                  g ? <Gallery data={g} key={g.id} /> : null
                )}
          </div>
        </section>
      );
    },
    type: "vvExperiences",
  }
);

/* ───────────────────────── missão, visão e valores ───────────────────────── */

const LeafBranch = () => (
  <svg aria-hidden="true" className="vv-art" viewBox="0 0 240 420">
    <path
      d="M120 410C112 320 126 210 150 20"
      fill="none"
      stroke="#47702F"
      strokeLinecap="round"
      strokeWidth="6"
    />
    {[
      [118, 360, -58, "#5E943E"],
      [122, 360, 52, "#47702F"],
      [124, 290, -62, "#47702F"],
      [128, 285, 56, "#5E943E"],
      [133, 205, -60, "#5E943E"],
      [137, 200, 54, "#90F157"],
      [142, 125, -56, "#47702F"],
      [146, 118, 52, "#5E943E"],
      [150, 50, -44, "#90F157"],
    ].map(([x, y, r, c]) => (
      <path
        d="M0 0C-26-18-30-62 0-96 30-62 26-18 0 0z"
        fill={c as string}
        key={`${x}-${y}`}
        opacity=".92"
        transform={`translate(${x} ${y}) rotate(${r})`}
      />
    ))}
  </svg>
);

const Drops = () => (
  <svg aria-hidden="true" className="vv-art" viewBox="0 0 240 420">
    {[
      [150, 70, 1.35, "#2A8ECC"],
      [78, 170, 1, "#35B0FC"],
      [170, 255, 1.7, "#184E70"],
      [92, 345, 1.15, "#2A8ECC"],
    ].map(([x, y, s, c]) => (
      <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
        <path
          d="M0-46C-27-14-40 6-40 24a40 40 0 0 0 80 0C40 6 27-14 0-46z"
          fill={c as string}
        />
        <path
          d="M-18 26a20 20 0 0 0 16 16"
          fill="none"
          opacity=".55"
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth="5"
        />
      </g>
    ))}
  </svg>
);

const vvValues = defineBlock(
  z.object({
    items: z
      .array(z.object({ text: str(), title: str() }))
      .default([])
      .catch([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label:
          "Cartões (o 1º alinha à esquerda, o 2º à direita, o 3º ao centro)",
      },
    ],
    group: "content",
    label: "Missão, visão e valores (Vereda Viva)",
    render: p => (
      <section className="vv-values">
        <div aria-hidden="true" className="vv-values-art is-left">
          <LeafBranch />
        </div>
        <div className="vv-values-col">
          {p.items.map((it, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
            <div className="vv-values-item" key={i}>
              {i > 0 ? <hr className={`vv-hr${i % 2}`} /> : null}
              <article className={`vv-vcard a${i % 3}`}>
                <h2>{it.title}</h2>
                <p>{it.text}</p>
              </article>
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="vv-values-art is-right">
          <Drops />
        </div>
      </section>
    ),
    type: "vvValues",
  }
);

/* ───────────────────────── venha nos visitar ───────────────────────── */

const GMAPS = /^https:\/\/(?:www\.)?google\.com\/maps\//i;

const vvVisit = defineBlock(
  z.object({
    embedUrl: str(),
    mapTitle: str("Mapa de como chegar à pousada"),
    photos: z
      .array(z.object({ image: str(), word: str() }))
      .default([])
      .catch([]),
    title: str("VENHA NOS VISITAR"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (aparece no celular)" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          { key: "word", kind: "text", label: "Palavra sobre a foto" },
        ],
        key: "photos",
        kind: "list",
        label: "Fotos em escada (3)",
      },
      {
        key: "embedUrl",
        kind: "url",
        label:
          "URL de embed do Google Maps (vazio = usa o endereço do mapa do site)",
      },
      {
        key: "mapTitle",
        kind: "text",
        label: "Descrição do mapa (acessibilidade)",
      },
    ],
    group: "content",
    label: "Venha nos visitar (Vereda Viva)",
    render: (p, ctx) => {
      const own = p.embedUrl.trim();
      const address =
        (ctx.site.theme.mapAddress ?? "").trim() || "Chapada dos Veadeiros, GO";
      const src =
        own && GMAPS.test(own)
          ? own
          : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
      return (
        <section className="vv-visit">
          <div className="vv-visit-in">
            <h2 className="vv-vtitle">{p.title}</h2>
            <div className="vv-vphotos">
              {p.photos.map((ph, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade da foto
                <div className="vv-vphoto" key={i}>
                  <Img alt="" src={ph.image} />
                  <span aria-hidden="true">{ph.word}</span>
                </div>
              ))}
            </div>
            <iframe
              allowFullScreen
              className="vv-map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={src}
              title={p.mapTitle}
            />
          </div>
        </section>
      );
    },
    type: "vvVisit",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const vvFooter = defineBlock(
  z.object({
    contactTitle: str("FALE CONOSCO"),
    copyright: str("Pousada Vereda Viva"),
    links: z
      .array(z.object({ label: str(), url: str("#") }))
      .default([])
      .catch([]),
    logo: str(),
    socials: z
      .array(z.object({ label: str(), url: str() }))
      .default([])
      .catch([]),
    socialsTitle: str("REDES SOCIAIS"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo (200px, versão clara)" },
      { key: "socialsTitle", kind: "text", label: "Título das redes" },
      {
        itemFields: [
          {
            key: "label",
            kind: "text",
            label: "Rede (Instagram, Facebook, YouTube…)",
          },
          { key: "url", kind: "url", label: "Link (sem link, o ícone some)" },
        ],
        key: "socials",
        kind: "list",
        label: "Redes sociais",
      },
      { key: "contactTitle", kind: "text", label: "Título do contato" },
      { key: "copyright", kind: "text", label: "Nome no copyright" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "links",
        kind: "list",
        label: "Links legais",
      },
    ],
    group: "layout",
    label: "Rodapé (Vereda Viva)",
    render: (p, ctx) => {
      const mail = mailHref(ctx);
      const tel = telHref(ctx);
      const wa = waLink(ctx);
      const socials = p.socials.filter(s => s.url.trim());
      return (
        <footer className="vv-foot">
          <div className="vv-foot-in">
            <div className="vv-foot-col vv-foot-social">
              <h2>{p.socialsTitle}</h2>
              <div className="vv-foot-icons">
                {socials.map(s => (
                  <a
                    aria-label={s.label}
                    href={safeUrl(s.url)}
                    key={s.label + s.url}
                    {...newTab(s.url)}
                  >
                    <SocialIcon label={s.label} />
                  </a>
                ))}
              </div>
            </div>
            <div className="vv-foot-logo">
              {p.logo ? <Img alt={ctx.site.name} src={p.logo} /> : null}
            </div>
            <div className="vv-foot-col vv-foot-contact">
              <h2>{p.contactTitle}</h2>
              <div className="vv-foot-icons">
                {mail ? (
                  <a aria-label="E-mail" href={mail}>
                    <VvIcon name="mail" />
                  </a>
                ) : null}
                {wa ? (
                  <a
                    aria-label="WhatsApp"
                    href={wa}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <VvWhatsapp />
                  </a>
                ) : null}
                {tel ? (
                  <a aria-label="Telefone" href={tel}>
                    <VvIcon name="phone" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <p className="vv-copy">
            © <span data-vv-year>{new Date().getFullYear()}</span> {p.copyright}
            {p.links.map(l => (
              <span key={l.label + l.url}>
                {" · "}
                <a href={href(ctx, l.url)} {...newTab(l.url)}>
                  {l.label}
                </a>
              </span>
            ))}
          </p>
        </footer>
      );
    },
    type: "vvFooter",
  }
);

/* ───────────────────────── botão flutuante do WhatsApp ───────────────────────── */

const vvFloat = defineBlock(z.object({ label: str("Falar pelo WhatsApp") }), {
  fields: [
    { key: "label", kind: "text", label: "Texto do botão (leitor de tela)" },
  ],
  group: "layout",
  label: "Botão flutuante do WhatsApp (Vereda Viva)",
  render: (p, ctx) => {
    const wa = waLink(ctx);
    if (!wa) return null;
    return (
      <a
        aria-label={p.label}
        className={ctx.mode === "edit" ? "vv-float is-edit" : "vv-float"}
        href={wa}
        rel="noopener noreferrer"
        target="_blank"
      >
        <VvWhatsapp />
      </a>
    );
  },
  type: "vvFloat",
});

/* ───────────────────────── páginas internas ───────────────────────── */

const vvPageTitle = defineBlock(z.object({ text: str("Página") }), {
  fields: [{ key: "text", kind: "text", label: "Título da página" }],
  group: "content",
  label: "Título de página (Vereda Viva)",
  render: p => (
    <div className="vv-ptitle">
      <h1>{p.text}</h1>
    </div>
  ),
  type: "vvPageTitle",
});

const vvNotFound = defineBlock(
  z.object({
    backLabel: str("Voltar ao início"),
    image: str(),
    text: str("A página que você procura não existe ou mudou de endereço."),
    title: str("Página não encontrada"),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Foto de fundo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "backLabel", kind: "text", label: "Texto do botão" },
    ],
    group: "content",
    label: "Página 404 (Vereda Viva)",
    render: (p, ctx) => (
      <section className="vv-nf">
        <Img alt="" className="vv-nf-bg" src={p.image} />
        <div className="vv-nf-in">
          <h1>{p.title}</h1>
          <p>{p.text}</p>
          <a className="vv-btn vv-btn-blue" href={href(ctx, "/")}>
            {p.backLabel}
          </a>
        </div>
      </section>
    ),
    type: "vvNotFound",
  }
);

export const pousadaBlocks: BlockDefinition[] = [
  vvNav,
  vvHero,
  vvStory,
  vvRooms,
  vvExperiences,
  vvValues,
  vvVisit,
  vvFooter,
  vvFloat,
  vvPageTitle,
  vvNotFound,
];
