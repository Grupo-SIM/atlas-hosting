/**
 * Marca do template Marketing Raiz (marketingraiz.com): nome, contatos, cores e links num lugar só. Os outros
 * arquivos do template leem daqui — trocar a marca é editar este arquivo (ou, num site já criado, o cabeçalho, o
 * rodapé e o tema no editor).
 */
export const BRAND = {
  /** Cores medidas no Elementor do original. */
  colors: {
    active: "#6617ff",
    bg: "#ffffff",
    blue: "#2962ff",
    fg: "#1c244b",
    gold: "#fab837",
    green: "#88ca58",
    soft: "#f8f8f8",
    summary: "#2c495f",
  },
  company: "Marketing Raiz",
  copyright:
    "© Marketing Raiz - Todos os direitos reservados. Proibida reprodução não autorizada.",
  domain: "marketingraiz.com",
  email: "contatosimintermediacoes@gmail.com",
  /** Botão flutuante (todas as páginas, inclusive o funil). */
  float: {
    label: "Entre nas nossas comunidades",
    mobileLabel: "Entre nas nossas\ncomunidades",
    url: "https://lp.centraldomarketing.com/comunidades-no-whatsapp/",
  },
  /** Fundação indicada no rodapé e na página 404. */
  foundationUrl: "https://fundacaoafifarao.org.br/",
  /** Vídeo de exemplo do funil (YouTube público; o Vimeo do grupo recusa incorporação fora do domínio dele). Troque pelo seu em `funnel.ts` ou no editor. */
  funnelVideo: "https://www.youtube.com/watch?v=4F4-jFOigYI",
  name: "Marketing Raiz",
  tagline: "A verdade sobre como vender na internet",
} as const;

/** Menu do original (os externos abrem em nova aba). */
export const MENU = [
  { href: "/categorias/", label: "Categorias" },
  { href: "/blogs/", label: "Blogs" },
  { href: "https://centraldomarketing.com", label: "Central do Marketing" },
  { href: "https://007spyhacker.com", label: "007SpyHacker" },
  { href: "https://seguidoresemalta.com/", label: "Seguidores em alta" },
  { href: "https://renovada12.com.br/blog", label: "Renovada" },
  { href: "https://zyrionbrazil.com/", label: "Zyrion Brazil" },
  { href: "https://marketplace.centraldomarketing.com", label: "Marketplace" },
] as const;

export const SOCIALS =
  "Instagram | https://www.instagram.com/mktraiz.br/\nThreads | https://www.threads.com/@mktraiz.br\nYoutube | https://www.youtube.com/@marketingraiz\nX | https://x.com/mktraiz\nTiktok | https://www.tiktok.com/@mktraiz.br\nVideo | https://www.kwai.com/@mktraizbr\nFacebook | https://www.facebook.com/mktraizbr/";

export const BLOGS_LINKS =
  "Central do Marketing | https://centraldomarketing.com/\nSeguidores em Alta | https://seguidoresemalta.com/\n007SpyHacker | https://007spyhacker.com/\nRenovada | https://www.renovada12.com.br/blog/\nZyrion Brasil | https://zyrionbrazil.com/";
