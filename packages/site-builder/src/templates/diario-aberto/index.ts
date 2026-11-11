import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import {
  type LegalBrand,
  type LegalItem,
  privacidade,
  termos,
} from "../zyrion/legal.js";
import { BRAND } from "./brand.js";
import { IMG, PHOTO_IDS, photo, STRIP } from "./images.js";
import { categories, posts } from "./posts.js";

/**
 * Template "Diário Aberto — Blog Pessoal": layout inspirado num tema de blog pessoal comercial (faixa da autora com
 * o nome ao fundo, menu com mega-menu de categorias, destaques em mosaico, grade masonry com primeira letra
 * destacada, faixa de fotos, post com barra lateral e modal de assinatura) com a variante `diario`. Marca, autora,
 * textos e posts são fictícios (`brand.ts`, `posts.ts`) e as imagens são placeholders (`images.ts`).
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Block>
): Block => ({
  id: `dd-${seq++}`,
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

const socials = BRAND.socials.map(([label, url]) => ({ label, url }));

/* ───────────────────────── blocos comuns ───────────────────────── */

const header = () => [
  block("ddHeader", {
    greeting: BRAND.greeting,
    layout: "auto",
    logo: "",
    logoText: BRAND.name,
    photo: IMG.author,
    previewMega: "no",
    searchLabel: "Pesquisar",
    searchPlaceholder: "O que você procura?",
    socials,
    subscribeLabel: "ASSINAR",
    subtitle: BRAND.subtitle,
  }),
];

const footer = () => [
  block("ddFooter", {
    copyright: BRAND.copyright,
    links:
      "Blog | /\nSobre | /sobre/\nContato | /contato/\nPrivacidade | /privacidade/\nTermos | /termos/",
    logo: "",
    logoText: BRAND.name,
    socials,
  }),
  block("ddSubscribe", {
    actionUrl: "",
    button: "ASSINAR",
    emailPlaceholder: "Seu e-mail",
    namePlaceholder: "Seu nome",
    showInEditor: "no",
    success: "Pronto! Você está na lista.",
    text: "Receba só os melhores posts por e-mail",
    title: "Junte-se a nós hoje",
  }),
  block("scrollTop", {
    bottom: 30,
    color: "#ffffff",
    hoverColor: "#f1f1f1",
    iconColor: "#5608E0",
    label: "Voltar ao topo",
    radius: 20,
    side: "right",
    sideGap: 30,
    size: 40,
    threshold: 300,
  }),
];

const sidebar = () =>
  block("ddSidebar", {
    aboutName: BRAND.author,
    aboutPhoto: IMG.author,
    aboutText: BRAND.bio,
    aboutTitle: "Sobre mim",
    categoriesTitle: "Categorias",
    popular: "",
    popularCount: 3,
    popularTitle: "Posts populares",
    socials,
    videos: [],
    vlogTitle: "Último vlog",
  });

const split = (main: Block[]) =>
  block(
    "ddSplit",
    {},
    {
      children: [block("ddStack", { gap: 0 }, { children: main }), sidebar()],
    }
  );

/* ───────────────────────── home ───────────────────────── */

const home = page("", "Blog pessoal de estilo de vida", [
  block(
    "ddFeatured",
    { categorySlug: "", offset: 0 },
    { fx: { "": { enter: "fadeIn" } } }
  ),
  block(
    "ddMasonry",
    {
      buttonLabel: "CARREGAR MAIS",
      cards: "alternate",
      categorySlug: "",
      columns: "wide",
      count: 45,
      mode: "recent",
      offset: 4,
      step: 15,
    },
    {
      fx: {
        "": { enter: "fadeIn" },
        "1.1": { each: true, enter: "fadeInUp", stagger: 60 },
      },
    }
  ),
  block("ddPhotoStrip", {
    items: STRIP.map(s => ({ image: s.image, large: s.large, url: "" })),
    label: "Fotos do blog",
    seconds: 28,
  }),
]);

/* ───────────────────────── categoria e post ───────────────────────── */

const categoryLayout: Block[] = [
  split([
    block("ddCategoryHead", { label: "Categoria:", unit: "posts" }),
    block("ddMasonry", {
      buttonLabel: "CARREGAR MAIS",
      cards: "light",
      categorySlug: "",
      columns: "two",
      count: 60,
      mode: "recent",
      offset: 0,
      step: 8,
    }),
  ]),
];

