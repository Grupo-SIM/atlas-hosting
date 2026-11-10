# Prompt para o Claude Code — template "Seguidores em Alta" no Criador de Sites

> Cole tudo abaixo num chat novo do Claude Code aberto na raiz do repositório (ou diga "siga `plans/seguidoresemalta-prompt.md`").
> As medidas foram tiradas do HTML e dos CSS do Elementor de https://seguidoresemalta.com (WordPress 7 + Hello Elementor +
> Elementor 4.3 / Elementor Pro + ElementsKit Lite + The Post Grid + Sticky Header Effects + Header Footer Elementor) em
> 2026-11-10. O que estiver marcado **[medir]** precisa ser conferido no site renderizado.

---

## 0. Como trabalhar e regras do repositório

- Trabalho grande: comece em **modo de planejamento**. Leia os arquivos abaixo, faça o inventário (item 5) e me apresente o
  plano (blocos novos, extensões de blocos/runtimes existentes, arquivos) antes de escrever código.
- O `CLAUDE.md` da raiz já vem no contexto; siga-o à risca — principalmente **nada contra o banco** (este template não precisa
  de migration).
- Para medir o site renderizado use Playwright/Chromium numa pasta temporária fora do repositório (sem adicionar dependência
  ao projeto). Se o navegador headless não rodar, siga com o HTML/CSS do Elementor e me diga o que ficou sem conferir.
- Subagentes podem fazer a pesquisa em paralelo; implementação e decisões de arquitetura ficam na conversa principal.
- Vá em etapas, verificando cada uma (`bun test`, `tsc`): variante + cabeçalho/rodapé → home → páginas de listagem
  (conteúdo/categorias/blogs) → arquivo/busca/post/404 → links/legais → editor, IA e docs.
- Não faça commit nem push sem eu pedir.

Você vai criar um **template novo** no Criador de Sites do Atlas migrando **todas as páginas, o layout, as animações, os
hovers, o cabeçalho que some/aparece, as animações Lottie, os contadores e o carrossel de depoimentos** de
**https://seguidoresemalta.com**. O resultado tem que ser **editável no editor** (props por bloco com `fields`, posts e
categorias vindos do JSON do site), nunca HTML colado.

Leitura obrigatória antes de qualquer arquivo:

1. `docs/development/site-builder.md` inteiro. Em especial: variantes (`theme.variant`, CSS escopado, breakpoints 1024/767
   repetidos sob `.sb-narrow`), `Block.fx` (entradas `fadeIn*`, atraso, hovers `grow`/`lift`…, `each`/`stagger`), contador
   `data-sb-count`, carrossel `data-sb-slider`/`.sb-cslider`, popup e runtimes (`fx-runtime.ts`, `nav-runtime.ts`, subir
   `FX_VERSION`/`__sbNav` ao mudar), `--sb-sticky-top`, `safeUrl` em todo `href` de props, `cssUrl` sem `;`, `bare`/`prose`
   em páginas, `categorySearch`.
2. `docs/development/project-scaffolding.md` se mexer em exports/workspaces.
3. Templates de referência (mesmo padrão de arquivos e testes):
   - `templates/marketplace/` + `renderer/marketplace.ts` + `blocks/marketplace.tsx` — **é do mesmo grupo (SIM / Central do
     Marketing) e o mais parecido**: conteúdo original, `brand.ts`, `images.ts`, `legal.ts`, `posts.ts`, teste;
   - `templates/central-marketing/` (Elementor, banners de título, `categorySearch`, cards);
   - `templates/areaflix/` e `templates/controle-patrimonial/` (migrações enxutas do mesmo grupo, imagens ainda no WordPress
     original, contador e carrossel no fx-runtime).
4. Faça primeiro o **inventário** em `plans/seguidoresemalta-inventario.md` (formato de `plans/marketplace-inventario.md`):
   rotas, o que é dinâmico, global, cada seção com medidas e efeitos. Use este prompt como base e complete os **[medir]**
   no navegador em **1440 / 820 / 390 px**, com o menu mobile aberto e rolando a página (cabeçalho escondendo/voltando).
   Fontes: `/wp-json/wp/v2/{pages,posts,categories,tags,media}`, `sitemap.xml`, e os CSS do Elementor em
   `/wp-content/uploads/elementor/css/post-<id>.css` — kit **7**, cabeçalho **441**, rodapé **62**, home **12**, post **409**,
   arquivo **424**, busca **434**, categorias **444**, blogs **446**, todos os posts **620**, links **837**, termos **804**,
   privacidade **797**.

### Nomes

- Template id **`seguidores-em-alta`**, nome **"Seguidores em Alta"**, tags `["Blog", "Marketing", "Redes sociais"]`.
- Variante **`theme.variant = "seguidores"`**, CSS em `renderer/seguidores.ts`, escopo **`.sb-sg`**, registrada em
  `SiteRenderer.tsx` como as outras (`isSeguidores`/`seguidoresVars`/`seguidoresCss`).
- Blocos próprios em `blocks/seguidores.tsx`, prefixo **`sg`**, exportados como `seguidoresBlocks` e incluídos em
  `blockDefinitions`.
- Arquivos: `templates/seguidores-em-alta/{index.ts, brand.ts, images.ts, posts.ts, legal.ts, seguidores-em-alta.test.ts}`.

