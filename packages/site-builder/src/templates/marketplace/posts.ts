import type { Category, Post } from "../../model/index.js";
import { IMG } from "./images.js";

/**
 * Produtos do Marketplace (posts do WordPress original). A página de cada produto só incorpora o site
 * dele (bloco `siteEmbed`), como no original. O modelo tem uma categoria por post: quem tinha mais de uma
 * ficou na que o original usa na página da categoria (Seo Pack → Sistemas, Habilidades → Desenv. Pessoal).
 */

/** Ordem e nomes das categorias (como em /categorias/). "Sem categoria" fica de fora. */
export const CATEGORIES: [slug: string, name: string][] = [
  ["dinheiro-e-financas", "Dinheiro e Finanças"],
  ["marketing", "Marketing"],
  ["desenvolvimento-pessoal", "Desenvolvimento Pessoal"],
  ["sistemas", "Sistemas"],
  ["saude-e-fitness", "Saúde e Fitness"],
  ["cursos-profissionalizantes", "Cursos Profissionalizantes"],
  ["servicos", "Serviços"],
  ["outros", "Outros"],
];

export const categories: Category[] = CATEGORIES.map(([slug, name]) => ({
  id: `cat-${slug}`,
  name,
  slug,
}));

interface ProductSeed {
  category: string;
  /** AAAA-MM-DD (data de publicação no original). */
  date: string;
  /** Resumo: o texto do cartão da home quando o produto aparece lá (o WordPress não tem resumo). */
  excerpt?: string;
  slug: string;
  title: string;
  /** Site do produto, incorporado na página dele. */
  url: string;
}

const PRODUCTS: ProductSeed[] = [
  {
    category: "sistemas",
    date: "2026-06-10",
    slug: "botzappy",
    title: "BotZappy",
    url: "https://botzappy.com.br/",
  },
  {
    category: "servicos",
    date: "2026-06-10",
    slug: "sim-intermediacoes",
    title: "Empresa de Serviços – Marketing e Tecnologia",
    url: "https://simintermediacoes.com/",
  },
  {
    category: "sistemas",
    date: "2025-04-24",
    slug: "seo-pack",
    title: "Seo Pack",
    url: "https://seopack.org/?r=kOYVgkoc",
  },
  {
    category: "sistemas",
    date: "2025-04-24",
    slug: "pagatg",
    title: "PagaTG",
    url: "https://pagatg.com/",
  },
  {
    category: "marketing",
    date: "2025-04-24",
    slug: "viralpack",
    title: "ViralPack",
    url: "https://viralpack.centraldomarketing.com/",
  },
  {
    category: "sistemas",
    date: "2025-04-07",
    slug: "atlashosting",
    title: "AtlasHosting",
    url: "https://atlashosting.com.br/",
  },
  {
    category: "sistemas",
    date: "2025-04-07",
    slug: "controle-patrimonial",
    title: "Controle Patrimonial",
    url: "https://controlepatrimonial.simintermediacoes.com/",
  },
  {
    category: "sistemas",
    date: "2025-04-07",
    slug: "controle-de-motoristas",
    title: "Controle de Motoristas",
    url: "https://motorista.simintermediacoes.com/",
  },
  {
    category: "sistemas",
    date: "2025-04-07",
    slug: "areaflix-area-de-membros",
    title: "ÁreaFlix – Área de Membros",
    url: "https://areaflix.simintermediacoes.com/",
  },
  {
    category: "marketing",
    date: "2025-04-07",
    excerpt: "Qual o tamanho da sua curiosidade sobre esse outro mundo?",
    slug: "o-outro-lado-da-internet",
    title: "O outro lado da internet",
    url: "https://lp.centraldomarketing.com/ebook-o-outro-lado-da-internet/",
  },
  {
    category: "desenvolvimento-pessoal",
    date: "2025-04-07",
    slug: "ebook-habilidades-de-comunicacao",
    title: "Habilidades de Comunicação",
    url: "https://lp.centraldomarketing.com/ebook-habilidades-de-comunicacao/",
  },
  {
    category: "outros",
    date: "2025-04-07",
    slug: "757-presets",
    title: "757 Presets",
    url: "https://757presets.centraldomarketing.com/",
  },
  {
    category: "dinheiro-e-financas",
    date: "2025-04-07",
    excerpt:
      "Um universo de oportunidades, onde você pode lucrar em tempo recorde sem se expor.",
    slug: "insta-fan-fortune",
    title: "Insta Fan Fortune",
    url: "https://lp.centraldomarketing.com/instafanfortune/",
  },
  {
    category: "marketing",
    date: "2025-04-05",
    slug: "e-book-vsl-milionario",
    title: "VSL Milionário",
    url: "https://ebookvslmilionario.centraldomarketing.com/",
  },
  {
    category: "marketing",
    date: "2025-04-05",
    excerpt:
      "Por que manipular você é tão FÁCIL? Descubra como o inconsciente toma essas decisões.",
    slug: "ebook-gatilhos-mentais",
    title: "Gatilhos Mentais",
    url: "https://ebookgatilhosmentais.centraldomarketing.com/",
  },
  {
    category: "cursos-profissionalizantes",
    date: "2025-04-05",
    slug: "academia-do-corte",
    title: "Academia do Corte",
    url: "https://academiadocorte.centraldomarketing.com/",
  },
];

/** Hora fixa para a ordem dos produtos do mesmo dia seguir a do original (mais novo primeiro). */
const at = (date: string, i: number) =>
  `${date}T${String(23 - (i % 24)).padStart(2, "0")}:00:00.000Z`;

export const posts: Post[] = PRODUCTS.map((p, i) => ({
  blocks: [
    {
      id: `mk-post-${p.slug}`,
      props: {
        height: 900,
        linkLabel: "Abrir o site em nova aba",
        title: p.title,
        url: p.url,
      },
      type: "siteEmbed",
    },
  ],
  categoryId: `cat-${p.category}`,
  coverImage: IMG.product(p.slug),
  excerpt: p.excerpt ?? "",
  id: `post-${p.slug}`,
  publishedAt: at(p.date, i),
  slug: p.slug,
  status: "published",
  title: p.title,
}));
