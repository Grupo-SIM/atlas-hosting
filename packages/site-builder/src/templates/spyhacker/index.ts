import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { categorySeeds, posts } from "./posts.js";

const UP = "https://007spyhacker.com/wp-content/uploads";
const MARKET = "https://marketplace.centraldomarketing.com";
const WHATSAPP = "https://lp.centraldomarketing.com/comunidades-no-whatsapp/";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  children?: Block[]
): Block => ({ children, id: `seed-${seq++}`, props, type });

const page = (slug: string, title: string, blocks: Block[]): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  slug,
  status: "published",
  title,
});

const legal = (title: string) =>
  page(
    title === "Termos de Uso" ? "termos-de-uso" : "politica-de-privacidade",
    title,
    [
      block("heading", { align: "left", level: "h1", text: title }),
      block("text", {
        text: "Escreva aqui o texto completo. Este conteúdo é um ponto de partida e deve ser revisado.",
      }),
    ]
  );

const site: Site = {
  categories: categorySeeds.map(([slug, name]) => ({
    id: `cat-${slug}`,
    name,
    slug,
  })),
  categoryLayout: [
    block("categoryHeader", { backLabel: "Voltar" }),
    block("postList", { limit: 12, title: "" }),
  ],
  footer: [
    block("footer", {
      copyright: "Copyright © 007SpyHacker",
      email: "0007spyhacker@gmail.com",
      helpText: "AJUDE: Fundação Afif Arão",
      logo: `${UP}/2025/04/Logo-007spyhacker-300x169.png`,
      logoText: "007SpyHacker",
      socials: [
        { label: "Instagram", url: "#" },
        { label: "YouTube", url: "#" },
        { label: "X", url: "#" },
        { label: "Facebook", url: "#" },
        { label: "TikTok", url: "#" },
      ],
    }),
    block("whatsappFloat", {
      label: "Entre nas nossas comunidades",
      url: WHATSAPP,
    }),
  ],
  header: [
    block("header", {
      buttonLabel: "Marketplace",
      buttonUrl: `${MARKET}/`,
      logo: `${UP}/2025/04/Logo-007spyhacker-300x169.png`,
      logoText: "007SpyHacker",
    }),
  ],
  menu: [
    { href: "/categorias/", label: "Categorias" },
    { href: "/blogs/", label: "Blogs" },
  ],
  name: "007SpyHacker",
  pages: [
    page("", "Início", [
      block("hero", {
        backgroundImage: "",
        buttonLabel: "Explorar Conteúdos →",
        buttonUrl: "#conteudos",
        text: "Conheça as soluções tecnológicas que já estão otimizando negócios, carreiras e projetos pelo mundo. Tudo explicado de forma simples e direta.",
      }),
      block("videoGrid", { title: "Últimas novidades:", videos: [] }),
      block("heading", {
        align: "left",
        level: "h2",
        subtitle:
          "Até onde a Tecnologia pode chegar e como isso pode impactar você?",
        text: "IA, robôs, sistemas, ferramentas e muito mais...",
      }),
      block("categoryGrid", {
        buttonLabel: "Ver todas as categorias",
        buttonUrl: "/categorias/",
        images: [
          "AI-Icon-23-1.png",
          "AI-Icon-14-1024x1024.png",
          "AI-Icon-19-1024x1024.png",
          "AI-Icon-8-1024x1024.png",
          "AI-Icon-1-1024x1024.png",
          "AI-Icon-18-1024x1024.png",
        ].map(f => ({ src: `${UP}/2025/04/${f}` })),
        limit: 6,
        subtitle: "",
        title: "",
      }),
      block("heading", {
        align: "center",
        level: "h2",
        subtitle: "",
        text: "A tecnologia não é o futuro, é o agora!",
      }),
      block("stats", {
        items: [
          {
            label: "Anos de Experiência com Tecnologia",
            suffix: "+",
            value: "14",
          },
          { label: "Gratuito", suffix: "%", value: "100" },
          { label: "Satisfação nos Conteúdos", suffix: "%", value: "98" },
        ],
        title: "",
      }),
      block("cardGrid", {
        buttonLabel: "Todos os Produtos →",
        buttonUrl: `${MARKET}/produtos/`,
        cards: [
          {
            image: "",
            tag: "Gestão",
            title: "Gestão Eficiente de Ativos e Estoques.",
            url: `${MARKET}/controle-patrimonial/`,
          },
          {
            image: "",
            tag: "Privacidade Digital",
            title:
              "Há uma internet secreta muito mais sombria do que você imagina.",
            url: `${MARKET}/o-outro-lado-da-internet/`,
          },
          {
            image: "",
            tag: "Desempenho",
            title: "Servidores de Alto Desempenho com Suporte 24/7.",
            url: "https://atlashosting.com.br",
          },
          {
            image: "",
            tag: "Gateway",
            title: "Automatize seus Pagamentos e Escale com Segurança.",
            url: `${MARKET}/produtos/`,
          },
        ],
        title: "Ferramentas & Soluções",
      }),
      block("featuredPost", {
        label: "Melhor Post",
        postSlug: "as-21-opcoes-de-ia-que-voce-precisa-usar-em-2025",
      }),
      block("testimonials", {
        items: [
          {
            avatar: "",
            name: "Bruno Davis",
            quote:
              "Os tutoriais do 007 SpyHacker me ajudaram a implementar automações no meu negócio. Nunca pensei que fosse tão simples!",
            role: "Empreendedor Digital",
          },
          {
            avatar: "",
            name: "Mariana Morgan",
            quote:
              "Comecei a acompanhar o blog em busca de novidades e hoje sou leitora fiel. Conteúdo direto ao ponto.",
            role: "Estudante de Análise de Dados",
          },
          {
            avatar: "",
            name: "Felipe Simmons",
            quote:
              "O post sobre ferramentas de SEO me salvou! Já uso duas no meu dia a dia e minha rotina ficou muito mais leve.",
            role: "Head Inbound Marketing",
          },
          {
            avatar: "",
            name: "André Evans",
            quote:
              "Adoro como vocês traduzem assuntos técnicos de forma simples. Já indiquei o blog pra vários amigos da área!",
            role: "Analista de Marketing",
          },
          {
            avatar: "",
            name: "Lisa Takashi",
            quote:
              "Descobri o 007 SpyHacker pesquisando sobre ferramentas de IA, e me surpreendi com a qualidade dos artigos. Já virou minha fonte principal pra tudo que é novidade tech.",
            role: "Desenvolvedora Front-end",
          },
          {
            avatar: "",
            name: "Juliana Castilho",
            quote:
              "Sou estudante de Sistemas de Informação e uso o conteúdo do blog até como base para trabalhos e projetos. É atualizado, confiável e muito bem explicado.",
            role: "Universitária",
          },
        ],
        subtitle:
          "Quem acompanha o blog sabe: aqui o conteúdo vai além da teoria.",
        title: "O que dizem sobre o 007 SpyHacker",
      }),
      block("splitSection", {
        buttonLabel: "Ver Mais →",
        buttonUrl: "/blogs/",
        image: `${UP}/2025/04/image-3-768x419.jpeg`,
        text: "Estamos construindo uma comunidade que busca conhecimento real sobre tecnologia, inovação e o futuro digital. Um conteúdo por vez, estamos moldando novas jornadas.",
        title:
          "Milhares de Mentes Conectadas Pelo Mesmo Propósito: Aprender e Evoluir com Tecnologia",
      }),
      block("postExplorer", { limit: 6, title: "Todos os conteúdos" }),
    ]),
    page("categorias", "Categorias", [
      block("heading", {
        align: "left",
        level: "h1",
        subtitle: "Escolha sobre qual nicho você quer saber mais...",
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
        postSlug: "como-registrar-dominio-de-forma-simples-e-facil",
      }),
    ]),
    page("blogs", "Blogs", [
      block("heading", {
        align: "left",
        level: "h1",
        subtitle: "",
        text: "Blogs",
      }),
      block("postExplorer", { limit: 100, title: "Todos os conteúdos" }),
      block("linkCards", {
        items: [
          {
            image: `${UP}/2025/04/marketingraizblog.webp`,
            name: "Marketing Raiz",
            url: "https://marketingraiz.com",
          },
          {
            image: `${UP}/2025/04/centraldomarketingblog.webp`,
            name: "Central do Marketing",
            url: "https://centraldomarketing.com",
          },
          {
            image: `${UP}/2025/04/seguidoresemaltablog.webp`,
            name: "Seguidores em Alta",
            url: "https://seguidoresemalta.com",
          },
          {
            image: `${UP}/2025/04/renovadablog.png`,
            name: "Renovada 12",
            url: "https://renovada12.com.br/blog/",
          },
          {
            image: `${UP}/2025/05/Zyrion-Logo.jpg`,
            name: "Zyrion Brazil",
            url: "https://zyrionbrazil.com",
          },
        ],
        title: "Nossos blogs",
      }),
    ]),
    page("links", "Links", [
      block("heading", {
        align: "center",
        level: "h1",
        subtitle: "Explore o lado Invisível da Tecnologia",
        text: "007SpyHacker",
      }),
      block("button", { buttonLabel: "Conteúdo Gratuito", buttonUrl: "/" }),
      block("button", { buttonLabel: "Comunidades", buttonUrl: WHATSAPP }),
      block("button", { buttonLabel: "Marketplace", buttonUrl: `${MARKET}/` }),
    ]),
    legal("Termos de Uso"),
    legal("Política de Privacidade"),
  ],
  // Cabeçalho em largura total, depois conteúdo + lateral, depois relacionados.
  postLayout: [
    block("postHeader", {}),
    block("twoColumns", {}, [
      block("postContent", {}),
      block("sidebarBanner", { image: "", url: "#" }),
    ]),
    block("postList", { limit: 6, title: "Mais conteúdos como esse:" }),
  ],
  posts,
  theme: {
    accent: "#5ce1f5",
    bg: "#030712",
    card: "#0b1437",
    fg: "#ffffff",
    muted: "#9fb0d0",
  },
};

export const spyhacker: SiteTemplate = {
  description:
    "Blog de tecnologia com home, categorias, blogs, página de links e posts — inspirado no 007spyhacker.com.",
  id: "spyhacker",
  name: "007 SpyHacker — Blog de Tecnologia",
  preview: `${UP}/2025/04/Logo-007spyhacker-300x169.png`,
  site,
};