### Conteúdo

O site é da **SIM Intermediações** (mesmo grupo do Atlas, como o marketplace e o areaflix), então **use o conteúdo original**:
textos, os **10 posts** (título, resumo, corpo, capa, categoria, data — da API do WordPress), as 8 categorias, os produtos,
depoimentos, links e contatos. Marca, cores, contatos, redes e links externos centralizados em `brand.ts`; textos legais
originais parametrizados pela marca em `legal.ts`. **Imagens**: por enquanto podem apontar para o WordPress original (como
`areaflix`), todas centralizadas em `images.ts`, e listadas em `plans/seguidoresemalta-imagens.md` como pendência para
copiar ao storage. A tag `melhores-posts` do WP vira uma escolha explícita de posts no bloco (lista de slugs).

---

## 1. Rotas

| Original | Template | Notas |
| --- | --- | --- |
| `/` (Página Principal, 12) | home | §4 |
| `/todos-os-posts/` ("Conteúdo", 620) | página `/todos-os-posts/` | §5.2 |
| `/categorias/` (444) | página `/categorias/` | §5.3 |
| `/blogs/` (446) | página `/blogs/` | §5.4 |
| `/category/<slug>/` (archive 424) | `categoryLayout` | §6 |
| `/?s=` (search 434) | página `/pesquisa/` com o filtro `?q=` do export | §7 |
| `/<slug-do-post>/` (single 409) | `postLayout` | §8 |
| 404 (sem template Elementor — tela padrão do tema) | página `404` | §9 |
| `/links/` (Elementor Canvas, 837) | página `/links/` com `bare: true` | §10 |
| `/termos-de-uso/`, `/politica-de-privacidade/` | páginas legais (`prose`) | §11 |

Menu (ordem): **Conteúdo** (`/todos-os-posts/`), **Categorias**, **Blogs**, e externos **Marketing Raiz**, **Central do
Marketing**, **Renovada**, **007SpyHacker**, **Zyrion Brazil**, **Marketplace** (abrem em nova aba; URLs em `brand.ts`) [medir
destino de cada um e se abre em nova aba].

---

## 2. Global (kit 7)

### Cores (tokens da variante)

| Token | Valor | Uso |
| --- | --- | --- |
| primary | `#000000` | títulos, botões (fundo), textos fortes |
| secondary | `#6F4CCE` | roxo da marca: hover de botões e links, títulos dos contadores, cards "Melhores Posts", CTA do rodapé |
| text | `#7A7A7A` | corpo |
| accent | `#EBFE00` | **marca-texto** amarelo-limão atrás das palavras destacadas nos títulos; botão "Ler mais" dos melhores posts |
| `8742e24` | `#F7F4FF` | fundo lilás claro das seções alternadas e inputs |
| extras | `#6617FF` (item de menu ativo), `#2C495F` (resumo dos cards de post), `#8261DB` (hover do "Ler mais" na listagem), `#2962FF` (borda dos cards de categoria no hover), `#BDBDBD` (links do rodapé), `#EFEFEF`, `#FFFFFF2E` (linha do rodapé), `#1C244B` | |

### Fontes

**Manrope** (principal), **Nunito** (cards de post e banners de título), **Roboto** (menu, "O que você procura?"),
**Poppins** (página do post), **DM Sans** (estilo `fbcd85a`). Adicione as que faltarem em `SITE_FONTS`/`FONT_WEIGHTS` só com os
pesos que existem no Google Fonts (pedir peso inexistente derruba o CSS).

| Estilo kit | Desktop | Tablet | Celular | Uso |
| --- | --- | --- | --- | --- |
| `0ff0900` (h1) | 75 / 700 | 65 | 53 | |
| primary (h2) | 58 / 700 | 50 | 45 | títulos de seção |
| `04aefa7` | 58 / 700 | [medir] | [medir] | palavra destacada nos títulos |
| `07c10d9` | 58 / 700 | [medir] | [medir] | números dos contadores |
| secondary (h3) | 30 / 700 | 26 | 24 | |
| `5ea6a7b` (h4) | 25 / 700 | | | títulos das colunas do rodapé |
| `690bdf3` (h5) | 20 / 700 | | | |
| `c3036bd` (h6) | 17 / 700 | | | |
| accent | 15 / 600 | 15 | 14 | botões, títulos dos contadores |
| text | 14 / 500 | | | corpo |

Line-heights e letter-spacings de cada estilo: **[medir]** no `post-7.css` (não estão neste prompt).

### Componentes globais

- **Botão** (kit): pílula `border-radius:30px`, padding `15px 30px`, fundo `#000`, texto branco Manrope 15/600, sem borda;
  **hover: fundo `#6F4CCE`** (transição padrão do Elementor ~.3s). Variante branca (cards de produto): fundo `#FFF`, texto
  preto, hover roxo com texto branco.
