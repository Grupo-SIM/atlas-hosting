import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";
import {
  FAQ_HOME,
  FAQ_MARKETING,
  LEGAL_PRIVACY,
  LEGAL_TERMS,
  MKT_ARTS,
  MKT_BRANDS,
  MKT_DESIGN,
  MKT_INFLUENCERS,
  MKT_LOGOS,
  MKT_MEMBERS,
  MKT_SITES,
  MKT_SOCIAL,
  MKT_TRAFFIC,
  MKT_VIDEOS_NEWS,
  MKT_VIDEOS_TEASER,
  MKT_VIDEOS_TV,
  MKT_VIDEOS_VERTICAL,
  MKT_VIDEOS_VSL_H,
  MKT_VIDEOS_VSL_V,
  MKT_VIDEOS_YOUTUBE,
} from "./data.js";

/**
 * Template "SIM Intermediações — Tecnologia e Marketing": migração de simintermediacoes.com (WordPress + Astra +
 * Elementor + ElementsKit), com a variante `sim`. Textos, links, vídeos e imagens vêm do original (as imagens
 * seguem hospedadas lá, como no `controle-patrimonial`); o que foi corrigido está em `docs/development/site-builder.md`.
 */
const UPLOADS = "https://simintermediacoes.com/wp-content/uploads";
const TEX = `${UPLOADS}/2025/03/white-accent-01-1-1.png`;
const LOGO = `${UPLOADS}/2025/03/Logo-simint-scaled.png`;
const WA =
  "https://api.whatsapp.com/send/?phone=5568992078221&text&type=phone_number&app_absent=0";
const TECH = "/portfolio-tecnologia/";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "anchor" | "fx">
): Block => ({ id: `si-${seq++}`, props, type, ...extra });

/** Entrada "lenta" do Elementor (`animated-slow` = 2 s) com atraso. */
const slow = (delay = 0): Fx => ({ delay, enter: "fadeIn", enterMs: 2000 });
const seqFx = (delay: number, stagger = 300): Fx => ({
  delay,
  each: true,
  enter: "fadeIn",
  enterMs: 2000,
  stagger,
});
const rise: Fx = { enter: "fadeInUp", enterMs: 1250 };

const logoList = (names: string[]) =>
  names.map(n => ({ alt: n.replace(/-.*/, ""), image: n }));

/* ───────────────────────── blocos comuns ───────────────────────── */

const header = () =>
  block("siHeader", {
    items: [
      { label: "Sobre", url: "/sobre/" },
      { label: "Tecnologia", url: TECH },
      { label: "Marketing", url: "/portfolio-marketing/" },
      { label: "Contato", url: WA },
    ],
    logo: LOGO,
    logoBottom: -50,
    logoHeight: 180,
    logoTop: -30,
    logoUrl: "/",
  });

const footer = [
  block("siFooter", {
    cnpj: "CNPJ: 38.486.051/0001-48",
    contactTitle: "Contato",
    email: "contatosimintermediacoes@gmail.com",
    legal:
      "Termos de Uso | /termos-de-uso/\nPolítica de Privacidade | /politica-de-privacidade/",
    legalTitle: "Políticas e Termos",
    logo: LOGO,
    logoUrl: "/",
    menu: `Sobre | /sobre/\nTecnologia | ${TECH}\nMarketing | /portfolio-marketing/\nPerguntas frequentes | /#faq`,
    menuTitle: "Menu",
    phone: "(+55) 68 99207-8221",
    phoneUrl: "tel:+5568992078221",
    rights: "Todos os direitos reservados. ©",
    socials: [
      "instagram | https://www.instagram.com/simintermediacoes/",
      "youtube | https://www.youtube.com/@SIMIntermediacoes",
      "x | https://x.com/simintbr",
      "threads | https://www.threads.com/@simintermediacoes",
      "tiktok | http://tiktok.com/@simintermediacoes",
      "kwai | https://kwai.com/@simintbr",
      "facebook | https://www.facebook.com/profile.php?id=61577385876044",
    ].join("\n"),
    texture: TEX,
    textureOpacity: 11,
  }),
  // Botão "Rolar para cima" do Astra: 31,5 px, azul padrão do tema, canto inferior direito, aparece após 300 px.
  block("scrollTop", {
    bottom: 30,
    color: "#046bd2",
    hoverColor: "#046bd2",
    label: "Rolar para cima",
    radius: 2,
    side: "right",
    sideGap: 30,
    size: 32,
    threshold: 300,
  }),
];

