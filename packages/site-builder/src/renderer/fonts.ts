import { CENTRAL_EXTRA_FONTS, isCentral } from "./central.js";
import { isSpy, SPY_EXTRA_FONTS } from "./spyhacker.js";

/** Fontes oferecidas no tema (Google Fonts). O valor vai direto para `fontHeading`/`fontBody`. */
export const SITE_FONTS = [
  "Bai Jamjuree",
  "Content",
  "Mulish",
  "Poppins",
  "Red Hat Text",
  "Roboto",
  "Sora",
  "Geist",
  "Manrope",
  "DM Sans",
  "Space Grotesk",
  "Lora",
  "Inter",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Nunito",
  "Raleway",
  "Oswald",
  "Playfair Display",
  "Merriweather",
  "Bebas Neue",
  "Anton",
  "Rubik",
  "Work Sans",
  "Barlow",
  "Archivo",
  "Fira Sans",
  "Source Sans 3",
  "Libre Baskerville",
  "Cormorant Garamond",
  "Pacifico",
  "Lobster",
  "Dancing Script",
] as const;

/** Pesos que o Google Fonts oferece quando não são os padrões (pedir um peso inexistente derruba o CSS inteiro). */
const FONT_WEIGHTS: Record<string, string> = { Content: "400;700" };

export const fontStack = (name: string) => `'${name}', sans-serif`;

/** Nome da fonte do tema, se for uma das conhecidas. */
export function themeFont(theme: Record<string, string>): string | undefined {
  const raw = theme.fontBody ?? theme.fontHeading ?? "";
  return SITE_FONTS.find(f => raw.includes(`'${f}'`));
}

/** Fonte enviada pelo usuário (arquivo no storage); vira `@font-face` com o nome dado. */
export interface FontFile {
  name: string;
  url: string;
}

const FONT_NAME = /^[A-Za-z0-9 _-]{1,40}$/;
const FONT_URL = /^(https?:\/\/|\/)[^\s"'()<>;{}\\]+$/;

/** Lê `theme.fontFiles` (JSON); descarta o que não for nome simples + URL http(s)/caminho do site. */
export function customFonts(theme: Record<string, string>): FontFile[] {
  try {
    const raw: unknown = JSON.parse(theme.fontFiles || "[]");
    if (!Array.isArray(raw)) return [];
    const out: FontFile[] = [];
    for (const f of raw.slice(0, 20)) {
      const name = typeof f?.name === "string" ? f.name.trim() : "";
      const url = typeof f?.url === "string" ? f.url : "";
      if (FONT_NAME.test(name) && FONT_URL.test(url)) out.push({ name, url });
    }
    return out;
  } catch {
    return [];
  }
}

export const fontFaceCss = (fonts: FontFile[]) =>
  fonts
    .map(
      f =>
        `@font-face{font-family:'${f.name}';src:url('${f.url}');font-display:swap}`
    )
    .join("");

/**
 * URL do CSS do Google Fonts: fontes do tema + qualquer fonte conhecida usada em estilos de
 * blocos/elementos (`'Nome'` no JSON do site). Só nomes da lista, nunca texto do usuário.
 */
export function fontStylesheet(site: {
  theme: Record<string, string>;
}): string | null {
  const theme = site.theme;
  const names: string[] = [];
  for (const key of ["fontBody", "fontHeading", "fontAccent"]) {
    const found = SITE_FONTS.find(f => (theme[key] ?? "").includes(`'${f}'`));
    if (found && !names.includes(found)) names.push(found);
  }
  const json = JSON.stringify(site);
  for (const f of SITE_FONTS)
    if (!names.includes(f) && json.includes(`'${f}'`)) names.push(f);
  if (names.length === 0) return null;
  // A variante spyhacker usa fontes extras em alguns blocos (fixas, nunca texto do usuário).
  if (isSpy(theme))
    for (const extra of SPY_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  // A variante central usa Poppins/Roboto nos posts e nos botões (fixas, nunca texto do usuário).
  if (isCentral(theme))
    for (const extra of CENTRAL_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  const families = names
    .map(
      n =>
        `family=${n.replaceAll(" ", "+")}:wght@${FONT_WEIGHTS[n] ?? "300;400;500;600;700;900"}`
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
