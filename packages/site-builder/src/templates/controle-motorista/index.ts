import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Controle de Motorista": cópia de motorista.simintermediacoes.com (WordPress + Elementor) com a
 * variante `motorista`. O original tem uma rota só (`/`); `#d1` é a seção de preços e `#d2` a do vídeo.
 * Textos, links e imagens vêm do original; as imagens seguem hospedadas lá, como no `controle-patrimonial`.
 * Só os erros de digitação foram corrigidos (garagalos → gargalos, horario → horário, juntamente como →
 * juntamente com o, se comportamento → se comportando, onde está os gargalos → onde estão os gargalos).
 *
 * Os caminhos de `fx` (`"1.1.2"`…) seguem a ordem dos filhos descrita em `blocks/motorista.tsx`.
 */
const UPLOADS = "https://motorista.simintermediacoes.com/wp-content/uploads";
const U = (file: string) => `${UPLOADS}/2025/04/${file}`;
const IMG = {
  bgCol: U("bg-col-01.png"),
  bgMenu: U("bg-menu.png"),
  borderBg: U("border-bg.png"),
  favicon: `${UPLOADS}/2025/06/Icone-dos-sites-logo-300x300.png`,
  hero: U("Design-sem-nome-4.png"),
  lineOverlay: U("linebgoverlay.png"),
  logo: U("controle-motorista-logo.png"),
  orn: U("icon-title-heading.png"),
  ornVideo: U("icon-title-heading-01.png"),
  platform: U("1923.png"),
  ring: U("Design-sem-nome-7.png"),
  triCenter: U("Design-sem-nome-9.png"),
  triLeft: U("1-1.png"),
  triRight: U("2.png"),
};

const OFFER = "#d1";
const HOW = "#d2";
const ADMIN_URL = "http://admin-motorista.simintermediacoes.com";
const STAFF_URL = "http://cliente-motorista.simintermediacoes.com";
const VIDEO = "https://player.vimeo.com/video/1094638845";

