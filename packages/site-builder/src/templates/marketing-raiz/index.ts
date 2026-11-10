import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";
import { BLOGS_LINKS, BRAND, MENU, SOCIALS } from "./brand.js";
import { FUNNEL_PAGES, floatBlock } from "./funnel.js";
import { IMG } from "./images.js";
import {
  type LegalBrand,
  type LegalItem,
  privacidade,
  termos,
} from "./legal.js";
import { categories, posts } from "./posts.js";

/**
 * Template "Marketing Raiz": migração do marketingraiz.com (WordPress + Elementor + The Post Grid) com a variante
 * `raiz`. Textos, posts, categorias e links são do original; imagens apontam para o WordPress original (`images.ts`);
 * marca e contatos ficam em `brand.ts`; o funil usa só as mecânicas do original, com textos neutros (`funnel.ts`).
 * Inventário: `plans/marketingraiz-inventario.md`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "elStyles" | "fx" | "style">
): Block => ({ id: `mr-${seq++}`, props, type, ...extra });

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

const LEGAL_BRAND: LegalBrand = {
  domain: BRAND.domain,
  email: BRAND.email,
  name: BRAND.name,
};

const fade: Fx = { enter: "fadeIn" };

/* ───────────────────────── blocos repetidos ───────────────────────── */

const banner = (title: string, image: string = IMG.bannerCategories) =>
  block("sgTitleBanner", {
    image,
    position: "0 -120px",
    title,
    veil: "#000000",
  });

const search = (title = "O que você procura?") =>
  block("sgSearch", {
    buttonLabel: "Pesquisar",
    categoriesLabel: "Categorias",
    placeholder: "Digite aqui...",
    selectLabel: "Selecionar categoria",
    title,
  });

const archive = (emptyText: string) =>
  block("sgPostGrid", {
    arrange: "stack",
    background: "white",
    columns: 3,
    emptyText,
    layout: "archive",
    limit: 0,
    loadMore: 9,
    loadMoreLabel: "Carregar mais",
    source: "page",
  });

const backBar = (label: string) =>
  block("sgCategoryBar", {
    backLabel: "Voltar",
    backUrl: "/",
    label,
    title: "",
  });

/* ───────────────────────── home ───────────────────────── */

/** Páginas de destino do carrossel de produtos (a ordem acompanha `IMG.slides`). */
const SLIDE_LINKS = [
  "https://lp.centraldomarketing.com/habilidades-de-comunicacao/",
  "https://lp.centraldomarketing.com/gatilhos-mentais/",
  "https://lp.centraldomarketing.com/instafanfortune/",
  "https://lp.centraldomarketing.com/ebook-como-ganhar-dinheiro-na-internet-com-8-ideias-confiaveis/",
  "https://757presets.centraldomarketing.com/",
];
const SLIDE_ALTS = [
  "Habilidades de comunicação",
  "E-book Gatilhos Mentais",
  "InstaFanFortune",
  "E-book: como ganhar dinheiro na internet com 8 ideias",
  "757 Presets",
];

const TESTIMONIALS = [
  {
    name: "Daniel Santos",
    text: "Site incrível! Simples, direto e cheio de estratégias que realmente funcionam.",
  },
  {
    name: "Yasmin",
    text: "Finalmente um site com conteúdo sincero e eficiente sobre marketing digital. Adorei!",
  },
  {
    name: "Elissandra Gama",
    text: "Marketing raiz de verdade! Sem enrolação e com dicas aplicáveis na prática.",
  },
  {
    name: "João Gabriel",
    text: "Ótimo material! Fácil de entender e com estratégias que realmente geram resultados.",
  },
].map((t, i) => ({ ...t, image: IMG.avatars[i], rating: 5 }));

