import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "O Outro Lado da Internet — E-book": página de vendas de lp.centraldomarketing.com (WordPress + Hello
 * Elementor, modelo Canvas), com a variante `outrolado`. Uma rota só (`/`); `#pt1` e `#pt2` são as âncoras dos
 * botões de rolagem. Textos, links e imagens vêm do original (imagens ainda hospedadas lá). Os 6 popups do
 * original (campanha "QUERO CONTRIBUIR, SOU PATRIOTA!", com script de UTM do Ticto) não são abertos por nada
 * nesta página e **não** foram migrados. Só os erros de digitação foram corrigidos (possivel → possível,
 * precauçōes → precauções, como funciona os reais perigos → como funcionam os reais perigos,
 * instantâneamente → instantaneamente).
 *
 * Caminho de `fx`: `1.1.2.1.5` é o botão de compra (ver `blocks/outrolado.tsx`).
 */
const UPLOADS = "https://lp.centraldomarketing.com/wp-content/uploads";
const IMG = {
  bgDanger: `${UPLOADS}/2025/06/bg-semfundo2-5.webp`,
  bgDangerMobile: `${UPLOADS}/2025/04/bg-mobile2-outro-lado.webp`,
  bgHero: `${UPLOADS}/2023/05/Limpa-1-scaled.jpg`,
  bgHeroMobile: `${UPLOADS}/2025/04/mobile-bg-outrolado.webp`,
  bgOffer: `${UPLOADS}/2023/05/Limpa-5-scaled.jpg`,
  bgOfferMobile: `${UPLOADS}/2025/04/bg-preco-outrolado.webp`,
  bgVideo: `${UPLOADS}/2023/05/Limpa-4-scaled.jpg`,
  seal: `${UPLOADS}/2023/05/Selo-garantia-300x300.png`,
  stamps: `${UPLOADS}/2023/05/SELA-COMPRA.png`,
};

const CAROUSEL: [string, string][] = [
  ["2025/06/hacker-green-matrix-1.webp", "hacker-green-matrix (1)"],
  ["2025/04/anonimo-knowhere.webp", "anonimo-knowhere"],
  ["2025/04/codigo-pc.webp", "codigo-pc"],
  ["2025/04/3.jpg", "3"],
  ["2025/04/estudando-dark-web.webp", "estudando-dark-web"],
  ["2025/04/pc-anonimos.webp", "pc-anonimos"],
  ["2025/04/anonymus-dark.webp", "anonymus-dark"],
  ["2025/04/anonimo-sumido-dark.webp", "anonimo-sumido-dark"],
  ["2025/04/teste-image-outrolado.webp", "teste-image-outrolado"],
  ["2025/04/fear-dark-anonymus.webp", "fear-dark-anonymus"],
];

