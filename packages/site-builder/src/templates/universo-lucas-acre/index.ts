import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import {
  CNPJ,
  CREDIT,
  FAVICON,
  GRATUITO,
  LUCAS,
  MARCAS,
  NOTE,
  OPTIONS,
  PAGO,
  PREVIEW,
  REDES,
  SEO,
} from "./data.js";

/**
 * Template "Universo — Hub de Links em Cartas" (variante `universo`): o hub do Lucas Acre (olucasacre.marketingraiz.com)
 * com mecânica, fluxo, tempos e textos da referência e **arte própria**. A home da referência recria a interface de um
 * jogo de navegador de terceiros; aqui coluna, cartas, selo, fita, cronômetro e ícones foram redesenhados ("portal /
 * órbita"), os ícones de cabeça e o vídeo `eyes.mp4` saíram e o granulado é CSS. Um teste impede que nomes, textos e
 * caminhos SVG do jogo voltem.
 *
 * Rotas: `/` (bloco `uvStage`), `/pago/`, `/gratuito/`, `/lucas-acre/`, `/marcas/` e 404 (bloco `uvPanel`), todas sem
 * cabeçalho nem rodapé. Não há rota `/redirect`: a contagem é uma camada aberta pelo runtime com o destino vindo das props.
 */

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `uv-${seq++}`,
  props,
  type,
});

const page = (slug: string, title: string, blocks: Block[]): Page => ({
  bare: true,
  blocks,
  id: `page-${slug || "home"}`,
  slug,
  status: "published",
  title,
});

const COUNTDOWN = {
  cdGo: "REDIRECIONANDO…",
  cdLead: "VOCÊ SERÁ\nREDIRECIONADO EM:",
  cdNote: NOTE,
  cdReady: "TUDO PRONTO…",
  countdownSeconds: 5,
};

interface Item {
  name: string;
  niche?: string;
  soon?: boolean;
  url: string;
}

const items = (list: Item[]) =>
  list.map(i => ({
    countdown: "yes",
    name: i.name,
    niche: i.niche ?? "",
    soon: i.soon ? "yes" : "no",
    url: i.url,
  }));

const panel = (
  banner: string,
  list: Item[],
  extra: {
    phrase?: string;
    photo?: string;
    scrollHeight?: number;
    title?: string;
  } = {}
) =>
  block("uvPanel", {
    backLabel: "Voltar ao início",
    backUrl: "/",
    banner,
    cnpj: CNPJ,
    credit: CREDIT,
    ...COUNTDOWN,
    editorState: "panel",
    items: items(list),
    note: NOTE,
    photo: extra.photo ?? "",
    phrase: extra.phrase ?? "",
    scrollHeight: extra.scrollHeight ?? 0,
    title: extra.title ?? "",
  });

const home = page("", SEO.title, [
  block("uvStage", {
    backLabel: "VOLTAR",
    confirmQuestion: "TEM CERTEZA QUE QUER CONTINUAR?",
    continueLabel: "CONTINUAR",
    cta: "ESCOLHA SUA CARTA",
    ...COUNTDOWN,
    editorOption: 1,
    editorState: "fan",
    heading: "Escolha uma Opção",
    label: "ESCOLHA",
    lines:
      "AQUI CADA CLIQUE ABRE UM\nLADO DIFERENTE DO NOVO\nMUNDO QUE VOCÊ VAI\nCONHECER.",
    loaderOnce: "no",
    loaderSubAccent: "OBSESSÕES.",
    loaderSubLead: "PODE CAUSAR NOVAS ",
    loaderTitle: "CARREGANDO\nMEU UNIVERSO",
    loaderVideo: "",
    noLabel: "NÃO",
    options: OPTIONS,
    timerSeconds: 30,
    title: "VOCÊ ENTROU NO\nLUGAR CERTO.",
    yesLabel: "SIM",
  }),
]);

const pago = page("pago", "Conteúdo pago", [panel("CONTEÚDO PAGO", PAGO)]);

const gratuito = page("gratuito", "Gratuito", [
  panel("GRATUITO", GRATUITO, { title: "BEM-VINDO AO ECOSSISTEMA" }),
]);

const lucasAcre = page("lucas-acre", "Lucas Acre", [
  panel("LUCAS ACRE", REDES, {
    photo: LUCAS.photo,
    phrase: "A internet fica estranhamente interessante daqui pra frente.",
  }),
]);

const marcas = page("marcas", "Marcas", [
  panel("MARCAS", MARCAS, {
    scrollHeight: 320,
    title: "BEM-VINDO AO ECOSSISTEMA",
  }),
]);

const notFound = page("404", "Página não encontrada", [
  panel("ERRO 404", [{ name: "Voltar ao início", url: "/" }], {
    title: "PÁGINA NÃO ENCONTRADA",
  }),
]);

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [],
  header: [],
  menu: [],
  name: SEO.title,
  pages: [home, pago, gratuito, lucasAcre, marcas, notFound],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#e11d3a",
    bg: "#050000",
    card: "#0a0505",
    favicon: FAVICON,
    fg: "#efe7df",
    fontBody: "'Oswald', sans-serif",
    fontHeading: "'Oswald', sans-serif",
    muted: "#b7ada6",
    neon: "#ff0033",
    redBright: "#ff2c49",
    redDeep: "#8e0f22",
    redDim: "#e11d3a57",
    redFaint: "#e11d3a29",
    seoDescription: SEO.description,
    variant: "universo",
  },
};

export const universoLucasAcre: SiteTemplate = {
  description:
    "Hub de links em cartas, preto e vermelho neon: tela de carregamento, três cartas em leque que viram, carrossel de opções com cronômetro e verso, páginas de links com lista rolável e contagem antes de sair do site.",
  id: "universo-lucas-acre",
  name: "Universo — Hub de Links em Cartas",
  preview: PREVIEW,
  site,
  tags: ["Landing", "Marketing"],
};
