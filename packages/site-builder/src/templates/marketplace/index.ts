import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND } from "./brand.js";
import { IMG } from "./images.js";
import {
  type LegalBrand,
  type LegalItem,
  privacidade,
  termos,
} from "./legal.js";
import { categories, posts } from "./posts.js";

/**
 * Template "Marketplace": migração do marketplace.centraldomarketing.com (WordPress + Elementor) com a
 * variante `marketplace`. Textos, produtos, categorias e efeitos vêm do original; imagens são placeholders
 * (`images.ts`); marca e contatos ficam em `brand.ts`. Inventário: `plans/marketplace-inventario.md`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "elStyles" | "fx" | "style">
): Block => ({ id: `mk-${seq++}`, props, type, ...extra });

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

/** Título de seção centralizado ("TOP Produtos 💥"…), que desce suave como no original. */
const sectionTitle = (text: string, extra?: Pick<Block, "elStyles">) =>
  block(
    "heading",
    { align: "center", level: "h2", subtitle: "", text },
    { fx: { "1": { enter: "fadeInDown" } }, ...extra }
  );

const rise: Fx = { enter: "fadeInUp" };

const LEGAL_BRAND: LegalBrand = {
  domain: BRAND.domain,
  email: BRAND.email,
  name: BRAND.legalName,
};

const banner = (title: string) =>
  block("mkBanner", {
    leftImage: IMG.bannerLeft,
    rightImage: IMG.bannerRight,
    title,
  });

const search = () =>
  block("categorySearch", {
    buttonLabel: "Pesquisar",
    categoriesLabel: "Categorias",
    layout: "compact",
    placeholder: "Digite aqui...",
    selectLabel: "Selecionar categoria",
  });

const productGrid = (moreLabel: string, emptyText: string) =>
  block("postList", {
    buttonLabel: moreLabel,
    cardStyle: "product",
    emptyText,
    includeCurrent: "yes",
    limit: 100,
    title: "",
  });

/* ───────────────────────── conteúdos repetidos ───────────────────────── */

/** "Blogs" parceiros (home e /blogs/): links externos, abrem em nova aba. */
const PARTNERS = [
  {
    image: IMG.partner("seguidores"),
    tag: "Redes Sociais",
    text: "Tudo sobre o algoritmo das plataformas, tendências, estratégias e muito mais…",
    title: "Seguidores em Alta",
    url: "https://seguidoresemalta.com/",
  },
  {
    image: IMG.partner("marketingRaiz"),
    tag: "Marketing",
    text: "Conteúdo para quem quer aprender marketing digital de verdade, sem enrolação…",
    title: "Marketing Raiz",
    url: "https://marketingraiz.com/",
  },
  {
    image: IMG.partner("spy"),
    tag: "Tecnologia",
    text: "Noticias tecnológicas, IA, guias, tutoriais, tendências e muito mais…",
    title: "007SpyHacker",
    url: "https://007spyhacker.com/",
  },
  {
    image: IMG.partner("renovada"),
    tag: "Cristão",
    text: "Seja edificado pela palavra de Deus e fortaleça a sua fé…",
    title: "Renovada",
    url: "https://www.renovada12.com.br/blog/",
  },
  {
    image: IMG.partner("zyrion"),
    tag: "Jornal",
    text: "Notícias, informações e entretenimento de qualidade para uma experiência incrível…",
    title: "Zyrion Brazil",
    url: "https://zyrionbrazil.com/",
  },
  {
    image: IMG.partner("central"),
    tag: "Marketing",
    text: "O portal mais completo de conteúdos voltados ao mundo digital…",
    title: "Central do Marketing",
    url: "https://centraldomarketing.com/",
  },
].map(p => ({ ...p, linkLabel: "Acessar" }));

const partnerCards = (extra?: Pick<Block, "style">) =>
  block(
    "mkCards",
    { avatar: IMG.avatar, columns: 3, items: PARTNERS },
    { fx: { "1.1": { ...rise, each: true, stagger: 100 } }, ...extra }
  );

