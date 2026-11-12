/**
 * Cores extras de cada variante visual (`theme.variant`): ficam em `site.theme` com o nome `key` e o CSS
 * da variante as lê (`safe(theme.key, padrão)`). O editor lista todas em "Página inteira" para o usuário
 * trocar sem depender da IA. `fallback` é o padrão do CSS, mostrado enquanto o template não define a chave.
 *
 * As cores comuns (`accent`, `bg`, `card`, `fg`, `muted`) já têm seção própria no editor e não entram aqui.
 */
export interface VariantToken {
  fallback: string;
  key: string;
  /** `color` (padrão), `image` (enviar/colar imagem) ou `text`. */
  kind: "color" | "image" | "text";
  label: string;
}

const t = (
  key: string,
  label: string,
  fallback: string,
  kind: VariantToken["kind"] = "color"
): VariantToken => ({ fallback, key, kind, label });

const RAIZ: VariantToken[] = [
  t("active", "Roxo ativo (links e botões)", "#6617ff"),
  t("blue", "Azul", "#2962ff"),
  t("gold", "Dourado", "#fab837"),
  t("green", "Verde", "#88ca58"),
  t("lime", "Marca-texto", "#6617ff"),
  t("soft", "Fundo suave", "#f8f8f8"),
  t("summary", "Texto dos resumos", "#2c495f"),
  t("title", "Títulos", "#1c244b"),
  t("violet", "Violeta", "#6617ff"),
];

