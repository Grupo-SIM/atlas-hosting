import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Grana na Hora": página de vendas de um curso de renda online (Central do Marketing —
 * grananahora.centraldomarketing.com, WordPress + Hello Elementor + Elementor Pro, página 162, kit 9), com a variante
 * `grana`. Uma rota só (`/`); a âncora `oferta` fica no bloco da oferta e todos os "Adquirir agora" e os "Acessar" dos
 * bônus rolam até ela (só o botão do cartão vai ao checkout, na Ticto).
 *
 * Diferenças do original:
 * - **bônus neutros** no lugar dos 3 livros de autores reais (títulos, nomes e fotos de terceiros): miniaturas são blocos de
 *   cor com ícone; o cliente troca tudo no inspetor. Um teste garante que nenhum nome nem arquivo deles volte;
 * - erros de digitação corrigidos ("restriçōes", "Infaliveis", "a procura");
 * - o "Saber mais" dos bônus (escondido em todas as telas) não foi migrado;
 * - o slider de "Vire o Jogo" tem um slide só: virou imagem fixa; a âncora é só `oferta` (o `d1` do original não é usado);
 * - o hover do mosaico troca a imagem com crossfade de 0,3 s (no original o `background-image` troca seco);
 * - o parallax só se move no desktop, como no Motion Effects do Elementor (`parallaxScreens: "desktop"`); as velocidades do
 *   Elementor (2 e 1) viraram ±1,1 e ±0,55 no `Fx` (medido: 0,111 px de deslocamento por px de rolagem na velocidade 2).
 *
 * Caminhos de `fx`: ver `blocks/grana.tsx`.
 */
const UP =
  "https://grananahora.centraldomarketing.com/wp-content/uploads/2025/04";
