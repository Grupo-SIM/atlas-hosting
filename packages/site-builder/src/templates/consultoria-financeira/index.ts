import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Consultoria Financeira": página de vendas de uma consultoria financeira (Central do Marketing —
 * consultoriafinanceira.centraldomarketing.com, WordPress + Hello Elementor 4.4 + ElementsKit + Jeg Kit, modelo Canvas, página 85,
 * kit 12), com a variante `consultoria`. Uma rota só (`/`); a âncora `d1` fica na seção da oferta e todos os botões "Adquirir
 * Consultoria" / "Adquirir" rolam até ela (só o "ADQUIRIR AGORA" do cartão vai ao checkout).
 * Textos, links e imagens vêm do original (imagens ainda hospedadas lá).
 *
 * Diferenças do original: correções de digitação ("esta consultoria", "uma Renda Extra") e o caractere invisível (`U+200B`)
 * de "Alcançam Metas Financeiras em 1 Ano" removido; o cargo "Designation" dos depoimentos (texto padrão do ElementsKit,
 * escondido pelo CSS do original) **não** foi migrado; os ícones do FAQ estão na ordem certa ("+" fechado, "−" aberto; no
 * original estavam invertidos); o texto do cartão "Método Inovador" alinha com os outros três (no original ficava 10px mais
 * recuado, por sobra de edição); o "%" do 1º contador usa 3.4em no celular como os outros; o widget HTML da oferta (jQuery do
 * Google + `.pulse` que ninguém usa) não foi migrado — o botão pulsa **uma vez** ao entrar; os depoimentos são cartões fixos
 * (no original cada um é um carrossel de um slide só); os ícones são SVG próprios, equivalentes aos do original.
 * **O checkout é da Ticto e o rodapé diz "jb mídia" — foram mantidos como no original; decida se troca.**
 *
 * Caminhos de `fx` (ver `blocks/consultoria.tsx` e `blocks/ebook.tsx`): em `ebookOffer`, `1.1` é o cartão e `1.1.5` o botão de
 * compra (título, frase, de/por, preço, botão), que pulsa uma vez (sem `loop`).
 */
const UPLOADS =
  "https://consultoriafinanceira.centraldomarketing.com/wp-content/uploads";
const UP = `${UPLOADS}/2025/04`;

const IMG = {
  authorPhoto: `${UP}/brad-consultoria-financeira-expert.webp`,
  bgHero: `${UP}/70-1.png`,
  bonus1: `${UP}/anxiety-inducing-imagery-with-angst-feelings_23-2150982033.jpg`,
  bonus2: `${UP}/Image-3-1.jpg`,
  moreTexture: `${UP}/Dark-Blue-Texture-Background-10.jpg`,
  photo: `${UP}/man-with-a-laptop-in-his-hands-and-a-jacket-a-smi-2023-11-27-04-52-18-utc-1.png`,
  pill: `${UP}/Bg1.png`,
  stamps: `${UP}/SELA-COMPRA.png`,
  texture: `${UP}/68.png`,
  words: [
    ["Estratégia", `${UP}/1-1.png`],
    ["Dinheiro", `${UP}/2.png`],
    ["Liberdade", `${UP}/3.png`],
    ["Organização", `${UP}/4.png`],
    ["Resultado", `${UP}/5.png`],
  ] as [string, string][],
};

