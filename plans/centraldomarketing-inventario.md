# Central do Marketing → Criador de Sites: inventário (Etapa 1)

Fonte: https://centraldomarketing.com/ (WordPress + Elementor/ElementsKit/Jupiter X Kit), levantado em
2026-11-06 pela REST API (`/wp-json/wp/v2/{pages,posts,categories,media,tags}`), `wp_navigation`, sitemaps
(`wp-sitemap.xml`: 44 posts, 6 páginas, 17 categorias) e pelo DOM renderizado (Playwright, Chromium) em
1440 / 820 / 390 px. `/wp-json/wp/v2/menus` exige login (401): o menu foi lido do DOM.

Os screenshots ficaram fora do repositório (pasta temporária da sessão): 10 rotas × 3 viewports.

## 1. O que existe no site

| Tipo | Rota | Template WP | Observação |
| --- | --- | --- | --- |
| Página | `/` (home, id 92) | header+footer | landing de 14 seções, ver §3 |
| Página | `/blogs/` | header+footer | busca + categoria + 5 "sites parceiros" |
| Página | `/categorias/` | header+footer | 14 cards com imagem (4 por linha) |
| Página | `/links/` | `elementor_canvas` (sem header/footer) | widget "link na bio" |
| Página | `/termos-de-uso/`, `/politica-de-privacidade/` | header+footer | texto corrido |
| Post | `/<slug>/` (44) | single | banner + imagem + conteúdo + sidebar + compartilhar + anterior/próximo + relacionados |
| Categoria | `/category/<slug>/` (17) | archive | busca + select + título + "Voltar" + grade de cards |
| Busca | `/?s=` | search | mesmo layout do archive ("Resultado da Pesquisa:") |
| 404 | qualquer rota inexistente | 404 | "404 / Página não encontrada / Página Inicial" |
| Global | header, footer, botão flutuante WhatsApp | | ver §2 |

Categorias (17, `count`): Monetização & Vendas 9, Inbound Marketing 6, Copy 4, Neuromarketing 4, Gestão de Tráfego 3,
Redes Sociais 3, Branding 2, Design 2, Funil de Vendas 2, SEO 2, Sites 2, Afiliados 1, CRM 1, Edição de Vídeos 1,
E-mail Marketing 1, Produtividade 1, Sem categoria 1 (esta não vai para o template).

## 2. Global (header, footer, tema)

**Cores** (variáveis do Jupiter X Kit): fundo `#121212`, texto `#DAFAE4`, título `#FCFCFC`, destaque `#11E44F`, meta `#AAAAAA`,
borda de cartão `#313131` / `rgba(0,255,32,.16)`. **Fontes:** títulos *Red Hat Text* 700; corpo e botões *Content* 400/700
(ambas no Google Fonts). Corpo 16px/22.4px; h1 do hero 76px/91.2px `capitalize`; h2 de seção 40px/48px; eyebrow 15px 700 verde.
**Botão:** pílula (`border-radius:25px`), 17×32px, 14px/700, `letter-spacing:1px`, `capitalize`, verde com texto `#121212`, `transition .31s`.
**Breakpoints reais (Elementor):** celular ≤ 767, tablet ≤ 1024, desktop > 1024. Contêiner 1366px + 16px de borda (largura total 1440).

| Elemento | Desktop | ≤ 1024 (tablet e celular) |
| --- | --- | --- |
| Header (132px) | logo 273×68 à esquerda, menu "Categorias / Blogs" (16px, branco, 15px de espaçamento lateral) e botão "Marketplace" à direita | logo + hambúrguer verde (3 linhas) à direita; botão "Marketplace" some |
| Menu mobile | — | gaveta à esquerda, 350px, fundo `#121212`, overlay `rgba(51,51,51,.5)`, botão "X" verde (quadrado arredondado) no canto; itens 16px brancos |
| Footer | logo (446×84) + círculos verdes de redes (7) / "Menu" / "Políticas e Termos" / "Contato" (e-mail + link de apoio) / linha + "© Todos os direitos reservados." | colunas empilhadas |
| WhatsApp | botão verde "Entre nas nossas comunidades" fixo, canto inferior direito | igual (menor) |

Hover: botões escurecem/transição 0,31s; cartões de produto e de post têm `transition .3–.4s` (sombra/borda), sem `elementor-animation-*`.

## 3. Home — seções na ordem