/** `fadeInUp` do Elementor: 1,25 s (o do `fx.ts` desloca 40px em vez de 100%; ver docs). */
const rise = (delay = 0): Fx => ({
  delay,
  enter: "fadeInUp",
  enterMs: 1250,
});
const push: Fx = { hover: "push" };

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; fx?: Record<string, Fx> }
): Block => ({
  id: `cm-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

/** Título + subtítulo (+ ornamento): fadeInUp em `1.1.1`, `1.1.2`, `1.1.3` com os atrasos dados. */
const titleFx = (...delays: number[]): Record<string, Fx> =>
  Object.fromEntries(delays.map((d, i) => [`1.1.${i + 1}`, rise(d)]));

const chip = (label: string, number: string, offset: number) => ({
  label,
  number,
  offset,
  url: "",
});

const home = [
  block(
    "cmHero",
    {
      background: IMG.hero,
      buttonLabel: "Fazer Assinatura",
      buttonUrl: OFFER,
      eyebrow: "Controle Inteligente de Frotas",
      overlay: "#000000",
      overlayOpacity: 50,
      text: "Chega de desorganização e planilhas manuais. Com nosso sistema, você acompanha sua equipe externa, controla gastos com combustível, otimiza rotas e acha todos os gargalos da sua empresa.",
      title: "Monitore Rotas, Motoristas e Quilometragem em Tempo Real",
    },
    {
      fx: {
        "1.1.1": rise(0),
        "1.1.2": rise(50),
        "1.1.3": rise(100),
        "1.1.4": rise(150),
        "1.1.4.1": push,
      },
    }
  ),
  block(
    "cmCtaBar",
    {
      background: IMG.bgCol,
      buttonLabel: "Saiba Mais",
      buttonUrl: HOW,
      text: "Aumente a eficiência da sua operação externa!",
    },
    {
      fx: {
        "": { enter: "slideInUp", enterMs: 1250 },
        "1.1.1.3.1": push,
      },
    }
  ),
  block("cmCarousel", {
    autoplay: 5000,
    gap: 30,
    items: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
      alt: `Imagem ${n} do carrossel`,
      image: U(`${n}.jpg`),
    })),
    perDesktop: 4,
    perMobile: 1,
    perTablet: 2,
    showDots: "yes",
    speed: 850,
  }),
  block(
    "cmSectionTitle",
    {
      ornament: IMG.orn,
      size: "big",
      spaceTop: 101,
      style: "center",
      subtitle:
        "Acompanhe cada rota, entenda cada quilômetro rodado e elimine desperdícios com uma plataforma feita para quem precisa de clareza e eficiência.",
      title: "VOCÊ NO CONTROLE DE VERDADE",
    },
    { fx: titleFx(0, 60, 90) }
  ),
  block(
    "cmFeatureRing",
    {
      background: IMG.borderBg,
      image: IMG.ring,
      left: [
        chip("Economia de Combustível", "1", -40),
        chip("Tarefas mais Claras", "3", 7),
        chip("Sistema Intuitivo", "5", -28),
      ],
      right: [
        chip("Gestão Eficiente", "2", -21),
        chip("Relatórios Precisos", "4", 32),
        chip("Suporte Disponível 24/7", "6", -11),
      ],
    },
    {
      fx: {
        "1.1.1.1": rise(0),
        "1.1.1.2": rise(90),
        "1.1.1.3": rise(120),
        "1.1.2": rise(70),
        "1.1.2.1": { hover: "hang" },
        "1.1.3.1": rise(0),
        "1.1.3.2": rise(90),
        "1.1.3.3": rise(120),
      },
    }
  ),
  block(
    "cmPillars",
    {
      items: [
        {
          background: U("eq.avif"),
          hoverColor: "#137BC0",
          icon: U("img-forma.png"),
          overlay: "#242424",
          overlayOpacity: 90,
          text: "Sua equipe estará totalmente adaptada ao nosso sistema na primeira semana",
          title: "Zero dificuldades",
          url: "",
        },
        {
          background: U("se.avif"),
          hoverColor: "#E8B006",
          icon: U("img-forma-01.png"),
          overlay: "#137BC0",
          overlayOpacity: 90,
          text: "Você terá acessos exclusivos para o seu time sem risco de exposição de dados",
          title: "100% Seguro",
          url: "",
        },
        {
          background: U("at.avif"),
          hoverColor: "#343434",
          icon: U("img-forma-02.png"),
          overlay: "#E8B006",
          overlayOpacity: 90,
          text: "Estamos sempre melhorando a experiência de nossos clientes",
          title: "Atualização Constante",
          url: "",
        },
      ],
    },
    { fx: { "1": { ...rise(0), each: true, stagger: 80 } } }
  ),
  block(
    "cmSectionTitle",
    {
      ornament: "",
      size: "normal",
      spaceTop: 101,
      style: "center",
      subtitle:
        "Controle tudo em um só lugar: da rota à economia, da execução ao relatório.",
      title: "UMA PLATAFORMA, VÁRIAS SOLUÇÕES",
    },
    { fx: titleFx(0, 60) }
  ),
  block(
    "cmPlatform",
    {
      buttonLabel: "ADQUIRIR SISTEMA",
      buttonUrl: OFFER,
      features: [
        {
          icon: U("icon-car.png"),
          text: "Motoristas registram o início e fim da jornada direto pelo celular.",
          title: "Check-in de Rota Simplificado",
        },
        {
          icon: U("img-forma-03.png"),
          text: "A cada dia, a plataforma gera um resumo inteligente das atividades, rotas e desvios.",
          title: "Relatórios Diários Automatizados",
        },
        {
          icon: U("img-forma-04.png"),
          text: "Saiba onde o motorista parou, por quanto tempo e se seguiu a rota planejada.",
          title: "Controle de Paradas e Desvios",
        },
        {
          icon: U("img-forma-05.png"),
          text: "Entendendo todos os detalhes da rota verá onde estão os gargalos de consumo.",
          title: "Gestão de Abastecimentos",
        },
      ],
      image: IMG.platform,
    },
    {
      fx: {
        "1.1.1": rise(0),
        "1.1.2.1": { ...rise(100), each: true },
        "1.1.2.2": rise(200),
        "1.1.2.2.1": push,
      },
    }
  ),
  block(
    "cmVideo",
    { ornament: IMG.ornVideo, title: "VEJA COMO FUNCIONA:", videoUrl: VIDEO },
    { anchor: "d2", fx: { "1.1.2": rise(60) } }
  ),
  block(
    "cmSectionTitle",
    {
      hideOnMobile: "yes",
      ornament: "",
      size: "normal",
      spaceTop: 101,
      style: "center",
      subtitle: "Gestão inteligente, resultado no primeiro mês",
      title: "ACABE DE UMA VEZ COM A DÚVIDA!",
    },
    { fx: titleFx(0, 60) }
  ),
  block("cmTriptych", {
    center: IMG.triCenter,
    centerLabel: "Controle não é mais luxo. É necessidade.",
    centerUrl: "#",
    hideOnMobile: "yes",
    left: IMG.triLeft,
    right: IMG.triRight,
  }),
  block(
    "cmSectionTitle",
    {
      ornament: "",
      size: "normal",
      spaceTop: 53,
      style: "center",
      subtitle:
        "Confira o que empresas que enfrentavam os mesmos desafios dizem após integrar nosso sistema à rotina da equipe externa.",
      title: "ELES JÁ SIMPLIFICARAM A GESTÃO",
    },
    { fx: titleFx(0, 60) }
  ),
  block(
    "cmTestimonials",
    {
      items: [
        {
          image: U("imagem_2025-04-22_000943286.png"),
          name: "Ana Martins",
          role: "Coordenadora de Logística",
          text: "Conseguimos reduzir mais de 18% nos gastos com combustível só no primeiro mês. Finalmente temos controle real da operação. Recomendo muito!",
        },
        {
          image: U("imagem_2025-04-22_000838991.png"),
          name: "Rodrigo Sampaio",
          role: "Diretor Operacional",
          text: "Antes era tudo por planilha. Hoje, sei em tempo real onde está cada motorista e como estão usando os veículos. Muito bom o sistema, fácil de mexer.",
        },
        {
          image: U("imagem_2025-04-22_001016875.png"),
          name: "Carla Rezende",
          role: "Supervisora de Vendas Externas",
          text: "A comunicação entre a equipe administrativa e os motoristas melhorou muito. Agora tudo fica registrado e transparente. Vale muito a pena!",
        },
        {
          image: U("imagem_2025-04-22_000916965.png"),
          name: "Tiago Lopes",
          role: "Gerente Regional",
          text: "O sistema é extremamente prático e os relatórios são exatamente o que a diretoria precisava para tomar decisões com agilidade.",
        },
      ],
      ornament: IMG.orn,
      seconds: 5,
    },
    { fx: { "1.1.2": rise(80) } }
  ),
  block(
    "cmPricing",
    {
      overlayImage: IMG.lineOverlay,
      plans: [
        {
          buttonLabel: "Adquirir Agora",
          buttonUrl:
            "https://checkout.simintermediacoes.com/?subscriptionLinkCode=46d8729c-af0e-4e5f-933e-f9ca4bf3c1ce",
          cents: "90",
          color: "#1896FE",
          currency: "R$",
          items:
            "Gestão Eficiente;\nRelatórios Precisos;\nAtualizações Constantes.",
          name: "Plano Mensal",
          ribbon: "",
          subtitle: "Padrão",
          whole: "69",
        },
        {
          buttonLabel: "Adquirir Agora",
          buttonUrl:
            "https://checkout.simintermediacoes.com/?subscriptionLinkCode=16eaf12e-7e03-4ab4-879b-00d7d13ecfa7",
          cents: "90",
          color: "#000000",
          currency: "R$",
          items:
            "Gestão Eficiente;\nRelatórios Precisos;\nAtualizações Constantes.",
          name: "Plano Anual",
          ribbon: "Popular",
          subtitle: "50% de desconto",
          whole: "419",
        },
      ],
      subtitle:
        "Cansado de não saber o que seus motoristas estão fazendo?\nIsso pode acabar agora!",
      title: "Empresas inteligentes controlam sua frota com dados",
    },
    { anchor: "d1" }
  ),
  block("cmFaq", {
    items: [
      {
        answer:
          "Não. Nossa plataforma é 100% online e funciona em qualquer dispositivo com acesso à internet, basta criar sua conta e começar a usar.",
        question: "Preciso instalar algum sistema ou software?",
      },
      {
        answer:
          "Sim. A interface é intuitiva e pensada para quem está em campo. Com poucos toques, eles registram jornada, rotas, paradas e abastecimentos.",
        question: "A ferramenta é fácil de usar para os motoristas?",
      },
      {
        answer:
          "Não. Porém a cada tarefa tem o horário de saída e de chegada do motorista, juntamente com o registro de km, o que permite acompanhar em tempo real a posição da equipe externa, facilitando ajustes de rota e supervisão da operação.",
        question: "O sistema rastreia os motoristas em tempo real?",
      },
      {
        answer:
          "Com certeza. Você pode filtrar por motorista, rota, data ou veículo. Os relatórios são prontos para download instantaneamente.",
        question: "Posso gerar relatórios personalizados?",
      },
      {
        answer:
          "Sim. Entendendo de maneira clara como os motoristas estão se comportando em campo, é possível identificar e eliminar desperdícios rapidamente.",
        question: "A plataforma ajuda a reduzir custos com combustível?",
      },
      {
        answer:
          "Nosso suporte é consultivo e está disponível 24 horas por dia, 7 dias por semana, para te auxiliar sempre que precisar.",
        question: "E se eu tiver dúvidas durante o uso?",
      },
    ],
    title: "PERGUNTAS FREQUENTES",
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("cmFooter", {
      copyright: "© SIM Intermediações - Todos os direitos reservados.",
    }),
    block("scrollTop", {
      bottom: 60,
      color: "#137BC0",
      hoverColor: "#E8B006",
      iconColor: "#FFFFFF",
      label: "Voltar ao topo",
      radius: 5,
      side: "right",
      sideGap: 15,
      size: 50,
      threshold: 200,
    }),
  ],
  header: [
    block("cmHeader", {
      background: IMG.bgMenu,
      buttons: [
        { label: "Área Admin", url: ADMIN_URL },
        { label: "Área do Colaborador", url: STAFF_URL },
      ],
      logo: IMG.logo,
      logoAlt: "Controle de Motorista",
      overlay: "#137BC0",
      overlayOpacity: 90,
    }),
  ],
  menu: [],
  name: "Controle de Motorista",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Controle de Motorista",
    },
    {
      blocks: [
        block(
          "cmNotFound",
          {
            buttonLabel: "Voltar para o início",
            buttonUrl: "/",
            text: "O endereço acessado não existe ou foi removido.",
            title: "Página não encontrada",
          },
          { fx: { "1.3.1": push } }
        ),
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
    accent: "#137BC0",
    bg: "#FFFFFF",
    card: "#FFFFFF",
    dark: "#242424",
    favicon: IMG.favicon,
    fg: "#343434",
    fontAccent: "'Archivo', sans-serif",
    fontBody: "'Open Sans', sans-serif",
    fontHeading: "'Rajdhani', sans-serif",
    muted: "#C7C7C7",
    panel: "#EFEFEF",
    soft: "#F5F5F5",
    title: "#363636",
    variant: "motorista",
    yellow: "#E8B006",
  },
};

export const controleMotorista: SiteTemplate = {
  description:
    "Landing page de venda de sistema de controle de frota, azul e amarelo: hero com barra sobreposta, carrossel, vantagens em volta da imagem, pilares, vídeo, depoimentos, tabela de preços e perguntas frequentes. Migrado do Controle de Motorista.",
  id: "controle-motorista",
  name: "Controle de Motorista — Landing de Sistema",
  preview: IMG.hero,
  site,
  tags: ["Landing", "Negócios"],
};
