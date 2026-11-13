import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { type LegalItem, PRIVACIDADE, TERMOS } from "../blog-viagens/legal.js";
import { categorySeeds, posts } from "./posts.js";

const NAME = "Portal Notícias";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const PREVIEW = img("1504711434969-e33886168f5c", 2000);

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  children?: Block[]
): Block => ({ children, id: `tpl-pn-${seq++}`, props, type });

const SHORTS = [
  [
    "1486406146926-c627a92ad1ab",
    "Prédio-sede passa por reforma e muda rotina do centro",
    "1 min",
  ],
  [
    "1461896836934-ffe607ba8211",
    "Atletas largam em corrida de rua recorde",
    "14 seg",
  ],
  [
    "1518770660439-4636190af475",
    "Novo chip promete bateria que dura o dobro",
    "41 seg",
  ],
  [
    "1514525253161-7a46d19cd819",
    "Festival gratuito lota praças do centro histórico",
    "1 min",
  ],
  [
    "1576091160399-112ba8d25d1d",
    "Vacinação aos sábados: veja onde ir",
    "33 seg",
  ],
  [
    "1579952363873-27f3bade9f55",
    "Gol nos acréscimos garante a liderança",
    "25 seg",
  ],
].map(([id, title, duration]) => ({
  duration,
  image: img(id as string, 500),
  title,
  url: "/",
}));

const skin = (name: string) => block("skinBar", { skin: name });

const WIDE_PAGES = new Set(["editorias", "pesquisa"]);

const page = (slug: string, title: string, blocks: Block[]): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  prose:
    slug === "termos-de-uso" || slug === "politica-de-privacidade" || undefined,
  slug,
  status: "published",
  title,
  wide: WIDE_PAGES.has(slug) || undefined,
});

/** Os textos legais são os mesmos do blog; só troca o nome do site e tira o tom de viagem. */
const adapt = (items: LegalItem[]): LegalItem[] =>
  items.map(([kind, text]) => [
    kind,
    text
      .replaceAll("Meu Diário", NAME)
      .replaceAll(
        "Preços, horários e condições de viagem mudam",
        "Dados e fatos mudam"
      ),
  ]);

const legalBlocks = (items: LegalItem[]): Block[] =>
  adapt(items).map(([kind, text]) =>
    kind === "h"
      ? block("heading", { align: "left", level: "h2", subtitle: "", text })
      : block("text", { text: kind === "li" ? `• ${text}` : text })
  );

const legal = (title: string) => {
  const termos = title === "Termos de Uso";
  return page(termos ? "termos-de-uso" : "politica-de-privacidade", title, [
    block("adSlot", { size: "banner" }),
    block("heading", {
      align: "left",
      level: "h1",
      subtitle: "",
      text: title,
    }),
    ...legalBlocks(termos ? TERMOS : PRIVACIDADE),
  ]);
};

