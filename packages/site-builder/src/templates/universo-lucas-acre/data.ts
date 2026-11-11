import { MKT_INFLUENCERS } from "../sim-intermediacoes/data.js";

/**
 * Conteúdo do template "Universo" (hub do Lucas Acre). Textos, marcas e links são do grupo (Lucas Acre / SIM INT) e vêm
 * do bundle do olucasacre.marketingraiz.com, conferido em 2026-11-11. As redes do Lucas Acre saem do mesmo registro que
 * o template `sim-intermediacoes` usa (`MKT_INFLUENCERS`), para não haver duas fontes; o Telegram só existe aqui.
 */

const lucas = MKT_INFLUENCERS.find(i => i.name === "Lucas Acre");
if (!lucas) throw new Error("Lucas Acre sumiu de sim-intermediacoes/data.ts");

/** `rede | endereço`, uma por linha (formato do `sim-intermediacoes`). */
const socials = Object.fromEntries(
  lucas.links.split("\n").map(line => {
    const [k = "", v = ""] = line.split("|").map(s => s.trim());
    return [k.toLowerCase(), v];
  })
);

/** Instagram com barra final, como no hub. */
const withSlash = (u: string) => (u.endsWith("/") ? u : `${u}/`);

export const LUCAS = {
  instagram: withSlash(
    socials.instagram ?? "https://www.instagram.com/olucasacre/"
  ),
  photo: lucas.image,
  telegram: "https://t.me/canaldoluketa",
  tiktok: socials.tiktok ?? "https://www.tiktok.com/@lucasacre",
  youtube: socials.youtube ?? "https://www.youtube.com/@lucasacre",
};

export const CREDIT = "FEITO POR SIM INT";
export const CNPJ = "38.486.051/0001-48";
export const NOTE =
  "DAQUI PRA FRENTE, CADA CLIQUE ABRE UMA NOVA POSSIBILIDADE.";

export const SEO = {
  description:
    "Hub do Lucas Acre: comunidades, plataformas, conteúdo, redes e serviços do ecossistema SIM.",
  title: "Lucas Acre — Escolha sua carta",
};

/** Opções do carrossel da home (mesmos textos e quebras de linha do hub). */
export const OPTIONS = [
  {
    choices: [],
    countdown: "yes",
    description: "GRUPOS, NETWORKING, ACESSO\nPRIVADO, RESENHA E CONTEÚDO.",
    kind: "confirm",
    title: "COMUNIDADES",
    url: "https://lp.centraldomarketing.com/comunidades-no-whatsapp/",
  },
  {
    choices: [],
    countdown: "yes",
    description: "SISTEMAS, SAAS, AUTOMAÇÕES,\nFERRAMENTAS E TECNOLOGIAS.",
    kind: "confirm",
    title: "PLATAFORMAS",
    url: "https://simintermediacoes.com/portfolio-tecnologia/",
  },
  {
    choices: [
      { countdown: "no", label: "PAGO", url: "/pago/" },
      { countdown: "no", label: "GRATUITO", url: "/gratuito/" },
    ],
    countdown: "yes",
    description: "BLOGS, AULAS,\nNOTÍCIAS E INFOPRODUTOS.",
    kind: "choices",
    title: "CONTEÚDO",
    url: "",
  },
  {
    choices: [
      { countdown: "no", label: "LUCAS ACRE", url: "/lucas-acre/" },
      { countdown: "no", label: "MARCAS", url: "/marcas/" },
    ],
    countdown: "yes",
    description: "YOUTUBE, TIKTOK,\nTELEGRAM, INSTAGRAM",
    kind: "choices",
    title: "PRESENÇA DIGITAL",
    url: "",
  },
  {
    choices: [
      {
        countdown: "yes",
        label: "SIM INTERMEDIAÇÕES - SERVIÇOS DIGITAIS",
        url: "https://simintermediacoes.com/",
      },
    ],
    countdown: "yes",
    description: "NOS CONTRATE E ESCALE\nSEU PRODUTO OU\nPRESTAÇÃO DE SERVIÇOS",
    kind: "choices",
    title: "SERVIÇOS E EMPRESAS",
    url: "",
  },
];

interface Item {
  name: string;
  niche?: string;
  soon?: boolean;
  url: string;
}

export const PAGO: Item[] = [
  { name: "E-BOOKS", url: "https://ebooksim.com/" },
  // Na referência o link é `#` com o selo: aqui fica "em breve" de verdade, sem clique.
  { name: "CURSOS", soon: true, url: "" },
  { name: "MARKETPLACE", url: "https://marketplace.centraldomarketing.com/" },
];

export const GRATUITO: Item[] = [
  {
    name: "Marketing Raiz",
    niche: "Nicho de Marketing",
    url: "https://marketingraiz.com/",
  },
  {
    name: "Central do Marketing",
    niche: "Nicho de Marketing",
    url: "https://centraldomarketing.com/",
  },
  {
    name: "Seguidores em Alta",
    niche: "Nicho de Redes Sociais",
    url: "https://seguidoresemalta.com/",
  },
  {
    name: "007SpyHacker",
    niche: "Nicho de Tecnologia",
    url: "https://007spyhacker.com/",
  },
  {
    name: "Zyrion Brazil",
    niche: "Jornal Digital",
    url: "https://zyrionbrazil.com/",
  },
];

