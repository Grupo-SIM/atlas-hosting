import { CENTRAL_EXTRA_FONTS, isCentral } from "./central.js";
import { CONSULTORIA_EXTRA_FONTS, isConsultoria } from "./consultoria.js";
import { CORTE_EXTRA_FONTS, isCorte } from "./corte.js";
import { DIARIO_EXTRA_FONTS, isDiario } from "./diario.js";
import { GATILHOS_EXTRA_FONTS, isGatilhos } from "./gatilhos.js";
import { GRANA_EXTRA_FONTS, isGrana } from "./grana.js";
import { HABILIDADES_EXTRA_FONTS, isHabilidades } from "./habilidades.js";
import { INSTAFAN_EXTRA_FONTS, isInstafan } from "./instafan.js";
import { isMotorista, MOTORISTA_EXTRA_FONTS } from "./motorista.js";
import { isOutroLado, OUTROLADO_EXTRA_FONTS } from "./outrolado.js";
import { isPagaTg, PAGATG_EXTRA_FONTS } from "./pagatg.js";
import { isPresets, PRESETS_EXTRA_FONTS } from "./presets.js";
import { isRaiz, RAIZ_EXTRA_FONTS } from "./raiz.js";
import { isSeguidores, SEGUIDORES_EXTRA_FONTS } from "./seguidores.js";
import { isSim, SIM_EXTRA_FONTS } from "./sim.js";
import { isSpy, SPY_EXTRA_FONTS } from "./spyhacker.js";
import { isUniverso, UNIVERSO_EXTRA_FONTS } from "./universo.js";
import { isViralpack, VIRALPACK_EXTRA_FONTS } from "./viralpack.js";
import { isVslMilionario, VSLMILIONARIO_EXTRA_FONTS } from "./vslmilionario.js";

/** Fontes oferecidas no tema (Google Fonts). O valor vai direto para `fontHeading`/`fontBody`. */
export const SITE_FONTS = [
  "Anek Devanagari",
  "Bai Jamjuree",
  "Be Vietnam Pro",
  "Content",
  "Mulish",
  "Poppins",
  "Rajdhani",
  "Red Hat Text",
  "Roboto",
  "Sora",
  "Geist",
  "Plus Jakarta Sans",
  "Manrope",
  "DM Sans",
  "Space Grotesk",
  "Lora",
  "Inter",
  "Montserrat",
  "Orbitron",
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
const FONT_WEIGHTS: Record<string, string> = {
  "Anek Devanagari": "300;400;500;600;700",
  Anybody: "400;900",
  "Be Vietnam Pro": "300;400;500;600;700;800;900",
  "Cherry Cream Soda": "400",
  Content: "400;700",
  Electrolize: "400",
  Hind: "300;400;500;600;700",
  Montserrat: "300;400;500;600;700;800;900",
  Orbitron: "400;500;600;700;800;900",
  // Oswald vai de 200 a 700 no Google (o padrão pede 900 e derruba o CSS); a variante `universo` usa 400–700.
  Oswald: "400;500;600;700",
  "Playfair Display": "400;500;600;700;800;900",
  "Plus Jakarta Sans": "300;400;500;600;700",
  Rajdhani: "300;400;500;600;700",
  Raleway: "200;300;400;500;600;700;800;900",
  // O Google não tem Titillium Web 500 (nem 400 no pedido do original): pedir peso inexistente derruba o CSS inteiro.
  "Titillium Web": "200;300",
};

/**
 * Fontes que precisam de itálico: pares `ital,wght` (`0` = reta, `1` = itálica) pedidos no lugar da lista de pesos.
 * Sem entrada aqui a URL é a de sempre (só `wght`), então as fontes dos outros templates não mudam.
 * O Google exige as tuplas em ordem crescente (`0,…` antes de `1,…`).
 */
export const FONT_ITALIC: Record<string, string> = {
  // Lora só tem 400–700; o corpo do post e o copyright do Diário Aberto usam o itálico de verdade.
  Lora: "0,400;0,500;0,600;0,700;1,400",
  "Noto Serif Display": "1,300",
};

export const fontStack = (name: string) => `'${name}', sans-serif`;

/** Nome da fonte do tema, se for uma das conhecidas. */
/**
 * O valor da fonte do tema cita a família com ou sem aspas (`'Raleway', sans-serif` ou só `Raleway`).
 * Sites criados com a forma sem aspas também precisam baixar a fonte do Google Fonts.
 */
export function usesFont(value: string | undefined, name: string): boolean {
  const v = value ?? "";
  const i = v.indexOf(name);
  if (i < 0) return false;
  const before = v[i - 1];
  const after = v[i + name.length];
  // antes: início, espaço, aspas ou vírgula; depois: fim, aspas ou vírgula (um espaço seguiria outra palavra, ex. "Roboto Slab")
  const edge = (c: string | undefined, re: RegExp) =>
    c === undefined || re.test(c);
  return edge(before, /[\s'",]/) && edge(after, /['",]/);
}

export function themeFont(theme: Record<string, string>): string | undefined {
  const raw = theme.fontBody ?? theme.fontHeading ?? "";
  return SITE_FONTS.find(f => usesFont(raw, f));
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
    const found = SITE_FONTS.find(f => usesFont(theme[key], f));
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
  if (isSeguidores(theme))
    for (const extra of SEGUIDORES_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isMotorista(theme))
    for (const extra of MOTORISTA_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isRaiz(theme))
    for (const extra of RAIZ_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isSim(theme))
    for (const extra of SIM_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isOutroLado(theme))
    for (const extra of OUTROLADO_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isHabilidades(theme))
    for (const extra of HABILIDADES_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isInstafan(theme))
    for (const extra of INSTAFAN_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isCorte(theme))
    if (isViralpack(theme))
      for (const extra of VIRALPACK_EXTRA_FONTS)
        if (!names.includes(extra)) names.push(extra);
  if (isGrana(theme))
    for (const extra of GRANA_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  for (const extra of CORTE_EXTRA_FONTS)
    if (!names.includes(extra)) names.push(extra);
  if (isGatilhos(theme))
    for (const extra of GATILHOS_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isVslMilionario(theme))
    for (const extra of VSLMILIONARIO_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isPresets(theme))
    for (const extra of PRESETS_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isPagaTg(theme))
    for (const extra of PAGATG_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isDiario(theme))
    for (const extra of DIARIO_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isConsultoria(theme))
    for (const extra of CONSULTORIA_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  if (isUniverso(theme))
    for (const extra of UNIVERSO_EXTRA_FONTS)
      if (!names.includes(extra)) names.push(extra);
  const families = names
    .map(n => {
      const family = n.replaceAll(" ", "+");
      const italic = FONT_ITALIC[n];
      return italic
        ? `family=${family}:ital,wght@${italic}`
        : `family=${family}:wght@${FONT_WEIGHTS[n] ?? "300;400;500;600;700;900"}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
