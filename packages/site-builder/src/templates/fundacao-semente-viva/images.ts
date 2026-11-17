/**
 * Todas as imagens do template Semente Viva passam por aqui: é o único lugar para trocar os placeholders. Fotos:
 * Unsplash (IDs conferidos um a um), só como exemplo — troque pelas fotos da fundação. Logo, favicon e o QR code de
 * exemplo são SVG gerados aqui (nada vem do site de referência).
 */
const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

/** Marca: um broto de duas folhas sobre um traço de terra (64 × 64). */
const mark = (leaf: string, leaf2: string) =>
  `<path d="M32 58V28" fill="none" stroke="${leaf}" stroke-width="4" stroke-linecap="round"/><path d="M32 38C32 25 23 17 9 17c0 13 9 22 23 21z" fill="${leaf}"/><path d="M32 31C32 17 41 8 56 8c0 15-9 24-24 23z" fill="${leaf2}"/><path d="M17 58h30" fill="none" stroke="${leaf}" stroke-width="4" stroke-linecap="round"/>`;

const FONT = "Red Hat Display,Trebuchet MS,Arial,sans-serif";

/** Logo escuro (barra branca): marca + "Semente Viva" e a palavra "FUNDAÇÃO" acima (186 × 92). */
const wordmark = (
  ink: string,
  accent: string,
  small: string,
  a: string,
  b: string
) =>
  svg(
    `<g transform="translate(2 14)">${mark(a, b)}</g><text x="76" y="32" font-family="${FONT}" font-weight="700" font-size="10" letter-spacing="3" fill="${small}">FUNDAÇÃO</text><text x="76" y="56" font-family="${FONT}" font-weight="900" font-size="25" fill="${ink}">Semente</text><text x="76" y="80" font-family="${FONT}" font-weight="900" font-size="25" fill="${accent}">Viva</text>`,
    186,
    92
  );

/**
 * QR code **de exemplo**: padrão de módulos sorteado (não lê como QR de verdade) com a marca d'água "EXEMPLO" por cima,
 * para ninguém publicar sem trocar pela imagem real da fundação.
 */
function exampleQr(): string {
  const N = 29;
  const M = 8;
  const pad = 20;
  const size = N * M + pad * 2;
  let seed = 11;
  const rnd = () => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let rects = "";
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (!inFinder(x, y) && rnd() > 0.5)
        rects += `<rect x="${pad + x * M}" y="${pad + y * M}" width="${M}" height="${M}"/>`;
  const finder = (fx: number, fy: number) => {
    const x = pad + fx * M;
    const y = pad + fy * M;
    return `<rect x="${x}" y="${y}" width="${7 * M}" height="${7 * M}"/><rect x="${x + M}" y="${y + M}" width="${5 * M}" height="${5 * M}" fill="#fff"/><rect x="${x + 2 * M}" y="${y + 2 * M}" width="${3 * M}" height="${3 * M}"/>`;
  };
  const body = `<rect width="${size}" height="${size}" fill="#fff"/><g fill="#222">${rects}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</g><g transform="rotate(-28 ${size / 2} ${size / 2})"><rect x="${size * 0.06}" y="${size / 2 - 34}" width="${size * 0.88}" height="68" fill="#fff" fill-opacity=".88"/><text x="${size / 2}" y="${size / 2 + 16}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="52" letter-spacing="6" fill="#D93025">EXEMPLO</text></g>`;
  return svg(body, size, size);
}

export const IMG = {
  favicon: svg(mark("#007E08", "#04CC40"), 64, 64),
  /** Logo da barra branca e da gaveta (186 × 92). */
  logo: wordmark("#106504", "#007E08", "#606060", "#007E08", "#04CC40"),
  /** Logo claro do rodapé verde (o do original tinha o nome em cinza-escuro sobre o verde e mal aparecia). */
  logoLight: wordmark("#FFFFFF", "#FFFFFF", "#FFFFFFCC", "#FFFFFF", "#B9F5C5"),
  qrExample: exampleQr(),
} as const;

const ph = (id: string, w = 1200, h = 800) => unsplash(id, w, h);

/** Hero: 5 fotos em fade. */
export const HERO = (
  [
    [
      "1542601906990-b4d3fb778b09",
      "Mãos segurando uma muda de planta recém-plantada",
    ],
    [
      "1488521787991-ed7bbaae773c",
      "Crianças sorrindo e acenando para a câmera",
    ],
    [
      "1606092195730-5d7b9af1efc5",
      "Crianças brincando com um grande tecido colorido ao ar livre",
    ],
    ["1593113598332-cd288d649433", "Voluntários organizando caixas de doações"],
    ["1577896851231-70ef18881754", "Sala de aula com a professora e alunos"],
  ] as const
).map(([id, alt]) => ({ alt, image: ph(id, 1920, 1080) }));

