import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND } from "./brand.js";
import { ADS, IMG, PHOTO_IDS, photo } from "./images.js";
import {
  anuncios,
  correcoes,
  editorial,
  type LegalBrand,
  type LegalItem,
  privacidade,
  termos,
} from "./legal.js";
import { categories, posts } from "./posts.js";

/**
 * Template "Portal Zyrion": migração do layout do zyrionbrazil.com (WordPress + Elementor) com a variante
 * `zyrion`. Medidas, animações e hovers são do original; marca, textos e notícias são fictícios (`brand.ts`,
 * `posts.ts`) e as imagens são placeholders (`images.ts`). Inventário: `plans/zyrion-inventario.md`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Block>
): Block => ({
  id: `zy-${seq++}`,
  props,
  type,
  ...extra,
});

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
  name: BRAND.legalName,
};

/* ───────────────────────── efeitos do original (Elementor) ───────────────────────── */

/** Durações do Elementor: normal 1,25 s, "animated-fast" 0,75 s, "animated-slow" 2 s. */
const NORMAL = 1250;
const FAST = 750;
const SLOW = 2000;
const down: Fx = { enter: "fadeInDown", enterMs: NORMAL };
const up = (ms = NORMAL): Fx => ({ enter: "fadeInUp", enterMs: ms });

/* ───────────────────────── anúncios (nos mesmos lugares do original) ───────────────────────── */

const GRADIENT = "linear-gradient(135deg, #ECF1FF 0%, #F1EDFD 72%)";

const ad = (
  size: "banner" | "side" | "square",
  src: string,
  style?: Block["style"],
  extra?: Partial<Block>
) =>
  block(
    "adSlot",
    { items: [{ src }], label: "Publicidade", link: "#", seconds: 6, size },
    { style, ...extra }
  );

const bannerTop = () =>
  ad("banner", ADS.banner, { background: GRADIENT, padding: "20px 0 0" });
const bannerMid = () =>
  ad("banner", ADS.bannerCommunity, { padding: "50px 0 0" });
const bannerGif = () =>
  ad("banner", ADS.gif, {
    margin: "0 auto",
    maxWidth: "485px",
    padding: "50px 0 0",
  });
const lift: Fx = { hover: "lift", hoverMs: 600 };
const squareAd = (src: string) =>
  ad("square", src, undefined, { fx: { "1": lift } });

/* ───────────────────────── blocos comuns ───────────────────────── */

const header = () =>
  block("zyHeader", {
    logo: IMG.logo,
    searchLabel: "Pesquisar",
    socials: BRAND.socials.map(([label, url]) => ({ label, url })),
  });

const footer = () =>
  block(
    "zyFooter",
    {
      brandName: BRAND.name,
      categoriesTitle: "Categorias",
      contactTitle: "Contato",
      ctaLabel: "Faça parte",
      ctaText: "Conteúdo premium e benefícios exclusivos!",
      ctaTitle: "Entre para a comunidade",
      ctaUrl: "/comunidade/",
      description: "",
      email: BRAND.email,
      latestCount: 3,
      latestTitle: "Últimas Notícias",
      logo: IMG.logoWhite,
      slogan: BRAND.slogan,
      socials: BRAND.socials.map(([label, url]) => ({ label, url })),
      terms: [
        { label: "Política de privacidade", url: "/politica-de-privacidade/" },
        { label: "Termos e Condições", url: "/termos-e-condicoes/" },
        { label: "Política de anúncios", url: "/politica-de-anuncios/" },
      ],
      termsTitle: "Termos",
    },
    { fx: { "1.1.1": down, "1.2.1": up(), "1.2.1.1": up() } }
  );

const heroBlock = (categorySlug = "") =>
  block("zyHero", {
    categorySlug,
    listCount: 6,
    sliderCount: 6,
    tickerCount: 10,
    tickerLabel: "ÚLTIMAS NOTÍCIAS",
    tickerSeconds: 80,
  });

/** O divisor é o 1º filho de `.zy-in` (caminho `1.1.1`); o botão "Ver todas" é o 3º filho de cada caixa. */
const boxes = (
  items: { slug: string; title: string; offset?: number }[],
  buttons = true
) =>
  block(
    "zyCatBoxes",
    {
      boxes: items.map(i => ({
        buttonLabel: buttons ? "Ver todas" : "",
        categorySlug: i.slug,
        offset: i.offset ?? 0,
        title: i.title,
      })),
      count: 3,
    },
    {
      fx: Object.fromEntries(
        items.flatMap((_, k) => [
          [`1.1.${k + 1}.1`, down],
          ...(buttons
            ? [
                [`1.1.${k + 1}.3`, up([NORMAL, FAST, SLOW, NORMAL][k % 4])] as [
                  string,
                  Fx,
                ],
              ]
            : []),
        ])
      ),
    }
  );