const faq = (items: { answer: string; question: string }[]) =>
  block(
    "siFaq",
    { items, title: "Perguntas frequentes" },
    { anchor: "faq", fx: { "1.1.1": slow(), "1.1.2": slow(300) } }
  );

const about = (title: string, text: string) =>
  block(
    "siAbout",
    {
      image: `${UPLOADS}/2025/03/representation-user-experience-interface-design-1.jpg`,
      imagePosition: -149,
      items: [
        {
          accent: "yes",
          icon: "monitor",
          text: "Sistemas intuitivos e modernos",
          title: "Experiência",
        },
        {
          accent: "no",
          icon: "shield",
          text: "Eficiência e atualizações constantes",
          title: "Qualidade",
        },
      ],
      linkLabel: "Ver soluções",
      linkUrl: TECH,
      text,
      texture: TEX,
      textureOpacity: 0,
      title,
    },
    {
      fx: {
        "1.1.1.1": slow(),
        "1.1.1.2": slow(400),
        "1.1.1.3": slow(300),
        "1.1.1.4": slow(500),
        "1.1.1.5.1": slow(600),
        "1.1.1.5.2": slow(700),
        "1.1.2": slow(900),
      },
    }
  );

const logos = (images: string[], withExtra = false) =>
  block(
    "siLogos",
    {
      delay: 500,
      gap: 0,
      logos: logoList(
        withExtra
          ? [
              ...images,
              `${UPLOADS}/2025/04/logo-jb-midia-nosso-portfolio-roxo.webp`,
            ]
          : images
      ),
      perView: 5,
      perViewMobile: 2,
      perViewTablet: 4,
      speed: 1000,
    },
    { fx: { "1.1": rise } }
  );

const HOME_LOGOS = [
  `${UPLOADS}/2025/03/fundacao-logo-press-jb.webp`,
  `${UPLOADS}/2025/03/frendz-logo-press-jb.webp`,
  `${UPLOADS}/2025/03/atlas-logo-press-jb.webp`,
  `${UPLOADS}/2025/03/simpass-logo-press-jb.webp`,
  `${UPLOADS}/2025/03/logo-igreja-renovada-12-nosso-portfolio.webp`,
];

const cta = (label: string, url = WA, extra: Record<string, unknown> = {}) =>
  block("siCta", { label, minHeight: 0, url, ...extra });

const hero = (
  p: Record<string, unknown>,
  fx: Record<string, Fx>,
  layout: "home" | "page"
) =>
  block(
    "siHero",
    {
      layout,
      texture: TEX,
      textureOpacity: layout === "home" ? 5 : 10,
      texturePosition: layout === "home" ? -223 : -160,
      ...p,
    },
    { fx }
  );

/* ───────────────────────── home ───────────────────────── */

const service = (
  title: string,
  text: string,
  icon: string,
  extra: Record<string, unknown> = {}
) => ({ accent: "no", icon, text, textured: "no", title, ...extra });

const PAGAMENTOS = service(
  "Pagamentos Online",
  "Aceitamos pagamentos de várias formas, incluindo cartões de crédito e débito, transferências bancárias, boletos bancários e outras opções de pagamento on-line.",
  "briefcase"
);
const SISTEMAS = service(
  "Desenvolvimento de Sistemas",
  "Nossa equipe de desenvolvedores é altamente qualificada, capaz de criar soluções personalizadas para qualquer nível de complexidade.",
  "card",
  { accent: "yes", textured: "yes" }
);

const plan = (
  name: string,
  features: string[],
  buttonLabel: string,
  buttonUrl: string,
  extra: Record<string, unknown> = {}
) => ({
  buttonLabel,
  buttonUrl,
  featured: "no",
  features: features.join("\n"),
  name,
  screens: "all",
  ...extra,
});

const testimonial = (
  image: string,
  name: string,
  role: string,
  text: string
) => ({
  avatar: `${UPLOADS}/2025/03/${image}`,
  name,
  role,
  stars: "yes",
  text,
});