/** "Quem somos": 8 fotos no círculo. */
export const CIRCLE = (
  [
    [
      "1526232761682-d26e03ac148e",
      "Crianças de uniforme reunidas em campo de futebol",
    ],
    ["1577896851231-70ef18881754", "Professora ensinando em sala de aula"],
    ["1516321318423-f06f85e504b3", "Duas crianças lendo juntas"],
    [
      "1557804506-669a67965ba0",
      "Participantes de uma oficina de trabalho em grupo",
    ],
    ["1559234938-b60fff04894d", "Casal de idosos caminhando em um jardim"],
    ["1593113598332-cd288d649433", "Voluntários empacotando doações"],
    ["1606092195730-5d7b9af1efc5", "Atividade ao ar livre com crianças"],
    ["1469571486292-0ba58a3f068b", "Mãos formando um coração vermelho"],
  ] as const
).map(([id, alt]) => ({ alt, image: ph(id, 900, 900) }));

/** Uma foto por área de atuação (abas de "Como atuamos"). */
export const AREA_PHOTO = {
  cursos: ph("1557804506-669a67965ba0", 1000, 750),
  educacao: ph("1516321318423-f06f85e504b3", 1000, 750),
  esporte: ph("1526232761682-d26e03ac148e", 1000, 750),
  idosos: ph("1559234938-b60fff04894d", 1000, 750),
} as const;

/** Doação: mãos formando um coração. */
export const DONATE = ph("1469571486292-0ba58a3f068b", 900, 900);

/** Projetos: 6 fotos redondas (posição, tamanho e quais ficam no celular). */
export const FLOATS = (
  [
    [
      "1459183885421-5cc683b8dbba",
      "Crianças correndo em uma estrada de terra",
      4,
      16,
      170,
      "yes",
    ],
    ["1488521787991-ed7bbaae773c", "Crianças sorrindo", 21, 62, 130, "no"],
    [
      "1543326727-cf6c39e8f84c",
      "Jogadores disputando a bola em campo",
      -3,
      74,
      180,
      "no",
    ],
    [
      "1576765608535-5f04d1e3f289",
      "Idosa sendo atendida por uma profissional de saúde",
      78,
      14,
      150,
      "yes",
    ],
    [
      "1529156069898-49953e39b3ac",
      "Amigos abraçados de costas, olhando o horizonte",
      88,
      58,
      170,
      "no",
    ],
    [
      "1511632765486-a01980e01a18",
      "Grupo abraçado ao pôr do sol",
      72,
      76,
      130,
      "no",
    ],
  ] as const
).map(([id, alt, x, y, size, keep]) => ({
  alt,
  image: ph(id, 500, 500),
  keep,
  size,
  x,
  y,
}));

/** Equipe: retratos neutros. */
export const TEAM = [
  ["Ana Ribeiro", "Presidente", "1494790108377-be9c29b29330"],
  ["Carlos Mendes", "Coordenador de esportes", "1507003211169-0a1dd7228f2d"],
  ["Marina Lopes", "Coordenadora pedagógica", "1438761681033-6461ffad8d80"],
  ["Paulo Siqueira", "Professor de informática", "1500648767791-00dcc994a43e"],
  ["Júlia Andrade", "Assistente social", "1573496359142-b8d87734a5a2"],
  ["Roberto Faria", "Gestor financeiro", "1560250097-0b93528c311a"],
].map(([name, role, id]) => ({
  image: ph(id as string, 600, 600),
  name: name as string,
  role: role as string,
}));

/** Capas dos 6 posts de exemplo. */
export const NEWS_COVER = {
  campeonato: ph("1543326727-cf6c39e8f84c", 1200, 675),
  formatura: ph("1523240795612-9a054b0db644", 1200, 675),
  mutirao: ph("1559027615-cd4628902d4a", 1200, 675),
  natal: ph("1593113598332-cd288d649433", 1200, 675),
  saude: ph("1576765608535-5f04d1e3f289", 1200, 675),
  voltaAulas: ph("1580582932707-520aed937b7b", 1200, 675),
} as const;

/** Galeria: capas dos álbuns. */
export const ALBUM = {
  atividades: ph("1557804506-669a67965ba0", 800, 800),
  campeonato: ph("1526232761682-d26e03ac148e", 800, 800),
  idosos: ph("1559234938-b60fff04894d", 800, 800),
  sala: ph("1516321318423-f06f85e504b3", 800, 800),
} as const;

/** Prévia do template na galeria. */
export const PREVIEW = ph("1542601906990-b4d3fb778b09", 1200, 800);

/** Vídeo de exemplo do "Projetos desenvolvidos" e do "Como atuamos" (episódio público de um canal de empreendedorismo). */
export const SAMPLE_VIDEO = "https://www.youtube.com/watch?v=4F4-jFOigYI";
