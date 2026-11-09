import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND, FAVICON } from "./brand.js";
import {
  CASES,
  FILTERS,
  FLOATING,
  INLINE_PHOTOS,
  METHOD,
  PECAS,
  ROWS,
} from "./projects.js";

/**
 * Template "Margem": site de um estúdio de design de marcas (fictício) numa página só, com a variante
 * `margem`. Hero com túnel de projetos em 3D, manifesto com marginália, método em tira de filme, índice
 * de projetos com foto no cursor, depoimento e rodapé. Marca em `brand.ts`, fotos em `images.ts`
 * (registro em `plans/margem-imagens.md`), projetos em `projects.ts`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "anchor" | "fx" | "style">
): Block => ({ id: `mg-${seq++}`, props, type, ...extra });

const page = (slug: string, title: string, blocks: Block[]): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  slug,
  status: "published",
  title,
});

const { numbers: N } = BRAND;

const home = page("", "Início", [
  block(
    "mgTunnel",
    {
      brandName: BRAND.name,
      cases: CASES.map(c => ({
        ...c,
        linkLabel: "Abrir o case →",
        linkUrl: "#projetos",
      })),
      endLabel: "Ver todos os projetos",
      endTitle: `Quatro de ${N.projects}.`,
      endUrl: "#projetos",
      hint: "Role para entrar",
      lines: "Marcas que ainda fazem sentido\ndaqui a dez anos.",
      logo: "",
      place: `${BRAND.city} · ${N.projects} projetos desde ${N.since}`,
      screens: 11,
      wall: PECAS,
    },
    { anchor: "topo" }
  ),
  block(
    "mgManifesto",
    {
      dots: BRAND.team.map(color => ({ color })),
      label: "Estúdio",
      notes: [
        { at: "pessoas", text: `desde ${N.since}` },
        { at: "Desenhamos", text: `${N.projects} projetos` },
        { at: "[1]", text: `${N.cities} cidades do Nordeste` },
      ],
      photos: INLINE_PHOTOS,
      text: "Somos seis pessoas numa casa no Poço da Panela. Desenhamos marcas para quem faz coisas com as [1]: café, [2], livro, cadeira, festa.",
    },
    { anchor: "estudio" }
  ),
  block("mgMethod", {
    frames: METHOD,
    gridColor: "#a9a49a",
    markColor: BRAND.colors.green,
    paperColor: "#f7f5f0",
    screens: 2.6,
    title: "Como uma marca nasce aqui",
  }),
  block(
    "mgIndex",
    {
      allLabel: "Todos",
      countText: "{n} de {total} projetos",
      filters: FILTERS,
      rows: ROWS,
      title: "Todos os projetos",
      total: N.projects,
    },
    { anchor: "projetos" }
  ),
  block("mgQuote", {
    author: "Lúcia Amaral, Torra Alta",
    photos: FLOATING,
    quote:
      "Eles passaram três semanas só ouvindo. A marca saiu em dez dias e nunca mais mexemos.",
  }),
]);

const notFound = page("404", "Página não encontrada", [
  block(
    "heading",
    {
      align: "left",
      eyebrow: "",
      level: "h1",
      subtitle: "",
      text: "Esta página não existe.",
      watermark: "",
    },
    { style: { padding: "160px 0 0" } }
  ),
  block("text", {
    text: "O endereço pode ter mudado. Os projetos continuam todos na página inicial.",
  }),
  block(
    "button",
    { buttonLabel: "Voltar para o início", buttonUrl: "/", variant: "primary" },
    { style: { padding: "0 0 160px" } }
  ),
]);

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block(
      "mgFooter",
      {
        address: BRAND.address,
        brandName: BRAND.name,
        ctaLabel: "Escrever para o estúdio",
        ctaTitle: "Tem uma marca para desenhar?",
        ctaUrl: `mailto:${BRAND.email}`,
        email: BRAND.email,
        logo: "",
        socials: BRAND.socials.map(s => ({ ...s })),
      },
      { anchor: "contato" }
    ),
  ],
  header: [
    block("mgNav", {
      brandName: BRAND.name,
      links: [
        { label: "Projetos", url: "#projetos" },
        { label: "Estúdio", url: "#estudio" },
        { label: "Contato", url: "#contato" },
      ],
      logo: "",
      logoUrl: "/",
    }),
  ],
  menu: [
    { href: "#projetos", label: "Projetos" },
    { href: "#estudio", label: "Estúdio" },
    { href: "#contato", label: "Contato" },
  ],
  name: BRAND.name,
  pages: [home, notFound],
  postLayout: [],
  posts: [],
  theme: {
    accent: BRAND.colors.terra,
    bg: BRAND.colors.bg,
    card: BRAND.colors.pill,
    favicon: FAVICON,
    fg: BRAND.colors.fg,
    fontBody: `'${BRAND.font}', sans-serif`,
    fontHeading: `'${BRAND.font}', sans-serif`,
    green: BRAND.colors.green,
    line: BRAND.colors.line,
    muted: BRAND.colors.muted,
    variant: "margem",
  },
};

export const margem: SiteTemplate = {
  description:
    "Portfólio de estúdio de marcas, off-white e tipográfico: o scroll entra num túnel 3D de fotos de projetos e cada destaque sai da parede para abrir o case. Manifesto com notas na margem, método em tira de filme, índice com filtros e foto que segue o cursor, depoimento e rodapé com o wordmark.",
  id: "margem",
  name: "Margem",
  preview: CASES[0]?.image ?? "",
  site,
  tags: ["Portfólio", "Estúdio", "Landing"],
};
