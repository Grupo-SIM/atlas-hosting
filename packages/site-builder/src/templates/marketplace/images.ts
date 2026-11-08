/**
 * Todas as imagens do template Marketplace passam por aqui: é o único lugar para trocar os placeholders
 * pelas imagens reais (as do WordPress original estão listadas em `plans/marketplace-imagens.md` e só
 * entram depois de aprovadas e copiadas para o storage). Fotos: Unsplash (conferidas, HTTP 200). Logo,
 * selo "Powered by", enfeites do hero e arte do 404: SVG gerado aqui.
 */
import { BRAND } from "./brand.js";

const unsplash = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ""}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

const { accent, active, pink } = BRAND.colors;

/** Logo: "m" laranja com contorno branco e "marketplace" embaixo, como a do original. */
const logo = svg(
  `<text x="110" y="128" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="190" fill="${active}" stroke="#fff" stroke-width="7" paint-order="stroke" letter-spacing="-6">m</text><text x="110" y="176" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="38" fill="#fff" letter-spacing="-1">marketplace</text>`,
  220,
  190
);

/** Selo "Powered by": setas de velocidade + nome em gradiente rosa→roxo. */
const poweredBy = svg(
  `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#e5308f"/><stop offset="1" stop-color="#7b3fc4"/></linearGradient></defs><g fill="url(#g)"><path d="M70 40l26 28-26 28-10-10 16-18-16-18z"/><rect x="18" y="58" width="40" height="8" rx="4"/><rect x="30" y="72" width="28" height="8" rx="4"/><rect x="24" y="44" width="30" height="8" rx="4"/><circle cx="10" cy="48" r="4"/><circle cx="16" cy="76" r="4"/></g><text x="112" y="88" font-family="Arial,sans-serif" font-style="italic" font-weight="800" font-size="62" fill="url(#g)">SIMINT</text>`,
  360,
  136
);

/** Enfeite do hero: feixe de linhas finas curvas (o original usa uma PNG de linhas). */
const lines = (n: number, size: number) =>
  svg(
    `<g fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.2">${Array.from(
      { length: n },
      (_, i) =>
        `<ellipse cx="${size / 2}" cy="${size / 2}" rx="${size * 0.46 - i * 4}" ry="${size * 0.18 + i * 2}" transform="rotate(${-35 + i * 3} ${size / 2} ${size / 2})"/>`
    ).join("")}</g>`,
    size,
    size
  );

/** Arte do 404 (aparece bem apagada atrás do texto). */
const errorArt = svg(
  `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset=".05" stop-color="${accent}"/><stop offset=".8" stop-color="${pink}"/></linearGradient></defs><text x="260" y="300" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="230" fill="url(#g)">404</text><text x="260" y="380" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="56" letter-spacing="8" fill="#fff">NOT FOUND</text>`,
  520,
  520
);

/** Capas dos produtos (chave = slug do post). */
const PRODUCT_PHOTOS: Record<string, string> = {
  "757-presets": "1492691527719-9d1e07e534b4",
  "academia-do-corte": "1585747860715-2ba37e788b70",
  "areaflix-area-de-membros": "1516321318423-f06f85e504b3",
  atlashosting: "1558494949-ef010cbdcc31",
  botzappy: "1620712943543-bcc4688e7485",
  "controle-de-motoristas": "1449965408869-eaa3f722e40d",
  "controle-patrimonial": "1586528116311-ad8dd3c8310d",
  "e-book-vsl-milionario": "1554224155-6726b3ff858f",
  "ebook-gatilhos-mentais": "1634017839464-5c339ebe3cb4",
  "ebook-habilidades-de-comunicacao": "1544716278-ca5e3f4abd8c",
  "insta-fan-fortune": "1611162616305-c69b3fa7fbe0",
  "o-outro-lado-da-internet": "1526374965328-7f61d4dc18c5",
  pagatg: "1639322537228-f710d846310a",
  "seo-pack": "1531297484001-80022131f5a1",
  "sim-intermediacoes": "1517694712202-14dd9538aa97",
  viralpack: "1574717024653-61fd2cf4d44d",
};

/** Fotos das categorias (chave = slug da categoria). */
const CATEGORY_PHOTOS: Record<string, string> = {
  "cursos-profissionalizantes": "1524178232363-1fb2b075b655",
  "desenvolvimento-pessoal": "1506126613408-eca07ce68773",
  "dinheiro-e-financas": "1579621970563-ebec7560ff3e",
  marketing: "1611926653458-09294b3142bf",
  outros: "1504384308090-c894fdcc538d",
  "saude-e-fitness": "1571019613454-1cb2f99b2d8b",
  servicos: "1556761175-b413da4baf72",
  sistemas: "1555066931-4365d14bab8c",
};

/** Fotos dos cartões dos blogs parceiros. */
const PARTNER_PHOTOS = {
  central: "1677442136019-21780ecad995",
  marketingRaiz: "1434030216411-0b793f4b4173",
  renovada: "1438232992991-995b7058bbb3",
  seguidores: "1512941937669-90a1b58e7e9c",
  spy: "1614680376593-902f74cf0d41",
  zyrion: "1495020689067-958852a7765e",
} as const;

export const IMG = {
  avatar: unsplash("1620641788421-7a1c342ea42e", 120, 120),
  bannerLeft: unsplash("1618005182384-a83a8bd57fbe", 800, 900),
  bannerRight: unsplash("1635070041078-e363dbe005cb", 800, 900),
  /** Foto quadrada da categoria (home e /categorias/). */
  category: (slug: string) =>
    unsplash(CATEGORY_PHOTOS[slug] ?? CATEGORY_PHOTOS.outros, 768, 768),
  decorA: lines(14, 550),
  decorB: lines(9, 267),
  errorArt,
  errorBg: unsplash("1557682250-33bd709cbe85", 1600, 900),
  hero: unsplash("1535223289827-42f1e9919769", 900, 1200),
  /** Foto que aparece no lugar da do hero ao passar o mouse (no original: homem com óculos futuristas). */
  heroHover: unsplash("1593508512255-86ab42a8e620", 900, 1200),
  logo,
  partner: (key: keyof typeof PARTNER_PHOTOS) =>
    unsplash(PARTNER_PHOTOS[key], 800, 1080),
  poweredBy,
  /** Capa 16:9 do produto (grade, ranking). */
  product: (slug: string) =>
    unsplash(PRODUCT_PHOTOS[slug] ?? PRODUCT_PHOTOS.botzappy, 1200, 675),
  /** Mesma foto do produto em pé (cartões "TOP Produtos"). */
  productTall: (slug: string) =>
    unsplash(PRODUCT_PHOTOS[slug] ?? PRODUCT_PHOTOS.botzappy, 800, 1080),
  stars: unsplash("1419242902214-272b3f66ee7a", 1920, 1100),
  video: unsplash("1626785774573-4b799315345d", 1600, 900),
};
