/**
 * Todas as imagens do template Diário Aberto passam por aqui: é o único lugar para trocar os placeholders. Fotos:
 * Unsplash (IDs já usados e conferidos em outros templates), só como exemplo — nenhuma foto da demo que inspirou
 * o layout foi copiada. O logo do blog é texto (Playfair Display 900, no bloco); o favicon é SVG gerado aqui.
 */
const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

/** Fotos de exemplo (IDs válidos reaproveitados dos outros templates). */
export const PHOTO_IDS = [
  "1414235077428-338989a2e8c0",
  "1419242902214-272b3f66ee7a",
  "1432888498266-38ffec3eaf0a",
  "1434030216411-0b793f4b4173",
  "1436918898788-ebce04d38e46",
  "1438232992991-995b7058bbb3",
  "1438761681033-6461ffad8d80",
  "1449965408869-eaa3f722e40d",
  "1451187580459-43490279c0fa",
  "1454165804606-c3d57bc86b40",
  "1455390582262-044cdead277a",
  "1460925895917-afdab827c52f",
  "1461896836934-ffe607ba8211",
  "1469474968028-56623f02e42e",
  "1469854523086-cc02fe5d8800",
  "1476514525535-07fb3b4ae5f1",
  "1477959858617-67f85cf4f1df",
  "1486406146926-c627a92ad1ab",
  "1488590528505-98d2b5aba04b",
  "1488646953014-85cb44e25828",
  "1492691527719-9d1e07e534b4",
  "1494790108377-be9c29b29330",
  "1495020689067-958852a7765e",
  "1498050108023-c5249f4df085",
  "1498075702571-ecb018f3752d",
  "1500530855697-b586d89ba3ee",
  "1500648767791-00dcc994a43e",
  "1501785888041-af3ef285b470",
  "1504384308090-c894fdcc538d",
  "1504711434969-e33886168f5c",
  "1506126613408-eca07ce68773",
  "1506905925346-21bda4d32df4",
  "1507003211169-0a1dd7228f2d",
  "1516321318423-f06f85e504b3",
  "1517048676732-d65bc937f952",
  "1517694712202-14dd9538aa97",
  "1518770660439-4636190af475",
  "1519389950473-47ba0277781c",
  "1522071820081-009f0129c71c",
  "1524178232363-1fb2b075b655",
] as const;

export const photo = (id: string, w = 1200, h = 800) => unsplash(id, w, h);

/** Retrato da autora (placeholder) e imagens fixas do template. */
export const IMG = {
  about: photo("1506905925346-21bda4d32df4", 1400, 700),
  author: photo("1494790108377-be9c29b29330", 480, 480),
  favicon: svg(
    `<rect width="64" height="64" fill="#5608E0"/><text x="32" y="46" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="42" fill="#fff">D</text>`,
    64,
    64
  ),
};

/** Faixa de fotos: 7 quadradas (194×210 no desktop; pedimos o dobro para telas densas). */
export const STRIP = [
  "1469474968028-56623f02e42e",
  "1476514525535-07fb3b4ae5f1",
  "1488646953014-85cb44e25828",
  "1492691527719-9d1e07e534b4",
  "1500530855697-b586d89ba3ee",
  "1506126613408-eca07ce68773",
  "1522071820081-009f0129c71c",
].map(id => ({ image: photo(id, 400, 430), large: photo(id, 1600, 1600) }));
