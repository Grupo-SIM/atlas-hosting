import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "757 Presets — Pacotes de Lightroom": página de vendas de 757presets.centraldomarketing.com (WordPress +
 * Elementor + ElementsKit, modelo Canvas), com a variante `presets` (`renderer/presets.ts`; blocos `p7*` em
 * `blocks/presets.tsx`). Rotas: `/` e `/politica-de-devolucao/` (as duas do original) + 404. `#pt1` é o `id` do bloco de
 * oferta (`anchor`), para onde rolam todos os botões de chamada. Textos, links e imagens vêm do original (imagens ainda
 * hospedadas lá). Só os erros de digitação foram mantidos como no original, exceto onde o texto ficaria ilegível.
 *
 * Diferenças do original: a imagem `Animation-1744462393643.gif` do hero (404 no site original, nunca aparece) **não**
 * foi migrada; o botão "ADQUIRIR AGORA" do cartão de preço aparece (no original ele fica invisível porque a animação de
 * entrada não dispara); o contador de promoção termina em 10/12/2026 10:20 UTC (`data-date` do original).
 *
 * Caminhos de `fx` (ver `blocks/presets.tsx`): botão de chamada do hero = `1.2.2.1`.
 */
const UPLOADS = "https://757presets.centraldomarketing.com/wp-content/uploads";
const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=57532e13-eefc-4c51-80a1-13e1b1ef795f";