const CHECKOUT = "https://payment.ticto.app/O291624A0";
const OFFER = "#oferta";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; fx?: Record<string, Fx> }
): Block => ({
  id: `gh-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

/** Entradas do Elementor: 1,25 s. */
const fade = (delay: number, extra: Partial<Fx> = {}): Fx => ({
  ...extra,
  delay,
  enter: "fadeIn",
  enterMs: 1250,
});
const up = (delay: number, extra: Partial<Fx> = {}): Fx => ({
  ...extra,
  delay,
  enter: "fadeInUp",
  enterMs: 1250,
});

/** Parallax do original (só desktop): velocidade 2 → 1,1; velocidade 1 → 0,55. */
const par = (parallax: number, extra: Partial<Fx> = {}): Fx => ({
  ...extra,
  parallax,
  parallaxScreens: "desktop",
});

const tiles = (
  rows: [string, string, ("center" | "top")?][],
  column: "1" | "2"
) =>
  rows.map(([image, hover, hoverPos]) => ({
    column,
    hover: `${UP}/${hover}`,
    hoverPos: hoverPos ?? "center",
    image: `${UP}/${image}`,
  }));

const faq = [
  [
    'O que é o curso "Grana na Hora"?',
    "É um mapa completo que apresenta diferentes opções de fontes de renda que você pode começar a explorar imediatamente. Ele oferece insights, dicas práticas e orientações sobre como iniciar e ter resultado essa semana mesmo.",
  ],
  [
    "Quais benefícios posso obter com este material?",
    "Você descobrirá oportunidades de renda diferentes em mercados inexplorados e independentemente do seu nível de experiência, poderá executar o que será ensinado. O curso oferece informações valiosas sobre como iniciar cada uma dessas fontes de renda, fornecendo a você a chance de aumentar seus ganhos e dependendo do tanto se dedicar, até alcançar sua independência financeira.",
  ],
  [
    "Quem pode se beneficiar desse curso?",
    "Este material é voltado para qualquer pessoa que esteja interessada em aumentar sua renda e explorar novas oportunidades financeiras online. Ele é adequado para estudantes, profissionais em busca de renda extra, empreendedores e qualquer pessoa que deseje começar uma renda online.",
  ],
  [
    "Como faço para acessar o curso?",
    "Após o pagamento ser processado, você receberá um e-mail com um link onde você poderá acessar o conteúdo em nossa área de membros exclusiva.",
  ],
  [
    "Existe alguma garantia de satisfação?",
    "Sim, oferecemos uma garantia de satisfação de 7 dias. Se, por qualquer motivo você não estiver satisfeito com o conteúdo, entre em contato conosco dentro desse período e providenciaremos o reembolso completo do valor pago.",
  ],
  [
    "Posso compartilhar o curso com outras pessoas?",
    "Não, o curso é apenas para uso pessoal e não pode ser compartilhado, distribuído ou reproduzido sem permissão. Cada cópia é protegida por direitos autorais e destina-se somente ao comprador original.",
  ],
].map(([question, answer]) => ({ answer, question }));

const testimonials = [
  [
    "Márcio Duarte",
    "Ex-vendedor e hoje autônomo digital",
    "Marcio-Duarte.jpg",
    "Eu estava totalmente perdido, sem saber por onde começar. Com o 'Grana na Hora', consegui entender que existem várias formas reais de ganhar dinheiro. Já comecei a aplicar duas ideias e fiz R$380 na primeira semana.",
  ],
  [
    "Tatiane Silva",
    "Empreendedora digital",
    "Tatiane-Silva.jpg",
    "O curso é direto ao ponto. Sem enrolação, sem falsas promessas. Eu precisava de algo prático e rápido, e foi exatamente isso que encontrei. Em menos de 15 dias, já vi os primeiros resultados.",
  ],
  [
    "Daniela Rocha",
    "Estudante de Marketing",
    "Daniela-Rocha.jpg",
    "Tinha receio de cair em furada, mas esse curso é diferente. Ele mostra várias opções e ajuda a entender qual combina mais com o seu perfil. Apliquei uma ideia simples e já gerei renda extra.",
  ],
  [
    "Leandro Gomes",
    "Entregador de app e agora com renda online também",
    "Leandro-Gomes.jpg",
    "Achei que seria só mais um curso genérico, mas me surpreendi. O conteúdo é bem explicado, fácil de aplicar, e realmente entrega o que promete. Já recuperei o valor investido e sigo crescendo!",
  ],
  [
    "Renato Oliveira",
    "Auxiliar de serviços gerais",
    "Renato-Oliveira.jpg",
    "O que mais gostei foi da clareza. Não é aquele curso cheio de teoria. São dicas reais, de quem já fez e sabe o que tá falando. Me ajudou muito a sair da estagnação e começar algo meu.",
  ],
].map(([name, role, photo, text]) => ({
  name,
  photo: `${UP}/${photo}`,
  role,
  text,
}));

/** Bônus neutros e editáveis (o original traz 3 livros de autores reais, com as fotos deles). */
const bonus = [
  {
    credit: "– Material exclusivo",
    icon: "globe",
    image: "",
    title: "Guia de primeiros passos no digital",
  },
  {
    credit: "– Ferramenta prática",
    icon: "chart",
    image: "",
    title: "Planilha de controle de ganhos",
  },
  {
    credit: "– Plano de ação",
    icon: "check",
    image: "",
    title: "Checklist de 7 dias",
  },
];

const steps = [
  {
    buttonLabel: "Adquirir agora",
    buttonUrl: OFFER,
    caption: "Técnicas Infalíveis",
    eyebrow: "Sem restrições...",
    image: `${UP}/Frame-2-1.png`,
    number: "01",
    text: "Se você tá cansado de tentar “ganhar dinheiro” do jeito tradicional e só se frustrar, esse curso é pra você. Aqui você aprende formas reais, rápidas e fora da curva de gerar renda, mesmo começando do zero.",
    title: "Renda online comprovada para trabalhar de qualquer lugar",
  },
  {
    buttonLabel: "Adquirir agora",
    buttonUrl: OFFER,
    caption: "Comece Agora.",
    eyebrow: "Direto ao ponto...",
    image: `${UP}/man-with-banknotes-isolated-studio_1303-26935.jpg`,
    number: "02",
    text: "Tudo o que você precisará fazer, é aplicar! Não tem nada muito técnico ou difícil, simplesmente vamos te mostrar formas de monetizar áreas que você nunca imaginou que dessem dinheiro.",
    title:
      "Nosso foco é ajudar quem está precisando criar renda ainda esta semana!",
  },
];

const home: Block[] = [
  block(
    "ghHero",
    {
      bgImage: `${UP}/clear-5.jpg`,
      buttonLabel: "Adquirir agora",
      buttonUrl: OFFER,
      text: "Quer começar no digital, mas está perdido? Está à procura de algo que não leve 6 meses ou mais pra aprender? Sua resposta está aqui.",
      tiles: [
        ...tiles(
          [
            ["15.png", "gravacaoblogger.webp"],
            ["26.png", "moneyhoje.webp"],
            ["8.png", "9.png", "top"],
          ],
          "1"
        ),
        ...tiles(
          [
            ["23.png", "24.png"],
            ["19.png", "ricaelinda.webp"],
            ["21.png", "22.png"],
          ],
          "2"
        ),
      ],
      titlePrefix: "O que acha de ganhar $",
      wordEffect: "flip",
      wordMs: 2500,
      words: "HOJE?\nAGORA?",
    },
    {
      fx: {
        "1.2.1": par(-1.1, { each: true }),
        "1.2.2": par(1.1, { each: true }),
      },
    }
  ),
  block(
    "ghFeatures",
    {
      bgImage: `${UP}/clear-4.jpg`,
      buttonLabel: "Adquirir agora",
      buttonUrl: OFFER,
      delay: 5000,
      eyebrow: "AGORA!",
      items: [
        {
          icon: "person",
          text: "Técnicas que geram resultado de verdade.",
          title: "Estratégias validadas",
        },
        {
          icon: "money",
          text: "Escolha a que mais faz sentido pra você.",
          title: "+20 de fontes de renda",
        },
        {
          icon: "network",
          text: "Conteúdo para iniciantes, intermediários ou avançados.",
          title: "Para todos os níveis",
        },
        {
          icon: "smartphone",
          text: "Garantindo sua liberdade geográfica.",
          title: "Rendas 100% online",
        },
      ],
      slides: [
        { alt: "Foguete saindo de um celular", image: `${UP}/1-1.png` },
        { alt: "Mapa das oportunidades digitais", image: `${UP}/2-1.png` },
      ],
      speed: 500,
      text: "Passo a passo sem enrolação de fontes de renda para você começar hoje e colher resultado ainda essa semana.",
      title: "O MAPA QUE TE LEVARÁ AO MUNDO DAS OPORTUNIDADES DIGITAIS",
      toggle: [
        {
          answer:
            "Aprenda como ter uma nova fonte de renda diária usando plataformas confiáveis e ferramentas gratuitas que facilitam o seu trabalho online — mesmo se você estiver começando do zero.",
          question: "Ganhos reais",
        },
        {
          answer:
            "Várias ideias e estratégias para você montar a sua operação ou prestar serviços em áreas totalmente inexploradas.",
          question: "Seu primeiro passo rumo à liberdade",
        },
      ],
    },
    {
      fx: {
        "1.1": fade(200, { each: true, stagger: 200 }),
        "1.2.1": fade(200),
        "1.2.2.1": fade(400),
        "1.2.2.2": fade(600),
        "1.2.2.3": up(800),
      },
    }
  ),
  block(
    "ghBanner",
    {
      boxImage: `${UP}/Frame-10-1.png`,
      buttonLabel: "Adquirir agora",
      buttonUrl: OFFER,
      endButtonLabel: "Adquirir agora",
      endButtonUrl: OFFER,
      endTitle: "Agir e vencer!",
      image: `${UP}/Frame-8-2.png`,
      imageAlt: "Mulher usando um tablet à noite",
      text: "Chega de esperar pelo momento certo ou pela sorte. A diferença entre quem conquista e quem assiste é a decisão de começar com o que tem.",
      title: "Vire o Jogo",
    },
    { fx: { "1.1.1": fade(200), "1.2": fade(200), "1.3.1": fade(400) } }
  ),
  block(
    "ghSteps",
    { bgImage: `${UP}/clear-5.jpg`, steps },
    {
      fx: {
        "1.1.1.1": fade(200),
        "1.1.1.1.1": up(400),
        "1.1.1.1.5": up(600),
        "1.1.1.2": fade(400, par(-0.55)),
        "1.1.1.2.1": up(600),
        "1.1.2.1": fade(400, par(0.55)),
        "1.1.2.1.1": up(600),
        "1.1.2.2": fade(200),
        "1.1.2.2.1": up(400),
        "1.1.2.2.5": up(600),
      },
    }
  ),
  block(
    "ghBonus",
    {
      bonusLabel: "Bônus",
      buttonLabel: "Acessar",
      buttonUrl: OFFER,
      eyebrow: "+3 BÔNUS EXCLUSIVOS",
      image: `${UP}/IMG03-1.png`,
      imageAlt: "Mulher segurando notas de dólar",
      items: bonus,
      title: "Para ajudar a acelerar seus resultados",
    },
    {
      fx: {
        "1.1.1": fade(200, par(-1.1)),
        "1.2.1": up(200),
        "1.2.2": fade(400),
        "1.2.2.1": fade(200),
        "1.2.2.2": fade(200),
        "1.2.2.3": fade(200),
      },
    }
  ),
  block(
    "ghOffer",
    {
      bgImage: `${UP}/clear-02.jpg`,
      bullets:
        "+3 Bônus Exclusivos;\nEntrega Imediata;\nÁrea de Membros Exclusiva;",
      buttonLabel: "ADQUIRIR AGORA",
      buttonUrl: CHECKOUT,
      cardKicker: "PROMOÇÃO ENCERRA EM POUCOS MINUTOS!",
      cardTitle: "Oferta Exclusiva",
      discount: "Desconto de 50% agora!",
      eyebrow: "a Hora é agora",
      lead: "O que separa quem fica parado de quem transforma a própria realidade é uma simples escolha.",
      price: "R$67,00",
      title: "DESCONTO RELÂMPAGO!",
    },
    {
      anchor: "oferta",
      fx: { "1.1": up(200), "1.2": fade(400, par(-0.55)) },
    }
  ),
  block(
    "ghTestimonials",
    {
      bgImage: `${UP}/IMG07-1.png`,
      delay: 5000,
      items: testimonials,
      speed: 500,
    },
    { fx: { "1.1": fade(200) } }
  ),
  block(
    "ghFaq",
    {
      bgImage: `${UP}/clear-4.jpg`,
      eyebrow: "FAQ",
      intro:
        "Aqui você encontra respostas para as perguntas mais comuns sobre o nosso curso.",
      items: faq,
      openFirst: "no",
      title: "Dúvidas Frequentes",
    },
    { fx: { "1.1.1": up(200) } }
  ),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block(
      "ebookFooter",
      {
        bg: "#000000",
        copyright: "Todos os direitos reservados JB Mídia ©",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        padBottom: 30,
        padTop: 30,
        textColor: "#FFFFFF",
      },
      { fx: { "": fade(200) } }
    ),
  ],
  header: [],
  menu: [],
  name: "Grana na Hora",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Grana na Hora",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#993DE1",
    answer: "#CCCCCC",
    bg: "#0C0F18",
    blue: "#3D49E1",
    card: "#10131E",
    check: "#B557FF",
    fg: "#AAA8B1",
    fontAccent: "'DM Sans', sans-serif",
    fontBody: "'DM Sans', sans-serif",
    fontHeading: "'Plus Jakarta Sans', sans-serif",
    icon: "#694BFF",
    line: "#2A2E36",
    title: "#F3F4F6",
    variant: "grana",
  },
};

export const granaNaHora: SiteTemplate = {
  description:
    "Página de vendas escura em roxo e azul para curso de renda online: hero com palavra girando e mosaico inclinado, destaques, slider, passos numerados, bônus, oferta, depoimentos e FAQ. Migrada do Central do Marketing.",
  id: "grana-na-hora",
  name: "Grana na Hora",
  preview: `${UP}/15.png`,
  site,
  tags: ["Landing", "Cursos"],
};
