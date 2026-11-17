import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";
import { CLIENT_LOGOS, IMG } from "./images.js";
import { type LegalBrand, privacidade, termos } from "./legal.js";

/**
 * Template "SAUT — Agência de Marketing e Tecnologia": página única (home + privacidade, termos e 404) no layout do
 * sautmarketing.com, com a variante `saut` (escopo `.sb-sa`, `renderer/saut.ts`; blocos `sa*` em `blocks/saut.tsx`).
 * Os textos em português, o logo e as imagens que a SAUT produziu vêm do original; as fotos de pessoas, ícones, padrões e
 * avatares do kit comercial sobre o qual o site foi montado foram trocados (Unsplash, SVG e CSS próprios), os logos de
 * clientes são fictícios e os depoimentos ocultos do kit ficaram de fora. Acréscimos do template: menu e botão no
 * cabeçalho, botões "Fale com a SAUT" no hero, no CTA e na faixa verde, links do rodapé funcionando.
 */
const BRAND = {
  domain: "sautmarketing.com",
  email: "saut.mktdigital@gmail.com",
  instagram: "https://www.instagram.com/sautmrkt/",
  name: "SAUT Marketing",
  whatsapp:
    "https://wa.me/5568999764761?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20melhor%20as%20solu%C3%A7%C3%B5es%20da%20SAUT",
  whatsappLabel: "WhatsApp +55 68 99976-4761",
};
const LEGAL_BRAND: LegalBrand = {
  domain: BRAND.domain,
  email: BRAND.email,
  name: BRAND.name,
};

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra: { anchor?: string; fx?: Record<string, Fx> } = {}
): Block => ({ id: `sa-${seq++}`, props, type, ...extra });

/** Entradas discretas (desligadas com `prefers-reduced-motion`): títulos sobem 0,6 s; cartões entram em sequência de 80 ms. */
const up: Fx = { enter: "fadeInUp", enterMs: 600 };
const each: Fx = { each: true, enter: "fadeInUp", enterMs: 600, stagger: 80 };

/* ───────── cabeçalho ───────── */

const header = block("saHeader", {
  ctaLabel: "Fale com a SAUT",
  ctaUrl: BRAND.whatsapp,
  links: [
    { label: "Sobre", url: "/#sobre" },
    { label: "Serviços", url: "/#servicos" },
    { label: "Como funciona", url: "/#como-funciona" },
    { label: "Resultados", url: "/#resultados" },
    { label: "Contato", url: "/#contato" },
  ],
  logo: IMG.logo,
  logoAlt: BRAND.name,
  logoUrl: "/",
  sticky: "no",
});

/* ───────── home ───────── */

const hero = block(
  "saHero",
  {
    background: IMG.capa,
    leadsDelta: "+97,5%",
    leadsLabel: "Pontuação de leads",
    leadsValue: "1220",
    leadsWave: "yes",
    photo: IMG.heroPhoto,
    photoAlt: "Pessoa saltando entre pedras",
    pill: "✨ Marketing, tecnologia e estratégia\npara empresas que querem crescer",
    primaryLabel: "Fale com a SAUT",
    primaryUrl: BRAND.whatsapp,
    satAvatars: [...IMG.avatars, { name: "Mais clientes", src: "" }],
    satLabel: "Satisfação dos Clientes",
    satValue: "95",
    secondaryLabel: "Ver serviços",
    secondaryUrl: "#servicos",
    tagLabel: "Campanhas de sucesso",
    tagValue: "230",
    text: "Na SAUT, estratégia, conteúdo, mídia, automação e inteligência artificial trabalham juntos para construir operações de marketing mais eficientes. Criamos soluções orientadas aos objetivos de cada negócio, combinando criatividade, tecnologia e dados para gerar resultados mensuráveis.",
    title:
      "Transformamos visibilidade em oportunidades, clientes e crescimento",
  },
  { fx: { "1.1.2": each } }
);

const logos = block(
  "saLogos",
  {
    grayscale: "no",
    items: CLIENT_LOGOS,
    title: "Marcas que confiam na SAUT para comunicar, posicionar e crescer",
  },
  { fx: { "1.1.1": up, "1.1.2": each } }
);

