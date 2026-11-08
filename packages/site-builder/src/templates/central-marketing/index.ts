import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND } from "./brand.js";
import { AVATARS, IMG, logoPlaceholder, pool, wordmark } from "./images.js";
import { type LegalBrand, privacidade, termos } from "./legal.js";
import { categorySeeds, posts } from "./posts.js";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  children?: Block[],
  fx?: Block["fx"]
): Block => ({ children, fx, id: `ct-${seq++}`, props, type });

/** Mesmo bloco, com âncora para links `#nome` (ex.: o "Saber Mais" da home). */
const anchored = (anchor: string, b: Block): Block => ({ ...b, anchor });

const LEGAL_BRAND: LegalBrand = {
  domain: "seudominio.com",
  email: BRAND.email,
  name: BRAND.name,
};

const LOGO = logoPlaceholder(
  BRAND.name.slice(0, 1).toUpperCase(),
  BRAND.accent
);

const SOCIALS = [
  "Instagram",
  "YouTube",
  "X",
  "Facebook",
  "Threads",
  "TikTok",
  "Video",
].map(label => ({ label, url: "#" }));

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

/** Entrada em sequência (como no original: 0, 100, 200… ms) nos filhos de um elemento. */
const stagger = (
  step = 100,
  enter: "fadeIn" | "fadeInUp" | "fadeInRight" = "fadeInUp"
) => ({ each: true, enter, stagger: step });

type LegalItems = ReturnType<typeof termos>;

const legalBlocks = (items: LegalItems): Block[] =>
  items.map(([kind, text]) =>
    kind === "h"
      ? block("heading", { align: "left", level: "h2", subtitle: "", text })
      : block("text", { text: kind === "li" ? `• ${text}` : text })
  );

const legalPage = (slug: string, title: string, items: LegalItems) =>
  page(
    slug,
    title,
    [
      block(
        "ctBanner",
        { image: IMG.banner, mode: "title", title },
        undefined,
        { "1.1.1": { enter: "fadeInUp" } }
      ),
      ...legalBlocks(items),
    ],
    { prose: true }
  );

/**
 * Vídeos recomendados: episódios públicos do canal do Sebrae SP sobre vendas e marketing para pequenos
 * negócios (incorporação liberada, conferida pelo oEmbed do YouTube). Troque pelos seus no editor.
 */
const VIDEOS = [
  "zIXuzf9h7M4",
  "4F4-jFOigYI",
  "8TpBEVsdE08",
  "4hlYY11mVy0",
  "VGR7ugzcess",
  "Ek4opf4RTkY",
  "RXVf14EKbqU",
  "c3vZBmSrALI",
  "OJaf-oLVZgs",
].map(id => ({
  title: "",
  youtubeId: `https://www.youtube.com/watch?v=${id}`,
}));

/** Ordem dos cartões na página /categorias/. */
const CATEGORY_ORDER = [
  "estrategia",
  "conteudo",
  "anuncios",
  "busca-organica",
  "midias-sociais",
  "email",
  "dados",
  "marca",
  "vendas-online",
  "video",
  "sites",
  "ferramentas",
];