- **Links**: `#6F4CCE`, hover `#000`. **Inputs**: fundo `#F7F4FF`, borda 1px `#F7F4FF`, raio 30px; focus borda `#6F4CCE`.
- **Título com marca-texto** (widget ElementsKit Heading, usado em TODAS as seções): título em Manrope 58/700/1.3 preto
  (branco em fundo escuro/roxo), com **uma ou mais palavras dentro de `<span>` com fundo `#EBFE00` e texto preto** —
  ex.: "Últimas **Novidades**", "Posts mais **pesquisados**", "Seu crescimento no digital **começa aqui**", "Siga-nos nas
  **Redes Sociais**", "Melhores **Posts**", "Faça parte das nossas **comunidades**", "O que **dizem** sobre nós", "Blogs
  **Recomendados**", "Cresça **todos os dias**", "Cresça nas Redes Sociais com **Estratégias** que **funcionam**" [medir quais
  palavras levam o span em cada título]. Margem superior negativa −15px (−10 tablet). Crie isso como **um bloco genérico
  `sgHeading`** (ou estenda `heading` com uma sintaxe de destaque, ex.: `[[palavra]]`), com cor do texto, cor do destaque e
  alinhamento como props — e reutilize em todo o template.
- **Contêiner**: largura de conteúdo **1200px**; seções com padding 100px 0 (tablet 70px 30px; celular 70px 20px).
- **Breakpoints**: tablet ≤ 1024, celular ≤ 767 (repetir sob `.sb-narrow`).

### Animações (Block.fx + fx-runtime; nada de jQuery/Elementor/ElementsKit no HTML publicado)

- Entradas por IntersectionObserver, uma vez: **`fadeInUp`** em quase tudo (títulos, textos com atraso 200ms, botões com
  atraso 400ms, cards de produto com atraso 600ms), **`fadeIn`** (imagens/logos com atrasos 0/200/400/600ms, cards de
  categoria com atrasos 0/100/200/300…), **`fadeInLeft`** (grade de "Posts mais pesquisados", atraso 400ms). Duração padrão
  do Elementor **1.25s**; keyframes do Elementor (`fadeInUp` parte de `translate3d(0,100%,0)`, `fadeInLeft` de
  `translate3d(-100%,0,0)`). Se faltar `fadeInLeft` no `Fx`, adicione (validado, com teste em `model/fx.test.ts`).
- Hovers do Elementor: **`elementor-animation-grow`** (`scale(1.1)` em .3s) nos 4 logos de redes sociais; **`float`**
  (`translateY(-8px)` em .3s) no mockup de celular da seção Comunidades [medir o 2º elemento com `float`]. Use os hovers do
  `Fx` (`grow`, `lift`) ajustando intensidade/duração se preciso, sem mudar sites existentes.
- Respeite `prefers-reduced-motion` como o fx-runtime já faz; no editor tudo fica parado e visível.

---

## 3. Cabeçalho (441) — bloco **`sgHeader`** em `site.header`

Plugin *Sticky Header Effects* com estas opções: **transparente e sobreposto ao conteúdo** (`position:absolute`, fundo
transparente) em todas as telas; **depois de 60px de rolagem ganha fundo `#FFFFFF`**; **"hide on scroll": some ao rolar para
baixo (depois de 60px) e reaparece ao rolar para cima** (deslizando, [medir] duração/curva e se tem sombra). Implemente com
um script mínimo no `NAV_RUNTIME` que alterna classes na raiz do cabeçalho (`is-scrolled`, `is-hidden`) e CSS com
`transform: translateY(-100%)` + transição; sem JS fica transparente e parado. Use `--sb-sticky-top` para o editor e, como o
`margem` faz, considere quando o site rola dentro de um contêiner (prévia) [ver `margem-runtime.ts`].

- Contêiner flex `space-between`, `align-items:stretch`, gap 10px, largura de conteúdo 1200px, padding 10px 0 15px (tablet
  18px 30px 19px; celular 12px 20px).
- **Logo** (Site Logo) numa coluna de 20% (tablet 30%; celular 65%), margin-top 10px, centralizada, com **entrada `fadeIn`
  atraso 200ms**.
- **Menu** à direita (`align-self:flex-end`): Roboto 16/600, preto, sem ponteiro; hover/focus `#6F4CCE`; **ativo `#6617FF`**
  (marque `aria-current` via `RenderContext.path`).
- **≤ 1024px**: hambúrguer 28px preto (sem borda) que abre **dropdown esticado** (largura total) branco, itens Roboto 15/600
  centralizados, padding 12px 0, hover texto roxo com fundo branco. Funciona sem JS (checkbox, como `#sb-burger`).
- Como o cabeçalho é absoluto, as páginas internas começam com **margin-top 150px** (banners e post) — reproduza.

---

## 4. Home (12) — seções na ordem

Todo bloco que lista posts lê de `site.posts` (publicados, mais novos primeiro), com props de categoria, quantidade, offset,
ordenação e "escolher posts" (lista de slugs) — o usuário cria posts e as grades se atualizam.

### 4.1 Hero (bloco **`sgHero`**)

Seção fundo `#F7F4FF` com **overlay de imagem** (`overlay_13.png`, `bottom right`, `cover`, opacidade 1) — editável;
largura 1200px; padding **150px 0 150px** (tablet 100px 30px 0; celular 100px 20px 0).

