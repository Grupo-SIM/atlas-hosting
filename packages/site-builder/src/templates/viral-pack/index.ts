import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Viral Pack — Pack de Conteúdo": página de vendas de um pack de conteúdo para redes sociais (Central do
 * Marketing / SIM Intermediações — viralpack.centraldomarketing.com, WordPress + Hello Elementor 4.4 + ElementsKit + Jeg
 * Kit, página 569, kit 8), com a variante `viralpack`. Uma rota só (`/`); a âncora `oferta` fica no cartão de oferta e
 * todos os "Adquirir Agora" rolam até ela (só o do cartão vai ao checkout).
 *
 * Diferenças do original: o mosaico do hero usa **imagens neutras** (degradê escuro + play), não os pôsteres de filmes e
 * séries de terceiros — cada cliente põe as próprias no inspetor; o mockup de aparelhos do "Monetize" é um desenho neutro
 * (o original mostra cenas de filmes/jogos); a busca e o botão "Acessar" do header (escondidos em todas as telas) não foram
 * migrados; "Youtube" → "YouTube". Fotos de banco (Freepik) dos cartões: confirmar a licença.
 *
 * Caminhos de `fx`: ver `blocks/viralpack.tsx` e `blocks/ebook.tsx`.
 */
const UP =
  "https://viralpack.centraldomarketing.com/wp-content/uploads/2025/04";

const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=1ef10aab-812a-47cf-b1cf-859f55a8a579";
const OFFER = "#oferta";

const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`)}`;

/** Peça neutra do mosaico: degradê escuro com ícone de play. */
const tile = (hue: number, w: number, h: number) =>
  svg(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},35%,22%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},40%,8%)"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.12}" fill="none" stroke="#ffffff55" stroke-width="4"/><path d="M${w / 2 - w * 0.03} ${h / 2 - h * 0.04}L${w / 2 + w * 0.05} ${h / 2}L${w / 2 - w * 0.03} ${h / 2 + h * 0.04}Z" fill="#ffffff88"/>`,
    w,
    h
  );

/** Ordem do original: 4 colunas de 5 peças — retrato (P) e paisagem (L). */
const SHAPES = "PPPPLLPPPPPPLPPPLPPP";
const tiles = [...SHAPES].map((c, i) => {
  const landscape = c === "L";
  return {
    alt: "",
    image: landscape ? tile(i * 37, 1024, 746) : tile(i * 37, 684, 1024),
    shape: landscape ? "landscape" : "portrait",
  };
});

/** Mockup neutro de três aparelhos (o original mostra cenas de filmes e jogos). */
const mockup = svg(
  `<rect x="60" y="120" width="560" height="340" rx="22" fill="#1b1b1b" stroke="#ECB53A" stroke-width="4"/><rect x="80" y="140" width="520" height="300" rx="10" fill="#2a2a2a"/><rect x="660" y="40" width="190" height="420" rx="26" fill="#1b1b1b" stroke="#FFA33E" stroke-width="4"/><rect x="676" y="64" width="158" height="372" rx="12" fill="#2a2a2a"/><rect x="880" y="190" width="120" height="270" rx="20" fill="#1b1b1b" stroke="#ECB53A" stroke-width="4"/><rect x="892" y="208" width="96" height="234" rx="8" fill="#2a2a2a"/><path d="M310 260l90 50-90 50z" fill="#ffffff88"/>`,
  1024,
  493
);

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; fx?: Record<string, Fx> }
): Block => ({
  id: `vp-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

/** Entrada do Elementor: `fadeInUp`, 1,25 s. */
const up = (extra: Partial<Fx> = {}): Fx => ({
  ...extra,
  enter: "fadeInUp",
  enterMs: 1250,
});

/** Itens em sequência: 0 / 500 / 1000 / 1500 ms. */
const seq4 = up({ each: true, stagger: 500 });

const benefits = [
  ["Conteúdo infinito", "Atualizações constantes", "1-1.png"],
  [
    "Fura bolhas de audiência",
    "Engajamento alto",
    "high-angle-woman-experiencing-anxiety-crowd_23-2150824696.jpg",
  ],
  ["Liberdade geográfica", "Trabalhe de qualquer lugar", "onte.png"],
  [
    "Crescimento rápido",
    "Perfil viral em poucos meses",
    "dynamic-data-visualization-3d_23-2151904315.avif",
  ],
  [
    "4+ Formas de monetizar",
    "Escolha a que preferir",
    "adult-having-lots-money_23-2151694196.jpg",
  ],
  ["Ganhe $ sem aparecer", "Aprenda a monetizar os perfis", "3.png"],
  ["Economia de tempo", "Na criação de conteúdo", "7-1.png"],
  [
    "Autoridade visual",
    "cenas bem produzidas",
    "people-taking-part-high-protocol-event_23-2150951273.jpg",
  ],
].map(([title, subtitle, file]) => ({
  image: `${UP}/${file}`,
  subtitle,
  title,
}));