const homeBlocks: Block[] = [
  hero(
    {
      badge: "Marketing e Tecnologia",
      badgeIcon: "wallet",
      buttonLabel: "Entrar em contato",
      buttonUrl: WA,
      title: "Serviços que Geram Resultados Rápidos",
      videoUrl:
        "https://player.vimeo.com/video/1081562046?playlist=1081562046&muted=0&autoplay=0&loop=no&controls=1&start=&end=&title=0&portrait=0&byline=0",
    },
    {
      "1.1.1": slow(0),
      "1.1.2": slow(300),
      "1.1.3.1": slow(500),
      "1.1.3.2": slow(700),
    },
    "home"
  ),
  block(
    "siOrbit",
    {
      image: `${UPLOADS}/2025/03/Credit-Card-Mockup-New.png`,
      left: [
        { icon: "thumbs-up", offset: 0, title: "Altíssima taxa de aprovação" },
        {
          icon: "chart",
          offset: -47,
          title: "Saque ágil para o seu negócio (D+1)",
        },
      ],
      right: [
        {
          icon: "star",
          offset: 40,
          title: "Cashback em todas as transações",
        },
        { icon: "shield", offset: 0, title: "Transparente e seguro" },
      ],
    },
    {
      fx: {
        "1.1.1.1": slow(300),
        "1.1.1.2": slow(500),
        "1.1.2": slow(0),
        "1.1.3.1": slow(700),
        "1.1.3.2": slow(900),
      },
    }
  ),
  block(
    "siGradientTitle",
    { title: "Inovação em Pagamentos Online", url: TECH },
    { fx: { "1": slow() } }
  ),
  about(
    "Somos Especialistas em Marketing e Tecnologia",
    "Após anos utilizando outros serviços e sistemas do mercado em nossos negócios, optamos por desenvolver soluções próprias, mais ágéis, eficientes, transparentes e seguras que resolviam as dores que sentíamos na pele."
  ),
  logos(HOME_LOGOS),
  block(
    "siServices",
    {
      cards: [
        PAGAMENTOS,
        SISTEMAS,
        service(
          "Whitelabels",
          "Personalizamos nossos sistemas com a sua marca, oferecendo uma experiência única para os seus clientes.",
          "users",
          { screens: "tablet" }
        ),
        service(
          "SaaS",
          "Oferecemos nossos sistemas na nuvem, permitindo acesso e uso de nossas tecnologias de maneira fácil, rápida e intuitiva.",
          "smartphone",
          { screens: "tablet" }
        ),
        service(
          "Whitelabels e SaaS",
          "Personalizamos nossos sistemas com a sua marca e oferecemos sistemas na nuvem, permitindo acesso e uso de nossas tecnologias de maneira fácil, rápida e intuitiva.",
          "users",
          { screens: "notTablet" }
        ),
        service(
          "Marketing",
          "Oferecemos todo tipo de serviços de marketing digital, desde os mais simples até os mais técnicos.",
          "smartphone",
          { screens: "notTablet" }
        ),
      ],
      columns: 2,
      texture: TEX,
      textureOpacity: 12,
      title: "Serviços",
    },
    { fx: { "1.1.1": slow(), "1.1.2": seqFx(300) } }
  ),
  cta("Ver Portfólio", TECH, {
    marginBottom: 150,
    marginTop: -95,
    minHeight: 120,
  }),
  block(
    "siTestimonials",
    {
      image: `${UPLOADS}/2025/03/garantia3d.png`,
      items: [
        testimonial(
          "Jandesson.webp",
          "Jandesson",
          "Empresário e mentor de cursos",
          "Comecei a usar e me surpreendi com a taxa de aprovação da plataforma, e além disso, a facilidade de usá-la. Já trabalhei com outros gateways do mercado e posso afirmar que a SIM INT é disparado o melhor."
        ),
        testimonial(
          "Rafael-Martins.webp",
          "Rafael Martins",
          "Empresário e mentor de cursos",
          "Sem dúvida a melhor plataforma de pagamento do mercado, além de uma excelente taxa de aprovação, consigo ter um ótimo atendimento humanizado."
        ),
        testimonial(
          "Tulio-scaled.webp",
          "Tulio",
          "Empresário",
          "Solicitei um aplicativo da empresa e fiquei muito satisfeito com o resultado, foi me entregue mais rápido do que esperava, bem bonito, sem bugs e muito intuitivo. Tive uma excelente experiência, mandei fazer mais 7 sistemas depois desse."
        ),
        testimonial(
          "Giulia-Soares.webp",
          "Giulia Soares",
          "CEO 2you fitness",
          "Estou há 7/8 meses usando a estrutura da SIM INT, posso afirmar que foi uma virada de chave. Nenhum outro gateway chegou perto de entregar o que a SIM oferece. A taxa de aprovação é de 100% e o Antifraude é realmente funcional. A equipe nos ajudou a aumentar a conversão no site com várias recomendações eficazes. Eles realmente almejam nosso crescimento e estão sempre dispostos a auxiliar. Agradeço todo o esforço e trabalho 💕"
        ),
      ],
      layout: "grid",
      texture: TEX,
      textureOpacity: 23,
      title: "QUALIDADE GARANTIDA!",
      titleFont: "poppins",
    },
    {
      fx: {
        "1.1.1.1": slow(),
        "1.1.2": { ...seqFx(800, 0), delay: 1200 },
      },
    }
  ),
  block(
    "siPlans",
    {
      plans: [
        plan(
          "Gateway",
          [
            "Altíssima taxa de aprovação;",
            "Cashback em todas as transações;",
            "Saque ágil e rápido (D+1);",
            "Transparente e seguro;",
            "Aceitamos várias formas de pagamento;",
            "Facilidade de integração.",
          ],
          "Utilizar agora",
          TECH
        ),
        plan(
          "SaaS",
          [
            "Baixo custo inicial;",
            "Atualizações automáticas;",
            "Redução de custos operacionais;",
            "Suporte contínuo;",
            "Menos burocracia;",
            "Otimização rápida de processos.",
          ],
          "Utilizar agora",
          TECH
        ),
        plan(
          "Sistemas",
          [
            "Solução sob medida;",
            "Maior eficiência operacional;",
            "Total controle e flexibilidade;",
            "Redução de custos a longo Prazo;",
            "Experiência do usuário otimizada;",
            "Adaptação rápida às mudanças.",
          ],
          "Entrar em contato",
          WA,
          { featured: "yes" }
        ),
        plan(
          "Marketing",
          [
            "Estrategistas com mais de 10 anos de experiência;",
            "Campanhas e conteúdos que chamam atenção e diferenciam a sua marca;",
            "Foco em resultados e não apenas em métricas de vaidade.",
            "Processos claros e relacionamento próximo com o cliente;",
            "Controle de risco e visão 360° do mercado.",
          ],
          "Entrar em contato",
          WA,
          { screens: "notTablet" }
        ),
        plan(
          "Whitelabel",
          [
            "Personalização completa com sua marca;",
            "Implementação rápida;",
            "Redução de custos de desenvolvimento;",
            "Atualizações constantes;",
            "Redução do tempo de treinamento.",
          ],
          "Entrar em contato",
          WA,
          { screens: "tablet" }
        ),
      ],
      texture: TEX,
      textureOpacity: 10,
      title: "Adquirir Serviços",
    },
    { fx: { "1.1.1": slow(), "1.1.2": seqFx(300) } }
  ),
  faq(FAQ_HOME),
];