| # | Seção (altura 1440) | Conteúdo | Bloco que cobre | Efeito de entrada |
| --- | --- | --- | --- | --- |
| 1 | Header | logo, menu, botão | `header` + variante `central` | — |
| 2 | Hero (870) | H1 "Aprenda O Que Realmente Funciona No **Marketing Digital**" (palavra verde), 4 avatares + "+10M / Pessoas impactadas", parágrafo, painel com foto de fundo, 7 chips de categoria (links), botão branco "Ver Todos Os Posts", botão de vídeo (círculo play, abre lightbox Vimeo), 2 ícones sociais verdes e 3 frases "Resultados Comprovados ->" | **FALTA** → `ctHero` | h1 `fadeInUp`; avatares `fadeIn` com atraso 0/100/200/300; painel `fadeIn` |
| 3 | Carrossel de logos (82) | 10 logos (5 visíveis ≥1024, 4 em 767–1023, 2 abaixo), loop, autoplay 500ms, transição 1000ms, **sem setas/bolinhas** | **FALTA** → `logoMarquee` | — |
| 4 | "Mais pesquisados" (857) | eyebrow, h2, 2 parágrafos, botão, foto grande com selo "Crescimento rápido" (ícone), 3 cartões de frase | **FALTA** → `ctSplit` + `featureGrid` (estilo `simple`) | h2 `fadeInUp`; foto `fadeInRight`; selo `zoomIn`; cartões `fadeInUp` 0/100/200 |
| 5 | "Categorias" (1363) | eyebrow, h2 "Qual nicho você quer saber mais?", grade 3×3 de cartões com ícone verde circular, título, texto, "Ver Mais"; cartões alternados têm textura verde de fundo; botão "Ver Todas As Categorias" | `heading` (+`eyebrow`) + **FALTA** → `featureGrid` (estilo `icon`) + `button` | cartões `fadeIn` 0–400ms |
| 6 | "Videos recomendados" (990) | h2 + grade 3×3 de 9 vídeos do YouTube com borda verde + botão "Ver Mais Videos" | `videoGrid` (+ estilo da variante) + `button` | grade `fadeIn` |
| 7 | "Central do Marketing" (635) | eyebrow, h2, 3 colunas numeradas 01/02/03 com linha divisória e cartão com ícone + título | `heading` + **FALTA** → `featureGrid` (estilo `numbered`) | cartões `fadeInUp` 0/100/200 |
| 8 | "Em destaque" (1039) | imagem vertical + selo "4.9 ★★★★★ Fonte Confiável de Informações"; eyebrow, h2, citação, 4 itens com ícone verde e divisor, botão | **FALTA** → `ctSplit` (variante `spotlight`) | imagem `fadeInLeft`; selo `fadeInUp`; itens `fadeInRight` 0/100/200/300 |
| 9 | Banner CTA (423) | foto azul de fundo, cartão de vidro (blur) com h2, texto e botão branco | **FALTA** → `ctBanner` (modo `cta`) | `zoomIn` |
| 10 | "Produtos" (1666) | eyebrow, h2, 6 cartões (foto de fundo, tag verde, kicker, título, texto, botão "Ver Agora") + botão "Ver Mais Produtos" | **FALTA** → `featureGrid` (estilo `product`) | cartões `fadeIn` 0–500ms |
| 11 | "Curiosidades" (1061) | coluna esquerda: eyebrow, h2, texto, botão, imagem com selo "98% Aprovação dos Visitantes"; coluna direita: 3 depoimentos empilhados com avatar, nome, cargo, aspas | **FALTA** → `ctSplit` (variante `story`, com `quotes`) | h2 `fadeInUp`; imagem `fadeInLeft`; selo `zoomIn`; depoimentos `fadeInRight` 0/100/200 |
| 12 | "Blog" (2259) | eyebrow, h2 "Todos os Conteúdos", busca + select de categoria, grade 3×3 de posts (foto, título, pasta + categoria verde, resumo) | `heading` + `categorySearch` + `postList` (novo `cardStyle: "grid"`) | h2 `fadeInUp` |
| 13 | Footer (379) | ver §2 | **FALTA** → `ctFooter` | — |

Nada de contador (`+10M`, `98%`, `4.9` são texto fixo), parallax ou carrossel além do de logos. Efeitos usados: `fadeIn`,
`fadeInUp`, `fadeInLeft`, `fadeInRight`, `zoomIn`, com atraso 0–500ms: **já suportados por `Block.fx`** (sem alterar `model/fx.ts`).

## 4. Demais páginas