export const REDES: Item[] = [
  { name: "INSTAGRAM", url: LUCAS.instagram },
  { name: "TIKTOK", url: LUCAS.tiktok },
  { name: "TELEGRAM", url: LUCAS.telegram },
  { name: "YOUTUBE", url: LUCAS.youtube },
];

export const MARCAS: Item[] = [
  {
    name: "Marketing Raiz",
    niche: "Marketing",
    url: "https://www.instagram.com/mktraiz.br/",
  },
  {
    name: "Central do Marketing",
    niche: "Marketing",
    url: "https://www.instagram.com/centraldomarketingbr/",
  },
  {
    name: "Seguidores em Alta",
    niche: "Redes Sociais",
    url: "https://www.instagram.com/segemalta/",
  },
  {
    name: "007SpyHacker",
    niche: "Tecnologia",
    url: "https://www.instagram.com/007spyhacker/",
  },
  {
    name: "Zyrion Brazil",
    niche: "Jornal Digital",
    url: "https://www.instagram.com/zyrionbrazil/",
  },
  {
    name: "Vivendo de Bet",
    niche: "Apostas",
    url: "https://www.instagram.com/vivendodebetbr/",
  },
  {
    name: "Corte dos Ricos",
    niche: "Empreendedorismo",
    url: "https://www.instagram.com/cortesdosricosbr/",
  },
  {
    name: "SIMPASS",
    niche: "Bilheteria Digital",
    url: "https://www.instagram.com/use.simpass/",
  },
  {
    name: "Atlas Hosting",
    niche: "Domínio e Hospedagem",
    url: "https://atlashosting.com.br/",
  },
  {
    name: "SIM Intermediações",
    niche: "Empresa de Serviços",
    url: "https://www.instagram.com/sim.intermediacoes/",
  },
  {
    name: "Fraternidade SIM",
    niche: "Gestora de Comunidades",
    soon: true,
    url: "https://www.instagram.com/fraternidadesim/",
  },
  {
    name: "Ebook SIM",
    niche: "Marketplace de Livros",
    url: "https://ebooksim.com/",
  },
  { name: "Paga TG", niche: "Checkout", url: "https://pagatg.com/" },
  {
    name: "SIM Int Pay",
    niche: "Gateway de Pagamentos",
    url: "https://simintpay.com/",
  },
  {
    name: "Áreaflix",
    niche: "Área de Membros",
    url: "https://areaflix.simintermediacoes.com/",
  },
  { name: "Teron", niche: "Comunicação em Equipe", url: "https://teron.app/" },
];

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`;

/** Favicon: planeta com anel, vermelho sobre preto (sem `;` para passar no `cssUrl`). */
export const FAVICON = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#050000"/><g fill="none" stroke="#e11d3a" stroke-width="3"><circle cx="32" cy="32" r="13"/><ellipse cx="32" cy="32" rx="27" ry="8" transform="rotate(-22 32 32)"/></g></svg>`
);

/** Miniatura do template: três cartas em leque sob a coluna em arco. */
export const PREVIEW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#050000"/><path d="M376 800V250A224 130 0 0 1 824 250V800" fill="#0a0505" stroke="#e11d3a" stroke-width="3"/><g fill="none" stroke="#e11d3a" stroke-opacity=".3"><ellipse cx="600" cy="360" rx="300" ry="70" transform="rotate(-14 600 360)"/><ellipse cx="600" cy="450" rx="280" ry="52" transform="rotate(10 600 450)"/></g><text x="600" y="330" fill="#fff" font-family="Oswald,Arial" font-size="34" font-weight="700" letter-spacing="5" text-anchor="middle">VOCÊ ENTROU NO</text><text x="600" y="384" fill="#fff" font-family="Oswald,Arial" font-size="34" font-weight="700" letter-spacing="5" text-anchor="middle">LUGAR CERTO.</text><text x="600" y="470" fill="#e11d3a" font-family="Oswald,Arial" font-size="18" font-weight="700" letter-spacing="4" text-anchor="middle">ESCOLHA SUA CARTA</text><g fill="#220709" stroke="#8c2a37" stroke-width="3"><rect x="345" y="600" width="200" height="300" rx="12" transform="rotate(-12 445 900)"/><rect x="655" y="600" width="200" height="300" rx="12" transform="rotate(12 755 900)"/><rect x="500" y="560" width="200" height="300" rx="12"/></g><g fill="none" stroke="#c23a4c" stroke-width="3"><circle cx="600" cy="690" r="34"/><ellipse cx="600" cy="690" rx="66" ry="15" transform="rotate(-18 600 690)"/></g></svg>`
);
