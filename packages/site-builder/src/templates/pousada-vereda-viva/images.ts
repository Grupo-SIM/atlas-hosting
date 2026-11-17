/**
 * Todas as imagens do template Vereda Viva passam por aqui: é o único lugar para trocar os placeholders. Fotos:
 * Unsplash (IDs conferidos um a um), só como exemplo — troque pelas fotos da pousada. Logo, favicon e ilustrações
 * são SVG gerados aqui (nada vem do site de referência).
 */
const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

/** Marca: uma gota d'água azul cruzada por uma folha verde (64 × 64). */
const MARK =
  '<path d="M32 5C20 17 13 27 13 37a19 19 0 0 0 38 0C51 27 44 17 32 5z" fill="#2A8ECC"/><path d="M33 59C32 42 40 31 57 23c2 19-6 33-24 36z" fill="#5E943E"/><path d="M33 59c2-13 9-24 19-32" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>';

/** Logo claro (hero e rodapé): a marca em cima e o nome embaixo, em branco. */
const wordmark = () =>
  svg(
    `<g transform="translate(125 0) scale(1.9)">${MARK}</g><text x="185" y="156" text-anchor="middle" font-family="Josefin Sans,Trebuchet MS,Arial,sans-serif" font-weight="700" font-size="46" fill="#fff">Vereda Viva</text><text x="185" y="184" text-anchor="middle" font-family="Josefin Sans,Trebuchet MS,Arial,sans-serif" font-weight="600" font-size="15" letter-spacing="6" fill="#fff">POUSADA E CAMPING</text>`,
    370,
    200
  );

const ph = (id: string, w = 1200, h = 800) => unsplash(id, w, h);

export const IMG = {
  favicon: svg(MARK, 64, 64),
  /** Logo do menu (50px). */
  logo: svg(MARK, 64, 64),
  /** Logo claro do hero e do rodapé. */
  logoLight: wordmark(),
} as const;

/** Fotos do topo (tela cheia). */
export const HERO = [
  [
    "1510312305653-8ed496efae75",
    "Barraca ao nascer do sol, no alto de uma serra",
  ],
  [
    "1566073771259-6a8506099945",
    "Pousada de madeira com piscina entre as árvores",
  ],
  ["1445308394109-4ec2920981b1", "Área de camping aos pés das serras"],
  ["1472214103451-9374bd1c798e", "Vale verde do Cerrado ao entardecer"],
  ["1470071459604-3b5ec3a7fe05", "Morros cobertos de névoa pela manhã"],
].map(([id, alt]) => ({
  alt: alt as string,
  image: ph(id as string, 1920, 1080),
}));

/** Álbum do modal: fotos em pé (o modal mostra 450 × 600). */
const album = (ids: string[]) => ids.map(id => ({ image: ph(id, 900, 1200) }));

/** Capa + álbum de cada quarto/experiência (o modal junta os dois). */
export const PHOTOS = {
  aroeira: {
    cover: ph("1590490360182-c33d57733427", 800, 600),
    photos: album([
      "1578683010236-d716f9a3f461",
      "1560448204-e02f11c3d0e2",
      "1505691938895-1758d7feb511",
    ]),
  },
  barracas: {
    cover: ph("1504280390367-361c6d9f38f4", 800, 600),
    photos: album([
      "1523987355523-c7b5b0dd90a7",
      "1510312305653-8ed496efae75",
      "1537905569824-f89f14cceb68",
    ]),
  },
  buriti: {
    cover: ph("1611892440504-42a792e24d32", 800, 600),
    photos: album([
      "1445019980597-93fa8acb246c",
      "1587061949409-02df41d5e562",
      "1566073771259-6a8506099945",
    ]),
  },
  cafe: {
    cover: ph("1504754524776-8f4f37790ca0", 800, 600),
    photos: album([
      "1484723091739-30a097e8f929",
      "1525351484163-7529414344d8",
      "1509042239860-f550ce710b93",
    ]),
  },
  cagaita: {
    cover: ph("1631049307264-da0ec9d70304", 800, 600),
    photos: album([
      "1522708323590-d24dbb6b0267",
      "1493809842364-78817add7ffb",
      "1501183638710-841dd1904471",
    ]),
  },
  camping: {
    cover: ph("1478131143081-80f7f84ca84d", 800, 600),
    photos: album([
      "1445308394109-4ec2920981b1",
      "1517824806704-9040b037703b",
      "1475483768296-6163e08872a1",
    ]),
  },
  convivencia: {
    cover: ph("1523301343968-6a6ebf63c672", 800, 600),
    photos: album([
      "1493809842364-78817add7ffb",
      "1505691938895-1758d7feb511",
      "1560448204-e02f11c3d0e2",
    ]),
  },
  cozinha: {
    cover: ph("1556909114-f6e7ad7d3136", 800, 600),
    photos: album(["1556911220-bff31c812dba", "1522708323590-d24dbb6b0267"]),
  },
  eventos: {
    cover: ph("1514525253161-7a46d19cd819", 800, 600),
    photos: album(["1438232992991-995b7058bbb3", "1521017432531-fbd92d768814"]),
  },
  familia: {
    cover: ph("1512918728675-ed5a9ecdebfd", 800, 600),
    photos: album([
      "1560448204-e02f11c3d0e2",
      "1570129477492-45c003edd2be",
      "1522708323590-d24dbb6b0267",
    ]),
  },
  ipe: {
    cover: ph("1582719478250-c89cae4dc85b", 800, 600),
    photos: album([
      "1522771739844-6a9f6d5f14af",
      "1540518614846-7eded433c457",
      "1505691938895-1758d7feb511",
    ]),
  },
  seriema: {
    cover: ph("1566665797739-1674de7a421a", 800, 600),
    photos: album([
      "1518780664697-55e3ad937233",
      "1587061949409-02df41d5e562",
      "1522771739844-6a9f6d5f14af",
    ]),
  },
  vestiarios: {
    cover: ph("1552321554-5fefe8c9ef14", 800, 600),
    photos: album([
      "1584622650111-993a426fbf0a",
      "1620626011761-996317b8d101",
      "1507652313519-d4e9174996dd",
    ]),
  },
} as const;

/** "Venha nos visitar": três cachoeiras (200 × 300). */
export const FALLS = [
  ["VENHA", "1432405972618-c60b0225b8f9"],
  ["NOS", "1433086966358-54859d0ed716"],
  ["VISITAR", "1494472155656-f34e81b17ddc"],
].map(([word, id]) => ({
  image: ph(id as string, 400, 600),
  word: word as string,
}));

/** Fundo da página 404. */
export const NOT_FOUND = ph("1470071459604-3b5ec3a7fe05", 1600, 900);

/** Prévia do template na galeria. */
export const PREVIEW = ph("1510312305653-8ed496efae75", 1200, 800);
