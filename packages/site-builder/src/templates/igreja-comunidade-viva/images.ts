/**
 * Todas as imagens do template Comunidade Viva passam por aqui: é o único lugar para trocar os placeholders. Fotos:
 * Unsplash (IDs conferidos um a um, olhando a imagem), só como exemplo — troque pelas fotos da igreja. Logos e favicon
 * são SVG gerados aqui (nada vem do site de referência).
 */
const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

/** Monograma "CV" com uma chama (64 × 64): C aberto, V e a chama acima dele. */
const mark = (ink: string, flame: string) =>
  `<path d="M27 19a14 14 0 1 0 0 26" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>` +
  `<path d="M36 26l8.5 22L53 26" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M44.5 5c4.2 4.2 6.2 7.4 6.2 10.4a6.2 6.2 0 0 1-12.4 0c0-3 2-6.2 6.2-10.4z" fill="${flame}"/>`;

const TEAL = "#1E6687";

export const IMG = {
  favicon: svg(mark(TEAL, "#2C8DB5"), 64, 64),
  /** Logo-ícone da barra (52px). */
  icon: svg(mark(TEAL, "#2C8DB5"), 64, 64),
  /** Logo horizontal do hero (~330 × 60). */
  logoH: svg(
    `<g transform="translate(0 2) scale(.9)">${mark(TEAL, "#2C8DB5")}</g>` +
      `<text x="68" y="42" font-family="Poppins,Trebuchet MS,Arial,sans-serif" font-weight="700" font-size="30" fill="${TEAL}">Comunidade Viva</text>`,
    330,
    60
  ),
  /** Logo vertical branco do rodapé (~100px). */
  logoV: svg(
    `<g transform="translate(48 0)">${mark("#fff", "#9fd3e8")}</g>` +
      `<text x="80" y="92" text-anchor="middle" font-family="Poppins,Trebuchet MS,Arial,sans-serif" font-weight="700" font-size="19" fill="#fff">Comunidade</text>` +
      `<text x="80" y="114" text-anchor="middle" font-family="Poppins,Trebuchet MS,Arial,sans-serif" font-weight="300" font-size="19" fill="#fff" letter-spacing="6">VIVA</text>`,
    160,
    124
  ),
} as const;

/** Foto da liderança: palco em roxo e azul (recorte em pé). */
export const LEADERS = unsplash("1516450360452-9312f5e86fc7", 900, 1300);
/** Miniatura do vídeo de boas-vindas. */
export const VIDEO_THUMB = unsplash("1515187029135-18ee286d815b", 464, 220);
/** Louvor em palco com plateia (banner). */
export const WORSHIP = unsplash("1438232992991-995b7058bbb3", 1920, 1080);

/** Fotos dos seis cartões do "Explore mais conteúdo" (16:9). */
export const CARDS = {
  book: unsplash("1491841550275-ad7854e35ca6", 800, 450),
  gallery: unsplash("1531058020387-3be344556be6", 800, 450),
  program: unsplash("1501281668745-f7f57925c3b4", 800, 450),
  social: unsplash("1544027993-37dbfe43562a", 800, 450),
  startups: unsplash("1559223607-a43c990c692c", 800, 450),
  visit: unsplash("1519491050282-cf00c82424b4", 800, 450),
} as const;

export const CHURCH = unsplash("1519491050282-cf00c82424b4", 1200, 800);
export const GROUP = unsplash("1522202176988-66273c2fd55f", 1400, 700);
export const CALENDAR = unsplash("1435527173128-983b87201f4d", 1800, 400);
export const FRIENDS = unsplash("1543269865-cbf427effbad", 1200, 600);
export const PREVIEW = unsplash("1516450360452-9312f5e86fc7", 1200, 800);