/** Os 9 temas em destaque na home (ícone, título e chamada de cada cartão). */
const HOME_CATEGORIES = [
  {
    icon: "chart",
    slug: "estrategia",
    text: "Metas claras, prioridades e um plano que cabe na rotina de quem faz tudo sozinho.",
    title: "Estratégia",
  },
  {
    icon: "book",
    slug: "conteudo",
    text: "Pautas, calendário e formatos para publicar com constância sem se esgotar.",
    title: "Marketing de Conteúdo",
  },
  {
    icon: "coins",
    slug: "anuncios",
    text: "Quanto investir, o que testar e como ler os números antes de aumentar a verba.",
    title: "Anúncios Pagos",
  },
  {
    icon: "news",
    slug: "busca-organica",
    text: "Seja encontrado no Google por quem já está procurando o que você vende.",
    title: "SEO e Busca",
  },
  {
    icon: "phone",
    slug: "midias-sociais",
    text: "Presença consistente nas redes, com métricas que mostram o que dá resultado.",
    title: "Mídias Sociais",
  },
  {
    icon: "mail",
    slug: "email",
    text: "Listas, sequências automáticas e mensagens que as pessoas querem abrir.",
    title: "E-mail e Automação",
  },
  {
    icon: "report",
    slug: "dados",
    text: "Um painel simples para acompanhar toda semana e decidir com menos achismo.",
    title: "Dados e Métricas",
  },
  {
    icon: "devices",
    slug: "vendas-online",
    text: "Página de produto, carrinho e pós-venda ajustados para vender mais pela internet.",
    title: "Vendas Online",
  },
  {
    icon: "feather",
    slug: "marca",
    text: "Posicionamento, tom de voz e identidade para ser lembrado pelo motivo certo.",
    title: "Marca e Posicionamento",
  },
];

/** Materiais gratuitos de exemplo (vitrine "Materiais"): troque pelos seus no editor. */
const PRODUCTS = [
  {
    kicker: "Planilha gratuita",
    tag: "Estratégia",
    text: "Metas, canais e tarefas do trimestre organizados numa única página, com espaço para a revisão de cada mês.",
    title: "Plano de Marketing em 1 Página",
  },
  {
    kicker: "Modelo editável",
    tag: "Conteúdo",
    text: "Calendário com banco de pautas, frequência realista e campos para registrar o que funcionou em cada post.",
    title: "Calendário Editorial Pronto",
  },
  {
    kicker: "Guia passo a passo",
    tag: "Anúncios",
    text: "Do primeiro orçamento ao teste de criativos: como começar a anunciar sem queimar dinheiro nas primeiras semanas.",
    title: "Primeira Campanha Sem Desperdício",
  },
  {
    kicker: "Checklist",
    tag: "Vendas Online",
    text: "Fotos, descrição, frete, dúvidas frequentes e prova social: tudo o que revisar antes de mandar tráfego para a página.",
    title: "Página de Produto que Converte",
  },
  {
    kicker: "Sequência pronta",
    tag: "E-mail",
    text: "Cinco mensagens de boas-vindas com assunto, objetivo e estrutura de cada uma, prontas para adaptar ao seu negócio.",
    title: "5 E-mails de Boas-Vindas",
  },
  {
    kicker: "Painel modelo",
    tag: "Dados",
    text: "As métricas que valem a pena olhar toda semana, já com fórmulas e um guia do que fazer quando cada uma cai.",
    title: "Painel Semanal de Métricas",
  },
];

