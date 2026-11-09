import { CASE_PHOTOS, METHOD_PHOTOS, type Photo, WALL } from "./images.js";

/**
 * Dados de projetos do template Margem: os 4 cases do túnel, as 15 linhas do índice, as peças das
 * paredes (`PECAS`, a proporção de cada foto) e as fotos do depoimento. Clientes fictícios.
 */

/** URL do Unsplash com tamanho/formato (`params` sem o `?`). */
const unsplash = (photo: Photo, params: string) =>
  `https://images.unsplash.com/photo-${photo.id}?${params}&q=78&auto=format`;

/** Peça da parede `t01`…`t28` (1 = t01). */
export const wallPhoto = (n: number): Photo => {
  const photo = WALL[n - 1];
  if (!photo) throw new Error(`foto t${String(n).padStart(2, "0")} não existe`);
  return photo;
};

/** "pecas.json": cada foto das paredes com a proporção (largura ÷ altura) que vira o formato do plano. */
export const PECAS = WALL.map(photo => ({
  image: unsplash(photo, "w=800"),
  ratio: photo.ratio,
}));

/** Os quatro destaques do túnel: paisagem 3:2. */
export const CASES = [
  {
    city: "Garanhuns",
    client: "Torra Alta",
    discipline: "Identidade e embalagem",
    image: unsplash(CASE_PHOTOS.torraAlta, "w=1800&h=1200&fit=crop"),
    summary:
      "Café de altitude do Agreste. Uma marca que empilha a serra em três meias-luas.",
    year: "2024",
  },
  {
    city: "Olinda",
    client: "Sól",
    discipline: "Identidade visual",
    image: unsplash(CASE_PHOTOS.sol, "w=1800&h=1200&fit=crop"),
    summary:
      "Cerâmica feita a quatro mãos. O nome em relevo, sem tinta, como a argila pede.",
    year: "2023",
  },
  {
    city: "Recife",
    client: "Restinga",
    discipline: "Design editorial",
    image: unsplash(CASE_PHOTOS.restinga, "w=1800&h=1200&fit=crop"),
    summary:
      "Editora de livros de natureza. Capas em tecido verde e um galho de traço só.",
    year: "2022",
  },
  {
    city: "Recife",
    client: "Preamar",
    discipline: "Produto digital",
    image: unsplash(CASE_PHOTOS.preamar, "w=1800&h=1200&fit=crop"),
    summary:
      "Tábua de marés para quem surfa cedo. A curva da maré virou a interface.",
    year: "2025",
  },
];

/** Foto do índice (segue o cursor): retrato 4:5. */
const portrait = (photo: Photo) => unsplash(photo, "w=760&h=950&fit=crop");

export const FILTERS = [
  { label: "Identidade", value: "identidade" },
  { label: "Embalagem", value: "embalagem" },
  { label: "Editorial", value: "editorial" },
  { label: "Digital", value: "digital" },
];

type Row = [
  year: string,
  client: string,
  discipline: string,
  city: string,
  filter: string,
  photo: Photo,
];