- **Coluna esquerda 60%** (tablet/celular 100%, padding-bottom 70px no tablet), conteúdo alinhado embaixo:
  1. Título com marca-texto "Cresça nas Redes Sociais com **Estratégias** que **funcionam**" — Manrope **60px**/700/1.3
     (tablet 50; celular 37), margin-top −20px, **`fadeInUp`**.
  2. Texto "Conheça as técnicas por trás dos perfis que viralizam todos os dias." Manrope 18/500/1.8, margem direita 200px
     (tablet: largura 701px, centralizado, 14px; celular 321px), **`fadeInUp` atraso 200ms**.
  3. Botão pílula "Ver todos os posts" → `/todos-os-posts/`, margem direita 30px, **`fadeInUp` atraso 400ms**
     (tablet centralizado; celular largura 316px).
- **Coluna direita 40%** — **composição em camadas** (o efeito principal do hero):
  - **Lottie 1** (`https://assets7.lottiefiles.com/packages/lf20_vlqmej6n.json`) por cima, `z-index:10`, margens
    **−80px 0 −100px** (tablet −109/0/−120; celular −85px −40px 0), **`fadeInUp` atraso 400ms**;
  - **Foto** (`9964487-1024x1024.jpg`) largura 100% (tablet 80%), **raio 48px**, `z-index:5`, margens −10px 0 −105px
    (tablet −1/−168; celular −70/−90), **`fadeIn` atraso 200ms**;
  - **Lottie 2** (`/wp-content/uploads/2025/11/Social-Bubble.json`) `z-index:10`, margens **−170px −50px −65px 240px**
    (tablet −100 70 −20 400; celular −90 0 −40 150), **`fadeInUp` atraso 600ms**.
  - No tablet a coluna tem margens 0 160px 160px 120px [medir].
  [medir: loop/autoplay/velocidade/renderer das Lotties (widget ElementsKit Lottie) e se tocam ao entrar na tela ou no hover.]

**Lottie** não existe no builder: crie um **bloco/elemento genérico `lottie`** (URL do JSON, loop, autoplay, velocidade,
largura) que carrega o player só nas páginas que têm `[data-sb-lottie]` (ex.: `lottie_light` de um CDN fixado por versão,
injetado pelo fx-runtime; no editor e sem JS mostra um placeholder/primeiro quadro). Documente no guia. Liste os 2 JSON em
`plans/seguidoresemalta-imagens.md` para copiar ao storage (o JSON precisa de CORS).

### 4.2 Últimas Novidades

Contêiner 1200px, padding 100px 0 (tablet 70/30; celular 70/20), centralizado:
- Título "Últimas **Novidades**" 58px (tablet 50; celular 45), margem −15px, **`fadeInUp`**.
- Texto "As principais novidades do mercado digital reunidas para manter você sempre um passo à frente nas redes sociais."
  18/500/1.8 centralizado, margem inferior 30px, **`fadeInUp` 200ms**.
- **Grade de posts** (The Post Grid, *grid layout 1*): **3 colunas (tablet 2, celular 1)**, 6 posts mais recentes; cartão com
  raio 10px; **imagem com altura fixa 200px**, `object-fit:cover`, raio 10px, margem inferior 10px; título **Nunito 18/700
  line-height 120%** (tablet 22/26px), **hover do título `#6F4CCE`**; resumo Nunito 16/500 `#2C495F` (~30 palavras com "...");
  sem "Ler mais" nesta grade [medir]; hover da imagem do TPG [medir: `img_hover_animation_default` — provável zoom leve].
  Crie **um bloco `sgPostGrid`** configurável que cubra as 4 grades do site (layouts `card` / `side` / `dark` / `list`, colunas
  por tela, mostrar resumo/categoria/"Ler mais", estilo do botão, cor do cartão).
- Botão "Ver todos os posts" → `/todos-os-posts/`, **`fadeInUp` 400ms**.

### 4.3 Posts mais pesquisados

Seção fundo `#F7F4FF`, padding-top 30px (tablet 70/30; celular 70/20), linha:
- **Esquerda 55%** (tablet 100%), com **entrada `fadeInLeft` atraso 400ms** no contêiner: grade TPG *layout 4*,
  **2 colunas (tablet 2, celular 1)**, 4 posts (ganhar seguidores, modo silencioso, alcance dos stories, ganhar dinheiro —
  [medir critério; deixe como posts escolhidos]); título em **2 linhas no máximo** (`title-two-line`), imagem 200px raio 10;
  **"Ler mais" só texto** Nunito 16/500 `#6F4CCE`; margem inferior 50px.
- **Direita 45%** (padding-left 70px; tablet 100% com padding-bottom 70px, centralizado): título "Posts mais **pesquisados**"
  (`fadeInUp`), texto "Os temas mais procurados por criadores que desejam elevar sua presença online com estratégias
  comprovadas." (`fadeInUp` 200ms; tablet margens 70px), botão "Ver mais" → `/todos-os-posts/` (`fadeInUp` 400ms).

### 4.4 Contadores

Seção 1200px, padding 100px 0 (tablet 70/30; celular 70/20); **4 colunas (tablet 2×2, celular 1)**, colunas com padding 0
(50px abaixo nas que quebram). Cada uma: número Manrope **58/700** preto (estilo `07c10d9`) e título Manrope 15/600
**`#6F4CCE`** abaixo; **contagem de 0 até o valor em 2000ms ao entrar na tela**, separador de milhar ",":
- **+420%** — "Em média de aumento de alcance"
- **1,119+** — "Pessoas com resultados"
- **100%** — "Gratuito"
- **365** — "Posts todos os dias"
Use o `data-sb-count` do fx-runtime (estenda para prefixo, sufixo e separador se faltar). Posição do título (acima/abaixo do
número) [medir].