const home = page("", "Início", [
  block(
    "ctHero",
    {
      avatars: AVATARS.map((src, i) => ({ alt: `Pessoa ${i + 1}`, src })),
      buttonLabel: "Explorar Conteúdos",
      buttonUrl: "/categorias/",
      chips: [
        { label: "Estratégia", url: "/category/estrategia/" },
        { label: "Anúncios Pagos", url: "/category/anuncios/" },
        { label: "SEO e Busca", url: "/category/busca-organica/" },
        { label: "Mídias Sociais", url: "/category/midias-sociais/" },
        { label: "E-mail", url: "/category/email/" },
        { label: "Vendas Online", url: "/category/vendas-online/" },
        { label: "Vídeo", url: "/category/video/" },
      ],
      highlight: "Toca o Próprio Negócio",
      panelImage: IMG.heroPanel,
      proofLabel: "Leitores por mês",
      proofValue: "+30 mil",
      socials: SOCIALS.slice(0, 2),
      taglines: [
        { text: "Guias Práticos ->" },
        { text: "Exemplos Do Dia A Dia ->" },
        { text: "Sempre Gratuito" },
      ],
      text: "Guias práticos, modelos prontos e exemplos de pequenos negócios para atrair clientes, vender pela internet e medir o que dá resultado — sem jargão e sem fórmula mágica.",
      title: "Marketing Digital Explicado Para Quem",
      videoUrl: BRAND.heroVideo,
    },
    undefined,
    {
      "1.1": { enter: "fadeInUp" },
      "1.2.1.1": stagger(100, "fadeIn"),
      "1.3": { enter: "fadeIn" },
    }
  ),
  block("logoMarquee", {
    logos: [
      "Sua Marca",
      "Parceiro",
      "Estúdio",
      "Mídia",
      "Agência",
      "Escola",
      "Loja",
      "Portal",
      "Studio",
      "Hub",
    ].map((name, i) => ({
      alt: `${name} ${i + 1}`,
      src: wordmark(name, i),
      url: "",
    })),
    secondsPerLogo: 1.5,
    showDesktop: 5,
    showMobile: 2,
    showTablet: 4,
  }),
  block(
    "ctSplit",
    {
      badgeFootIcon: "trend",
      badgeIcon: "chart",
      badgeImage: IMG.texture,
      badgeKicker: "Passo a passo",
      badgeValue: "simples",
      buttonLabel: "Escolher Um Tema",
      buttonUrl: "#sabermais",
      eyebrow: "Comece Por Aqui",
      image: IMG.mostSearched,
      imageAlt: "Equipe planejando ações de marketing",
      text: "Você não precisa estar em todos os canais nem ter uma equipe grande para crescer no digital. Na maioria dos pequenos negócios, duas ou três ações bem feitas e acompanhadas toda semana trazem mais clientes do que dez iniciativas soltas.\n\nAqui você encontra um caminho em etapas: entender quem é o seu cliente, escolher onde aparecer, medir o que funciona e ajustar sem desperdiçar tempo nem dinheiro.",
      title: "Por Onde Começar Quando o Tempo e o Orçamento São Curtos",
      variant: "feature",
    },
    undefined,
    {
      "1.1.2": { enter: "fadeInUp" },
      "1.2.1": { enter: "fadeInRight" },
      "1.2.2": { enter: "zoomIn" },
    }
  ),
  block(
    "featureGrid",
    {
      columns: 3,
      items: [
        { title: "Linguagem simples, sem jargão" },
        { title: "Exemplos de negócios do seu tamanho" },
        { title: "Passos para aplicar ainda hoje" },
      ],
      style: "simple",
    },
    undefined,
    { "1.1": stagger(100) }
  ),
  anchored(
    "sabermais",
    block(
      "heading",
      {
        align: "center",
        eyebrow: "Categorias",
        level: "h2",
        subtitle: "",
        text: "Qual tema você quer dominar primeiro?",
      },
      undefined,
      { "1.2": { enter: "fadeInUp" } }
    )
  ),
  block(
    "featureGrid",
    {
      columns: 3,
      items: HOME_CATEGORIES.map(({ slug, ...it }, i) => ({
        ...it,
        image: i % 2 === 1 ? IMG.texture : "",
        kicker: "",
        linkLabel: "Ver Mais",
        tag: "",
        url: `/category/${slug}/`,
      })),
      style: "icon",
    },
    undefined,
    { "1.1": stagger(100, "fadeIn") }
  ),
  block("button", {
    buttonLabel: "Ver Todas As Categorias",
    buttonUrl: "/categorias/",
    variant: "primary",
  }),
  block("heading", {
    align: "center",
    level: "h2",
    subtitle: "",
    text: "Vídeos recomendados",
  }),
  block("videoGrid", { title: "", videos: VIDEOS }, undefined, {
    "1.1": { enter: "fadeIn" },
  }),
  block("button", {
    buttonLabel: "Ver Mais Vídeos",
    buttonUrl: "#",
    variant: "primary",
  }),
  block(
    "heading",
    {
      align: "center",
      eyebrow: BRAND.name,
      level: "h2",
      subtitle: "",
      text: "Tudo o que você precisa para crescer no digital",
    },
    undefined,
    { "1.2": { enter: "fadeInUp" } }
  ),
  block(
    "featureGrid",
    {
      columns: 3,
      items: [
        { icon: "book", title: "Guias Passo a Passo" },
        { icon: "layout", title: "Modelos Prontos Para Usar" },
        { icon: "check", title: "Exemplos de Pequenos Negócios" },
      ],
      style: "numbered",
    },
    undefined,
    { "1.1": stagger(100) }
  ),
  block(
    "ctSplit",
    {
      badgeImage: IMG.texture,
      badgeLabel: "Nota média dos leitores",
      badgeStars: 5,
      badgeValue: "4.9",
      buttonLabel: "Ler o Guia Completo",
      buttonUrl: "/posicionamento-de-marca-em-uma-frase/",
      eyebrow: "Em Destaque",
      image: IMG.spotlight,
      imageAlt: "Prédios comerciais vistos de baixo",
      items: [
        { icon: "triangle", text: "Para quem exatamente você vende?" },
        {
          icon: "shield",
          text: "Que problema você resolve melhor que os outros?",
        },
        { icon: "check", text: "Por que o cliente deveria acreditar em você?" },
        {
          icon: "coins",
          text: "Como usar a frase no site, nas redes e nas vendas",
        },
      ],
      quote: "“Quem tenta falar com todo mundo não é lembrado por ninguém.”",
      title:
        "Posicionamento de Marca: Como Explicar o Seu Negócio em Uma Frase",
      variant: "spotlight",
    },
    undefined,
    {
      "1.1.2": { enter: "fadeInUp" },
      "1.1.4": stagger(100, "fadeInRight"),
      "1.2.1": { enter: "fadeInLeft" },
      "1.2.2": { enter: "fadeInUp" },
    }
  ),
  block(
    "ctBanner",
    {
      buttonLabel: "Quero Receber",
      buttonUrl: "#",
      image: IMG.ctaBanner,
      mode: "cta",
      text: "Um e-mail curto toda terça-feira com uma ideia prática para testar no seu negócio naquela semana. Sem spam, e você cancela quando quiser.",
      title: "Receba Uma Dica de Marketing Por Semana",
    },
    undefined,
    { "": { enter: "zoomIn" } }
  ),
  anchored(
    "materiais",
    block(
      "heading",
      {
        align: "center",
        eyebrow: "Materiais",
        level: "h2",
        subtitle: "",
        text: "Modelos e guias gratuitos",
      },
      undefined,
      { "1.2": { enter: "fadeInUp" } }
    )
  ),
  block(
    "featureGrid",
    {
      columns: 3,
      items: PRODUCTS.map((it, i) => ({
        ...it,
        icon: "",
        image: pool(i + 3, 900),
        linkLabel: "Baixar Grátis",
        url: "#",
      })),
      style: "product",
    },
    undefined,
    { "1.1": stagger(100, "fadeIn") }
  ),
  block("button", {
    buttonLabel: "Ver Todos Os Materiais",
    buttonUrl: "#",
    variant: "primary",
  }),
  block(
    "ctSplit",
    {
      badgeImage: IMG.texture,
      badgeLabel: "Recomendariam a um amigo",
      badgeNote: "Pesquisa com leitores da newsletter.",
      badgeValue: "92%",
      buttonLabel: "Ler o Artigo",
      buttonUrl: "/sequencia-de-boas-vindas-por-email-em-5-mensagens/",
      eyebrow: "Você Sabia?",
      image: IMG.curiosities,
      imageAlt: "Pessoas em reunião de trabalho",
      quotes: [
        {
          avatar: AVATARS[0] ?? "",
          name: "Cliente 1",
          role: "Dona de confeitaria",
          text: "Eu postava todo dia e não via retorno. Com o calendário e o painel semanal, passei a publicar menos, mas com propósito, e hoje sei quais posts trazem encomendas.",
        },
        {
          avatar: AVATARS[1] ?? "",
          name: "Cliente 2",
          role: "Fotógrafo autônomo",
          text: "Achava que anúncio era só para empresa grande. O guia da primeira campanha me ajudou a começar com pouco, testar dois criativos e parar de gastar no que não funcionava.",
        },
        {
          avatar: AVATARS[2] ?? "",
          name: "Cliente 3",
          role: "Loja de roupas online",
          text: "Muita gente colocava produto no carrinho e sumia. Ajustei a página de produto com o checklist e criei lembretes de carrinho abandonado; parte dessas vendas voltou já no primeiro mês.",
        },
      ],
      text: "Redes sociais mudam as regras o tempo todo, mas a sua lista de e-mails continua sua. Uma boa sequência de boas-vindas apresenta o negócio, cria confiança e prepara a primeira compra — mesmo enquanto você atende outros clientes.",
      title: "E-mail Ainda Funciona? O Canal Que Você Controla de Verdade",
      variant: "story",
    },
    undefined,
    {
      "1.1.2": { enter: "fadeInUp" },
      "1.2.1": { enter: "fadeInLeft" },
      "1.2.2": { enter: "zoomIn" },
      "1.3": stagger(100, "fadeInRight"),
    }
  ),
  block(
    "heading",
    {
      align: "center",
      eyebrow: "Blog",
      level: "h2",
      subtitle: "",
      text: "Todos os Conteúdos",
    },
    undefined,
    { "1.2": { enter: "fadeInUp" } }
  ),
  block("categorySearch", {}),
  block("postList", { cardStyle: "grid", limit: 9, title: "" }),
]);

