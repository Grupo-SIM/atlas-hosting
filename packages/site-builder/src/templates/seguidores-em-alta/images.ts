/**
 * Imagens do template. Por enquanto apontam para o WordPress original (como `areaflix` e `spyhacker`); a lista
 * para copiar ao storage está em `plans/seguidoresemalta-imagens.md`. Trocar uma imagem é editar só este arquivo.
 */
const UP = "https://seguidoresemalta.com/wp-content/uploads";

export const IMG = {
  avatar: `${UP}/2025/11/cropped-Logo-Seguidores-em-Alta-300x300.png`,
  bannerBlogs: `${UP}/2025/11/cropped-view-of-businesswoman-typing-on-laptop-at-workplace-with-multimedia-icons.jpg`,
  bannerCategorias: `${UP}/2025/11/categoria.jpeg`,
  bannerConteudo: `${UP}/2025/11/centraldomarketingblog-1.webp`,
  blogs: {
    centralMarketing: `${UP}/2025/11/centraldomarketingblog-1.webp`,
    marketingRaiz: `${UP}/2025/11/marketingraizblog-1.webp`,
    renovada: `${UP}/2025/11/renovadablog-1.png`,
    spyHacker: `${UP}/2025/11/May-15-2025-11_46_37-AM-e1764108647131.png`,
    zyrion: `${UP}/2025/11/Zyrion-Logo.jpg`,
  },
  categories: {
    "branding-e-marca": `${UP}/2025/11/Gemini_Generated_Image_p54afxp54afxp54a.png`,
    "crescimento-rapido": `${UP}/2025/11/Gemini_Generated_Image_fx5176fx5176fx51.png`,
    "criacao-de-conteudo": `${UP}/2025/11/image_fx-3.webp`,
    ferramentas: `${UP}/2025/11/Gemini_Generated_Image_jjqe3vjjqe3vjjqe-1.png`,
    monetizacao: `${UP}/2025/11/image_fx-1.webp`,
    "novidades-e-atualizacoes": `${UP}/2025/11/Gemini_Generated_Image_8vdg8o8vdg8o8vdg.png`,
    "redes-sociais": `${UP}/2025/11/Gemini_Generated_Image_ctaid9ctaid9ctai.png`,
    seguranca: `${UP}/2025/11/Gemini_Generated_Image_q8y1ihq8y1ihq8y1.png`,
  } as Record<string, string>,
  footerLogo: `${UP}/2025/11/Seg-Logo.png`,
  heroPhoto: `${UP}/2025/11/9964487-1024x1024.jpg`,
  logo: `${UP}/2025/11/Logo-Seguidores-em-Alta.png`,
  /** Animações Lottie do hero (o JSON precisa mandar CORS ao ser copiado para o storage). */
  lottie1: "https://assets7.lottiefiles.com/packages/lf20_vlqmej6n.json",
  lottie2: `${UP}/2025/11/Social-Bubble.json`,
  mockup: `${UP}/2025/11/iphone_13_mockup_11-1-1-EDITADO-1-1-1.png`,
  overlayCta: `${UP}/2025/11/overlay_13.png`,
  overlayTexture: `${UP}/2025/11/overlay_3.png`,
  products: {
    areaflix: `${UP}/2025/11/Arefaflix400x.jpg`,
    dark: `${UP}/2026/06/DARK-WEB.jpg`,
    gatilhos: `${UP}/2026/06/Gatilhos-mentais-ebook.jpg`,
    habilidades: `${UP}/2025/11/HABILIDADES-COMUNICACAO-E-BOOK.jpg`,
    viralpack: `${UP}/2025/11/VIRALPACK-430x300-2.jpg`,
  },
  reviewers: [
    `${UP}/2025/11/WhatsApp-Image-2025-02-11-at-15.57.54.jpeg`,
    `${UP}/2025/11/WhatsApp-Image-2025-02-11-at-16.12.16.jpeg`,
    `${UP}/2025/11/WhatsApp-Image-2025-02-11-at-16.01.40.jpeg`,
    `${UP}/2025/11/WhatsApp-Image-2025-02-11-at-16.01.07.jpeg`,
  ],
  reviewsBg: `${UP}/2025/11/male-streamer-recording-in-studio-YL2Z65W.jpg`,
  social: {
    instagram: `${UP}/2025/11/LOGO-INSTAGRAM-1024x1024.png`,
    kwai: `${UP}/2025/11/LOGO-KWAI-01-1024x1024.png`,
    tiktok: `${UP}/2025/11/LOGO-TIK-TOK-1024x1024.png`,
    youtube: `${UP}/2025/11/LOGO-YOU-TUBE-1024x1024.png`,
  },
} as const;
