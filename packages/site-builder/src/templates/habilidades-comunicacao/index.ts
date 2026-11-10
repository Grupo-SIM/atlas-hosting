import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Habilidades de Comunicação — E-book": página de vendas de lp.centraldomarketing.com (WordPress + Hello
 * Elementor, modelo Canvas), com a variante `habilidades` (`renderer/habilidades.ts`). Uma rota só (`/`); `#pt1` é a
 * âncora do bloco de bônus + oferta, para onde rolam "Comprar E-Book" e o primeiro "ADQUIRIR AGORA". Textos, links e
 * imagens vêm do original (imagens ainda hospedadas lá). Os 6 popups do original (campanha "QUERO CONTRIBUIR, SOU
 * PATRIOTA!", com script de UTM do Ticto) não são abertos por nada nesta página e **não** foram migrados. Só os erros
 * de digitação foram corrigidos (negociaçōes/situaçōes com `ō`, instantâneamente → instantaneamente, a disposição → à
 * disposição).
 *
 * Caminhos de `fx` (ver `blocks/habilidades.tsx` e `blocks/ebook.tsx`): `1.2.1.N` = título/subtítulo/botão do hero;
 * `1.2.R.C.1` = ícone do benefício; `1.1.1.1` = título dos bônus; `1.1` = cartão de oferta e `1.1.5` o botão de compra.
 */
const UPLOADS = "https://lp.centraldomarketing.com/wp-content/uploads";
const IMG = {
  bgBenefits: `${UPLOADS}/2023/05/capa-bg2-header-habilidade-comunicacao-scaled.webp`,
  bgBonus: `${UPLOADS}/2023/05/Captura-de-Tela-2023-05-09-aI_s-20.52.29_clipdrop-enhance-scaled.jpg`,
  bgChapters: `${UPLOADS}/2025/06/Editada.3_clipdrop-cleanup.webp`,
  bgHero: `${UPLOADS}/2025/06/capa-bg1-header-habilidade-comunicacao-scaled-1.webp`,
  bgHeroMobile: `${UPLOADS}/2023/05/capa-bg1-header-habilidade-comunicacao-scaled.webp`,
  logo: `${UPLOADS}/2023/05/logo-habilid-02-final.png`,
  stamps: `${UPLOADS}/2023/05/SELA-COMPRA.png`,
};

const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=980b647d-a799-4935-8302-1d44e947b89e";

/** Fotos dos capítulos (`2023/06/`, versão 768×512 para ficar nítida nos 249 px do cartão). */
const chapterImg = (name: string, ext = "jpg") =>
  `${UPLOADS}/2023/06/${name}-768x512.${ext}`;

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: {
    anchor?: string;
    children?: Block[];
    fx?: Record<string, Fx>;
  }
): Block => ({
  id: `hc-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.children ? { children: extra.children } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

/** Só no celular, como no original (computador e tablet ficam parados). */
const mobileFade: Fx = { enterMobile: "fadeIn" };
const bounceLeft: Fx = { enterMobile: "bounceInLeft" };
const bounceRight: Fx = { enterMobile: "bounceInRight" };

const home = [
  block(
    "hcHero",
    {
      bg: IMG.bgHero,
      bgMobile: IMG.bgHeroMobile,
      bgPosition: "center center",
      buttonLabel: "ADQUIRIR AGORA",
      buttonUrl: "#pt1",
      highlight: "MUDAR!",
      logo: IMG.logo,
      logoAlt: "Habilidades de Comunicação",
      minHeight: 760,
      minHeightMobile: 0,
      minHeightTablet: 137,
      subtitle:
        "Desenvolva a habilidade mais desejada pelo mercado de trabalho.",
      title: "AGORA TODAS AS ÁREAS DA SUA VIDA PODEM",
      topButtonLabel: "Comprar E-Book",
      topButtonUrl: "#pt1",
    },
    {
      fx: {
        "1.2.1.1": mobileFade,
        "1.2.1.2": mobileFade,
        "1.2.1.3": { enter: "pulse" },
      },
    }
  ),
  block(
    "hcBenefits",
    {
      bg: IMG.bgBenefits,
      bgMobile: "",
      bgPosition: "center center",
      items: [
        {
          icon: "archway",
          text: "Construindo confiança e credibilidade necessária para a sua comunicação.",
        },
        {
          icon: "people-carry",
          text: "Técnicas testadas e validadas de como finalmente se conectar com seu público.",
        },
        {
          icon: "people-arrows",
          text: "Gerenciar conflitos, negociações e palestras de forma eficaz.",
        },
        {
          icon: "brain",
          text: "Todos os recursos para transformar seu *mindset* e dominar a comunicação.",
        },
        {
          icon: "comment-dots",
          text: "Técnicas modernas para você começar a usar hoje mesmo.",
        },
        {
          icon: "head-side-cough",
          text: "Linguagem corporal, tom de voz, contato visual e hipnose.",
        },
      ],
      minHeight: 1000,
      minHeightMobile: 160,
      minHeightTablet: 0,
      subtitle:
        "Técnicas avançadas e práticas comprovadas para melhorar suas habilidades de comunicação verbal e não verbal.",
      title:
        "Imagine poder expressar suas ideias de maneira clara e convincente, conquistando a atenção e o respeito das pessoas ao seu redor!",
    },
    {
      fx: {
        "1.1.1": mobileFade,
        "1.1.2": mobileFade,
        // Ícones: ímpares entram da esquerda, pares da direita (só no celular).
        "1.2.1.1.1": bounceLeft,
        "1.2.1.2.1": bounceRight,
        "1.2.1.3.1": bounceLeft,
        "1.2.2.1.1": bounceRight,
        "1.2.2.2.1": bounceLeft,
        "1.2.2.3.1": bounceRight,
      },
    }
  ),
  block("hcChapters", {
    bg: IMG.bgChapters,
    bgMobile: "",
    bgPosition: "center center",
    items: [
      {
        alt: "Por que a comunicação é importante?",
        image: chapterImg("photo-1539635278303-d4002c07eae3-5-1"),
        text: "Entenda porque o sucesso em qualquer área da sua vida depende de uma comunicação assertiva.",
        title: "POR QUE A COMUNICAÇÃO É IMPORTANTE?",
      },
      {
        alt: "O que são habilidades de comunicação?",
        image: chapterImg("photo-1539635278303-d4002c07eae3-5"),
        text: "O que realmente é se comunicar na prática, todos os segredos que ninguém te conta sobre esse assunto.",
        title: "O QUE SÃO HABILIDADES DE COMUNICAÇÃO?",
      },
      {
        alt: "Habilidades fundamentais para se comunicar bem",
        image: chapterImg("photo-1539635278303-d4002c07eae3-1"),
        text: "+21 Habilidades para você aprender a ter uma comunicação efetiva.",
        title: "HABILIDADES FUNDAMENTAIS PARA SE COMUNICAR BEM",
      },
      {
        alt: "Comunicação poderosa por escrito",
        image: chapterImg("photo-1539635278303-d4002c07eae3"),
        text: "Reuniões produtivas, armadilhas de comunicação em grupo, apresentações de qualidade e muito mais.",
        title: "COMUNICAÇÃO PODEROSA POR ESCRITO",
      },
      {
        alt: "Tipos de comunicador",
        image: chapterImg("photo-1539635278303-d4002c07eae3-5-2"),
        text: "Descubra os ciclos de comunicação e o tipo de comunicador você é para sempre estar no controle das situações.",
        title: "TIPOS DE COMUNICADOR",
      },
      {
        alt: "Hipnose",
        image: chapterImg("photo-1526648856597-c2b6745ad7bd", "webp"),
        text: "O que é, como aplicá-la no dia a dia e as técnicas da hipnose conversacional para você aplicar na sua próxima conversa.",
        title: "HIPNOSE",
      },
    ],
    label: "CAPÍTULO",
    minHeight: 1100,
    minHeightMobile: 0,
    minHeightTablet: 0,
    tabletLabelSize: 12,
  }),
  block(
    "hcBonus",
    {
      bg: IMG.bgBonus,
      bgMobile: "",
      bgPosition: "center center",
      highlight: "EXCLUSIVOS!",
      items: [
        {
          text: "1. Como se tornar 1% melhor em qualquer coisa todos os dias – Hábitos Atômicos",
        },
        { text: "2. A arte da GUERRA – Sun Tzu (24 Lições)" },
        { text: "3. 48 leis psicológicas do poder – Robert Greene" },
      ],
      minHeight: 718,
      minHeightMobile: 0,
      minHeightTablet: 0,
      supportText: "Equipe profissional à disposição.",
      supportTitle: "TENHA O MELHOR SUPORTE!",
      title: "3 BÔNUS",
    },
    {
      anchor: "pt1",
      children: [
        block(
          "ebookOffer",
          {
            accent: "#DE41FF",
            buttonFrom: "#DE41FF",
            buttonLabel: "ADQUIRIR AGORA",
            buttonTo: "#023131",
            buttonUrl: CHECKOUT,
            cardBg: "rgba(0,0,0,.5)",
            cardTitle: "OFERTA ESPECIAL",
            cashback: "100% de cashback instantaneamente!",
            cashbackStyle: "text",
            fontFamily: "'Montserrat', sans-serif",
            from: "R$37,00",
            fromLabel: "DE",
            price: "R$24,90",
            priceLabel: "POR APENAS",
            stamps: IMG.stamps,
            textColor: "#FFFFFF",
          },
          { fx: { "1.1": mobileFade, "1.1.5": { enter: "pulse" } } }
        ),
      ],
      fx: {
        // "3 BÔNUS EXCLUSIVOS!": quica no computador e vem da esquerda no tablet (o celular herda o tablet).
        "1.1.1.1": { enter: "bounceIn", enterTablet: "bounceInLeft" },
        "1.3.1": mobileFade,
        "1.3.2": mobileFade,
      },
    }
  ),
  block("ebookFaq", {
    accent: "#DE41FF",
    answerColor: "#B8BDC2",
    bg: "#0B0B0B",
    fontFamily: "'Roboto', sans-serif",
    items: [
      {
        answer:
          "O e-book “Habilidades de Comunicação” é um guia abrangente que fornece dicas, técnicas e estratégias para melhorar suas habilidades de comunicação. Ele aborda todos os aspectos importantes da comunicação, incluindo habilidades verbais, não verbais e escritas.",
        question: 'O que é o e-book "Habilidades de Comunicação"?',
      },
      {
        answer:
          "Ao ler o e-book “Habilidades de Comunicação”, você aprenderá a se comunicar de forma mais eficaz em várias situações, como no trabalho, em relacionamentos pessoais e em apresentações públicas. Ele ajudará você a construir relacionamentos mais fortes, melhorar sua capacidade de persuasão e se expressar com clareza e confiança.",
        question: "Quais benefícios posso obter com o e-book?",
      },
      {
        answer:
          "O e-book “Habilidades de Comunicação” é útil para qualquer pessoa que deseje melhorar suas habilidades de comunicação, independentemente de sua área de atuação. Profissionais em cargos de liderança, estudantes, profissionais de vendas, empreendedores e qualquer pessoa que se comunique regularmente com outras pessoas podem aproveitar os conceitos apresentados neste ebook.",
        question: "Quem pode se beneficiar desse e-book?",
      },
      {
        answer:
          "Sim, oferecemos uma garantia de satisfação de 7 dias. Se, por qualquer motivo, você não estiver satisfeito(a) com o e-book, entre em contato conosco dentro desse período e providenciaremos o reembolso completo do valor pago.",
        question: "Existe alguma garantia de satisfação?",
      },
      {
        answer:
          "Não, o e-book é para uso pessoal apenas e não pode ser compartilhado, distribuído ou reproduzido sem permissão. Cada cópia é protegida por direitos autorais e destina-se apenas ao comprador original.",
        question: "Posso compartilhar o e-book com outras pessoas?",
      },
      {
        answer:
          "Após o pagamento ser processado, você receberá um e-mail com um link para acessar o e-book em uma plataforma exclusiva.",
        question: "Após a compra, como faço para acessar o e-book?",
      },
    ],
    lineColor: "#D5D8DC",
    minHeight: 600,
    minHeightMobile: 553,
    minHeightTablet: 370,
    openFirst: "yes",
    textColor: "#FCFCFC",
    title: "DÚVIDAS FREQUENTES",
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("ebookFooter", {
      bg: "#181717",
      copyright: "© SIM Intermediações — Todos os direitos reservados.",
      textColor: "#FFFFFF",
    }),
  ],
  header: [],
  menu: [],
  name: "Habilidades de Comunicação",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Habilidades de Comunicação – E-book",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#DE41FF",
    bg: "#0B0B0B",
    fg: "#FFFFFF",
    fontAccent: "'Roboto', sans-serif",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Electrolize', sans-serif",
    gold: "#FFB700",
    line: "#FFFFFF1A",
    muted: "#C5C5C5",
    panel: "#141414",
    pink: "#D457F8",
    variant: "habilidades",
    violet: "#6F09F7",
  },
};

export const habilidadesComunicacao: SiteTemplate = {
  description:
    "Página de vendas escura em roxo e magenta de e-book de comunicação: hero com anéis 3D, benefícios, capítulos em cartões, bônus, oferta com preço de/por e FAQ. Migrada do Central do Marketing.",
  id: "habilidades-comunicacao",
  name: "Habilidades de Comunicação — E-book",
  preview: IMG.bgHero,
  site,
  tags: ["Landing", "Cursos"],
};