const home = page("", "Página principal", [
  block("mrHero", {
    image: IMG.hero,
    slugs:
      "gatilhos-mentais-dicas-para-o-seu-negocio\nmarketing-digital-pode-transformar-seu-negocio",
    subtitle: BRAND.tagline,
    summaryWords: 17,
    title: "ESQUEÇA O MARKETING NUTELLA!",
  }),
  block("mrHighlights", {
    bannerImage: IMG.sideBanner,
    bannerUrl: "/plano/",
    bestSlugs:
      "renda-extra-online-transformando-seu-perfil\nganhando-leads-estrategias-alavancar-seu-negocio",
    bestTitle: "Melhores Post's",
    imageHeight: 260,
    latestCount: 2,
    latestTitle: "Últimas Novidades",
    socials:
      "Youtube | https://www.youtube.com/@marketingraiz | #ff0000\nInstagram | https://www.instagram.com/mktraiz.br | #c13584",
  }),
  block("mrShowcase", {
    reviewSeconds: 5,
    seconds: 5,
    slides: IMG.slides.map((image, i) => ({
      alt: SLIDE_ALTS[i],
      image,
      url: SLIDE_LINKS[i],
    })),
    speed: 500,
    testimonials: TESTIMONIALS,
  }),
  block("mrPostGrid", {
    columns: 3,
    emptyText: "Nenhum post encontrado.",
    filter: "yes",
    filterButton: "Pesquisar",
    filterLabel: "Categorias:",
    filterPlaceholder: "Digite aqui...",
    filterSelect: "Selecionar categoria",
    imageHeight: 200,
    layout: "card",
    limit: 0,
    perPage: 10,
    showSummary: "yes",
    source: "latest",
    summaryWords: 30,
  }),
]);

/* ───────────────────────── páginas internas ───────────────────────── */

const categoriasPage = page("categorias", "Categorias", [
  banner("Categorias"),
  search(),
  block(
    "mrCategories",
    {
      items: [
        {
          image: IMG.categories.vendas,
          label: "Monetização e Vendas",
          slug: "vendas",
        },
        {
          image: IMG.categories.marketing,
          label: "Marketing",
          slug: "marketing",
        },
        { image: IMG.categories.estudos, label: "Estudos", slug: "estudos" },
        {
          image: IMG.categories["funil-de-vendas"],
          label: "Funil de vendas",
          slug: "funil-de-vendas",
        },
      ],
    },
    { fx: { "": fade } }
  ),
]);

const blogsPage = page("blogs", "Blogs", [
  banner("Blogs", IMG.bannerBlogs),
  search(""),
  block("sgBlogCards", {
    items: [
      {
        image: IMG.blogs.central,
        name: "Central do Marketing",
        url: "https://centraldomarketing.com/",
      },
      {
        image: IMG.blogs.seguidores,
        name: "Seguidores em Alta",
        url: "https://seguidoresemalta.com/",
      },
      {
        image: IMG.blogs.renovada,
        name: "Renovada",
        url: "https://www.renovada12.com.br/blog/",
      },
      {
        image: IMG.blogs.spy,
        name: "007SpyHacker",
        url: "https://007spyhacker.com/",
      },
      {
        image: IMG.blogs.zyrion,
        name: "Zyrion Brazil",
        url: "https://zyrionbrazil.com/",
      },
    ],
    title: "",
  }),
]);

const pesquisa = page("pesquisa", "Resultado da pesquisa", [
  search(""),
  backBar("Resultado da pesquisa:"),
  archive("Nenhum post encontrado para a sua pesquisa."),
]);

const notFound = page("404", "Página não encontrada", [
  block("mrNotFound", {
    actionsTitle: "Você pode também:",
    button1Label: "VOLTAR PARA PÁGINA PRINCIPAL",
    button1Url: "/",
    button2Label: "CONHECER A FUNDAÇÃO QUE AJUDAMOS",
    button2Url: BRAND.foundationUrl,
    count: 5,
    image: IMG.notFound,
    latestTitle: "Últimas postagens:",
    text: "Ops.. Parece que essa página não existe mais. Lamentamos por isso.",
  }),
]);

