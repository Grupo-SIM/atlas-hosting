import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND, SAMPLE_VIDEO } from "./brand.js";
import {
  CALENDAR,
  CARDS,
  CHURCH,
  FRIENDS,
  GROUP,
  IMG,
  LEADERS,
  PREVIEW,
  VIDEO_THUMB,
  WORSHIP,
} from "./images.js";
import { type LegalItem, privacidade, termos } from "./legal.js";

/**
 * Template "Comunidade Viva — Igreja": home + Nossa história, Agenda, Células, Localização, Privacidade, Termos e 404,
 * com a variante `igreja` (escopo `.sb-cv`, `renderer/igreja.ts`; blocos `cv*` em `blocks/igreja.tsx` e
 * `blocks/igreja-pages.tsx`). Layout medido no site de uma igreja real; marca, pessoas, textos, fotos, endereços e links
 * são fictícios (`brand.ts`, `images.ts`). O topo (`cvNav`) e o fim (Explore, banner e rodapé) são globais: ficam em
 * `header` e `footer`, então uma edição vale para todas as páginas. As configurações globais ficam em `theme`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra: { anchor?: string; fx?: Record<string, Fx> } = {}
): Block => ({ id: `cv-${seq++}`, props, type, ...extra });

const page = (slug: string, title: string, blocks: Block[]): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  slug,
  status: "published",
  title,
});

const LEGAL_BRAND = {
  domain: BRAND.domain,
  email: BRAND.email,
  name: BRAND.legalName,
};

/** Entradas discretas (desligadas com `prefers-reduced-motion`). */
const up: Fx = { enter: "fadeInUp", enterMs: 600 };
const cards: Fx = { each: true, enter: "fadeInUp", enterMs: 600, stagger: 80 };

/* ───────────────────────── global ───────────────────────── */

const header = [
  block("cvNav", {
    icon: IMG.icon,
    shortcuts: "Agenda, Células",
    socials: BRAND.socials.map(([label, url]) => ({ label, url })),
    socialsLabel: "Redes sociais",
  }),
];

const footer = [
  block(
    "cvExplore",
    {
      hideOn: "privacidade, termos, 404",
      items: [
        {
          image: CARDS.book,
          text: "Uma leitura curta sobre fé e recomeços, para ler no celular ou imprimir.",
          title: 'Novo livro: "Coragem para recomeçar"',
          url: "https://exemplo.com/livro",
        },
        {
          image: CARDS.visit,
          text: "Conheça os endereços das nossas sedes e participe da mais perto de você.",
          title: "Estamos esperando a sua visita!",
          url: "/localizacao/",
        },
        {
          image: CARDS.program,
          text: "Toda semana no YouTube, com mensagens, louvor e testemunhos.",
          title: "Assista ao nosso programa",
          url: "https://exemplo.com/programa",
        },
        {
          image: CARDS.gallery,
          text: "Os melhores cliques do que tem acontecido na nossa igreja.",
          title: "Veja os registros dos nossos eventos",
          url: "https://exemplo.com/galeria",
        },
        {
          image: CARDS.social,
          text: "Conheça nossos projetos e tudo o que fazemos pela comunidade.",
          title: "Ação social",
          url: "https://exemplo.com/acao-social",
        },
        {
          image: CARDS.startups,
          text: "Toda primeira sexta-feira do mês, um encontro para empresários trocarem experiências e fazerem bons negócios.",
          title: "Rede de empreendedores",
          url: "https://exemplo.com/empreendedores",
        },
      ],
      mobileText:
        "Seja bem-vindo(a)! Nossos pastores têm uma mensagem para você. Toque e assista!",
      moreLabel: "Ver mais",
      moreUrl: "https://exemplo.com/blog",
      title: "Explore mais conteúdo.",
      videoImage: VIDEO_THUMB,
      videoLabel: "Assistir à mensagem de boas-vindas",
      watermark: "VIVA",
    },
    { fx: { "1.2.1": up, "1.2.3": cards } }
  ),
  block(
    "cvBanner",
    {
      image: WORSHIP,
      line1: "Uma família para caminhar com você.",
      line2: "Estamos aqui para abençoar a sua vida.",
      mobileImage: "",
    },
    { fx: { "1.1": { parallax: 2, parallaxScreens: "desktop" } } }
  ),
  block("cvFooter", {
    addressLabel: "Sede:",
    appTitle1: "Fique conectado de qualquer lugar.",
    appTitle2: "Baixe o aplicativo:",
    brand: "",
    links: [
      { label: "Privacidade", url: "/privacidade/" },
      { label: "Termos", url: "/termos/" },
    ],
    logo: IMG.logoV,
    motto: BRAND.motto,
    rights: "Todos os direitos reservados.",
  }),
];