const site: Site = {
  categories: categorySeeds.map(([slug, name]) => ({
    id: `cat-${slug}`,
    name,
    slug,
  })),
  categoryLayout: [
    block("adSlot", { size: "banner" }),
    block("catSlider", { limit: 6 }),
    block("catChips", { title: "Veja também" }),
    block("shortVideos", { items: SHORTS, title: "Vídeos curtos" }),
    block("newsFeed", {
      fromCategory: "yes",
      limit: 20,
      popularTitle: "Mais lidas",
      skip: 0,
    }),
  ],
  footer: [
    block("footer", {
      copyright: `© ${NAME}. Todos os direitos reservados.`,
      email: "redacao@seudominio.com",
      extraLinks: [],
      helpText: "Envie sugestões de pauta e correções para a redação.",
      logo: "",
      logoText: NAME,
      socials: [
        { label: "Instagram", url: "#" },
        { label: "YouTube", url: "#" },
        { label: "Facebook", url: "#" },
        { label: "X", url: "#" },
      ],
    }),
  ],
  header: [
    block("header", {
      buttonLabel: "",
      buttonUrl: "mailto:redacao@seudominio.com",
      featuredLabel: "Especial: Eleições",
      featuredUrl: "/category/politica/",
      logo: "",
      logoText: NAME,
      topLinks: [
        { label: "portal.com", url: "/portal/" },
        { label: "notícias", url: "/" },
        { label: "esporte", url: "/esporte/" },
        { label: "entretenimento", url: "/entretenimento/" },
        { label: "receitas", url: "/receitas/" },
        { label: "lifestyle", url: "/lifestyle/" },
        { label: "tv", url: "/tv/" },
      ],
    }),
  ],
  menu: [
    { href: "/", label: "Início" },
    ...categorySeeds.map(([slug, name]) => ({
      href: `/category/${slug}/`,
      label: name,
    })),
  ],
  name: NAME,
  pages: [
    page("", "Início", [
      block("adSlot", { size: "banner" }),
      block("newsFront", { relatedCount: 3 }),
      block("newsFeed", {
        limit: 3,
        popularTitle: "Mais lidas",
        sideFlow: "yes",
        skip: 6,
      }),
      block("shortVideos", {
        items: SHORTS,
        title: "Vídeos curtos",
      }),
      block("newsFeed", {
        limit: 3,
        moreLabel: "Mostrar mais",
        moreUrl: "/editorias/",
        showSide: "no",
        skip: 9,
      }),
    ]),
    page("portal", "Portal", [
      block("adSlot", { size: "banner" }),
      block("hubFront", {}),
      block("hubSections", {
        columns: [
          { categorySlug: "politica", title: "Notícias" },
          { categorySlug: "esporte", title: "Esporte" },
          { categorySlug: "cultura", title: "Entretenimento" },
        ],
        rolouTitle: "Rolou no fim de semana: você viu?",
        rolouUrl: "/editorias/",
      }),
      block("hubWidgets", {}),
      block("hubVideos", {
        items: SHORTS.slice(0, 6).map(s => ({
          ...s,
          image: s.image.replace("w=500", "w=900"),
        })),
        title: "Vídeos em alta",
      }),
      block("hubTop", {
        columns: [
          { categorySlug: "politica", title: "Notícias" },
          { categorySlug: "esporte", title: "Esporte" },
          { categorySlug: "cultura", title: "Entretenimento" },
        ],
        title: "Top Portal",
      }),
    ]),
    page("esporte", "Esporte", [
      skin("ge"),
      block("adSlot", { size: "banner" }),
      block("scoreStrip", {}),
      block("mosaic", { categorySlug: "esporte" }),
      block("shortVideos", { items: SHORTS, title: "Vídeos curtos" }),
      block("newsFeed", { limit: 5, skip: 0 }),
    ]),
    page("entretenimento", "Entretenimento", [
      skin("gshow"),
      block("adSlot", { size: "banner" }),
      block("catSlider", { categorySlug: "cultura", limit: 6 }),
      block("catChips", { title: "Veja também" }),
      block("shortVideos", { items: SHORTS, title: "Vídeos curtos" }),
      block("newsFeed", { limit: 6, skip: 0 }),
    ]),
    page("receitas", "Receitas", [
      skin("receitas"),
      block("adSlot", { size: "banner" }),
      block("mosaic", { categorySlug: "saude" }),
      block("roundChips", { title: "Navegue por categoria" }),
      block("newsFeed", { limit: 3, skip: 0 }),
      block("shortVideos", { items: SHORTS, title: "Vídeos curtos" }),
      block("newsSection", {
        categorySlug: "economia",
        limit: 4,
        title: "Econômicas e rápidas",
      }),
    ]),
    page("lifestyle", "Lifestyle", [
      skin("gnt"),
      block("adSlot", { size: "banner" }),
      block("hubFront", {}),
      block("hubSections", {
        columns: [
          { categorySlug: "saude", title: "Bem-estar" },
          { categorySlug: "cultura", title: "Cultura" },
          { categorySlug: "tecnologia", title: "Casa e tecnologia" },
        ],
        rolouTitle: "Em alta no lifestyle",
        rolouUrl: "/editorias/",
      }),
      block("adSlot", { size: "banner" }),
      block("shortVideos", {
        items: SHORTS,
        sideAd: "side",
        title: "Em vídeo",
      }),
    ]),
    page("tv", "TV", [
      skin("redeglobo"),
      block("adSlot", { size: "banner" }),
      block("tvHero", {}),
      block("roundChips", { title: "Atalhos" }),
      block("newsFeed", { limit: 3, skip: 0 }),
      block("hubVideos", {
        items: SHORTS.slice(0, 6).map(s => ({
          ...s,
          image: s.image.replace("w=500", "w=900"),
        })),
        title: "Em alta na TV",
      }),
    ]),
    page("editorias", "Editorias", [
      block("adSlot", { size: "banner" }),
      block("heading", {
        align: "left",
        level: "h1",
        subtitle: "Escolha uma editoria e acompanhe as notícias.",
        text: "Editorias",
      }),
      block("categoryGrid", {
        buttonLabel: "",
        buttonUrl: "",
        images: [],
        limit: 0,
        subtitle: "",
        title: "",
      }),
    ]),
    page("pesquisa", "Resultado da Pesquisa", [
      block("adSlot", { size: "banner" }),
      block("categorySearch", {}),
      block("categoryHeader", {
        backLabel: "Início",
        backUrl: "/",
        title: "Resultado da Pesquisa:",
      }),
      block("postList", { limit: 100, title: "" }),
    ]),
    page("404", "Página não encontrada", [
      block("heading", {
        align: "center",
        level: "h1",
        subtitle:
          "A página que você procura não existe ou foi movida. Volte ao início e acompanhe as últimas notícias.",
        text: "Página não encontrada",
      }),
    ]),
    legal("Termos de Uso"),
    legal("Política de Privacidade"),
  ],
  postLayout: [
    block("adSlot", { size: "banner" }),
    block("postHeader", { showCover: "no", watermark: "" }),
    block("twoColumns", {}, [
      block("postContent", { showMeta: "yes" }),
      block("sidebarBanner", { image: "", url: "/" }),
    ]),
    block("adSlot", { size: "banner" }),
    block("postList", { limit: 4, title: "Leia também" }),
  ],
  posts,
  theme: {
    accent: "#c4170c",
    adsSide: "3",
    bg: "#f9f9f9",
    card: "#ffffff",
    fg: "#22252b",
    fontAccent: "'Roboto', sans-serif",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Roboto', sans-serif",
    footerBg: "#c4170c",
    muted: "#4f5664",
    variant: "portal",
  },
};

export const portalNoticias: SiteTemplate = {
  description:
    "Portal de notícias com manchete em destaque, últimas notícias, editorias e matérias de exemplo. Inspirado em grandes portais de jornalismo; textos e imagens genéricos para você trocar.",
  id: "portal-noticias",
  name: "Portal Notícias — Jornal Online",
  preview: PREVIEW,
  site,
  tags: ["Notícias", "Blog"],
};