export const ROWS = (
  [
    [
      "2025",
      "Preamar",
      "Produto digital",
      "Recife",
      "digital",
      CASE_PHOTOS.preamar,
    ],
    [
      "2025",
      "Prato Raso",
      "Produto digital",
      "João Pessoa",
      "digital",
      wallPhoto(18),
    ],
    [
      "2024",
      "Torra Alta",
      "Identidade e embalagem",
      "Garanhuns",
      "embalagem",
      CASE_PHOTOS.torraAlta,
    ],
    ["2024", "Engenho Vau", "Rótulo", "Pombos", "embalagem", wallPhoto(10)],
    ["2024", "Jandaíra", "Embalagem", "Mossoró", "embalagem", wallPhoto(20)],
    [
      "2023",
      "Sól",
      "Identidade visual",
      "Olinda",
      "identidade",
      CASE_PHOTOS.sol,
    ],
    ["2023", "Cine Ladeira", "Festival", "Olinda", "identidade", wallPhoto(28)],
    ["2023", "Âmbar Botica", "Embalagem", "Natal", "embalagem", wallPhoto(5)],
    [
      "2022",
      "Restinga",
      "Design editorial",
      "Recife",
      "editorial",
      CASE_PHOTOS.restinga,
    ],
    ["2022", "Taipa", "Identidade", "Caruaru", "identidade", wallPhoto(6)],
    ["2022", "Quadrante", "Revista", "Recife", "editorial", wallPhoto(23)],
    ["2021", "Sururu", "Restaurante", "Maceió", "identidade", wallPhoto(7)],
    [
      "2021",
      "Feira Aurora",
      "Sinalização",
      "Recife",
      "identidade",
      wallPhoto(21),
    ],
    [
      "2020",
      "Maré Mansa",
      "Cartaz e programa",
      "Recife",
      "editorial",
      wallPhoto(17),
    ],
    [
      "2019",
      "Casa Cajá",
      "Identidade",
      "Fortaleza",
      "identidade",
      wallPhoto(25),
    ],
  ] satisfies Row[]
).map(([year, client, discipline, city, filter, photo]) => ({
  city,
  client,
  discipline,
  filter,
  image: portrait(photo),
  url: "",
  year,
}));

/** Quadros do método (3:4) e as etapas da régua. O 2º quadro é o desenho da marca sobre a grade. */
export const METHOD = [
  {
    alt: "Rascunho a lápis em papel manteiga",
    caption: "Antes de desenhar, três semanas ouvindo quem faz.",
    image: unsplash(METHOD_PHOTOS.rascunho, "w=900&h=1200&fit=crop"),
    kind: "photo",
    label: "01 Escuta",
  },
  {
    alt: "",
    caption: "Lápis até uma forma aguentar sozinha.",
    image: "",
    kind: "grid",
    label: "02 Rascunho",
  },
  {
    alt: "Prancha do sistema da marca",
    caption: "Cor, letra e regra para a marca andar sem a gente.",
    image: unsplash(METHOD_PHOTOS.sistema, "w=900&h=1200&fit=crop"),
    kind: "photo",
    label: "03 Sistema",
  },
  {
    alt: "Saco de café na prateleira",
    caption: "Prateleira, fachada, sacola: onde a marca trabalha.",
    image: unsplash(METHOD_PHOTOS.rua, "w=900&h=1200&fit=crop"),
    kind: "photo",
    label: "04 Rua",
  },
];

/** Fotos pequenas dentro do manifesto: os copos de Sól e o vaso t24. */
export const INLINE_PHOTOS = [
  {
    focus: "50% 55%",
    image: unsplash(CASE_PHOTOS.sol, "w=640"),
    word: "mãos",
  },
  {
    focus: "50% 50%",
    image: unsplash(wallPhoto(24), "w=480"),
    word: "cerâmica",
  },
];

/**
 * 14 fotos em volta do depoimento: posição (% da seção), largura (% da tela) e profundidade
 * (1 = perto, nítida; 0 = longe, desfocada). Nenhuma no miolo, onde fica o texto.
 */
export const FLOATING = (
  [
    [2, 8, 14, 12, 1],
    [3, 24, 8, 6, 0.25],
    [4, 86, 12, 10, 0.8],
    [8, 70, 6, 5, 0.15],
    [9, 93, 42, 7, 0.4],
    [11, 6, 48, 8, 0.6],
    [12, 16, 80, 11, 0.9],
    [13, 34, 90, 6, 0.3],
    [14, 58, 88, 9, 0.7],
    [15, 81, 78, 13, 1],
    [16, 95, 90, 5, 0.2],
    [19, 44, 9, 5, 0.1],
    [22, 3, 28, 4, 0.05],
    [26, 67, 95, 4, 0.12],
  ] as const
).map(([n, x, y, size, depth]) => ({
  depth,
  image: unsplash(wallPhoto(n), "w=520"),
  size,
  x,
  y,
}));
