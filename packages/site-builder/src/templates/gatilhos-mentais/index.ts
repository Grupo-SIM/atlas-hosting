import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Gatilhos Mentais — E-book": página de vendas do e-book "Gatilhos Mentais" (Central do Marketing / SIM
 * Intermediações — ebookgatilhosmentais.centraldomarketing.com, WordPress + Hello Elementor 4.4 + Jeg Elementor Kit,
 * modelo Canvas, página 81, kit 10), com a variante `gatilhos`. Uma rota só (`/`); `d1` é a âncora do título da seção da oferta ("MUDE SEU JOGO", logo acima do cartão),
 * para onde rolam todos os botões "Adquirir agora" e os links dos bônus (só o botão do cartão vai ao checkout).
 * Textos, links e imagens vêm do original (imagens ainda hospedadas lá).
 *
 * Diferenças do original: a imagem `Gatilho-1.png` da seção "Persuasão" não existe no servidor (devolve HTML) e por isso
 * não aparece no original — **não** foi incluída; o botão de play e o link "ASSISTA ESSE VÍDEO" abrem o mesmo popup do
 * Vimeo (no original o texto é um link para a página do Vimeo); o "Saber Mais" do hover dos gatilhos não tem destino no
 * original e aponta para `#d1`; erros de digitação corrigidos ("INSTANTANEAMENTE", "distância", "sucesso (Só leva 7 dias)
 * – Dr.").
 *
 * Caminhos de `fx` (ver `blocks/gatilhos.tsx` e `blocks/ebook.tsx`): em `ebookOffer`, `1.1` é o cartão e `1.1.5` o botão
 * de compra (título, frase, de/por, preço, botão), que pulsa sem parar (`loop`).
 */
const UPLOADS =
  "https://ebookgatilhosmentais.centraldomarketing.com/wp-content/uploads";
const UP = `${UPLOADS}/2025/04`;

const IMG = {
  bgHero: `${UP}/image_fx-1.png`,
  bgHeroMobile: `${UP}/bg-mobile-eook-gatilhos.webp`,
  bgHeroTablet: `${UP}/bg1-gatilhos-mentais.webp`,
  bonus3: `${UP}/gatilho-3.png`,
  bonus4: `${UP}/gatilho-4.png`,
  bonus5: `${UP}/gatilho-5.png`,
  guarantee: `${UP}/7dias-garantia.webp`,
  persuasao: `${UP}/image_fx-56-1024x717.webp`,
  stamps: `${UP}/SELA-COMPRA.png`,
  trigAntecipacao: `${UP}/imagem-fx-3.png`,
  trigCuriosidade: `${UP}/ChatGPT-Image-7-de-abr.-de-2025-18_15_23.webp`,
  trigEscassez: `${UP}/ChatGPT-Image-7-de-abr.-de-2025-18_23_34.webp`,
  trigTransformacao: `${UP}/image_fx.png`,
};

const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=1a2157e7-8ded-4c4f-a747-68ddba23cf04";
const OFFER = "#d1";
const VIMEO = "https://vimeo.com/827825930";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; fx?: Record<string, Fx> }
): Block => ({
  id: `gm-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

/** Entrada do Elementor: 1,25 s. */
const enter = (
  effect: NonNullable<Fx["enter"]>,
  extra: Partial<Fx> = {}
): Fx => ({
  ...extra,
  enter: effect,
  enterMs: 1250,
});

/** Os 4 itens entram em sequência: 200, 400, 600 e 800 ms. */
const sequence = (effect: NonNullable<Fx["enter"]>): Fx =>
  enter(effect, { delay: 200, each: true, stagger: 200 });

const home: Block[] = [
  block("gmHero", {
    bg: IMG.bgHero,
    bgMobile: IMG.bgHeroMobile,
    bgTablet: IMG.bgHeroTablet,
    buttonLabel: "Adquirir agora",
    buttonUrl: OFFER,
    counterLabel: "Gatilhos Mentais",
    counterPrefix: "+",
    counterValue: 24,
    highlight: "Copywriting e das Palavras que Vendem",
    text: "Você descobrirá como aplicar na prática +24 gatilhos no seu negócio, de maneira direta, indo muito além de uma simples comunicação de vendas.",
    title: "Descubra todo o poder do",
    videoLabel: "ASSISTA ESSE VÍDEO",
    videoUrl: VIMEO,
  }),
  block(
    "gmFeatures",
    {
      highlight: "Sua forma de vender",
      items: [
        {
          icon: "lightbulb",
          text: "Exemplos aplicáveis para você começar a utilizar gatilhos mentais ainda hoje no seu negócio.",
          title: "Aprendizado rápido",
        },
        {
          icon: "chat",
          text: "Entenda como agir de forma persuasiva para prender atenção, despertar desejos e gerar interesses.",
          title: "Comunicação Precisa",
        },
        {
          icon: "check",
          text: "Técnicas testadas e validadas por especialistas para aumentar suas conversões.",
          title: "Gatilhos Comprovados",
        },
        {
          icon: "brain",
          text: "Conteúdo desenvolvido com base em artigos científicos e estudos aprofundados sobre o comportamento humano.",
          title: "100% Baseado na Neurociência",
        },
      ],
      text: "Estratégias comprovadas para construir um negócio sólido, explorando de forma ética e inteligente todo o potencial da mente humana.",
      title: "Transformando",
    },
    { fx: { "1.1.1": enter("fadeInUp"), "1.1.3": sequence("fadeInUp") } }
  ),
  block(
    "gmTrustStrip",
    {
      after: "de quem vive de vendas",
      highlight: "Confiança",
      items: [
        { icon: "target", label: "objetivo e dinâmico" },
        { icon: "check", label: "Domínio e Confiança" },
        { icon: "star", label: "Como agir no dia a dia" },
        { icon: "video", label: "Aulas bônus em vídeo" },
      ],
      title: "",
    },
    {
      fx: {
        "1.1.1": enter("fadeInLeft"),
        "1.1.2.1.1": { hover: "pulse" },
        "1.1.2.2.1": { hover: "pulse" },
        "1.1.2.3.1": { hover: "pulse" },
        "1.1.2.4.1": { hover: "pulse" },
      },
    }
  ),
  block("gmSplit", {
    buttonLabel: "Adquirir agora",
    buttonUrl: OFFER,
    highlight: "Persuasão",
    image: IMG.persuasao,
    imageAlt: "Palestrante diante de um público, com um cérebro holográfico",
    text: "Evite ser manipulado na internet e aprenda como usar a persuasão para impactar decisões de forma consciente.",
    title: "Domine a Arte da",
  }),
  block("gmTriggers", {
    after: "imediata",
    buttonLabel: "Adquirir agora",
    buttonUrl: OFFER,
    highlight: "Desejo e Urgência",
    items: [
      {
        icon: "timer",
        image: IMG.trigEscassez,
        text: "Quanto menos disponível algo está, mais valioso ele se torna.",
        title: "Escassez",
      },
      {
        icon: "loader",
        image: IMG.trigTransformacao,
        text: "Ver uma transformação desperta a necessidade de agir.",
        title: "Transformação",
      },
      {
        icon: "clock",
        image: IMG.trigAntecipacao,
        text: "Quando as pessoas aguardam algo com expectativa, elas se envolvem mais.",
        title: "Antecipação",
      },
      {
        icon: "",
        image: IMG.trigCuriosidade,
        text: "Prende a atenção e mantém as pessoas engajadas até descobrirem a resposta.",
        title: "Curiosidade",
      },
    ],
    linkLabel: "Saber Mais",
    linkUrl: OFFER,
    text: "Aprenda a dominar os principais gatilhos mentais que influenciam o comportamento de compra e descubra como utilizá-los estrategicamente para impulsionar os resultados do seu negócio.",
    title: "Gatilhos que geram",
  }),
  block("gmBonus", {
    buttonLabel: "Adquirir agora",
    buttonUrl: OFFER,
    highlight: "Exclusivos",
    items: [
      {
        image: IMG.bonus3,
        text: "Os gatilhos que fazem parte de você e quem sabe usá-los tem o controle dos resultados.",
        title:
          "Reprogramar seu cérebro para o sucesso (Só leva 7 dias) – Dr. Joe Dispenza",
      },
      {
        image: IMG.bonus4,
        text: "Descubra como o inconsciente toma essas decisões.",
        title: "Por que manipular você é tão FÁCIL? – Dan Ariely",
      },
      {
        image: IMG.bonus5,
        text: "A maioria das decisões que a gente toma não são lógicas, entenda os detalhes.",
        title:
          "6 Truques de manipulação antiéticos que deveriam ser ilegais! – Roberto Cialdini",
      },
    ],
    linkLabel: "Adquirir agora",
    linkUrl: OFFER,
    stairs: 163,
    stairs3: 24,
    text: "Descubra técnicas avançadas para vender mais todos os dias!",
    title: "Bônus",
  }),
  block(
    "gmReviews",
    {
      counters: [
        { icon: "brain", label: "Gatilhos", prefix: "+", value: 24 },
        { icon: "book", label: "Páginas de Conteúdo", prefix: "+", value: 38 },
        { icon: "money", label: "Vendas", prefix: "+", value: 9000 },
        { icon: "medal", label: "Dias de Garantia", prefix: "", value: 7 },
      ],
      delay: 3500,
      gap: 30,
      items: [
        {
          image: `${UP}/SOCI-1.png`,
          name: "Gabriel Martins",
          text: "Realmente você precisa entender esses conceitos para trabalhar com vendas e aqui você vai encontrar os principais gatilhos mentais do dia a dia para aprender no detalhe.",
        },
        {
          image: `${UP}/SOCI-2.png`,
          name: "Raquel Freitas",
          text: "Conteúdo excelente! São muitos gatilhos valiosos para entendermos os pilares essenciais de Marketing e Vendas de forma simples.",
        },
        {
          image: `${UP}/SOCI-3.png`,
          name: "Raimundo Molina",
          text: "Já tinha recebido indicações deste ebook e finalmente consegui lê-lo. Ebook de fácil leitura, bem objetivo para quem pretende utilizá-lo nas vendas e no marketing.",
        },
        {
          image: `${UP}/SOCI-4.png`,
          name: "Fabiana Souza",
          text: "Gostei do conteúdo e das dicas. Traz atenção algumas técnicas sutis, importantes para o dia a dia. Recomendo!",
        },
      ],
      pause: "yes",
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
      title: "REVIEWS",
    },
    { fx: { "1.1.3": sequence("fadeInUp") } }
  ),
  block(
    "gmHeading",
    {
      highlight: "JOGO",
      padBottom: 105,
      padTop: 8,
      padTopTablet: 60,
      text: "Já imaginou vender mais só mudando algumas palavras no seu anúncio?",
      title: "MUDE SEU",
    },
    { anchor: "d1" }
  ),
  block(
    "ebookOffer",
    {
      accent: "#44F2F2",
      airy: "yes",
      buttonFrom: "#44F2F2",
      buttonLabel: "ADQUIRIR AGORA",
      buttonTo: "#023131",
      buttonUrl: CHECKOUT,
      cardBg: "rgba(0,0,0,.5)",
      cardTitle: "OFERTA ESPECIAL",
      cashback: "100% DE CASHBACK INSTANTANEAMENTE",
      cashbackStyle: "marker",
      cashSize: 29,
      fontFamily: "'Montserrat', sans-serif",
      from: "R$37,00",
      fromLabel: "DE",
      padBottom: 118,
      padBottomMobile: 80,
      padBottomTablet: 80,
      price: "R$19,90",
      priceLabel: "POR APENAS",
      stamps: IMG.stamps,
      textColor: "#FFFFFF",
      titleColor: "#44F2F2",
    },
    { fx: { "1.1.5": { enter: "pulse", loop: true } } }
  ),
  block("gmGuarantee", {
    buttonLabel: "Adquirir agora",
    buttonUrl: OFFER,
    highlight: "100% SEGURA",
    image: IMG.guarantee,
    imageAlt: "Selo de 7 dias de garantia",
    text: "Acreditamos no que entregamos, mas se não for pra você, devolvemos seu investimento em até 7 dias.",
    title: "COMPRA",
  }),
  block("ebookFaq", {
    accent: "#44F2F2",
    answerColor: "#FFFFFFB8",
    bg: "#000C14",
    fontFamily: "'Inter', sans-serif",
    headingFont: "'Orbitron', sans-serif",
    items: [
      {
        answer:
          "Nessa obra você descobrirá como aplicar na prática mais de 24 gatilhos no seu negócio e no seu dia a dia, de maneira direta, indo muito além de uma comunicação normal.",
        question: "Qual o foco principal do e-book?",
      },
      {
        answer:
          "Sim, a aplicação desses gatilhos tem foco em vendas, mas pode ser usado em todas as áreas da sua vida.",
        question: "O conteúdo ensinado pode ser aplicado em qualquer área?",
      },
      {
        answer:
          "Não! Todo o material é de uso exclusivo da pessoa que fez a compra. Além disso, a plataforma possui sistema anti-pirataria. O bloqueio por suspeita de pirataria ocorre quando o sistema de segurança identifica que um usuário realizou vários acessos de uma mesma compra por meio de IP’s/Redes diferentes.",
        question: "Posso compartilhar o meu login com outras pessoas?",
      },
      {
        answer:
          "São aceitos todos os tipos de cartão, Pix, além de boleto. Compras realizadas no cartão de crédito são processadas de forma quase instantânea. Lembrando que pagamentos via boleto podem demorar até 72h para que o banco identifique e confirme o pagamento.",
        question: "Quais são as formas de pagamento?",
      },
      {
        answer:
          "Sim! Se acontecer qualquer tipo de problema com o material estamos a um e-mail de distância.",
        question: "Terei algum tipo de suporte?",
      },
      {
        answer:
          "Sim, consegue! Todo conteúdo ensinado pode ser aplicado em qualquer área da sua vida.",
        question: "Eu consigo aplicar o conteúdo para minha imagem pessoal?",
      },
    ],
    minHeight: 500,
    minHeightMobile: 0,
    minHeightTablet: 0,
    openFirst: "yes",
    padBottom: 74,
    padTop: 55,
    textColor: "#D1D1D1",
    title: "DÚVIDAS FREQUENTES",
    titleSize: 36,
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("ebookFooter", {
      bg: "#032831",
      copyright: "© SIM Intermediações — Todos os direitos reservados.",
      fontFamily: "'Poppins', sans-serif",
      fontSize: 13,
      textColor: "#FFFFFF",
      textMargin: 40,
      veilColor: "#000000",
      veilOpacity: 50,
    }),
  ],
  header: [],
  menu: [],
  name: "Gatilhos Mentais",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "E-book Gatilhos Mentais",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#2EDAF1",
    bg: "#000C14",
    card: "#01141D",
    fg: "#FFFFFF",
    fontAccent: "'Orbitron', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontHeading: "'Orbitron', sans-serif",
    glow: "#00E1FF24",
    line: "#FFFFFF29",
    muted: "#FFFFFF70",
    variant: "gatilhos",
  },
};

export const gatilhosMentais: SiteTemplate = {
  description:
    "Página de vendas escura em ciano neon de e-book de gatilhos mentais: hero com interrogação neon e vídeo, recursos, gatilhos com hover revelador, bônus, reviews em carrossel, números, oferta pulsante, garantia e FAQ. Migrada do Central do Marketing.",
  id: "gatilhos-mentais",
  name: "Gatilhos Mentais — E-book",
  preview: IMG.bgHero,
  site,
  tags: ["Landing", "Cursos"],
};