/* ───────────────────────── sobre ───────────────────────── */

const aboutBlocks: Block[] = [
  hero(
    {
      title: "Sobre Nós",
      videoUrl:
        "https://player.vimeo.com/video/1079042475?playlist=1079042475&muted=0&autoplay=1&loop=no&controls=1&start=&end=&title=0&portrait=0&byline=0",
    },
    { "1.1.1": slow(300), "1.1.2.1": slow(700) },
    "page"
  ),
  about(
    "Somos Especialistas em Tecnologia",
    "Após anos utilizando outros gateways e sistemas do mercado em nossos negócios, optamos por desenvolver soluções próprias, mais ágéis, eficientes, transparentes e seguras que resolviam as dores que sentíamos na pele."
  ),
  logos(HOME_LOGOS, true),
  block("siTeam", {
    buttonLabel: "Entrar em contato",
    buttonUrl: WA,
    instagram: "https://www.instagram.com/olucasacre/",
    list1: "Acessibilidade Global\nZero Burocracia",
    list2: "Resultado Comprovado\nMais Velocidade",
    name: "Lucas Acre",
    photo: `${UPLOADS}/2025/03/lucasacre-jbmdiia-simintermediacao-foto-01-profile-perfil-1024x1024.webp`,
    role: "Fundador",
    text: "Utilizamos dados em tempo real para otimizar estratégias e gerar resultados cada vez mais assertivos.",
    texture: TEX,
    title: "Empresa 100% Digital",
  }),
  block(
    "siTestimonials",
    {
      items: [
        {
          name: "Visão",
          stars: "no",
          text: "Ser reconhecida como uma das maiores referências em soluções tecnológicas, impulsionando pessoas e negócios de diferentes setores a se destacarem pela inovação, qualidade e adaptação constante às mudanças do mercado global.",
        },
        {
          name: "Valores",
          stars: "no",
          text: "-> Inovação Constante: Buscamos sempre novas formas de resolver desafios, incorporando as tecnologias mais recentes em nossas soluções.\n-> Excelência e Qualidade: Entregamos o melhor em cada projeto, focando na experiência, eficácia e resultados consistentes.\n-> Agilidade e Flexibilidade: Adaptamo-nos rapidamente às necessidades do cliente e do mercado, entregando soluções de forma rápida e eficiente.\n-> Transparência e Confiança: Valorizamos a honestidade e a transparência em todos os nossos relacionamentos, garantindo confiança mútua.",
        },
        {
          name: "Missão",
          stars: "no",
          text: "A nossa missão é transformar o mercado digital com soluções inovadoras, desenvolvendo softwares e plataformas que atendam às necessidades dos nossos clientes, proporcionando crescimento e agilidade em cada etapa do seu processo de negócios.",
        },
      ],
      layout: "cards",
      texture: TEX,
      textureOpacity: 23,
      title: "Contamos com uma equipe de +30 colaboradores",
      titleFont: "poppins",
    },
    { fx: { "1.1.1": slow(), "1.1.2": { ...seqFx(900, 150) } } }
  ),
];