/** Os 4 tipos de produto (home e /categorias/). Ícones de traço do editor, em laranja. */
const productTypes = () =>
  block(
    "featureGrid",
    {
      columns: 4,
      items: [
        {
          icon: "book",
          text: "Do básico ao avançado: tudo que você precisa para evoluir",
          title: "Cursos",
        },
        {
          icon: "news",
          text: "Conteúdos ricos, estratégicos e prontos para aplicar",
          title: "E-books",
        },
        {
          icon: "devices",
          text: "Menos tarefas manuais, mais tempo para crescer",
          title: "Sistemas",
        },
        {
          icon: "layout",
          text: "O que não se encaixa nas outras categorias, mas faz total sentido pra você",
          title: "Outros",
        },
      ].map(it => ({
        ...it,
        image: "",
        kicker: "",
        linkLabel: "",
        tag: "",
        url: "",
      })),
      style: "icon",
    },
    { fx: { "1.1": { ...rise, each: true, stagger: 100 } } }
  );

const powered = () => [
  block(
    "text",
    { text: BRAND.poweredBy.label },
    {
      style: {
        color: BRAND.colors.title,
        padding: "60px 0 0",
        textAlign: "center",
      },
    }
  ),
  block(
    "image",
    { alt: BRAND.poweredBy.alt, src: IMG.poweredBy, url: BRAND.poweredBy.url },
    { style: { margin: "0 auto", maxWidth: "380px", padding: "30px 0 70px" } }
  ),
];

/* ───────────────────────── páginas ───────────────────────── */

const TOP = [
  "ebook-gatilhos-mentais",
  "o-outro-lado-da-internet",
  "insta-fan-fortune",
];

/** Ranking "Mais quentes" do original. "Resolvit" não tem página lá (404): aponta para /produtos/. */
const HOT: [title: string, slug: string | null][] = [
  ["Insta Fan Fortune", "insta-fan-fortune"],
  ["Habilidades de Comunicação", "ebook-habilidades-de-comunicacao"],
  ["Academia do Corte", "academia-do-corte"],
  ["Atlas Hosting", "atlashosting"],
  ["Resolvit", null],
  ["Viral Pack", "viralpack"],
  ["757 Presets", "757-presets"],
  ["VSL milionário", "e-book-vsl-milionario"],
  ["ÁreaFlix", "areaflix-area-de-membros"],
  ["Gestão Patrimonial", "controle-patrimonial"],
];

/** Categorias da home: ordem e rótulo com emoji, como no original (a contagem é calculada). */
const HOME_CATEGORIES: [slug: string, label: string][] = [
  ["dinheiro-e-financas", "💰 Dinheiro e Finanças"],
  ["marketing", "🎯 Marketing"],
  ["saude-e-fitness", "💪🏻 Saúde & Fitness"],
  ["desenvolvimento-pessoal", "📚 Desenvolvimento Pessoal"],
  ["cursos-profissionalizantes", "🎓 Cursos Profissionalizantes"],
  ["sistemas", "🧑🏻‍💻 Sistemas"],
  ["servicos", "👨‍💻 Serviços"],
  ["outros", "🔎 Outros"],
];

const categoryCards = (
  list: [slug: string, label: string][],
  labelStyle: "caption" | "tag",
  extra?: Pick<Block, "fx" | "style">
) =>
  block(
    "categoryGrid",
    {
      buttonLabel: "",
      buttonUrl: "",
      headImage: "",
      images: list.map(([slug]) => ({ src: IMG.category(slug), text: "" })),
      items: list.map(([category, label]) => ({ category, label })),
      labelStyle,
      limit: 0,
      showCount: labelStyle === "caption" ? "yes" : "no",
      subtitle: "",
      title: "",
    },
    extra
  );

const productOf = (slug: string) => posts.find(p => p.slug === slug);

