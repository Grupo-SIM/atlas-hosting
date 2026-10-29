import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { type LegalItem, PRIVACIDADE, TERMOS } from "./legal.js";
import { categorySeeds, posts } from "./posts.js";

const UP = "https://007spyhacker.com/wp-content/uploads";
const MARKET = "https://marketplace.centraldomarketing.com";
const WHATSAPP = "https://lp.centraldomarketing.com/comunidades-no-whatsapp/";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  children?: Block[],
  fx?: Block["fx"]
): Block => ({ children, fx, id: `seed-${seq++}`, props, type });

const WIDE_PAGES = new Set(["blogs", "categorias", "pesquisa"]);

const page = (slug: string, title: string, blocks: Block[]): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  prose:
    slug === "termos-de-uso" || slug === "politica-de-privacidade" || undefined,
  slug,
  status: "published",
  title,
  wide: WIDE_PAGES.has(slug) || slug.startsWith("author/") || undefined,
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

const BLOGS = [
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
];

const IMG = (file: string) => `${UP}/2025/04/${file}`;

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
        copyright: "Copyright © 007SpyHacker",
        email: "0007spyhacker@gmail.com",
        extraLinks: [{ label: "Marketplace", url: `${MARKET}/` }],
        helpText: "AJUDE: Fundação Afif Arão",
        logo: IMG("007spyhackerjacques.png"),
        logoText: "",
        socials: [
          { label: "Instagram", url: "#" },
          { label: "YouTube", url: "#" },
          { label: "X", url: "#" },
          { label: "Facebook", url: "#" },
          { label: "Threads", url: "#" },
          { label: "Video", url: "#" },
          { label: "TikTok", url: "#" },
        ],
      },
      undefined,
      {
        // Ícones das redes pulsam no hover.
        "1.1.3.5": { each: true, hover: "pop" },
      }
    ),
    // Opcional: nasce desativado; o cliente liga pelo olho nas camadas.
    {
      ...block("whatsappFloat", {
        label: "Entre nas nossas comunidades",
        url: WHATSAPP,
      }),
      hidden: true,
    },
  ],
  header: [
    block("header", {
      buttonLabel: "Marketplace",
      buttonUrl: `${MARKET}/`,
      logo: IMG("007spyhackerjacques.png"),
      logoText: "",
    }),
  ],
  menu: [
    { dynamic: "categories", href: "/categorias/", label: "Categorias" },
    {
      children: BLOGS.map(b => ({ href: b.url, label: b.name })),
      href: "/blogs/",
      label: "Blogs",
    },
  ],
  name: "007SpyHacker",
  pages: [
    page("", "Início", [
      block(
        "hero",
        {
          backgroundImage: IMG(
            "artificial-intelligence-concept-2023-11-27-05-07-22-utc-2.jpg"
          ),
          buttonLabel: "Explorar Conteúdos →",
          buttonUrl: "#conteudos",
          text: "Conheça as soluções tecnológicas que já estão otimizando negócios, carreiras e projetos pelo mundo. Tudo explicado de forma simples e direta.",
        },
        undefined,
        {
          // Fundo com parallax; botão entra com zoom (atraso 100 ms) e encolhe no hover.
          "": { parallax: -2 },
          "1.1.2": { delay: 100, enter: "zoomIn", hover: "shrink" },
        }
      ),
      block("videoGrid", {
        title: "Últimas novidades:",
        videos: [
          { title: "Vídeo 1", youtubeId: "RH_kTZWz4KI" },
          { title: "Vídeo 2", youtubeId: "IG239X6LTf8" },
          { title: "Vídeo 3", youtubeId: "U0fmKZElwSM" },
        ],
      }),
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
          {
            src: IMG("AI-Icon-23-1.png"),
            text: "Como a IA está revolucionando negócios, os estudos e o dia a dia de quem quer mais produtividade.",
          },
          {
            src: IMG("AI-Icon-14-1024x1024.png"),
            text: "Entenda o poder dos dados e como interpretá-los para tomar decisões mais inteligentes.",
          },
          {
            src: IMG("AI-Icon-19-1024x1024.png"),
            text: "Automatizar tarefas, ganhar tempo e escalar resultados com as ferramentas certas.",
          },
          {
            src: IMG("AI-Icon-8-1024x1024.png"),
            text: "Fique por dentro dos lançamentos, atualizações e tudo que está movimentando o mercado tech.",
          },
          {
            src: IMG("AI-Icon-1-1024x1024.png"),
            text: "Tutoriais, testes e reviews de plataformas que facilitam a vida de quem atua no digital.",
          },
          {
            src: IMG("AI-Icon-18-1024x1024.png"),
            text: "Conteúdos didáticos para quem quer aprender na prática e colocar a mão na massa com tecnologia.",
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
        text: "A tecnologia não é o futuro, é o agora!",
        watermark: "Mentes Conectadas",
      }),
      block(
        "stats",
        {
          backgroundImage: IMG("3d-rendering-planet-earth-1-1.png"),
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
        },
        undefined,
        {
          // Os três números sobem de 0 ao valor, com a faixa subindo suave.
          "1.2": { count: true, delay: 100, enter: "fadeInUp" },
        }
      ),
      block("cardGrid", {
        buttonLabel: "Todos os Produtos →",
        buttonUrl: `${MARKET}/produtos/`,
        cards: [
          {
            image: IMG("CONTROLE-PATRIMONIAL-1600x900-1.jpg"),
            tag: "Gestão",
            title: "Gestão Eficiente de Ativos e Estoques.",
            url: `${MARKET}/controle-patrimonial/`,
          },
          {
            image: `${UP}/2026/08/O-outro-lado-da-internet-2.png`,
            tag: "Privacidade Digital",
            title:
              "Há uma internet secreta muito mais sombria do que você imagina.",
            url: `${MARKET}/o-outro-lado-da-internet/`,
          },
          {
            image: IMG("ATLAS-HOST-900x1600-1.jpg"),
            tag: "Desempenho",
            title: "Servidores de Alto Desempenho com Suporte 24/7.",
            url: "https://atlashosting.com.br",
          },
          {
            image: IMG("SM-2000-x-1330-px-1000-x-1600-px-1.png"),
            tag: "Gateway",
            title: "Automatize seus Pagamentos e Escale com Segurança.",
            url: `${MARKET}/produtos/`,
          },
        ],
        title: "Ferramentas & Soluções",
      }),
      block(
        "featuredPost",
        {
          backgroundImage: IMG("Path-1.png"),
          backgroundImage2: IMG("Path-2.png"),
          backgroundImage3: IMG("Path-3.png"),
          label: "Melhor Post",
          postSlug: "as-21-opcoes-de-ia-que-voce-precisa-usar-em-2025",
          sideImage: IMG("AI-Icon-15.png"),
        },
        undefined,
        {
          // Ondas em parallax, ícone lateral desliza e o cartão entra pela esquerda.
          "1.1": { parallax: 3 },
          "1.3": { parallax: -3 },
          "1.4.1": { parallax: -4 },
          "1.4.2": { enter: "fadeInLeft" },
        }
      ),
      block("testimonials", {
        items: [
          {
            avatar: IMG("1.png"),
            name: "Bruno Davis",
            quote:
              "Os tutoriais do 007 SpyHacker me ajudaram a implementar automações no meu negócio. Nunca pensei que fosse tão simples!",
            role: "Empreendedor Digital",
          },
          {
            avatar: IMG("2.png"),
            name: "Mariana Morgan",
            quote:
              "Comecei a acompanhar o blog em busca de novidades e hoje sou leitora fiel. Conteúdo direto ao ponto.",
            role: "Estudante de Análise de Dados",
          },
          {
            avatar: IMG("1-2.png"),
            name: "Felipe Simmons",
            quote:
              "O post sobre ferramentas de SEO me salvou! Já uso duas no meu dia a dia e minha rotina ficou muito mais leve.",
            role: "Head Inbound Marketing",
          },
          {
            avatar: IMG("2-2.png"),
            name: "André Evans",
            quote:
              "Adoro como vocês traduzem assuntos técnicos de forma simples. Já indiquei o blog pra vários amigos da área!",
            role: "Analista de Marketing",
          },
          {
            avatar: IMG("3-1.png"),
            name: "Lisa Takashi",
            quote:
              "Descobri o 007 SpyHacker pesquisando sobre ferramentas de IA, e me surpreendi com a qualidade dos artigos. Já virou minha fonte principal pra tudo que é novidade tech.",
            role: "Desenvolvedora Front-end",
          },
          {
            avatar: IMG("4-1.png"),
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
      block(
        "splitSection",
        {
          buttonLabel: "Ver Mais →",
          buttonUrl: "/blogs/",
          decoration: IMG("AI-Icon-5.png"),
          image: IMG("Mestre-Inesquecivel.png"),
          text: "Estamos construindo uma comunidade que busca conhecimento real sobre tecnologia, inovação e o futuro digital. Um conteúdo por vez, estamos moldando novas jornadas.",
          title:
            "Milhares de Mentes Conectadas Pelo Mesmo Propósito: Aprender e Evoluir com Tecnologia",
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
        backgroundImage: IMG("Path-1.png"),
        backgroundImage2: IMG("Path-2.png"),
        backgroundImage3: IMG("Path-3.png"),
        label: "Post em destaque",
        postSlug: "como-registrar-dominio-de-forma-simples-e-facil",
        sideImage: IMG("AI-Icon-15.png"),
      }),
    ]),
    page("blogs", "Blogs", [
      block("heading", {
        align: "left",
        level: "h1",
        subtitle: "Conteúdos recomendados:",
        text: "Blogs",
        watermark: "Blogs",
      }),
      block("linkCards", {
        items: [...BLOGS.slice(0, 3), BLOGS[4], BLOGS[3]],
        title: "",
      }),
      block("featuredPost", {
        backgroundImage: IMG("Path-1.png"),
        backgroundImage2: IMG("Path-2.png"),
        backgroundImage3: IMG("Path-3.png"),
        label: "Como Registrar Domínio: Dicas Simples",
        postSlug: "como-registrar-dominio-de-forma-simples-e-facil",
        sideImage: IMG("AI-Icon-15.png"),
      }),
    ]),
    {
      ...page("links", "Links", [
        {
          ...block("image", {
            alt: "007SpyHacker",
            src: `${UP}/2025/04/Logo-007spyhacker-300x169.png`,
          }),
          style: { margin: "24px auto 0", maxWidth: 200 },
        },
        block("heading", {
          align: "center",
          level: "h1",
          subtitle: "Explore o lado Invisível da Tecnologia",
          text: "007SpyHacker",
        }),
        block("socialIcons", {
          items: [
            { label: "Facebook", url: "#" },
            { label: "YouTube", url: "#" },
            { label: "X", url: "#" },
          ],
        }),
        block("button", {
          buttonLabel: "Conteúdo Gratuito",
          buttonUrl: "/",
          variant: "wide",
        }),
        block("button", {
          buttonLabel: "Comunidades",
          buttonUrl: WHATSAPP,
          variant: "wide",
        }),
        block("button", {
          buttonLabel: "Marketplace",
          buttonUrl: `${MARKET}/`,
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
    page("author/jacques", "007SpyHacker", [
      block("categorySearch", {}),
      block("categoryHeader", {
        backLabel: "Voltar",
        backUrl: "/",
        title: "007SpyHacker",
      }),
      block("postList", {
        limit: 10,
        nextUrl: "/author/jacques/page/2/",
        title: "",
      }),
    ]),
    page("author/jacques/page/2", "007SpyHacker (página 2)", [
      block("categorySearch", {}),
      block("categoryHeader", {
        backLabel: "Voltar",
        backUrl: "/",
        title: "007SpyHacker",
      }),
      block("postList", {
        limit: 10,
        offset: 10,
        prevUrl: "/author/jacques/",
        title: "",
      }),
    ]),
    page("404", "Página não encontrada", [
      block("heading", {
        align: "center",
        level: "h1",
        subtitle:
          "Parece que a página que você está procurando não existe ou pode ter sido movida. Nossa equipe é dedicada a fornecer soluções inovadoras e queremos ter certeza de que você encontre o que está procurando.",
        text: "Oops! Página Não Encontrada",
      }),
    ]),
    legal("Termos de Uso"),
    legal("Política de Privacidade"),
  ],
  // Cabeçalho em largura total, depois conteúdo + lateral, depois relacionados.
  postLayout: [
    block("postHeader", { showCover: "no", watermark: "Post" }),
    block("twoColumns", {}, [
      block("postContent", { showMeta: "yes" }),
      block("sidebarBanner", {
        image: IMG(
          "lucre-todo-dia-com-o-insta-fun-fortune-sem-expor-seu-rosto-ganhe-hoje-muita-grana.webp"
        ),
        url: `${MARKET}/insta-fan-fortune/`,
      }),
    ]),
    block("postList", { limit: 6, title: "Mais conteúdos como esse:" }),
  ],
  posts,
  theme: {
    accent: "#5ce1f5",
    bg: "#030712",
    card: "#0b1437",
    fg: "#ffffff",
    fontAccent: "'Poppins', sans-serif",
    fontBody: "'Mulish', sans-serif",
    fontHeading: "'Bai Jamjuree', sans-serif",
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
  tags: ["Blog", "Tecnologia"],
};
