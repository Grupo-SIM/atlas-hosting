import type { Block, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Controle Patrimonial": cópia de controlepatrimonial.simintermediacoes.com (WordPress + Elementor)
 * com a variante `patrimonial`. O original tem uma rota só (`/`); o menu são âncoras `#d1` (oferta) e `#d3`.
 * Textos, links e imagens vêm do original; as imagens seguem hospedadas lá, como no `spyhacker`.
 */
const UPLOADS =
  "https://controlepatrimonial.simintermediacoes.com/wp-content/uploads";
const IMG = {
  about: `${UPLOADS}/2025/06/gestor-controle-patrimonial.webp`,
  aboutSide: `${UPLOADS}/2025/04/3.png`,
  faqBg: `${UPLOADS}/2025/04/Frame-39-1.png`,
  favicon: `${UPLOADS}/2025/06/Icone-dos-sites-300x300.png`,
  hero: `${UPLOADS}/2025/06/homem-controle-patrimonial.webp`,
  logo: `${UPLOADS}/2025/04/Frame-31.png`,
  split: `${UPLOADS}/2025/06/bg-gestora-controle-patrimonial.webp`,
  step1: `${UPLOADS}/2025/04/focused-specialist-optimizes-data-center_482257-109105.jpg`,
  step2: `${UPLOADS}/2025/04/finance-economics-work-male-discussion-laptop_1418-79.jpg`,
  step3: `${UPLOADS}/2025/04/top-view-businessman-suit-drinking-coffee-collaboration-meeting_482257-12236.jpg`,
  step4: `${UPLOADS}/2025/04/people-office-analyzing-checking-finance-graphs_23-2150377131.jpg`,
};

const LOGIN_URL = "https://saas-patrimonial-front.simintermediacoes.com/";
const OFFER = "#d1";
const BUY = "Adquirir Sistema";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  anchor?: string
): Block => ({
  id: `cp-${seq++}`,
  props,
  type,
  ...(anchor ? { anchor } : {}),
});

