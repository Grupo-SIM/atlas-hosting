import type { Block, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Academia do Corte — Curso de Barbearia": página de vendas do curso de corte de cabelo (Central do Marketing /
 * SIM Intermediações — academiadocorte.centraldomarketing.com, WordPress + Hello Elementor 4.4 + Rometheme Kit, modelo
 * Canvas, página 102, kit 9), com a variante `corte`. Uma rota só (`/`); a âncora `oferta` fica no bloco de garantia +
 * oferta, para onde rolam todos os botões e os 10 links do mosaico (só o "ADQUIRIR AGORA" do cartão vai ao checkout).
 * Textos, links e imagens vêm do original (imagens ainda hospedadas lá).
 *
 * Diferenças do original: o CSS e o jQuery soltos do widget HTML do fim da página (redefinem `.pulse`) não foram migrados
 * — nenhum elemento usa a animação; as duplicatas por tela de "Garantia de Satisfação" viraram uma versão só,
 * responsiva; erros de digitação corrigidos ("família", "autoestima", "início", "Como fazer degradê"). O logo do hero e a
 * marca d'água dizem "THE DAPPER BARBERSHOP 1998" (arte de kit de template); ficam como valor padrão editável.
 * **"Técnica de Movimento c" está cortado no original** e foi mantido como está — confirmar o título certo.
 *
 * Caminhos de `fx`: ver `blocks/corte.tsx` (ordem dos filhos de cada bloco).
 */
const UPLOADS =
  "https://academiadocorte.centraldomarketing.com/wp-content/uploads";
const UP = `${UPLOADS}/2025/04`;
const REV = `${UPLOADS}/2026/05`;

const IMG = {
  banner: `${UP}/VJQBL3Ka.jpg`,
  barba: `${UP}/2GE5WB6a.jpg`,
  cansado: `${UP}/Y93KSD7a.jpg`,
  detalhamento: `${UP}/Y85T2K9a.jpg`,
  featBarbeiro: `${UP}/Q8FN6N7d.png`,
  featNavalha: `${UP}/Q8FN6N7b3.png`,
  featPerfil: `${UP}/Q8FN6N7c.png`,
  featTesoura: `${UP}/Q8FN6N7a3.png`,
  hero: `${UP}/XYDJ8QEa.jpg`,
  logo: `${UP}/Dapper-Logo.png`,
  mark: `${UP}/Dapper-Logo1.png`,
  profissionalismo: `${UP}/ZTWVMBPa.jpg`,
  sobre: `${UP}/YTFW326.jpg`,
  stamps: `${UP}/SELA-COMPRA.png`,
  tecnica: `${UP}/FKDRT4Ba.jpg`,
  videoCover: `${UP}/Y85T2K9a.jpg`,
};