const about = block(
  "saAbout",
  {
    dots: "yes",
    eyebrow: "Sobre a SAUT",
    floatLabel: "Crescimento mensal",
    floatTop: "+25,5%",
    floatValue: "68",
    items: [
      {
        text: "Planejamos campanhas, posicionamento e ações de marketing a partir dos objetivos reais da empresa, do mercado e do comportamento do público.",
        title: "Estratégia conectada ao negócio",
      },
      {
        text: "Criamos processos mais inteligentes para reduzir tarefas manuais, melhorar o relacionamento com clientes e aumentar a capacidade de execução.",
        title: "Tecnologia e automação",
      },
      {
        text: "Acompanhamos desempenho, comportamento e oportunidades para transformar informação em decisões de marketing mais eficientes.",
        title: "Decisões orientadas por dados",
      },
    ],
    photo: IMG.aboutPhoto,
    photoAlt: "Jovem de óculos escuros sob o céu azul",
    text: "A SAUT é uma empresa de marketing, tecnologia e crescimento. Unimos estratégia, criatividade, produção de conteúdo, mídia, automação e inteligência artificial para ajudar empresas a fortalecer suas marcas, conquistar atenção, gerar oportunidades e construir crescimento sustentável.\n\nNão acreditamos em marketing isolado. Construímos sistemas em que comunicação, dados, tecnologia e execução trabalham juntos.",
    title:
      "Construímos estratégias de marketing conectadas aos objetivos reais de cada negócio",
  },
  { anchor: "sobre" }
);

const services = block(
  "saServices",
  {
    eyebrow: "Nossos serviços",
    items: [
      {
        image: IMG.services[0],
        number: "01",
        text: "Planejamento de marketing, posicionamento, campanhas e análise de oportunidades para transformar objetivos empresariais em estratégias claras de crescimento.",
        title: "Estratégia & Growth",
      },
      {
        image: IMG.services[1],
        number: "02",
        text: "Estratégia criativa, social media, produção audiovisual, campanhas e conteúdos desenvolvidos para construir percepção de marca, gerar atenção e conectar empresas às pessoas.",
        title: "Marca & Conteúdo",
      },
      {
        image: IMG.services[2],
        number: "03",
        text: "Planejamento e gestão de mídia paga, campanhas de aquisição, distribuição de conteúdo e estratégias desenvolvidas para transformar investimento em alcance, leads e oportunidades.",
        title: "Performance & Aquisição",
      },
      {
        image: IMG.services[3],
        number: "04",
        text: "Integramos automações e inteligência artificial aos processos de marketing, atendimento, produção e relacionamento para aumentar produtividade, velocidade e capacidade de escala.",
        title: "Automação & Inteligência Artificial",
      },
    ],
    text: "Da estratégia à execução, conectamos conteúdo, mídia, tecnologia e dados para criar operações de marketing capazes de gerar visibilidade, relacionamento, oportunidades comerciais e crescimento.",
    title:
      "Uma estrutura completa para construir marcas, gerar demanda e acelerar negócios.",
  },
  { anchor: "servicos", fx: { "1.1.1": up } }
);

