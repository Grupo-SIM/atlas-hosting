import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";
import { FAQ, LEGAL_PRIVACY, LEGAL_TERMS } from "./data.js";

/**
 * Template "PagaTG — Vendas no Telegram": migração de pagatg.com (WordPress + Astra + Elementor), com a variante
 * `pagatg`. Textos, links e imagens vêm do original (as imagens seguem hospedadas lá, como no `sim-intermediacoes`);
 * o que foi corrigido ou traduzido está em `docs/development/site-builder.md`.
 */
const UPLOADS = "https://pagatg.com/wp-content/uploads/2025/04";
const APP = "https://app.pagatg.com/";
const LOGO = `${UPLOADS}/noBgColor-scaled.png`;
const GRID = `${UPLOADS}/Grid-10.png`;

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "anchor" | "fx">
): Block => ({ id: `pg-${seq++}`, props, type, ...extra });

/** Entradas do Elementor: normal 1,25 s, `animated-fast` 0,75 s, `animated-slow` 2 s. */
const NORMAL = 1250;
const FAST = 750;
const SLOW = 2000;
const enter = (
  effect: NonNullable<Fx["enter"]>,
  ms = NORMAL,
  delay = 0,
  extra: Partial<Fx> = {}
): Fx => ({ delay, enter: effect, enterMs: ms, ...extra });
const up = (ms = NORMAL, delay = 0, extra: Partial<Fx> = {}) =>
  enter("fadeInUp", ms, delay, extra);
const eyebrowFx = enter("fadeInDown");

/* ───────────────────────── cabeçalho e rodapé ───────────────────────── */

const header = () =>
  block("pgHeader", {
    buttonLabel: "Login",
    buttonUrl: APP,
    items: [
      { label: "Benefícios", url: "/#beneficios" },
      { label: "Como Funciona", url: "/#comofunciona" },
      { label: "Soluções", url: "/#solucoes" },
      { label: "FAQ", url: "/#faq" },
    ],
    logo: LOGO,
    logoUrl: "/",
    logoWidth: 180,
  });

const footer = [
  block("pgFooter", {
    links:
      "Termos de Uso | /termos-de-uso/\nPolítica de Privacidade | /politica-de-privacidade/",
    text: "2026 PagaTG. Todos os direitos reservados.",
  }),
  // Botão "Rolar para cima" do Astra: ~32 px, azul padrão do tema (#046bd2), a 30 px do canto, raio 2 px.
  block("scrollTop", {
    bottom: 30,
    color: "#046bd2",
    hoverColor: "#34D6E2",
    iconColor: "#ffffff",
    label: "Rolar para cima",
    radius: 2,
    side: "right",
    sideGap: 30,
    size: 32,
    threshold: 300,
  }),
];

/* ───────────────────────── home ───────────────────────── */

const hero = block(
  "pgHero",
  {
    buttonLabel: "Abrir conta",
    buttonUrl: APP,
    highlight: "Vendas do Telegram",
    image: `${UPLOADS}/Business-Startup-e1715497837813.jpg`,
    imageAlt: "Plataforma de vendas no Telegram",
    poster: "",
    secondLabel: "Saber mais",
    secondUrl: "#sabermais",
    shape: "zigzag",
    shapeColor: "#0A0711",
    shapeHeight: 300,
    shapeHeightMobile: 160,
    shapeHeightTablet: 300,
    shapeWidthMobile: 224,
    shapeWidthTablet: 140,
    text: "Automatize as vendas, gestão dos seus grupos, comunidades pagas e assinaturas de forma fácil e rápida.",
    title: "A melhor plataforma de",
    veilOpacity: 64,
    video: "https://youtu.be/6Ru53yI80L4",
  },
  {
    fx: {
      "1.3.1.3": up(FAST, 0, { each: true }),
      "1.3.2": up(FAST),
    },
  }
);

const highlights = block("pgHighlights", {
  items: [
    { icon: `${UPLOADS}/Frame-12.png`, title: "Cashback em Todas as Compras" },
    { icon: `${UPLOADS}/Frame-11.png`, title: "Maior taxa de aprovação" },
    {
      icon: `${UPLOADS}/grupos-automatizados.png`,
      title: "Grupos automatizados",
    },
    { icon: `${UPLOADS}/19Mobile.png`, title: "Disparo de mensagens" },
  ],
});

