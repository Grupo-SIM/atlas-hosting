# Marketplace — imagens do original × placeholders do template

Nenhuma imagem do original foi baixada nem é referenciada pelo template. Todas as imagens do template ficam em
`packages/site-builder/src/templates/marketplace/images.ts` (placeholders do Unsplash, conferidos com HTTP 200, e SVGs gerados
para a logo e o selo "Powered by"). Para usar as originais, **depois de aprovado**: copiar cada arquivo para o storage do Atlas e
trocar a URL correspondente em `images.ts` (uma linha por imagem) — nada de apontar para `marketplace.centraldomarketing.com`.

Base das URLs abaixo: `https://marketplace.centraldomarketing.com/wp-content/uploads/`.

## Globais

| Uso | Original | Chave em `images.ts` |
| --- | --- | --- |
| Logo (cabeçalho, gaveta, rodapé) | `2025/04/footer-logo-marketplace.webp` | `IMG.logo` (SVG gerado: "m" laranja + "marketplace") |
| Logo SIMINT ("Powerd by") | `2025/04/Sim-int-logo-scaled.png` | `IMG.poweredBy` (SVG gerado) |
| Avatar das pílulas dos cartões | `elementor/thumbs/milad-fakurian-58Z17lnVS4U-unsplash-1-1-…jpg` | `IMG.avatar` |
| Selo 🔥 do ranking | `2025/04/fire-logo.webp` | emoji (prop `badge` do `mkRank`) |

## Home

| Uso | Original | Chave |
| --- | --- | --- |
| Foto do hero | `2025/04/futuristic-technology-hologram_23-2151917439.jpg` | `IMG.hero` |
| Textura do hero (estrelas) | `2025/04/jeremy-perkins-uhjiu8FjnsQ-unsplash.png` | `IMG.stars` |
| Linhas decorativas do hero | `2025/04/element-1.png`, `2025/04/element.png` | `IMG.decorA`, `IMG.decorB` (SVG gerado) |
| TOP Produtos | `2025/04/GATILHOS-MENTAIS-900x1600-1.jpg`, `2025/04/Selfies-6.png`, `2025/04/INSTA-FAN-FORTUNE-900x1600-1.jpg` | `IMG.top[0..2]` |
| Ranking (miniaturas) | `elementor/thumbs/*` (capas dos produtos) | capas dos produtos (`IMG.product.*`) |
| Categorias (8) | `2025/04/image_fx-_20_.webp`, `image_fx-_22_-1.webp`, `image_fx-_23_.webp`, `image_fx-_24_.webp`, `image_fx-_26_.webp`, `XAAH3RAa.jpg`, `image_fx-_29_.webp`, `image_fx-_30_.webp` | `IMG.category.*` |
| Capa do vídeo | `2025/04/Meet-Xchain.png` (+ fundo `bekky-bekks-B7s2vibr0UM-unsplash.jpg`) | `IMG.video` |
| Botão play | `2025/04/play.png` | CSS (círculo em gradiente + triângulo) |
| Hover do cartão (sobreposição) | `2025/04/futurism-perspective-digital-nomads-lifestyle_23-2151252473.jpg` | não usado (efeito escondido no original) |

## Parceiros (home e `/blogs/`)

| Blog | Original | Chave |
| --- | --- | --- |
| Seguidores em Alta | `2025/04/Flux_Dev_A_realistic_vertical_photograph_of_a_young_social_med_1.webp` | `IMG.partner.seguidores` |
| Marketing Raiz | `2025/04/marketingraizblog.webp` | `IMG.partner.marketingRaiz` |
| 007SpyHacker | `2025/04/a4fa5617-4f18-4a20-99b9-bcef7b36a36b.webp` | `IMG.partner.spy` |
| Renovada | `2025/04/renovadablog.png` | `IMG.partner.renovada` |
| Zyrion Brazil | `2025/05/Logo-Zyrion.jpg` | `IMG.partner.zyrion` |
| Central do Marketing | `2025/04/image_fx-32.webp` | `IMG.partner.central` |

## Banners de título e 404

| Uso | Original | Chave |
| --- | --- | --- |
| Foto da esquerda | `2025/04/milad-fakurian-PjG_SXDkpwQ-unsplash.jpg` | `IMG.bannerLeft` |
| Foto da direita | `2025/04/simon-lee-2XngRU_RNqo-unsplash.jpg` | `IMG.bannerRight` |
| Fundo do 404 | `2025/04/bg_404.jpg` | `IMG.errorBg` |
| Ilustração "404" | `2025/04/illustration-768x767.png` | `IMG.errorArt` (SVG gerado) |

## Capas dos produtos (16)

| Produto | Original | Chave |
| --- | --- | --- |
| BotZappy | `2026/06/BotZap.png` | `IMG.product.botzappy` |
| Empresa de Serviços – Marketing e Tecnologia | `2026/08/Simint.png` | `IMG.product["sim-intermediacoes"]` |
| Seo Pack | `2025/04/SEO-PACK-900x1600-1.jpg` | `IMG.product["seo-pack"]` |
| PagaTG | `2026/08/Paga-TG.png` | `IMG.product.pagatg` |
| ViralPack | `2026/08/ViralPack.png` | `IMG.product.viralpack` |
| AtlasHosting | `2026/08/AtlasHosting-1.png` | `IMG.product.atlashosting` |
| Controle Patrimonial | `2025/04/Controle-Patrimonial-2.png` | `IMG.product["controle-patrimonial"]` |
| Controle de Motoristas | `2026/08/Controle-Pratonial.png` | `IMG.product["controle-de-motoristas"]` |
| ÁreaFlix – Área de Membros | `2025/04/AreaFlix.png` | `IMG.product["areaflix-area-de-membros"]` |
| O outro lado da internet | `2026/08/O-outro-lado-da-internet-1.png` | `IMG.product["o-outro-lado-da-internet"]` |
| Habilidades de Comunicação | `2025/04/Habilidades-de-Comunicacao.png` | `IMG.product["ebook-habilidades-de-comunicacao"]` |
| 757 Presets | `2026/08/757-Presets-1.png` | `IMG.product["757-presets"]` |
| Insta Fan Fortune | `2025/04/Insta-Fan-Fortune.png` | `IMG.product["insta-fan-fortune"]` |
| VSL Milionário | `2026/08/VSL-Milionario.png` | `IMG.product["e-book-vsl-milionario"]` |
| Gatilhos Mentais | `2025/04/GATILHOS-MENTAIS-v2-.png` | `IMG.product["ebook-gatilhos-mentais"]` |
| Academia do Corte | `2025/04/Academia-do-Corte.png` | `IMG.product["academia-do-corte"]` |
