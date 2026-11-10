import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND } from "./brand.js";
import { IMG } from "./images.js";
import {
  type LegalBrand,
  type LegalItem,
  privacidade,
  termos,
} from "./legal.js";
import { categories, MAIS_PESQUISADOS, MELHORES, posts } from "./posts.js";

/**
 * Template "Seguidores em Alta": migração do seguidoresemalta.com (WordPress + Elementor) com a variante
 * `seguidores`. Textos, posts, categorias, links e efeitos vêm do original; as imagens ainda apontam para o
 * WordPress dele (`images.ts`); marca, contatos e links externos ficam em `brand.ts`.
 * Inventário: `plans/seguidoresemalta-inventario.md`.
 *
 * Os caminhos de `fx` ("1.1.1.2"…) seguem a ordem dos filhos de cada bloco, descrita em `blocks/seguidores.tsx`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "anchor" | "elStyles" | "fx" | "style">
): Block => ({ id: `sg-${seq++}`, props, type, ...extra });

const page = (
  slug: string,
  title: string,
  blocks: Block[],
  extra?: Partial<Page>
): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  slug,
  status: "published",
  title,
  ...extra,
});

/** Entradas do Elementor: 1,25 s, com o atraso de cada elemento (0 / 200 / 400 / 600 ms). */
const MS = 1250;
const up = (delay = 0): Fx => ({ delay, enter: "fadeInUp", enterMs: MS });
const fade = (delay = 0): Fx => ({ delay, enter: "fadeIn", enterMs: MS });
const left = (delay = 0): Fx => ({ delay, enter: "fadeInLeft", enterMs: MS });

const LEGAL_BRAND: LegalBrand = {
  domain: BRAND.domain,
  email: BRAND.contact.email,
  name: BRAND.legalName,
};

const banner = (title: string, image: string) =>
  block(
    "sgTitleBanner",
    { image, position: "0 -220px", title, veil: "#000000" },
    { fx: { "1.1.1.1": up() } }
  );

const search = (title = "O que você procura?") =>
  block("sgSearch", {
    buttonLabel: "Pesquisar",
    categoriesLabel: "",
    placeholder: "Digite aqui...",
    selectLabel: "Selecionar categoria",
    title,
  });

/* ───────────────────────── conteúdos repetidos ───────────────────────── */

const BLOG_ITEMS = [
  {
    image: IMG.blogs.marketingRaiz,
    name: "Marketing Raiz",
    url: BRAND.blogs.marketingRaiz,
  },
  {
    image: IMG.blogs.centralMarketing,
    name: "Central do Marketing",
    url: BRAND.blogs.centralMarketing,
  },
  { image: IMG.blogs.renovada, name: "Renovada", url: BRAND.blogs.renovada },
  {
    image: IMG.blogs.spyHacker,
    name: "007SpyHacker",
    url: BRAND.blogs.spyHacker,
  },
  { image: IMG.blogs.zyrion, name: "Zyrion Brazil", url: BRAND.blogs.zyrion },
];

const blogCards = (title: string) =>
  block("sgBlogCards", { items: BLOG_ITEMS, title });

/* ───────────────────────── home ───────────────────────── */