/* ───────────────────────── home ───────────────────────── */

const home = page("", "Igreja em células", [
  block(
    "cvHero",
    {
      appTitle: "Baixe nosso aplicativo:",
      appTitleMobile: "Nosso aplicativo",
      listenBottom: "AGORA",
      listenTop: "ESCUTE",
      logo: IMG.logoH,
      photo: LEADERS,
      photoAlt:
        "Pastor pregando com microfone, em um palco com luzes roxas e azuis",
      podcastLabel: "Escute o nosso podcast",
      rate1Label: "Gostaram",
      rate1Value: "9.2",
      rate2Label: "Pontuação",
      rate2Value: "8.7",
      ratings: "no",
      thumb: VIDEO_THUMB,
      videoLabel: "Assistir à mensagem de boas-vindas",
    },
    {
      fx: {
        "1.1": { enter: "fadeIn", enterMs: 700 },
        "1.2.1": { each: true, enter: "fadeIn", enterMs: 600, stagger: 80 },
        "1.2.2": {
          enter: "fadeInRight",
          enterMobile: "none",
          enterMs: 800,
        },
      },
    }
  ),
]);

/* ───────────────────────── páginas internas ───────────────────────── */

const story = page("sobre", "Nossa história", [
  block("cvPageHero", {
    height: 350,
    image: CHURCH,
    layout: "left",
    title: "Nossa história",
  }),
  block(
    "cvStory",
    {
      lead: "Cada história começa com um primeiro passo.",
      paragraphs: [
        {
          text: "A Comunidade Viva começou em 2001, numa sala emprestada, com doze pessoas, um violão e muita vontade de se encontrar. Não havia estrutura nem programação elaborada: havia gente querendo caminhar junto.",
        },
        {
          text: "Em poucos anos a sala ficou pequena. Mudamos para um galpão simples, que a própria comunidade pintou e arrumou aos sábados, e ali aprendemos que uma igreja se constrói com as mãos de todos.",
        },
        {
          text: "Com o crescimento, percebemos que ninguém conseguia conhecer ninguém num salão cheio. Foi assim que passamos a nos organizar em células: pequenos grupos que se reúnem nas casas, estudam a Bíblia, comem juntos e cuidam uns dos outros durante a semana.",
        },
        {
          text: "Hoje temos uma sede e três congregações, centenas de células e projetos que alcançam crianças, famílias e empreendedores da nossa região. Mas o centro continua o mesmo: pessoas cuidando de pessoas.",
        },
        {
          text: "Se você chegou até aqui, queremos te convidar para uma visita. Escolha a sede ou a célula mais perto de você e venha conhecer a nossa família.",
        },
      ],
      signature: "",
      videoLabel: "Assistir à nossa história",
      videoUrl: "",
    },
    { fx: { "1.1": up } }
  ),
]);

const day = (
  name: string,
  entries: { date: string; events: string[] }[] = []
) => ({
  day: name,
  entries: entries.map(e => ({ date: e.date, events: e.events.join("\n") })),
});

