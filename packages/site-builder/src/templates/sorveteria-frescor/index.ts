import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND } from "./brand.js";
import { IMG, PREVIEW, SLIDES, STORY_PHOTOS, UNIT_IMAGES } from "./images.js";
import { type LegalItem, privacidade, termos } from "./legal.js";

/**
 * Template "Frescor — Sorveteria, Açaí e Pizza": home com hero em slides, cartões de pedido por unidade, "Fale com a
 * gente" e rodapé com status de horário; "Nossa História" com linha do tempo; páginas legais e 404. Variante
 * `sorveteria` (escopo `.sb-fr`). Layout medido no site de uma sorveteria real; marca, textos, fotos, unidades e
 * contatos são fictícios (`brand.ts`, `images.ts`). As unidades ficam na lista do rodapé; o fuso e a mensagem do
 * WhatsApp, em `theme`.
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Block>
): Block => ({
  id: `fr-${seq++}`,
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

const rise = { enter: "fadeInUp" } as const;

/* ───────────────────────── blocos comuns ───────────────────────── */

const header = () => [
  block("frHeader", { highlight: "Cardápio", logo: IMG.logo }),
];

const footer = () => [
  block("frFooter", {
    brand: BRAND.copyright,
    closedLabel: "Fechado agora",
    credit: "",
    creditUrl: "",
    legal: [
      { label: "Privacidade", url: "/privacidade/" },
      { label: "Termos", url: "/termos/" },
    ],
    openLabel: "Aberto agora",
    // O link do iFood fica sem URL: o cliente informa o da loja dele (sem URL o item não aparece).
    orderLinks: [
      { label: "Cardápio digital", url: "#cardapio" },
      { label: "iFood", url: "" },
      { label: "WhatsApp", url: "#contato" },
    ],
    orderTitle: "Faça seu pedido",
    rights: "Todos os direitos reservados.",
    socials: [{ label: "Instagram", url: BRAND.instagram }],
    soonLabel: "Abre em {n} min",
    units: BRAND.units,
  }),
  block("whatsappFloat", {
    color: "#25D366",
    hoverColor: "#1EBE5D",
    label: "Peça pelo WhatsApp",
    layout: "pill",
    mobileLabel: "Pedir",
    url: `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Olá, ${BRAND.name}. Gostaria de fazer um pedido!`)}`,
  }),
];

/* ───────────────────────── home ───────────────────────── */

const home = page("", "Sorveteria, açaí e pizza", [
  block("frHero", {
    seconds: 5,
    slides: SLIDES,
    title: BRAND.name,
    waveFill: "",
  }),
  block(
    "frOrderCards",
    {
      cards: [
        {
          buttons: [
            { label: "Fazer pedido no app", own: "no", url: "" },
            { label: "Pedir pelo WhatsApp", own: "yes", url: "" },
          ],
          color: "blue",
          image: UNIT_IMAGES[0],
          title: "",
          type: "unit",
          unit: 1,
        },
        {
          buttons: [
            { label: "Pedir no iFood", own: "no", url: "" },
            { label: "Pedir pelo site", own: "no", url: "#contato" },
          ],
          color: "cyan",
          image: UNIT_IMAGES[1],
          title: "",
          type: "unit",
          unit: 2,
        },
        {
          buttons: [{ label: "Pedir pelo WhatsApp", own: "yes", url: "" }],
          color: "yellow",
          image: UNIT_IMAGES[2],
          title: "",
          type: "unit",
          unit: 3,
        },
        {
          buttons: [{ label: "Acessar", own: "no", url: "/historia/" }],
          color: "blue",
          image: IMG.mascot,
          title: "Clube de Vantagens",
          type: "club",
          unit: 0,
        },
        {
          buttons: [{ label: "Seguir", own: "no", url: BRAND.instagram }],
          color: "blue",
          image: "",
          title: "Siga nosso Instagram",
          type: "instagram",
          unit: 0,
        },
      ],
      subtitle: "Escolha sua unidade e faça seu pedido",
      title: "Nosso Cardápio",
    },
    {
      anchor: "cardapio",
      fx: {
        "1.1.1": rise,
        "1.1.3": {
          each: true,
          enter: "fadeInUp",
          hover: "tilt",
          stagger: 100,
          tiltGlare: true,
          tiltMax: 8,
        },
      },
    }
  ),
  block(
    "frContact",
    {
      buttonLabel: "WhatsApp {unidade}",
      instagramLabel: "Instagram!",
      instagramUrl: BRAND.instagramDirect,
      lastText: "Para falar com a gente é mais rápido pelo nosso",
      pickLabel: "Qual unidade deseja falar?",
      placeholder: "Selecione a unidade",
      text: "Peça direto pelo WhatsApp e receba em casa",
      title: "Fale com a gente!",
    },
    { anchor: "contato", fx: { "1.1": rise } }
  ),
]);

/* ───────────────────────── Nossa História ───────────────────────── */

const history = page("historia", "Nossa História", [
  block("frHistoryHero", {
    subtitle: "De uma receita caseira a uma referência de sabor",
    title: "Nossa História",
  }),
  block(
    "frStory",
    {
      photos: STORY_PHOTOS,
      text: [
        "Tudo começou em 2008, numa cozinha de casa, com uma máquina de sorvete usada e muita vontade de fazer diferente.",
        "Os primeiros sabores eram vendidos na porta de casa. Com o tempo vieram a primeira loja, o açaí montado do jeito do cliente e, mais tarde, as pizzas.",
        "Hoje são três unidades e uma equipe que trata cada pedido como se fosse para a própria família. Obrigado por fazer parte dessa história e por refrescar o dia a dia da nossa comunidade.",
      ].join("\n\n"),
      title: "Quem somos",
    },
    {
      fx: {
        "1.1.1": { enter: "fadeInLeft" },
        "1.1.2": { enter: "fadeInRight" },
      },
    }
  ),
  block(
    "frTimeline",
    {
      items: [
        {
          text: "Os primeiros sabores saem da cozinha de casa.",
          title: "Começo",
          year: "2008",
        },
        {
          text: "Abrimos as portas com 20 sabores e o açaí montado na hora.",
          title: "Primeira loja",
          year: "2014",
        },
        {
          text: "As pizzas entram no cardápio para dividir com a galera.",
          title: "Pizzaria",
          year: "2019",
        },
        {
          text: "A terceira loja chega para ficar mais perto de você.",
          title: "Três unidades",
          year: "2024",
        },
      ],
      title: "Anos refrescando a cidade",
    },
    {
      fx: {
        "1.1": rise,
        "1.2": { each: true, enter: "fadeInUp", stagger: 120 },
      },
    }
  ),
]);

/* ───────────────────────── páginas internas ───────────────────────── */

const legal = (slug: string, title: string, items: LegalItem[]) =>
  page(slug, title, [
    block("frHistoryHero", { subtitle: "", title }),
    ...items.map(([kind, text]) =>
      kind === "h"
        ? block("heading", { align: "left", level: "h2", subtitle: "", text })
        : block("text", { text: kind === "li" ? `• ${text}` : text })
    ),
  ]);

const notFound = page("404", "Página não encontrada", [
  block("frNotFound", {
    backLabel: "Voltar ao início",
    text: "A página que você procura não existe ou mudou de endereço.",
    title: "Ops! Essa página derreteu.",
  }),
]);

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: footer(),
  header: header(),
  menu: [
    { href: "/", label: "Início" },
    { href: "/historia/", label: "Nossa História" },
    { href: "/#cardapio", label: "Cardápio" },
    { href: "/#contato", label: "Contato" },
  ],
  name: BRAND.name,
  pages: [
    home,
    history,
    legal("privacidade", "Política de Privacidade", privacidade(LEGAL_BRAND)),
    legal("termos", "Termos de Uso", termos(LEGAL_BRAND)),
    notFound,
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#0012FF",
    bg: "#ffffff",
    blueDark: "#0008CC",
    blueLight: "#3342FF",
    cyan: "#00E5FF",
    favicon: IMG.favicon,
    fg: "#1A1A2E",
    fontBody: "'Outfit', sans-serif",
    fontHeading: "'Luckiest Guy', cursive",
    muted: "#666666",
    red: "#E33E2B",
    seoDescription:
      "Sorveteria artesanal, açaí e pizzaria em três unidades: peça pelo app, pelo iFood ou pelo WhatsApp e acompanhe se a loja está aberta agora.",
    timezone: BRAND.timezone,
    variant: "sorveteria",
    waMessage: "Olá, {marca} ({unidade}). Gostaria de fazer um pedido!",
    yellow: "#FFED00",
    yellowDark: "#E6D600",
    yellowSoft: "#FFF9C4",
  },
};

export const sorveteriaFrescor: SiteTemplate = {
  description:
    "Sorveteria, açaí e pizzaria, azul e amarelo: slides coloridos com o produto flutuando, cartões de pedido por unidade com efeito 3D, clube de vantagens, WhatsApp por unidade, status de aberto/fechado e página de história com linha do tempo.",
  id: "sorveteria-frescor",
  name: "Frescor — Sorveteria, Açaí e Pizza",
  preview: PREVIEW,
  site,
  tags: ["Landing", "Restaurante"],
};