const faq = [
  [
    "O que exatamente é o Viral Pack?",
    "O Viral Pack é um pacote digital com mais de 600 cortes prontos de filmes e séries para você postar nas redes sociais e gerar engajamento imediato. Ideal para quem quer crescer no Instagram, TikTok ou YouTube de forma rápida e estratégica.",
  ],
  [
    "Quais são os conteúdos incluídos?",
    "Você terá acesso a cenas editadas, organizadas por temas, além de um bônus exclusivo com estratégias práticas para monetizar seus perfis e transformar views em renda.",
  ],
  [
    "Como vou receber o conteúdo?",
    "Assim que a compra for confirmada, você recebe um link de acesso automático à área de membros, onde poderá baixar todos os arquivos e começar a usar imediatamente.",
  ],
  [
    "O acesso é vitalício?",
    "Sim! Pagando apenas uma vez, você garante acesso vitalício ao conteúdo atual.",
  ],
  [
    "Preciso ter experiência em edição ou marketing?",
    "Não! O pack foi pensado justamente para facilitar a vida de quem está começando. Basta ter um celular e seguir as instruções simples para aplicar.",
  ],
  [
    "Posso usar o conteúdo em mais de um perfil?",
    "Sim. Você pode utilizar os cortes em quantos perfis quiser — seus ou de clientes, sem restrições.",
  ],
  [
    "Quais são as formas de pagamento disponíveis?",
    "Você pode pagar via cartão de crédito ou Pix. O sistema é 100% seguro e operado por plataformas reconhecidas no mercado.",
  ],
  [
    "Em quanto tempo recebo o acesso após o pagamento?",
    "Para pagamentos por cartão e Pix, o acesso é liberado em poucos minutos.",
  ],
  [
    "E se eu tiver algum problema com o acesso?",
    "Você contará com suporte humanizado pronto para te atender e resolver qualquer dúvida ou dificuldade de forma rápida e eficiente.",
  ],
  [
    "Tem garantia?",
    "Sim! Você tem até 7 dias para testar o conteúdo. Se não curtir ou achar que não é pra você, devolvemos 100% do valor investido, sem burocracia.",
  ],
  [
    "Qual o diferencial do Viral Pack em relação a outros produtos do mercado?",
    "Além da quantidade e qualidade dos cortes, o Viral Pack entrega estratégias práticas, liberdade geográfica (trabalhe de onde quiser), economia de tempo e autoridade visual — tudo por um investimento acessível.",
  ],
  [
    "Esse conteúdo pode ser usado para vender como afiliado ou produto próprio?",
    "Sim! Inclusive, essa é uma das formas ensinadas dentro do bônus de monetização. Você pode usar os vídeos para atrair seguidores, vender produtos ou serviços, seja como produtor ou afiliado.",
  ],
].map(([question, answer]) => ({ answer, question }));