const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=3e8b2290-8148-48a5-a15f-4a20ffef9b75";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; fx?: Record<string, Fx> }
): Block => ({
  id: `ol-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

const home = [
  block("olHero", {
    badgeLabel: "ESTÁ PREPARADO?",
    badgeUrl: "#pt1",
    bg: IMG.bgHero,
    bgMobile: "",
    bgPosition: "center center",
    bgTablet: IMG.bgHeroMobile,
    buttonLabel: "descobrir",
    buttonUrl: "#pt1",
    highlight: "INTERNET",
    minHeight: 1008,
    minHeightMobile: 780,
    minHeightTablet: 1103,
    subtitle: "Você não tem ideia do que te aguarda!",
    title: "O OUTRO LADO DA",
  }),
  block(
    "olDanger",
    {
      bg: IMG.bgDanger,
      bgMobile: "",
      bgPosition: "center center",
      bgTablet: IMG.bgDangerMobile,
      buttonLabel: "Entender...",
      buttonUrl: "#pt2",
      highlight: "PERIGOSO",
      icons: [
        { icon: "users" },
        { icon: "wifi" },
        { icon: "virus" },
        { icon: "unlock" },
      ],
      list: "1 – Você navega “de maneira segura” mas é rastreado por todas as grandes corporações;\n2 – Você navega na deep web;\n3 – Você navega na dark web.",
      minHeight: 920,
      minHeightMobile: 1043,
      minHeightTablet: 1153,
      text: "Tem ideia dos riscos que você corre todos os dias? Quer mesmo continuar a navegar sem saber se proteger? A internet hoje funciona em 3 caminhos…",
      title: "A INTERNET É UM MUNDO",
    },
    { anchor: "pt1" }
  ),
  block(
    "olCuriosity",
    {
      delay: 2000,
      gap: 7,
      highlight: "outro mundo?",
      images: CAROUSEL.map(([file, alt]) => ({
        alt,
        image: `${UPLOADS}/${file}`,
      })),
      minHeight: 790,
      minHeightMobile: 0,
      minHeightTablet: 790,
      perView: 4,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 1000,
      text: "Sim, é possível navegar de maneira segura, só precisa tomar as devidas precauções. Você não precisa ser hacker para poder navegar tranquilamente, **é seu direito**!\n\nPensando nisso eu escrevi esse livro digital explicando sobre o outro lado da internet, como funcionam os reais perigos, como navegar em verdadeiro anonimato e tudo o que você precisa saber sobre esse assunto, inclusive a dark web.\n\nPara quem tem curiosidade de entender se **o que vê nos filmes é real** ou não, posso garantir que é e esclareço tudo neste livro, te explico o passo a passo para navegar seguro e poder ver todo esse outro lado.",
      title: "Qual o tamanho da sua curiosidade sobre esse",
    },
    { anchor: "pt2" }
  ),
  block("olVideo", {
    bg: IMG.bgVideo,
    bgMobile: "",
    bgPosition: "center center",
    bgTablet: "",
    minHeight: 873,
    minHeightMobile: 0,
    minHeightTablet: 365,
    poster: IMG.bgVideo,
    videoUrl: "https://player.vimeo.com/video/830588189",
  }),
  block(
    "olOffer",
    {
      bg: IMG.bgOffer,
      bgMobile: "",
      bgPosition: "center center",
      bgTablet: "",
      buttonLabel: "ADQUIRIR AGORA",
      buttonUrl: CHECKOUT,
      cardBg: "#FFFFFF",
      cardTitle: "OFERTA ESPECIAL",
      cashback: "100% de cashback instantaneamente!",
      from: "R$49,90",
      fromLabel: "DE",
      leftText: "Você está a um clique de mudar a sua percepção para sempre!",
      leftTitle: "Quanto vale a sua segurança?",
      minHeight: 1252,
      minHeightMobile: 0,
      minHeightTablet: 900,
      price: "R$37,00",
      priceLabel: "POR APENAS",
      seal: IMG.seal,
      stamps: IMG.stamps,
    },
    { fx: { "1.1.2.1.5": { enter: "pulse" } } }
  ),
  block("olFaq", {
    items: [
      {
        answer:
          "É o nome dado para uma zona da internet que não pode ser detectada facilmente pelos tradicionais motores de busca, garantindo privacidade e anonimato para os seus navegantes.",
        question: "O que é Deep web?",
      },
      {
        answer:
          "Consiste em um conjunto de sites ocultos na internet, sendo que eles só podem ser acessados por determinado navegador.",
        question: "O que é Dark web?",
      },
      {
        answer:
          "Sem uma orientação sim, mas no livro eu mostro o passo a passo para você navegar de maneira segura.",
        question: "Não sou um hacker, esses ambientes são perigosos pra mim?",
      },
      { answer: "128 páginas.", question: "Quantas páginas tem o e-book?" },
      {
        answer:
          "Não, o livro tem justamente esse intuito, te ensinar como se proteger sobre os perigos da internet.",
        question:
          "Alguém pode invadir meu computador por usar essas ferramentas?",
      },
      {
        answer:
          "Ensino da maneira mais didática possível para todos os iniciantes não terem dificuldades na aplicação do conteúdo.",
        question: "Sou leigo em tecnologia vou entender o conteúdo?",
      },
      {
        answer:
          "Assim que efetuado o pagamento você receberá o acesso instantâneo a nossa área de membros que contém o e-book.",
        question: "Como terei acesso?",
      },
    ],
    openFirst: "yes",
    title: "PERGUNTAS FREQUENTES",
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("olFooter", {
      copyright: "© SIM Intermediações — Todos os direitos reservados.",
    }),
  ],
  header: [],
  menu: [],
  name: "O Outro Lado da Internet",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "O Outro Lado da Internet – E-book",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#669C7F",
    bg: "#000000",
    dark: "#023131",
    fg: "#FFFFFF",
    fontAccent: "'Anybody', sans-serif",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Cherry Cream Soda', cursive",
    line: "#009D49",
    muted: "#FFFFFF",
    variant: "outrolado",
  },
};

export const outroLadoInternet: SiteTemplate = {
  description:
    "Página de vendas escura de e-book sobre segurança na internet: hero com floresta, alerta de riscos, carrossel de imagens, vídeo, oferta com preço de/por e garantia, e FAQ. Migrada do Central do Marketing.",
  id: "outro-lado-internet",
  name: "O Outro Lado da Internet — E-book",
  preview: IMG.bgHero,
  site,
  tags: ["Landing", "Cursos"],
};
