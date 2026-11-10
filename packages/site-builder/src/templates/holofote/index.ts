import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import {
  type LegalBrand,
  type LegalItem,
  privacidade,
  termos,
} from "../zyrion/legal.js";
import { BRAND } from "./brand.js";
import { ADS, IMG, PHOTO_IDS, photo } from "./images.js";
import { categories, posts } from "./posts.js";

/**
 * Template "Holofote — Portal de Famosos": layout inspirado no hugogloss.uol.com.br (cabeçalho fixo com menu
 * lateral no celular, destaques 1+4, grade com anúncios intercalados e "Veja mais", categoria com lista rolável,
 * post com barra lateral, tag/busca, contato e 404) com a variante `holofote`. Marca, textos e notícias são
 * fictícios (`brand.ts`, `posts.ts`) e as imagens são placeholders (`images.ts`).
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Block>
): Block => ({
  id: `hf-${seq++}`,
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

/** Anúncio vazio: usa os do site (`theme.adsConfig`, com imagens de exemplo). Mesmos formatos do original. */
const ad = (size: "banner" | "side" | "square", style?: Block["style"]) =>
  block(
    "adSlot",
    { items: [], label: "", link: "", seconds: 6, size },
    { style }
  );

/* ───────────────────────── blocos comuns ───────────────────────── */

const socials = BRAND.socials.map(([label, url]) => ({ label, url }));

const header = () => [
  block("hfHeader", {
    dark: "auto",
    logo: IMG.logo,
    logoWhite: IMG.logoWhite,
    searchPlaceholder: "busca",
    socials,
  }),
  block("hfAdStrip", {}),
];

const footer = () =>
  block("hfFooter", {
    columns: [
      {
        links:
          "Filmes | /category/filmes/\nBuzz | /category/buzz/\nEntrevistas | /category/entrevistas/",
        title: "Categorias",
      },
      {
        links:
          "Famosos | /category/famosos/\nMúsica | /category/musica/\nPremiações | /category/premiacoes/\nTV | /category/tv/",
        title: "Outras Categorias",
      },
      {
        links:
          "Home | /\nSobre | /sobre/\nContato | /contato/\nPrivacidade | /privacidade/\nTermos | /termos/",
        title: "Institucional",
      },
    ],
    copyright: BRAND.copyright,
    note: BRAND.footerNote,
    shareHint: "Onde deseja compartilhar?",
    socials,
    socialsTitle: "Redes sociais",
  });

const latest = (extra: Record<string, unknown> = {}) =>
  block("hfLatest", {
    adAfter: "2,4,6,9,12,15,18,21",
    buttonLabel: "Veja mais",
    categorySlug: "",
    count: 40,
    layout: "grid",
    offset: 0,
    step: 12,
    title: "Últimas Notícias",
    ...extra,
  });

/* ───────────────────────── home e categoria ───────────────────────── */

const home = page("", "Notícias de famosos e entretenimento", [
  block("hfFeatured", { categorySlug: "", hoverVeil: "no", offset: 0 }),
  ad("banner", { margin: "10px 0" }),
  latest(),
  ad("banner", { margin: "10px 0" }),
]);

const categoryLayout: Block[] = [
  block("hfFeatured", { categorySlug: "", hoverVeil: "yes", offset: 0 }),
  ad("banner", { margin: "10px 0" }),
  latest({ layout: "split" }),
  ad("banner", { margin: "10px 0" }),
];

/* ───────────────────────── post ───────────────────────── */

const postColumn = () =>
  block(
    "hfStack",
    { gap: 0 },
    {
      children: [
        block("hfPostHead", {
          authors: "Redação Holofote\nLetícia Prado\nMarcelo Dantas",
          shareLabel: "Compartilhe:",
          showImage: "yes",
          showUpdated: "yes",
        }),
        block("hfResume", { label: "Ler resumo", open: "no" }),
        block("hfPostBody", {
          adEvery: 3,
          firstAd: "yes",
          inlineLabel: "Continua depois da Publicidade",
        }),
        block("hfReadAlso", { count: 2, title: "LEIA TAMBÉM:" }),
        block("hfFollow", { text: BRAND.followText, url: BRAND.followUrl }),
        block("hfShare", { label: "Compartilhe:" }),
        block("hfTags", { label: "Tags:" }),
        block("postNav", {
          nextLabel: "PRÓXIMA NOTÍCIA",
          prevLabel: "NOTÍCIA ANTERIOR",
        }),
      ],
    }
  );

const postLayout: Block[] = [
  block(
    "hfSplit",
    { gray: "yes", layout: "post" },
    {
      children: [
        postColumn(),
        block("hfSidebar", {
          count: 6,
          sticky: "yes",
          title: "Últimas Notícias",
          topAds: 3,
        }),
      ],
    }
  ),
];

/* ───────────────────────── tag e busca ───────────────────────── */