const split = block(
  "pgSplit",
  {
    buttonLabel: "Abrir conta",
    buttonUrl: APP,
    items: [
      {
        text: "Na PagaTG o processo de configuração é muito simples",
        title: "Super fácil",
      },
      {
        text: "Em segundos você baixa relatórios e define planos.",
        title: "Hiper rápido",
      },
    ],
    photo: `${UPLOADS}/lovely-beautiful-blonde-woman-in-leather-jacket-sparkly-dress-trendy-sunglasses-show-heart-with.jpg`,
    photoVeil: 24,
    title: "O sistema que te ajuda a automatizar grupos VIP no Telegram.",
  },
  {
    anchor: "sabermais",
    fx: {
      "1.1.2.1": enter("fadeIn", SLOW),
      "1.1.2.2": up(NORMAL, 0, { each: true, stagger: 200 }),
      "1.1.2.3": enter("zoomIn", SLOW),
    },
  }
);

const benefitCards = [
  {
    icon: "Frame-14.png",
    image: "Frame-27-1.png",
    text: "Em todas as vendas efetuadas, os seus clientes recebem imediatamente o dinheiro de volta pelo Vale Bônus.",
    title: "Cashback",
  },
  {
    icon: "13program.png",
    image: "data-backup-on-laptop-in-progress.png",
    text: "Acompanhe e baixe relatórios detalhados sobre vendas, reembolsos, assinaturas e muito mais.",
    title: "Relatórios",
  },
  {
    icon: "Frame-25.png",
    image: "Frame-28-1.png",
    text: "Agende mensagens e lembre automaticamente seus membros sobre a renovação da assinatura antes do acesso expirar.",
    title: "Disparos",
  },
  {
    icon: "Frame-26.png",
    image: "Frame-29.png",
    text: "Vendeu hoje, recebeu amanhã. Gire seu dinheiro com mais agilidade, segurança e mantenha o fluxo sempre em dia.",
    title: "Saque D+1",
  },
];

const benefits = block(
  "pgBenefits",
  {
    eyebrow: "Benefícios",
    items: benefitCards.map(c => ({
      buttonLabel: "Abrir Conta",
      buttonUrl: APP,
      icon: `${UPLOADS}/${c.icon}`,
      image: `${UPLOADS}/${c.image}`,
      text: c.text,
      title: c.title,
    })),
    overlayFixed: "no",
    overlayImage: GRID,
    overlayOpacity: 16,
    overlayRepeat: "no",
    shape: "zigzag",
    shapeColor: "#0A0711",
    shapeHeight: 280,
    shapeHeightMobile: 280,
    shapeHeightTablet: 280,
    shapeWidthMobile: 100,
    shapeWidthTablet: 160,
    text: "Funcionalidades que facilitam sua vida, aumentam seu lucro e te colocam na frente da concorrência.",
    title: "Por que escolher a PagaTG?",
  },
  {
    anchor: "beneficios",
    fx: {
      "1.1.1.1": eyebrowFx,
      ...Object.fromEntries(
        benefitCards.flatMap((_, i) => [
          [`1.1.2.${i + 1}.4`, enter("zoomIn", i === 1 ? FAST : NORMAL)],
          [`1.1.2.${i + 1}.5`, up()],
        ])
      ),
    },
  }
);

const SEALS = [
  ["VELOCIDADE.png", "Velocidade"],
  ["PRATICIDADE.png", "Praticidade"],
  ["SEGURANCA.png", "Segurança"],
  ["INIOVACAO.png", "Inovação"],
  ["TECNOLOGIA.png", "Tecnologia"],
  ["GESTAO.png", "Gestão"],
] as const;

const values = block(
  "pgValues",
  {
    items: SEALS.map(([file, alt]) => ({ alt, image: `${UPLOADS}/${file}` })),
    overlayFixed: "yes",
    overlayImage: `${UPLOADS}/DC-BG-2.jpg`,
    overlayOpacity: 20,
    overlayRepeat: "no",
  },
  {
    fx: Object.fromEntries(
      SEALS.map((_, i) => [
        `1.1.${i + 1}`,
        enter("zoomIn", NORMAL, 100 + i * 200),
      ])
    ),
  }
);

