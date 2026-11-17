import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND } from "./brand.js";
import { FALLS, HERO, IMG, NOT_FOUND, PHOTOS, PREVIEW } from "./images.js";
import { type LegalItem, privacidade, termos } from "./legal.js";

/**
 * Template "Vereda Viva — Pousada e Camping": landing de uma página (hero em carrossel, história em linha do
 * tempo, quartos com modal de fotos, experiências, missão/visão/valores, mapa e rodapé) com a variante `pousada`.
 * Layout medido numa pousada real; marca, textos, fotos e contatos são fictícios (`brand.ts`, `images.ts`).
 * Configurações globais (reserva, WhatsApp, e-mail, telefone, endereço do mapa, modo escuro) ficam em `theme`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Block>
): Block => ({
  id: `vv-${seq++}`,
  props,
  type,
  ...extra,
});

const page = (
  slug: string,
  title: string,
  blocks: Block[],
  extra?: Partial<Page>
): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  slug,
  status: "published",
  title,
  ...extra,
});

const LEGAL_BRAND = {
  domain: BRAND.domain,
  email: BRAND.email,
  name: BRAND.legalName,
};

const socials = BRAND.socials.map(([label, url]) => ({ label, url }));

/* ───────────────────────── blocos comuns ───────────────────────── */

const header = () => [
  block("vvNav", { logo: IMG.logo, reserveLabel: "Reservar" }),
];

const footer = () => [
  block("vvFooter", {
    contactTitle: "FALE CONOSCO",
    copyright: BRAND.copyright,
    links: [
      { label: "Privacidade", url: "/privacidade/" },
      { label: "Termos", url: "/termos/" },
    ],
    logo: IMG.logoLight,
    socials,
    socialsTitle: "REDES SOCIAIS",
  }),
  block("vvFloat", { label: "Falar pelo WhatsApp" }),
];

/* ───────────────────────── home ───────────────────────── */

const storyItems = [
  {
    caption: "Abertura do camping",
    date: "Mar 2010",
    icon: "tent",
    text: "Começamos como um camping simples à beira do cerrado, com sombra de pequizeiro, fogueira e céu estrelado.",
    title: "Área de Camping",
    year: "2010",
  },
  {
    caption: "Suítes confortáveis",
    date: "Ago 2017",
    icon: "house",
    text: "Construímos seis suítes com materiais da região, pensadas para casais, famílias e grupos que querem conforto sem perder o contato com a natureza.",
    title: "Ecopousada",
    year: "2017",
  },
  {
    caption: "Café da manhã",
    date: "Jul 2023",
    icon: "cup",
    text: "Nosso café abre todas as manhãs com pão de queijo, bolos caseiros, tapioca, frutas do cerrado e café coado na hora.",
    title: "Café da Manhã",
    year: "2023",
  },
  {
    caption: "Eventos culturais",
    date: "Nov 2023",
    icon: "mask",
    text: "Rodas de viola, saraus e apresentações de artistas da região animam as noites no gramado.",
    title: "Música e Arte",
    year: "2023",
  },
];

/** Entrada dos cartões da linha do tempo: vêm do lado em que estão (o cartão é o 4º filho de cada item). */
const timelineFx = Object.fromEntries(
  storyItems.map((_, i) => [
    `1.1.3.${i + 1}.4`,
    { enter: i % 2 === 0 ? "fadeInLeft" : "fadeInRight" },
  ])
);

const room = (
  name: string,
  text: string,
  key: keyof typeof PHOTOS,
  bookUrl = ""
) => ({
  bookUrl,
  image: PHOTOS[key].cover,
  name,
  photos: [...PHOTOS[key].photos],
  text,
});

const rooms = [
  room(
    "Área de Camping",
    "Traga sua barraca e acampe à sombra das árvores, com banheiros e cozinha de apoio.",
    "camping"
  ),
  room(
    "Barracas Equipadas",
    "Barraca montada com colchão, roupa de cama, travesseiros, toalha e cobertas. Individual, dupla ou família.",
    "barracas"
  ),
  room("Suíte Ipê", "Até 2 pessoas", "ipe"),
  room("Suíte Buriti", "Até 2 pessoas", "buriti"),
  room("Suíte Aroeira", "Até 3 pessoas", "aroeira"),
  room("Suíte Cagaita", "Até 4 pessoas", "cagaita"),
  room("Suíte Seriema", "Até 4 pessoas", "seriema"),
  room("Suíte Família", "Até 6 pessoas", "familia"),
];

const exp = (
  title: string,
  text: string,
  key: keyof typeof PHOTOS,
  extraLabel = ""
) => ({
  // O segundo botão só aparece com texto **e** URL; a URL vem vazia no modelo (o cliente informa a dele).
  extraLabel,
  extraUrl: "",
  image: PHOTOS[key].cover,
  kind: "photo",
  photos: [...PHOTOS[key].photos],
  text,
  title,
});

const experiences = [
  exp(
    "Área de Convivência",
    "Redes, pufes, espreguiçadeiras e um lounge à sombra para descansar entre um passeio e outro.",
    "convivencia"
  ),
  exp(
    "Café da manhã",
    "Servido das 7h às 11h no nosso bistrô, com reserva ou por ordem de chegada.",
    "cafe"
  ),
  exp(
    "Eventos culturais",
    "Artistas da região se apresentam para hóspedes e moradores da vila.",
    "eventos",
    "Ver Eventos"
  ),
  exp(
    "Cozinha equipada",
    "Cozinha completa com fogão, geladeira e utensílios para quem gosta de preparar a própria comida.",
    "cozinha"
  ),
  exp(
    "Vestiários",
    "Banheiros e vestiários limpos e organizados, com água quente.",
    "vestiarios"
  ),
  {
    extraLabel: "",
    extraUrl: "",
    image: "",
    kind: "solid",
    photos: [],
    text: "Separação de lixo, energia solar e trilhas educativas para mostrar a importância do Cerrado.",
    title: "Sustentabilidade",
  },
];

