import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, Inline, newTab } from "./helpers.js";
import {
  carFields,
  carSchema,
  int,
  lines,
  parseLinks,
  SiButton,
  SiCar,
  SiIcon,
  SiSocial,
  str,
  yesNo,
} from "./sim-lib.js";
import type { BlockDefinition, FieldDef } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos das páginas internas do tema SIM Intermediações: equipe, títulos, carrosséis de imagens e de vídeos,
 * grades de sites e de redes sociais, bloco "Design" e texto legal. Visual em `renderer/sim.ts` (`.sb-si`).
 */

const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

const bgTex = (url: string) => ({ "--si-tex": cssUrl(url) }) as CSSProperties;

/* ───────────────────────── equipe + empresa ───────────────────────── */

/**
 * `.si-team-in` (1.1): 1 cartão da equipe, 2 coluna do texto (1.1.2: título, texto, listas, botão).
 * O cartão traz foto, nome, cargo e o Instagram; o texto de exemplo do cartão do ElementsKit não foi copiado.
 */
const siTeam = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str("#"),
    instagram: str(),
    list1: str(),
    list2: str(),
    name: str("Nome"),
    photo: str(),
    role: str(),
    text: str(),
    texture: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "photo", kind: "image", label: "Foto" },
      { key: "name", kind: "text", label: "Nome" },
      { key: "role", kind: "text", label: "Cargo" },
      { key: "instagram", kind: "url", label: "Instagram (link)" },
      { key: "texture", kind: "image", label: "Textura do cartão" },
      { key: "title", kind: "text", label: "Título da coluna" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "list1", kind: "textarea", label: "Lista 1 (um item por linha)" },
      { key: "list2", kind: "textarea", label: "Lista 2 (um item por linha)" },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
    ],
    group: "content",
    label: "Equipe e empresa (SIM)",
    render: (p, ctx) => (
      <section className="si-team">
        <div className="si-wrap si-team-in">
          <div className="si-team-card" style={bgTex(p.texture)}>
            <div className="si-member">
              <div className="si-member-photo">
                <Img alt={p.name} src={p.photo} />
                {p.instagram ? (
                  <span className="si-member-soc">
                    <a
                      aria-label="Instagram"
                      href={href(ctx, p.instagram)}
                      {...newTab(p.instagram)}
                    >
                      <SiSocial name="instagram" />
                    </a>
                  </span>
                ) : null}
              </div>
              <h4>{p.name}</h4>
              <p>{p.role}</p>
            </div>
          </div>
          <div className="si-team-text">
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <div className="si-team-lists">
              {[p.list1, p.list2].map((list, k) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: duas listas fixas
                <ul className="si-checks" key={k}>
                  {lines(list).map((l, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
                    <li key={i}>
                      <i>
                        <SiIcon name="check" />
                      </i>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <SiButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
        </div>
      </section>
    ),
    type: "siTeam",
  }
);

/* ───────────────────────── título de seção ───────────────────────── */

const siTitle = defineBlock(
  z.object({
    align: z.enum(["center", "left"]).default("center").catch("center"),
    gradient: yesNo("yes"),
    marginTop: int(0, 400, 0),
    text: str(),
    title: str("Título"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto abaixo" },
      {
        key: "gradient",
        kind: "select",
        label: "Título em degradê",
        options: YES_NO,
      },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento",
        options: [
          { label: "Centro", value: "center" },
          { label: "Esquerda", value: "left" },
        ],
      },
      { key: "marginTop", kind: "number", label: "Margem em cima (px)" },
    ],
    group: "content",
    label: "Título de seção com degradê (SIM)",
    render: p => (
      <section
        className={`si-title ${p.align}`}
        style={{ "--si-mt": `${p.marginTop}px` } as CSSProperties}
      >
        <h2>
          <span className={p.gradient === "yes" ? "grad" : undefined}>
            {p.title}
          </span>
        </h2>
        {p.text ? <p>{p.text}</p> : null}
      </section>
    ),
    type: "siTitle",
  }
);

/* ───────────────────────── carrossel de imagens ───────────────────────── */

const carBase = {
  arrows: z
    .enum(["outside", "inside", "none"])
    .default("outside")
    .catch("outside"),
  dots: yesNo("yes"),
  maxWidth: int(0, 2000, 0),
  title: str(),
};
const carBaseFields: FieldDef[] = [
  { key: "title", kind: "text", label: "Título (opcional)" },
  {
    key: "arrows",
    kind: "select",
    label: "Setas",
    options: [
      { label: "Fora das imagens", value: "outside" },
      { label: "Dentro das imagens", value: "inside" },
      { label: "Sem setas", value: "none" },
    ],
  },
  { key: "dots", kind: "select", label: "Bolinhas", options: YES_NO },
  {
    key: "maxWidth",
    kind: "number",
    label: "Largura máxima (px; 0 = toda a largura)",
  },
];

const wrapStyle = (maxWidth: number) =>
  maxWidth ? ({ maxWidth: `${maxWidth}px` } as CSSProperties) : undefined;

const siImageCarousel = defineBlock(
  z.object({
    ...carBase,
    ...carSchema({
      delay: 5000,
      gap: 10,
      perView: 2,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
    }),
    items: z
      .array(z.object({ alt: str(), image: str(), url: str() }))
      .default([])
      .catch([]),
  }),
  {
    fields: [
      ...carBaseFields,
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Descrição" },
          { key: "url", kind: "url", label: "Link (opcional)" },
        ],
        key: "items",
        kind: "list",
        label: "Imagens",
      },
      ...carFields(),
    ],
    group: "media",
    label: "Carrossel de imagens (SIM)",
    render: (p, ctx) => (
      <section className="si-carsec">
        {p.title ? <h3>{p.title}</h3> : <span hidden />}
        <div className="si-carwrap" style={wrapStyle(p.maxWidth)}>
          <SiCar
            arrows={p.arrows}
            className="si-imgcar"
            dots={p.dots === "yes"}
            items={p.items.map((it, i) => {
              const img = <Img alt={it.alt} src={it.image} />;
              return it.url ? (
                <a
                  href={href(ctx, it.url)}
                  key={`${it.image}-${i}`}
                  {...newTab(it.url)}
                >
                  {img}
                </a>
              ) : (
                <span key={`${it.image}-${i}`}>{img}</span>
              );
            })}
            p={p}
          />
        </div>
      </section>
    ),
    type: "siImageCarousel",
  }
);

/* ───────────────────────── carrossel de vídeos ───────────────────────── */

/** Cada slide é uma miniatura com botão "Play" que abre o vídeo (YouTube ou Vimeo) no popup `data-sb-video`. */
const siVideoCarousel = defineBlock(
  z.object({
    ...carBase,
    ...carSchema({
      delay: 5000,
      gap: 10,
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
    }),
    items: z
      .array(z.object({ thumb: str(), title: str(), video: str() }))
      .default([])
      .catch([]),
    ratio: z.enum(["16:9", "9:16"]).default("16:9").catch("16:9"),
  }),
  {
    fields: [
      ...carBaseFields,
      {
        key: "ratio",
        kind: "select",
        label: "Proporção das miniaturas",
        options: [
          { label: "Horizontal (16:9)", value: "16:9" },
          { label: "Vertical (9:16)", value: "9:16" },
        ],
      },
      {
        itemFields: [
          { key: "thumb", kind: "image", label: "Miniatura" },
          { key: "video", kind: "text", label: "Vídeo (YouTube ou Vimeo)" },
          { key: "title", kind: "text", label: "Descrição (acessibilidade)" },
        ],
        key: "items",
        kind: "list",
        label: "Vídeos",
      },
      ...carFields(),
    ],
    group: "media",
    label: "Carrossel de vídeos com popup (SIM)",
    render: p => (
      <section className="si-carsec">
        {p.title ? <h3>{p.title}</h3> : <span hidden />}
        <div className="si-carwrap" style={wrapStyle(p.maxWidth)}>
          <SiCar
            arrows={p.arrows}
            className={`si-vidcar ${p.ratio === "9:16" ? "tall" : "wide"}`}
            dots={p.dots === "yes"}
            items={p.items.map((it, i) => {
              const embed = popupVideoEmbed(it.video);
              return (
                <a
                  aria-label={it.title || "Reproduzir vídeo"}
                  className="si-vid"
                  data-sb-video={embed ?? undefined}
                  href={it.video || "#"}
                  key={`${it.video}-${i}`}
                  {...newTab(it.video)}
                >
                  <Img alt={it.title} src={it.thumb} />
                  <span className="si-vid-play">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M6 3l14 9-14 9z" />
                    </svg>
                    <b>Play</b>
                  </span>
                </a>
              );
            })}
            p={p}
          />
        </div>
      </section>
    ),
    type: "siVideoCarousel",
  }
);

/* ───────────────────────── bloco "Design" ───────────────────────── */

/**
 * `.si-feature-in` (1.1): 1 carrossel (setas dentro, bolinhas fora), 2 coluna do título + texto, 3 enfeite
 * posicionado em `absolute` (imagem grande que entra pela esquerda).
 */
const siFeature = defineBlock(
  z.object({
    ...carSchema({
      delay: 5000,
      gap: 10,
      perView: 1,
      perViewMobile: 1,
      perViewTablet: 1,
      speed: 500,
    }),
    decor: str(),
    items: z
      .array(z.object({ alt: str(), image: str() }))
      .default([])
      .catch([]),
    text: str(),
    title: str("Design"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto (parágrafos em linhas)" },
      {
        key: "decor",
        kind: "image",
        label: "Imagem decorativa (entra pela esquerda)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Descrição" },
        ],
        key: "items",
        kind: "list",
        label: "Imagens do carrossel",
      },
      ...carFields(),
    ],
    group: "content",
    label: "Carrossel com texto ao lado (SIM)",
    render: p => (
      <section className="si-feature">
        <div className="si-wrap si-feature-in">
          <div className="si-feature-car">
            <SiCar
              arrows="inside"
              className="si-imgcar"
              dots
              items={p.items.map((it, i) => (
                <Img alt={it.alt} key={`${it.image}-${i}`} src={it.image} />
              ))}
              p={p}
            />
          </div>
          <div className="si-feature-text">
            <h2>
              <span className="grad">{p.title}</span>
            </h2>
            {lines(p.text).map((l, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas
              <p key={i}>{l}</p>
            ))}
          </div>
          {p.decor ? (
            <div aria-hidden="true" className="si-feature-decor">
              <Img alt="" src={p.decor} />
            </div>
          ) : null}
        </div>
      </section>
    ),
    type: "siFeature",
  }
);

