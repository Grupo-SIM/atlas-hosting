import type { Block, Fx, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "InstaFanFortune — E-book": página de vendas de lp.centraldomarketing.com/instafanfortune/ (WordPress +
 * Hello Elementor, modelo Canvas), com a variante `instafan`. Uma rota só (`/`); `#cp1` (seção "Método") e `#cpcompra`
 * (oferta) são as âncoras dos botões do hero. Textos, links e imagens vêm do original (imagens ainda hospedadas lá). Os
 * popups de captura de leads do original (campanha "QUERO CONTRIBUIR, SOU PATRIOTA!", de outra campanha e sem gatilho na
 * página) **não** foram migrados. As perguntas do FAQ seguem como no original, inclusive a repetida ("Em quanto tempo
 * posso ter resultados financeiros?").
 *
 * Caminho de `fx`: `1.2.5` é o botão de compra (ver `blocks/instafan.tsx`).
 */
const UPLOADS = "https://lp.centraldomarketing.com/wp-content/uploads";

const IMG = {
  arrow: `${UPLOADS}/2024/04/seta-azul.webp`,
  frame: `${UPLOADS}/2024/03/caixa-linha-azul.webp`,
  grid: `${UPLOADS}/2024/04/quadrados-faid-token-bg3.webp`,
  hero: `${UPLOADS}/2024/03/encondee-img-02.webp`,
  line: `${UPLOADS}/2024/04/image.png`,
  logo: `${UPLOADS}/2024/03/cifrao-s.png`,
  organico: `${UPLOADS}/2024/03/quadrado-2-site-leads.webp`,
  semInvestimento: `${UPLOADS}/2024/03/duas-bolas-1-site.webp`,
  stamps: `${UPLOADS}/2023/05/SELA-COMPRA.png`,
  tabs: `${UPLOADS}/2024/03/line-linha-azul-img-site-money.webp`,
  triangle: `${UPLOADS}/2024/04/bg-triangulo-insta-fortune.webp`,
  validado: `${UPLOADS}/2024/03/vv-site-01-leads-dinheiro.webp`,
};

const CHECKOUT =
  "https://checkout.simintermediacoes.com/?simLinkCode=0b15791e-665f-4fc2-bbaa-1b97f54008a4";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: { anchor?: string; fx?: Record<string, Fx> }
): Block => ({
  id: `if-${seq++}`,
  props,
  type,
  ...(extra?.anchor ? { anchor: extra.anchor } : {}),
  ...(extra?.fx ? { fx: extra.fx } : {}),
});

const FAQ: { answer: string; question: string }[] = [
  {
    answer:
      "Você terá acesso a um eBook completo com 10 capítulos explicando tudo: como escolher o influenciador ideal, criar o perfil perfeito, automatizar postagens, gerar engajamento, atrair seguidores e transformar isso em dinheiro com produtos vencedores.",
    question: "O que está incluso na compra do InstaFanFortune?",
  },
  {
    answer:
      "Sim! O conteúdo foi pensado para iniciantes. O passo a passo é direto, prático e sem enrolação. Qualquer pessoa com acesso à internet e disposição para aplicar pode ter resultados com o InstaFanFortune.",
    question:
      "Posso aplicar esse método mesmo sem experiência com redes sociais ou marketing digital?",
  },
  {
    answer:
      "Alguns alunos relatam vendas já nas primeiras semanas, outros em 1 a 3 meses, dependendo do nicho e da constância. O método é construído para gerar renda recorrente e sólida com o tempo, então quanto mais você aplica, mais rápido vem o retorno.",
    question: "Em quanto tempo posso ter resultados financeiros?",
  },
  {
    answer:
      "Depende do seu nível de ambição, mas a maioria das tarefas pode ser automatizada. Com 30 a 60 minutos diários (ou menos, se for bem organizado), você consegue manter suas contas ativas, engajadas e prontas para gerar vendas todos os dias.",
    question: "Quanto tempo eu preciso por dia para aplicar o método?",
  },
  {
    answer:
      "Exatamente. Todo o método foi desenvolvido para que qualquer pessoa, mesmo sem exposição, possa aplicar e faturar com consistência. Você estará nos bastidores, gerenciando perfis e usando estratégias de engajamento altamente eficazes.",
    question: "Eu realmente não preciso aparecer? Nem mostrar meu rosto?",
  },
  {
    answer:
      "Alguns alunos relatam vendas já nas primeiras semanas, outros em 1 a 3 meses, dependendo do nicho e da constância. O método é construído para gerar renda recorrente e sólida com o tempo, então quanto mais você aplica, mais rápido vem o retorno.",
    question: "Em quanto tempo posso ter resultados financeiros?",
  },
  {
    answer:
      "Sim, e inclusive é recomendado depois que você dominar a primeira. Isso aumenta exponencialmente sua possibilidade de lucros e te posiciona como um verdadeiro gestor de mídias lucrativas.",
    question:
      "Posso aplicar essa estratégia em mais de uma conta ao mesmo tempo?",
  },
  {
    answer:
      "São aceitos todos os tipos de cartão e Pix. Compras realizadas no cartão de crédito são processadas de forma quase instantânea. Lembrando que pagamentos via boleto podem demorar até 72h para que o banco identifique e confirme o pagamento.",
    question: "Quais são as formas de pagamento?",
  },
  {
    answer: "Sim! Você pode usar a própria plataforma para enviar mensagens.",
    question: "Terei algum tipo de suporte?",
  },
];

const home = [
  block("ifHeader", { logo: IMG.logo, name: "InstaFanFortune" }),
  block("ifHero", {
    button1Label: "SABER MAIS",
    button1Url: "#cp1",
    button2Label: "ADQUIRIR AGORA",
    button2Url: "#cpcompra",
    gridImage: IMG.grid,
    image: IMG.hero,
    line1: "Renda **expressiva**",
    line2: "hoje **sem aparecer**",
    text: "Aqui está a chave para desbloquear um universo de oportunidades no Instagram, onde você pode lucrar em tempo recorde sem se expor.",
  }),
  block(
    "ifBenefits",
    {
      aboutBg: IMG.frame,
      aboutText:
        "Imagine acordar todas as manhãs com uma enxurrada de seguidores, engajamento nas alturas e, é claro, uma conta bancária recheada com vendas todos os dias. Parece bom demais para ser verdade? Pois prepare-se para se surpreender...\n\nEsqueça os padrões convencionais e mergulhe em um novo paradigma de sucesso nesse método meticulosamente desenvolvido para aqueles que buscam uma maneira discreta e poderosa de prosperar online.",
      aboutTitle: "Sobre",
      boxBg: IMG.frame,
      boxTitle: "Vendas **todos os dias**",
      items: [
        {
          image: IMG.organico,
          text: "Não precisa gastar com anúncios",
          title: "100% orgânico",
        },
        {
          image: IMG.validado,
          text: "Resultado garantido ao aplicar corretamente",
          title: "Validado",
        },
        {
          image: IMG.semInvestimento,
          text: "Não precisa de dinheiro pra iniciar",
          title: "Sem investimento",
        },
      ],
      tabs: [
        { title: "Método simples" },
        { title: "Ganhos ilimitados" },
        { title: "100% remoto" },
      ],
      tabsBg: IMG.tabs,
      title: "Método **atemporal** para a **liberdade**",
    },
    { anchor: "cp1" }
  ),
  block("ifPillars", {
    line: IMG.line,
    pillText:
      "Apenas para quem aplica! Mantenha-se constante e colha os resultados.",
    pillTitle: "RESULTADO GARANTIDO!",
    steps: [
      { label: "+Conhecimento", number: "1" },
      { label: "+Crescimento", number: "2" },
      { label: "+Oportunidades", number: "3" },
      { label: "+Resultado", number: "4" },
    ],
    title1: "GANHE DINHEIRO",
    title2: "SEM APARECER",
    title3: "ESTRATÉGIA ATEMPORAL",
    triangle: IMG.triangle,
  }),
  block("ifFeatures", {
    arrow: IMG.arrow,
    boxBg: IMG.frame,
    cards: [
      {
        items:
          "Área de membros cinemática;\nEstratégia altamente simples e intuitiva;\nAcesso ao primeiro bônus: Trabalhe melhor que 99% das pessoas – 5 estratégias que vão mudar sua vida;",
      },
      {
        items:
          "Operação automatizável;\nRenda recorrente todos os meses;\nAcesso ao segundo bônus: 7 lições estóicas diárias para desenvolver autodisciplina para dias difíceis;",
      },
      {
        items:
          "Não depende de você criar conteúdo;\nOperação 100% sem aparecer;\nNão requer custos financeiros, apenas precisa de constância.",
      },
    ],
    title: "Rumo ao sucesso",
  }),
  block(
    "ifOffer",
    {
      buttonLabel: "ADQUIRIR AGORA",
      buttonUrl: CHECKOUT,
      cardTitle: "OFERTA ESPECIAL",
      cashback: "100% de cashback instantaneamente!",
      from: "R$37,00",
      fromLabel: "DE",
      price: "R$19,99",
      priceLabel: "POR APENAS",
      riskText:
        "Logo após a sua compra você recebe 100% de cashback no Vale Bônus para usar no seu dia a dia.",
      riskTitle: "ZERO RISCO!",
      stamps: IMG.stamps,
    },
    { anchor: "cpcompra", fx: { "1.2.5": { enter: "pulse" } } }
  ),
  block("ifFaq", {
    items: FAQ,
    openFirst: "yes",
    title: "Dúvidas Frequentes",
  }),
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("ifFooter", {
      copyright: "© SIM Intermediações — Todos os direitos reservados.",
    }),
  ],
  header: [],
  menu: [],
  name: "InstaFanFortune",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Insta Fan Fortune – E-book",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#377AF7",
    bg: "#020717",
    dark: "#1C244D",
    fg: "#FFFFFF",
    fontAccent: "'Montserrat', sans-serif",
    fontBody: "'Montserrat', sans-serif",
    fontHeading: "'Montserrat', sans-serif",
    muted: "#D1D1D1",
    panel: "#010921",
    variant: "instafan",
  },
};

export const instafanFortune: SiteTemplate = {
  description:
    "Página de vendas escura em azul de e-book sobre renda no Instagram sem aparecer: hero com ilustração, método, pilares, passos, benefícios, oferta com preço de/por e garantia, e FAQ. Migrada do Central do Marketing.",
  id: "instafan-fortune",
  name: "InstaFanFortune — E-book",
  preview: IMG.hero,
  site,
  tags: ["Landing", "Cursos"],
};