const home = page("", "Pousada e Camping no Cerrado", [
  block("vvHero", {
    arrowLabel: "Ir para a próxima seção",
    arrowUrl: "#pousada",
    autoplay: "yes",
    line1: "Um lugar incrível para",
    line2: "momentos especiais",
    logo: IMG.logoLight,
    seconds: 6,
    slides: HERO,
  }),
  block(
    "vvStory",
    {
      contactLabel: "Fale Conosco",
      items: storyItems,
      reserveLabel: "Reservar",
      roomsLabel: "Ver Quartos",
      roomsUrl: "#acomodacoes",
      title1: "A NOSSA",
      title2: "POUSADA",
    },
    {
      anchor: "pousada",
      fx: { "1.1.1": { enter: "fadeInUp" }, ...timelineFx },
    }
  ),
  block(
    "vvRooms",
    {
      items: rooms,
      moreLabel: "Ver mais+",
      reserveLabel: "Reservar",
      showModalInEditor: "no",
      title: "Acomodações",
    },
    {
      anchor: "acomodacoes",
      fx: {
        "1.1.1": { enter: "fadeInUp" },
        "1.1.2": { each: true, enter: "fadeInUp", stagger: 80 },
      },
    }
  ),
  block(
    "vvExperiences",
    {
      imagesLabel: "Ver Imagens",
      items: experiences,
      showModalInEditor: "no",
      title: "Experiências Oferecidas",
    },
    {
      anchor: "experiencias",
      fx: {
        "1.1.1": { enter: "fadeInUp" },
        "1.1.2": { each: true, enter: "fadeInUp", stagger: 80 },
      },
    }
  ),
  block(
    "vvValues",
    {
      items: [
        {
          text: "Receber cada hóspede com simplicidade e cuidado, aproximando as pessoas da natureza do Cerrado.",
          title: "Missão",
        },
        {
          text: "Ser referência em hospedagem sustentável na região, inspirando quem passa por aqui a cuidar do lugar onde vive.",
          title: "Visão",
        },
        {
          text: "Acolhimento, respeito à natureza, valorização da cultura local e de quem trabalha com a gente.",
          title: "Valores",
        },
      ],
    },
    { fx: { "1.2": { each: true, enter: "fadeIn", stagger: 120 } } }
  ),
  block(
    "vvVisit",
    {
      embedUrl: "",
      mapTitle: "Mapa de como chegar à pousada",
      photos: FALLS,
      title: "VENHA NOS VISITAR",
    },
    { anchor: "visite" }
  ),
]);

/* ───────────────────────── páginas internas ───────────────────────── */

const legal = (slug: string, title: string, items: LegalItem[]) =>
  page(slug, title, [
    block("vvPageTitle", { text: title }),
    ...items.map(([kind, text]) =>
      kind === "h"
        ? block("heading", { align: "left", level: "h2", subtitle: "", text })
        : block("text", { text: kind === "li" ? `• ${text}` : text })
    ),
  ]);

const notFound = page("404", "Página não encontrada", [
  block("vvNotFound", {
    backLabel: "Voltar ao início",
    image: NOT_FOUND,
    text: "A página que você procura não existe ou mudou de endereço.",
    title: "Página não encontrada",
  }),
]);

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: footer(),
  header: header(),
  menu: [
    { href: "#pousada", label: "Nossa Pousada" },
    { href: "#acomodacoes", label: "Acomodações" },
    { href: "#experiencias", label: "Experiências" },
    { href: "#visite", label: "Nos Visite" },
  ],
  name: BRAND.name,
  pages: [
    home,
    legal("privacidade", "Política de Privacidade", privacidade(LEGAL_BRAND)),
    legal("termos", "Termos de Uso", termos(LEGAL_BRAND)),
    notFound,
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#2A8ECC",
    bg: "#ffffff",
    bookUrl: "",
    contactEmail: BRAND.email,
    darkMode: "yes",
    favicon: IMG.favicon,
    fg: "#111111",
    fontBody: "'Fira Sans', sans-serif",
    fontHeading: "'Josefin Sans', sans-serif",
    mapAddress: BRAND.address,
    muted: "#555555",
    phone: "",
    seoDescription:
      "Pousada e camping no Cerrado: suítes, barracas equipadas, café da manhã, área de convivência e reservas pelo WhatsApp.",
    variant: "pousada",
    waMessage: "Olá! Gostaria de mais informações sobre a hospedagem.",
    whatsapp: BRAND.whatsapp,
  },
};

export const pousadaVeredaViva: SiteTemplate = {
  description:
    "Pousada e camping, verde e azul do Cerrado: hero em carrossel de fotos, história em linha do tempo, quartos com galeria de fotos e reserva, experiências, missão e valores, mapa e modo escuro automático.",
  id: "pousada-vereda-viva",
  name: "Vereda Viva — Pousada e Camping",
  preview: PREVIEW,
  site,
  tags: ["Landing", "Viagens"],
};