const home = page("", "Marketplace", [
  block(
    "mkHero",
    {
      background: IMG.stars,
      button2Label: "Ver produtos",
      button2Url: "/produtos/",
      buttonLabel: "Explorar",
      buttonUrl: "/categorias/",
      decorA: IMG.decorA,
      decorB: IMG.decorB,
      image: IMG.hero,
      imageHover: IMG.heroHover,
      layout: "hero",
      level: "h1",
      text: "Aqui temos soluções para elevar seu jogo para o próximo nível. Transforme conhecimento em resultados agora mesmo!",
      title: "Tudo o que você precisa para crescer no digital, em um só lugar",
    },
    {
      // Como no original: foto + faixa aparecem depois (700 ms); título desce, botões sobem, o texto fica parado;
      // os enfeites giram ao entrar — o grande segue o mouse ao contrário, o pequeno acompanha o mouse.
      fx: {
        "1.1.1": { delay: 700, enter: "fadeIn" },
        "1.1.2.1": { enter: "fadeInDown" },
        "1.1.2.3": rise,
        "1.2": { enter: "rotateIn", mouse: -3 },
        "1.3": { delay: 200, enter: "rotateIn", mouse: 3 },
      },
    }
  ),
  sectionTitle("TOP Produtos 💥"),
  block(
    "mkCards",
    {
      avatar: IMG.avatar,
      columns: 3,
      items: TOP.map((slug, i) => {
        const p = productOf(slug);
        const tags = ["Neuromarketing", "Marketing", "Dinheiro e Finanças"];
        return {
          image: IMG.productTall(slug),
          linkLabel: "Adquirir agora",
          tag: tags[i],
          text: p?.excerpt ?? "",
          title: [
            "Gatilhos Mentais",
            "O Outro Lado da Internet",
            "Insta Fan Fortune",
          ][i],
          url: `/${slug}/`,
        };
      }),
    },
    { fx: { "1.1": rise } }
  ),
  sectionTitle("Mais quentes 🔥"),
  block(
    "mkRank",
    {
      badge: "🔥",
      columns: 5,
      items: HOT.map(([title, slug]) => ({
        image: slug ? IMG.product(slug) : IMG.category("sistemas"),
        title,
        url: slug ? `/${slug}/` : "/produtos/",
      })),
    },
    { fx: { "1.1": { ...rise, each: true, stagger: 60 } } }
  ),
  sectionTitle("Categorias 🚀"),
  categoryCards(HOME_CATEGORIES, "caption", {
    fx: { "1.1": { each: true, enter: "fadeIn", stagger: 80 } },
  }),
  block(
    "textMarquee",
    {
      color: BRAND.colors.accent,
      direction: "left",
      items: [{ text: "MARKETPLACE" }, { text: "CENTRAL DO MARKETING" }],
      seconds: 55,
      separator: "",
      size: 200,
      sizeMobile: 60,
      sizeTablet: 90,
    },
    { style: { padding: "110px 0 0" } }
  ),
  productTypes(),
  sectionTitle("Por que somos os melhores? ⚡", {
    elStyles: { "1": { padding: "0 0 30px" } },
  }),
  block(
    "mkVideo",
    { image: IMG.video, playLabel: "Assistir ao vídeo", videoUrl: BRAND.video },
    { fx: { "1.1": { parallax: -4 } } }
  ),
  sectionTitle("Parceiros:", { elStyles: { "1": { padding: "0 0 30px" } } }),
  partnerCards(),
  ...powered(),
]);

const produtos = page("produtos", "Produtos", [
  banner("Seu negócio merece mais do que o básico"),
  search(),
  productGrid("Ver mais »", "Nenhum produto encontrado."),
]);

/** Ordem das categorias em /categorias/ (a mesma de `CATEGORIES`). */
const CATEGORY_PAGE: [string, string][] = [
  ["dinheiro-e-financas", ""],
  ["marketing", ""],
  ["desenvolvimento-pessoal", ""],
  ["sistemas", ""],
  ["saude-e-fitness", ""],
  ["cursos-profissionalizantes", ""],
  ["servicos", ""],
  ["outros", ""],
];