/* ───────────────────────── portfólio de tecnologia ───────────────────────── */

const tcard = (
  title: string,
  text: string,
  icon: string,
  buttonLabel = "Conhecer",
  buttonUrl = "#",
  extra: Record<string, unknown> = {}
) => ({
  accent: "no",
  buttonLabel,
  buttonUrl,
  icon,
  screens: "all",
  text,
  textured: "no",
  title,
  ...extra,
});

const section = (title: string, cards: Record<string, unknown>[]) =>
  block(
    "siServices",
    { cards, columns: 2, texture: TEX, textureOpacity: 12, title },
    { fx: { "1.1.1": slow(), "1.1.2": seqFx(0, 150) } }
  );

const techBlocks: Block[] = [
  hero(
    { buttonLabel: "Entrar em contato", buttonUrl: WA, title: "Portfólio" },
    { "1.1.1": slow(300), "1.1.2.1": slow(500) },
    "page"
  ),
  section("Gateway e Checkout", [
    tcard(
      "Sim Int Pay",
      "Um gateway completo para você vender com segurança, estabilidade e alta taxa de aprovação. Somos o único no Brasil que oferece 100% de cashback em todas as transações até R$250 por venda. Mais conversão, mais lucro e mais dinheiro no seu caixa. Simples, estável e seguro, feito para escalar seu negócio.",
      "card",
      "Conhecer",
      "https://simintpay.com"
    ),
    tcard(
      "PagaTG",
      "A PagaTG é uma plataforma que simplifica a criação e gestão de grupos pagos no Telegram, ideal para criadores de conteúdo, infoprodutores e comunidades exclusivas. Com ela, você automatiza o acesso de membros, define planos de assinatura e gerencia pagamentos de forma prática, automática e segura.",
      "smartphone",
      "Conhecer",
      "http://Pagatg.com"
    ),
  ]),
  section("Nossos SaaS", [
    tcard(
      "Atlas: Dominio e Hospedagem",
      "A Atlas Hosting oferece uma solução completa para quem busca mais do que apenas “estar no ar”. Com servidores de alta velocidade, segurança avançada e suporte via WhatsApp, você tem garantia de estabilidade e performance. Além disso, a cada mensalidade de até R$250,00 você recebe 100% de cashback.",
      "server",
      "Conhecer",
      "https://atlashosting.com.br/"
    ),
    tcard(
      "EbookSim",
      "Um marketplace completo, exclusivo para eBooks, com a mesma experiência prática e intuitiva que você encontra em grandes lojas do mercado. Publique, organize e venda seus livros digitais com facilidade, enquanto os leitores recebem uma experiência de leitura 100% profissional e realizam compras de forma rápida e segura.",
      "globe",
      "Conhecer",
      "https://ebooksim.com/"
    ),
    tcard(
      "ÁreaFlix",
      "A ÁreaFlix é uma área de membros para você, infoprodutor, vender seus cursos e produtos, oferecendo um alto nível de experiência para seus alunos. Com uma estrutura totalmente premium, você pode gerenciar seus serviços e comercializar seu conteúdo, proporcionando uma imersão exclusiva para seus clientes, fortalecendo seu branding e aumentando seu ticket médio.",
      "monitor",
      "Conhecer",
      "http://areaflix.simintermediacoes.com/"
    ),
    tcard(
      "Teron",
      "O Teron é uma plataforma completa para gestão empresarial, reunindo comunicação, equipes, projetos e organização em um único ambiente. Tenha chats, videochamadas, calendário, notificações, departamentos, gestão de projetos e acompanhamento de tarefas, tudo integrado para facilitar a rotina da empresa, aumentar a produtividade e manter sua equipe alinhada.",
      "briefcase",
      "Conhecer",
      "https://teron.app"
    ),
    tcard(
      "Controle Patrimonial",
      "Esse SaaS é uma solução completa para empresas que desejam gerenciar seus ativos de forma simples e eficiente. Com uma plataforma intuitiva e segura, você pode acompanhar todo o ciclo de vida dos seus bens, desde a aquisição até a baixa, garantindo organização e transparência.",
      "building",
      "Conhecer",
      "https://controlepatrimonial.simintermediacoes.com/"
    ),
    tcard(
      "Controle de motorista",
      "Esse Saas foi desenvolvido para empresas que lidam com transporte e logística. Gerencie sua frota e seus motoristas com precisão, organização e total controle. Acompanhe as rotas, o consumo, as tarefas e muito mais… tudo em um só lugar, de maneira fácil e intuitiva.",
      "car",
      "Conhecer",
      "https://motorista.simintermediacoes.com/"
    ),
  ]),
  section("Whitelabels", [
    tcard(
      "App para igrejas",
      "Desenvolvemos um aplicativo para igrejas que querem estar mais próximas de seus membros. Transforme a experiência digital de seus discipulos e visitantes e crie um ambiente online único e interativo. Conteúdo em video, estudos bíblicos, pedidos de oração, espaço pra contribuiçao, quiz interativo e muito mais.",
      "users",
      "Solicitar o meu",
      WA,
      { videoUrl: "https://vimeo.com/1083968443" }
    ),
    tcard(
      "App para Gestão de Escolas",
      "Desenvolvido especialmente para escolas e professores que buscam uma maneira eficiente de gerenciar suas aulas, controlar a frequência dos alunos e acompanhar todo o desempenho acadêmico. Com uma interface simples, você tem tudo o que precisa para otimizar o dia a dia da sala de aula e do seu administrativo.",
      "building",
      "Solicitar o meu",
      WA,
      { videoUrl: "https://vimeo.com/1095326538?share=copy" }
    ),
  ]),
  section("Portfólio", [
    tcard(
      "BotZappy",
      "Chatbot automatizado com Inteligência Artificial, CRM completo, disparos em massa e sistema de tickets profissional. Feito para aumentar sua produtividade em até 300% e te ajudar a nunca mais perder cliente.",
      "wrench",
      "Conhecer",
      "https://botzappy.com.br/"
    ),
    tcard(
      "Delivery Zero Grau",
      "Aplicativo de delivery com experiência simples e eficiente. Com poucos toques, os clientes encontram seus pratos favoritos, fazem pedidos com facilidade e acompanham cada etapa da entrega.",
      "car",
      "Conhecer",
      "https://delivery.zerograusorvetesac.com/"
    ),
    tcard(
      "Manutenção de itens",
      "Sistema voltado para otimizar o acompanhamento de manutenções de ar condicionado, extintores, geradores ou qualquer equipamento. Essa organização evita grandes prejuizos.",
      "wrench",
      "",
      "#",
      { videoUrl: "https://vimeo.com/1094397730" }
    ),
    tcard(
      "Controle de doações",
      "Ferramenta ideal para fundações, ONGs e instituições de caridade que buscam gerenciar suas doações de forma transparente, eficiente e organizada.",
      "wallet",
      "",
      "#",
      { videoUrl: "https://vimeo.com/1094640498?share=copy" }
    ),
  ]),
  section("Desenvolvimento", [
    tcard(
      "Serviços",
      "Desenvolvemos todo tipo de sistema, não importando o nivel de complexidade.",
      "code",
      "Entrar em contato",
      WA
    ),
  ]),
  faq(FAQ_HOME),
];