const trending = (title = "Em alta", categorySlug = "") =>
  block(
    "zyTrending",
    { categorySlug, largeCount: 2, smallCount: 4, title },
    { fx: { "1.1.1": down } }
  );

const TILES = [
  ["MUNDO", "mundo", 0],
  ["BRASIL", "brasil", 1],
  ["TECNOLOGIA", "tecnologia", 2],
  ["ENTRETENIMENTO", "entretenimento", 3],
  ["EDUCAÇÃO", "educacao", 4],
  ["ESPORTES", "esportes", 5],
] as const;

const tiles = () =>
  block(
    "zyCategoryTiles",
    {
      items: TILES.map(([label, slug, i]) => ({
        image: photo(PHOTO_IDS[20 + i] as string, 600, 300),
        label,
        url: `/${slug}/`,
      })),
    },
    { fx: { "1": { ...up(), each: true } } }
  );

const sportsAndTiles = () =>
  block(
    "zySplit",
    { gap: 60, left: 72 },
    {
      children: [
        block(
          "zyCards",
          {
            categorySlug: "esportes",
            cols: 2,
            gap: 28,
            limit: 6,
            offset: 0,
            title: "Esportes",
            variant: "plain",
          },
          { fx: { "1.1": down } }
        ),
        block(
          "zyStack",
          { gap: 12 },
          { children: [squareAd(ADS.square), tiles(), squareAd(ADS.square2)] }
        ),
      ],
      style: { margin: "80px 0" },
    }
  );

/* ───────────────────────── home ───────────────────────── */

const videos = block(
  "zyDivider",
  { align: "left", dark: "no", text: "Videos", thin: "no" },
  { hidden: true }
);

const home = page("", "Notícias em todo o Brasil", [
  bannerTop(),
  heroBlock(),
  trending(),
  bannerMid(),
  boxes([
    { slug: "mundo", title: "Mundo" },
    { slug: "brasil", title: "Brasil" },
    { slug: "educacao", title: "Educação" },
    { slug: "entretenimento", title: "Entretenimento" },
  ]),
  block(
    "zyOverlayGrid",
    {
      categorySlug: "tecnologia",
      cols: 3,
      limit: 6,
      offset: 0,
      title: "Tecnologia",
      wideIndex: -1,
    },
    { fx: { "1.1.1": down } }
  ),
  bannerGif(),
  sportsAndTiles(),
  videos,
]);

/* ───────────────────────── páginas de seção ───────────────────────── */

/** Divisores de cada página de seção do original (o 1º abre a faixa "em alta"). */
const SECTIONS: Record<string, string[]> = {
  brasil: [
    "Em alta",
    "Política",
    "Economia",
    "Segurança",
    "Saúde",
    "Turismo",
    "Educação",
    "Esportes",
  ],
  educacao: [
    "Educação em Foco",
    "Intercâmbio",
    "Psicologia",
    "Inclusão e Acessibilidade",
    "Educação dos Filhos",
    "Entretenimento",
  ],
  entretenimento: [
    "Em alta",
    "Filmes, Séries e TV",
    "Famosos",
    "Música",
    "Games",
    "Redes Sociais",
    "Curiosidades e Nostalgia",
    "Podcasts",
  ],
  esportes: [
    "Futebol",
    "Basquete",
    "Tênis",
    "Luta",
    "Automobilismo",
    "Futebol Americano",
    "Outros Esportes",
    "Entretenimento",
  ],
  mundo: [
    "Em alta",
    "Economia Mundial",
    "Ciência",
    "Meio Ambiente e Clima",
    "Segurança",
    "Esportes",
  ],
  tecnologia: [
    "Em alta",
    "Ciência e Futuro",
    "Apps e Ferramentas",
    "Cripto e Blockchain",
    "Segurança Digital",
    "Empresas e Mercado Tech",
  ],
};

const SECTION_NAMES: Record<string, string> = {
  brasil: "Brasil",
  educacao: "Educação",
  entretenimento: "Entretenimento",
  esportes: "Esportes",
  mundo: "Mundo",
  tecnologia: "Tecnologia",
};

