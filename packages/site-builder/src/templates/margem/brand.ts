/**
 * Marca do template Margem (estúdio fictício de design de marcas em Recife): nome, números, cores,
 * contatos e redes num lugar só. Os outros arquivos do template leem daqui — trocar a marca é editar
 * este arquivo (ou, num site já criado, os blocos e o tema no editor).
 */
export const BRAND = {
  address: "Rua da Harmonia, Recife",
  city: "Recife",
  colors: {
    /** Fundo off-white. */
    bg: "#f2f0eb",
    /** Texto. */
    fg: "#141414",
    /** Acento 2: verde-mata (um detalhe por seção). */
    green: "#2f4a3a",
    /** Fios e linhas. */
    line: "#dcd8cf",
    /** Texto secundário. */
    muted: "#5d5b56",
    /** Pílulas. */
    pill: "#ffffff",
    /** Acento 1: terracota (cor principal do tema). */
    terra: "#d9653b",
  },
  email: "ola@margem.studio",
  /** Fonte do site inteiro (Google Fonts, 400 e 500). */
  font: "Geist",
  name: "Margem",
  numbers: { cities: 9, people: 6, projects: 41, since: 2016 },
  /** Redes do rodapé (endereços de exemplo: troque pelos perfis do estúdio). */
  socials: [
    { label: "Instagram", url: "#" },
    { label: "Behance", url: "#" },
    { label: "LinkedIn", url: "#" },
  ],
  /** Cores da equipe (bolinhas embaixo do manifesto), uma por pessoa. */
  team: ["#d9653b", "#2f4a3a", "#b9a888", "#3a3a38", "#cfc9bd", "#7d8467"],
} as const;

/** Favicon: o "m" do wordmark num quadrado escuro (SVG em `data:`, sem `;` para passar no `cssUrl`). */
export const FAVICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${BRAND.colors.fg}"/><path d="M14 46V20M14 31a9 9 0 0 1 18 0v15M32 31a9 9 0 0 1 18 0v15" fill="none" stroke="${BRAND.colors.bg}" stroke-width="5"/></svg>`
)}`;
