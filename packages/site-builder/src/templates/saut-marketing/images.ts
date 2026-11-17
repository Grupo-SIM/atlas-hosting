/**
 * Todas as imagens do template SAUT passam por aqui: é o único lugar para trocar. De onde vem cada uma:
 * - **SAUT** (`UPLOADS`, link direto como os outros templates do grupo): logos, a capa do hero e as imagens que a própria
 *   SAUT produziu.
 * - **Unsplash** (IDs já usados e conferidos em outros templates): serviços, fotos de pessoas e avatares. O site da SAUT foi montado
 *   sobre um kit comercial de Elementor; as fotos, os ícones, os padrões e os avatares do kit **não** vêm para cá.
 * - **Logos de clientes**: 8 wordmarks fictícios em SVG (o site da SAUT mostra marcas reais de terceiros, que não cabem num template).
 */
const UPLOADS = "https://sautmarketing.com/wp-content/uploads";

const unsplash = (id: string, w = 1200, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

const FONT = "Arial,Helvetica,sans-serif";

/** Wordmark neutro: um símbolo geométrico + o nome. */
const wordmark = (name: string, color: string, glyph: string, weight = 700) =>
  svg(
    `${glyph.replaceAll("{c}", color)}<text x="60" y="49" font-family="${FONT}" font-weight="${weight}" font-size="38" letter-spacing="-1" fill="${color}">${name}</text>`,
    60 + name.length * 24 + 12,
    72
  );

const G = {
  arc: `<path d="M8 52a22 22 0 0 1 44 0z" fill="{c}"/>`,
  bars: `<rect x="8" y="14" width="10" height="44" rx="3" fill="{c}"/><rect x="25" y="26" width="10" height="32" rx="3" fill="{c}" opacity=".7"/><rect x="42" y="38" width="10" height="20" rx="3" fill="{c}" opacity=".45"/>`,
  circle: `<circle cx="30" cy="36" r="22" fill="none" stroke="{c}" stroke-width="8"/>`,
  diamond: `<path d="M30 10 54 36 30 62 6 36z" fill="{c}"/>`,
  dots: `<circle cx="18" cy="26" r="9" fill="{c}"/><circle cx="42" cy="26" r="9" fill="{c}" opacity=".6"/><circle cx="30" cy="48" r="9" fill="{c}" opacity=".35"/>`,
  hex: `<path d="M30 10 50 22v28L30 62 10 50V22z" fill="none" stroke="{c}" stroke-width="8" stroke-linejoin="round"/>`,
  tri: `<path d="M30 12 54 58H6z" fill="{c}"/>`,
  wave: `<path d="M6 40q12-24 24 0t24 0" fill="none" stroke="{c}" stroke-width="9" stroke-linecap="round"/>`,
};

export const CLIENT_LOGOS = [
  { alt: "Norte", src: wordmark("Norte", "#1F2A44", G.arc) },
  { alt: "Lumen", src: wordmark("Lumen", "#C2410C", G.circle) },
  { alt: "Vértice", src: wordmark("Vértice", "#0F766E", G.tri) },
  { alt: "Órbita", src: wordmark("Órbita", "#4338CA", G.hex) },
  { alt: "Aurora", src: wordmark("Aurora", "#BE185D", G.wave) },
  { alt: "Kora", src: wordmark("Kora", "#111827", G.diamond, 800) },
  { alt: "Nimbo", src: wordmark("Nimbo", "#0369A1", G.dots) },
  { alt: "Pulso", src: wordmark("Pulso", "#15803D", G.bars) },
];

export const IMG = {
  aboutPhoto: `${UPLOADS}/2026/08/ChatGPT-Image-3-de-ago.-de-2026-19_34_56-e1785803781419.png`,
  /** Retratos pequenos (hero e "Por que escolher"). */
  avatars: [
    { name: "Marina", src: unsplash("1494790108377-be9c29b29330", 160, 160) },
    { name: "Rafael", src: unsplash("1500648767791-00dcc994a43e", 160, 160) },
    { name: "Camila", src: unsplash("1438761681033-6461ffad8d80", 160, 160) },
    { name: "Bruno", src: unsplash("1507003211169-0a1dd7228f2d", 160, 160) },
  ],
  /** Capa do hero (céu com nuvens e campo verde). */
  capa: `${UPLOADS}/2026/07/capa.png`,
  caseAtlas: `${UPLOADS}/2026/08/banner-site.png`,
  caseZyrion: `${UPLOADS}/2026/08/ChatGPT-Image-3-de-ago.-de-2026-19_31_45-e1786052598411.png`,
  ctaPhoto: unsplash("1522071820081-009f0129c71c", 1160, 858),
  favicon: `${UPLOADS}/2026/08/certa-e1785990685112-300x128.png`,
  heroPhoto: `${UPLOADS}/2026/08/ChatGPT-Image-31-de-jul.-de-2026-19_54_46-e1785545740170.png`,
  impactPhoto: unsplash("1522202176988-66273c2fd55f", 1000, 764),
  logo: `${UPLOADS}/2026/08/certa-e1785990685112.png`,
  logoWhite: `${UPLOADS}/2026/07/SAUT-1-LOGO-273-x-50-px-1.png`,
  services: [
    unsplash("1579621970563-ebec7560ff3e", 800, 900),
    unsplash("1498075702571-ecb018f3752d", 800, 900),
    unsplash("1460925895917-afdab827c52f", 800, 900),
    unsplash("1677442136019-21780ecad995", 800, 900),
  ],
  whyPhoto: unsplash("1492691527719-9d1e07e534b4", 800, 746),
};