const agenda = page("agenda", "Agenda", [
  block("cvPageHero", {
    height: 200,
    image: CALENDAR,
    layout: "center",
    title: "Agenda – Novembro",
  }),
  block("cvAgenda", {
    days: [
      day("Domingo", [
        {
          date: "Domingo, 22 de novembro",
          events: [
            "Culto de celebração – 8h (Sede)",
            "Culto de celebração – 10h (Sede)",
            "Culto infantil – 10h (Sede)",
            "Culto da noite – 19h (Sede)",
          ],
        },
        {
          date: "Domingo, 29 de novembro",
          events: [
            "Culto de celebração – 8h (Sede)",
            "Culto de celebração – 10h (Sede)",
            "Culto infantil – 10h (Sede)",
            "Culto da noite – 19h (Sede)",
          ],
        },
      ]),
      day("Segunda"),
      day("Terça"),
      day("Quarta", [
        {
          date: "Quarta-feira, 18 de novembro",
          events: ["Estudo bíblico – 19h30 (Sede)"],
        },
        {
          date: "Quarta-feira, 25 de novembro",
          events: ["Estudo bíblico – 19h30 (Sede)"],
        },
      ]),
      day("Quinta"),
      day("Sexta", [
        {
          date: "Sexta-feira, 20 de novembro",
          events: ["Encontro de jovens – 20h (Sede)"],
        },
        {
          date: "Sexta-feira, 27 de novembro",
          events: ["Encontro de jovens – 20h (Sede)"],
        },
      ]),
      day("Sábado", [
        {
          date: "Sábado, 28 de novembro",
          events: ["Encontro de casais – 19h (Sede)"],
        },
      ]),
    ],
    emptyText: "Sem programação",
    label: "Dias da semana",
  }),
]);

const hood = (
  name: string,
  leader: string,
  schedule: string,
  address: string
) => ({ address, leader, name, schedule, whatsapp: "" });

const cells = page("celulas", "Células", [
  block("cvPageHero", {
    height: 280,
    image: GROUP,
    layout: "left",
    title: "Células",
  }),
  block(
    "cvCells",
    {
      closeLabel: "Fechar",
      items: [
        hood(
          "Centro",
          "Ana e Paulo",
          "Terças, 19h30",
          "Perto da Praça Central"
        ),
        hood(
          "Jardim América",
          "Rita e Marcelo",
          "Quartas, 20h",
          "Próximo ao mercado do bairro"
        ),
        hood(
          "Vila Nova",
          "Joana",
          "Quintas, 19h30",
          "Rua das Acácias, trecho inicial"
        ),
        hood(
          "Bela Vista",
          "Carlos e Dani",
          "Terças, 20h",
          "Perto da escola municipal"
        ),
        hood(
          "Primavera",
          "Beatriz",
          "Segundas, 19h30",
          "Próximo à padaria da esquina"
        ),
        hood(
          "Morada do Sol",
          "Tiago e Lívia",
          "Quartas, 19h30",
          "Entrada do condomínio"
        ),
        hood(
          "Santa Rita",
          "Helena e Jorge",
          "Quintas, 20h",
          "Perto da capela do bairro"
        ),
        hood(
          "São José",
          "Mateus",
          "Sextas, 19h30",
          "Próximo ao campo de futebol"
        ),
        hood(
          "Boa Esperança",
          "Cláudia e Renato",
          "Segundas, 20h",
          "Rua principal, perto do posto"
        ),
        hood("Jardim Europa", "Sandra", "Terças, 19h", "Perto do parque"),
        hood(
          "Parque das Flores",
          "Davi e Priscila",
          "Quartas, 19h",
          "Próximo ao centro comunitário"
        ),
        hood(
          "Nova Aliança",
          "Elisa e Rodrigo",
          "Quintas, 19h",
          "Perto da quadra poliesportiva"
        ),
      ],
      leaderLabel: "Líder",
      line1: "Você sabe o que é uma célula?",
      line2:
        "Célula é um encontro semanal nas casas para estudar a Bíblia, conversar, comer junto e fortalecer amizades.",
      line3:
        "Que tal experimentar um novo círculo de amigos para crescer na fé?",
      placeLabel: "Endereço aproximado",
      question: "Onde você prefere participar?",
      showFirst: "no",
      waLabel: "Falar pelo WhatsApp",
      whenLabel: "Dia e horário",
    },
    { fx: { "1.1": up } }
  ),
]);

