/** Fontes oferecidas no tema (Google Fonts). O valor vai direto para `fontHeading`/`fontBody`. */
export const SITE_FONTS = [
  "Bai Jamjuree",
  "Mulish",
  "Poppins",
  "Roboto",
  "Manrope",
  "DM Sans",
  "Space Grotesk",
  "Lora",
] as const;

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
  const families = names
    .map(n => `family=${n.replaceAll(" ", "+")}:wght@400;500;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