const home: Block[] = [
  block(
    "mosaicHero",
    {
      buttonLabel: "Adquirir Agora",
      buttonUrl: OFFER,
      dashColor: "#FFA33E",
      logo: `${UP}/logo-viralpack.png`,
      logoAlt: "ViralPack",
      logoUrl: "/",
      logoWidth: 110,
      text: "Templates prontos e estratégias testadas e aprovadas por quem já viralizou, este Pack é seu atalho para o sucesso nas redes sociais.",
      textColor: "#FFFFFF",
      tiles,
      title: "GERE MILHÕES DE VIEWS\n**COM O VIRAL PACK**",
      veil: "#000000B8",
    },
    { fx: { "1.1": up() } }
  ),
  block(
    "vpHighlights",
    {
      items: [
        {
          alt: "",
          image: `${UP}/1080_HD512px-copy2.png`,
          title: "+600 Cenas de Filmes e Séries Atualizadas",
        },
        {
          alt: "",
          image: `${UP}/Subscribers512px-copy2.png`,
          title: "Método de Viralização e Vendas",
        },
        { alt: "", image: `${UP}/Frame-43.png`, title: "Acesso Vitalício" },
        {
          alt: "",
          image: `${UP}/Family_Package512px-copy2.png`,
          title: "Suporte Humanizado",
        },
      ],
    },
    { fx: { "1.1": seq4 } }
  ),
  block(
    "vpSplit",
    {
      buttonLabel: "Adquirir Agora",
      buttonUrl: OFFER,
      image: `${UP}/social-media-influencer-receiving-likes-positive-reactions_53876-96207-1024x682.jpg`,
      imageAlt: "Influenciador recebendo curtidas e reações positivas",
      text: "Tudo o que você precisa é de um celular e desse pack de vídeos.",
      title:
        "Copie, cole e transforme qualquer perfil de Instagram, YouTube ou TikTok em uma máquina de views!",
    },
    {
      fx: {
        "1.1.1": { enter: "fadeInLeft", enterMs: 1250 },
        "1.1.2": up(),
      },
    }
  ),
  block(
    "vpShowcase",
    {
      bgColor: "#3A3A3A",
      bgImage: `${UP}/Polygonal-texture-by-Easybrandz_02-copy.jpg`,
      image: mockup,
      imageAlt: "Aparelhos exibindo o conteúdo do Viral Pack",
      text: "O Viral Pack inclui um **bônus** com várias formas práticas de ganhar dinheiro com cortes virais",
      title: "Aprenda a Monetizar Seus Perfis",
    },
    { fx: { "1.1": up() } }
  ),
  block(
    "vpBenefits",
    {
      buttonLabel: "Adquirir Agora",
      buttonUrl: OFFER,
      items: benefits,
      text: "Mais de 600 cortes de cenas prontas para serem postadas e já começar a viralizar.",
      title: "Benefícios do Viral Pack",
    },
    { fx: { "1.1": up(), "1.2.1": seq4, "1.2.2": seq4 } }
  ),
  block(
    "heading",
    {
      align: "center",
      level: "h2",
      text: "Investimento baixo, retorno rápido!",
    },
    { fx: { "": up() } }
  ),
  block(
    "ebookOffer",
    {
      accent: "#FFFFFF",
      bullets:
        "+600 Cenas de Filmes e Séries;\n4+ Formas de monetizar os perfis;\nÁrea de membros exclusiva;\nSuporte humanizado.",
      buttonFrom: "#FFFFFF",
      buttonGlow: "#FFFFFF1A",
      buttonLabel: "Adquirir Agora",
      buttonStyle: "outline",
      buttonText: "#FFE779",
      buttonUrl: CHECKOUT,
      cardImage: `${UP}/Polygonal-texture-by-Easybrandz_07-copy.jpg`,
      cardTitle: "OFERTA EXCLUSIVA",
      cardVeil: 30,
      cashback: "PROMOÇÃO ENCERRA EM POUCOS MINUTOS!",
      cashColor: "#FFFFFF",
      cashSize: 20,
      discount: "Desconto de 45% agora!",
      fontFamily: "'Roboto', sans-serif",
      from: "",
      fromLabel: "",
      padBottom: 50,
      price: "R$29,90",
      priceLabel: "",
      sectionBg: "#111111",
      textColor: "#FFFFFF",
      titleFont: "'Hind', sans-serif",
      variant: "texture",
    },
    { anchor: "oferta", fx: { "1.1": up({ delay: 500 }) } }
  ),
  block("ebookFaq", {
    accent: "#FFA33E",
    answerColor: "#D8D8D8",
    bg: "#111111",
    cardColor: "#FFA33E",
    cardText: "#111111",
    fontFamily: "'Roboto', sans-serif",
    headingFont: "'Hind', sans-serif",
    iconSide: "right",
    intro:
      "Sabemos que antes de investir, é normal ter algumas perguntas na cabeça. Por isso, reunimos aqui as principais dúvidas sobre o Viral Pack: como funciona, o que você vai receber, formas de acesso, garantia e tudo que você precisa saber para decidir com segurança. Leia com atenção e, se ainda restar alguma dúvida, nosso suporte está pronto pra te ajudar!",
    itemStyle: "solid",
    items: faq,
    layout: "split",
    minHeight: 0,
    minHeightMobile: 0,
    minHeightTablet: 0,
    openColor: "#FFBE00",
    openFirst: "yes",
    padBottom: 30,
    padTop: 50,
    textColor: "#FFFFFF",
    title: "Perguntas Frequentes",
    titleColor: "#FFFFFF",
    titleSize: 42,
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("ebookFooter", {
      bg: "#111111",
      copyright: "© SIM Intermediações — Todos os direitos reservados.",
      fontFamily: "'Roboto', sans-serif",
      fontSize: 15,
      padBottom: 30,
      padTop: 50,
      textColor: "#D8D8D8",
    }),
  ],
  header: [],
  menu: [],
  name: "ViralPack",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "ViralPack",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#ECB53A",
    bg: "#111111",
    card: "#111111",
    fg: "#D8D8D8",
    fontAccent: "'Hind', sans-serif",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Hind', sans-serif",
    gray: "#3A3A3A",
    orange: "#FFA33E",
    variant: "viralpack",
  },
};

export const viralPack: SiteTemplate = {
  description:
    "Página de vendas escura em grafite e amarelo para pack de conteúdo para redes sociais: hero com mosaico de imagens, destaques, benefícios em cartões com foto, oferta com textura e FAQ em cartões. Migrada do Central do Marketing.",
  id: "viral-pack",
  name: "Viral Pack — Pack de Conteúdo",
  preview: tiles[0]?.image ?? "",
  site,
  tags: ["Landing", "Marketing"],
};