const categoriasPage = page("categorias", "Categorias", [
  categoryCards(CATEGORY_PAGE, "tag", {
    fx: { "1.1": { ...rise, each: true, stagger: 100 } },
    style: { padding: "110px 0 0" },
  }),
  productTypes(),
]);

const blogs = page("blogs", "Blogs", [
  partnerCards({ style: { padding: "100px 0 0" } }),
  ...powered(),
]);

const pesquisa = page("pesquisa", "Resultado da pesquisa", [
  banner("Resultado da pesquisa"),
  search(),
  productGrid("", "Nenhum produto encontrado para a sua pesquisa."),
]);

const notFound = page("404", "Página não encontrada", [
  block("mkHero", {
    background: IMG.errorBg,
    button2Label: "",
    button2Url: "",
    buttonLabel: "Página inicial",
    buttonUrl: "/",
    decorA: "",
    decorB: "",
    image: IMG.errorArt,
    layout: "error",
    level: "h1",
    text: "Desculpe! A página que você estava procurando não pôde ser encontrada.\n\nTente procurá-la ou navegue pelo nosso site.",
    title: "Página não encontrada!",
  }),
  block(
    "textMarquee",
    {
      color: BRAND.colors.accent,
      direction: "left",
      items: [{ text: "DESCULPE" }, { text: "PÁGINA NÃO ENCONTRADA" }],
      seconds: 40,
      separator: "·",
      size: 200,
      sizeMobile: 60,
      sizeTablet: 90,
    },
    { style: { padding: "0 0 110px" } }
  ),
]);

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
      banner(title),
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
    banner(""),
    search(),
    productGrid("", "Ainda não há produtos nesta categoria."),
  ],
  footer: [
    block("ctFooter", {
      columns: [
        {
          links:
            "Produtos | /produtos/\nCategorias | /categorias/\nBlogs | /blogs/",
          title: "Menu",
        },
        {
          links:
            "Política de privacidade | /politica-de-privacidade/\nTermos de uso | /termos-de-uso/",
          title: "Políticas e Termos",
        },
      ],
      copyright: BRAND.copyright,
      logo: IMG.logo,
      logoText: "",
      socials: [],
    }),
  ],
  header: [
    block("header", {
      buttonLabel: "",
      buttonUrl: "",
      logo: IMG.logo,
      logoText: "",
      searchLabel: "",
    }),
  ],
  menu: [
    { href: "/produtos/", label: "Produtos" },
    { href: "/categorias/", label: "Categorias" },
    { href: "/blogs/", label: "Blogs" },
  ],
  name: BRAND.name,
  pages: [
    home,
    produtos,
    categoriasPage,
    blogs,
    pesquisa,
    notFound,
    legalPage(
      "politica-de-privacidade",
      "Política de Privacidade",
      privacidade(LEGAL_BRAND)
    ),
    legalPage("termos-de-uso", "Termos de Uso", termos(LEGAL_BRAND)),
  ],
  postLayout: [block("postContent", { showMeta: "no" })],
  posts,
  theme: {
    accent: BRAND.colors.accent,
    active: BRAND.colors.active,
    bg: BRAND.colors.bg,
    card: BRAND.colors.surface,
    fg: BRAND.colors.muted,
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Sora', sans-serif",
    line: BRAND.colors.line,
    muted: BRAND.colors.muted,
    pink: BRAND.colors.pink,
    soft: BRAND.colors.soft,
    title: BRAND.colors.title,
    variant: "marketplace",
  },
};

export const marketplace: SiteTemplate = {
  description:
    "Vitrine de produtos digitais escura com gradiente laranja e rosa: hero com foto inclinada, destaques, ranking, categorias, letreiro, vídeo e parceiros; 16 produtos em 8 categorias, cada um com a página do próprio site incorporada, busca e páginas legais. Migrado do Marketplace Central do Marketing.",
  id: "marketplace",
  name: "Marketplace — Vitrine de Produtos",
  preview: IMG.hero,
  site,
  tags: ["Loja", "Marketing", "Landing"],
};