### 4.5 Produtos — "Seu crescimento no digital começa aqui" (bloco **`sgProducts`**)

Seção 1200px, padding 100px 0; duas colunas 50/50 (tablet 100%), formando um **mosaico desencontrado**:
- **Coluna esquerda** (padding-right 15px; conteúdo alinhado embaixo): título com marca-texto (margem direita 100px),
  texto "Aplique o que funciona de verdade respaldado pela credibilidade de marcas consolidadas no mercado." Manrope 19/500/1.8,
  botão **"Conheça nossos produtos"** → `https://marketplace.centraldomarketing.com/`; depois **card 1** (margin-top 70px,
  margin-bottom 30px) e **card 2**.
- **Coluna direita** (padding-left 15px; tablet padding-top 30px): **cards 3, 4 e 5** (30px entre eles).
- **Card de produto**: imagem de fundo `cover center`, **raio 30px**, véu `linear-gradient(180deg, transparent 40%, #000 100%)`
  com opacidade 0.8, **padding 300px 30px 35px** (celular 200px 30px 35px) — ou seja, alto com a foto e o botão embaixo;
  botão pílula **branco "Ver mais"** alinhado à direita embaixo (celular à esquerda), hover fundo roxo/texto branco;
  **entrada `fadeInUp` atraso 600ms** em cada card. Itens (imagem, link, rótulo do botão) editáveis como lista:
  1. Gatilhos Mentais (e-book) → `/ebook-gatilhos-mentais/` do marketplace
  2. O Outro Lado da Internet (Dark Web) → `/o-outro-lado-da-internet/`
  3. AreaFlix → `/areaflix-area-de-membros/`
  4. ViralPack → `/viralpack/` (botão com 95.81% de largura máx. no original — ignore, é ruído)
  5. Habilidades de Comunicação (e-book) → `/ebook-habilidades-de-comunicacao/`
  [medir se os cards têm título/texto além da imagem.]

### 4.6 Siga-nos nas Redes Sociais

Seção 1200px, padding 100px 0; **no celular a ordem inverte** (texto primeiro):
- **Coluna esquerda 50%** com fundo branco + **overlay `overlay_3.png` a 10%**, conteúdo centralizado: grade 2×2 de **logos
  das redes** (Kwai, Instagram, YouTube, TikTok — imagens 1024×1024), cada um link externo (`@segemalta` / `@seguidoresemalta`),
  larguras e alinhamentos desencontrados (50% à direita, 57% à esquerda, 46% centro, 52% à esquerda com margin-top −30px;
  colunas internas 60/40 com paddings 30px 100px 0 0 / 20px 0 0 0 / 0 0 0 30px — valores de tablet/celular no CSS),
  **hover `grow`** e **entradas `fadeIn` com atrasos 0 / 200 / 400 / 600ms**.
- **Coluna direita 50%** (padding-left 70px; tablet 30px; celular padding-bottom 70px, centralizado): título "Siga-nos nas
  **Redes Sociais**" (`fadeInUp`) e texto "Não perca nada! Acompanhe mais de perto nosso trabalho em todas as plataformas
  digitais." (`fadeInUp` 200ms).
- Bloco **`sgSocialCollage`** com a lista de logos/links editável.

### 4.7 Melhores Posts

Seção fundo `#F7F4FF`, padding 100px 0: título centralizado "Melhores **Posts**" (margens laterais 250px; tablet 80px; margem
inferior 50px/30px celular), grade TPG layout 1 **3 colunas (tablet 2, celular 1)** com 3 posts escolhidos (no original: tag
`melhores-posts` — apagar sugestões de pesquisa, vender no Instagram, bio no Instagram): **cartão roxo `#6F4CCE`** raio 10,
imagem 200px raio 10, título e resumo **`#F7F4FF`** (Nunito 18/700 e 16/500), botão **"Ler mais" pílula fundo `#EBFE00` texto
`#6F4CCE`** Nunito 16/500, padding 5px 40px, raio 30px; hover com borda `#7a64f2` [medir efeito completo]. Margem inferior 50px.

### 4.8 Faça parte das nossas comunidades

Seção 1200px, padding 100px 0, **ordem invertida no tablet e no celular**:
- **Esquerda 55%** com fundo `overlay_3.png` (`cover`): **mockup de iPhone** (`iphone_13_mockup_…png`) a 85% (tablet 55%
  centralizado; celular 100%), **entrada `fadeIn`** e **hover `float`**.
- **Direita 45%** (padding-left 70px; tablet padding-bottom 70px, centralizado): título "Faça parte das nossas
  **comunidades**", texto "Entre e conecte-se com pessoas que compartilham os mesmos interesses…" (tablet margens 70px),
  botão "Ver mais" → `https://lp.centraldomarketing.com/comunidades-no-whatsapp/`; entradas `fadeInUp` 0/200/400ms.

### 4.9 Depoimentos — "O que **dizem** sobre nós" (bloco **`sgReviews`**)

