import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "VSL Milionário — E-book": página de vendas de ebookvslmilionario.centraldomarketing.com (WordPress + Hello
 * Elementor 4.4, modelo Canvas, página 109), com a variante `vslmilionario`. Uma rota só (`/`); `oferta` é a âncora do
 * cartão de oferta, para onde rolam os 9 botões "Adquirir Agora". Textos, links e imagens vêm do original (imagens ainda
 * hospedadas lá). Erros de digitação corrigidos: "IMPOSSÍVEL", "sequência", "vídeo", "vídeos". O texto "Desconto de 16%
 * agora!" é o do original, embora o preço caia de R$497,00 para R$247,00 (≈ 50%).
 *
 * Caminhos de `fx` (ver `blocks/vslmilionario.tsx` e `blocks/ebook.tsx`): em `ebookOffer`, `1.1` é o cartão e `1.1.7` o
 * botão de compra (título, frase, de/por, preço, desconto, lista, botão).
 */
const UPLOADS =
  "https://ebookvslmilionario.centraldomarketing.com/wp-content/uploads";
const UP = `${UPLOADS}/2025/04`;

const IMG = {
  bgHeader: `${UP}/bg_header.png`,
  bgHero: `${UP}/bg-principal-vsl-milionario.webp`,
  // O nome do arquivo no WordPress começa com "´" (%C2%B4).
  bgHeroMobile: `${UP}/%C2%B4-1080-x-1920-px-1-scaled.webp`,
  bgImg: `${UP}/bg_img.png`,
  graphs: `${UP}/back-view-of-young-man-watching-graphs-on-monitors.jpg`,
  lens: `${UP}/changing-camera-lens-aperture.jpg`,
  memphis: `${UP}/img_memphis.png`,
  memphis2: `${UP}/img_memphis2.png`,
  method: `${UP}/back-vsl-1.png`,
  poster: `${UP}/male-videographer-edits-and-cuts-footage-and-sound-on-his-person-1.jpg`,
};