const results = (slug: string, title: string, mode: "search" | "tag") =>
  page(slug, title, [
    ad("banner", { margin: "10px 0" }),
    block(
      "hfSplit",
      { gray: "yes", layout: "results" },
      {
        children: [
          block(
            "hfStack",
            { gap: 0 },
            {
              children: [
                block("hfResultsHead", { mode }),
                block("hfPostList", {
                  box: "yes",
                  categorySlug: "",
                  count: 40,
                  mode: "search",
                  offset: 0,
                  title: "",
                }),
              ],
            }
          ),
          block(
            "hfStack",
            { gap: 20 },
            {
              children: [
                ad("side"),
                block("hfNewsletter", {
                  actionUrl: "",
                  button: "Cadastrar",
                  placeholder: "Seu e-mail",
                  text: "Gosta das nossas notícias? Deixe seu e-mail e receba os destaques do dia na sua caixa de entrada.",
                  title: "Newsletter Holofote",
                }),
              ],
            }
          ),
        ],
      }
    ),
  ]);

/* ───────────────────────── institucionais ───────────────────────── */

const sobre = page("sobre", "Sobre", [
  block("hfPageTitle", { text: "Sobre" }),
  block("text", {
    text: `O ${BRAND.name} é um portal de famosos e entretenimento: música, filmes, TV, premiações e o que está rendendo nas redes. Este texto é um exemplo do template — substitua pela história da sua marca.`,
  }),
  block("text", {
    text: "Todas as notícias, personagens e situações mostradas neste modelo são fictícias e servem só para demonstrar o layout.",
  }),
  block("text", {
    text: "Quer sugerir uma pauta ou falar com a redação? Use a página de contato.",
  }),
]);

const contato = page("contato", "Contato", [
  block("hfPageTitle", { text: "Contato" }),
  block("hfContactForm", {
    actionUrl: "",
    email: BRAND.email,
    fallback: "Caso não consiga usar o formulário, envie sua pauta para:",
    intro:
      "Quer falar com a gente? Tem uma pauta, ideia ou novidade? Preencha o formulário abaixo.",
  }),
]);

const notFound = page("404", "Página não encontrada", [
  block("hfNotFound", {
    backLabel: "Voltar para a home",
    backUrl: "/",
    code: "404",
    line1: "Esta página não está disponível.",
    line2: "Confira sua conexão com a internet e tente novamente.",
    title: "Ops...",
  }),
]);

const legalBlocks = (title: string, items: LegalItem[]): Block[] => [
  block("hfPageTitle", { text: title }),
  ...items.map(([kind, text]) =>
    kind === "h"
      ? block("heading", { align: "left", level: "h2", subtitle: "", text })
      : block("text", { text: kind === "li" ? `• ${text}` : text })
  ),
];

const legal = (slug: string, title: string, items: LegalItem[]) =>
  page(slug, title, legalBlocks(title, items));

/* ───────────────────────── site ───────────────────────── */

const ADS_CONFIG = JSON.stringify({
  banner: { items: [{ src: ADS.banner }], link: "", seconds: 6 },
  side: {
    items: [{ src: ADS.square }, { src: ADS.side }],
    link: "",
    seconds: 6,
  },
});

const site: Site = {
  categories,
  categoryLayout,
  footer: [footer()],
  header: header(),
  menu: [
    { href: "/category/musica/", label: "Música" },
    { href: "/category/filmes/", label: "Filmes" },
    { href: "/category/tv/", label: "TV" },
    { href: "/category/famosos/", label: "Famosos" },
    { href: "/category/premiacoes/", label: "Premiações" },
    { href: "/category/buzz/", label: "Buzz" },
    { href: "/category/entrevistas/", label: "Entrevistas" },
  ],
  name: BRAND.name,
  pages: [
    home,
    results("pesquisa", "Pesquisa", "search"),
    results("tag", "Tag", "tag"),
    sobre,
    contato,
    legal("privacidade", "Política de Privacidade", privacidade(LEGAL_BRAND)),
    legal("termos", "Termos de Uso", termos(LEGAL_BRAND)),
    notFound,
  ],
  postLayout,
  posts,
  theme: {
    accent: "#282828",
    ads: "on",
    adsConfig: ADS_CONFIG,
    bg: "#ffffff",
    favicon: IMG.favicon,
    fg: "#282828",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Roboto', sans-serif",
    muted: "#656565",
    variant: "holofote",
  },
};

export const holofote: SiteTemplate = {
  description:
    "Portal de famosos e entretenimento: cabeçalho fixo com busca e menu lateral no celular, destaques 1+4, grade de notícias com anúncios intercalados e 'Veja mais', categoria com lista rolável, post com resumo expansível e barra lateral, tag/busca, contato, 404 e modal de compartilhar. Layout inspirado no Hugo Gloss; marca e notícias fictícias.",
  id: "holofote",
  name: "Holofote — Portal de Famosos",
  preview: photo(PHOTO_IDS[2] as string, 1200, 800),
  site,
  tags: ["Notícias", "Entretenimento"],
};