const blogs = page("blogs", "Blogs", [
  block(
    "ctBanner",
    { image: IMG.banner, mode: "title", title: "Blogs" },
    undefined,
    { "1.1.1": { enter: "fadeInUp" } }
  ),
  block("categorySearch", { layout: "compact" }),
  block("linkCards", {
    items: [1, 2, 3, 4, 5].map(n => ({
      image: pool(n + 6, 800),
      name: `Projeto parceiro ${n}`,
      url: "#",
    })),
    title: "",
  }),
]);

const categorias = page("categorias", "Categorias", [
  block(
    "ctBanner",
    { image: IMG.banner, mode: "title", title: "Categorias" },
    undefined,
    { "1.1.1": { enter: "fadeInUp" } }
  ),
  block(
    "heading",
    { align: "center", level: "h2", subtitle: "", text: "O que você procura?" },
    undefined,
    { "1.1": { enter: "fadeInUp" } }
  ),
  block(
    "categoryGrid",
    {
      buttonLabel: "",
      buttonUrl: "",
      headImage: IMG.texture,
      images: CATEGORY_ORDER.map((_, i) => ({ src: pool(i, 700), text: "" })),
      items: CATEGORY_ORDER.map(category => ({ category, label: "" })),
      limit: 0,
      subtitle: "",
      title: "",
    },
    undefined,
    { "1.1": stagger(100, "fadeIn") }
  ),
]);

