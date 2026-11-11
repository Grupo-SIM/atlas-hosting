import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { href, Img, Inline, newTab } from "./helpers.js";
import {
  bgImg,
  headFields,
  headSchema,
  int,
  itemList,
  layerClass,
  layerFields,
  layerSchema,
  layerStyle,
  PG_ICON_OPTIONS,
  PgButton,
  PgCar,
  PgHead,
  PgIcon,
  str,
} from "./pagatg-lib.js";
import {
  BackgroundVideo,
  ShapeDivider,
  shapeFields,
  shapeSchema,
} from "./shapes.js";
import { SiSocial } from "./sim-lib.js";
import type { BlockDefinition, FieldDef } from "./types.js";

/**
 * Blocos do tema PagaTG (prefixo `pg`): landing escura em roxo e ciano migrada de pagatg.com (Elementor + Astra).
 * Todo texto, imagem, link e item é prop editável; o visual vem de `renderer/pagatg.ts` (escopo `.sb-pg`).
 * Os caminhos de `Block.fx` do template dependem da ordem dos filhos de cada bloco, descrita em cada comentário
 * (`1` = a seção; `1.1` = seu primeiro filho…).
 */

const CTA_URL = "https://app.pagatg.com/";
const linkItem = z.object({ label: str(), url: str("#") });

const buttonFields = (prefix: string, label: string): FieldDef[] => [
  { key: `${prefix}Label`, kind: "text", label: `${label} — texto` },
  { key: `${prefix}Url`, kind: "url", label: `${label} — link` },
];

const listField = (
  key: string,
  label: string,
  itemFields: FieldDef[]
): FieldDef => ({ itemFields, key, kind: "list", label });

/* ───────────────────────── cabeçalho ───────────────────────── */

