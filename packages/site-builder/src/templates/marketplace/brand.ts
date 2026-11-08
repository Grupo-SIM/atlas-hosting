/**
 * Marca do template Marketplace (marketplace.centraldomarketing.com): nome, contatos, cores e links num
 * lugar só. Os outros arquivos do template leem daqui — trocar a marca é editar este arquivo (ou, num site
 * já criado, o cabeçalho, o rodapé e o tema no editor).
 */
export const BRAND = {
  /** Cores do kit do Elementor do original. */
  colors: {
    accent: "#fcb808",
    active: "#ff7c03",
    bg: "#111111",
    line: "#424242",
    muted: "#969696",
    pink: "#f2295b",
    soft: "#bbbbbb",
    surface: "#1b1b1b",
    title: "#ffffff",
  },
  company: "SIM Intermediações",
  copyright: "© SIM Intermediações — Todos os direitos reservados.",
  domain: "marketplace.centraldomarketing.com",
  email: "contatosimintermediacoes@gmail.com",
  /** Nome usado nos textos legais. */
  legalName: "Marketplace Central do Marketing",
  /** Nome do site (aba do navegador). */
  name: "Marketplace",
  poweredBy: {
    alt: "SIMINT",
    label: "Powered by:",
    url: "https://simintermediacoes.com/",
  },
  /** Vídeo do "Por que somos os melhores?" (Vimeo do original; abre em popup). */
  video: "https://vimeo.com/1088198038",
} as const;
