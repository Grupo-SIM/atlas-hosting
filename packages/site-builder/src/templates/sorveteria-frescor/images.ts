/**
 * Todas as imagens do template Frescor passam por aqui: é o único lugar para trocar os placeholders. Fotos:
 * Unsplash (IDs conferidos um a um), só como exemplo — troque pelas fotos da loja. Logo, favicon e mascote do clube
 * são SVG gerados aqui (nada vem do site de referência). O logotipo "Frescor" é o contorno (path) da fonte Luckiest
 * Guy (licença OFL), para aparecer certo mesmo dentro de um `<img>`, onde fonte da web não carrega.
 *
 * Os slides e os cartões pedem produto **recortado**; no Unsplash não achei recortes bons, então as fotos entram
 * quadradas, com cantos arredondados e sombra (o CSS da variante cuida disso).
 */
const unsplash = (id: string, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

/** "Frescor" em Luckiest Guy (400), contorno da fonte, 100px de corpo. */
const WORD =
  "M3.7 -70.4L48.7 -70.4Q48.4 -65.8 48.2 -61.3Q47.9 -56.8 47.6 -52.2L47.6 -52.2L26.9 -51.2L26.9 -45L44.8 -45L43.8 -29.9L26.8 -29.4L26.9 -0.5L2.1 0L3.7 -70.4M108.4 -47.1L108.4 -47.1Q108.4 -43.3 107.8 -40.2Q107.1 -37.1 105.7 -34.5Q104.3 -31.9 102.1 -29.7Q99.8 -27.5 96.6 -25.5L96.6 -25.5L108.3 -4.8L86.3 -0.5L78.8 -21.3L72.7 -21.1L71.8 -0.8L50.8 -0.8Q51.1 -11.9 51.3 -22.9Q51.5 -34 51.8 -45.1L51.8 -45.1Q51.9 -50.7 52 -56.2Q52.1 -61.8 52.4 -67.4L52.4 -67.4Q55.8 -68.7 59.1 -69.5Q62.5 -70.3 65.8 -70.8Q69.1 -71.2 72.6 -71.4Q76 -71.6 79.6 -71.6L79.6 -71.6Q85.2 -71.6 90.4 -70Q95.6 -68.5 99.6 -65.4Q103.6 -62.4 106 -57.8Q108.4 -53.2 108.4 -47.1M86.6 -45.5L86.6 -45.5Q86.6 -47.6 86 -49.3Q85.4 -51 84.4 -52.2Q83.3 -53.5 81.6 -54.2Q80 -54.9 77.8 -54.9L77.8 -54.9Q76.8 -54.9 75.9 -54.8Q75 -54.6 74.1 -54.4L74.1 -54.4L73.3 -36.2L74.5 -36.2Q76.6 -36.2 78.7 -36.8Q80.9 -37.3 82.6 -38.4Q84.4 -39.6 85.5 -41.3Q86.6 -43.1 86.6 -45.5M165.8 -39.5L165.8 -39.5Q165.8 -35.2 165.2 -31L165.2 -31Q156.9 -30.4 148.6 -29.2Q140.4 -28 132.1 -26.9L132.1 -26.9Q133.4 -23.3 136.1 -21.2Q138.8 -19.1 142.6 -19.1L142.6 -19.1Q144.5 -19.1 146.9 -19.9Q149.2 -20.6 151.5 -21.7Q153.8 -22.8 155.9 -24.1Q158 -25.3 159.5 -26.4L159.5 -26.4L157.1 -4.2Q155.2 -2.7 153 -1.7Q150.8 -0.7 148.4 0Q146 0.6 143.6 0.9Q141.1 1.2 138.8 1.2L138.8 1.2Q133.9 1.2 129.9 -0.1Q125.9 -1.5 122.7 -3.8Q119.4 -6.2 117 -9.4Q114.6 -12.6 112.9 -16.5Q111.3 -20.3 110.5 -24.5Q109.7 -28.8 109.7 -33.1L109.7 -33.1Q109.7 -37.6 110.5 -42.2Q111.3 -46.7 113 -50.9Q114.7 -55.1 117.3 -58.7Q119.8 -62.3 123.2 -65Q126.7 -67.7 131 -69.2Q135.3 -70.7 140.5 -70.7L140.5 -70.7Q144.9 -70.7 148.5 -69.5Q152.1 -68.3 154.9 -66.2Q157.7 -64.1 159.7 -61.1Q161.8 -58.2 163.2 -54.7Q164.5 -51.2 165.2 -47.3Q165.8 -43.5 165.8 -39.5M146.3 -40.9L146.3 -42Q146.3 -43.4 146 -44.8Q145.7 -46.2 145 -47.4Q144.4 -48.6 143.3 -49.3Q142.2 -50.1 140.6 -50.1L140.6 -50.1Q138.7 -50.1 137.2 -49Q135.7 -48 134.6 -46.4Q133.5 -44.8 132.9 -43Q132.2 -41.1 131.8 -39.6L131.8 -39.6L146.3 -40.9M219 -25L219 -25Q219 -18.3 216.7 -13.5Q214.4 -8.6 210.4 -5.4Q206.3 -2.3 201 -0.8Q195.6 0.7 189.4 0.7L189.4 0.7Q187 0.7 184.1 0Q181.3 -0.6 178.3 -1.5Q175.4 -2.5 172.7 -3.6Q170 -4.7 167.9 -5.7L167.9 -5.7L170 -24.8Q174.2 -22.3 179.2 -21Q184.3 -19.7 189.2 -19.7L189.2 -19.7Q190.1 -19.7 191.4 -19.8Q192.7 -19.9 193.9 -20.2Q195.1 -20.6 195.9 -21.3Q196.8 -22.1 196.8 -23.4L196.8 -23.4Q196.8 -24.4 196.2 -25Q195.6 -25.7 194.7 -26.1Q193.8 -26.5 192.6 -26.7Q191.4 -27 190.3 -27.1Q189.2 -27.1 188.2 -27.1Q187.2 -27.1 186.6 -27.1L186.6 -27.1Q182.4 -27.1 179 -28.5Q175.5 -29.8 173.1 -32.2Q170.6 -34.6 169.2 -38.1Q167.9 -41.5 167.9 -45.7L167.9 -45.7Q167.9 -51.5 170.2 -56Q172.5 -60.6 176.4 -63.8Q180.3 -67 185.3 -68.7Q190.3 -70.4 195.7 -70.4L195.7 -70.4Q198.1 -70.4 200.6 -70.2Q203.2 -70.1 205.7 -69.6Q208.2 -69.2 210.6 -68.5Q213 -67.8 215.1 -66.8L215.1 -66.8L213.3 -47Q210 -48.1 206.3 -48.9Q202.7 -49.6 199.2 -49.6L199.2 -49.6Q198.6 -49.6 197.6 -49.6Q196.6 -49.6 195.5 -49.4Q194.4 -49.3 193.3 -49.1Q192.1 -48.8 191.3 -48.4Q190.4 -48 189.8 -47.3Q189.3 -46.6 189.4 -45.7L189.4 -45.7Q189.4 -44.6 190.2 -44Q190.9 -43.5 192.1 -43.2Q193.3 -42.9 194.8 -42.9Q196.2 -42.9 197.6 -43Q199 -43.1 200.2 -43.1Q201.5 -43.2 202.2 -43.2L202.2 -43.2Q206.2 -42.9 209.3 -41.5Q212.4 -40.1 214.6 -37.7Q216.7 -35.4 217.9 -32.2Q219 -28.9 219 -25M268.8 -66.7L268.8 -66.7L267 -46.1Q265.6 -46.5 264.2 -46.6Q262.8 -46.8 261.4 -46.8L261.4 -46.8Q258 -46.8 254.8 -45.9Q251.7 -45 249.2 -43.2Q246.8 -41.4 245.4 -38.6Q243.9 -35.9 243.9 -32.1L243.9 -32.1Q243.9 -29.4 244.8 -27.4Q245.6 -25.3 247 -24Q248.5 -22.7 250.7 -22Q252.8 -21.3 255.4 -21.3L255.4 -21.3Q257.2 -21.3 259.1 -21.7Q261 -22 262.9 -22.7Q264.8 -23.3 266.6 -24.1Q268.3 -25 269.8 -25.9L269.8 -25.9L269 -2.9Q267.1 -2 264.9 -1.2Q262.7 -0.4 260.4 0.1Q258.1 0.7 255.8 1Q253.5 1.3 251.4 1.3L251.4 1.3Q244.4 1.3 238.7 -1.3Q233.1 -3.9 229 -8.4Q224.9 -12.8 222.7 -18.7Q220.4 -24.7 220.4 -31.3L220.4 -31.3Q220.4 -39.4 222.7 -46.3Q225 -53.2 229.4 -58.3Q233.8 -63.4 240.3 -66.3Q246.8 -69.2 255.3 -69.2L255.3 -69.2Q258.6 -69.2 262.1 -68.7Q265.6 -68.2 268.8 -66.7M333 -37.4L333 -37.4Q333 -33 331.9 -28.8Q330.9 -24.7 329 -21.1Q327.1 -17.5 324.3 -14.5Q321.5 -11.5 318.1 -9.3Q314.6 -7.2 310.6 -6Q306.5 -4.8 302 -4.8L302 -4.8Q297.6 -4.8 293.6 -5.9Q289.6 -7 286.2 -9.1Q282.7 -11.1 279.9 -13.9Q277.1 -16.8 275.1 -20.3Q273.1 -23.8 272 -27.8Q270.9 -31.8 270.9 -36.1L270.9 -36.1Q270.9 -40.4 272 -44.5Q273 -48.5 274.9 -52.1Q276.9 -55.8 279.6 -58.8Q282.3 -61.8 285.7 -64Q289.1 -66.2 293.1 -67.4Q297 -68.7 301.4 -68.7L301.4 -68.7Q308.5 -68.7 314.3 -66.5Q320.2 -64.3 324.3 -60.2Q328.4 -56.1 330.7 -50.3Q333 -44.5 333 -37.4M311.3 -36.1L311.3 -36.1Q311.3 -38.2 310.7 -40.2Q310.1 -42.2 308.9 -43.7Q307.7 -45.3 306 -46.2Q304.2 -47.2 302 -47.2L302 -47.2Q299.7 -47.2 297.9 -46.3Q296.1 -45.5 294.8 -44.1Q293.5 -42.6 292.8 -40.7Q292.1 -38.8 292.1 -36.6L292.1 -36.6Q292.1 -34.6 292.7 -32.5Q293.3 -30.5 294.5 -28.8Q295.7 -27.1 297.4 -26.1Q299.1 -25.1 301.4 -25.1L301.4 -25.1Q303.7 -25.1 305.5 -26Q307.4 -26.9 308.6 -28.4Q309.9 -30 310.6 -32Q311.3 -34 311.3 -36.1M393.6 -47.1L393.6 -47.1Q393.6 -43.3 392.9 -40.2Q392.3 -37.1 390.9 -34.5Q389.5 -31.9 387.2 -29.7Q385 -27.5 381.8 -25.5L381.8 -25.5L393.4 -4.8L371.4 -0.5L363.9 -21.3L357.9 -21.1L357 -0.8L336 -0.8Q336.2 -11.9 336.5 -22.9Q336.7 -34 337 -45.1L337 -45.1Q337.1 -50.7 337.2 -56.2Q337.3 -61.8 337.5 -67.4L337.5 -67.4Q341 -68.7 344.3 -69.5Q347.6 -70.3 351 -70.8Q354.3 -71.2 357.7 -71.4Q361.2 -71.6 364.8 -71.6L364.8 -71.6Q370.4 -71.6 375.6 -70Q380.8 -68.5 384.8 -65.4Q388.8 -62.4 391.2 -57.8Q393.6 -53.2 393.6 -47.1M371.7 -45.5L371.7 -45.5Q371.7 -47.6 371.2 -49.3Q370.6 -51 369.5 -52.2Q368.4 -53.5 366.8 -54.2Q365.1 -54.9 362.9 -54.9L362.9 -54.9Q362 -54.9 361 -54.8Q360.1 -54.6 359.2 -54.4L359.2 -54.4L358.4 -36.2L359.6 -36.2Q361.7 -36.2 363.9 -36.8Q366.1 -37.3 367.8 -38.4Q369.5 -39.6 370.6 -41.3Q371.7 -43.1 371.7 -45.5";

/** Floco de neve: 3 eixos com pontinhas, centrado em (cx, cy). */
const flake = (cx: number, cy: number, r: number) =>
  [0, 60, 120]
    .map(
      deg =>
        `<g transform="rotate(${deg} ${cx} ${cy})"><path d="M${cx},${cy - r}L${cx},${cy + r}"/><path d="M${cx - r * 0.26},${cy - r * 0.72}L${cx},${cy - r * 0.46}L${cx + r * 0.26},${cy - r * 0.72}"/><path d="M${cx - r * 0.26},${cy + r * 0.72}L${cx},${cy + r * 0.46}L${cx + r * 0.26},${cy + r * 0.72}"/></g>`
    )
    .join("");

/** Logo (420 × 360): floco amarelo com contorno azul no alto e o nome embaixo (azul com contorno amarelo). */
const LOGO = svg(
  `<defs><path d="${WORD}" id="w" transform="translate(12.1 300)"/></defs>` +
    `<g fill="none" stroke="#0012FF" stroke-linecap="round" stroke-linejoin="round" stroke-width="26">${flake(210, 105, 82)}</g>` +
    `<g fill="none" stroke="#FFED00" stroke-linecap="round" stroke-linejoin="round" stroke-width="13">${flake(210, 105, 82)}</g>` +
    `<use fill="#0012FF" href="#w" stroke="#0012FF" stroke-linejoin="round" stroke-width="22"/>` +
    `<use fill="#0012FF" href="#w" paint-order="stroke" stroke="#FFED00" stroke-linejoin="round" stroke-width="12"/>`,
  420,
  360
);

/** Favicon: floco amarelo num círculo azul. */
const FAVICON = svg(
  `<circle cx="32" cy="32" fill="#0012FF" r="30"/><g fill="none" stroke="#FFED00" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.500" transform="translate(32 32) scale(.34) translate(-210 -105)">${flake(210, 105, 82)}</g>`,
  64,
  64
);

/** Mascote do clube: um picolé azul com cobertura amarela e rosto sorridente (200 × 260). */
const MASCOT = svg(
  `<defs><linearGradient id="b" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#00E5FF"/><stop offset="1" stop-color="#3342FF"/></linearGradient></defs>` +
    `<rect fill="#F3D9A4" height="64" rx="11" stroke="#D9B877" stroke-width="4" width="26" x="87" y="190"/>` +
    `<path d="M40 100a60 60 0 0 1 120 0v92a12 12 0 0 1-12 12H52a12 12 0 0 1-12-12z" fill="url(#b)" stroke="#0012FF" stroke-linejoin="round" stroke-width="6"/>` +
    `<path d="M40 100a60 60 0 0 1 120 0v14q-15 14-30 0q-15 22-30 0q-15 14-30 0q-15 22-30 0z" fill="#FFED00" stroke="#0012FF" stroke-linejoin="round" stroke-width="6"/>` +
    `<rect fill="#fff" height="62" opacity=".35" rx="7" width="14" x="58" y="132"/>` +
    `<circle cx="78" cy="148" fill="#1A1A2E" r="9"/><circle cx="122" cy="148" fill="#1A1A2E" r="9"/>` +
    `<circle cx="81" cy="145" fill="#fff" r="3"/><circle cx="125" cy="145" fill="#fff" r="3"/>` +
    `<path d="M82 166q18 18 36 0" fill="none" stroke="#1A1A2E" stroke-linecap="round" stroke-width="5"/>` +
    `<circle cx="64" cy="168" fill="#FF8FB1" opacity=".85" r="7"/><circle cx="136" cy="168" fill="#FF8FB1" opacity=".85" r="7"/>`,
  200,
  260
);

export const IMG = {
  favicon: FAVICON,
  /** Logo do cabeçalho (160px de largura) e do menu do celular (140px). */
  logo: LOGO,
  /** Mascote do cartão do clube. */
  mascot: MASCOT,
} as const;

/** Slides do hero: produto + degradê + cor do botão. */
export const SLIDES = [
  {
    alt: "Tigela de açaí com frutas e granola",
    btnBg: "#0012FF",
    btnFg: "#FFFFFF",
    c1: "#FFE100",
    c2: "#FFB800",
    c3: "#FF9500",
    ctaLabel: "Pedir agora",
    ctaUrl: "#cardapio",
    image: unsplash("1494597564530-871f2b93ac55"),
    line1: "O melhor açaí da cidade,",
    line2: "monte do seu jeito!",
    smoke: "no",
    word: "AÇAÍ",
  },
  {
    alt: "Bolas de sorvete artesanal numa taça",
    btnBg: "#FFED00",
    btnFg: "#0012FF",
    c1: "#00E5FF",
    c2: "#007BFF",
    c3: "#0050DD",
    ctaLabel: "Pedir agora",
    ctaUrl: "#cardapio",
    image: unsplash("1570197788417-0e82375c9371"),
    line1: "Prove nossos sabores",
    line2: "artesanais exclusivos!",
    smoke: "no",
    word: "SORVETE",
  },
  {
    alt: "Pizza redonda com manjericão",
    btnBg: "#FFED00",
    btnFg: "#0012FF",
    c1: "#FF4500",
    c2: "#E33E2B",
    c3: "#C22F20",
    ctaLabel: "Pedir agora",
    ctaUrl: "#cardapio",
    image: unsplash("1604382354936-07c5d9983bd3"),
    line1: "Sabor irresistível",
    line2: "para dividir com a galera!",
    smoke: "yes",
    word: "PIZZA",
  },
];

/** Imagens dos cartões das unidades (sem fachada boa no Unsplash: balcão, casquinhas e taça). */
export const UNIT_IMAGES = [
  unsplash("1567206563064-6f60f40a2b57", 700, 700),
  unsplash("1629385701021-fcd568a743e8", 700, 700),
  unsplash("1563805042-7684c019e1cb", 700, 700),
];

/** Fotos da história: a 1ª é larga (equipe), as outras são quadradas. */
export const STORY_PHOTOS = [
  {
    alt: "Equipe sorrindo em volta da mesa",
    image: unsplash("1522202176988-66273c2fd55f", 1200, 720),
  },
  {
    alt: "Atendimento no balcão da sorveteria",
    image: unsplash("1556742049-0cfed4f6a45d", 700, 700),
  },
  {
    alt: "Balcão com sabores de sorvete artesanal",
    image: unsplash("1567206563064-6f60f40a2b57", 700, 700),
  },
];

/** Miniatura da galeria de templates (usada só se a imagem pré-gerada faltar). */
export const PREVIEW = unsplash("1570197788417-0e82375c9371", 1200, 800);