/* ───────────────────────── grade de sites ───────────────────────── */

const gridSchema = {
  columns: int(1, 6, 5),
  columnsMobile: int(1, 4, 2),
  columnsTablet: int(1, 6, 3),
};
const gridFields: FieldDef[] = [
  { key: "columns", kind: "number", label: "Colunas (computador)" },
  { key: "columnsTablet", kind: "number", label: "Colunas (tablet)" },
  { key: "columnsMobile", kind: "number", label: "Colunas (celular)" },
];
const gridStyle = (p: {
  columns: number;
  columnsMobile: number;
  columnsTablet: number;
}) =>
  ({
    "--si-c-d": p.columns,
    "--si-c-m": p.columnsMobile,
    "--si-c-t": p.columnsTablet,
  }) as CSSProperties;

const siSiteCards = defineBlock(
  z.object({
    ...gridSchema,
    items: z
      .array(z.object({ image: str(), name: str(), url: str() }))
      .default([])
      .catch([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Logo" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "url", kind: "url", label: "Endereço do site" },
        ],
        key: "items",
        kind: "list",
        label: "Sites",
      },
      ...gridFields,
    ],
    group: "content",
    label: "Grade de sites desenvolvidos (SIM)",
    render: (p, ctx) => (
      <section className="si-sites">
        <div className="si-wrap si-grid" style={gridStyle(p)}>
          {p.items.map((it, i) => (
            <article className="si-site" key={`${it.name}-${i}`}>
              <div className="si-site-logo">
                <Img alt={it.name} src={it.image} />
              </div>
              <h4>{it.name}</h4>
              <a
                aria-label={`Abrir ${it.name}`}
                className="si-round"
                href={href(ctx, it.url)}
                {...newTab(it.url)}
              >
                <SiIcon name="globe" />
              </a>
            </article>
          ))}
        </div>
      </section>
    ),
    type: "siSiteCards",
  }
);