const links = page(
  "links",
  "Links",
  [
    block("image", { alt: BRAND.name, src: LOGO }),
    block("heading", {
      align: "center",
      level: "h1",
      subtitle: BRAND.tagline,
      text: BRAND.name,
    }),
    block("socialIcons", { items: SOCIALS.slice(0, 3) }),
    block("button", {
      buttonLabel: "Artigos do Blog",
      buttonUrl: "/",
      variant: "wide",
    }),
    block("button", {
      buttonLabel: "Materiais Gratuitos",
      buttonUrl: "/#materiais",
      variant: "wide",
    }),
    block("button", {
      buttonLabel: "Fale Conosco",
      buttonUrl: "#",
      variant: "wide",
    }),
  ],
  { bare: true }
);

const pesquisa = page(
  "pesquisa",
  "Resultado da Pesquisa",
  [
    block("categorySearch", {}),
    block("categoryHeader", {
      backLabel: "Voltar",
      backUrl: "/",
      title: "Resultado da Pesquisa:",
    }),
    block("postList", { cardStyle: "archive", limit: 100, title: "" }),
  ],
  { wide: true }
);

const notFound = page("404", "Página não encontrada", [
  block("ctBanner", {
    buttonLabel: "Página Inicial",
    buttonUrl: "/",
    code: "404",
    mode: "error",
    text: "O endereço pode ter mudado ou sido digitado com algum erro. Volte para a página inicial ou use a busca para encontrar o conteúdo que você procurava.",
    title: "Página não encontrada",
  }),
]);