const process = block(
  "saProcess",
  {
    dots: "yes",
    eyebrow: "Como funciona",
    noteBadge: "Tecnologia potencializada por pessoas",
    noteText:
      "A inteligência artificial aumenta nossa capacidade de analisar, produzir, automatizar e executar. Mas estratégia, criatividade, repertório e tomada de decisão continuam sendo conduzidos por pessoas.\n\nUsamos tecnologia para ampliar nossa capacidade, não para substituir o pensamento.",
    noteTitle: "Estratégia humana. Execução inteligente.",
    steps: [
      {
        icon: "search",
        text: "Conhecemos o negócio, os objetivos, o público, o mercado e os desafios que precisam ser resolvidos.",
        title: "Entender",
      },
      {
        icon: "map",
        text: "Transformamos informações, dados e oportunidades em uma estratégia clara, com prioridades, canais e objetivos definidos.",
        title: "Planejar",
      },
      {
        icon: "blocks",
        text: "Criamos os conteúdos, campanhas, processos, automações e ativos necessários para colocar a estratégia em funcionamento.",
        title: "Construir",
      },
      {
        icon: "rocket",
        text: "Colocamos as campanhas em circulação, distribuímos conteúdo, ativamos mídia e conectamos os diferentes canais da operação.",
        title: "Executar",
      },
      {
        icon: "chart",
        text: "Acompanhamos indicadores, identificamos oportunidades e aprimoramos continuamente a estratégia para aumentar eficiência e resultados.",
        title: "Evoluir",
      },
    ],
    text: "Nosso processo começa entendendo onde a empresa está, onde pretende chegar e quais oportunidades existem entre esses dois pontos. A partir disso, transformamos estratégia em execução, acompanhamos os resultados e evoluímos continuamente a operação.",
    title: "Da compreensão do negócio à execução e otimização contínua",
  },
  { anchor: "como-funciona", fx: { "1.1.1": up, "1.1.2": each } }
);

const why = block(
  "saWhy",
  {
    avatars: [IMG.avatars[0], IMG.avatars[1]],
    card1Pill: "Automação aplicada ao negócio",
    card1Text:
      "Automatize etapas de atendimento, qualificação, relacionamento e operação para que sua empresa responda mais rápido e consiga crescer sem aumentar processos manuais na mesma proporção.",
    card2Label: "Compatibilidade com o público",
    card2Text: "Conteúdos e campanhas alinhados ao perfil de quem compra.",
    card2Value: "96,8",
    card3Badge: "Experiência",
    card3Value: "12",
    dots: "yes",
    eyebrow: "Por que escolher a SAUT",
    items: [
      {
        text: "Cada decisão começa pelo negócio, pelo mercado e pelo objetivo que precisa ser alcançado.",
        title: "Pensamento estratégico",
      },
      {
        text: "Conteúdo, campanhas, mídia, tecnologia e automações deixam de trabalhar separados e passam a fazer parte da mesma estratégia.",
        title: "Execução integrada",
      },
      {
        text: "Trabalhamos com indicadores claros para entender o que está funcionando, onde existem oportunidades e como evoluir continuamente.",
        title: "Resultados acompanháveis",
      },
    ],
    photo: IMG.whyPhoto,
    photoAlt: "Pessoa de gorro azul sob o céu",
    text: "Combinamos visão estratégica, execução criativa, tecnologia e acompanhamento de dados para construir operações mais eficientes e conectadas aos objetivos de cada empresa.\n\nMais do que entregar peças ou publicações, buscamos entender o que precisa acontecer para a marca avançar.",
    title: "Porque marketing precisa fazer sentido para o negócio",
  },
  { fx: { "1.1.1": up, "1.1.2": each } }
);

const cases = block(
  "saCases",
  {
    cases: [
      {
        image: IMG.caseZyrion,
        pill: "Estratégia de conteúdo & distribuição",
        stats: [
          {
            label: "visualizações em 30 dias",
            tone: "green",
            value: "+11,9 mi",
          },
          { label: "contas alcançadas", tone: "orange", value: "+7,9 mi" },
          { label: "novos seguidores", tone: "blue", value: "+20 mil" },
        ],
        text: "Estratégia editorial, produção de conteúdo e distribuição orientada por dados para ampliar alcance, relevância e crescimento nas redes sociais.",
        title: "Transformando um jornal digital em uma potência de audiência",
      },
      {
        image: IMG.caseAtlas,
        pill: "SaaS",
        stats: [
          {
            label: "performance para sites e sistemas",
            tone: "green",
            value: "Alta",
          },
          {
            label: "para operações digitais",
            tone: "orange",
            value: "Mais estabilidade",
          },
          {
            label: "direto com a equipe",
            tone: "blue",
            value: "Suporte especializado",
          },
        ],
        text: "O Atlas oferece soluções de hospedagem com estabilidade, segurança e suporte especializado para sites, sistemas e negócios que precisam permanecer sempre online.",
        title:
          "Servidores de alta performance para empresas e projetos digitais",
      },
    ],
    dots: "yes",
    eyebrow: "Resultados que ajudam a contar nossa história",
    text: "Conheça projetos em que estratégia, conteúdo, distribuição, tecnologia e execução foram utilizados para construir audiência, posicionamento e crescimento.",
    title:
      "Estratégia só importa quando consegue sair do planejamento e gerar movimento",
  },
  { anchor: "resultados", fx: { "1.1.1": up, "1.1.2": each } }
);