const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=1e0b9e12-5d34-4a46-b5aa-d121f38deeae";
const OFFER = "#oferta";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; children?: Block[] }
): Block => ({
  id: `ac-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.children ? { children: extra.children } : {}),
});

const home: Block[] = [
  block("acHero", {
    buttonIcon: "scissors",
    buttonLabel: "QUERO APRENDER",
    buttonUrl: OFFER,
    logo: IMG.logo,
    logoAlt: "The Dapper Barbershop 1998",
    logoWidth: 90,
    minHeight: 110,
    poster: IMG.hero,
    subtitle: "Aprenda a Cortar Cabelo e Lucre Todos os Dias!",
    text: "Técnica direta, prática e lucrativa para quem quer começar AGORA!",
    title: "A Forma Mais Rápida de Ganhar Dinheiro hoje",
    veilAngle: 240,
    veilColor: "#002715",
    veilOpacity: 100,
    videoUrl: "https://www.youtube.com/watch?v=zC6zv1abdPU",
  }),
  block("acFeatures", {
    items: [
      {
        image: IMG.featTesoura,
        text: "Mesmo sem experiência, você sairá pronto para atender clientes.",
        title: "Aprenda do Zero",
      },
      {
        image: IMG.featNavalha,
        text: "Passo a passo mostrado com cliente para você aprender rapidamente.",
        title: "Técnicas Práticas",
      },
      {
        image: IMG.featBarbeiro,
        text: "Como cortar o próprio cabelo, onde atender no início e muito mais...",
        title: "Bônus Exclusivos",
      },
      {
        image: IMG.featPerfil,
        text: "Sem enrolação, conteúdo objetivo para você aplicar no mesmo dia.",
        title: "Aulas diretas",
      },
    ],
  }),
  block("acAbout", {
    button2Label: "CORTE AVANÇADO",
    button2Url: OFFER,
    buttonLabel: "CORTE BÁSICO",
    buttonUrl: OFFER,
    counters: [
      {
        from: 1,
        icon: "scissors",
        ms: 1000,
        prefix: "+",
        suffix: "",
        text: "O seu instrutor acumulou mais de 10 anos de conhecimento, técnicas e dedicação exclusiva vivendo da renda de cortes de cabelos.",
        title: "Anos de experiência",
        value: 10,
      },
      {
        from: 10,
        icon: "star",
        ms: 1000,
        prefix: "",
        suffix: "%",
        text: "Nosso método já ajudou milhares de pessoas a aprender a cortar cabelo e transformar essa habilidade em uma fonte de renda.",
        title: "taxa de satisfação",
        value: 98,
      },
    ],
    image: IMG.sobre,
    imageAlt: "Barbeiro fazendo a barba de um cliente",
    question: "Quer aprender a cortar e não sabe por onde começar?",
    text: "Cortar cabelo vai muito além de apenas aparar fios. **É uma arte.** É sobre transformar a autoestima, elevar a confiança e criar conexões com as pessoas.\nCada corte conta uma história. Cada cliente que senta na cadeira busca mais do que um novo visual – ele quer se sentir melhor, mais confiante e mais preparado para enfrentar o mundo.",
    title:
      "Curso rápido, retorno imediato – já no primeiro corte você pode se pagar",
  }),
  block("acVideo", {
    cover: IMG.videoCover,
    title: "Assista ao vídeo",
    videoUrl: "https://www.youtube.com/watch?v=HwEcKYH0UOo",
  }),
  block("acBanner", {
    align: "left",
    bg: IMG.banner,
    buttonLabel: "APRENDA A LUCRAR CORTANDO",
    buttonUrl: OFFER,
    minHeight: 40,
    title: "Método testado por mais de 3.200 alunos",
    title2: "",
    titleWidth: 50,
    veilAngle: 240,
    veilColor: "#033F21",
    veilOpacity: 50,
  }),
  block("acCurriculum", {
    closing: "e muito mais...",
    eyebrow: "O que você vai receber?",
    items: [
      { title: "Como fazer degradê" },
      { title: "Técnica de Movimento c" },
      { title: "Barba" },
      { title: "Como começar a carreira" },
      { title: "Corte com tesoura" },
      { title: "Técnica da tesoura invertida" },
      { title: "Posicionamento profissional" },
      { title: "Como lidar com as marcações" },
      { title: "Como cortar o próprio cabelo" },
      { title: "Modelagem do perfil do cliente" },
      { title: "Distribuição de pente" },
      { title: "Acabamento" },
    ],
    mark: IMG.mark,
    markOpacity: 4,
    text: "Pare de perder tempo! Veja o que você vai aprender:",
    title: "Pouca Gente Sabe: Corte de Cabelo Tá Pagando MUITO Bem!",
  }),
  block("acInstructor", {
    items: [
      {
        image: IMG.banner,
        linkLabel: "COMECE AGORA",
        title: "Equipamentos",
        url: OFFER,
      },
      {
        image: IMG.barba,
        linkLabel: "COMECE AGORA",
        title: "Barba",
        url: OFFER,
      },
      {
        image: IMG.detalhamento,
        linkLabel: "COMECE AGORA",
        title: "Detalhamento",
        url: OFFER,
      },
      {
        image: IMG.tecnica,
        linkLabel: "COMECE AGORA",
        title: "Técnica",
        url: OFFER,
      },
      {
        image: IMG.profissionalismo,
        linkLabel: "COMECE AGORA",
        title: "Profissionalismo",
        url: OFFER,
      },
    ],
    text: "Eu sou o Igor Queiroz, trabalho com barbearia desde criança. Essa paixão por cortar cabelo vem de gerações na minha família, meu avô era barbeiro, meu tio também e agora eu compartilho dessa mesma paixão por mudar a autoestima das pessoas.",
    title: "QUEM SOU EU?",
    veilAngle: 240,
    veilColor: "#002715",
    veilOpacity: 100,
  }),
  block("acBanner", {
    align: "center",
    bg: IMG.cansado,
    buttonLabel: "QUERO APRENDER",
    buttonUrl: OFFER,
    minHeight: 50,
    title: "Cansado de Ficar Sem Dinheiro?",
    title2: "Aprenda a Cortar Cabelo e Vire o Jogo Rápido!",
    titleWidth: 50,
    veilAngle: 240,
    veilColor: "#002715",
    veilOpacity: 100,
  }),
  block("acReviews", {
    delay: 4000,
    eyebrow: "Reviews",
    gap: 30,
    items: [
      {
        image: `${REV}/Lucas-Ferreira.png`,
        name: "Lucas Ferreira",
        role: "Barbeiro",
        text: "Entrei sem saber nem segurar uma tesoura, hoje tenho meu próprio estúdio. Esse curso mudou minha vida!",
      },
      {
        image: `${REV}/Marcos-Oliveira.png`,
        name: "Marcos Oliveira",
        role: "Iniciante",
        text: "Didática excelente, aulas práticas e conteúdo direto ao ponto. Consegui meus primeiros clientes ainda durante o curso!",
      },
      {
        image: `${REV}/Danilo-Costa.png`,
        name: "Danilo Costa",
        role: "Barbeiro",
        text: "Nunca imaginei que aprender a cortar cabelo poderia ser tão simples e profissional ao mesmo tempo. Super recomendo!",
      },
      {
        image: `${REV}/Rafael-Lima.png`,
        name: "Rafael Lima",
        role: "Estudante",
        text: "Achei que fosse mais um curso qualquer, mas me surpreendi! Aprendi técnicas que me colocaram à frente no mercado.",
      },
    ],
    mark: IMG.mark,
    markOpacity: 4,
    pause: "yes",
    perView: 3,
    perViewMobile: 1,
    perViewTablet: 2,
    speed: 1000,
    text: "__Transformações reais__ de quem acreditou no nosso trabalho, do iniciante ao profissional qualificado.",
    title: "O Que Dizem Nossos Alunos?",
  }),
  block(
    "acGuarantee",
    {
      aside:
        "Garanta sua vaga agora! Você está a um clique de mudar seu futuro.",
      bg: IMG.cansado,
      text: "Se em até **7 dias** você não estiver satisfeito, devolvemos **100% do seu dinheiro**, sem burocracia!",
      title: "GARANTIA DE SATISFAÇÃO",
      veilAngle: 240,
      veilColor: "#002715",
      veilOpacity: 100,
    },
    {
      anchor: "oferta",
      children: [
        block("ebookOffer", {
          accent: "#00F11E",
          bulletIcon: "square",
          bullets:
            "Entrega imediata;\nÁrea de Membros Exclusiva;\nBônus Exclusivo;",
          bulletsStyle: "plain",
          buttonFrom: "#FFFFFF",
          buttonGlow: "#44F2F2",
          buttonLabel: "ADQUIRIR AGORA",
          buttonStyle: "solid",
          buttonText: "#000000",
          buttonUrl: CHECKOUT,
          cardBg: "#033A00",
          cardBgTo: "#000000",
          cardTitle: "OFERTA EXCLUSIVA",
          cashback: "PROMOÇÃO ENCERRA EM POUCOS MINUTOS",
          cashColor: "#00CE3A",
          cashSize: 30,
          from: "R$69,99",
          fromLabel: "DE",
          fromSize: 32,
          glowColor: "#00B662",
          price: "R$47,00",
          priceLabel: "POR APENAS",
          ribbon: "MELHOR ESCOLHA",
          ribbonColor: "#FF0000",
          stamps: IMG.stamps,
          textColor: "#FFFFFF",
          titleColor: "#F7F7F7",
          titleSize: 50,
        }),
      ],
    }
  ),
  block("ebookFaq", {
    accent: "#158B50",
    answerColor: "#D5D5D5",
    bg: "#0B0B0D",
    fontFamily: "'Roboto', sans-serif",
    headingFont: "'Poppins', sans-serif",
    items: [
      {
        answer:
          "**Sim!** O curso foi feito exatamente pra quem quer começar do zero. As aulas são didáticas, passo a passo, e você vai aprender desde os fundamentos até as técnicas mais modernas. Mesmo sem nenhuma experiência, você vai conseguir acompanhar e praticar.",
        question: "Eu nunca cortei cabelo, será que consigo aprender do zero?",
      },
      {
        answer:
          "Depende da sua dedicação, mas com o nosso método você já pode começar a fazer cortes simples e treinar com confiança em poucas semanas. Com prática consistente, dá pra evoluir rápido e já começar a atender.",
        question: "Em quanto tempo vou estar cortando bem?",
      },
      {
        answer:
          "Sim! Você vai aprender cortes clássicos e modernos, incluindo degradê (fade). Tudo explicado com clareza e demonstrações práticas em modelos reais.",
        question: "O curso ensina cortes modernos como degradê?",
      },
      {
        answer:
          "Sim! Você estuda de onde quiser, no seu ritmo, com acesso ilimitado às aulas. Pode assistir no celular, computador ou tablet — quando e quantas vezes quiser.",
        question: "O curso é 100% online? Posso assistir quando quiser?",
      },
      {
        answer:
          "Você terá acesso a todas as videoaulas, atualizações futuras, bônus exclusivos, suporte e certificado. Sem mensalidades (a não ser que parcele), sem taxas extras. É uma única vez.",
        question: "O que está incluso no valor do curso?",
      },
      {
        answer:
          "Sim! Você pode usar a própria plataforma para enviar mensagens e terá acesso a nosso email.",
        question: "Terei algum tipo de suporte?",
      },
    ],
    lineColor: "#474141",
    minHeight: 500,
    minHeightMobile: 0,
    minHeightTablet: 0,
    openColor: "#FFFFFF",
    openFirst: "yes",
    textColor: "#FFFFFF",
    title: "DÚVIDAS FREQUENTES",
    titleColor: "#FFFFFF",
    titleSize: 58,
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("ebookFooter", {
      bg: "#0A0A0A",
      copyright: "© SIM Intermediações – Todos os direitos reservados.",
      fontFamily: "'Roboto', sans-serif",
      fontSize: 14,
      textColor: "#C2C2C2",
    }),
  ],
  header: [],
  menu: [],
  name: "Academia do Corte",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Academia do Corte",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#158B50",
    bg: "#0A0A0A",
    card: "#0A0A0A",
    fg: "#C2C2C2",
    fontAccent: "'Poppins', sans-serif",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Poppins', sans-serif",
    forest: "#002715",
    moss: "#033F21",
    teal: "#00CEA6",
    variant: "corte",
  },
};

export const academiaDoCorte: SiteTemplate = {
  description:
    "Página de vendas escura em preto e verde de curso de barbearia: hero com vídeo de fundo, diferenciais, contadores, vídeo, conteúdo do curso, instrutor com mosaico de fotos, depoimentos, garantia, oferta e FAQ. Migrada do Central do Marketing.",
  id: "academia-do-corte",
  name: "Academia do Corte — Curso de Barbearia",
  preview: IMG.hero,
  site,
  tags: ["Landing", "Cursos"],
};
