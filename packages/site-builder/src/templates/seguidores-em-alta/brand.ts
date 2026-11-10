/**
 * Marca do template Seguidores em Alta (seguidoresemalta.com): nome, contatos, redes, links externos e cores num
 * lugar só. Os outros arquivos do template leem daqui — trocar a marca é editar este arquivo (ou, num site já
 * criado, o cabeçalho, o rodapé e o tema no editor).
 */
export const BRAND = {
  /** Blogs do grupo (menu, rodapé e "Blogs Recomendados"). */
  blogs: {
    centralMarketing: "https://centraldomarketing.com/",
    marketingRaiz: "https://marketingraiz.com/",
    marketplace: "https://marketplace.centraldomarketing.com/",
    renovada: "https://www.renovada12.com.br/blog/",
    spyHacker: "https://007spyhacker.com/",
    zyrion: "https://zyrionbrazil.com/",
  },
  /** Cores do kit do Elementor do original. */
  colors: {
    active: "#6617ff",
    bg: "#ffffff",
    blue: "#2962ff",
    fg: "#7a7a7a",
    lime: "#ebfe00",
    primary: "#6f4cce",
    soft: "#f7f4ff",
    summary: "#2c495f",
    title: "#000000",
    violet: "#8261db",
  },
  communities: "https://lp.centraldomarketing.com/comunidades-no-whatsapp/",
  company: "SIM Intermediações",
  contact: {
    email: "contatosimintermediacoes@gmail.com",
    phone: "+55 68 99246-0595",
  },
  domain: "seguidoresemalta.com",
  /** Nome usado nos textos legais. */
  legalName: "Seguidores em Alta",
  name: "Seguidores em Alta",
  /** Outras opções do rodapé. */
  others: {
    fundacao: "https://fundacaoafifarao.org.br/",
    igreja: "https://www.renovada12.com.br/",
  },
  /** Produtos do marketplace (mosaico da home). */
  products: {
    areaflix:
      "https://marketplace.centraldomarketing.com/areaflix-area-de-membros/",
    dark: "https://marketplace.centraldomarketing.com/o-outro-lado-da-internet/",
    gatilhos:
      "https://marketplace.centraldomarketing.com/ebook-gatilhos-mentais/",
    habilidades:
      "https://marketplace.centraldomarketing.com/ebook-habilidades-de-comunicacao/",
    viralpack: "https://marketplace.centraldomarketing.com/viralpack/",
  },
  /** Perfis nas redes (rodapé, colagem da home e página de links). */
  social: {
    facebook: "https://www.facebook.com/seguidoresemalta/",
    instagram: "https://www.instagram.com/segemalta/",
    kwai: "https://www.kwai.com/@segemalta",
    threads: "https://www.threads.com/@segemalta",
    tiktok: "https://www.tiktok.com/@segemalta",
    x: "https://x.com/segemalta",
    youtube: "https://www.youtube.com/@seguidoresemalta",
  },
} as const;