/* ───────────────────────── redes sociais e influenciadores ───────────────────────── */

const siSocialCards = defineBlock(
  z.object({
    ...gridSchema,
    columns: int(1, 6, 3),
    columnsMobile: int(1, 4, 1),
    columnsTablet: int(1, 6, 2),
    items: z
      .array(z.object({ image: str(), links: str(), name: str() }))
      .default([])
      .catch([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem do perfil" },
          { key: "name", kind: "text", label: "Nome (opcional)" },
          {
            key: "links",
            kind: "textarea",
            label: "Redes (rede | endereço, uma por linha)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Perfis",
      },
      ...gridFields,
    ],
    group: "content",
    label: "Cartões de perfis e redes sociais (SIM)",
    render: (p, ctx) => (
      <section className="si-socials-sec">
        <div className="si-wrap si-grid" style={gridStyle(p)}>
          {p.items.map((it, i) => (
            <article className="si-prof" key={`${it.name}-${it.image}-${i}`}>
              <Img alt={it.name} src={it.image} />
              {it.name ? <h4>{it.name}</h4> : null}
              <div className="si-socials">
                {parseLinks(it.links).map((l, k) => (
                  <a
                    aria-label={l.label}
                    href={href(ctx, l.url)}
                    key={`${l.label}-${k}`}
                    {...newTab(l.url)}
                  >
                    <SiSocial name={l.label} />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    ),
    type: "siSocialCards",
  }
);

/* ───────────────────────── texto legal ───────────────────────── */

/**
 * Texto longo (política, termos): `# título`, `## subtítulo`, `- item`, parágrafos e `[texto](link)`.
 * Fica em `.si-prose`: títulos brancos e texto `#C9C9C9` sobre o fundo escuro.
 */
const siProse = defineBlock(z.object({ body: str(), title: str("Título") }), {
  fields: [
    { key: "title", kind: "text", label: "Título da página" },
    {
      key: "body",
      kind: "textarea",
      label: "Texto (## subtítulo, - item, [texto](link))",
    },
  ],
  group: "content",
  label: "Texto legal (SIM)",
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
      const h = /^(#{2,4})\s+(.*)$/.exec(l);
      if (h) {
        const Tag = `h${(h[1] ?? "##").length + 1}` as "h3";
        out.push(<Tag key={`h${out.length}`}>{h[2]}</Tag>);
      } else
        out.push(
          <p key={`p${out.length}`}>
            <Inline text={l} />
          </p>
        );
    }
    flush();
    return (
      <section className="si-prose">
        <div className="si-prose-in">
          <h1>{p.title}</h1>
          {out}
        </div>
      </section>
    );
  },
  type: "siProse",
});

export const simPageBlocks: BlockDefinition[] = [
  siTeam,
  siTitle,
  siImageCarousel,
  siVideoCarousel,
  siFeature,
  siSiteCards,
  siSocialCards,
  siProse,
];