/** `header`: 1 input do menu, 2 linha (logo, menu, login, hambúrguer), 3 menu suspenso. */
const pgHeader = defineBlock(
  z.object({
    buttonLabel: str("Login"),
    buttonUrl: str(CTA_URL),
    items: itemList(linkItem.shape),
    logo: str(),
    logoUrl: str("/"),
    logoWidth: int(40, 400, 180),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
      { key: "logoWidth", kind: "number", label: "Largura da logo (px)" },
      listField("items", "Itens do menu", [
        { key: "label", kind: "text", label: "Texto" },
        { key: "url", kind: "url", label: "Link (ex.: /#beneficios)" },
      ]),
      ...buttonFields("button", "Botão"),
    ],
    group: "layout",
    label: "Cabeçalho PagaTG (transparente sobre o hero)",
    render: (p, ctx) => {
      const menu = p.items.map((it, i) => (
        <li key={`${it.label}-${i}`}>
          <a href={href(ctx, it.url)} {...newTab(it.url)}>
            {it.label}
          </a>
        </li>
      ));
      return (
        <header
          className="pg-head"
          style={{ "--pg-logo": `${p.logoWidth}px` } as CSSProperties}
        >
          <input
            aria-hidden="true"
            className="pg-burger-input"
            id="sb-burger"
            tabIndex={-1}
            type="checkbox"
          />
          <div className="pg-head-in">
            <a className="pg-logo" href={href(ctx, p.logoUrl)}>
              <Img alt="PagaTG" src={p.logo} />
            </a>
            <nav aria-label="Menu principal" className="pg-nav">
              <ul className="pg-menu">{menu}</ul>
            </nav>
            <div className="pg-login">
              <PgButton
                ctx={ctx}
                label={p.buttonLabel}
                url={p.buttonUrl}
                variant="grad"
              />
            </div>
            <label
              aria-label="Abrir menu"
              className="pg-burger"
              htmlFor="sb-burger"
            >
              <PgIcon name="menu" />
            </label>
          </div>
          <nav aria-label="Menu" className="pg-drop">
            <ul>{menu}</ul>
          </nav>
        </header>
      );
    },
    type: "pgHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

/**
 * `section`: 1 vídeo de fundo, 2 véu, 3 linha → 3.1 texto (1 título, 2 parágrafo, 3 botões) e 3.2 imagem
 * (`1.3.1.3` = botões, `1.3.2` = imagem); o divisor de forma vem por último.
 */
const pgHero = defineBlock(
  z.object({
    buttonLabel: str("Abrir conta"),
    buttonUrl: str(CTA_URL),
    highlight: str("Vendas do Telegram"),
    image: str(),
    imageAlt: str(),
    poster: str(),
    secondLabel: str("Saber mais"),
    secondUrl: str("#sabermais"),
    text: str(),
    title: str("A melhor plataforma de"),
    veilOpacity: int(0, 100, 64),
    video: str(),
    ...shapeSchema({
      heightDesktop: 300,
      heightMobile: 160,
      heightTablet: 300,
      shape: "zigzag",
      widthMobile: 224,
      widthTablet: 140,
    }),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "highlight", kind: "text", label: "Trecho vazado do título" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...buttonFields("button", "Botão principal"),
      ...buttonFields("second", "Botão secundário"),
      { key: "image", kind: "image", label: "Imagem" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da imagem" },
      { key: "video", kind: "text", label: "Vídeo de fundo (link do YouTube)" },
      { key: "poster", kind: "image", label: "Pôster (aparece no editor)" },
      { key: "veilOpacity", kind: "number", label: "Opacidade do véu (%)" },
      ...shapeFields,
    ],
    group: "layout",
    label: "Hero PagaTG (vídeo de fundo)",
    render: (p, ctx) => (
      <section className="pg-hero">
        <BackgroundVideo
          edit={ctx.mode === "edit" || !!ctx.thumbnail}
          poster={p.poster}
          url={p.video}
        />
        <div className="pg-veil" style={{ opacity: p.veilOpacity / 100 }} />
        <div className="pg-wrap pg-hero-row">
          <div className="pg-hero-text">
            <h1>
              {p.title} <span className="pg-outline">{p.highlight}</span>
            </h1>
            <p className="pg-lead">{p.text}</p>
            <div className="pg-btns">
              <PgButton
                ctx={ctx}
                label={p.buttonLabel}
                url={p.buttonUrl}
                variant="grad"
              />
              <PgButton ctx={ctx} label={p.secondLabel} url={p.secondUrl} />
            </div>
          </div>
          <div className="pg-hero-img">
            <Img alt={p.imageAlt} src={p.image} />
          </div>
        </div>
        <ShapeDivider p={p} />
      </section>
    ),
    type: "pgHero",
  }
);

/* ───────────────────────── faixa de destaques ───────────────────────── */

const pgHighlights = defineBlock(
  z.object({
    items: itemList({ icon: str(), title: str() }),
  }),
  {
    fields: [
      listField("items", "Destaques", [
        { key: "icon", kind: "image", label: "Ícone" },
        { key: "title", kind: "text", label: "Título" },
      ]),
    ],
    group: "content",
    label: "Faixa de destaques (sobe sobre o hero)",
    render: p => (
      <section className="pg-hl">
        <div className="pg-hl-row">
          {p.items.map((it, i) => (
            <div className="pg-hl-item" key={`${it.title}-${i}`}>
              <Img alt="" src={it.icon} />
              <h5>{it.title}</h5>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "pgHighlights",
  }
);

/* ───────────────────────── foto + caixa com título que invade ───────────────────────── */

/** `section` → 1 linha → 1.1 foto, 1.2 caixa (1 título, 2 itens, 3 botão). */
const pgSplit = defineBlock(
  z.object({
    buttonLabel: str("Abrir conta"),
    buttonUrl: str(CTA_URL),
    items: itemList({ text: str(), title: str() }),
    photo: str(),
    photoVeil: int(0, 100, 24),
    title: str(),
  }),
  {
    fields: [
      { key: "photo", kind: "image", label: "Foto" },
      {
        key: "photoVeil",
        kind: "number",
        label: "Opacidade do véu da foto (%)",
      },
      { key: "title", kind: "text", label: "Título (invade a foto)" },
      listField("items", "Itens com seta", [
        { key: "title", kind: "text", label: "Título" },
        { key: "text", kind: "textarea", label: "Texto" },
      ]),
      ...buttonFields("button", "Botão"),
    ],
    group: "content",
    label: "Foto + caixa com título que invade a foto",
    render: (p, ctx) => (
      <section className="pg-split">
        <div className="pg-split-row">
          <div
            className="pg-split-photo"
            style={
              {
                ...bgImg(p.photo),
                "--pg-veil": p.photoVeil / 100,
              } as CSSProperties
            }
          />
          <div className="pg-split-box">
            <h2>{p.title}</h2>
            <div className="pg-split-items">
              {p.items.map((it, i) => (
                <div className="pg-iconrow" key={`${it.title}-${i}`}>
                  <i className="pg-arrow-up">
                    <PgIcon name="arrow-right" />
                  </i>
                  <div>
                    <h3>{it.title}</h3>
                    <p>{it.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <PgButton
              ctx={ctx}
              full
              label={p.buttonLabel}
              url={p.buttonUrl}
              variant="grad"
            />
          </div>
        </div>
      </section>
    ),
    type: "pgSplit",
  }
);

/* ───────────────────────── benefícios ───────────────────────── */

/**
 * `section` → 1 contêiner → 1.1.1 cabeçalho (1 sobretítulo, 2 título, 3 texto), 1.1.2 grade de cartões; em cada
 * cartão `1.1.2.N`: 1 ícone, 2 título, 3 texto, 4 imagem, 5 botão. O divisor vem depois do contêiner.
 */
const pgBenefits = defineBlock(
  z.object({
    ...headSchema({}),
    items: itemList({
      buttonLabel: str("Abrir Conta"),
      buttonUrl: str(CTA_URL),
      icon: str(),
      image: str(),
      text: str(),
      title: str(),
    }),
    ...layerSchema({ opacity: 16, url: "" }),
    ...shapeSchema({
      heightDesktop: 280,
      heightMobile: 280,
      heightTablet: 280,
      shape: "zigzag",
      widthTablet: 160,
    }),
  }),
  {
    fields: [
      ...headFields("Título"),
      listField("items", "Cartões", [
        { key: "icon", kind: "image", label: "Ícone" },
        { key: "title", kind: "text", label: "Título" },
        { key: "text", kind: "textarea", label: "Texto" },
        { key: "image", kind: "image", label: "Imagem" },
        { key: "buttonLabel", kind: "text", label: "Botão — texto" },
        { key: "buttonUrl", kind: "url", label: "Botão — link" },
      ]),
      ...layerFields,
      ...shapeFields,
    ],
    group: "content",
    label: "Benefícios (cartões com borda e hover)",
    render: (p, ctx) => (
      <section className={layerClass(p, "pg-ben")} style={layerStyle(p)}>
        <div className="pg-wrap">
          <PgHead eyebrow={p.eyebrow} text={p.text} title={p.title} />
          <div className="pg-ben-grid">
            {p.items.map((it, i) => (
              <article className="pg-ben-card" key={`${it.title}-${i}`}>
                <Img alt="" className="pg-ben-ico" src={it.icon} />
                <h3>{it.title}</h3>
                <p>{it.text}</p>
                <div className="pg-ben-img">
                  <Img alt="" src={it.image} />
                </div>
                <PgButton
                  ctx={ctx}
                  full
                  label={it.buttonLabel}
                  url={it.buttonUrl}
                />
              </article>
            ))}
          </div>
        </div>
        <ShapeDivider p={p} />
      </section>
    ),
    type: "pgBenefits",
  }
);

/* ───────────────────────── seis valores ───────────────────────── */

/** `section` → 1 caixa → 1.1.N selo. */
const pgValues = defineBlock(
  z.object({
    items: itemList({ alt: str(), image: str() }),
    ...layerSchema({ fixed: "yes", opacity: 20 }),
  }),
  {
    fields: [
      listField("items", "Selos", [
        { key: "image", kind: "image", label: "Imagem" },
        { key: "alt", kind: "text", label: "Nome (texto alternativo)" },
      ]),
      ...layerFields,
    ],
    group: "content",
    label: "Faixa dos seis valores (selos)",
    render: p => (
      <section className="pg-values">
        <div className={layerClass(p, "pg-values-box")} style={layerStyle(p)}>
          {p.items.map((it, i) => (
            <figure className="pg-seal" key={`${it.alt}-${i}`}>
              <Img alt={it.alt} src={it.image} />
            </figure>
          ))}
        </div>
      </section>
    ),
    type: "pgValues",
  }
);

/* ───────────────────────── como funciona ───────────────────────── */

/**
 * `section` → 1.1 linha → 1.1.1 texto (1 cabeçalho, 2 contador + lista, 3 botão) e 1.1.2 mídia (caixa em degradê
 * com a foto deslocada); o sobretítulo é `1.1.1.1.1`.
 */
const pgHowItWorks = defineBlock(
  z.object({
    ...headSchema({}),
    buttonLabel: str("Abrir Conta"),
    buttonUrl: str(CTA_URL),
    counterLabel: str("Anos de experiência"),
    counterMs: int(200, 10000, 1600),
    counterSuffix: str("+"),
    counterValue: int(0, 1000000, 10),
    image: str(),
    imageAlt: str(),
    list: str(),
  }),
  {
    fields: [
      ...headFields("Título"),
      { key: "counterValue", kind: "number", label: "Contador — valor final" },
      { key: "counterSuffix", kind: "text", label: "Contador — sufixo" },
      { key: "counterMs", kind: "number", label: "Contador — duração (ms)" },
      { key: "counterLabel", kind: "text", label: "Contador — legenda" },
      {
        key: "list",
        kind: "textarea",
        label: "Lista com check (um item por linha)",
      },
      ...buttonFields("button", "Botão"),
      { key: "image", kind: "image", label: "Foto" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da foto" },
    ],
    group: "content",
    label: "Como funciona (contador, lista e foto sobre degradê)",
    render: (p, ctx) => (
      <section className="pg-how">
        <div className="pg-wrap pg-how-row">
          <div className="pg-how-text">
            <PgHead
              align="left"
              eyebrow={p.eyebrow}
              text={p.text}
              title={p.title}
            />
            <div className="pg-how-stats">
              <div className="pg-count">
                <b
                  data-ms={p.counterMs}
                  data-sb-count={p.counterValue}
                  data-suffix={p.counterSuffix}
                >
                  {p.counterValue}
                  {p.counterSuffix}
                </b>
                <span>{p.counterLabel}</span>
              </div>
              <ul className="pg-checks">
                {p.list
                  .split("\n")
                  .map(l => l.trim())
                  .filter(Boolean)
                  .map((l, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
                    <li key={i}>
                      <i>
                        <PgIcon name="check-circle" />
                      </i>
                      <span>{l}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <PgButton ctx={ctx} full label={p.buttonLabel} url={p.buttonUrl} />
          </div>
          <div className="pg-how-media">
            <div className="pg-how-frame">
              <Img alt={p.imageAlt} src={p.image} />
            </div>
          </div>
        </div>
      </section>
    ),
    type: "pgHowItWorks",
  }
);

/* ───────────────────────── soluções ───────────────────────── */

/**
 * `section` → 1 contêiner → 1.1.1 cabeçalho, 1.1.2 grade; cada cartão `1.1.2.N` = 1 cartão (imagem + conteúdo)
 * e 2 etiqueta revelada no hover.
 */
const pgSolutions = defineBlock(
  z.object({
    ...headSchema({}),
    items: itemList({
      buttonLabel: str("Abrir conta"),
      buttonUrl: str(CTA_URL),
      image: str(),
      tag: str(),
      text: str(),
      title: str(),
    }),
    ...layerSchema({ fixed: "yes", opacity: 20 }),
  }),
  {
    fields: [
      ...headFields("Título"),
      listField("items", "Cartões", [
        { key: "image", kind: "image", label: "Imagem" },
        { key: "title", kind: "text", label: "Título" },
        { key: "text", kind: "textarea", label: "Texto" },
        { key: "tag", kind: "text", label: "Etiqueta (aparece no hover)" },
        { key: "buttonLabel", kind: "text", label: "Botão — texto" },
        { key: "buttonUrl", kind: "url", label: "Botão — link" },
      ]),
      ...layerFields,
    ],
    group: "content",
    label: "Soluções (cartões que sobem e revelam a etiqueta)",
    render: (p, ctx) => (
      <section className={layerClass(p, "pg-sol")} style={layerStyle(p)}>
        <div className="pg-wrap">
          <PgHead eyebrow={p.eyebrow} text={p.text} title={p.title} />
          <div className="pg-sol-grid">
            {p.items.map((it, i) => (
              <div className="pg-sol-item" key={`${it.title}-${i}`}>
                <article className="pg-sol-card" style={bgImg(it.image)}>
                  <div className="pg-sol-img">
                    <i />
                  </div>
                  <div className="pg-sol-body">
                    <h4>{it.title}</h4>
                    <p>{it.text}</p>
                    <PgButton
                      ctx={ctx}
                      label={it.buttonLabel}
                      url={it.buttonUrl}
                    />
                  </div>
                </article>
                <div className="pg-sol-tag">{it.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "pgSolutions",
  }
);

/* ───────────────────────── taxas ───────────────────────── */

/**
 * `section` → 1.1 linha → 1.1.1 coluna esquerda (1 cabeçalho, 2 imagem) e 1.1.2 cartões (`1.1.2.N`: 1 imagem,
 * 2 conteúdo). O divisor de forma vem depois da linha.
 */
const pgPricing = defineBlock(
  z.object({
    ...headSchema({}),
    image: str(),
    items: itemList({
      buttonLabel: str("Abrir conta"),
      buttonUrl: str(CTA_URL),
      image: str(),
      text: str(),
      title: str(),
    }),
    veilOpacity: int(0, 100, 60),
    ...layerSchema({ opacity: 0 }),
    ...shapeSchema({
      heightDesktop: 480,
      heightMobile: 124,
      heightTablet: 200,
      shape: "curve-negative",
      widthTablet: 200,
    }),
  }),
  {
    fields: [
      ...headFields("Título"),
      { key: "image", kind: "image", label: "Imagem da coluna" },
      listField("items", "Cartões de taxa", [
        { key: "image", kind: "image", label: "Imagem" },
        { key: "title", kind: "text", label: "Taxa (título)" },
        { key: "text", kind: "textarea", label: "Descrição" },
        { key: "buttonLabel", kind: "text", label: "Botão — texto" },
        { key: "buttonUrl", kind: "url", label: "Botão — link" },
      ]),
      {
        key: "veilOpacity",
        kind: "number",
        label: "Opacidade do véu roxo (%)",
      },
      ...layerFields,
      ...shapeFields,
    ],
    group: "content",
    label: "Taxas (coluna + cartões horizontais)",
    render: (p, ctx) => (
      <section
        className={layerClass(p, "pg-price")}
        style={
          {
            ...layerStyle(p),
            "--pg-veil-o": p.veilOpacity / 100,
          } as CSSProperties
        }
      >
        <div className="pg-wrap pg-price-row">
          <div className="pg-price-left">
            <PgHead eyebrow={p.eyebrow} text={p.text} title={p.title} />
            <div className="pg-price-photo">
              <Img alt="" src={p.image} />
            </div>
          </div>
          <div className="pg-price-cards">
            {p.items.map((it, i) => (
              <article className="pg-pcard" key={`${it.title}-${i}`}>
                <div className="pg-pcard-img" style={bgImg(it.image)}>
                  <i />
                </div>
                <div className="pg-pcard-body">
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                  <PgButton
                    ctx={ctx}
                    label={it.buttonLabel}
                    url={it.buttonUrl}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
        <ShapeDivider p={p} />
      </section>
    ),
    type: "pgPricing",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const SOCIALS = [
  { label: "X", value: "x" },
  { label: "Instagram", value: "instagram" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Facebook", value: "facebook" },
  { label: "YouTube", value: "youtube" },
];

/**
 * `section` → 1 linha → 1.1.1 coluna esquerda (1 sobretítulo, 2 título, 3 texto, 4 carrossel) e 1.1.2 foto.
 * O carrossel é o `data-si-car` do `fx-runtime` (4 s parado + 500 ms de passagem, laço, bolinhas).
 */
const pgTestimonials = defineBlock(
  z.object({
    ...headSchema({}),
    delay: int(0, 30000, 4000),
    items: itemList({
      avatar: str(),
      name: str(),
      network: str("x"),
      role: str(),
      text: str(),
    }),
    photo: str(),
    speed: int(100, 5000, 500),
  }),
  {
    fields: [
      ...headFields("Título"),
      listField("items", "Depoimentos", [
        { key: "avatar", kind: "image", label: "Foto" },
        { key: "name", kind: "text", label: "Nome" },
        { key: "role", kind: "text", label: "Cargo" },
        {
          key: "network",
          kind: "select",
          label: "Rede (ícone do canto)",
          options: SOCIALS,
        },
        { key: "text", kind: "textarea", label: "Texto (vai entre aspas)" },
      ]),
      { key: "delay", kind: "number", label: "Tempo parado entre passes (ms)" },
      { key: "speed", kind: "number", label: "Duração da transição (ms)" },
      { key: "photo", kind: "image", label: "Foto da direita" },
    ],
    group: "content",
    label: "Depoimentos (carrossel que invade a foto)",
    render: p => (
      <section className="pg-testi">
        <div className="pg-wrap pg-testi-row">
          <div className="pg-testi-left">
            <PgHead
              align="left"
              eyebrow={p.eyebrow}
              text={p.text}
              title={p.title}
            />
            <PgCar
              arrows="none"
              className="pg-tcar"
              dots
              items={p.items.map((it, i) => (
                <figure className="pg-tcard" key={`${it.name}-${i}`}>
                  <figcaption>
                    <Img alt={it.name} src={it.avatar} />
                    <div>
                      <h4>{it.name}</h4>
                      <span>{it.role}</span>
                    </div>
                    <i className="pg-net">
                      <SiSocial name={it.network} />
                    </i>
                  </figcaption>
                  <blockquote>“{it.text}”</blockquote>
                </figure>
              ))}
              p={{
                delay: p.delay,
                gap: 0,
                perView: 1,
                perViewMobile: 1,
                perViewTablet: 1,
                speed: p.speed,
              }}
            />
          </div>
          <div className="pg-testi-photo" style={bgImg(p.photo)} />
        </div>
      </section>
    ),
    type: "pgTestimonials",
  }
);

/* ───────────────────────── praticidade e segurança ───────────────────────── */

const SEC_ICONS = PG_ICON_OPTIONS;

/**
 * `section` → 1 linha → 1.1.1 foto, 1.1.2 texto (1 título, 2 texto, 3 lista com divisórias, 4 botão).
 */
const pgSecurity = defineBlock(
  z.object({
    buttonLabel: str("Abrir conta"),
    buttonUrl: str(CTA_URL),
    image: str(),
    imageAlt: str(),
    items: itemList({ icon: str("feather"), text: str() }),
    text: str(),
    title: str(),
    ...layerSchema({ opacity: 12, repeat: "yes" }),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Foto" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da foto" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      listField("items", "Lista com divisórias", [
        { key: "icon", kind: "select", label: "Ícone", options: SEC_ICONS },
        { key: "text", kind: "textarea", label: "Texto" },
      ]),
      ...buttonFields("button", "Botão"),
      ...layerFields,
    ],
    group: "content",
    label: "Praticidade e segurança (foto que sobra da seção)",
    render: (p, ctx) => (
      <section className={layerClass(p, "pg-sec")} style={layerStyle(p)}>
        <div className="pg-sec-row">
          <div className="pg-sec-photo">
            <Img alt={p.imageAlt} src={p.image} />
          </div>
          <div className="pg-sec-text">
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <ul className="pg-sec-list">
              {p.items.map((it, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ordem é a identidade
                <li key={i}>
                  <i>
                    <PgIcon name={it.icon} />
                  </i>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
            <PgButton
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
              variant="grad"
            />
          </div>
        </div>
      </section>
    ),
    type: "pgSecurity",
  }
);

/* ───────────────────────── resultados ───────────────────────── */

/**
 * `section` → 1 contêiner → 1.1.1 cabeçalho, 1.1.2 passos: filho `2N-1` = passo N (1 topo com ícone e número,
 * 2 título, 3 texto) e `2N` = seta depois do passo N.
 */
const pgResults = defineBlock(
  z.object({
    ...headSchema({}),
    items: itemList({
      icon: str(),
      number: str(),
      text: str(),
      title: str(),
    }),
  }),
  {
    fields: [
      ...headFields("Título"),
      listField("items", "Passos", [
        { key: "icon", kind: "image", label: "Ícone" },
        { key: "number", kind: "text", label: "Número (vazado)" },
        { key: "title", kind: "text", label: "Título" },
        { key: "text", kind: "textarea", label: "Texto" },
      ]),
    ],
    group: "content",
    label: "Resultados (passos com número vazado e setas)",
    render: p => {
      const out: ReactNode[] = [];
      p.items.forEach((it, i) => {
        out.push(
          <article className="pg-step" key={`s${i}`}>
            <div className="pg-step-top">
              <Img alt="" src={it.icon} />
              <b className="pg-outline">{it.number}</b>
            </div>
            <h4>{it.title}</h4>
            <p>{it.text}</p>
          </article>
        );
        if (i < p.items.length - 1)
          out.push(
            <i className="pg-step-arrow" key={`a${i}`}>
              <PgIcon name="arrow-long" />
            </i>
          );
      });
      return (
        <section className="pg-res">
          <div className="pg-wrap">
            <PgHead eyebrow={p.eyebrow} text={p.text} title={p.title} />
            <div className="pg-steps">{out}</div>
          </div>
        </section>
      );
    },
    type: "pgResults",
  }
);

/* ───────────────────────── FAQ ───────────────────────── */

/** Cabeçalho de página (FAQ e legais): fundo escuro + imagem fixa + véu radial; título h1 e texto. */
const pageHeadSchema = {
  ...layerSchema({ fixed: "yes", opacity: 100 }),
};

/**
 * Dois filhos: `1` cabeçalho (1 título, 2 texto) e `2` corpo → 2.1 linha → 2.1.1 caixa "FAQs" e 2.1.2 lista
 * (`2.1.2.N` = pergunta N). `mode` `open` mantém todas abertas; `accordion` usa `<details>`.
 */
const pgFaq = defineBlock(
  z.object({
    boxIcon: str(),
    boxTitle: str("FAQs"),
    items: itemList({ answer: str(), question: str() }),
    mode: z.enum(["open", "accordion"]).default("open").catch("open"),
    text: str(),
    title: str("Ficou com alguma dúvida?"),
    ...pageHeadSchema,
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h1)" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...layerFields,
      { key: "boxIcon", kind: "image", label: "Caixa — ícone" },
      { key: "boxTitle", kind: "text", label: "Caixa — título" },
      {
        key: "mode",
        kind: "select",
        label: "Perguntas",
        options: [
          { label: "Sempre abertas", value: "open" },
          { label: "Acordeão (uma aberta por vez)", value: "accordion" },
        ],
      },
      listField("items", "Perguntas", [
        { key: "question", kind: "text", label: "Pergunta" },
        { key: "answer", kind: "textarea", label: "Resposta" },
      ]),
    ],
    group: "content",
    label: "FAQ PagaTG (cabeçalho + perguntas abertas)",
    render: (p, ctx) => {
      const group = `pg-faq-${ctx.path?.length ?? 0}`;
      return (
        <>
          <section
            className={layerClass(p, "pg-pagehead")}
            style={layerStyle(p)}
          >
            <div className="pg-wrap">
              <h1>{p.title}</h1>
              <p className="pg-lead">{p.text}</p>
            </div>
          </section>
          <section className="pg-faq">
            <div className="pg-wrap pg-faq-row">
              <aside className="pg-faq-box">
                <Img alt="" src={p.boxIcon} />
                <h2>{p.boxTitle}</h2>
              </aside>
              <div className="pg-faq-list">
                {p.items.map((it, i) =>
                  p.mode === "accordion" ? (
                    <details
                      className="pg-q"
                      key={`${it.question}-${i}`}
                      name={group}
                    >
                      <summary>
                        <i>
                          <PgIcon name="question-circle" />
                        </i>
                        <h4>{it.question}</h4>
                      </summary>
                      <p>{it.answer}</p>
                    </details>
                  ) : (
                    <div className="pg-q" key={`${it.question}-${i}`}>
                      <i>
                        <PgIcon name="question-circle" />
                      </i>
                      <div>
                        <h4>{it.question}</h4>
                        <p>{it.answer}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        </>
      );
    },
    type: "pgFaq",
  }
);

/* ───────────────────────── legais ───────────────────────── */

/** Cabeçalho (`1`: título) + corpo `prose` (`2`): `## subtítulo`, `- item`, `[texto](link)`. */
const pgLegal = defineBlock(
  z.object({ body: str(), title: str("Título"), ...pageHeadSchema }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da página" },
      {
        key: "body",
        kind: "textarea",
        label: "Texto (## subtítulo, - item, [texto](link))",
      },
      ...layerFields,
    ],
    group: "content",
    label: "Texto legal (PagaTG)",
    render: p => {
      const out: ReactNode[] = [];
      let list: string[] = [];
      const flush = () => {
        if (list.length)
          out.push(
            <ul key={`ul${out.length}`}>
              {list.map((l, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
                <li key={i}>
                  <Inline text={l} />
                </li>
              ))}
            </ul>
          );
        list = [];
      };
      for (const raw of p.body.split("\n")) {
        const l = raw.trim();
        if (!l) continue;
        if (l.startsWith("- ")) {
          list.push(l.slice(2));
          continue;
        }
        flush();
        const h = /^#{2,4}\s+(.*)$/.exec(l);
        if (h) out.push(<h3 key={`h${out.length}`}>{h[1]}</h3>);
        else
          out.push(
            <p key={`p${out.length}`}>
              <Inline text={l} />
            </p>
          );
      }
      flush();
      return (
        <>
          <section
            className={layerClass(p, "pg-pagehead narrow")}
            style={layerStyle(p)}
          >
            <div className="pg-wrap">
              <h1>{p.title}</h1>
            </div>
          </section>
          <section className="pg-prose">
            <div className="pg-wrap pg-prose-in">{out}</div>
          </section>
        </>
      );
    },
    type: "pgLegal",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const pgFooter = defineBlock(
  z.object({
    links: str(),
    text: str("2026 PagaTG. Todos os direitos reservados."),
  }),
  {
    fields: [
      {
        key: "links",
        kind: "textarea",
        label: "Links (Texto | endereço, um por linha)",
      },
      {
        key: "text",
        kind: "text",
        label: "Direitos (o © vem antes; o ano é só texto)",
      },
    ],
    group: "layout",
    label: "Rodapé PagaTG",
    render: (p, ctx) => (
      <footer className="pg-foot">
        <div className="pg-foot-in">
          <hr className="pg-dash" />
          <div className="pg-foot-row">
            <ul className="pg-foot-links">
              {p.links
                .split("\n")
                .map(l => l.trim())
                .filter(Boolean)
                .map((l, i) => {
                  const at = l.indexOf("|");
                  const label = at < 0 ? l : l.slice(0, at).trim();
                  const url = at < 0 ? "#" : l.slice(at + 1).trim();
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
                    <li key={i}>
                      <a href={href(ctx, url)} {...newTab(url)}>
                        <PgIcon name="chevron" />
                        <span>{label}</span>
                      </a>
                    </li>
                  );
                })}
            </ul>
            <p className="pg-copy">
              <PgIcon name="copyright" />
              <span>{p.text}</span>
            </p>
          </div>
        </div>
      </footer>
    ),
    type: "pgFooter",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const pgNotFound = defineBlock(
  z.object({
    buttonLabel: str("Voltar para o início"),
    buttonUrl: str("/"),
    icon: str(),
    text: str(
      "Ops! Esta página pegou o caminho errado no cruzamento da internet. Vamos te levar de volta."
    ),
    title: str("404"),
  }),
  {
    fields: [
      { key: "icon", kind: "image", label: "Ícone" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...buttonFields("button", "Botão"),
    ],
    group: "content",
    label: "Página não encontrada (PagaTG)",
    render: (p, ctx) => (
      <section className="pg-404">
        <div className="pg-404-in">
          <Img alt="" src={p.icon} />
          <h1>{p.title}</h1>
          <p>{p.text}</p>
          <PgButton ctx={ctx} full label={p.buttonLabel} url={p.buttonUrl} />
        </div>
      </section>
    ),
    type: "pgNotFound",
  }
);

export const pagatgBlocks: BlockDefinition[] = [
  pgHeader,
  pgHero,
  pgHighlights,
  pgSplit,
  pgBenefits,
  pgValues,
  pgHowItWorks,
  pgSolutions,
  pgPricing,
  pgTestimonials,
  pgSecurity,
  pgResults,
  pgFaq,
  pgLegal,
  pgFooter,
  pgNotFound,
];
