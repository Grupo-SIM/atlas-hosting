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
  /** `color` (padrão), `image` (enviar/colar imagem), `text` ou `select` (lista fechada em `options`). */
  kind: "color" | "image" | "select" | "text";
  label: string;
  options?: { label: string; value: string }[];
}

const t = (
  key: string,
  label: string,
  fallback: string,
  kind: VariantToken["kind"] = "color",
  options?: VariantToken["options"]
): VariantToken =>
  options
    ? { fallback, key, kind, label, options }
    : { fallback, key, kind, label };

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
  fundacao: [
    t("greenDark", "Verde escuro (barra do topo)", "#106504"),
    t("greenBright", "Verde vivo (sublinhado do menu, rótulos)", "#04CC40"),
    t("greenBg", "Verde das faixas (colaborador e notícias)", "#01902B"),
    t("greenFooter", "Verde do rodapé", "#0D8F06"),
    t("cyan", "Ciano dos rótulos do rodapé", "#7EE3F0"),
    t("soft", "Fundo da faixa de título das internas", "#EEF4FF"),
    t("crumb", "Cor do link da trilha (Início ›)", "#7B8CFF"),
    t("cnpj", "CNPJ da fundação", "00.000.000/0001-00", "text"),
    t(
      "address",
      "Endereço (cabeçalho, rodapé, contato e mapa)",
      "Rua Exemplo, 100 – Centro – Cidade/UF",
      "text"
    ),
    t("contactEmail", "E-mail de contato", "contato@exemplo.org.br", "text"),
    t("phone", "Telefone (com DDD)", "", "text"),
    t(
      "whatsapp",
      "WhatsApp (só números, com DDI e DDD)",
      "5500000000000",
      "text"
    ),
    t(
      "hours",
      "Horário de atendimento",
      "Segunda a sexta, das 8h às 12h e das 14h às 18h",
      "text"
    ),
    t("pixKeyType", "PIX — tipo da chave", "email", "select", [
      { label: "CNPJ", value: "cnpj" },
      { label: "E-mail", value: "email" },
      { label: "Telefone", value: "phone" },
      { label: "Chave aleatória", value: "random" },
    ]),
    t(
      "pixKey",
      "PIX — chave (troque a de exemplo!)",
      "pix@exemplo.org.br",
      "text"
    ),
    t(
      "pixReceiver",
      "PIX — nome do recebedor",
      "FUNDACAO SEMENTE VIVA",
      "text"
    ),
    t("pixCity", "PIX — cidade do recebedor", "CIDADE EXEMPLO", "text"),
    t("pixId", "PIX — código da transferência (opcional)", "", "text"),
    t("pixQr", "PIX — imagem do QR code", "", "image"),
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
  pousada: [
    t("blueDark", "Azul escuro (hover do botão azul)", "#2974A3"),
    t("blue900", "Azul profundo (datas, modal)", "#184E70"),
    t("blueGlow", "Azul do brilho dos cartões", "#35B0FC"),
    t("green", "Verde (botões e bordas)", "#5E943E"),
    t("green900", "Verde escuro (hover, topo, linha do tempo)", "#47702F"),
    t("greenLight", "Verde claro (divisória da missão)", "#90F157"),
    t("cardBlue", "Fundo dos cartões azuis", "#143346"),
    t("cardGreen", "Fundo dos cartões verdes", "#1B330C"),
    t("expGreen", "Fundo do cartão verde das experiências", "#254611"),
    t("dark", "Fundo escuro (modo escuro e modal)", "#1C2428"),
    t("sky", "Azul-céu (fim das experiências, início da missão)", "#CCE6F5"),
    t(
      "bookUrl",
      "URL de reserva (vazio = WhatsApp com mensagem de reserva)",
      "",
      "text"
    ),
    t(
      "whatsapp",
      "WhatsApp (só números, com DDI e DDD)",
      "5500000000000",
      "text"
    ),
    t(
      "waMessage",
      "Mensagem padrão do WhatsApp",
      "Olá! Gostaria de mais informações sobre a hospedagem.",
      "text"
    ),
    t(
      "contactEmail",
      "E-mail de contato (vazio = sem ícone)",
      "contato@exemplo.com",
      "text"
    ),
    t("phone", "Telefone (vazio = sem ícone)", "", "text"),
    t("mapAddress", "Endereço do mapa", "Chapada dos Veadeiros, GO", "text"),
    t("darkMode", "Seguir o modo escuro do aparelho", "yes", "select", [
      { label: "Sim", value: "yes" },
      { label: "Não", value: "no" },
    ]),
  ],
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
  saut: [
    t("ink", "Escuro (serviços, cartão 95% e rodapé)", "#131313"),
    t("lime", "Verde-limão (faixa, checks e redes)", "#CCFB55"),
    t("green", "Verde (destaque dos resultados)", "#00C22A"),
    t("orange", "Laranja (raio, escudo e %)", "#FF3C00"),
    t("sky", "Azul-céu (pílulas e bordas)", "#DAF0FF"),
    t("sky2", "Azul-céu claro (fundos)", "#EEF8FF"),
    t("gray", "Cinza (cabeçalho, logos e grade)", "#F2F2F2"),
    t("line", "Divisórias", "#E7E7E7"),
    t("teal", "Verde-água (só o 95%)", "#2DD4A0"),
    t(
      "whatsappUrl",
      "Link do WhatsApp (botões Fale com a SAUT)",
      "https://wa.me/5500000000000",
      "text"
    ),
    t(
      "contactEmail",
      "E-mail de contato (rodapé)",
      "contato@exemplo.com",
      "text"
    ),
    t(
      "instagramUrl",
      "Link do Instagram (rodapé)",
      "https://www.instagram.com/",
      "text"
    ),
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
  sorveteria: [
    t("blueLight", "Azul claro (degradê dos cartões e da faixa)", "#3342FF"),
    t("blueDark", "Azul escuro (fim da faixa “Fale com a gente”)", "#0008CC"),
    t("yellow", "Amarelo (destaques, títulos do rodapé, onda)", "#FFED00"),
    t("yellowDark", "Amarelo escuro (hover do amarelo)", "#E6D600"),
    t("yellowSoft", "Amarelo suave (fundo da linha do tempo)", "#FFF9C4"),
    t("cyan", "Ciano (onda e cartão da 2ª unidade)", "#00E5FF"),
    t("red", "Vermelho (slide da pizza)", "#E33E2B"),
    t(
      "timezone",
      "Fuso horário da loja (ex.: America/Sao_Paulo, America/Rio_Branco)",
      "America/Sao_Paulo",
      "text"
    ),
    t(
      "waMessage",
      "Mensagem do WhatsApp ({marca} e {unidade} são trocados)",
      "Olá, {marca} ({unidade}). Gostaria de fazer um pedido!",
      "text"
    ),
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
