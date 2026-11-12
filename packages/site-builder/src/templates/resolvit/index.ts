import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Resolvit": migração de resolvit.centraldomarketing.com (WordPress + Elementor), que tem uma rota só.
 * Textos, preço, link de checkout e imagens vêm do original (as imagens apontam para o WordPress dele, como nos
 * templates areaflix e controle-motorista); o checkout é um sistema externo e entra como link.
 */

const ORIGIN = "https://resolvit.centraldomarketing.com/wp-content/uploads";
const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=04cfa7b5-a254-4885-991a-9acd460e3ccc";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "anchor" | "fx">
): Block => ({ id: `rv-${seq++}`, props, type, ...extra });

const fade: Fx = { enter: "fadeIn", enterMs: 1250 };
const down: Fx = { enter: "fadeInDown", enterMs: 1250 };
const left: Fx = { enter: "fadeInLeft", enterMs: 1250 };
const right: Fx = { enter: "fadeInRight", enterMs: 1250 };

const card = (image: string, title: string, text: string) => ({
  image: `${ORIGIN}/2025/04/${image}`,
  text,
  title,
  url: "#oferta",
});

const testimonial = (image: string, name: string, quote: string) => ({
  image: `${ORIGIN}/2025/04/${image}`,
  name,
  quote,
  role: "Cliente",
});

