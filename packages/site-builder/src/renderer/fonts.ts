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
  "Manrope",
  "DM Sans",
  "Space Grotesk",
  "Lora",
] as const;

/** Pesos que o Google Fonts oferece quando não são os padrões (pedir um peso inexistente derruba o CSS inteiro). */
const FONT_WEIGHTS: Record<string, string> = { Content: "400;700" };

export const fontStack = (name: string) => `'${name}', sans-serif`;

/** Nome da fonte do tema, se for uma das conhecidas. */
export function themeFont(theme: Record<string, string>): string | undefined {
  const raw = theme.fontBody ?? theme.fontHeading ?? "";
  return SITE_FONTS.find(f => raw.includes(`'${f}'`));
}

/** URL do CSS do Google Fonts para as fontes do tema; só as conhecidas, nunca texto do usuário. */
export function fontStylesheet(theme: Record<string, string>): string | null {
  const names: string[] = [];
  for (const key of ["fontBody", "fontHeading", "fontAccent"]) {
    const found = SITE_FONTS.find(f => (theme[key] ?? "").includes(`'${f}'`));
    if (found && !names.includes(found)) names.push(found);
  }
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
        `family=${n.replaceAll(" ", "+")}:wght@${FONT_WEIGHTS[n] ?? "300;400;500;600;700"}`
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
