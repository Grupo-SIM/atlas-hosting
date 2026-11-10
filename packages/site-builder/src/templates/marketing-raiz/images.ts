/**
 * Todas as imagens do template. As do blog ainda apontam para o WordPress original (copiar para o storage —
 * lista em `plans/marketingraiz-imagens.md`); as da série Prison Break do original foram trocadas por placeholders
 * gerados aqui (SVG em `data:`, sem `;` por causa do `cssUrl`).
 */
const WP = "https://marketingraiz.com/wp-content/uploads";

const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`
  )}`;

const gradient = (a: string, b: string) =>
  `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`;

export const IMG = {
  avatars: [
    `${WP}/2025/02/WhatsApp-Image-2025-02-11-at-15.57.54.jpeg`,
    `${WP}/2025/02/WhatsApp-Image-2025-02-11-at-16.12.16.jpeg`,
    `${WP}/2025/02/WhatsApp-Image-2025-02-11-at-16.01.40.jpeg`,
    `${WP}/2025/02/WhatsApp-Image-2025-02-11-at-16.01.07.jpeg`,
  ],
  bannerBlogs: `${WP}/2025/04/06_result.webp`,
  /** Banner de título de /categorias/ e de /blogs/ (e demais páginas internas). */
  bannerCategories: `${WP}/2025/06/categoria.jpeg`,
  bio: `${WP}/2025/02/Frame-2-1-300x276.png`,
  blogs: {
    central: `${WP}/2025/04/centraldomarketingblog-1.webp`,
    renovada: `${WP}/2025/04/renovadablog-1.png`,
    seguidores: `${WP}/2025/04/seguidoresemaltablog-1.webp`,
    spy: `${WP}/2025/04/007spyhackerblog-1.webp`,
    zyrion: `${WP}/2025/06/Zyrion-Logo.jpg`,
  },
  categories: {
    estudos: `${WP}/2025/04/image_fx-3.webp`,
    "funil-de-vendas": `${WP}/2025/04/image_fx-4.webp`,
    marketing: `${WP}/2025/04/image_fx-2.webp`,
    vendas: `${WP}/2025/04/image_fx-1.webp`,
  },
  /** Fundo escuro das páginas de funil (no lugar das fotos da série do original). */
  funnelBg: svg(gradient("#050505", "#1b1233"), 1600, 900),
  /** Foto do hero: Unsplash (Hannah Wei), licença Unsplash. */
  hero: `${WP}/2025/02/hannah-wei-aso6SYJZGps-unsplash-1-1-scaled.jpg`,
  logo: `${WP}/2025/02/cropped-logo-marketing-raiz-a-verdade-sobre-como-vender-na-internet-de-verdade2-1.webp`,
  logoFooter: `${WP}/2025/02/logo-MarketingRaiz-footer-branca.png`,
  /** Imagem da 404 (promo do original). */
  notFound: `${WP}/2025/02/lucre-todo-dia-com-o-insta-fun-fortune-sem-expor-seu-rosto-ganhe-hoje-muita-grana.webp`,
  /** Banner da lateral (/plano/ no original: arte da série; aqui, placeholder). */
  sideBanner: svg(
    `${gradient("#6617ff", "#1c244b")}<text x="50%" y="42%" fill="#fff" font-family="Arial,sans-serif" font-size="52" font-weight="700" text-anchor="middle">Descubra seu</text><text x="50%" y="52%" fill="#fab837" font-family="Arial,sans-serif" font-size="64" font-weight="700" text-anchor="middle">perfil de vendedor</text>`,
    768,
    839
  ),
  /** Slides do carrossel de produtos (a ordem das páginas de destino está em `index.ts`). */
  slides: [
    `${WP}/2025/02/1.png`,
    `${WP}/2025/02/2.png`,
    `${WP}/2025/02/3.png`,
    `${WP}/2025/02/4-1.png`,
    `${WP}/2025/02/8-1.png`,
  ],
} as const;