const home = [
  block("cpHero", {
    badgeText: "Tenha uma visão clara de todos os bens do seu negócio.",
    badgeTitle: "Segurança",
    button2Label: "Como Funciona",
    button2Url: "#d3",
    buttonLabel: BUY,
    buttonUrl: OFFER,
    eyebrow: "Precisão em cada etapa",
    image: IMG.hero,
    note: "Gestão eficiente = Patrimônio seguro.",
    text: "Valorizamos, organizamos e protegemos o que sua empresa tem de mais valioso.",
    title: "Gestão Patrimonial Sem Dor de Cabeça",
  }),
  block("cpStats", {
    items: [
      {
        icon: "clipboard",
        label: "Altíssima capacidade de itens",
        suffix: "+",
        value: 1000,
      },
      {
        icon: "happy",
        label: "Empresas já utilizam nossa solução",
        suffix: "+",
        value: 200,
      },
      {
        icon: "compass",
        label: "De economia de tempo na gestão de ativos",
        suffix: "%",
        value: 90,
      },
      {
        icon: "star",
        label: "Satisfação dos Clientes",
        suffix: "%",
        value: 98,
      },
    ],
  }),
  block("cpSlider", {
    buttonLabel: "Contratar",
    buttonUrl: OFFER,
    delay: 3000,
    eyebrow: "O controle do seu patrimônio na palma da sua mão",
    items: [
      {
        image: `${UPLOADS}/2025/04/1.png`,
        subtitle: "Itens de Escritório e Tecnologias",
        text: "Bens fixos e móveis",
        title: "Setor Corporativo",
        url: "#",
      },
      {
        image: `${UPLOADS}/2025/04/3-2.png`,
        subtitle: "Restaurantes e Franquias",
        text: "Controle de utensílios e estrutura",
        title: "Equipamentos de Cozinha",
        url: "#",
      },
      {
        image: `${UPLOADS}/2025/04/4-1.png`,
        subtitle: "Produtoras e Estúdios",
        text: "Inventário de equipamentos multimídia",
        title: "Itens Audiovisuais",
        url: "#",
      },
      {
        image: `${UPLOADS}/2025/04/2-2.png`,
        subtitle: "Logística e Suprimentos",
        text: "Organização por código e posição",
        title: "Armazenamento Interno",
        url: "#",
      },
      {
        image: `${UPLOADS}/2025/04/5.png`,
        subtitle: "Depósitos",
        text: "Gestão individual ou itens diversos",
        title: "Empresas de logistica",
        url: "#",
      },
      {
        image: `${UPLOADS}/2025/04/7.png`,
        subtitle: "Escritórios e Lojas",
        text: "Controle de materiais e suprimentos",
        title: "Estoque Organizado",
        url: "",
      },
      {
        image: `${UPLOADS}/2025/04/1-2.png`,
        subtitle: "Propriedades & Cooperativas",
        text: "Para máquinas e peças",
        title: "Frota Agrícola",
        url: "",
      },
      {
        image: `${UPLOADS}/2025/04/beautiful-second-hand-market_23-2149353670.jpg`,
        subtitle: "Comercial",
        text: "Controle de estoque",
        title: "Lojas de Roupas",
        url: "",
      },
      {
        image: `${UPLOADS}/2025/04/6.png`,
        subtitle: "Indústrias",
        text: "Diversos itens",
        title: "Estoque Gerais",
        url: "",
      },
    ],
    title: "Inventário Detalhado e Organizado para:",
  }),
  block(
    "cpAbout",
    {
      buttonLabel: BUY,
      buttonUrl: OFFER,
      image: IMG.about,
      image2: IMG.aboutSide,
      listA:
        "Atualização em tempo real\nRelatórios inteligentes\nDashboard Intuitiva",
      listB:
        "Tecnologia de ponta\nRedução de custos invisíveis\nSegurança e conformidade",
      subtitle: "Mais precisão, baixo custo e muito mais controle",
      text: "Ajudamos empresas a fecharem pontas soltas e terem total controle de seus bens. Com nosso sistema, os gestores podem tomar decisões com base em dados reais, atualizados, além de ter um monitoramento mais assertivo dos colaboradores e uma visão completa do patrimônio.",
      title: "O sistema que todo gestor precisa!",
    },
    "d3"
  ),
  block("cpSplit", {
    eyebrow: "Muito além de um serviço, uma solução completa",
    image: IMG.split,
    items: [
      {
        icon: "car",
        text: "Receba a sua mensalidade de volta imediatamente após a compra.",
        title: "100% de Cashback todos os meses",
      },
      {
        icon: "money",
        text: "Localização, preço, categoria, nota fiscal e muito mais.",
        title: "Detalhamento de cada item",
      },
      {
        icon: "users",
        text: "Cada item tem um localizador único para ser facilmente encontrado.",
        title: "Rastreador de itens",
      },
    ],
    text: "No nosso sistema você terá uma visão clara e detalhada sobre os itens em estoque, com defeitos, todo o histórico de movimentações e muito mais…",
    title: "O que só a Controle Patrimonial entrega",
  }),
  block("cpSteps", {
    eyebrow: "Simples, Objetivo e Fácil.",
    items: [
      {
        buttonLabel: BUY,
        buttonUrl: OFFER,
        image: IMG.step1,
        text: "Sem dificuldades para nenhum colaborador.",
        title: "Cadastramento fácil",
      },
      {
        buttonLabel: BUY,
        buttonUrl: OFFER,
        image: IMG.step2,
        text: "Basta filtrar a data desejada.",
        title: "Relatórios a qualquer momento",
      },
      {
        buttonLabel: BUY,
        buttonUrl: OFFER,
        image: IMG.step3,
        text: "Condição dos itens, categorias, custos, histórico, quantidades, e muito mais...",
        title: "Organização Máxima",
      },
      {
        buttonLabel: BUY,
        buttonUrl: OFFER,
        image: IMG.step4,
        text: "Gráficos, resumos e tudo o que é necessário para otimziar seu tempo.",
        title: "Diagnóstico Estratégico",
      },
    ],
    text: "Criamos um fluxo eficiente e transparente para garantir controle total dos seus bens desde o primeiro contato.",
    title: "É o Fim dos Gargalos na Sua Empresa",
  }),
  block("cpVideo", {
    title: "Veja por Dentro:",
    videoUrl: "https://player.vimeo.com/video/1094636625",
  }),
  block("cpTestimonials", {
    eyebrow: "Clientes Satisfeitos",
    items: [
      {
        image: `${UPLOADS}/2025/04/Team-5.jpg`,
        name: "João Carvalho",
        role: "Gerente Administrativo",
        text: "A gente sempre achou que tinha tudo sob controle... até fazer o inventário com a Controle Patrimonial. Eles identificaram dezenas de bens fora do sistema, ociosos ou mal alocados. Foi um divisor de águas. Hoje temos clareza total do que temos e de como utilizar melhor cada recurso.",
        tone: "dark",
      },
      {
        image: `${UPLOADS}/2025/04/Team-6.jpg`,
        name: "Marcelo Gimenez",
        role: "Diretor de Operações",
        text: "O atendimento foi impecável. Desde a primeira reunião até a entrega do dashboard, fomos acompanhados de perto. Tivemos dúvidas fora do horário comercial e a equipe respondeu prontamente. É raro ver esse nível de atenção hoje em dia.",
        tone: "light",
      },
      {
        image: `${UPLOADS}/2025/04/Team-7.jpg`,
        name: "Sara Caetano",
        role: "Coordenadora de Infraestrutura",
        text: "Eles não só inventariam, eles pensam junto. O relatório final não foi apenas uma lista de bens, mas um raio-x da nossa estrutura física. Com isso, trocamos equipamentos subutilizados, ganhamos eficiência e ajustamos até rotinas.",
        tone: "accent",
      },
    ],
    text: "Da precisão no inventário à clareza nos relatórios, nossos clientes experimentam na prática o impacto real de uma gestão patrimonial eficiente, com suporte contínuo e tecnologia de ponta.",
    title: "Resultados Reais",
  }),
  block(
    "cpOffer",
    {
      buttonLabel: "CONTRATAR",
      buttonUrl: "#",
      list: "Acesso imediato;\nMulti Acessos para administradores;\nAtualizações inclusas.",
      period: "Mensal",
      price: "R$69,90",
      sideText:
        "Use a tecnologia a seu favor e simplifique a sua vida com o melhor sistema patrimonial para gestores do Brasil.",
      sideTitle: "ASSINE HOJE MESMO!",
      subtitle: "100% de cashback todos os meses",
      tag: "Oferta Exclusiva",
      title: "Adquira agora!",
    },
    "d1"
  ),
  block("cpFaq", {
    background: IMG.faqBg,
    eyebrow: "FAQ",
    items: [
      {
        answer:
          "O prazo depende do porte e da quantidade de bens da empresa, mas nosso processo é ágil e estruturado, além do cadastramento ser simples e intuitivo.",
        question: "Quanto tempo leva para realizar o inventário completo?",
      },
      {
        answer:
          "Não. Nosso serviço é planejado para acontecer com o menor impacto possível na sua operação.",
        question:
          "Preciso parar as atividades da minha empresa durante o inventário?",
      },
      {
        answer:
          "Não, basta acessar nosso site, fazer login e pronto. Nosso dashboard é 100% online e personalizado. Não é necessário instalar nada. Você recebe um acesso exclusivo e pode acompanhar tudo em tempo real de qualquer dispositivo a qualquer momento.",
        question: "Como funciona? Preciso instalar algum sistema?",
      },
      {
        answer:
          "Não. Atuamos com empresas de todos os portes. Nosso modelo de atendimento é flexível e adaptável à realidade de cada cliente, seja ele pequeno, médio ou grande.",
        question: "Esse serviço é indicado apenas para empresas grandes?",
      },
      {
        answer:
          "Você terá acesso ao nosso suporte 24 horas por dia, 7 dias por semana. Estamos sempre disponíveis para esclarecer qualquer dúvida e oferecer a melhor experiência possível.",
        question: "E se eu tiver dúvidas durante ou depois do serviço?",
      },
    ],
    text: "Tecnologia própria, relatórios inteligentes e dashboards personalizados.",
    title: "Perguntas Frequentes",
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("cpFooter", {
      copyright: "© SIM Intermediações — Todos os direitos reservados.",
    }),
  ],
  header: [
    block("cpHeader", {
      buttonLabel: "Login",
      buttonUrl: LOGIN_URL,
      logo: IMG.logo,
      logoAlt: "Controle Patrimonial",
    }),
  ],
  menu: [],
  name: "Controle Patrimonial",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Controle Patrimonial",
    },
    {
      blocks: [
        block("cpNotFound", {
          buttonLabel: "Voltar para o início",
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
    accent: "#E9631A",
    bg: "#F6F6F2",
    card: "#FDFDFD",
    dark: "#131313",
    favicon: IMG.favicon,
    fg: "#636363",
    fontAccent: "'Work Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontHeading: "'Plus Jakarta Sans', sans-serif",
    muted: "#C8C8C8",
    panel: "#ECECE7",
    soft: "#C8C8C8",
    variant: "patrimonial",
  },
};

export const controlePatrimonial: SiteTemplate = {
  description:
    "Landing page de venda de sistema de gestão patrimonial, clara com laranja: hero com selo, números com contador, carrossel de cartões, vantagens, vídeo, depoimentos, oferta com preço e perguntas frequentes. Migrado do Controle Patrimonial.",
  id: "controle-patrimonial",
  name: "Controle Patrimonial — Landing de Sistema",
  preview: IMG.hero,
  site,
  tags: ["Landing", "Negócios"],
};