const home = page("", "Página Principal", [
  block(
    "sgHero",
    {
      buttonLabel: "Ver todos os posts",
      buttonUrl: "/todos-os-posts/",
      lottie1: IMG.lottie1,
      lottie1Ratio: 1,
      lottie2: IMG.lottie2,
      lottie2Ratio: 1,
      overlay: IMG.overlayCta,
      photo: IMG.heroPhoto,
      text: "Conheça as técnicas por trás dos perfis que viralizam todos os dias.",
      title: "Cresça nas Redes Sociais com [[Estratégias]] que [[funcionam]]",
    },
    {
      fx: {
        "1.1.1.1": up(),
        "1.1.1.2": up(200),
        "1.1.1.3": up(400),
        "1.1.2.1": up(400),
        "1.1.2.2": fade(200),
        "1.1.2.3": up(600),
      },
    }
  ),
  block(
    "sgPostGrid",
    {
      arrange: "stack",
      background: "white",
      buttonLabel: "Ver todos os posts",
      buttonUrl: "/todos-os-posts/",
      columns: 3,
      layout: "card",
      limit: 6,
      showCategory: "no",
      showSummary: "yes",
      source: "latest",
      text: "As principais novidades do mercado digital reunidas para manter você sempre um passo à frente nas redes sociais.",
      title: "Últimas [[Novidades]]",
    },
    { fx: { "1.1.1.1": up(), "1.1.1.2": up(200), "1.1.3": up(400) } }
  ),
  block(
    "sgPostGrid",
    {
      arrange: "side",
      background: "soft",
      buttonLabel: "Ver mais",
      buttonUrl: "/todos-os-posts/",
      columns: 2,
      layout: "side",
      moreLabel: "Ler mais",
      showCategory: "no",
      showSummary: "no",
      slugs: MAIS_PESQUISADOS.join("\n"),
      source: "picked",
      text: "Os temas mais procurados por criadores que desejam elevar sua presença online com estratégias comprovadas.",
      title: "Posts mais [[pesquisados]]",
      titleAlign: "left",
    },
    {
      fx: {
        "1.1.1.1": up(),
        "1.1.1.2": up(200),
        "1.1.2": left(400),
        "1.1.3": up(400),
      },
    }
  ),
  block("sgCounters", {
    items: [
      {
        prefix: "+",
        separator: "",
        suffix: "%",
        title: "Em média de aumento de alcance",
        value: 420,
      },
      {
        prefix: "",
        separator: ",",
        suffix: "+",
        title: "Pessoas com resultados",
        value: 1119,
      },
      { prefix: "", separator: "", suffix: "%", title: "Gratuito", value: 100 },
      {
        prefix: "",
        separator: "",
        suffix: "",
        title: "Posts todos os dias",
        value: 365,
      },
    ],
  }),
  block(
    "sgProducts",
    {
      buttonLabel: "Conheça nossos produtos",
      buttonUrl: BRAND.blogs.marketplace,
      items: [
        {
          image: IMG.products.gatilhos,
          label: "Ver mais",
          url: BRAND.products.gatilhos,
        },
        {
          image: IMG.products.dark,
          label: "Ver mais",
          url: BRAND.products.dark,
        },
        {
          image: IMG.products.areaflix,
          label: "Ver mais",
          url: BRAND.products.areaflix,
        },
        {
          image: IMG.products.viralpack,
          label: "Ver mais",
          url: BRAND.products.viralpack,
        },
        {
          image: IMG.products.habilidades,
          label: "Ver mais",
          url: BRAND.products.habilidades,
        },
      ],
      text: "Aplique o que funciona de verdade respaldado pela credibilidade de marcas consolidadas no mercado.",
      title: "Seu crescimento no digital [[começa aqui]]",
    },
    {
      fx: {
        "1.1.1.1": up(),
        "1.1.1.2": up(200),
        "1.1.1.3": up(400),
        "1.1.1.4": up(600),
        "1.1.1.5": up(600),
        "1.1.2.1": up(600),
        "1.1.2.2": up(600),
        "1.1.2.3": up(600),
      },
    }
  ),
  block(
    "sgSocialCollage",
    {
      items: [
        { image: IMG.social.kwai, label: "Kwai", url: BRAND.social.kwai },
        {
          image: IMG.social.instagram,
          label: "Instagram",
          url: BRAND.social.instagram,
        },
        {
          image: IMG.social.youtube,
          label: "YouTube",
          url: BRAND.social.youtube,
        },
        { image: IMG.social.tiktok, label: "TikTok", url: BRAND.social.tiktok },
      ],
      overlay: IMG.overlayTexture,
      text: "Não perca nada! Acompanhe mais de perto nosso trabalho em todas as plataformas digitais.",
      title: "Siga-nos nas [[Redes Sociais]]",
    },
    {
      fx: {
        "1.1.1": { ...fade(0), each: true, stagger: 200 },
        "1.1.2.1": up(),
        "1.1.2.2": up(200),
      },
    }
  ),
  block("sgPostGrid", {
    arrange: "stack",
    background: "soft",
    buttonLabel: "",
    columns: 3,
    layout: "dark",
    moreLabel: "Ler mais",
    showCategory: "no",
    showSummary: "yes",
    slugs: MELHORES.join("\n"),
    source: "picked",
    title: "Melhores [[Posts]]",
  }),
  block(
    "sgCommunity",
    {
      buttonLabel: "Ver mais",
      buttonUrl: BRAND.communities,
      image: IMG.mockup,
      overlay: IMG.overlayTexture,
      text: "Entre e conecte-se com pessoas que compartilham os mesmos interesses…",
      title: "Faça parte das nossas [[comunidades]]",
    },
    {
      fx: {
        "1.1.1": fade(),
        "1.1.2.1": up(),
        "1.1.2.2": up(200),
        "1.1.2.3": up(400),
      },
    }
  ),
  block("sgReviews", {
    background: IMG.reviewsBg,
    items: [
      {
        image: IMG.reviewers[0],
        name: "Daniel Santos",
        rating: 5,
        text: "Site incrível! Simples, direto e cheio de estratégias que realmente funcionam.",
      },
      {
        image: IMG.reviewers[1],
        name: "Yasmin",
        rating: 5,
        text: "Finalmente um site com conteúdo sincero e eficiente sobre marketing digital. Adorei!",
      },
      {
        image: IMG.reviewers[2],
        name: "Elissandra Gama",
        rating: 5,
        text: "Marketing raiz de verdade! Sem enrolação e com dicas aplicáveis na prática.",
      },
      {
        image: IMG.reviewers[3],
        name: "João Gabriel",
        rating: 5,
        text: "Ótimo material! Fácil de entender e com estratégias que realmente geram resultados.",
      },
    ],
    seconds: 5,
    title: "O que [[dizem]] sobre nós",
  }),
  blogCards("Blogs [[Recomendados]]"),
]);