const impact = block(
  "saImpact",
  {
    dots: "yes",
    eyebrow: "Nosso impacto",
    items: [
      {
        count: "120",
        prefix: "",
        suffix: "+",
        text: "Experiência construída em diferentes mercados, desafios e modelos de negócio.",
        title: "Empresas e projetos atendidos",
      },
      {
        count: "35",
        prefix: "",
        suffix: "+",
        text: "Automação e inteligência artificial aplicadas para melhorar produtividade, análise, produção e relacionamento.",
        title: "Tecnologia integrada à operação",
      },
      {
        count: "18",
        prefix: "",
        suffix: " mi+",
        text: "Estratégias de conteúdo e mídia que colocam marcas diante de públicos em diferentes canais digitais.",
        title: "Impactos gerados",
      },
      {
        count: "12",
        prefix: "",
        suffix: "+",
        text: "Estratégias desenvolvidas a partir da realidade e dos desafios específicos de cada mercado.",
        title: "Segmentos de atuação",
      },
    ],
    photo: IMG.impactPhoto,
    photoAlt: "Equipe reunida em volta de uma mesa",
    text: "Atuamos ao lado de empresas de diferentes segmentos desenvolvendo estratégias, campanhas, conteúdos e processos capazes de fortalecer marcas e criar novas oportunidades de crescimento.",
    title: "Marketing construído para acompanhar empresas que querem avançar",
  },
  { fx: { "1.1.1": up, "1.1.2.1": each } }
);

const cta = block(
  "saCta",
  {
    badges: [
      { label: "Estratégia personalizada" },
      { label: "Tecnologia integrada" },
      { label: "Execução orientada a resultados" },
    ],
    buttonLabel: "Fale com a SAUT",
    buttonUrl: BRAND.whatsapp,
    eyebrow: "Sua empresa está pronta para o próximo nível?",
    photo: IMG.ctaPhoto,
    photoAlt: "Equipe de trabalho com notebooks",
    text: "Se o objetivo é fortalecer a marca, gerar demanda, conquistar novos clientes ou tornar o marketing mais eficiente, a SAUT pode construir uma operação conectada às necessidades e oportunidades do seu negócio.",
    title:
      "Construa uma estratégia capaz de transformar atenção em crescimento",
  },
  { anchor: "contato" }
);

const home: Block[] = [
  hero,
  logos,
  about,
  services,
  process,
  why,
  cases,
  impact,
  cta,
];

/* ───────── rodapé ───────── */