const IMG = {
  bgHero: `${UPLOADS}/2023/05/head-757-012_clipdrop-enhance-scaled.webp`,
  bgHeroMobile: `${UPLOADS}/2023/06/topo-img-775-mobile.webp`,
  ebook: `${UPLOADS}/2022/02/ebook-presets-957x1024.png`,
  favicon: `${UPLOADS}/2025/06/757-2-300x300.png`,
  how: `${UPLOADS}/2022/10/FAMA-HOLLY.jpg`,
};

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; children?: Block[]; fx?: Record<string, Fx> }
): Block => ({
  id: `p7-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.children ? { children: extra.children } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

/** Entrada `pulse` dos botões, como a animação `pulse` do Elementor. */
const pulse: Fx = { enter: "pulse" };

const compare = (before: string, after: string, alt: string) => ({
  after,
  alt,
  before,
});

const secret = (n: number, title: string, text: string) => ({
  image: `${UPLOADS}/2022/02/SEGREDO0${n}-PRESETS-757.jpg`,
  text,
  title,
});

const PACKS = [
  {
    alt: "PACK_AUTOMOTIVE_NOVO",
    url: `${UPLOADS}/2022/08/PACK_AUTOMOTIVE_NOVO-1024x1024.jpg`,
  },
  {
    alt: "CAPA PACK-cinematico-completo",
    url: `${UPLOADS}/2023/06/CAPA-PACK-cinematico-completo-1024x1024.png`,
  },
  {
    alt: "pack-tokyo_NOVO",
    url: `${UPLOADS}/2022/08/pack-tokyo_NOVO-1024x1024.jpg`,
  },
];

const home = [
  block(
    "p7Hero",
    {
      bg: IMG.bgHero,
      bgMobile: IMG.bgHeroMobile,
      bgPosition: "center center",
      buttonLabel: "QUERO FOTOS PROFISSIONAIS",
      buttonUrl: "#pt1",
      minHeight: 894,
      minHeightMobile: 640,
      minHeightTablet: 471,
      title: "Fotos [[cinematográficas]] com apenas 1 clique!",
    },
    { fx: { "1.2.2.1": pulse } }
  ),
  block(
    "p7Compare",
    {
      buttonLabel: "QUERO FOTOS PROFISSIONAIS",
      buttonUrl: "#pt1",
      items: [
        compare(
          `${UPLOADS}/2022/02/ny-lucas-antes.jpg`,
          `${UPLOADS}/2022/02/ny-lucas-depois.jpg`,
          "Nova York, antes e depois"
        ),
        compare(
          `${UPLOADS}/2022/02/MARCELO-COMPUTADOR-2.jpg`,
          `${UPLOADS}/2022/02/IMG_5619_jpg-scaled.jpg`,
          "Marcelo no computador, antes e depois"
        ),
        compare(
          `${UPLOADS}/2022/02/lucas-sentado-antes.jpg`,
          `${UPLOADS}/2022/02/lucas-sentado-depois.jpg`,
          "Lucas sentado, antes e depois"
        ),
        compare(
          `${UPLOADS}/2023/06/IMG_8390-scaled.webp`,
          `${UPLOADS}/2023/06/IMG_8391-scaled.webp`,
          "Antes e depois"
        ),
        compare(
          `${UPLOADS}/2023/06/marcle-1.webp`,
          `${UPLOADS}/2023/06/marcl-2.webp`,
          "Marcelo, antes e depois"
        ),
        compare(
          `${UPLOADS}/2023/06/AnyConv.com__lucas-1.webp`,
          `${UPLOADS}/2023/06/AnyConv.com__lucas-2.webp`,
          "Lucas, antes e depois"
        ),
      ],
      labelAfter: "Depois",
      labelBefore: "Antes",
      text: "Transforme fotos normais em fotos de cinema, veja a diferença:",
      title: "Leve suas fotos para o próximo nível",
    },
    { fx: { "1.5.1": pulse } }
  ),
  block("p7About", {
    image: IMG.ebook,
    imageAlt: "E-book 757 Presets",
    text: "É um pacote no Lightroom recheado de filtros de cinema prontos para editar as suas fotos, sejam elas na praia, na cidade, dentro de casa ou em áreas externas, só que o mais incrível é que tudo isso acontece com apenas 1 clique. ",
    title: "O que é o 757 Presets?",
  }),
  block("p7Secrets", {
    items: [
      secret(
        1,
        "QUEM ESTÁ NA FOTO?",
        "Entenda como certas pessoas nas suas fotos estão prejudicando seu status social e o branding da sua marca."
      ),
      secret(
        2,
        "ONDE OLHAR?",
        "Utilize os mesmos efeitos visuais que famosos usam nos ensaios de Hollywood que farão você parecer uma celebridade."
      ),
      secret(
        3,
        "EDIÇÃO",
        "Entenda sobre o passo crucial que todo mundo ignora para transformar fotos normais em fotos de cinema."
      ),
      secret(
        4,
        "POSICIONAMENTO",
        "Entenda como as fotos podem realçar suas maiores inseguranças e destruir seu status social."
      ),
      secret(
        5,
        "LOCALIZAÇÃO",
        "Os melhores ambientes para enquadramento e para mostrar que você é uma pessoa de alto valor."
      ),
    ],
    text: "Você receberá como bônus um e-book simples e objetivo, totalmente gratuito, para te ensinar o passo a passo de todos esses segredos:",
    title: "Os segredos que ninguém te conta",
  }),
  block(
    "p7How",
    {
      buttonLabel: "QUERO FOTOS PROFISSIONAIS",
      buttonUrl: "#pt1",
      image: IMG.how,
      imageAlt: "Como funciona",
      text: "Escolha um dos nossos PACKS CINEMATOGRÁFICOS, abra o aplicativo Lightroom no seu celular, selecione a sua foto favorita e escolha o PRESET que desejar. Poucos segundos depois a mágica acontece…",
      title: "Como funciona:",
    },
    { fx: { "1.3.1": pulse } }
  ),
  block("p7Proof", {
    igTitle: "Instagram de clientes:",
    images: [
      { alt: "Depoimento 6", url: `${UPLOADS}/2023/06/depo6-755x1024.jpg` },
      { alt: "Depoimento 5", url: `${UPLOADS}/2023/06/depo5-1024x962.jpg` },
      { alt: "Depoimento 4", url: `${UPLOADS}/2023/06/depo4-1024x925.jpg` },
      { alt: "Depoimento 3", url: `${UPLOADS}/2023/06/depo3-982x1024.jpg` },
      { alt: "Depoimento 2", url: `${UPLOADS}/2023/06/depo2-859x1024.jpg` },
      { alt: "Depoimento 1", url: `${UPLOADS}/2023/06/depo1-984x1024.jpg` },
    ],
    profiles: [
      {
        image: `${UPLOADS}/2023/06/353348807_1190357652360899_2731496352870560315_n-1.jpg`,
        label: "Conferir",
        name: "@757_marcelo",
        url: "https://www.instagram.com/757_marcelo/",
      },
      {
        image: `${UPLOADS}/2023/06/353348807_1190357652360899_2731496352870560315_n.jpg`,
        label: "Conferir",
        name: "@olucasacre",
        url: "https://www.instagram.com/olucasacre",
      },
      {
        image: `${UPLOADS}/2023/06/244457821_690859988973652_4741464384731432719_n.jpg`,
        label: "Conferir",
        name: "@videomakerdofuturo",
        url: "https://www.instagram.com/videomakerdofuturo",
      },
    ],
    title: "O que dizem sobre os Packs?",
  }),
  block("p7Goals", {
    items: [
      {
        icon: "user",
        text: "Quer melhorar o seu personal branding valorizando a própria imagem, produto ou serviço;",
        title: "Objetivo 1",
      },
      {
        icon: "phone",
        text: "Quer fotos maravilhosas sem precisar de câmera profissional e sem perder tempo editando;",
        title: "Objetivo 2",
      },
      {
        icon: "photo",
        text: "Quer transformar fotos comuns em fotos cinematográficas;",
        title: "Objetivo 3",
      },
      {
        icon: "lock",
        text: "Quer obter os segredos que todos os profissionais estão guardando de você.",
        tight: "yes",
        title: "Objetivo 4",
      },
    ],
    title: "Nossos Presets foram [[criados pra você]] que:",
  }),
  block(
    "p7Packs",
    {
      buttonLabel: "QUERO FOTOS PROFISSIONAIS",
      buttonUrl: "#pt1",
      delay: 5000,
      gap: 12,
      // O Swiper do original abre em Automotive; com 3 slides por tela e só 3 imagens o carrossel daqui
      // ficaria parado, então a trinca se repete (o original duplica os slides sozinho, por causa do laço).
      images: [...PACKS, ...PACKS],
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
      title:
        "Ao todo são mais de 100 opções para você transformar fotos normais em fotos de cinema!",
    },
    { fx: { "1.3.1": pulse } }
  ),
  block("p7Note", {
    items: "Cinemático;\nTokyo;\nAutomotive.",
    text: "Se você adquirir o Pack Cinemático virá incluso o pack Tokyo, Automotive e o livro digital, somando **3 bônus exclusivos.**",
    title: "__**Oferecemos 3 Packs:**__",
  }),
  block("p7Access", {
    buttonLabel: "QUERO GARANTIR MEU PACK",
    buttonUrl: "#pt1",
    endsAt: "2026-12-10T10:20:00Z",
    sub: "Promoção acaba em:",
    title: "Garanta Seu Acesso!",
  }),
  block(
    "p7Price",
    {
      buyLabel: "ADQUIRIR AGORA",
      buyStyle: "flat",
      buyUrl: CHECKOUT,
      cashbackText: "Instantaneamente após a compra.",
      cashbackTitle: "100% DE CASHBACK!",
      endsAt: "2026-12-10T10:20:00Z",
      features:
        "Passo a passo em video;\nLivro digital incluso;\nSuporte humanizado;\n+2 packs inclusos.",
      from: "R$99,00",
      note: "Se você busca diferenciar-se e aumentar a qualidade visual das suas fotos, está no lugar certo.",
      price: "R$69,99",
      priceLabelAfter: "por apenas",
      priceLabelBefore: "de",
      promoTitle: "Promoção por tempo {{limitado!}}",
      title: "ACESSO VITALÍCIO",
    },
    { anchor: "pt1", fx: { "1.1.1.3.1": pulse } }
  ),
  block("p7Faq", {
    items: [
      {
        answer:
          "As predefinições do Lightroom são filtros de um clique que dão às suas fotos um estilo específico. Essas são as predefinições exatas que centenas de fotógrafos profissionais usam para editar suas fotos e são incrivelmente fáceis de usar.",
        question: "O que são presets do lightroom?",
      },
      {
        answer:
          "Sim, todos os nossos downloads são instantâneos. Eles são enviados a você por e-mail imediatamente após a conclusão do processo de pagamento.",
        question: "Os downloads são instantâneos? Como faço para recebê-los?",
      },
      {
        answer:
          "Claro! Nossos presets são projetadas para todos os níveis de habilidade, especialmente para aqueles com pouco conhecimento de edição para ajudá-lo a realizar facilmente belas edições em suas fotos com um clique.",
        question: "Sou novo no Lightroom, ainda consigo usar os presets?",
      },
      {
        answer:
          "Assim que receber suas predefinições por e-mail, certifique-se de fazer o backup em um disco rígido externo. Você pode fazer isso simplesmente criando uma pasta zip e arrastando-a para a pasta do hard-drive. Dessa forma, você tem as predefinições armazenadas com segurança para sempre e pode transferi-las facilmente no futuro.",
        question:
          "Se eu comprar um novo computador ou telefone, posso transferir meus presets de fotos?",
      },
      {
        answer:
          "Sim, editamos varias fotos com nossos presets que eram em formato JPEG. Contudo, as fotos RAW são definitivamente os melhores tipos de fotos para usar.",
        question: "As predefinições funcionam em fotos JPEG?",
      },
      {
        answer:
          "Qualquer outra questão ou problema de instalação, por favor entre em contato pelo endereço de e-mail: simmidia@stockinvestmoney.com",
        question: "E se eu tiver uma pergunta ou um problema?",
      },
      {
        answer:
          "Sim, todos os nossos downloads são instantâneos. Após a conclusão do processo de pagamento, você será direcionado para uma página de cadastro para download e tutorial. Assim que prosseguir na página preenchendo as informações necessárias como nome e e-mail seu download estará pronto e você receberá um e-mail imediatamente contendo o link direto do download do Pack. ",
        question: "Os downloads são instantâneos? Como faço para recebê-los?",
      },
      {
        answer:
          "Voce tem direito a apenas 3 downloads, use da maneira que desejar.",
        question: "Posso compartilhar meus presets com meus amigos?",
      },
      {
        answer:
          "Mobile: Você não precisa se inscrever no Lightroom para usar as predefinições em seu celular. Providenciamos um tutorial para instalá-los manualmente no aplicativo (que é gratuito); Desktop: Você precisa de uma versão do Lightroom entre LR 6 e LR CC para usar as predefinições na área de trabalho.",
        question:
          "Preciso da assinatura do Adobe Lightroom para usar as predefinições?",
      },
      {
        answer:
          "Por favor, **verifique sua pasta de spam** primeiro. Se você ainda não recebeu seus presets dentro de 24 horas após a compra ou não consegue abrir o link, **envie um email para simmidia@stockinvestmoney.com**",
        question: "Não recebi meus presets ou não consigo abrir o link?",
      },
      {
        answer:
          "Este pacote é perfeito para todos aqueles que desejam elevar o nivel do seu personal branding e explodir nas redes sociais. Este pacote de alta qualidade também é projetado para profissionais criativos, pois a qualidade das predefinições é incomparável.",
        question: "Para quem é esse pacote de presets?",
      },
      {
        answer:
          "Sim! Todos os packs estão disponíveis de forma individual. Basta clicar no botão azul **“*Quero ver os packs individuais*”** e adquirir o seu.",
        question: "Se eu quiser um pack específico, posso comprar?",
      },
    ],
    title: "Perguntas frequentes",
  }),
];

const returns = [
  block("p7Page", {
    backLabel: "VOLTAR PARA PÁGINA PRINCIPAL",
    backUrl: "/",
    contact: "Atendimento:\nE-mail: contatosimintermediacoes@gmail.com",
    text: "Todos os nossos produtos são downloads digitais instantâneos, por isso, eles não podem ser devolvidos e não podemos oferecer reembolso. Para suporte em relação a instalação de nossos produtos, entre em contato com nosso atendimento ao cliente.",
    title: "Política de Devolução",
  }),
];

const notFound = [
  block("p7Page", {
    backLabel: "VOLTAR PARA PÁGINA PRINCIPAL",
    backUrl: "/",
    contact: "",
    text: "A página que você procura não existe ou foi movida.",
    title: "Página não encontrada",
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("p7Footer", {
      linkLabel: "Política de devolução",
      linkUrl: "/politica-de-devolucao/",
      note: "**PIRATARIA É CRIME!** A venda dos produtos *757 Presets Brasil* só pode ser realizada através deste site, registrado em nome de SIM INTERMEDIACOES LTDA, CNPJ: 38.486.051/0001-48 . Qualquer outro site onde você encontre este programa é uma FALSIFICAÇÃO, recuse conteúdos ilegais ou pirateados. Não nos responsabilizamos por compras realizadas em outros sites.",
      title: "SIM Intermediações © - Todos os direitos reservados.",
    }),
  ],
  header: [],
  menu: [],
  name: "757 Presets",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "757 Presets",
    },
    {
      blocks: returns,
      id: "page-devolucao",
      slug: "politica-de-devolucao",
      status: "published",
      title: "Política de Devolução",
    },
    {
      blocks: notFound,
      id: "page-404",
      slug: "404",
      status: "published",
      title: "Página não encontrada",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#6818B8",
    bg: "#080808",
    blue: "#2575FC",
    deep: "#481888",
    favicon: IMG.favicon,
    fg: "#FFFFFF",
    fontAccent: "'Roboto', sans-serif",
    fontBody: "'Montserrat', sans-serif",
    fontHeading: "'Montserrat', sans-serif",
    glow: "#280848",
    line: "#5818A8",
    panel: "#5818A81F",
    pink: "#F83696",
    toggle: "#8C3EDA",
    variant: "presets",
  },
};

export const presets757: SiteTemplate = {
  description:
    "Página de vendas escura em roxo e rosa de pacotes de presets para Lightroom: hero com foto, comparador antes/depois arrastável, segredos do e-book, depoimentos, carrossel de packs, contador de promoção, cartão de preço e FAQ. Migrada do Central do Marketing.",
  id: "presets-757",
  name: "757 Presets — Pacotes de Lightroom",
  preview: IMG.bgHero,
  site,
  tags: ["Landing", "Fotografia"],
};