/* ───────────────────────── páginas de listagem ───────────────────────── */

const todosOsPosts = page("todos-os-posts", "Conteúdo", [
  banner("Conteúdo", IMG.bannerConteudo),
  search(),
  block("sgPostGrid", {
    columns: 3,
    emptyText: "Nenhum post encontrado.",
    layout: "list",
    limit: 0,
    loadMore: 9,
    moreLabel: "Ler mais",
    showCategory: "yes",
    showSummary: "yes",
    source: "latest",
  }),
]);

const categoriasPage = page("categorias", "Categorias", [
  banner("Categorias", IMG.bannerCategorias),
  search(),
  block(
    "sgCategoryCards",
    {
      items: categories.map(c => ({
        image: IMG.categories[c.slug] ?? "",
        label: c.name,
        slug: c.slug,
      })),
    },
    { fx: { "1.1": { ...fade(0), each: true, enterMs: MS, stagger: 100 } } }
  ),
]);

const blogs = page("blogs", "Blogs", [
  banner("Blogs", IMG.bannerBlogs),
  block("sgBlogCards", { items: BLOG_ITEMS, title: "" }),
]);

const pesquisa = page("pesquisa", "Pesquisa", [
  banner("Pesquisa", IMG.bannerBlogs),
  search(),
  block("sgCategoryBar", {
    backLabel: "Voltar",
    backUrl: "/todos-os-posts/",
    label: "Resultado da pesquisa:",
    title: "",
  }),
  block("sgPostGrid", {
    columns: 3,
    emptyText: "Nenhum post encontrado para a sua pesquisa.",
    layout: "archive",
    limit: 0,
    loadMore: 6,
    showCategory: "no",
    showSummary: "no",
    source: "page",
  }),
]);

const notFound = page("404", "Página não encontrada", [
  banner("404", IMG.bannerBlogs),
  block("text", {
    text: "A página não pode ser encontrada.\n\nParece que nada foi encontrado neste local. Tente uma pesquisa ou volte ao início.",
  }),
  search(""),
  block("button", {
    buttonLabel: "Voltar ao início",
    buttonUrl: "/",
    variant: "primary",
  }),
]);

/* ───────────────────────── links na bio ───────────────────────── */

const links = page(
  "links",
  "Links",
  [
    block("sgLinkBio", {
      avatar: IMG.avatar,
      background: "",
      bio: "Cresça nas redes sociais com estratégias que funcionam!",
      items: [
        { label: "Conteúdo Gratuito", url: "/todos-os-posts/" },
        { label: "Comunidades", url: BRAND.communities },
        { label: "Marketplace", url: BRAND.blogs.marketplace },
      ],
      name: BRAND.name,
    }),
  ],
  { bare: true }
);

/* ───────────────────────── páginas legais ───────────────────────── */

const legalBlocks = (items: LegalItem[]): Block[] =>
  items.map(([kind, text]) =>
    kind === "h"
      ? block("heading", { align: "left", level: "h2", subtitle: "", text })
      : block("text", { text: kind === "li" ? `• ${text}` : text })
  );