const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=1f28bcba-cb39-43d1-aeef-9bf12e827df4";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; fx?: Record<string, Fx> }
): Block => ({
  id: `vm-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

/** Entrada do Elementor: 1,25 s. */
const enter = (effect: NonNullable<Fx["enter"]>, delay?: number): Fx => ({
  ...(delay ? { delay } : {}),
  enter: effect,
  enterMs: 1250,
});

const home: Block[] = [
  block(
    "vmHero",
    {
      bg: IMG.bgHero,
      bgMobile: IMG.bgHeroMobile,
      bgPosition: "100% 0",
      bgPositionMobile: "center",
      bgPositionTablet: "87% 0",
      bgTablet: IMG.bgHero,
      buttonLabel: "Adquirir Agora",
      buttonUrl: "#oferta",
      subtitle: "E a maioria desperdiça esse tempo",
      title: "Você tem apenas 8 segundos para vender…",
    },
    { fx: { "1.1.1": enter("fadeInLeft") } }
  ),
  block(
    "vmHighlights",
    {
      items: [
        {
          icon: "play",
          text: "O passo a passo que transformou vídeos comuns em VSL's milionários.",
          title: "Estrutura Validada",
        },
        {
          icon: "video",
          text: "Copys, gatilhos mentais e scripts prontos para acelerar vendas.",
          title: "Fórmula de Conversão",
        },
        {
          icon: "camera",
          text: "Você aplica hoje e já sente a diferença nos seus resultados.",
          title: "Aplicação Imediata",
        },
      ],
    },
    {
      fx: {
        "1.1.1.1": enter("fadeInUp"),
        "1.1.1.2": enter("fadeInUp", 200),
        "1.1.1.3": enter("fadeInUp", 400),
      },
    }
  ),
  block(
    "vmMethod",
    {
      buttonLabel: "Adquirir Agora",
      buttonUrl: "#oferta",
      eyebrow: "o poder de persuadir",
      image: IMG.method,
      overlayImage: IMG.memphis2,
      overlayOpacity: 50,
      overlayPosition: "bottom left",
      overlaySize: "250px",
      poster: IMG.poster,
      text: [
        "Chega de vídeos sem mecanismos validados. Se você já tentou vender com vídeo e não teve resultado, é porque faltava o passo a passo…",
        "Este e-book entrega exatamente isso: uma linha estratégica clara, com início, meio e fim.",
        "Roteiro persuasivo, envolvente e com dezenas de gatilhos ativados na hora certa. Tudo o que um vídeo precisa pra convencer, engajar e vender, sem enrolação.",
      ].join("\n"),
      title: "O Método por trás dos VSL's que Realmente Vendem",
      videoFrame: 12,
      videoRatio: "4/3",
      videoUrl: "https://player.vimeo.com/video/1088175788",
    },
    {
      fx: {
        "1.1.1": enter("fadeInLeft"),
        "1.1.2.1": enter("fadeInRight"),
        "1.1.2.2": enter("fadeInLeft", 200),
      },
    }
  ),
  block(
    "vmFeatures",
    {
      buttonLabel: "Adquirir Agora",
      buttonUrl: "#oferta",
      eyebrow: "O Que entregamos?",
      items: [
        {
          image: `${UP}/9.png`,
          text: "Métodos que convencem qualquer pessoa com base em segurança e credibilidade.",
          title: "Técnica de vendas",
        },
        {
          image: `${UP}/7.png`,
          text: "Imagens, como selecioná-las, sequência e muito mais. Falaremos de todas as etapas de um mecanismo validado.",
          title: "Regras de edição",
        },
        {
          image: `${UP}/4.png`,
          text: "Vendas comprovadas pela Clickbank e Digistore24.",
          title: "+10 VSL que venderam +1M de dólares (cada uma)",
        },
        {
          image: `${UP}/Asset-11.png`,
          text: "Como um jogo… Aprenda a construir uma proposta tão lógica e desejável que o lead vai sentir que seria um erro não comprar o que você está oferecendo.",
          title: "Oferta Irresistível",
        },
        {
          image: `${UP}/2.png`,
          text: "Passo a passo do que fazer e como fazer para a estrutura do VSL ficar persuasivo, convincente e engajado.",
          title: "Roteiro completo",
        },
        {
          image: `${UP}/5.png`,
          text: "Os detalhes importam! Entregaremos cores, fonte, tamanho, posição do eixo e muitas outras especificidades para você passar ao editor ou editar por conta própria.",
          title: "Regras de formatação",
        },
      ],
      title: "Literalmente os Segredos Revelados",
    },
    {
      fx: {
        "1.1": enter("fadeIn", 200),
        "1.2.1": enter("fadeIn", 400),
        "1.2.2": enter("fadeIn", 400),
        "1.2.3": enter("fadeIn", 400),
        "1.2.4": enter("fadeIn", 600),
        "1.2.5": enter("fadeIn", 600),
        "1.2.6": enter("fadeIn", 600),
      },
    }
  ),
  block(
    "vmStats",
    {
      counters: [
        { label: "Downloads do Método", suffix: "K+", value: "10" },
        { label: "Vídeos criados", suffix: "K+", value: "6" },
        { label: "Avaliação média", suffix: "", value: "4.9" },
        { label: "estratégias entregues", suffix: "+", value: "16" },
      ],
      decimalSep: ".",
      overlayImage: IMG.graphs,
      overlayOpacity: 30,
      overlayPosition: "bottom center",
      overlaySize: "cover",
      text: "Empreendedores, afiliados, copywriters e infoprodutores estão aplicando o passo a passo do VSL Milionário para criar vídeos que vendem… e os números só crescem.",
      title: "+10 mil profissionais já aceleraram seus resultados",
    },
    {
      fx: {
        "1.1.1": enter("fadeInLeft"),
        "1.1.2": enter("fadeInRight"),
        "2": enter("fadeInUp"),
      },
    }
  ),
  block(
    "vmBenefits",
    {
      eyebrow: "Máximo resultado",
      items: [
        {
          icon: "certificate",
          text: "Estruture seu VSL com elementos que geram confiança imediata, posicionando sua oferta como profissional e confiável.",
          title: "+ Credibilidade",
        },
        {
          icon: "video",
          text: "Aprenda a criar narrativas envolventes que falam direto com a dor do seu público, despertando atenção genuína e construindo empatia nos primeiros segundos do vídeo.",
          title: "+ Conexão",
        },
        {
          icon: "play",
          text: "Elimine objeções antes mesmo que elas surjam. Saiba como apresentar sua proposta com clareza, honestidade e sem parecer que está apenas tentando “vender algo”.",
          title: "+ Transparência",
        },
        {
          icon: "money",
          text: "Transforme seu VSL em um vídeo que convence, engaja e tem uma chamada à ação irresistível. Todos passados por players que faturam mais de 1M por mês.",
          title: "+ Conversão",
        },
      ],
      overlayImage: IMG.bgHeader,
      overlayOpacity: 50,
      overlayPosition: "top left",
      overlaySize: "auto",
      title: "ALTA CONVERSÃO",
    },
    {
      fx: {
        "1.1": enter("fadeInUp"),
        "1.2.1": enter("fadeInUp", 200),
        "1.2.2": enter("fadeInUp", 200),
        "1.2.3": enter("fadeInUp", 400),
        "1.2.4": enter("fadeInUp", 400),
      },
    }
  ),
  block(
    "vmBonus",
    {
      buttonLabel: "Adquirir Agora",
      buttonUrl: "#oferta",
      eyebrow: "Achou que era só isso?",
      items: [
        {
          image: `${UP}/3.png`,
          text: "O vídeo de vendas de 3 minutos que me gerou 60 mil reais: Como criar VSL de forma Profissional - Hugo Henrique",
          title: "60 mil em 3 minutos?",
        },
        {
          image: `${UP}/7.png`,
          text: "Como gravar um vídeo de vendas que converte - Daniel Hansau",
          title: "Copywriting para Vídeo",
        },
        {
          image: `${UP}/9.png`,
          text: "Como fazer vídeos que vendem muito qualquer produto - Rafael Lima",
          title: "Criativo de Alta Conversão",
        },
      ],
      overlayImage: IMG.bgImg,
      overlayOpacity: 50,
      overlayPosition: "bottom center",
      overlaySize: "cover",
      text: "Comprovados na prática por especialistas de marketing digital.",
      title: "BÔNUS EXCLUSIVOS",
    },
    {
      fx: {
        "1.1.1": enter("fadeInLeft"),
        "1.1.2.1": enter("fadeInRight", 200),
        "1.1.2.2": enter("fadeInRight", 400),
        "1.1.2.3": enter("fadeInRight", 600),
      },
    }
  ),
  block(
    "vmGuarantee",
    {
      eyebrow: "E se eu não gostar?",
      overlayImage: IMG.lens,
      overlayOpacity: 30,
      overlayPosition: "center",
      overlaySize: "cover",
      text: "Mas, caso por algum motivo você não esteja completamente satisfeito com os resultados do nosso conteúdo, você tem 7 dias para solicitar a devolução. Ao fazer isso, reembolsaremos integralmente o valor investido.",
      title: "É IMPOSSÍVEL!",
    },
    { fx: { "1.1.1": enter("fadeIn", 200) } }
  ),
  block(
    "ebookOffer",
    {
      accent: "#FD0988",
      borderColor: "#FFFFFF2B",
      bullets: "Entrega imediata;\nParcela em até 12x.",
      buttonFrom: "#FD0988",
      buttonLabel: "ADQUIRIR AGORA",
      buttonShape: "pill",
      buttonTo: "#7237BD",
      buttonUrl: CHECKOUT,
      cardBg: "#FFFFFF",
      cardTitle: "Oferta Exclusiva",
      cashback: "R$250,00 de cashback instantaneamente",
      cashbackStyle: "text",
      discount: "Desconto de 16% agora!",
      dividerColor: "#F8F8F8",
      fontFamily: "'Inter', sans-serif",
      from: "R$497,00",
      fromInline: "yes",
      fromLabel: "DE:",
      padBottom: 132,
      padBottomMobile: 48,
      padBottomTablet: 48,
      price: "R$247,00",
      priceLabel: "",
      pullUp: 91,
      sectionBg: "#252831",
      sectionImage: IMG.memphis,
      stamps: "",
      textColor: "#252831",
      titleFont: "'Poppins', sans-serif",
      variant: "light",
      veilFrom: "#252831CC",
      veilTo: "#191C26",
    },
    {
      anchor: "oferta",
      fx: { "1.1": enter("zoomIn"), "1.1.7": { enter: "pulse" } },
    }
  ),
  block(
    "vmTestimonials",
    {
      delay: 5000,
      eyebrow: "TRANSFORMAÇÕES REAIS",
      gap: 35,
      items: [
        {
          image: `${UP}/4-1.png`,
          name: "Marcos Ribeiro",
          role: "Head Copywriter",
          text: "Achei que era só mais um e-book qualquer... Mas esse material virou meu guia. Apliquei 8 dos 15 passos e meu VSL já teve 3x mais conversões que o anterior.",
        },
        {
          image: `${UP}/5-1.png`,
          name: "Eliza Marques",
          role: "Empreendedora digital e infoprodutora",
          text: "Eu já comprei muita coisa sobre copy e VSL... mas esse e-book me fez finalmente enxergar onde estava errando. Agora tenho um roteiro redondo, com começo, meio e fim. E o melhor: vende!",
        },
        {
          image: `${UP}/3-1.png`,
          name: "Enzo Torres",
          role: "Estrategista Digital",
          text: "Já trabalhei em vários lançamentos, mas esse e-book me ajudou a organizar melhor minha estrutura. É direto, prático e realmente funciona.",
        },
        {
          image: `${UP}/1-1.png`,
          name: "Carlos Meirelles",
          role: "Gestor de tráfego e copywriter",
          text: "Eu sempre travava na hora de montar o roteiro do meu VSL. Depois que li esse e-book, entendi exatamente o que estava faltando. Segui os passos, lancei minha oferta e bati R$ 127 mil em 7 dias!",
        },
        {
          image: `${UP}/6-1.png`,
          name: "Fernanda Lopes",
          role: "Co-fundadora de agência de lançamentos",
          text: "É como se o autor pegasse na sua mão e dissesse: ‘escreve isso aqui e faz isso agora’. Pra quem procrastina ou trava na frente da tela em branco, esse e-book é um salva-vidas!",
        },
        {
          image: `${UP}/2-1.png`,
          name: "Bruno Vasconcelos",
          role: "Produtor digital iniciante",
          text: "Eu nunca tinha feito um vídeo de vendas e já estava quase desistindo. Com esse e-book, segui os 15 passos como um checklist. Meu primeiro vídeo rodou, e as vendas vieram logo na primeira semana.",
        },
      ],
      overlay2Image: IMG.memphis2,
      overlay2Opacity: 50,
      overlay2Position: "top left",
      overlay2Size: "100px",
      overlayImage: IMG.memphis2,
      overlayOpacity: 50,
      overlayPosition: "bottom right",
      overlaySize: "250px",
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
      title: "Quem já teve resultados",
    },
    { fx: { "1.1": enter("fadeIn", 200), "1.2": enter("fadeIn", 200) } }
  ),
  block(
    "ebookFaq",
    {
      accent: "#FD0988",
      answerColor: "#FFFFFF",
      bg: "#191C26",
      columns: 2,
      eyebrow: "FAQ",
      fontFamily: "'Inter', sans-serif",
      headingFont: "'Poppins', sans-serif",
      iconSide: "right",
      itemStyle: "cards",
      items: [
        {
          answer:
            "Nessa obra você descobrirá como aplicar na prática as principais técnicas usadas por grandes players na criação de uma VSL que obtém resultados absurdos, de maneira direta, indo muito além do que você está acostumado(a) a ver.",
          question: "Qual o foco principal do e-book?",
        },
        {
          answer:
            "O seu acesso ao e-book é vitalício, ou seja, você pode acessar quando, a hora e quantas vezes quiser para sempre.",
          question: "Por quanto tempo terei acesso ao e-book?",
        },
        {
          answer:
            "Após o pagamento ser processado, você receberá um e-mail com um link onde você poderá acessar o e-book em uma área de membros exclusiva.",
          question: "Como faço para acessar?",
        },
        {
          answer:
            "Não! Todo o material é de uso exclusivo da pessoa que fez a compra. Além disso, a plataforma possui sistema anti-pirataria. O bloqueio por suspeita de pirataria ocorre quando o sistema de segurança identifica que um usuário realizou vários acessos de uma mesma compra por meio de IP’s/Redes diferentes.",
          question: "Posso compartilhar o meu acesso com outras pessoas?",
        },
        {
          answer:
            "São aceitos todos os tipos de cartão, Pix, além de boleto. Compras realizadas no cartão de crédito são processadas de forma quase instantânea. Lembrando que pagamentos via boleto podem demorar até 72h para que o banco identifique e confirme o pagamento.",
          question: "Quais são as formas de pagamento?",
        },
        {
          answer:
            "Sim! Você pode usar a própria plataforma para enviar mensagens.",
          question: "Terei algum tipo de suporte?",
        },
      ],
      lineColor: "#FFFFFF2B",
      minHeight: 0,
      minHeightMobile: 0,
      minHeightTablet: 0,
      openFirst: "yes",
      textColor: "#FFFFFF",
      title: "Dúvidas Frequentes",
    },
    {
      fx: {
        "1.1": enter("fadeIn", 200),
        "1.2.1": enter("fadeInLeft"),
        "1.2.2": enter("fadeInRight"),
      },
    }
  ),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("ebookFooter", {
      bg: "#191C26",
      bgImage: IMG.bgImg,
      copyright: "© SIM Intermediações — Todos os direitos reservados.",
      divider: "yes",
      dividerColor: "#FFFFFF2B",
      fontSize: 13,
      roomy: "yes",
      textColor: "#FFFFFF",
    }),
  ],
  header: [],
  menu: [],
  name: "VSL Milionário",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "E-book VSL Milionário",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#FD0988",
    bg: "#191C26",
    card: "#252831",
    fg: "#FFFFFF",
    fontAccent: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontHeading: "'Poppins', sans-serif",
    glass: "#FFFFFF2B",
    muted: "#C5C5C5",
    night: "#070B20",
    night2: "#16163C",
    variant: "vslmilionario",
    violet: "#7237BD",
  },
};

export const vslMilionario: SiteTemplate = {
  description:
    "Página de vendas escura em azul-noite e magenta de e-book sobre vídeos de vendas: hero com laptop, método com vídeo, cartões de vidro, números animados, bônus, garantia, oferta, depoimentos em carrossel e FAQ em duas colunas. Migrada do Central do Marketing.",
  id: "vsl-milionario",
  name: "VSL Milionário — E-book",
  preview: IMG.bgHero,
  site,
  tags: ["Landing", "Cursos"],
};
