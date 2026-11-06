/**
 * Todas as imagens do template passam por aqui: é o único lugar para trocar placeholders por
 * imagens reais (ou pelas do WordPress original, se forem aprovadas — ver
 * `plans/centraldomarketing-imagens.md`). Nada de URL de imagem solta nos outros arquivos.
 */
export const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

/** Fotos genéricas (marketing, tecnologia, escritório). Todas verificadas (HTTP 200). */
export const POOL_IDS = [
  "1460925895917-afdab827c52f",
  "1551288049-bebda4e38f71",
  "1432888498266-38ffec3eaf0a",
  "1519389950473-47ba0277781c",
  "1553877522-43269d4ea984",
  "1556761175-5973dc0f32e7",
  "1498050108023-c5249f4df085",
  "1504868584819-f8e8b4b6d7e3",
  "1522071820081-009f0129c71c",
  "1556155092-490a1ba16284",
  "1611162617213-7d7a39e9b1d7",
  "1486406146926-c627a92ad1ab",
  "1454165804606-c3d57bc86b40",
  "1488590528505-98d2b5aba04b",
  "1531403009284-440f080d1e12",
] as const;

/** i-ésima foto do conjunto (circula), para capas e imagens de posts. */
export const pool = (i: number, w = 1600) =>
  unsplash(POOL_IDS[Math.abs(i) % POOL_IDS.length], w);

/** Rostos para depoimentos e avatares. */
export const AVATARS = [
  "1494790108377-be9c29b29330",
  "1507003211169-0a1dd7228f2d",
  "1500648767791-00dcc994a43e",
  "1517048676732-d65bc937f952",
].map(id => unsplash(id, 200));

/** Textura escura de triângulos verdes (placeholder gerado, sem foto): fundo dos cartões e selos. */
const texture = () => {
  const tri = (pts: string, op: number) =>
    `<polygon points='${pts}' fill='#11e44f' fill-opacity='${op}'/>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'><rect width='400' height='300' fill='#0a1a10'/>${[
      tri("0,0 140,0 60,120", 0.34),
      tri("140,0 300,0 220,90", 0.16),
      tri("300,0 400,0 400,140", 0.28),
      tri("60,120 220,90 150,230", 0.2),
      tri("0,120 60,120 0,260", 0.3),
      tri("220,90 400,140 300,250", 0.14),
      tri("150,230 300,250 190,300", 0.3),
      tri("300,250 400,140 400,300", 0.22),
      tri("0,260 150,230 60,300", 0.18),
    ].join("")}</svg>`
  )}`;
};

export const IMG = {
  /** Fundo do banner de título (Blogs, Categorias, Termos, Post). */
  banner: unsplash("1550751827-4bd374c3f58b", 2000),
  /** Banner "lado invisível da tecnologia". */
  ctaBanner: unsplash("1563986768609-322da13575f3", 2000),
  /** Seção "Curiosidades". */
  curiosities: unsplash("1519389950473-47ba0277781c", 1200),
  /** Fundo do hero (painel com os assuntos). */
  heroPanel: unsplash("1498050108023-c5249f4df085", 2000),
  /** Seção "Mais pesquisados". */
  mostSearched: unsplash("1553877522-43269d4ea984", 1200),
  /** Imagem lateral dos posts. */
  sidebar: unsplash("1559136555-9303baea8ebd", 800),
  /** Seção "Em destaque". */
  spotlight: unsplash("1486406146926-c627a92ad1ab", 1200),
  /** Fundo decorativo dos cartões (textura). */
  texture: texture(),
} as const;

/** Logo do site (placeholder SVG com a inicial, editável no cabeçalho/rodapé). */
export const logoPlaceholder = (letter: string, fill = "#11e44f") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='${fill}'/><text x='32' y='45' font-family='Arial,Helvetica,sans-serif' font-size='40' font-weight='700' text-anchor='middle' fill='#121212'>${letter}</text></svg>`
  )}`;

/** Símbolos simples (brancos, 40×40) para os logos de exemplo. */
const MARKS = [
  "<circle cx='20' cy='20' r='17' fill='none' stroke='#fcfcfc' stroke-width='5'/>",
  "<rect x='4' y='4' width='32' height='32' rx='9' fill='#fcfcfc'/><path d='M13 27V13l14 14V13' fill='none' stroke='#121212' stroke-width='4' stroke-linejoin='round'/>",
  "<path d='M20 3 37 33H3z' fill='#fcfcfc'/>",
  "<path d='M20 2 36 11v18L20 38 4 29V11z' fill='none' stroke='#fcfcfc' stroke-width='4'/>",
  "<path d='M4 20a16 16 0 0 1 32 0h-9a7 7 0 0 0-14 0z M4 24h32a16 16 0 0 1-32 0z' fill='#fcfcfc'/>",
  "<rect x='2' y='14' width='16' height='16' rx='3' fill='#fcfcfc'/><rect x='16' y='4' width='22' height='22' rx='5' fill='none' stroke='#fcfcfc' stroke-width='4'/>",
];

/**
 * Logo de exemplo (símbolo + nome, branco) para o carrossel de logos: troque por logos reais no
 * editor. A largura acompanha o nome para o logo ficar centralizado no espaço.
 */
export const wordmark = (text: string, i = 0) => {
  const w = Math.round(58 + text.length * 15);
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} 40'>${MARKS[i % MARKS.length]}<text x='52' y='29' font-family='Arial,Helvetica,sans-serif' font-size='26' font-weight='700' fill='#fcfcfc'>${text}</text></svg>`
  )}`;
};