const legalPage = (slug: string, title: string, items: LegalItem[]) =>
  page(
    slug,
    title,
    [
      banner(title, IMG.bannerBlogs),
      ...legalBlocks(items),
      block("button", {
        buttonLabel: "← Voltar",
        buttonUrl: "/",
        variant: "primary",
      }),
    ],
    { prose: true }
  );

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories,
  categoryLayout: [
    banner("Categorias", IMG.bannerBlogs),
    search(),
    block("sgCategoryBar", {
      backLabel: "Voltar",
      backUrl: "/categorias/",
      label: "Categoria:",
      title: "",
    }),
    block("sgPostGrid", {
      columns: 3,
      emptyText: "Ainda não há posts nesta categoria.",
      layout: "archive",
      limit: 0,
      loadMore: 6,
      showCategory: "no",
      showSummary: "no",
      source: "page",
    }),
  ],
  footer: [
    block(
      "sgFooter",
      {
        about: "Nos acompanhe nas redes sociais…",
        blogs: `Marketing Raiz | ${BRAND.blogs.marketingRaiz}\nCentral do Marketing | ${BRAND.blogs.centralMarketing}\nRenovada | ${BRAND.blogs.renovada}\n007SpyHacker | ${BRAND.blogs.spyHacker}\nZyrion Brazil | ${BRAND.blogs.zyrion}`,
        blogsTitle: "Blogs",
        company: BRAND.company,
        contactTitle: "Contato",
        ctaOverlay: IMG.overlayCta,
        ctaText:
          "Conteúdos gratuitos para explodir seu engajamento e ganhar seguidores.",
        ctaTitle: "Cresça [[todos os dias]]",
        email: BRAND.contact.email,
        legal:
          "Política de Privacidade | /politica-de-privacidade/\nTermos de Uso | /termos-de-uso/",
        logo: IMG.footerLogo,
        others: `AJUDE: Fundação Afif Arão | ${BRAND.others.fundacao}\nIgreja Renovada | ${BRAND.others.igreja}`,
        otherTitle: "Outras Opções",
        phone: BRAND.contact.phone,
        socials: `youtube | ${BRAND.social.youtube}\ninstagram | ${BRAND.social.instagram}\nthreads | ${BRAND.social.threads}\nx | ${BRAND.social.x}\ntiktok | ${BRAND.social.tiktok}\nkwai | ${BRAND.social.kwai}\nfacebook | ${BRAND.social.facebook}`,
      },
      { fx: { "1.1.1": up() } }
    ),
  ],
  header: [
    block(
      "sgHeader",
      { logo: IMG.logo, logoAlt: BRAND.name, logoUrl: "/" },
      { fx: { "1.2.1": fade(200) } }
    ),
  ],
  menu: [
    { href: "/todos-os-posts/", label: "Conteúdo" },
    { href: "/categorias/", label: "Categorias" },
    { href: "/blogs/", label: "Blogs" },
    { href: BRAND.blogs.marketingRaiz, label: "Marketing Raiz" },
    { href: BRAND.blogs.centralMarketing, label: "Central do Marketing" },
    { href: BRAND.blogs.renovada, label: "Renovada" },
    { href: BRAND.blogs.spyHacker, label: "007SpyHacker" },
    { href: BRAND.blogs.zyrion, label: "Zyrion Brazil" },
    { href: BRAND.blogs.marketplace, label: "Marketplace" },
  ],
  name: BRAND.name,
  pages: [
    home,
    todosOsPosts,
    categoriasPage,
    blogs,
    pesquisa,
    notFound,
    links,
    legalPage("termos-de-uso", "Termos de Uso", termos(LEGAL_BRAND)),
    legalPage(
      "politica-de-privacidade",
      "Política de Privacidade",
      privacidade(LEGAL_BRAND)
    ),
  ],
  postLayout: [
    block("sgPost", {
      bannerImage: "",
      bannerUrl: "#",
      buttonLabel: "Pesquisar",
      categoriesLabel: "Categorias:",
      placeholder: "Digite aqui...",
      selectLabel: "Selecionar categoria",
    }),
  ],
  posts,
  theme: {
    accent: BRAND.colors.primary,
    active: BRAND.colors.active,
    bg: BRAND.colors.bg,
    blue: BRAND.colors.blue,
    card: "#ffffff",
    fg: BRAND.colors.fg,
    fontBody: "'Manrope', sans-serif",
    fontHeading: "'Manrope', sans-serif",
    lime: BRAND.colors.lime,
    muted: BRAND.colors.fg,
    soft: BRAND.colors.soft,
    summary: BRAND.colors.summary,
    title: BRAND.colors.title,
    variant: "seguidores",
    violet: BRAND.colors.violet,
  },
};

export const seguidoresEmAlta: SiteTemplate = {
  description:
    "Blog de marketing claro com roxo e marca-texto amarelo: cabeçalho transparente que some ao rolar, hero com animações Lottie em camadas, contadores, mosaico de produtos, depoimentos com fundo fixo, blogs recomendados, listagens com busca e categorias, página de links e 10 posts em 8 categorias. Migrado do Seguidores em Alta.",
  id: "seguidores-em-alta",
  name: "Seguidores em Alta — Blog de Marketing",
  preview: IMG.heroPhoto,
  site,
  tags: ["Blog", "Marketing", "Redes sociais"],
};
