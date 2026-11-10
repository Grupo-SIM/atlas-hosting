/**
 * Todas as imagens do template Zyrion passam por aqui: é o único lugar para trocar os placeholders. Fotos:
 * Unsplash (IDs conferidos, HTTP 200), distribuídas por categoria só como exemplo. Logo, favicon e avatar:
 * SVG gerado aqui. Anúncios precisam de URL http(s) (o `adSlot` recusa `data:`), por isso usam Unsplash.
 * As imagens do site original estão listadas em `plans/zyrion-imagens.md` e só entram depois de aprovadas.
 */
import { BRAND } from "./brand.js";

const unsplash = (id: string, w = 1200, h = 675) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

/** SVG em `data:` sem `;utf8` (o `cssUrl` dos fundos recusa `;`). */
const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )}`;

const wordmark = (fill: string) =>
  svg(
    `<rect width="44" height="44" y="8" fill="${fill}"/><path d="M12 42V18l20 24V18" fill="none" stroke="${fill === "#fff" ? "#000" : "#fff"}" stroke-width="5"/><text x="56" y="40" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="30" fill="${fill}" letter-spacing="-1">${BRAND.name.toUpperCase()}</text>`,
    300,
    60
  );

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
  "1504868584819-f8e8b4b6d7e3",
  "1506126613408-eca07ce68773",
  "1506905925346-21bda4d32df4",
  "1507003211169-0a1dd7228f2d",
  "1507525428034-b723cf961d3e",
  "1508368941103-de02f9ad7b4d",
  "1512941937669-90a1b58e7e9c",
  "1514525253161-7a46d19cd819",
  "1516321318423-f06f85e504b3",
  "1517048676732-d65bc937f952",
  "1517694712202-14dd9538aa97",
  "1518770660439-4636190af475",
  "1519389950473-47ba0277781c",
  "1522071820081-009f0129c71c",
  "1522202176988-66273c2fd55f",
  "1524178232363-1fb2b075b655",
  "1526374965328-7f61d4dc18c5",
  "1529107386315-e1a2ed48a620",
  "1531297484001-80022131f5a1",
  "1531403009284-440f080d1e12",
  "1535223289827-42f1e9919769",
  "1536936812504-0e77dc3f0b40",
  "1544716278-ca5e3f4abd8c",
  "1550751827-4bd374c3f58b",
  "1551288049-bebda4e38f71",
  "1553877522-43269d4ea984",
  "1554224155-6726b3ff858f",
  "1555066931-4365d14bab8c",
  "1556155092-490a1ba16284",
  "1556761175-5973dc0f32e7",
] as const;

export const photo = (id: string, w = 1200, h = 675) => unsplash(id, w, h);

export const IMG = {
  archiveBg: unsplash("1486406146926-c627a92ad1ab", 1600, 900),
  avatar: svg(
    `<rect width="64" height="64" fill="#020817"/><circle cx="32" cy="25" r="11" fill="#fff"/><path d="M10 60c2-14 12-18 22-18s20 4 22 18z" fill="#fff"/>`,
    64,
    64
  ),
  favicon: svg(
    `<rect width="64" height="64" fill="#000"/><path d="M16 50V16l32 34V16" fill="none" stroke="#fff" stroke-width="7"/>`,
    64,
    64
  ),
  logo: wordmark("#000"),
  logoWhite: wordmark("#fff"),
};

/** Anúncios de exemplo (troque pelos reais no painel de anúncios). */
export const ADS = {
  banner: unsplash("1486406146926-c627a92ad1ab", 970, 150),
  bannerCommunity: unsplash("1414235077428-338989a2e8c0", 970, 150),
  gif: unsplash("1419242902214-272b3f66ee7a", 485, 175),
  square: unsplash("1432888498266-38ffec3eaf0a", 300, 250),
  square2: unsplash("1486406146926-c627a92ad1ab", 300, 250),
};