const sectionPage = (slug: string, name: string) => {
  const [first = "Em alta", ...rest] = SECTIONS[slug] ?? [];
  return page(slug, name, [
    bannerTop(),
    heroBlock(slug),
    trending(first, slug),
    bannerMid(),
    block("zyCarousel", { categorySlug: slug, limit: 9, offset: 0 }),
    boxes(rest.map((title, i) => ({ offset: i * 3, slug, title }))),
    bannerGif(),
    block(
      "zyOverlayGrid",
      {
        categorySlug: slug,
        cols: 4,
        limit: 8,
        offset: 0,
        title: `Mais de ${name}`,
        wideIndex: -1,
      },
      { fx: { "1.1.1": down } }
    ),
  ]);
};

/* ───────────────────────── arquivo, post, busca, 404 ───────────────────────── */

const categoryLayout: Block[] = [
  block("zyArchiveHeader", {
    description: "",
    image: IMG.archiveBg,
    mode: "category",
    title: "",
  }),
  ad("banner", ADS.banner, { padding: "20px 0 0" }),
  block("zyArchive", {
    buttonLabel: "Carregar mais",
    categorySlug: "",
    cols: 3,
    limit: 100,
    step: 9,
  }),
  ad(
    "square",
    ADS.square,
    { margin: "0 auto 60px", maxWidth: "300px" },
    { fx: { "1": lift } }
  ),
];

const postColumn = () =>
  block(
    "zyStack",
    { gap: 0 },
    {
      children: [
        block(
          "zyPostHead",
          { noComments: "Sem comentários", showImage: "yes" },
          { fx: { "1.1": down } }
        ),
        block("postContent", { showMeta: "no" }),
        block("zyDivider", {
          align: "left",
          dark: "no",
          text: "",
          thin: "yes",
        }),
        block(
          "zyShare",
          { label: "Compartilhe esta notícia" },
          { fx: { "1.2": { ...up(), each: true } } }
        ),
        ad("banner", ADS.banner),
        block(
          "zyBrand",
          { logo: IMG.logo, slogan: BRAND.slogan },
          { fx: { "1.1": up() } }
        ),
      ],
    }
  );

const sidebar = () =>
  block(
    "zyStack",
    { gap: 32 },
    {
      children: [
        block(
          "zyBox",
          { mobilePad: 20, pad: 24, title: "inscreva-se" },
          {
            children: [
              block("zyNewsletter", {
                actionUrl: "",
                buttonLabel: "inscreva-se",
                note: 'Ao clicar no botão "Inscreva-se", você confirma que leu nossa Política de Privacidade.',
                placeholder: "Seu e-mail",
              }),
            ],
          }
        ),
        block(
          "zyBox",
          { mobilePad: 20, pad: 24, title: "últimas notícias" },
          {
            children: [
              // O bloco de lista não tem divisor próprio: o título da caixa faz esse papel.
              block("zyPostList", {
                buttonLabel: "",
                categorySlug: "",
                cols: 1,
                colsMobile: 1,
                colsTablet: 1,
                dark: "no",
                gap: 16,
                limit: 6,
                mediaGap: 16,
                offset: 0,
                ratio: 0.8,
                showAuthor: "no",
                showDate: "yes",
                thumb: 26,
                thumbMobile: 26,
                thumbTablet: 26,
              }),
            ],
          }
        ),
        squareAd(ADS.square),
        block(
          "zyBox",
          { mobilePad: 20, pad: 24, title: "destaques" },
          { children: [block("zyCategoryMenu", {})] }
        ),
      ],
    }
  );

const postLayout: Block[] = [
  block(
    "zySplit",
    { gap: 60, left: 72 },
    { children: [postColumn(), sidebar()] }
  ),
  block("zyMore", { count: 8, title: "Mais novidades" }),
];

const pesquisa = page("pesquisa", "Pesquisa", [
  block("zyArchiveHeader", {
    description: "",
    image: IMG.archiveBg,
    mode: "search",
    title: "Resultados para:",
  }),
  block(
    "zySearch",
    { placeholder: "Pesquisar..." },
    { fx: { "1.1": { enter: "zoomIn", enterMs: NORMAL } } }
  ),
  ad("banner", ADS.banner, { padding: "20px 0 0" }),
  block("zyArchive", {
    buttonLabel: "",
    categorySlug: "",
    cols: 3,
    limit: 100,
    step: 0,
  }),
  ad("banner", ADS.bannerCommunity),
]);

const notFound = page("404", "Página não encontrada", [
  block("zyNotFound", {
    backLabel: "voltar para o início",
    backUrl: "/",
    count: 4,
    latestTitle: "últimas notícias",
    searchPlaceholder: "Pesquisar...",
    text: "Opss... Parece que você não encontrou o que procura por aqui, mas não se preocupe: use a busca ou veja as últimas notícias.",
    title: "página não encontrada",
  }),
]);