| Página | Seções | Cobertura |
| --- | --- | --- |
| `/blogs/` | banner (foto verde + cartão de vidro com h1 "Blogs", `fadeInUp`), busca + select, 5 cards (foto + nome, borda verde; 3 + 2 centralizados) | **FALTA** `ctBanner` (modo `title`); `categorySearch`; `linkCards` |
| `/categorias/` | banner h1, h2 "O que você procura?", 14 cards (foto quadrada 325px + nome em faixa) 4 por linha (2 no tablet, 1 no celular), `fadeIn` 0–300ms | `ctBanner`; `heading`; `categoryGrid` (com `images`) + CSS da variante |
| `/links/` | página sem header/footer: logo quadrada, nome, frase, 3 ícones sociais, 3 botões verdes largos | `image` + `heading` + `socialIcons` + `button` (`wide`) — páginas `bare` |
| `/termos-de-uso/`, `/politica-de-privacidade/` | banner h1 + texto corrido (largura 1140) com títulos numerados | `ctBanner`; `heading`/`text`; página `prose` |
| Post | banner h1 (fundo verde, `fadeInUp`), coluna 880px: imagem de capa 840×597, categoria em caixa alta espaçada, título, data; conteúdo; sidebar sticky (busca, select, banner 300px); "Compartilhar este Post:" + ícones; anterior/próximo; "Mais Conteúdos Como Esse:" + 6 cards | `postHeader` (+ `backgroundImage`) + `twoColumns` + `postContent` + `sidebarBanner` + `postShare` + `postNav` + `postList` (`cardStyle: excerpt`) |
| Categoria / Busca | `categorySearch`, título (fundo com marca d'água verde), "Voltar", grade 3 colunas de cartões (foto, etiqueta verde sobre a foto, título verde, resumo cinza, "LEIA MAIS »") | `categorySearch` + `categoryHeader` + `postList` (novo `cardStyle: "archive"`) |
| 404 | "404" gigante verde, "Página não encontrada", texto, botão "Página Inicial", fundo cheio | `heading` (h1) + `heading` + `text` + `button` |

Posts: 44, cada um com ~6 imagens e 10–12 mil px de altura; títulos h2/h3/h4, parágrafos com negrito/itálico/links, listas.

## 5. Decisão sobre blocos novos (regra dos 90%)

Os blocos existentes cobrem as páginas internas (post, categoria, busca, categorias, blogs, links, legais, 404) com ajuste de CSS
(variante). A **home** não é coberta: nenhuma combinação de `hero`, `splitSection`, `stats`, `cardGrid`, `testimonials`, `featuredPost`
ou `categoryGrid` chega perto de 90% (faltam chips sobre foto, selos, lista com ícones, cartões numerados, depoimentos ao lado do texto,
marquee de logos, rodapé com colunas livres). Por isso:

| Bloco novo | Cobre | Props editáveis (resumo) |
| --- | --- | --- |
| `ctHero` | seção 2 | título + palavra destacada, avatares, número/legenda, texto, foto do painel, chips (rótulo + link), botão, vídeo, redes, 3 frases |
| `logoMarquee` | seção 3 | logos (imagem + alt + link), por tela (desktop/tablet/celular), velocidade; CSS puro, parado no editor |
| `ctSplit` | seções 4, 8, 11 | eyebrow, título, texto, botão, imagem, lado, selo (ícone/valor/estrelas/legenda), lista com ícone, citação, depoimentos laterais |
| `featureGrid` | seções 4 (frases), 5, 7, 10 | estilo (`simple`/`icon`/`numbered`/`product`), colunas, itens (ícone, imagem de fundo, tag, kicker, título, texto, rótulo do link, link) |
| `ctBanner` | seção 9 e banners de título | imagem de fundo, título, texto, botão, modo (`title`/`cta`) |
| `ctFooter` | seção 13 | logo, redes, colunas livres (título + links), contato, copyright |

Extensões de blocos existentes (campos opcionais, defaults que não mudam nenhum site atual): `heading.eyebrow`,
`postHeader.backgroundImage`, `postList.cardStyle` (`grid` e `archive`), `SITE_FONTS` (+ *Red Hat Text*, *Content*).
Variante de tema: `central` (CSS em `renderer/central.ts`, escopo `.sb-ct`).

## 6. Diferenças aceitas desde já

- Botão de vídeo do hero: no original abre lightbox Vimeo; no template é um link para a URL de vídeo configurada (nova aba).
- Carrossel de logos: Swiper com loop e `autoplay.delay=500` / `speed=1000` no original; no template é um marquee CSS contínuo (mesmas
  quantidades por tela, sem JS, funciona no HTML estático).
- Textura verde dos cartões e foto do painel do hero: placeholders (Unsplash) — as originais não foram baixadas.
- Depoimentos: nomes e cargos trocados por dados genéricos (o original usa pessoas reais).
- Contato do rodapé: e-mail e link "AJUDE" do original **não** foram copiados (são de terceiros); entram `contato@seudominio.com` e um link vazio.