const postLayout: Block[] = [
  split([
    block("ddPostHead", {
      author: BRAND.author,
      byLabel: "Por",
      showImage: "yes",
    }),
    block("ddPostBody", {}),
    block("ddPostFoot", { tagsLabel: "Tags:" }),
    block("ddAuthorBox", {
      name: BRAND.author,
      photo: IMG.author,
      socials,
      text: BRAND.bio,
      title: "Eu sou a",
    }),
    block("postNav", { nextLabel: "PRÓXIMO POST", prevLabel: "POST ANTERIOR" }),
  ]),
];

/* ───────────────────────── busca, sobre, contato ───────────────────────── */

const pesquisa = page("pesquisa", "Pesquisa", [
  split([
    block("ddResultsHead", { label: "Resultados para:" }),
    block("ddMasonry", {
      buttonLabel: "CARREGAR MAIS",
      cards: "light",
      categorySlug: "",
      columns: "two",
      count: 100,
      mode: "search",
      offset: 0,
      step: 0,
    }),
  ]),
]);

const sobre = page("sobre", "Sobre mim", [
  split([
    block("ddAbout", {
      heading: "Sobre mim",
      image: IMG.about,
      text: `Oi, eu sou a ${BRAND.authorShort}! Este texto é um exemplo do template: troque pela sua história.\n\nO ${BRAND.name} nasceu como um caderno de anotações sobre o que eu testava no banheiro, no guarda-roupa e na mala de viagem. Com o tempo, virou um espaço de conversa com quem passa por aqui.\n\n## O que você vai encontrar\n\n- Beleza sem complicação, com rotinas que cabem na correria\n- Moda para a vida real, com poucas peças e muitas combinações\n- Roteiros de viagem curtos e acessíveis\n- Dicas de bem-estar e de organização do dia a dia\n\n> Escrever é o meu jeito de lembrar que a vida cotidiana tem muita coisa boa — ${BRAND.author}\n\nTodos os personagens, situações e dicas deste modelo são fictícios e servem só para demonstrar o layout. Quer falar comigo? Use a página de [contato](/contato/).`,
    }),
  ]),
]);

const contato = page("contato", "Contato", [
  split([
    block("ddPageTitle", { text: "Contato" }),
    block("ddContactForm", {
      actionUrl: "",
      button: "ENVIAR",
      email: BRAND.email,
      intro:
        "Quer falar comigo? Tem uma sugestão de pauta, uma dúvida ou só vontade de conversar? Escreva uma mensagem: eu leio todas.",
      success: "Mensagem recebida! Obrigada por escrever.",
    }),
  ]),
]);

const notFound = page("404", "Página não encontrada", [
  block("ddNotFound", {
    backLabel: "VOLTAR PARA A HOME",
    code: "404",
    searchPlaceholder: "Pesquisar no blog",
    text: "A página que você procura não existe ou mudou de endereço.",
    title: "Ops, página não encontrada",
  }),
]);

const legal = (slug: string, title: string, items: LegalItem[]) =>
  page(slug, title, [
    split([
      block("ddPageTitle", { text: title }),
      ...items.map(([kind, text]) =>
        kind === "h"
          ? block("heading", { align: "left", level: "h2", subtitle: "", text })
          : block("text", { text: kind === "li" ? `• ${text}` : text })
      ),
    ]),
  ]);

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories,
  categoryLayout,
  footer: footer(),
  header: header(),
  menu: [
    { href: "/", label: "Início" },
    { dynamic: "categories", href: "#", label: "Categorias" },
    { href: "/sobre/", label: "Sobre" },
    { href: "/contato/", label: "Contato" },
  ],
  name: BRAND.name,
  pages: [
    home,
    pesquisa,
    sobre,
    contato,
    legal("privacidade", "Política de Privacidade", privacidade(LEGAL_BRAND)),
    legal("termos", "Termos de Uso", termos(LEGAL_BRAND)),
    notFound,
  ],
  postLayout,
  posts,
  theme: {
    accent: "#5608E0",
    bg: "#ffffff",
    favicon: IMG.favicon,
    fg: "#646566",
    fontBody: "'Poppins', sans-serif",
    fontHeading: "'Poppins', sans-serif",
    muted: "#646566",
    variant: "diario",
  },
};

export const diarioAberto: SiteTemplate = {
  description:
    "Blog pessoal de estilo de vida, branco e roxo: faixa da autora com foto e nome ao fundo, menu com mega-menu de categorias, destaques em mosaico, grade masonry com primeira letra destacada, faixa de fotos, posts com barra lateral e modal de assinatura.",
  id: "diario-aberto",
  name: "Diário Aberto — Blog Pessoal",
  preview: photo(PHOTO_IDS[21] as string, 1200, 800),
  site,
  tags: ["Blog", "Estilo de vida"],
};
