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

/** Os 9 vídeos recomendados do site original (IDs públicos do YouTube). */
const VIDEOS = [
  "2z39bEyVSoI",
  "PoJp--Et920",
  "m4K0quoikDs",
  "HZ80xlo9HxQ",
  "f4SyJXW-UI0",
  "nY26-6JnH1c",
  "7awz3nqzMtM",
  "aRn1sz_6PXQ",
  "SbR-9RpPGhY",
].map(youtubeId => ({ title: "", youtubeId }));

/** Ordem dos cartões na página /categorias/ (a mesma do original). */
const CATEGORY_ORDER = [
  "copy",
  "gestao-de-trafego",
  "monetizacao-vendas",
  "funil-de-vendas",
  "design",
  "edicao-de-videos",
  "email-marketing",
  "redes-sociais",
  "sites",
  "seo",
  "afiliados",
  "inbound-marketing",
  "crm",
  "produtividade",
  "branding",
  "neuromarketing",
];

const HOME_CATEGORIES = [
  {
    icon: "keyboard",
    slug: "copy",
    text: "Como usar palavras que vendem e criam conexões reais com o público-alvo.",
    title: "Copywriting",
  },
  {
    icon: "coins",
    slug: "monetizacao-vendas",
    text: "Entenda como transformar audiência em lucro com táticas simples, escaláveis e reais.",
    title: "Monetização & Vendas",
  },
  {
    icon: "layout",
    slug: "gestao-de-trafego",
    text: "Aprenda do zero ao avançado como ganhar dinheiro com anúncios online.",
    title: "Gestão de Tráfego",
  },
  {
    icon: "news",
    slug: "seo",
    text: "Entenda como a otimização para motores de busca pode mudar o nível do seu negócio.",
    title: "SEO",
  },
  {
    icon: "devices",
    slug: "edicao-de-videos",
    text: "Dicas práticas, rápidas e aplicáveis no dia a dia, do zero ao avançado.",
    title: "Edição de Vídeos",
  },
  {
    icon: "phone",
    slug: "redes-sociais",
    text: "Entenda todos os segredos das plataformas mais usadas no mundo.",
    title: "Redes Sociais",
  },
  {
    icon: "funnel",
    slug: "funil-de-vendas",
    text: "Como construir jornadas de conversão poderosas, desde o primeiro clique até a etapa final.",
    title: "Funil de Vendas",
  },
  {
    icon: "mail",
    slug: "email-marketing",
    text: "Estratégias para criar campanhas que realmente geram abertura, cliques e vendas.",
    title: "E-mail Marketing",
  },
  {
    icon: "feather",
    slug: "design",
    text: "Dicas criativas e aplicáveis no dia a dia para transformar suas ideias em peças visuais incríveis.",
    title: "Design",
  },
];

const PRODUCTS = [
  {
    kicker: "Guia Prático",
    tag: "Neuromarketing",
    text: "Aprenda como expressar suas ideias de maneira clara e convincente, conquistando a atenção e o respeito das pessoas ao seu redor.",
    title: "Habilidades de Comunicação",
  },
  {
    kicker: "Entenda os Princípios",
    tag: "Neuromarketing",
    text: "Você sabia que a persuasão segue princípios lógicos e científicos? Entenda como usar os gatilhos mentais a seu favor.",
    title: "Gatilhos Mentais",
  },
  {
    kicker: "Instagram Lucrativo",
    tag: "Monetização",
    text: "Desbloqueie um universo de oportunidades com o Instagram. Transformando seu Instagram em uma máquina de vendas recorrente.",
    title: "Insta Fan Fortune",
  },
  {
    kicker: "Lucre Todos os Dias",
    tag: "Monetização",
    text: "A forma mais rápida de ganhar dinheiro hoje. Sem enrolação, conteúdo objetivo para você aplicar no mesmo dia.",
    title: "Academia do Corte",
  },
  {
    kicker: "Tornando-se Invisível",
    tag: "Sites",
    text: "Descubra os perigos ocultos da internet, a ilusão da navegação “segura” e os mistérios da DarkWeb. Tudo isso no verdadeiro anonimato.",
    title: "O Outro Lado da Internet",
  },
  {
    kicker: "Criando Vídeos Persuasivos",
    tag: "Copy",
    text: "Tenha acesso ao guia definitivo para vídeos de vendas que convertem uma audiência engajada em clientes.",
    title: "VSL Milionário",
  },
];