Seção com **foto de fundo** (`male-streamer-recording-in-studio…jpg`, `cover center`) e **véu `#6F4CCE` a 50%**, com
**`background-attachment: fixed` no desktop (≥1025px) — parallax**; padding 100px 0 (tablet 70/30; celular 70/20).
Título branco centralizado (marca-texto com texto preto). **Carrossel de reviews** (widget Elementor Pro Reviews):
**autoplay 5000ms, velocidade 500ms, loop, pausa no hover, setas (20px) e bolinhas**, separador entre cabeçalho e texto,
cada slide com **avatar**, nome, **estrelas** e texto:
- Daniel Santos — "Site incrível! Simples, direto e cheio de estratégias que realmente funcionam."
- Yasmin — "Finalmente um site com conteúdo sincero e eficiente sobre marketing digital. Adorei!"
- Elissandra Gama — "Marketing raiz de verdade! Sem enrolação e com dicas aplicáveis na prática."
- João Gabriel — "Ótimo material! Fácil de entender e com estratégias que realmente geram resultados."
[medir: slides por tela em cada largura, espaço entre slides, cores do cartão/estrelas/setas/bolinhas, nota de cada um.]
Implemente sobre `.sb-cslider` + fx-runtime (setas, autoplay, pausa, bolinhas — veja o `afTestimonials` do areaflix).

### 4.10 Blogs Recomendados (bloco **`sgBlogCards`**, reutilizado na página `/blogs/`)

Contêiner 1200px, padding 100px 0 (tablet 70/40; celular 70/50), título "Blogs **Recomendados**" (margem inferior 50px).
**5 cartões em duas linhas**: 3 na primeira, 2 na segunda (linha com 67% de largura, centralizada). Cartão: **borda
`#6F4CCE`** (sólida; [medir] espessura), **raio 27px**, imagem do blog com raio 10px, nome em 30px preto centralizado,
espaçador 10px; o cartão inteiro leva ao blog (externo): Marketing Raiz (`marketingraiz.com`), Central do Marketing
(`centraldomarketing.com`), Renovada (`renovada12.com.br/blog/`), 007SpyHacker (`007spyhacker.com`), Zyrion Brazil
(`zyrionbrazil.com`). [medir hover do cartão e responsivo.]

### 4.11 Rodapé (62) — bloco **`sgFooter`** em `site.footer`

1. **Caixa CTA sobreposta**: contêiner 1200px `z-index:5` (tablet padding 0 30px; celular 0 20px); caixa **fundo `#6F4CCE`**
   com overlay `overlay_13.png` a 10% (`bottom right`, `cover`), padding 60px (tablet 50; celular 50px 30px),
   **`margin-bottom:-160px`** (encavala na seção preta), **entrada `fadeInUp`**: título branco "Cresça **todos os dias**"
   (marca-texto com texto preto), texto "Conteúdos gratuitos para explodir seu engajamento e ganhar seguidores." Manrope
   17/500/1.8 `#EFEFEF`, centralizado, 55% de largura.
2. **Seção preta** `#000`, padding-top **260px** (tablet/celular 230px + 30/20 laterais), 4 colunas **47.2% / 17% / 20% /
   15.8%** (tablet 100% / 35% / 40% / 25%; celular empilhadas e centralizadas, 50px entre elas), margem inferior 70px (50):
   - Logo (55%; celular 80%, margem esquerda −25px no desktop), texto "Nos acompanhe nas redes sociais…" (estilo text,
     margem direita 170px), **ícones sociais em círculo** (YouTube, Instagram, Threads, X, TikTok, Kwai, Facebook): 14px,
     padding .6em, **fundo branco + ícone roxo → hover fundo roxo + ícone `#F7F4FF`**, gap 12px.
   - **Blogs** (título h4 25/700 branco [medir cor]): lista de links `#BDBDBD` → hover `#6F4CCE` (.3s).
   - **Outras Opções**: "AJUDE: Fundação Afif Arão", "Igreja Renovada" (mesmo estilo; links [medir]).
   - **Contato**: e-mail e telefone com ícones roxos 14px, texto `#BDBDBD` → hover roxo.
3. **Barra inferior**: borda superior 1px `#FFFFFF2E`, padding 20px 0; à esquerda "Copyright © {ano} SIM Intermediações"
   `#BDBDBD`; à direita botões transparentes "Política de Privacidade" e "Termos de Uso" (estilo text, 20px entre eles)
   com **hover `#6F4CCE`**. Celular: invertido e centralizado.

---

## 5. Páginas de listagem

### 5.1 Banner de título (bloco **`sgTitleBanner`**, usado em Conteúdo, Categorias, Blogs, arquivo e busca)

Contêiner coluna, **margin-top 150px**, padding 2em 1em; caixa com **foto de fundo** (Categorias: `categoria.jpeg`; Conteúdo:
`centraldomarketingblog-1.webp`; Blogs/arquivo/busca [medir]), `background-position: 0 -220px` (tablet 0 −120px; celular 0 0),
`cover`, **raio 25px**, véu a 50% [medir cor], padding 4em 2em (celular 1em); dentro, caixa de 70% raio 25px padding 2em com o
título **Nunito 80/700/120% `#F7F4FF`** (tablet 55; celular 45) centralizado e **entrada `fadeInUp`**. Imagem e título editáveis.

### 5.2 `/todos-os-posts/` ("Conteúdo")