const how = block(
  "pgHowItWorks",
  {
    buttonLabel: "Abrir Conta",
    buttonUrl: APP,
    counterLabel: "Anos de experiência",
    counterMs: 1600,
    counterSuffix: "+",
    counterValue: 10,
    eyebrow: "Como Funciona?",
    image: `${UPLOADS}/Frame-16.png`,
    imageAlt: "Bot da PagaTG no Telegram",
    list: "Configure seu bot: é rápido e fácil\nGerencie assinaturas em grupos de forma automática.\nVenda diretamente pelo seu chatbot.",
    text: "Uma ferramenta para gestão de conteúdos, pagamentos e assinaturas totalmente integrado ao Telegram para acabar com o trabalho manual e garantir eficiência e escala.",
    title: "Automatize tudo com um bot inteligente dentro do Telegram",
  },
  {
    anchor: "comofunciona",
    fx: {
      "1.1.1.1.1": eyebrowFx,
      "1.1.1.3": enter("zoomIn"),
      "1.1.2": enter("zoomIn"),
    },
  }
);

const solutionCards = [
  {
    image: "Frame-18-1024x682.png",
    tag: "Engajamento & Escala",
    text: "Transforme grupos comuns em comunidades lucrativas, com controle de acesso, recorrência automática e gestão inteligente.",
    title: "Comunidades",
  },
  {
    image: "Frame-19-1024x682.png",
    tag: "Conteúdo & Exclusividade",
    text: "Venda pacotes de conteúdo com entrega automatizada. Ideal para arquivos, materiais exclusivos, aulas e muito mais.",
    title: "Packs",
  },
  {
    image: "Frame-20-1024x682.png",
    tag: "Educação & Automação",
    text: "Centralize suas vendas de cursos, mentorias e treinamentos com entrega direta e instantânea via Telegram.",
    title: "Infoprodutos",
  },
  {
    image: "digital-business-and-technology-1024x576.jpg",
    tag: "Assinatura & Controle",
    text: "Gerencie grupos pagos com entradas automáticas, cobranças recorrentes e segurança para os seus assinantes.",
    title: "Grupos VIP",
  },
];

const solutions = block(
  "pgSolutions",
  {
    eyebrow: "Soluções que vendem por você",
    items: solutionCards.map(c => ({
      buttonLabel: "Abrir conta",
      buttonUrl: APP,
      image: `${UPLOADS}/${c.image}`,
      tag: c.tag,
      text: c.text,
      title: c.title,
    })),
    overlayFixed: "yes",
    overlayImage: `${UPLOADS}/DC-BG.jpg`,
    overlayOpacity: 20,
    overlayRepeat: "no",
    text: "Automatize lançamentos, entregue conteúdos pagos, gerencie acessos e transforme o Telegram em uma máquina de vendas com as nossas integrações.",
    title: "O que eu posso fazer?",
  },
  {
    anchor: "solucoes",
    fx: {
      "1.1.1.1": eyebrowFx,
      "1.1.2": up(NORMAL, 100, { each: true, stagger: 200 }),
    },
  }
);

const pricing = block(
  "pgPricing",
  {
    eyebrow: "Planos",
    image: `${UPLOADS}/futuristic-business-scene-with-ultra-modern-ambiance_23-2151003801.avif`,
    items: [
      {
        buttonLabel: "Abrir conta",
        buttonUrl: APP,
        image: `${UPLOADS}/business-concept-with-graphic-holography_23-2149160926-825x1024.jpg`,
        text: "Até 5 dígitos mensais.",
        title: "9.9% + R$1,00 por transação aprovada",
      },
      {
        buttonLabel: "Abrir conta",
        buttonUrl: APP,
        image: `${UPLOADS}/business-concept-with-graphic-holography_23-2149160931-737x1024.jpg`,
        text: "6 dígitos mensais.",
        title: "8.9% + R$1,00 por transação aprovada",
      },
      {
        buttonLabel: "Abrir conta",
        buttonUrl: APP,
        image: `${UPLOADS}/mobile-business-analytics_23-2151953953-1024x700.jpg`,
        text: "Negociação personalizada.",
        title: "Acima de 7 dígitos mensais",
      },
    ],
    overlayOpacity: 0,
    shape: "curve-negative",
    shapeColor: "#0A0711",
    shapeHeight: 480,
    shapeHeightMobile: 124,
    shapeHeightTablet: 200,
    shapeWidthMobile: 200,
    shapeWidthTablet: 200,
    text: "Você só paga pelo que vender: sem taxas ocultas ou cobranças surpresa - 100% transparente.",
    title: "Quais nossas taxas?",
    veilOpacity: 60,
  },
  {
    fx: {
      "1.1.1.1.1": eyebrowFx,
      "1.1.2": up(NORMAL, 0, { each: true, stagger: 200 }),
    },
  }
);

