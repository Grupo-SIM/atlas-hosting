/**
 * Marca do template "Holofote — Portal de Famosos": tudo que identifica o portal fica aqui (nome, contatos,
 * redes, textos). É uma marca **fictícia** — o layout é inspirado no hugogloss.uol.com.br, a marca e as notícias
 * não. Trocar a marca = editar este arquivo (ou o site no editor).
 */
export const BRAND = {
  copyright: "Holofote",
  domain: "holofote.com.br",
  email: "pauta@holofote.com.br",
  followText: "Siga o Holofote e acompanhe nossas notícias",
  followUrl: "#",
  /** Texto opcional à direita do rodapé (no original ficam os créditos das agências). */
  footerNote: "Portal de famosos e entretenimento",
  legalName: "Holofote Comunicação",
  name: "Holofote",
  socials: [
    ["Facebook", "https://facebook.com/"],
    ["X", "https://x.com/"],
    ["Instagram", "https://instagram.com/"],
    ["TikTok", "https://tiktok.com/"],
    ["YouTube", "https://youtube.com/"],
  ] as [string, string][],
} as const;