const home = page("", "Início", [
  block(
    "ctHero",
    {
      avatars: AVATARS.map((src, i) => ({ alt: `Pessoa ${i + 1}`, src })),
      buttonLabel: "Ver Todos Os Posts",
      buttonUrl: "/categorias/",
      chips: [
        { label: "Monetização & Vendas", url: "/category/monetizacao-vendas/" },
        { label: "Funil de Vendas", url: "/category/funil-de-vendas/" },
        { label: "Copy", url: "/category/copy/" },
        { label: "Tráfego Pago", url: "/category/gestao-de-trafego/" },
        { label: "Designer", url: "/category/design/" },
        { label: "Edição de Vídeos", url: "/category/edicao-de-videos/" },
        { label: "SEO", url: "/category/seo/" },
      ],
      highlight: "Marketing Digital",
      panelImage: IMG.heroPanel,
      proofLabel: "Pessoas impactadas",
      proofValue: "+10M",
      socials: SOCIALS.slice(0, 2),
      taglines: [
        { text: "Resultados Comprovados ->" },
        { text: "Conteúdos Validados ->" },
        { text: "Conhecimento Gratuito" },
      ],
      text: "Você acaba de acessar a melhor plataforma de conhecimento digital gratuito do Brasil! Se o seu objetivo é crescer no digital e aprender estratégias sem enrolação, você está no lugar certo.",
      title: "Aprenda O Que Realmente Funciona No",
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
      badgeKicker: "Crescimento",
      badgeValue: "rápido",
      buttonLabel: "Saber Mais",
      buttonUrl: "#sabermais",
      eyebrow: "Mais Pesquisados",
      image: IMG.mostSearched,
      imageAlt: "Equipe trabalhando com marketing digital",
      text: "O Marketing Digital não apenas ampliou as oportunidades para marcas consolidadas, mas também possibilitou que pequenos empreendedores e novos negócios disputassem espaço de forma competitiva.\n\nCom as estratégias certas, é possível aumentar a visibilidade, atrair clientes qualificados e multiplicar os lucros, independentemente do nicho de atuação.",
      title:
        "Como o Marketing Digital Pode Transformar Seu Negócio e Multiplicar Seus Lucros",
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
        { title: "Sem promessas vazias, só resultados" },
        { title: "Segredos revelados de vários nichos" },
        { title: "Somente conteúdo aplicável no dia a dia" },
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
        text: "Qual nicho você quer saber mais?",
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
    text: "Videos recomendados",
  }),
  block("videoGrid", { title: "", videos: VIDEOS }, undefined, {
    "1.1": { enter: "fadeIn" },
  }),
  block("button", {
    buttonLabel: "Ver Mais Videos",
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
      text: "O melhor do Marketing Digital em um único lugar",
    },
    undefined,
    { "1.2": { enter: "fadeInUp" } }
  ),
  block(
    "featureGrid",
    {
      columns: 3,
      items: [
        { icon: "book", title: "Materiais Exclusivos" },
        { icon: "report", title: "Conteúdo Multiformato" },
        { icon: "check", title: "Estudos de Casos Reais" },
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
      badgeLabel: "Fonte Confiável de Informações",
      badgeStars: 5,
      badgeValue: "4.9",
      buttonLabel: "Aprender Agora Gratuitamente",
      buttonUrl: "#",
      eyebrow: "Em Destaque",
      image: IMG.spotlight,
      imageAlt: "Prédios comerciais vistos de baixo",
      items: [
        { icon: "triangle", text: "O que é Branding?" },
        { icon: "shield", text: "Qual a diferença entre branding e marca?" },
        { icon: "check", text: "Quais os principais benefícios do branding?" },
        {
          icon: "coins",
          text: "Como criar um branding de forma estratégica no Marketing Digital?",
        },
      ],
      quote: "“Ele transforma negócios comuns em marcas memoráveis.”",
      title:
        "Branding: O que é, como criar e como fazer a gestão da sua marca em 2025",
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
      buttonLabel: "Acessar Gratuitamente",
      buttonUrl: "#",
      image: IMG.ctaBanner,
      mode: "cta",
      text: "IA, robôs, sistemas, ferramentas e muito mais… Até onde a Tecnologia pode chegar e como isso pode impactar você? Clique abaixo e descubra!",
      title: "O que acha de Explorar o lado Invisível da Tecnologia?",
    },
    undefined,
    { "": { enter: "zoomIn" } }
  ),
  block(
    "heading",
    {
      align: "center",
      eyebrow: "Produtos",
      level: "h2",
      subtitle: "",
      text: "Conteúdos exclusivos",
    },
    undefined,
    { "1.2": { enter: "fadeInUp" } }
  ),
  block(
    "featureGrid",
    {
      columns: 3,
      items: PRODUCTS.map((it, i) => ({
        ...it,
        icon: "",
        image: pool(i + 3, 900),
        linkLabel: "Ver Agora",
        url: "#",
      })),
      style: "product",
    },
    undefined,
    { "1.1": stagger(100, "fadeIn") }
  ),
  block("button", {
    buttonLabel: "Ver Mais Produtos",
    buttonUrl: "#",
    variant: "primary",
  }),
  block(
    "ctSplit",
    {
      badgeImage: IMG.texture,
      badgeLabel: "Aprovação dos Visitantes",
      badgeNote: "Sua satisfação prova que estamos no caminho certo.",
      badgeValue: "98%",
      buttonLabel: "Ver Mais",
      buttonUrl: "#",
      eyebrow: "Curiosidades",
      image: IMG.curiosities,
      imageAlt: "Pessoas em reunião de trabalho",
      quotes: [
        {
          avatar: AVATARS[0] ?? "",
          name: "Cliente 1",
          role: "Gestor de Tráfego",
          text: "Sempre ouvi falar de tráfego pago, mas achava que era coisa complicada e cara. Depois que comecei a acompanhar os conteúdos desse site, finalmente consegui entender como funciona e aprendi a investir do jeito certo.",
        },
        {
          avatar: AVATARS[1] ?? "",
          name: "Cliente 2",
          role: "Criador(a) de Conteúdo",
          text: "Eu achava que ganhar dinheiro online era coisa de guru, mas depois de aprender aqui sobre marketing digital, percebi que qualquer pessoa pode fazer dinheiro na internet desde que tenha o conhecimento certo.",
        },
        {
          avatar: AVATARS[2] ?? "",
          name: "Cliente 3",
          role: "Copywriter",
          text: "Nunca entendia porque eu não conseguia fazer vendas através da minha landing page, até que navegando por aqui eu encontrei o melhor conteúdo sobre copy que já vi. Depois que comecei a aplicar as estratégias e dicas na minha página, minhas vendas começaram a aparecer.",
        },
      ],
      text: "Empresas, empreendedores e até figuras públicas recorrem a esses especialistas para dar voz aos seus projetos, sejam eles livros, artigos, discursos ou outros materiais…",
      title: "Ghost Writer, o Escritor Fantasma: O que é e como trabalha?",
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
      name: `Site parceiro ${n}`,
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
      buttonLabel: "Conteúdo Gratuito",
      buttonUrl: "/",
      variant: "wide",
    }),
    block("button", {
      buttonLabel: "Comunidades",
      buttonUrl: "#",
      variant: "wide",
    }),
    block("button", {
      buttonLabel: "Marketplace",
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
    text: "Parece que a página que você está procurando não existe ou pode ter sido movida. Nossa equipe é dedicada a fornecer soluções inovadoras e queremos ter certeza de que você encontre o que está procurando.",
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
          links: "Categorias | /categorias/\nBlogs | /blogs/\nMarketplace | #",
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
      buttonLabel: "Marketplace",
      buttonUrl: "#",
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
    "Portal de marketing digital escuro com verde neon: home de landing (hero, carrossel de logos, categorias, vídeos, produtos, depoimentos), blog com 44 posts de exemplo, categorias, busca e página de links. Troque nome, cores, textos e imagens no editor.",
  id: "central-marketing",
  name: `${BRAND.name} — Portal de Marketing`,
  preview: IMG.heroPanel,
  site,
  tags: ["Blog", "Marketing", "Landing"],
};