export const VARIANT_TOKENS: Record<string, VariantToken[]> = {
  areaflix: [
    t("orange", "Laranja de destaque", "#ff5a19"),
    t("surface", "Fundo dos cartões", "#1d1d1d"),
  ],
  atlas: [
    t("soft", "Texto suave", "#94a3b8"),
    t("panel", "Fundo dos painéis", "#00111a"),
  ],
  central: [t("line", "Bordas", "#313131"), t("title", "Títulos", "#fcfcfc")],
  consultoria: [
    t("glow", "Brilho", "#4CC9F03B"),
    t("night", "Fundo noturno", "#101620"),
    t("hair", "Fios finos", "#FFFFFF17"),
    t("line", "Bordas luminosas", "#0EE6FF36"),
    t("petrol", "Verde-petróleo", "#05282C"),
  ],
  corte: [
    t("forest", "Verde-floresta (véus e divisórias)", "#002715"),
    t("moss", "Verde-musgo (bordas e hover)", "#033F21"),
    t("teal", "Turquesa (ícones e setas)", "#00CEA6"),
  ],
  diario: [
    t("dark", "Fundo escuro", "#212326"),
    t("foot", "Rodapé", "#0F1012"),
    t("hover", "Cor ao passar o mouse", "#4700C4"),
    t("page", "Fundo da página", "#EEEEEE"),
    t("strip", "Faixas", "#F1F1F1"),
    t("title", "Títulos", "#060429"),
  ],
  gatilhos: [
    t("glow", "Brilho", "#00E1FF24"),
    t("line", "Bordas", "#FFFFFF29"),
  ],
  grana: [
    t("answer", "Respostas do FAQ", "#CCCCCC"),
    t("blue", "Azul (fim do degradê do botão)", "#3D49E1"),
    t("check", "Marcas de check", "#B557FF"),
    t("icon", "Ícones", "#694BFF"),
    t("line", "Bordas", "#2A2E36"),
    t("title", "Títulos", "#F3F4F6"),
  ],
  habilidades: [
    t("gold", "Dourado (estrelas)", "#FFB700"),
    t("line", "Bordas", "#FFFFFF1A"),
    t("panel", "Cartões de benefício", "#141414"),
    t("pink", "Rosa do degradê", "#D457F8"),
    t("violet", "Violeta do degradê", "#6F09F7"),
  ],
  holofote: [
    t("bar", "Barras", "#e1e1e1"),
    t("code", "Número 404", "#3a589b"),
    t("date", "Datas", "#707070"),
    t("foot", "Rodapé", "#d0d0d0"),
    t("hover", "Cor ao passar o mouse", "#cccccc"),
    t("page", "Fundo da página", "#f1f1f1"),
  ],
  instafan: [
    t("dark", "Azul escuro", "#1C244D"),
    t("panel", "Painéis", "#010921"),
  ],
  journal: [
    t("footerBg", "Fundo do rodapé", "#1b2430"),
    t("linksBg", "Imagem da faixa de links", "", "image"),
  ],
  margem: [t("green", "Verde", "#2f4a3a"), t("line", "Linhas", "#dcd8cf")],
  marketplace: [
    t("active", "Laranja (item ativo)", "#ff7c03"),
    t("line", "Bordas", "#424242"),
    t("pink", "Rosa", "#f2295b"),
    t("soft", "Texto suave", "#bbbbbb"),
    t("title", "Títulos", "#ffffff"),
  ],
  motorista: [
    t("dark", "Fundo escuro", "#242424"),
    t("panel", "Painéis", "#EFEFEF"),
    t("soft", "Fundo suave", "#F5F5F5"),
    t("title", "Títulos", "#363636"),
    t("yellow", "Amarelo", "#E8B006"),
  ],
  outrolado: [
    t("dark", "Verde escuro", "#023131"),
    t("line", "Linhas verdes", "#009D49"),
  ],
  pagatg: [
    t("cyan", "Ciano", "#34D6E2"),
    t("line", "Bordas", "#44404C"),
    t("panel", "Painéis", "#22143D"),
    t("soft", "Fundo suave", "#2F2248"),
  ],
  patrimonial: [
    t("dark", "Fundo escuro", "#131313"),
    t("panel", "Painéis", "#ECECE7"),
    t("soft", "Fundo suave", "#C8C8C8"),
  ],
  portal: [t("footerBg", "Fundo do rodapé", "#1b2430")],
  presets: [
    t("blue", "Azul", "#2575FC"),
    t("deep", "Roxo profundo", "#481888"),
    t("glow", "Brilho", "#280848"),
    t("line", "Bordas", "#5818A8"),
    t("panel", "Painéis", "#5818A81F"),
    t("pink", "Rosa", "#F83696"),
    t("toggle", "Botão de alternar", "#8C3EDA"),
  ],
  raiz: RAIZ,
  resolvit: [
    t("dark", "Azul escuro", "#062d92"),
    t("ink", "Texto escuro", "#1b262c"),
    t("line", "Bordas", "#becbff"),
    t("mid", "Azul médio", "#0962ea"),
    t("soft", "Fundo suave", "#f2f7ff"),
  ],
  seguidores: [
    t("active", "Roxo ativo (links e botões)", "#6617ff"),
    t("blue", "Azul", "#2962ff"),
    t("lime", "Marca-texto", "#ebfe00"),
    t("soft", "Fundo suave", "#f7f4ff"),
    t("summary", "Texto dos resumos", "#2c495f"),
    t("title", "Títulos", "#000000"),
    t("violet", "Violeta", "#8261db"),
  ],
  seopack: [
    t("dark", "Fundo escuro", "#080111"),
    t("deep", "Roxo profundo", "#311557"),
    t("edge", "Bordas roxas", "#2f006b"),
    t("line", "Linhas", "#231a2d"),
    t("panel", "Painéis", "#120424"),
    t("soft", "Fundo suave", "#e9d8fe"),
    t("grid", "Textura de grade das caixas escuras", "", "image"),
  ],
  sim: [
    t("green", "Verde", "#41B84F"),
    t("lilac", "Lilás", "#8975C6"),
    t("soft", "Fundo suave", "#8351F117"),
    t("line", "Bordas", "#8351F147"),
    t("rose", "Rosa", "#DCB8C0"),
  ],
  universo: [
    t("neon", "Vermelho neon", "#ff0033"),
    t("redBright", "Vermelho vivo", "#ff2c49"),
    t("redDeep", "Vermelho escuro", "#8e0f22"),
    t("redDim", "Vermelho translúcido", "#e11d3a57"),
    t("redFaint", "Vermelho sutil", "#e11d3a29"),
  ],
  viralpack: [
    t("gray", "Cinza (texto do botão)", "#3A3A3A"),
    t("orange", "Laranja", "#FFA33E"),
  ],
  vslmilionario: [
    t("glass", "Vidro (bordas dos cartões)", "#FFFFFF2B"),
    t("night", "Azul-noite", "#070B20"),
    t("night2", "Azul-noite 2", "#16163C"),
    t("violet", "Violeta", "#7237BD"),
  ],
  zyrion: [
    t("blue", "Azul das etiquetas", "#004cff99"),
    t("dark", "Fundo escuro (rodapé e grades)", "#141414"),
    t("line", "Bordas", "#c6cedd"),
    t("meta", "Datas e autor", "#656b77"),
    t("purple", "Roxo das etiquetas", "#540cf19c"),
    t("title", "Títulos", "#020817"),
    t("soft", "Fundo suave azulado", "#ecf1ff"),
    t("soft2", "Fundo suave lilás", "#f1edfd"),
    t("text", "Texto", "#3c414c"),
    t("zyAuthor", "Nome do autor dos posts", "Redação", "text"),
    t("zyAvatar", "Foto do autor dos posts", "", "image"),
  ],
};