Banner "Conteúdo" → "O que você procura?" (Roboto 40/900 preto, celular 30, centralizado, padding 50px 0 10px) → linha com
**busca** (input com raio 7px 0 0 7px, botão "Pesquisar" raio 7px com padding 0 30px [medir], espaçamentos do widget Search
no CSS 620/444) e **select de categorias** à direita ("Selecionar categoria" — navega para a categoria) — use/estenda o
`categorySearch` existente → **grade TPG** de todos os posts com **categoria visível**, resumo e botão **"Ler mais" pílula
fundo `#6F4CCE` texto `#F7F4FF`** Nunito 16/500 padding 10px 40px raio 30px, **hover fundo `#8261DB`**; paginação centralizada
[medir quantos por página e estilo]. Margem inferior 50px.

### 5.3 `/categorias/`

Banner "Categorias" → "O que você procura?" → busca + select → **grade de cards de categoria 4 colunas (tablet 2, celular 1)**,
largura 80%, padding 20px 0: card com **borda 1px, raio 25px, overflow hidden**, **hover: borda `#2962FF` em .3s**; imagem com
raio 10px (transição .5s, opacidade 1 — [medir] se há zoom); faixa inferior branca min-height 120px com o nome em 24px preto
centralizado; **entrada `fadeIn` com atraso escalonado 0/100/200/300ms…** (use `each` + `stagger`). Os 6 cards do original:
Monetização e Vendas, Crescimento Rápido, Criação de Conteúdo, … [medir os outros e imagens]. Estenda `categoryGrid` (imagem
por categoria, estilo `sg`) ou crie `sgCategoryCards`; o link vai para `/category/<slug>/`. Espaçador final 100px.

### 5.4 `/blogs/`

Banner "Blogs" → os mesmos 5 cartões do §4.10 (`sgBlogCards`) → espaçador.

## 6. Arquivo de categoria (424) — `categoryLayout`

Banner "Categorias" → busca + select → linha (oculta no celular): "Categoria:" + **nome da categoria** (título do arquivo) à
esquerda e botão **"Voltar"** à direita [medir destino e estilo] → **grade de cards do arquivo 3 colunas (tablet 2, celular 1)**
com badge da categoria, título e "Ler mais »", **paginação "carregar mais" ao clicar** [medir quantos por vez e estilo]
(mostre N e revele +N com script curto no fx-runtime; sem JS mostra todos).

## 7. Busca (434) — página `/pesquisa/`

Banner "Pesquisa" → busca + select → "Resultado da pesquisa:" + "Voltar" → grade igual ao arquivo filtrada por `?q=` no
navegador (o original também lista páginas — aqui só posts) → "carregar mais".

## 8. Post (409) — `postLayout`

Grade **`1fr 300px`**, gap 20px, **margin-top 150px** (celular 1 coluna); `img { border-radius:20px }` em tudo dentro.
- **Coluna principal** (caixa raio 30px, padding 20px; celular 15px laterais):
  1. Imagem destacada largura 100%, **altura 530px** (tablet 470; celular 250) `object-fit:cover`, `filter:brightness(105%)`,
     margem inferior 8%.
  2. Categoria centralizada: **Poppins 16/300 MAIÚSCULAS, letter-spacing 10px**, preta (tablet 14px), ícone 14px.
  3. Título **Poppins 40/600, line-height 1em**, preto, centralizado, margem 4% (tablet 30px; celular 23px, margem 12%).
  4. Data ("novembro 22, 2025") Poppins 16/300 centralizada, itens separados por linha vertical 1px preta, margem inferior 12%.
  5. Conteúdo Poppins **17/300/1.8**, `#7A7A7A`, letter-spacing .2px, word-spacing 1px (tablet 14px); `h2.wp-block-heading`
     com `font-size: clamp(1.5rem, 5vw, 2rem)`, h2/h3/h4 com margem `2.5rem 0 1rem` e line-height 1.3 (o primeiro sem margem
     superior); figuras com margem `1rem 0 1.5rem`, imagem centralizada. Um subtítulo Poppins 22/600 `#1C244B` (estilo
     `c5f6840`) [medir onde aparece].
- **Sidebar 300px** (posição relativa): botão de busca (Header Footer Elementor, layout texto, margem 25px) [medir], **select
  "Categorias:" sticky em `top:100px`** e **imagem/banner sticky em `top:200px`** [medir imagem e link]. Respeite
  `--sb-sticky-top` no editor.
- Use `postHeader`/`postContent` existentes com props/variante, ou blocos `sgPost*` se ficar mais limpo.

## 9. 404

O original usa a tela padrão do tema ("A página não pode ser encontrada." / "Parece que nada foi encontrado neste local.").
Faça uma 404 no visual do template: banner de título "404" (`sgTitleBanner`), essas duas frases, busca e botão "Voltar ao
início". Registre a decisão no inventário.

## 10. Links (837) — `/links/` com `bare: true`

Página sem cabeçalho/rodapé com o widget *Link in Bio*: foto/logo de perfil, nome "Seguidores em Alta", bio "Cresça nas redes
sociais com estratégias que funcionam!" e 3 botões largura total — **Conteúdo Gratuito** (`/todos-os-posts/`), **Comunidades**
(LP das comunidades), **Marketplace** [medir links, cores, fundo/imagem de capa, ícones e hover — CSS do `post-837.css` é
mínimo, então meça no navegador]. Bloco `sgLinkBio` com lista de links editável.