const locations = page("localizacao", "Localização", [
  block("cvLocations", {
    directionsLabel: "Como chegar",
    hoursLabel: "Cultos",
    image: CHURCH,
    imageAlt: "Fachada de uma igreja",
    items: [
      {
        address: BRAND.address,
        group: "Capital",
        hours: "Domingos, 8h, 10h e 19h\nQuartas, 19h30",
        name: "Sede",
        phone: "",
        whatsapp: "",
      },
      {
        address: "Av. Exemplo, 250 – Bairro Norte – Cidade/UF",
        group: "Capital",
        hours: "Domingos, 9h e 19h",
        name: "Congregação Norte",
        phone: "",
        whatsapp: "",
      },
      {
        address: "Rua Modelo, 75 – Bairro Sul – Cidade/UF",
        group: "Capital",
        hours: "Domingos, 9h e 19h",
        name: "Congregação Sul",
        phone: "",
        whatsapp: "",
      },
      {
        address: "Rua da Matriz, 30 – Centro – Município/UF",
        group: "Municípios",
        hours: "Domingos, 18h30",
        name: "Congregação do Interior",
        phone: "",
        whatsapp: "",
      },
    ],
    mapTitle: "Mapa da sede da igreja",
    title: "Estamos esperando a sua visita!",
    waLabel: "Falar pelo WhatsApp",
    waMessage: "Olá! Gostaria de visitar a igreja.",
  }),
]);

const legal = (slug: string, title: string, items: LegalItem[]) =>
  page(slug, title, [
    block("cvPageHero", { height: 200, image: "", layout: "left", title }),
    ...items.map(([kind, text]) =>
      kind === "h"
        ? block("heading", { align: "left", level: "h2", subtitle: "", text })
        : block("text", { text: kind === "li" ? `• ${text}` : text })
    ),
  ]);

const notFound = page("404", "Página não encontrada", [
  block("cvNotFound", {
    backLabel: "Voltar ao início",
    image: FRIENDS,
    text: "A página que você procura não existe ou mudou de endereço.",
    title: "Página não encontrada",
  }),
]);

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer,
  header,
  menu: [
    { href: "/", label: "Início" },
    { href: "/sobre/", label: "Nossa história" },
    { href: "/agenda/", label: "Agenda" },
    { href: "/celulas/", label: "Células" },
    { href: "/localizacao/", label: "Localização" },
  ],
  name: BRAND.name,
  pages: [
    home,
    story,
    agenda,
    cells,
    locations,
    legal("privacidade", "Política de Privacidade", privacidade(LEGAL_BRAND)),
    legal("termos", "Termos de Uso", termos(LEGAL_BRAND)),
    notFound,
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#1E6687",
    address: BRAND.address,
    appStoreUrl: "",
    bg: "#DFDFDF",
    churchName: BRAND.name,
    contactEmail: BRAND.email,
    favicon: IMG.favicon,
    fg: "#131313",
    fontBody: "'Poppins', sans-serif",
    fontHeading: "'Poppins', sans-serif",
    leaderName: BRAND.leaders,
    muted: "#54595F",
    phone: "",
    playStoreUrl: "",
    podcastUrl: "https://open.spotify.com/",
    seoDescription:
      "Igreja em células: mensagem de boas-vindas, podcast, agenda da semana, células por bairro e endereços das sedes. Venha nos visitar.",
    showApp: "yes",
    variant: "igreja",
    welcomeVideo: SAMPLE_VIDEO,
    whatsapp: BRAND.whatsapp,
  },
};

export const igrejaComunidadeViva: SiteTemplate = {
  description:
    "Site de igreja, cinza claro com azul-petróleo e roxo: foto da liderança em recorte diagonal, vídeo de boas-vindas, podcast e app, cartões de conteúdo, agenda da semana em abas, células por bairro, sedes com mapa e página de história.",
  id: "igreja-comunidade-viva",
  name: "Comunidade Viva — Igreja",
  preview: PREVIEW,
  site,
  tags: ["Institucional", "Igreja"],
};