const site: Site = {
  categories: categorySeeds.map(([slug, name]) => ({
    id: `cat-${slug}`,
    name,
    slug,
  })),
  categoryLayout: [
    block("categorySearch", {}),
    block("categoryHeader", { backLabel: "Voltar", backUrl: "/categorias/" }),
    block("postList", { cardStyle: "archive", limit: 30, title: "" }),
  ],
  footer: [
    block("ctFooter", {
      columns: [
        {
          links:
            "Categorias | /categorias/\nBlogs | /blogs/\nMateriais | /#materiais",
          title: "Menu",
        },
        {
          links:
            "Termos de Uso | /termos-de-uso/\nPolítica de Privacidade | /politica-de-privacidade/",
          title: "Políticas e Termos",
        },
        { links: BRAND.email, title: "Contato" },
      ],
      copyright: BRAND.copyright,
      logo: LOGO,
      logoText: BRAND.name,
      socials: SOCIALS,
    }),
    block("whatsappFloat", { label: BRAND.whatsappLabel, url: "#" }),
  ],
  header: [
    block("header", {
      buttonLabel: "Materiais Grátis",
      buttonUrl: "/#materiais",
      logo: LOGO,
      logoText: BRAND.name,
    }),
  ],
  menu: [
    { href: "/categorias/", label: "Categorias" },
    { href: "/blogs/", label: "Blogs" },
  ],
  name: BRAND.name,
  pages: [
    home,
    blogs,
    categorias,
    links,
    pesquisa,
    notFound,
    legalPage("termos-de-uso", "Termos de Uso", termos(LEGAL_BRAND)),
    legalPage(
      "politica-de-privacidade",
      "Política de Privacidade",
      privacidade(LEGAL_BRAND)
    ),
  ],
  postLayout: [
    block(
      "postHeader",
      { backgroundImage: IMG.banner, showCover: "no" },
      undefined,
      { "1.1": { enter: "fadeInUp" } }
    ),
    block("twoColumns", {}, [
      block("postContent", { showMeta: "yes" }),
      block("sidebarBanner", { image: IMG.sidebar, url: "#" }),
    ]),
    block("postShare", { label: "Compartilhar este Post:" }),
    block("postNav", {}),
    block("postList", {
      cardStyle: "grid",
      limit: 6,
      title: "Mais Conteúdos Como Esse:",
    }),
  ],
  posts,
  theme: {
    accent: BRAND.accent,
    bg: "#121212",
    card: "#121212",
    fg: "#dafae4",
    fontBody: "'Content', sans-serif",
    fontHeading: "'Red Hat Text', sans-serif",
    line: "#313131",
    muted: "#aaaaaa",
    title: "#fcfcfc",
    variant: "central",
  },
};

export const centralMarketing: SiteTemplate = {
  description:
    "Portal de marketing digital escuro com verde neon: home de landing (hero, carrossel de logos, categorias, vídeos, materiais, depoimentos), blog com 16 artigos de exemplo em 12 categorias, busca e página de links. Troque nome, cores, textos e imagens no editor.",
  id: "central-marketing",
  name: `${BRAND.name} — Portal de Marketing`,
  preview: IMG.heroPanel,
  site,
  tags: ["Blog", "Marketing", "Landing"],
};