const testimonials = block(
  "pgTestimonials",
  {
    delay: 4000,
    eyebrow: "satisfação",
    items: [
      {
        avatar: `${UPLOADS}/Frame-22.png`,
        name: "Camila Rubes",
        network: "x",
        role: "Infoprodutora",
        text: "Automatizei meus grupos e ganhei tempo! Hoje, meus alunos entram, pagam e recebem acesso sem que eu precise mover um dedo. Recomendo muito!",
      },
      {
        avatar: `${UPLOADS}/Frame-24.png`,
        name: "Eduardo Macedo",
        network: "x",
        role: "Gestor de Comunidade",
        text: "Gerencio mais de 4 mil membros com total controle. A cobrança automática funciona 100% e nunca mais tive dor de cabeça com os acessos de quem parou de pagar.",
      },
      {
        avatar: `${UPLOADS}/Frame-23.png`,
        name: "Rafael Sillas",
        network: "instagram",
        role: "Criador",
        text: "Meus clientes gostaram muito do cashback, tive um aumento significativo nas vendas, além de serem bem solícitos para resolverem problemas (pelo menos comigo kkk)",
      },
      {
        avatar: `${UPLOADS}/Frame-21.png`,
        name: "Luana Vasques",
        network: "linkedin",
        role: "Criadora de Conteúdo",
        text: "É tudo simples, rápido e funcional, os tutoriais ajudam bastante e o suporte eficiente, me atendeu no que precisava.",
      },
    ],
    photo: `${UPLOADS}/close-up-portrait-of-business-woman-smiling-at-camera-e1715795709821.jpg`,
    speed: 500,
    text: "Empreendedores, produtores e gestores que automatizaram seus grupos com a PagaTG e nunca mais voltaram atrás. Confira o que dizem:",
    title: "Quem usa, Recomenda",
  },
  { fx: { "1.1.1.1.1": eyebrowFx } }
);

const security = block(
  "pgSecurity",
  {
    buttonLabel: "Abrir conta",
    buttonUrl: APP,
    image: `${UPLOADS}/Seo-Idea-Marketing.jpg`,
    imageAlt: "Praticidade e segurança",
    items: [
      {
        icon: "feather",
        text: "Seus dados — e os dos seus clientes — são armazenados de forma segura e confidencial, com total conformidade com LGPD.",
      },
      {
        icon: "pie-chart",
        text: "Processos automáticos que reduzem erros manuais, evitam fraudes e mantêm tudo sob controle.",
      },
    ],
    overlayFixed: "no",
    overlayImage: GRID,
    overlayOpacity: 12,
    overlayRepeat: "yes",
    text: "Sabemos que, para muitos, a ideia de automatizar pagamentos e gerir dados pelo Telegram ainda parece distante ou até arriscada. Mas a verdade é que a tecnologia certa torna tudo mais simples e muito mais seguro. A PagaTG foi construída com base em protocolos avançados de segurança, criptografia de ponta a ponta e um sistema robusto de gerenciamento. Você cuida do conteúdo, e nós garantimos a estabilidade, proteção e praticidade que o seu negócio merece, sem riscos.",
    title: "Praticidade & Segurança",
  },
  { fx: { "1.1.2.3": up(NORMAL, 0, { each: true }), "1.1.2.4": up(SLOW) } }
);

const STEPS = [
  {
    icon: "1Website.png",
    n: "1",
    text: "Clientes ativos que já confiam.",
    title: "+1000 Comunidades",
  },
  {
    icon: "24Website.png",
    n: "2",
    text: "Tudo em poucos cliques.",
    title: "Gestão automatizada",
  },
  {
    icon: "Frame-12.png",
    n: "3",
    text: "Recursos devolvidos em cada venda.",
    title: "+3.7M Cashbacks",
  },
  {
    icon: "Frame-11.png",
    n: "4",
    text: "Quem é PagaTG não se arrepende.",
    title: "+90% de Aprovação",
  },
];