/* ───────────────────────── portfólio de marketing ───────────────────────── */

const imgs = (list: string[]) => list.map(image => ({ alt: "", image }));
const vcar = (
  title: string,
  items: { thumb: string; video: string }[],
  tall = false
) =>
  block("siVideoCarousel", {
    arrows: "outside",
    delay: 5000,
    dots: "yes",
    gap: 10,
    items: items.map(i => ({ ...i, title })),
    perView: tall ? 4 : 3,
    perViewMobile: 1,
    perViewTablet: 2,
    ratio: tall ? "9:16" : "16:9",
    speed: 500,
    title,
  });
const title = (t: string, text = "", marginTop = 0) =>
  block(
    "siTitle",
    { gradient: "yes", marginTop, text, title: t },
    { fx: { "1": { enter: "fadeInUp", enterMs: 1250 } } }
  );

const marketingBlocks: Block[] = [
  hero(
    { buttonLabel: "Entrar em contato", buttonUrl: WA, title: "Portfólio" },
    { "1.1.1": slow(300), "1.1.2.1": slow(500) },
    "page"
  ),
  logos(MKT_LOGOS),
  title(
    "Tráfego Pago",
    "Confira um pouco dos resultados de nossas campanhas:",
    100
  ),
  block("siImageCarousel", {
    arrows: "outside",
    delay: 5000,
    dots: "yes",
    gap: 10,
    items: imgs(MKT_TRAFFIC),
    perView: 2,
    perViewMobile: 1,
    perViewTablet: 2,
    speed: 500,
  }),
  block("siTitle", {
    gradient: "no",
    text: "Rodamos tráfego para infoprodutos nacionais, internacionais e negócios locais.",
    title: "",
  }),
  title(
    "Edição de videos",
    "Confira abaixo edições que fizemos para alguns clientes:",
    50
  ),
  vcar("VSL Horizontal Nicho Black", MKT_VIDEOS_VSL_H),
  vcar("YouTube", MKT_VIDEOS_YOUTUBE),
  vcar("Programas de TV", MKT_VIDEOS_TV),
  vcar("Teaser", MKT_VIDEOS_TEASER),
  vcar("Matérias", MKT_VIDEOS_NEWS),
  vcar("Vídeos Vertical", MKT_VIDEOS_VERTICAL, true),
  vcar("VSL Vertical", MKT_VIDEOS_VSL_V, true),
  cta("Entrar em contato", WA, { marginBottom: 50, minHeight: 120 }),
  block(
    "siFeature",
    {
      decor: `${UPLOADS}/2026/09/1-3-1024x256.png`,
      delay: 5000,
      gap: 10,
      items: imgs(MKT_DESIGN),
      perView: 1,
      perViewMobile: 1,
      perViewTablet: 1,
      speed: 500,
      text: "A SIM Intermediações faz thumbs, webdesign de sistemas e aplicativos, artes para eventos, criação de logo, branding de marcas e tudo relacionado a criação de artes que nosso contratante precisar.\nO webdesign de todos os sites citados aqui nesse portfólio, juntamente com todas as thumbs dos canais de youtube, artes, sistemas desenvolvidos, foi pensado e produzido por nosso time.",
      title: "Design",
    },
    { fx: { "1.1.3": { enter: "fadeInLeft", enterMs: 1250 } } }
  ),
  block("siImageCarousel", {
    arrows: "inside",
    delay: 5000,
    dots: "yes",
    gap: 20,
    items: imgs(MKT_ARTS),
    perView: 2,
    perViewMobile: 1,
    perViewTablet: 2,
    speed: 500,
    title: "Artes e thumbs",
  }),
  block("siImageCarousel", {
    arrows: "inside",
    delay: 5000,
    dots: "no",
    gap: 10,
    items: imgs(MKT_MEMBERS),
    maxWidth: 900,
    perView: 1,
    perViewMobile: 1,
    perViewTablet: 1,
    speed: 500,
    title: "Áreas de membros",
  }),
  block("siTitle", {
    gradient: "no",
    marginTop: 40,
    title: "Branding e marcas criadas",
  }),
  block(
    "siLogos",
    {
      delay: 500,
      gap: 0,
      logos: logoList(MKT_BRANDS),
      perView: 5,
      perViewMobile: 2,
      perViewTablet: 4,
      speed: 1000,
    },
    { fx: { "1.1": rise } }
  ),
  title("Sites desenvolvidos", "", 40),
  block("siSiteCards", {
    columns: 5,
    columnsMobile: 1,
    columnsTablet: 3,
    items: MKT_SITES,
  }),
  block("siTitle", {
    gradient: "no",
    text: "Sites institucionais, landing pages, blogs e muito mais…",
    title: "",
  }),
  cta("Entrar em contato", WA, { minHeight: 80 }),
  title("Redes sociais que cuidamos", "", 60),
  block("siSocialCards", {
    columns: 3,
    columnsMobile: 1,
    columnsTablet: 2,
    items: MKT_SOCIAL.map(s => ({ ...s, name: "" })),
  }),
  title("Influenciadores parceiros", "", 60),
  block("siSocialCards", {
    columns: 2,
    columnsMobile: 1,
    columnsTablet: 2,
    items: MKT_INFLUENCERS,
  }),
  cta("Entrar em contato", WA, { minHeight: 100 }),
  block("siTestimonials", {
    image: `${UPLOADS}/2026/09/1-6-1024x998.png`,
    items: [
      {
        avatar: `${UPLOADS}/2026/09/2-37.jpg`,
        name: "Lívia Costa",
        role: "Head de Marketing",
        stars: "yes",
        text: "A SIM Intermediações revolucionou nossa presença online! Em poucos meses, a empresa saiu do anonimato e passou a gerar vendas recorrentes. Sem falar da equipe de suporte, são incríveis!",
      },
      {
        avatar: `${UPLOADS}/2026/09/3-44.jpg`,
        name: "Sarah Albuquerque",
        role: "Gestora Estratégica",
        stars: "yes",
        text: "Nunca imaginei que um funil de vendas bem estruturado faria tanta diferença. Com as estratégias da SIM Int, minha taxa de conversão dobrou! Nos primeiros meses já vimos o resultado vindo.",
      },
      {
        avatar: `${UPLOADS}/2026/09/4-35.jpg`,
        name: "Stefan Braga",
        role: "CMO",
        stars: "yes",
        text: "A equipe da SIM Intermediações realmente entende de marketing digital. Depois que aplicamos as estratégias de tráfego pago e SEO, meu site começou a receber um fluxo constante de leads qualificados.",
      },
    ],
    layout: "slider",
    text: "Histórias reais de quem já teve resultados incríveis com as nossas estratégias.",
    title: "Depoimentos",
  }),
  faq(FAQ_MARKETING),
  block("siTitle", {
    gradient: "no",
    marginTop: 40,
    title: "Orçamento de serviços",
  }),
  cta(
    "Clique aqui",
    "https://jbmidia.com/wp-content/uploads/2025/10/Orcamento-JB-MIDIA.pdf",
    {
      marginBottom: 80,
      minHeight: 100,
    }
  ),
];

