# Seguidores em Alta: imagens a copiar para o storage

Hoje todas apontam para o WordPress original (`https://seguidoresemalta.com/wp-content/uploads/…`), centralizadas em
`packages/site-builder/src/templates/seguidores-em-alta/images.ts`. Depois de aprovadas e copiadas, é trocar as URLs lá.
Os posts (capas e imagens do corpo) vêm da API do WordPress e ficam em `posts-data.ts` / `post-bodies.ts`
(10 capas + ~60 imagens nos corpos).

| Uso | Arquivo original |
| --- | --- |
| Logo do cabeçalho / favicon da página de links | `2025/11/Logo-Seguidores-em-Alta.png`, `2025/11/cropped-Logo-Seguidores-em-Alta-300x300.png` |
| Logo do rodapé | `2025/11/Seg-Logo.png` |
| Hero: textura de fundo (e CTA do rodapé) | `2025/11/overlay_13.png` |
| Hero: foto | `2025/11/9964487-1024x1024.jpg` |
| **Lottie 1 (hero)** | `https://assets7.lottiefiles.com/packages/lf20_vlqmej6n.json` (hospedado no LottieFiles) |
| **Lottie 2 (hero)** | `2025/11/Social-Bubble.json` — o JSON precisa mandar `Access-Control-Allow-Origin` ao ser copiado |
| Produtos | `2026/06/Gatilhos-mentais-ebook.jpg`, `2026/06/DARK-WEB.jpg`, `2025/11/Arefaflix400x.jpg`, `2025/11/VIRALPACK-430x300-2.jpg`, `2025/11/HABILIDADES-COMUNICACAO-E-BOOK.jpg` |
| Redes sociais | `2025/11/LOGO-KWAI-01-1024x1024.png`, `LOGO-INSTAGRAM-1024x1024.png`, `LOGO-YOU-TUBE-1024x1024.png`, `LOGO-TIK-TOK-1024x1024.png` |
| Texturas | `2025/11/overlay_3.png` (colagem social e comunidades) |
| Comunidades | `2025/11/iphone_13_mockup_11-1-1-EDITADO-1-1-1.png` |
| Depoimentos: fundo | `2025/11/male-streamer-recording-in-studio-YL2Z65W.jpg` |
| Depoimentos: avatares | `2025/11/WhatsApp-Image-2025-02-11-at-15.57.54.jpeg`, `…16.12.16.jpeg`, `…16.01.40.jpeg`, `…16.01.07.jpeg` |
| Blogs recomendados | `2025/11/marketingraizblog-1.webp`, `centraldomarketingblog-1.webp`, `renovadablog-1.png`, `May-15-2025-11_46_37-AM-e1764108647131.png`, `Zyrion-Logo.jpg` |
| Banners de título | `2025/11/centraldomarketingblog-1.webp` (Conteúdo), `2025/11/categoria.jpeg` (Categorias), `2025/11/cropped-view-of-businesswoman-typing-on-laptop-at-workplace-with-multimedia-icons.jpg` (Blogs, categoria, pesquisa, 404, legais) |
| Cartões de categoria | `2025/11/image_fx-1.webp`, `image_fx-3.webp`, `Gemini_Generated_Image_fx5176fx5176fx51.png`, `…jjqe3vjjqe3vjjqe-1.png`, `…ctaid9ctaid9ctai.png`, `…q8y1ihq8y1ihq8y1.png`, `…8vdg8o8vdg8o8vdg.png`, `…p54afxp54afxp54a.png` |