## 11. Páginas legais

Termos de Uso e Política de Privacidade: título (heading) + texto original (seções numeradas: aceitação, como utilizar,
privacidade, direitos de conteúdo, cookies, links externos…), parametrizados pela marca em `legal.ts`; layout `prose` com as
medidas do `post-804.css`/`post-797.css` [medir largura e tipografia].

---

## 12. Blocos novos (resumo) — `blocks/seguidores.tsx`

| Bloco | Faz |
| --- | --- |
| `sgHeader` | logo + menu + hambúrguer; transparente → branco após 60px; some ao descer e volta ao subir |
| `sgHeading` (ou extensão de `heading`) | título com palavras em marca-texto `#EBFE00` |
| `sgHero` | título/texto/botão + composição foto + 2 Lotties em camadas |
| `lottie` (genérico) | player Lottie carregado sob demanda |
| `sgPostGrid` | as grades de posts (card, 2 colunas com "Ler mais" texto, roxa, listagem com pílula) |
| `sgCounters` (ou `stats` estendido) | 4 contadores com prefixo/sufixo/separador |
| `sgProducts` | texto + mosaico de cards de produto com véu e botão branco |
| `sgSocialCollage` | colagem 2×2 de logos com grow e entradas escalonadas + texto |
| `sgReviews` | carrossel de depoimentos com avatar, estrelas, setas e bolinhas |
| `sgBlogCards` | cartões dos blogs parceiros |
| `sgTitleBanner` | banner de título com foto e caixa |
| `sgCategoryCards` (ou `categoryGrid` estendido) | cards de categoria com borda azul no hover |
| `sgFooter` | CTA roxa sobreposta + colunas + barra inferior |
| `sgLinkBio` | página de links |

Todos com `fields` em português, defaults que reproduzem o original, `data-sg="<tipo>"` na raiz e filhos estáveis (para
`elStyles`/`fx` por caminho). Reaproveite blocos genéricos sempre que der (`button`, `image`, `postContent`, `categorySearch`,
`adSlot` não é usado aqui) e só estenda com props opcionais que não mudem sites existentes.

## 13. Editor, IA e documentação

- Todos os campos no inspetor; listas (produtos, logos, depoimentos, blogs, links, cards de categoria) com adicionar/remover/
  reordenar. No canvas tudo parado: cabeçalho sem esconder, Lotties como placeholder, contadores no valor final, carrossel
  sem autoplay, entradas visíveis.
- Atualize **`packages/site-builder/src/ai/guide.ts`** (onde ficam: cabeçalho que some ao rolar, título com destaque, Lottie,
  contadores, produtos, depoimentos, blogs, banner de título, página de links) e, se a IA puder operar algo novo (ex.:
  palavras destacadas do título, posts escolhidos de uma grade, intervalo do carrossel), **`src/ai/tools.ts`**.
- Atualize **`docs/development/site-builder.md`** com a variante `seguidores` e o template `seguidores-em-alta` (mesmo nível
  das entradas `marketplace`/`areaflix`): blocos, runtimes alterados e versões que subiram, Lottie, pendências (imagens e JSON
  ainda no WordPress original).
- Registre em `templates/index.ts` (lista visível) com `preview`.

## 14. Testes e verificação (obrigatório)

`templates/seguidores-em-alta/seguidores-em-alta.test.ts` (bun test), no mínimo:
- aparece em `listTemplates()`; passa no `siteSchema` e no schema de **todos** os blocos (header, páginas, footer, postLayout,
  categoryLayout); ids únicos; menu aponta para páginas existentes ou URLs externas válidas; slugs sem colisão;
- export estático: home contém `sb-sg`, as 2 Lotties (`data-sb-lottie`), 4 contadores (`data-sb-count` 420/1119/100/365),
  5 cards de produto com os links do marketplace, 4 depoimentos no carrossel, 5 blogs, títulos com marca-texto; `/links/` sem
  cabeçalho/rodapé; 404 existe; post renderiza sidebar; nenhuma página contém `undefined` nem "Bloco desconhecido";
- os 10 posts e 8 categorias do original presentes.

Rodar e deixar limpo:
```
bun test packages/site-builder
cd frontend; ..\node_modules\.bin\tsc --noEmit
.\node_modules\.bin\biome check --write <só os arquivos criados/alterados>
npm run build
```

Compare a prévia (`/criador-de-sites/novo/seguidores-em-alta` e o editor) lado a lado com o original em 1440/820/390:
cabeçalho transparente → branco → some/volta, composição do hero com as Lotties, marca-texto dos títulos, entradas
(fadeInUp com atrasos 200/400/600, fadeIn escalonado, fadeInLeft), contadores, mosaico de produtos e hover dos botões,
grow dos logos, float do mockup, parallax fixo dos depoimentos, carrossel (5s/500ms, setas, bolinhas, pausa), CTA roxa
sobreposta no rodapé, hovers do rodapé, cards de categoria com borda azul, página do post (imagem 530px, sidebar sticky).

Entregue: lista de arquivos, o que ficou diferente do original e por quê, e os itens **[medir]** que você confirmou.