/* ───────────────────────── legais e 404 ───────────────────────── */

const pages: Page[] = [
  {
    blocks: homeBlocks,
    id: "page-home",
    slug: "",
    status: "published",
    title: "Inicio - SIM INT",
  },
  {
    blocks: aboutBlocks,
    id: "page-sobre",
    slug: "sobre",
    status: "published",
    title: "Sobre - SIM INT",
  },
  {
    blocks: techBlocks,
    id: "page-tecnologia",
    slug: "portfolio-tecnologia",
    status: "published",
    title: "Portfólio Tecnologia - SIM INT",
  },
  {
    blocks: marketingBlocks,
    id: "page-marketing",
    slug: "portfolio-marketing",
    status: "published",
    title: "Portfólio Marketing - SIM INT",
  },
  {
    blocks: [
      block("siProse", {
        body: LEGAL_PRIVACY,
        title: "Política de Privacidade",
      }),
    ],
    id: "page-privacidade",
    slug: "politica-de-privacidade",
    status: "published",
    title: "Política de Privacidade - SIM INT",
  },
  {
    blocks: [block("siProse", { body: LEGAL_TERMS, title: "Termos de Uso" })],
    id: "page-termos",
    slug: "termos-de-uso",
    status: "published",
    title: "Termos de Uso - SIM INT",
  },
  {
    blocks: [
      block("siNotFound", {
        buttonLabel: "Voltar para o início",
        buttonUrl: "/",
        text: "Parece que o link que apontava para aqui estava quebrado. Que tal voltar ao início?",
        title: "Esta página não existe.",
      }),
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
  name: "SIM Intermediações",
  pages,
  postLayout: [],
  posts: [],
  theme: {
    accent: "#8351F1",
    bg: "#080411",
    card: "#8351F117",
    fg: "#FFFFFF",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Anek Devanagari', sans-serif",
    muted: "#C9C9C9",
    variant: "sim",
  },
};

export const simIntermediacoes: SiteTemplate = {
  description:
    "Site institucional escuro com roxo de empresa de tecnologia e marketing: hero com vídeo, benefícios em volta do cartão, serviços, depoimentos com coluna fixa, planos, FAQ, sobre e dois portfólios com carrosséis de imagens e vídeos. Migrado da SIM Intermediações.",
  id: "sim-intermediacoes",
  name: "SIM Intermediações — Tecnologia e Marketing",
  preview: `${UPLOADS}/2025/03/Credit-Card-Mockup-New.png`,
  site,
  tags: ["Institucional", "Negócios"],
};