const results = block(
  "pgResults",
  {
    eyebrow: "Resultados",
    items: STEPS.map(s => ({
      icon: `${UPLOADS}/${s.icon}`,
      number: s.n,
      text: s.text,
      title: s.title,
    })),
    text: "Mais do que promessas, entregamos resultados. Cada número representa a confiança de quem já vende com a PagaTG.",
    title: "Performance comprovada",
  },
  {
    fx: {
      "1.1.1.1": eyebrowFx,
      ...Object.fromEntries(
        STEPS.flatMap((_, j) => [
          [`1.1.2.${2 * j + 1}`, up(NORMAL, 100 + j * 200)],
          ...(j < STEPS.length - 1
            ? [[`1.1.2.${2 * j + 2}`, enter("zoomIn", NORMAL, 200 + j * 200)]]
            : []),
        ])
      ),
    },
  }
);

const faq = block(
  "pgFaq",
  {
    boxIcon: `${UPLOADS}/1Website.png`,
    boxTitle: "FAQs",
    items: FAQ,
    mode: "open",
    overlayFixed: "yes",
    overlayImage: `${UPLOADS}/DC-BG-3.jpg`,
    overlayOpacity: 100,
    overlayRepeat: "no",
    text: "A gente te explica! Aqui as perguntas mais comuns de quem está começando a usar a PagaTG.",
    title: "Ficou com alguma dúvida?",
  },
  {
    anchor: "faq",
    fx: {
      "2.1.1": enter("zoomIn", FAST),
      ...Object.fromEntries(
        FAQ.map((_, i) => [`2.1.2.${i + 1}`, up(i === 0 ? FAST : NORMAL)])
      ),
    },
  }
);

const homeBlocks: Block[] = [
  hero,
  highlights,
  split,
  benefits,
  values,
  how,
  solutions,
  pricing,
  testimonials,
  security,
  results,
  faq,
];

/* ───────────────────────── legais e 404 ───────────────────────── */

const legalLayer = {
  overlayFixed: "yes",
  overlayImage: `${UPLOADS}/DC-BG-3.jpg`,
  overlayOpacity: 100,
  overlayRepeat: "no",
};

const pages: Page[] = [
  {
    blocks: homeBlocks,
    id: "page-home",
    slug: "",
    status: "published",
    title: "PagaTG - Vendas no Telegram",
  },
  {
    blocks: [
      block("pgLegal", {
        ...legalLayer,
        body: LEGAL_TERMS,
        title: "Termos de Uso",
      }),
    ],
    id: "page-termos",
    slug: "termos-de-uso",
    status: "published",
    title: "Termos de Uso - PagaTG",
  },
  {
    blocks: [
      block("pgLegal", {
        ...legalLayer,
        body: LEGAL_PRIVACY,
        title: "Política de Privacidade",
      }),
    ],
    id: "page-privacidade",
    slug: "politica-de-privacidade",
    status: "published",
    title: "Política de Privacidade - PagaTG",
  },
  {
    blocks: [
      block(
        "pgNotFound",
        {
          buttonLabel: "Voltar para o início",
          buttonUrl: "/",
          icon: `${UPLOADS}/10Editing.png`,
          text: "Ops! Esta página pegou o caminho errado no cruzamento da internet. Vamos te levar de volta.",
          title: "404",
        },
        { fx: { "1.1": up() } }
      ),
    ],
    id: "page-404",
    slug: "404",
    status: "published",
    title: "Página não encontrada",
  },
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer,
  header: [header()],
  menu: [],
  name: "PagaTG",
  pages,
  postLayout: [],
  posts: [],
  theme: {
    accent: "#834DEB",
    bg: "#0A0711",
    cyan: "#34D6E2",
    fg: "#FFFFFF",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Be Vietnam Pro', sans-serif",
    line: "#44404C",
    muted: "#FFFFFFC2",
    panel: "#22143D",
    soft: "#2F2248",
    variant: "pagatg",
  },
};

export const pagatg: SiteTemplate = {
  description:
    "Landing escura em roxo e ciano de plataforma de vendas no Telegram: hero com vídeo de fundo, benefícios, como funciona, soluções com cartões animados, taxas, depoimentos, resultados e FAQ. Migrado do PagaTG.",
  id: "pagatg",
  name: "PagaTG — Vendas no Telegram",
  preview: `${UPLOADS}/Frame-16.png`,
  site,
  tags: ["Landing", "Negócios"],
};