/* ───────────────────────── comunidade, link da bio, legais ───────────────────────── */

const comunidade = page("comunidade", "Comunidade", [
  block("zyCommunity", {
    banner: ADS.bannerCommunity,
    benefits: BRAND.community.benefits.map(([title, text]) => ({
      text,
      title,
    })),
    benefitsTitle: "Ao entrar, você terá acesso a:",
    brand: BRAND.name,
    buttonLabel: "Fazer parte",
    buttonUrl: BRAND.community.checkoutUrl,
    currency: "R$",
    features: BRAND.community.features.map(label => ({ label })),
    intro: BRAND.community.intro,
    joinTitle: "Entre para a Comunidade",
    others: [0, 1, 2, 3].map(i => ({
      image: photo(PHOTO_IDS[30 + i] as string, 500, 500),
      title: `Comunidade ${i + 1}`,
      url: "#",
    })),
    othersTitle: "Outras Comunidades:",
    period: "/ Mês",
    planName: BRAND.community.planName,
    price: BRAND.community.price,
    tallBanner: photo(PHOTO_IDS[40] as string, 700, 1206),
    title: "Você não está apenas por dentro. Você faz parte.",
  }),
]);

const links = page(
  "links",
  "Links",
  [
    block("zyLinkBio", {
      background: [34, 35, 36].map(i => ({
        src: photo(PHOTO_IDS[i] as string, 1200, 1200),
      })),
      bio: `${BRAND.slogan}\nConheça nossas soluções`,
      links: [
        { label: "🚀 Entre para a Comunidade", url: "/comunidade/" },
        { label: "📰 Acesse o Portal de Notícias", url: "/" },
        { label: "📈 Divulgue sua marca", url: `mailto:${BRAND.email}` },
      ],
      name: BRAND.name,
      profile: IMG.avatar,
    }),
  ],
  { bare: true }
);

const legalBlocks = (title: string, items: LegalItem[]): Block[] => [
  block("heading", { align: "left", level: "h1", subtitle: "", text: title }),
  ...items.map(([kind, text]) =>
    kind === "h"
      ? block("heading", { align: "left", level: "h2", subtitle: "", text })
      : block("text", { text: kind === "li" ? `• ${text}` : text })
  ),
];

const legal = (slug: string, title: string, items: LegalItem[]) =>
  page(slug, title, legalBlocks(title, items), { prose: true });

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories,
  categoryLayout,
  footer: [footer()],
  header: [header()],
  menu: [
    { href: "/mundo/", label: "Mundo" },
    { href: "/brasil/", label: "Brasil" },
    { href: "/tecnologia/", label: "Tecnologia" },
    { href: "/entretenimento/", label: "Entretenimento" },
    { href: "/educacao/", label: "Educação" },
    { href: "/esportes/", label: "Esportes" },
  ],
  name: BRAND.name,
  pages: [
    home,
    ...TILES.map(([label, slug]) =>
      sectionPage(slug, SECTION_NAMES[slug] ?? label)
    ),
    pesquisa,
    notFound,
    comunidade,
    links,
    legal(
      "politica-de-privacidade",
      "Política de Privacidade",
      privacidade(LEGAL_BRAND)
    ),
    legal("termos-e-condicoes", "Termos e Condições", termos(LEGAL_BRAND)),
    legal(
      "politica-de-anuncios",
      "Política de Anúncios",
      anuncios(LEGAL_BRAND)
    ),
    legal("politica-editorial", "Política Editorial", editorial(LEGAL_BRAND)),
    legal("corrigir-erros", "Política de Correções", correcoes(LEGAL_BRAND)),
  ],
  postLayout,
  posts,
  theme: {
    accent: "#000000",
    ads: "on",
    bg: "#ffffff",
    favicon: IMG.favicon,
    fg: "#3c414c",
    fontBody: "'Inter', sans-serif",
    fontHeading: "'Inter', sans-serif",
    muted: "#656b77",
    title: "#020817",
    variant: "zyrion",
    zyAuthor: BRAND.author,
    zyAvatar: IMG.avatar,
  },
};

export const zyrion: SiteTemplate = {
  description:
    "Portal de notícias claro e preto: cabeçalho sticky com busca em tela cheia, slider com letreiro, listas por categoria, grade escura, carrossel, arquivo com 'carregar mais', post com sidebar, 404, comunidade e link da bio. Layout migrado do zyrionbrazil.com; marca e notícias fictícias.",
  id: "zyrion",
  name: "Portal Zyrion",
  preview: photo(PHOTO_IDS[0] as string, 1200, 800),
  site,
  tags: ["Notícias", "Portal", "Blog"],
};
