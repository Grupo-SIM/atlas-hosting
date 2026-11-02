import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { type LegalItem, PRIVACIDADE, TERMOS } from "./legal.js";
import { categorySeeds, posts } from "./posts.js";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const HERO = img("1469474968028-56623f02e42e", 2000);
const STATS_BG = img("1501785888041-af3ef285b470", 2000);

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  children?: Block[],
  fx?: Block["fx"]
): Block => ({ children, fx, id: `tpl-${seq++}`, props, type });

const WIDE_PAGES = new Set(["categorias", "pesquisa"]);

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

const legalBlocks = (items: LegalItem[]): Block[] =>
  items.map(([kind, text]) =>
    kind === "h"
      ? block("heading", { align: "left", level: "h2", subtitle: "", text })
      : block("text", { text: kind === "li" ? `• ${text}` : text })
  );

const legal = (title: string) => {
  const termos = title === "Termos de Uso";
  return page(termos ? "termos-de-uso" : "politica-de-privacidade", title, [
    block("heading", {
      align: "left",
      level: "h1",
      subtitle: "",
      text: title,
      watermark: termos ? "Termos" : "Privacidade",
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
    block("categorySearch", {}),
    block("categoryHeader", { backLabel: "Voltar" }),
    block("postList", { limit: 12, title: "" }),
  ],
  footer: [
    block(
      "footer",
      {
        copyright: "Copyright © Meu Diário",
        email: "contato@seudominio.com",
        extraLinks: [],
        helpText: "",
        logo: "",
        logoText: "Meu Diário",
        socials: [
          { label: "Instagram", url: "#" },
          { label: "YouTube", url: "#" },
          { label: "Facebook", url: "#" },
          { label: "TikTok", url: "#" },
        ],
      },
      undefined,
      {
        "1.1.3.5": { each: true, hover: "pop" },
      }
    ),
  ],
  header: [
    block("header", {
      buttonLabel: "Fale comigo",
      buttonUrl: "/links/",
      logo: "",
      logoText: "Meu Diário",
    }),
  ],
  menu: [{ dynamic: "categories", href: "/categorias/", label: "Categorias" }],
  name: "Meu Diário",
  pages: [
    page("", "Início", [
      block(
        "hero",
        {
          backgroundImage: HERO,
          buttonLabel: "Ler os roteiros →",
          buttonUrl: "#conteudos",
          text: "Histórias, roteiros e dicas para você viajar melhor, gastando menos e vivendo mais cada lugar.",
        },
        undefined,
        {
          "": { parallax: -2 },
          "1.1.2": { delay: 100, enter: "zoomIn", hover: "shrink" },
        }
      ),
      block("heading", {
        align: "left",
        level: "h2",
        subtitle: "Escolha um tema e comece a planejar a próxima viagem.",
        text: "Do planejamento à estrada",
      }),
      block("categoryGrid", {
        buttonLabel: "Ver todas as categorias",
        buttonUrl: "/categorias/",
        images: [
          {
            src: img("1501785888041-af3ef285b470", 800),
            text: "Lugares para conhecer, de cidades históricas a refúgios de natureza.",
          },
          {
            src: img("1476514525535-07fb3b4ae5f1", 800),
            text: "Roteiros prontos, por dias e por estilo de viagem.",
          },
          {
            src: img("1488646953014-85cb44e25828", 800),
            text: "Dicas práticas para organizar, economizar e evitar imprevistos.",
          },
          {
            src: img("1414235077428-338989a2e8c0", 800),
            text: "Onde e como comer bem, longe das armadilhas para turistas.",
          },
          {
            src: img("1506905925346-21bda4d32df4", 800),
            text: "Hábitos e reflexões para viver a viagem com mais leveza.",
          },
          {
            src: img("1507525428034-b723cf961d3e", 800),
            text: "Bagagem, tecnologia e itens que realmente valem o espaço.",
          },
        ],
        limit: 6,
        subtitle: "",
        title: "",
      }),
      block("heading", {
        align: "center",
        level: "h2",
        subtitle: "",
        text: "Viajar é a melhor forma de aprender",
        watermark: "Explore",
      }),
      block(
        "stats",
        {
          backgroundImage: STATS_BG,
          items: [
            { label: "Anos viajando", suffix: "+", value: "10" },
            { label: "Destinos visitados", suffix: "+", value: "40" },
            { label: "Leitores satisfeitos", suffix: "%", value: "98" },
          ],
          title: "",
        },
        undefined,
        { "1.2": { count: true, delay: 100, enter: "fadeInUp" } }
      ),
      block("featuredPost", {
        label: "Melhor Post",
        postSlug: "roteiro-de-fim-de-semana-sem-correria",
      }),
      block("testimonials", {
        items: [
          {
            avatar: img("1494790108377-be9c29b29330", 200),
            name: "Camila Duarte",
            quote:
              "Segui o roteiro de fim de semana e foi a viagem mais tranquila que já fiz. Tudo muito claro e direto.",
            role: "Leitora",
          },
          {
            avatar: img("1507003211169-0a1dd7228f2d", 200),
            name: "Rafael Moreira",
            quote:
              "As dicas de economia me fizeram cortar quase um terço do orçamento da última viagem.",
            role: "Leitor",
          },
          {
            avatar: img("1438761681033-6461ffad8d80", 200),
            name: "Patrícia Lemos",
            quote:
              "Adoro o jeito simples de explicar. Já indiquei o blog para toda a família.",
            role: "Leitora",
          },
          {
            avatar: img("1500648767791-00dcc994a43e", 200),
            name: "Diego Santana",
            quote:
              "O checklist antes de viajar virou item obrigatório aqui em casa.",
            role: "Leitor",
          },
        ],
        subtitle: "Quem acompanha sabe: aqui o conteúdo sai do papel.",
        title: "O que dizem os leitores",
      }),
      block(
        "splitSection",
        {
          buttonLabel: "Ver Mais →",
          buttonUrl: "/categorias/",
          decoration: "",
          image: img("1522202176988-66273c2fd55f", 1200),
          text: "Um espaço para quem gosta de planejar, explorar e compartilhar. Cada texto nasce de uma experiência real e é escrito para ajudar você a ir mais longe.",
          title: "Uma comunidade de pessoas curiosas pelo mundo",
        },
        undefined,
        {
          "1.1": { parallax: -3 },
          "1.2": { enter: "fadeInLeft" },
          "1.2.3": { hover: "shrink" },
          "1.3": { parallax: 2 },
        }
      ),
      block("postExplorer", {
        layout: "magazine",
        limit: 6,
        title: "Todos os conteúdos",
      }),
    ]),
    page("categorias", "Categorias", [
      block("heading", {
        align: "left",
        level: "h1",
        subtitle: "Escolha sobre o que você quer ler hoje...",
        text: "Categorias",
      }),
      block("categoryGrid", {
        buttonLabel: "",
        buttonUrl: "",
        images: [],
        limit: 0,
        subtitle: "",
        title: "",
      }),
      block("featuredPost", {
        label: "Post em destaque",
        postSlug: "checklist-antes-de-viajar",
      }),
    ]),
    {
      ...page("links", "Links", [
        block("heading", {
          align: "center",
          level: "h1",
          subtitle: "Viaje melhor, com mais leveza",
          text: "Meu Diário",
        }),
        block("socialIcons", {
          items: [
            { label: "Instagram", url: "#" },
            { label: "YouTube", url: "#" },
            { label: "Facebook", url: "#" },
          ],
        }),
        block("button", {
          buttonLabel: "Ler o blog",
          buttonUrl: "/",
          variant: "wide",
        }),
        block("button", {
          buttonLabel: "Roteiros",
          buttonUrl: "/category/roteiros/",
          variant: "wide",
        }),
        block("button", {
          buttonLabel: "Fale comigo",
          buttonUrl: "mailto:contato@seudominio.com",
          variant: "wide",
        }),
      ]),
      bare: true,
    },
    page("pesquisa", "Resultado da Pesquisa", [
      block("categorySearch", {}),
      block("categoryHeader", {
        backLabel: "Voltar",
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
          "A página que você procura não existe ou foi movida. Volte ao início e continue explorando.",
        text: "Oops! Página Não Encontrada",
      }),
    ]),
    legal("Termos de Uso"),
    legal("Política de Privacidade"),
  ],
  postLayout: [
    block("postHeader", { showCover: "no", watermark: "Post" }),
    block("twoColumns", {}, [
      block("postContent", { showMeta: "yes" }),
      block("sidebarBanner", {
        image: img("1469854523086-cc02fe5d8800", 800),
        url: "/categorias/",
      }),
    ]),
    block("postList", { limit: 6, title: "Mais conteúdos como esse:" }),
  ],
  posts,
  theme: {
    accent: "#e76f51",
    bg: "#faf7f2",
    card: "#ffffff",
    fg: "#1f2937",
    fontAccent: "'Poppins', sans-serif",
    fontBody: "'DM Sans', sans-serif",
    fontHeading: "'Lora', sans-serif",
    muted: "#6b7280",
  },
};

export const blogViagens: SiteTemplate = {
  description:
    "Blog de viagens e estilo de vida com home, categorias, página de links e posts de exemplo. Textos e imagens genéricos para você trocar.",
  id: "blog-viagens",
  name: "Meu Diário — Blog de Viagens",
  preview: HERO,
  site,
  tags: ["Blog", "Viagens"],
};