const CHECKOUT = "https://payment.ticto.app/O61B3DB33?event=InitiateCheckout";
const OFFER = "#d1";
const VIMEO = "https://vimeo.com/1095313115";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: {
    anchor?: string;
    fx?: Record<string, Fx>;
    style?: Record<string, string | number>;
  }
): Block => ({
  id: `cf-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
  ...(extra?.style ? { style: extra.style } : {}),
});

/** Entrada do original: `fadeIn` em `animated-slow` (2 s), com atraso em cascata. */
const fade = (delay: number, extra: Partial<Fx> = {}): Fx => ({
  delay,
  enter: "fadeIn",
  enterMs: 2000,
  ...extra,
});

/** Os filhos entram em sequência: o primeiro em `delay` e cada seguinte `stagger` ms depois. */
const cascade = (delay: number, stagger: number): Fx =>
  fade(delay, { each: true, stagger });

const home: Block[] = [
  block(
    "cfHero",
    {
      bg: IMG.bgHero,
      intro:
        "Consultoria adaptada à sua realidade, para você tomar decisões eficientes de maneira descomplicada.",
      pill: IMG.pill,
      playLabel: "Assistir ao vídeo",
      title: "GESTÃO *FINANCEIRA*\nFÁCIL *E SEGURA*",
      videoUrl: VIMEO,
    },
    {
      fx: {
        "1.1.1": fade(0),
        "1.1.2.1.1": fade(300),
        "1.1.2.1.2": fade(500),
        "1.1.2.1.3": fade(700),
        "1.1.2.2.1": fade(900),
        "1.1.2.2.2": fade(1100),
        "1.1.2.2.3": fade(1300),
      },
    }
  ),
  block(
    "cfStats",
    {
      items: [
        {
          label: "Alcançam Metas Financeiras em 1 Ano",
          suffix: "%",
          value: "80",
        },
        {
          highlight: "yes",
          label: "Recomendam Nossa Consultoria",
          suffix: "%",
          value: "95",
        },
        {
          label: "Redução Média de Despesas Mensais",
          suffix: "%",
          value: "30",
        },
        { label: "Satisfação dos clientes", suffix: "%", value: "98" },
      ],
      ms: 2000,
      texture: IMG.texture,
    },
    { fx: { "1.1": cascade(0, 300) } }
  ),
  block(
    "cfAbout",
    {
      authorName: "Brad",
      authorPhoto: IMG.authorPhoto,
      authorRole: "Especialista em Finanças",
      buttonLabel: "Adquirir Consultoria",
      buttonUrl: OFFER,
      items: [
        {
          icon: "eye",
          text: "Ajudaremos você a estabelecer um orçamento sólido e realista, com base no seu estilo de vida.",
          title: "Plano inicial",
        },
        {
          icon: "target",
          text: "Identificaremos áreas de melhoria, oportunidades para otimizar seus recursos e alcançar seus objetivos de longo prazo.",
          title: "Nossa Expertise",
        },
      ],
      photo: IMG.photo,
      photoAlt: "Homem sorrindo com um notebook nas mãos",
      text: "Vamos te mostrar como controlar seus gastos, sair do vermelho e finalmente ver o dinheiro render na sua mão. Você vai conquistar estabilidade financeira e, mais importante: paz de espírito para focar no que realmente importa: **__tempo__ com quem você ama**.",
      texture: IMG.texture,
      title: "Você merece uma vida financeira\n*leve* hoje ainda",
    },
    {
      fx: {
        "1.2.1": cascade(0, 300),
        "1.2.2": fade(700),
        "1.2.3.1": fade(900),
        "1.2.3.2": fade(1100),
        "1.2.5": fade(1300),
        "1.2.5.1": fade(1400),
        "1.2.5.2": fade(1500),
      },
    }
  ),
  block(
    "cfServices",
    {
      items: [
        {
          icon: "user-clock",
          text: "Nessa fase vamos te guiar para organizar a vida financeira, sair do vermelho, poupar sem esforço e aprender a fazer o salário render — sem abrir mão da rotina.",
          title: "Rotina & Processos",
        },
        {
          icon: "blocks",
          text: "Ensinaremos a aumentar seus ganhos, sem precisar trabalhar mais. Além de estratégias simples e personalizadas para fazer seu dinheiro render de verdade.",
          title: "Método Inovador",
        },
        {
          icon: "family",
          text: "Todo o planejamento para você ter o futuro que merece e fornecer uma estabilidade para sua família.",
          title: "Aposentadoria Milionária",
        },
        {
          icon: "orbit",
          text: "Iremos te entregar sistemas que otimizarão (e muito) o seu tempo, auxiliando em toda sua organização financeira.",
          title: "Ferramentas",
        },
      ],
      text: "Cada pessoa tem uma história financeira e nós temos um plano sob medida para todas elas.",
      texture: IMG.texture,
      title: "*estratégias que* funcionam na prática",
    },
    {
      fx: {
        "1.1.1": fade(0),
        "1.1.2": fade(300),
        "1.1.3": cascade(500, 200),
      },
    }
  ),
  block(
    "cfWordStrip",
    {
      items: IMG.words.map(([alt, image]) => ({ alt, image })),
    },
    { fx: { "1.1": cascade(0, 300) } }
  ),
  block(
    "cfBonus",
    {
      buttonLabel: "Adquirir Consultoria",
      buttonUrl: OFFER,
      items: [
        { image: IMG.bonus1, title: "11 Dicas para se preparar para Inflação" },
        { image: IMG.bonus2, title: "12 Problemas Psicológicos com Dinheiro" },
      ],
      linkLabel: "Adquirir",
      linkUrl: OFFER,
      moreImage: IMG.moreTexture,
      moreOpacity: 47,
      moreTitle: "e muito mais...",
      overlap: 270,
      tag: "Bônus Exclusivo",
      text: "Do caos ao controle. Do aperto à tranquilidade. Com o direcionamento certo, você conquista mais do que organização: você ganha TEMPO.",
      title: "Vários Bônus\n*exclusivos*",
    },
    {
      fx: {
        "1.1.1.1.1": fade(0),
        "1.1.1.1.2.1": fade(300),
        "1.1.1.1.2.2": fade(500),
        "1.1.1.2": cascade(700, 200),
      },
    }
  ),
  block(
    "cfTopics",
    {
      items: [
        {
          column: "left",
          icon: "contract",
          text: "Aprenda como cortar gastos desnecessários sem abrir mão do seu estilo de vida. Vamos te mostrar onde seu dinheiro está escapando e como recuperar o controle de forma prática.",
          title: "Teto diário",
        },
        {
          column: "left",
          icon: "target",
          text: "Mesmo sem experiência, você pode começar a investir com segurança e consciência. Nossas aulas te guiam do zero, sempre respeitando seus objetivos e seu momento de vida.",
          title: "Estratégias de Investimentos",
        },
        {
          column: "right",
          icon: "umbrella",
          text: "Saia do piloto automático. Com o nosso plano, você aprende a tomar decisões inteligentes com seu dinheiro, garantindo mais tranquilidade e autonomia todos os meses.",
          title: "4 passos para a Liberdade Financeira",
        },
        {
          column: "right",
          icon: "money-bag",
          text: "Descubra formas reais e sustentáveis de ganhar mais — usando suas habilidades, tempo livre e até o que você já sabe fazer. Sem promessas milagrosas, só estratégia.",
          title: "Como Criar uma Renda Extra",
        },
      ],
      linkLabel: "Adquirir consultoria",
      linkUrl: OFFER,
      text: "Temos um método único para fazer o dinheiro render na sua mão. Conheça alguns temas que são abordados:",
      title: "simples. *direto.* Eficaz.",
    },
    {
      fx: {
        "1.1.1": fade(0),
        "1.1.2": fade(300),
        "1.1.3.1": cascade(500, 200),
        "1.1.3.2": cascade(500, 200),
      },
    }
  ),
  block(
    "cfTestimonials",
    {
      buttonLabel: "Adquirir Consultoria",
      buttonUrl: OFFER,
      items: [
        {
          name: "Sofia Rosa",
          photo: `${UP}/2-1.png`,
          text: "Eu sempre achei que organizar minhas finanças era coisa pra quem entendia de números... mas com o método da Consultoria Financeira, tudo ficou leve, claro e possível. Hoje tenho paz e planejamento.",
        },
        {
          featured: "yes",
          name: "Patricia Litzzi",
          photo: `${UP}/1.png`,
          text: "Entendi que ganhar bem não adianta nada se você não souber usar. Com a consultoria, descobri como fazer o dinheiro trabalhar pra mim, mesmo com pouco.",
        },
        {
          hideTablet: "yes",
          name: "Carlos Fonseca",
          photo: `${UP}/1.jpeg`,
          text: "Eu achava que minha renda era o problema... mas percebi que era a falta de estratégia. Agora tenho reserva, metas e estou até investindo! Nunca imaginei isso.",
        },
      ],
      text: "“Eles apenas deram o primeiro passo com a estratégia certa.”",
      texture: IMG.texture,
      title: "histórias *reais,*\nResultado rápido",
    },
    {
      fx: {
        "1.1.1.1": fade(0),
        "1.1.1.2.1": fade(300),
        "1.1.1.2.2": fade(500),
        "1.1.2.1": fade(800),
        "1.1.2.2": fade(900),
        "1.1.2.3": fade(1100),
      },
    }
  ),
  block(
    "ebookOffer",
    {
      accent: "#44F2F2",
      buttonFrom: "#44F2F2",
      buttonLabel: "ADQUIRIR AGORA",
      buttonTo: "#023131",
      buttonUrl: CHECKOUT,
      cardBg: "rgba(2,1,1,.5)",
      cardTitle: "OFERTA ESPECIAL",
      cashback: "PROMOÇÃO ENCERRA EM POUCOS MINUTOS",
      cashbackStyle: "marker",
      cashSize: 29,
      fontFamily: "'Montserrat', sans-serif",
      from: "R$97,00",
      fromLabel: "DE",
      fromSize: 32,
      price: "R$47,00",
      priceLabel: "POR APENAS",
      stamps: IMG.stamps,
      textColor: "#FFFFFF",
      titleColor: "#44F2F2",
      titleSize: 43,
    },
    {
      anchor: "d1",
      // o pulso é uma vez só (sem `loop`); o original tem 50px acima do cartão
      fx: { "1.1.5": { enter: "pulse" } },
      style: { padding: "50px 0 0" },
    }
  ),
  block("ebookFaq", {
    accent: "#0EE6FF",
    answerColor: "#B0B0B0",
    bg: "#040404",
    cardColor: "#09161D",
    fontFamily: "'Roboto', sans-serif",
    headingFont: "'Titillium Web', sans-serif",
    itemStyle: "boxed",
    items: [
      {
        answer:
          "Nessa consultoria você descobrirá como aplicar técnicas e estratégias eficazes para controlar seus gastos, reduzir dívidas e aumentar suas economias, permitindo que você alcance uma saúde financeira estável, seja no seu negócio ou vida pessoal.",
        question: "Qual o foco principal da consultoria?",
      },
      {
        answer:
          "A consultoria é útil para qualquer pessoa que deseja melhorar suas finanças, independentemente do objetivo ou área de atuação. Profissionais em cargos de liderança, estudantes, profissionais de vendas, empreendedores e qualquer pessoa que deseja aprender a ter uma vida financeira estável ou melhorar sua condição atual, deve aproveitar os conceitos apresentados neste curso.",
        question: "Para quem é esta consultoria?",
      },
      {
        answer:
          "São aceitos todos os tipos de cartão, Pix, além de boleto. Compras realizadas no cartão de crédito são processadas de forma quase instantânea. Lembrando que pagamentos via boleto podem demorar até 72h para que o banco identifique e confirme o pagamento.",
        question: "Quais são as formas de pagamento?",
      },
      {
        answer:
          "Após o pagamento ser processado, você receberá um e-mail com um link para acessar nossa área de membros exclusiva.",
        question: "Após a compra, como faço para acessar a consultoria?",
      },
      {
        answer:
          "Não! Todo o material é de uso exclusivo da pessoa que fez a compra. Além disso, a plataforma possui sistema anti-pirataria. O bloqueio por suspeita de pirataria ocorre quando o sistema de segurança identifica que um usuário realizou vários acessos de uma mesma compra por meio de IP’s/Redes diferentes.",
        question: "Posso compartilhar o meu acesso com outras pessoas?",
      },
      {
        answer:
          "Sim, oferecemos uma garantia de 7 dias. Se, por qualquer motivo, você não estiver satisfeito(a) com o conteúdo, entre em contato conosco dentro desse período e providenciaremos o reembolso completo do valor pago.",
        question: "Existe alguma garantia?",
      },
      {
        answer:
          "Você pode usar a própria plataforma para enviar mensagens e/ou mandar e-mail.",
        question: "Como será o suporte de dúvidas?",
      },
    ],
    lineColor: "#FFFFFF17",
    minHeight: 0,
    minHeightMobile: 0,
    minHeightTablet: 0,
    openFirst: "yes",
    openLine: "#0EE6FF36",
    textColor: "#FFFFFF",
    title: "perguntas\n*frequentes*",
    titleColor: "#FFFFFF",
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("ebookFooter", {
      bg: "#12151A",
      copyright: "Todos os direitos reservados jb mídia.",
      fontFamily: "'Titillium Web', sans-serif",
      fontSize: 15,
      textColor: "#FFFFFF",
      textMargin: 30,
    }),
  ],
  header: [],
  menu: [],
  name: "Consultoria Financeira",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Consultoria Financeira",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#0EE6FF",
    bg: "#040404",
    card: "#12151A",
    fg: "#B0B0B0",
    fontAccent: "'Titillium Web', sans-serif",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Titillium Web', sans-serif",
    glow: "#4CC9F03B",
    hair: "#FFFFFF17",
    line: "#0EE6FF36",
    night: "#101620",
    petrol: "#05282C",
    variant: "consultoria",
  },
};

export const consultoriaFinanceira: SiteTemplate = {
  description:
    "Página de vendas escura em azul-petróleo e ciano para consultoria financeira: hero com tipografia serifada itálica e vídeo, números, serviços, bônus, temas, depoimentos, oferta e FAQ. Migrada do Central do Marketing.",
  id: "consultoria-financeira",
  name: "Consultoria Financeira",
  preview: IMG.moreTexture,
  site,
  tags: ["Landing", "Negócios"],
};