const links = page(
  "links",
  "Links",
  [
    block("sgLinkBio", {
      avatar: IMG.bio,
      background: "",
      bio: "A verdade sobre como vender na internet.",
      items: [
        { label: "Conteúdo Gratuito", url: "/" },
        { label: "Comunidades", url: BRAND.float.url },
        {
          label: "Marketplace",
          url: "https://marketplace.centraldomarketing.com/",
        },
      ],
      name: "Marketing Raiz",
    }),
    floatBlock(),
  ],
  { bare: true }
);

const legalBlocks = (items: LegalItem[]): Block[] =>
  items.map(([kind, text]) =>
    kind === "h"
      ? block("heading", { align: "left", level: "h2", subtitle: "", text })
      : block("text", { text: kind === "li" ? `• ${text}` : text })
  );

const legalPage = (slug: string, title: string, items: LegalItem[]) =>
  page(slug, title, [banner(title), ...legalBlocks(items)], { prose: true });

const funnelPages = FUNNEL_PAGES.map(f =>
  page(f.slug, f.title, f.blocks, { bare: true })
);

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories,
  categoryLayout: [
    search(),
    block("sgCategoryBar", {
      backLabel: "Voltar",
      backUrl: "/categorias/",
      label: "Categoria:",
      title: "",
    }),
    archive("Ainda não há posts nesta categoria."),
  ],
  footer: [
    block("mrFooter", {
      blogs: BLOGS_LINKS,
      blogsTitle: "Blogs",
      contactTitle: "Fale conosco",
      copyright: BRAND.copyright,
      email: BRAND.email,
      logo: IMG.logoFooter,
      others: `AJUDE: Fundação Afif Arão | ${BRAND.foundationUrl}\nIgreja Renovada | https://renovada12.com.br/`,
      othersTitle: "Outras Opções",
      policies:
        "Termos de Uso | /termos-de-uso/\nPolítica de Privacidade | /politica-de-privacidade/",
      policiesTitle: "Políticas e Termos",
      socials: SOCIALS,
      socialsTitle: "Redes Sociais",
    }),
    floatBlock(),
  ],
  header: [
    block("mrHeader", { logo: IMG.logo, logoAlt: BRAND.name, logoUrl: "/" }),
  ],
  menu: MENU.map(m => ({ href: m.href, label: m.label })),
  name: BRAND.name,
  pages: [
    home,
    categoriasPage,
    blogsPage,
    pesquisa,
    links,
    notFound,
    legalPage("termos-de-uso", "Termos de Uso", termos(LEGAL_BRAND)),
    legalPage(
      "politica-de-privacidade",
      "Política de Privacidade",
      privacidade(LEGAL_BRAND)
    ),
    ...funnelPages,
  ],
  postLayout: [
    block("sgPost", {
      bannerImage: IMG.sideBanner,
      bannerUrl: "/plano/",
      buttonLabel: "Pesquisar",
      categoriesLabel: "Categorias:",
      placeholder: "Digite aqui...",
      selectLabel: "Selecionar categoria",
    }),
  ],
  posts,
  theme: {
    accent: BRAND.colors.active,
    active: BRAND.colors.active,
    bg: BRAND.colors.bg,
    blue: BRAND.colors.blue,
    card: "#ffffff",
    fg: "#333333",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Roboto', sans-serif",
    gold: BRAND.colors.gold,
    green: BRAND.colors.green,
    muted: "#6b7280",
    soft: BRAND.colors.soft,
    summary: BRAND.colors.summary,
    title: BRAND.colors.fg,
    variant: "raiz",
  },
};

export const marketingRaiz: SiteTemplate = {
  description:
    "Blog de marketing claro com roxo e cabeçalho com menu em dropdown: hero com foto e 2 destaques, grades de posts, carrossel de produtos com miniaturas, depoimentos, listagem paginada, categorias, blogs, busca e 404; os 42 posts do original e páginas de funil (vídeo com botão atrasado, história em telas, quiz com barra de análise e captura de e-mail). Migrado do Marketing Raiz.",
  id: "marketing-raiz",
  name: "Marketing Raiz — Blog e Funil",
  preview: IMG.hero,
  site,
  tags: ["Blog", "Marketing", "Funil"],
};