const footer = block("saFooter", {
  about:
    "A SAUT é uma empresa de marketing, tecnologia e crescimento que conecta estratégia, conteúdo, mídia, automação e inteligência artificial para ajudar marcas e negócios a avançar.",
  bandButtonLabel: "Fale com a SAUT",
  bandButtonUrl: BRAND.whatsapp,
  bandDots: "yes",
  bandTitle: "Vamos construir o próximo movimento?",
  companyItems: [
    { label: "SAUT Marketing", text: "", url: "/#sobre" },
    { label: "Marketing, tecnologia e crescimento.", text: "", url: "" },
    {
      label:
        "Estratégia, conteúdo, mídia e automação para empresas que querem avançar.",
      text: "",
      url: "",
    },
  ],
  companyTitle: "Empresa",
  contactItems: [
    { label: BRAND.whatsappLabel, text: "", url: BRAND.whatsapp },
    { label: `E-mail: ${BRAND.email}`, text: "", url: `mailto:${BRAND.email}` },
  ],
  contactTitle: "Fale com a SAUT",
  copyright: "© {ano} SAUT Marketing. Todos os direitos reservados.",
  legal: [
    { label: "Privacidade", url: "/privacidade/" },
    { label: "Termos", url: "/termos/" },
  ],
  logo: IMG.logoWhite,
  logoAlt: BRAND.name,
  productItems: [
    {
      label: "Ebook SIM",
      text: "Plataforma de e-books: criação, publicação e venda de produtos digitais.",
      url: "https://ebooksim.com/",
    },
    {
      label: "Atlas Hosting",
      text: "Hospedagem, servidores e infraestrutura para sites, portais e projetos digitais.",
      url: "https://atlashosting.com.br/",
    },
    {
      label: "Comunidade Zyrion Brazil",
      text: "Conteúdos, análises e sorteios para quem acompanha o ecossistema Zyrion Brazil.",
      url: "https://zyrionbrazil.com/",
    },
  ],
  productsTitle: "Produtos & Tecnologia",
  serviceItems: [
    "Estratégia & Growth",
    "Marca & Conteúdo",
    "Performance & Aquisição",
    "Audiovisual e Documentários",
    "Automação & IA",
    "Eventos & Mídia",
  ].map(label => ({ label, text: "", url: "/#servicos" })),
  servicesTitle: "Serviços",
  socials: [
    { label: "Instagram", url: BRAND.instagram },
    { label: "WhatsApp", url: BRAND.whatsapp },
  ],
});

/* ───────── páginas ───────── */

const legalPage = (
  slug: string,
  title: string,
  text: string,
  sections: ReturnType<typeof privacidade>
) => ({
  blocks: [block("saLegal", { sections, text, title })],
  id: `page-${slug}`,
  slug,
  status: "published" as const,
  title,
});

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [footer],
  header: [header],
  menu: [],
  name: BRAND.name,
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Marketing, tecnologia e estratégia",
    },
    legalPage(
      "privacidade",
      "Política de Privacidade",
      "Saiba quais dados tratamos, por que precisamos deles e como você pode exercer seus direitos.",
      privacidade(LEGAL_BRAND)
    ),
    legalPage(
      "termos",
      "Termos de Uso",
      "Estas condições definem as regras para usar o site e conhecer os serviços da SAUT.",
      termos(LEGAL_BRAND)
    ),
    {
      blocks: [
        block("saNotFound", {
          background: IMG.capa,
          buttonLabel: "Voltar ao início",
          buttonUrl: "/",
          text: "O endereço acessado não existe ou foi removido.",
          title: "Página não encontrada",
        }),
      ],
      id: "page-404",
      slug: "404",
      status: "published",
      title: "Página não encontrada",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#5584FB",
    bg: "#FFFFFF",
    card: "#FFFFFF",
    contactEmail: BRAND.email,
    favicon: IMG.favicon,
    fg: "#131313",
    fontAccent: "'Newsreader', serif",
    fontBody: "'Inter Tight', sans-serif",
    fontHeading: "'Inter Tight', sans-serif",
    gray: "#F2F2F2",
    green: "#00C22A",
    ink: "#131313",
    instagramUrl: BRAND.instagram,
    lime: "#CCFB55",
    line: "#E7E7E7",
    muted: "#7C7C7C",
    orange: "#FF3C00",
    seoDescription:
      "Na SAUT, estratégia, conteúdo, mídia, automação e inteligência artificial trabalham juntos para construir operações de marketing mais eficientes e gerar resultados mensuráveis.",
    sky: "#DAF0FF",
    sky2: "#EEF8FF",
    teal: "#2DD4A0",
    variant: "saut",
    whatsappUrl: BRAND.whatsapp,
  },
};

export const sautMarketing: SiteTemplate = {
  description:
    "Agência de marketing e tecnologia, branco com azul e verde-limão: hero com céu e cartões de métricas, logos de clientes, serviços em fundo escuro, processo em 5 passos, cases com números, impacto com contadores e rodapé escuro.",
  id: "saut-marketing",
  name: "SAUT — Agência de Marketing e Tecnologia",
  preview: IMG.capa,
  site,
  tags: ["Landing", "Marketing"],
};