const home: Page = {
  blocks: [
    block(
      "rvHero",
      {
        buttonLabel: "Começar Minha Transformação",
        buttonUrl: "#oferta",
        text: "Com as prescrições do Nutricionista e Educador Físico Eduardo Pavoski, você alivia dores, controla inflamações e emagrece de forma segura. Uma programação prática, cardápios anti-inflamatórios, consulta e orientações clínicas que funcionam de verdade.",
        title: "Transforme sua Saúde em 8 Semanas",
      },
      { fx: { "1.1": fade, "1.2": fade, "1.3": fade } }
    ),
    block(
      "rvTrust",
      {
        cards: [
          {
            icon: "shield",
            text: "Validação clínica e prática",
            title: "Confiança Real",
          },
          {
            icon: "heart",
            text: "Soluções para quem sofre",
            title: "Sua dor tem Fim",
          },
        ],
        image: `${ORIGIN}/2025/04/dobra1.avif`,
      },
      { fx: { "1.1": left, "1.2": left, "2": right } }
    ),
    block(
      "rvPain",
      {
        heading: "Você não está sozinho",
        imageA: `${ORIGIN}/elementor/thumbs/4-r52usznsoz3mhwafhx6vw3t3w27m5kzddahfhqo26o.webp`,
        imageB: `${ORIGIN}/elementor/thumbs/20-r52usu0qp9pz36sskk4ylk5zb874cr4la58isdo4x2.webp`,
        text: "Rinite, dermatite, sinusite, artrite reumatóide e Fibromialgia… Se você convive com dores constantes, crises respiratórias, inflamações ou dificuldade para emagrecer, já sabe como isso afeta seu bem-estar físico, emocional e até espiritual. A verdade é que a maioria dos tratamentos tradicionais não resolve o problema na raiz… E é por isso que milhares de pessoas estão buscando uma alternativa natural, prática e validada por quem vive isso todos os dias.",
        title1: "QUANTO VALE PARA VOCÊ",
        title2: "PARAR AS DORES?",
        videoLabel: "Assista agora:",
        videoUrl: "https://www.youtube.com/watch?v=SwviWI2C570",
      },
      { fx: { "1": down, "3": right, "4": right } }
    ),
    block(
      "rvMethod",
      {
        buttonLabel: "Adquirir Agora",
        buttonUrl: "#oferta",
        text: "Mais de 2 mil pacientes atendidos. Centenas de casos de dor e inflamação controlados com prescrições validadas por quem vive o problema todos os dias. A proposta do Nutricionista e Educador Físico Eduardo Pavoski é clara: transformar a saúde de forma natural, sem depender de medicamentos agressivos, com base em evidências clínicas e nutrição funcional.",
        title: "Método Pavoski",
      },
      { fx: { "1.1": down } }
    ),
    block("rvChange", {
      background: `${ORIGIN}/2025/04/3-1.png`,
      boxText:
        "Método 100% digital, pronto para começar hoje mesmo com prescrições e aplicação prática.",
      boxUrl: "#",
      image: `${ORIGIN}/2025/04/67.webp`,
      titleBlack: "Real",
      titleBlue: "Mudança",
    }),
    block(
      "rvReceive",
      {
        items: [
          card(
            "21.webp",
            "Diagnóstico de patologias",
            "Definição de cada uma, tipos de causa, sintomas, etc."
          ),
          card(
            "1-1.png",
            "Programação de treino",
            "Um programa de treino por 6 meses, focado em emagrecimento."
          ),
          card(
            "1-3.png",
            "Cardápios Nutricionais",
            "Cada patologia tem seu cardápio prescrito pelo nutricionista."
          ),
          card(
            "2-1.png",
            "Soluções inovadoras",
            "Condutas alternativas de prescrições não tradicionais"
          ),
          card(
            "5.avif",
            "Especificicação de alimentos",
            "Listagem de alimentos inflamatórios e antiflamatórios."
          ),
        ],
        title: "O que você vai receber?",
      },
      { fx: { "1": down } }
    ),
    block(
      "rvResults",
      {
        image: `${ORIGIN}/2025/04/500-1000-x-1217-px-1.png`,
        items: [
          testimonial(
            "young-woman-at-beach.jpg",
            "Juliana Podolski",
            "Eu já não acreditava que algo pudesse aliviar minha rinite. Depois do guia, as crises diminuíram e voltei a respirar com leveza."
          ),
          testimonial(
            "11.webp",
            "Carlos Matshu",
            "A dor nas articulações me impedia até de levantar da cama em paz. Hoje, com o plano natural da artrite, voltei a ter qualidade de vida."
          ),
          testimonial(
            "15.webp",
            "Rafaella Vasin",
            "Minha pele vivia ferida por causa da dermatite. Com as orientações do Pavoski, encontrei soluções que nenhum remédio havia me dado."
          ),
          testimonial(
            "32.webp",
            "Ana Clara",
            "Vivi anos lutando com a sinusite. Nunca pensei que alimentação pudesse ajudar tanto. O guia foi um divisor de águas pra mim."
          ),
          testimonial(
            "41.webp",
            "Marcos Oliveira",
            "A fibromialgia me roubava a energia todos os dias. Hoje, me sinto viva de novo. Apliquei o que aprendi e colhi resultados em semanas."
          ),
          testimonial(
            "thoughtful-young-woman-with-hand-on-chain-in-restaurant.jpg",
            "Beatriz Valle",
            "Tentei de tudo para emagrecer, mas só com o protocolo do Pavoski entendi como fazer isso sem passar fome e sem efeito sanfona."
          ),
        ],
        kicker: "Quem Já Viveu",
        seconds: 5,
        text: "Histórias de quem encontrou alívio, equilíbrio e qualidade de vida com o método Pavoski.",
        title: "Resultados Reais",
      },
      { fx: { "2.1": down, "2.2": down } }
    ),
    block(
      "rvSteps",
      {
        background: `${ORIGIN}/2025/04/dental-tools-and-accessories-used-by-dentists-in-stomatology-office.jpg`,
        items: [
          {
            text: "Descubra os gatilhos alimentares e inflamatórios do seu problema.",
            title: "Identifique a causa",
          },
          {
            text: "Siga os cardápios, suplementos e orientações práticas.",
            title: "Aplique o plano",
          },
          {
            text: "Reduza dores, ganhe energia, respire melhor e viva com leveza.",
            title: "Experimente a diferença",
          },
        ],
        text: "A transformação da sua saúde de forma natural em Três passos",
        title: "Seu Novo Começo",
      },
      { fx: { "2.1.1": down } }
    ),
    block("rvBanner", {
      image: `${ORIGIN}/2025/04/BG-COMIDA-EDUARDO-PAVOSKI.webp`,
    }),
    block(
      "rvOffer",
      {
        buttonLabel: "Adquirir Agora",
        buttonUrl: CHECKOUT,
        cardTitle: "Você está a um clique de transformar sua vida",
        currency: "R$",
        features:
          "Consulta online;\nÁrea de membros exclusiva;\nListagem de alimentos inflamatórios e antiflamatórios;\nCardápios Nutricionais;\nDiagnóstico de patologias;\nProgramação de 6 meses de treino;\n+10 Maiores dúvidas respondidas.",
        kicker: "Oferta Exclusiva",
        period: "retorno incluso",
        price: "347",
        title: "Acesso Imediato",
      },
      { anchor: "oferta", fx: { "1": down } }
    ),
    block(
      "rvFaq",
      {
        image: `${ORIGIN}/2025/04/5.webp`,
        items: [
          {
            answer:
              "Você receberá uma consulta completa e personalizada pra você, com planos práticos para Rinite , Sinusite , Dermatite , Artrite Reumatoide , Fibromialgia , Alimentação Anti-inflamatória e Emagrecimento saudável. Receberá um ebook que te ensina como emagrecer em 8-12 semanas. Terá +20 videos de perguntas frequentes respondidas e ainda +4 prescrições.",
            question: "O que está incluso na compra?",
          },
          {
            answer:
              "Sim. A consulta é focada em pessoas que sofrem com dores, crises respiratórias, inflamações recorrentes ou dificuldade para emagrecer e querem uma abordagem natural, prática e segura.",
            question: "Esse método serve pra mim?",
          },
          {
            answer:
              "Ao contrário dos tratamentos tradicionais, aqui você aprende a tratar a causa, não só os sintomas. O método é validado por mais de 2 mil atendimentos clínicos e funciona com alimentação, suplementação e hábitos reais.",
            question: "Qual a diferença desse método?",
          },
          {
            answer:
              "Você terá acesso a 30 perguntas respondidas em vídeo pelo próprio Prof. Eduardo Pavoski. São dúvidas comuns que ele recebe em consultório, explicadas de forma clara, direta e acessível, como: “A dermatite tem cura?” “O que comer para reduzir inflamações?” “Como identificar se a minha rinite é alimentar?” E muitas outras.",
            question: "O que tem nos vídeos?",
          },
          {
            answer:
              "Você pode contar com nosso suporte completo. Basta nos chamar pelo e-mail de contato ou diretamente na página de suporte. Resolvemos tudo com agilidade.",
            question: "E se eu tiver problemas com a compra?",
          },
          {
            answer:
              "Sim! Se por qualquer motivo você sentir que o conteúdo não foi útil para você, oferecemos garantia de 7 dias com reembolso total. Seu investimento está seguro.",
            question: "Tem garantia?",
          },
        ],
        text: "Tire suas dúvidas mais comuns e entenda como esse método pode transformar sua saúde.",
        title: "FAQs",
      },
      { fx: { "1.1": down } }
    ),
  ],
  id: "page-home",
  slug: "",
  status: "published",
  title: "Resolvit",
};

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("rvFooter", {
      text: "© SIM Intermediações — Todos os direitos reservados.",
    }),
  ],
  header: [
    block("rvHeader", {
      buttonLabel: "Acessar agora",
      buttonUrl: "#oferta",
      logo: `${ORIGIN}/2025/04/resolvit-logo.png`,
      logoUrl: "/",
    }),
  ],
  menu: [],
  name: "Resolvit",
  pages: [home],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#0028ff",
    bg: "#ffffff",
    card: "#ffffff",
    dark: "#062d92",
    fg: "#52575d",
    fontBody: "'Open Sans', sans-serif",
    fontHeading: "'Montserrat', sans-serif",
    ink: "#1b262c",
    line: "#becbff",
    mid: "#0962ea",
    muted: "#7a7a7a",
    soft: "#f2f7ff",
    variant: "resolvit",
  },
};

export const resolvit: SiteTemplate = {
  description:
    "Landing clara de método de saúde em azul: hero, cartões de confiança, vídeo, cartões com hover, carrossel de depoimentos, passos, cartão de oferta e perguntas frequentes. Migrado da Resolvit.",
  id: "resolvit",
  name: "Resolvit — Método de Saúde",
  preview: `${ORIGIN}/2025/04/dobra1.avif`,
  site,
  tags: ["Landing", "Saúde"],
};
