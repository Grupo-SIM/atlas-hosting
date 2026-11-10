# Prompt para o Claude Code — template "Zyrion" (portal de notícias) no Criador de Sites

> Cole tudo abaixo num chat novo do Claude Code aberto na raiz do repositório. As medidas foram tiradas do HTML/CSS do Elementor de https://zyrionbrazil.com
> (WordPress 6 + Hello Elementor + Elementor 4.3 / Pro Elements + Qi Addons + plugin "Anúncios Nativos"),
> em 2026-11-10. O que estiver marcado **[medir]** precisa ser conferido no site renderizado.

---

## 0. Contexto e regras do repositório (leia antes de codar)

**Como trabalhar nesta tarefa (Claude Code):**

- É um trabalho grande: comece em **modo de planejamento** — leia os arquivos abaixo, faça o inventário (item 5) e me
  apresente o plano (blocos novos, extensões de blocos/runtimes existentes, arquivos) antes de escrever código.
- O `CLAUDE.md` da raiz já é carregado automaticamente; siga-o à risca (principalmente: **nada contra o banco**).
- Para medir o site renderizado use Playwright/Chromium numa pasta temporária fora do repositório (não adicione dependência
  ao projeto). Se o navegador headless não rodar, siga com o HTML/CSS do Elementor e me avise o que ficou sem conferir.
- Pode usar subagentes para a pesquisa em paralelo (ex.: um por grupo de páginas do original), mas a implementação e as
  decisões de arquitetura ficam na conversa principal.
- Vá em etapas e verifique cada uma (`bun test`, `tsc`) antes da próxima: variante + cabeçalho/rodapé → home → seções →
  arquivo/post/busca/404 → comunidade/link da bio/legais → editor, IA e docs.
- Não faça commit nem push sem eu pedir.

Você vai criar um **template novo** no Criador de Sites do Atlas, migrando o layout, as animações, os hovers, os carrosséis e
todas as páginas de **https://zyrionbrazil.com**. O resultado tem que ser **editável no editor** (props por bloco, campos no
inspetor, posts/categorias vindos do JSON do site), e não HTML colado.

Leitura obrigatória antes de qualquer arquivo:

1. `CLAUDE.md` (raiz): **nunca rode nada contra o banco**; verificação: `tsc --noEmit`, `biome check --write` só nos arquivos
   tocados, `npm run build` se tocar layout/rotas; textos de interface em português.
2. `docs/development/site-builder.md` — o guia inteiro. Principalmente: variantes (`theme.variant`, CSS escopado, breakpoints
   1024/767 repetidos sob `.sb-narrow`), `Block.fx` (entradas `fadeIn*`/`zoomIn`, hovers, `each`/`stagger`), `--sb-sticky-top`
   para elementos sticky, `adSlot`/`AdBox`/`theme.adsConfig`, `textMarquee`, `.sb-cslider` (NAV_RUNTIME) e `data-sb-slider`
   (fx-runtime), `safeUrl` em todo `href` vindo de props, `cssUrl` sem `;`, `FX_VERSION`/`__sbNav` quando mexer em runtime.
3. `docs/development/project-scaffolding.md` se mexer em exports/workspaces.
4. Use como referência de implementação os templates migrados de Elementor que já existem — siga o mesmo padrão de arquivos:
   - `templates/marketplace/` e `renderer/marketplace.ts` + `blocks/marketplace.tsx` (variante + blocos próprios + `brand.ts`,
     `images.ts`, `legal.ts`, `posts.ts`, teste);
   - `templates/central-marketing/` (conteúdo próprio com marca fictícia + teste que impede texto do original de voltar);
   - `templates/portal-noticias/` + `renderer/portal.ts` + `blocks/portal-hub.tsx` (portal de notícias, blocos `newsFront`,
     `newsFeed`, `newsSection`, `postList`, `categoryHeader`, `postHeader`, `postContent`, `postShare`, `sidebarBanner`);
   - `templates/areaflix/` (exemplo enxuto de `block(...)`/`fx` e teste).
5. Faça primeiro um **inventário** em `plans/zyrion-inventario.md` (mesmo formato de `plans/marketplace-inventario.md`):
   rotas, decisões do que é dinâmico, global (cores/fontes/breakpoints), cada seção com medidas e efeitos. Use este prompt
   como base e complete o que estiver **[medir]** abrindo o site num navegador headless (Playwright/Chromium) em
   **1440 / 820 / 390 px**, com o menu mobile aberto e a busca em tela cheia aberta. Screenshots ficam fora do repositório.
   Fontes de dados úteis: `/wp-json/wp/v2/{pages,posts,categories,media}`, `sitemap.xml`, e o CSS inline do Elementor
   (`<style id="elementor-frontend-inline-css">`, ids de template: kit 12799, cabeçalho 12809, rodapé 12820, home 12906,
   post 12953, sidebar do post 13271, arquivo 12970, busca 12959, 404 12965, card do loop 13044, páginas de seção 22840 etc.).

### Nomes

- Template id **`zyrion`**, nome na galeria **"Portal Zyrion"**, tags `["Notícias", "Portal", "Blog"]`.
- Variante **`theme.variant = "zyrion"`**, CSS em `renderer/zyrion.ts`, escopo **`.sb-zy`**, `isZyrion`/`zyrionVars`/`zyrionCss`
  registrados em `SiteRenderer.tsx` igual às outras variantes.
- Blocos próprios em `blocks/zyrion.tsx` com prefixo **`zy`** (lista na §5), exportados como `zyrionBlocks` e adicionados a
  `blockDefinitions`.
- Arquivos do template: `templates/zyrion/{index.ts, brand.ts, images.ts, posts.ts, legal.ts, zyrion.test.ts}`.

### Conteúdo e marca (decisão padrão)

- **Layout, medidas, cores, tipografia, animações e hovers: 1:1 com o original.**
- **Marca e textos:** parametrizados em `brand.ts` (nome, logo, e-mail, redes, slogan "Notícias • Negócios • Entretenimento",
  textos da comunidade, preço do plano). Por padrão use marca **fictícia** e notícias de exemplo **escritas para o template**
  (as notícias do original são de terceiros — Agência Brasil, Metrópoles etc. — e não podem ser copiadas). Mantenha as
  mesmas categorias (Mundo, Brasil, Tecnologia, Entretenimento, Educação, Esportes + Saúde, Outros) e volume suficiente para
  encher todas as seções (≥ 8 posts por categoria do menu, ~50 posts). Teste igual ao do central-marketing garantindo que
  títulos de notícias do original não voltem.
- **Imagens:** todas em `images.ts` (placeholders Unsplash 1200×675 por categoria + SVG gerado para logo/favicon). Registre as
  imagens originais (logo, banners, capas) em `plans/zyrion-imagens.md` aguardando aprovação, como no marketplace.
- **Anúncios:** os banners do original (Atlas Hosting, Comunidade, e-book GIF) viram `adSlot` reais nos mesmos lugares, com
  mídia de exemplo e link em `brand.ts`. `theme.ads = "on"` no template.

---

## 1. Rotas do original → páginas do template

| Original                                                                                                                  | Template                          | Observação                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/` (página "Notícias em todo o Brasil", 12906)                                                                           | home                              | §4                                                                                                        |
| `/mundo/`, `/brasil/`, `/tecnologia/`, `/entretenimento/`, `/educacao/`, `/esportes/` (páginas Elementor)                 | 6 páginas de seção                | mesma estrutura da home filtrada pela categoria + carrossel de posts (§6)                                 |
| `/category/<slug>/`                                                                                                       | `categoryLayout`                  | arquivo (§7)                                                                                              |
| `/<slug-do-post>/`                                                                                                        | `postLayout`                      | post (§8)                                                                                                 |
| `/?s=`                                                                                                                    | página `/pesquisa/`               | busca (§9) — reaproveite o filtro `?q=` que o export estático já tem                                      |
| 404                                                                                                                       | página `404`                      | §10                                                                                                       |
| `/comunidade-zyrion/`                                                                                                     | página `/comunidade/`             | §11                                                                                                       |
| `/links/` (Elementor Canvas, "Link da Bio")                                                                               | página `/links/` com `bare: true` | §12                                                                                                       |
| `/politica-de-privacidade/`, `/termos-e-condicoes/`, `/politica-de-anuncios/`, `/politica-editorial/`, `/corrigir-erros/` | 5 páginas legais (`prose: true`)  | §13, textos genéricos LGPD parametrizados em `legal.ts`                                                   |
| `/author/<x>/`, `/2026/10/`                                                                                               | **fora do escopo**                | o modelo não tem autor/arquivo por data: links de autor e da data do slider apontam para a home/categoria |

Menu (mesma ordem): **Mundo, Brasil, Tecnologia, Entretenimento, Educação, Esportes** → páginas de seção.

---

## 2. Global (kit Elementor 12799)

### Cores (crie tokens da variante em `zyrionVars`)

| Token Elementor  | Valor                    | Uso                                                  |
| ---------------- | ------------------------ | ---------------------------------------------------- |
| primary / accent | `#000000`                | botões, badges, hover de link, botão de busca        |
| secondary        | `#020817`                | títulos (h1–h6), links, fundo da busca em tela cheia |
| text             | `#3C414C`                | corpo, itens do menu                                 |
| `393f45b`        | `#656B77`                | meta (data/autor), ícones de lista                   |
| `0dc6f61`        | `#C6CEDD`                | linhas dos divisores, borda de input, copyright      |
| `8062fd5`        | `#ECF1FF`                | início dos gradientes claros, hover do menu mobile   |
| `b9fa9ea`        | `#F1EDFD`                | fim dos gradientes claros                            |
| `baae741`        | `#02081752`              | véu dos tiles de categoria                           |
| `abd9d55`        | `#004CFF99`              | véu dos tiles no hover / badge do card escuro        |
| `f02a5da`        | `#540CF19C`              | badge do card escuro no hover                        |
| `81e229e`        | `#FFFFFF29`              | linhas dos divisores em fundo escuro                 |
| `d9112cd`        | `#FFFFFFCC`              | texto secundário em fundo escuro                     |
| `cb2acc7`        | `#FFFFFF`                | fundos de cartão, cabeçalho                          |
| painel do rodapé | `#141414`                | caixa "Entre para a comunidade"                      |
| ticker           | `#111` / vermelho `#f00` | faixa "ÚLTIMAS NOTÍCIAS"                             |

Gradientes recorrentes: claro `linear-gradient(135deg, #ECF1FF 0%, #F1EDFD 51–100%)`, caixas de lista
`linear-gradient(135deg, #FFFFFF 0%, #F7F6FF 64%)`, escuro `linear-gradient(135deg, #000 0%, #000 48%)` (preto chapado).

### Tipografia — tudo **Inter** (adicione em `SITE_FONTS`/`FONT_WEIGHTS` se faltar: 400/500/600/700)

| Estilo    | Desktop                       | Tablet (≤1024) | Uso                                              |
| --------- | ----------------------------- | -------------- | ------------------------------------------------ | ------ |
| primary   | 40/1.2, 700                   | 32             | h1 do post, "404"                                |
| secondary | 28/1.3, 700                   | 23             | h2, título do slider, "Mais novidades"           |
| `8722f49` | 19/1.3, 600                   | 17             | h3, título de card grande, tiles                 |
| `fa61f50` | 16/1.3, 600                   | 15             | h4, título de lista, input da busca              |
| `eb4c43f` | 14/1.3, 500                   | 13             | h5, títulos de card pequeno                      |
| `42f1d11` | 13/1.2, 500                   | —              | h6, lista do rodapé, meta do card escuro         |
| `f68e8f8` | 18/1.2, 700, MAIÚSC., ls .4px | —              | **texto dos divisores de seção**                 |
| accent    | 12/1.2, 700, MAIÚSC., ls .2px | —              | menu, botões, "Ler mais »", badge do card escuro |
| `bff4b0b` | 11/1.3, 600, MAIÚSC., ls .2px | —              | data do topo, badge dos cards, categoria do post |
| `05bd7bc` | 14/1.5, 400                   | —              | resumo, listas, labels/inputs                    |
| `e298f28` | 12/1.6, 400                   | —              | meta (data                                       | autor) |
| `249c256` | 14/1.3, 500, sublinhado       | —              | autor no post                                    |
| `a4955e7` | 10/1.7, 600, MAIÚSC.          | —              | (reserva)                                        |

Corpo: Inter 16/1.6 `#3C414C`; `p { margin-block-end: 1.5em }`; `a { color:#020817 } a:hover { color:#000 }`.

### Componentes globais

- **Botão** (kit): fundo `#000`, borda 1px `#000`, raio 0, padding `10px 20px`, accent 12/700 maiúsc., texto branco; hover/focus
  fundo e borda = accent (`#000`) — visualmente estável; no arquivo o hover do "carregar mais" vai para `#3C414C`.
- **Input**: branco, borda 1px `#C6CEDD`, raio 0, transição 400ms; focus borda `#000`.
- **Divisor de seção** (widget divider "line_text", usado em TODAS as seções): texto à esquerda (ou centro), linha sólida
  ocupando o resto, espaço texto↔linha 16px (20px no rodapé/sidebar, 32px em "Mais novidades"), margem inferior 24px.
  Linha 2.4px `#C6CEDD` na home; 1px no post/sidebar/rodapé; `#FFFFFF29` em fundo escuro. Texto no estilo `f68e8f8`
  `#020817` (branco em fundo escuro; `#FFFFFFCC` + estilo accent no rodapé). **Entrada `fadeInDown`.**
- **Imagens**: raio 0 em tudo.
- **Breakpoints**: celular ≤ 767, tablet ≤ 1024 (repita sob `.sb-narrow`). Contêiner "boxed" do Elementor: largura de conteúdo
  padrão **1140px** **[medir]** com 40px laterais no tablet e 16–20px no celular (veja cada seção).

### Animações do Elementor (reproduza com `Block.fx` + fx-runtime; não carregue jQuery/Elementor)

- Entradas por IntersectionObserver, uma vez: `fadeInDown` (divisores, categoria do post, título do rodapé),
  `fadeInUp` (botões "Ver todas", tiles de categoria, logo/redes do rodapé, botões de compartilhar), `zoomIn` (busca da
  página de resultados). Keyframes do Elementor: `fadeInUp` = de `opacity:0; translate3d(0,100%,0)` para o lugar;
  `fadeInDown` = de `translate3d(0,-100%,0)`; `zoomIn` = de `opacity:0; scale3d(.3,.3,.3)` a 50% `opacity:1`.
  Duração padrão **1.25s**; `animated-fast` = **0.75s**, `animated-slow` = **2s** (os três botões "Ver todas" usam normal,
  fast, slow e normal — reproduza essa variação; se o `Fx` não tiver duração de entrada, adicione um campo `enterMs` opcional
  em `model/fx.ts`, validado, com teste em `fx.test.ts`).
- Hovers de transform: `translateY(-2px)` em 600ms (logo do rodapé/post), `translateY(-3px)` em 600ms (caixa de anúncio
  quadrado da sidebar). Use o hover `lift` com `hoverMs: 600` (ajuste a distância se o `lift` atual for diferente — se
  precisar, adicione intensidade sem quebrar sites existentes).
- `e-animation-grow` está carregado na home **[medir]** em qual elemento (provável botão "Faça parte"): scale 1.1 em .3s.
- Sem `prefers-reduced-motion`: respeite como o fx-runtime já faz.

---

## 3. Cabeçalho (template 12809) — vai em `site.header`, bloco **`zyHeader`**

Duas faixas:

**3.1 Barra superior** (preta, `z-index:99`): flex `space-between`, padding 12px 0 (tablet 12px 40px; celular 10px 20px, gap 0).

- Esquerda: ícone calendário 12px + **data de hoje por extenso** ("10 de novembro de 2026"), estilo `bff4b0b`, `#FFFFFFCC`.
  No HTML publicado a data precisa ser a do visitante: renderize a data da publicação e atualize no carregamento com um
  script mínimo (`Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'})`) — coloque no `NAV_RUNTIME`
  ou fx-runtime via atributo `data-sb-today` (suba a versão do runtime).
- Direita: ícones sociais (Instagram, Facebook, X, Threads, TikTok, YouTube) 13px (12px no celular), gap 12px (10px),
  sem fundo, `#FFFFFFCC` → hover branco. Reuse o bloco/ícones de `socialIcons` se possível; links em `brand.ts`.

**3.2 Barra principal — sticky no topo em todas as telas** (`top: var(--sb-sticky-top, 0px)`, `z-index:99`): fundo branco,
`box-shadow: 0 3px 16px rgba(15,24,63,.08)`, padding 20px 0 (tablet 16px 40px; celular 8px 20px), gap 32px (celular 24px).

- Logo: coluna de 11.932% com a imagem a 47% dela no desktop (tablet: coluna 48%, imagem 47%; celular: coluna 41%, imagem 83%).
  Logo é imagem editável (SVG gerado em `images.ts` por padrão).
- Coluna direita (85%; tablet 47%; celular 47.6%): flex `space-evenly` (tablet `flex-end`), gap 32px (celular 16px):
  - **Menu horizontal** alinhado à direita, itens no estilo accent (12/700 maiúsc.), cor `#3C414C`, padding 12px, margem
    2px entre itens, **sem ponteiro/sublinhado**; hover/ativo `#000` (marque `aria-current="page"` via `RenderContext.path`).
  - **Botão de busca** quadrado 32px, fundo `#000`, ícone lupa branco 40% do tamanho, raio 0; hover fundo accent.
    Clique abre a **busca em tela cheia** (skin `full_screen` do Elementor): overlay fixo cobrindo a tela com fundo
    `#020817` (aplique leve transparência como o Elementor **[medir]**), fade-in ~0.3s, input grande centralizado com borda
    4px branca, texto branco/`#020817` **[medir]** em `fa61f50`, botão X no canto superior direito; Esc/clique no X fecha.
    Enviar leva a `/pesquisa/?q=…`. Implementação: CSS + `<dialog>`/checkbox, script só para foco/Esc, no `NAV_RUNTIME`.
- **≤ 1024px**: menu vira hambúrguer (ícone 24px, `#3C414C`, hover `#000`, fundo transparente) e abre um **dropdown
  esticado na largura total** logo abaixo da barra (`elementor-nav-menu--stretch`): fundo branco, borda 8px branca,
  sombra `0 0 20px rgba(12,8,40,.1)`, itens accent 12/700 com padding 10px 32px (celular 9px 20px), hover/ativo texto `#000`
  com fundo `#ECF1FF`. Abre/fecha com transição de altura (Elementor usa `max-height` + `transform: scaleY` — **[medir]**);
  funciona sem JS (checkbox, como `#sb-burger`).

---

## 4. Home (página 12906) — ordem exata das seções

Use os blocos genéricos onde der (`adSlot`, `heading` com divisor, `button`) e blocos `zy*` onde o layout é específico.
**Todo bloco que lista posts lê de `site.posts`** (publicados, mais novos primeiro), com props: categoria (slug ou "todas"),
quantidade, offset, e mostrar/ocultar meta — assim o usuário cria posts e as seções se atualizam.

### 4.1 Faixa de anúncio horizontal (topo)

Contêiner largura total, padding-top 20px, fundo gradiente `#ECF1FF → #F1EDFD 72%`, centralizado. `adSlot` faixa (banner
horizontal 1). Margem do banner 16px 0, imagem raio 4px.

### 4.2 Destaque: slider + ticker + "últimas" (bloco **`zyHero`**)

Contêiner fundo gradiente `#ECF1FF → #F1EDFD 51%`, padding 40px 0 (tablet 40px; celular 16px), gap 16px, linha:

**Coluna esquerda (60%; tablet/celular 100%)**, coluna com `space-between`:

1. **Slider de posts** (Qi "blog slider", layout _date-boxed_): 1 slide por vez, **efeito slide, loop, autoplay a cada
   5000 ms, transição 800 ms, arrastar com o mouse/dedo (grabCursor), sem setas e sem bolinhas**, espaço entre slides 30px
   no tablet/celular. 6 posts mais recentes.
   Slide: imagem 16:9 (1200×675) com `overflow:hidden`; **hover no slide → imagem `scale(1.03)` em `.35s
cubic-bezier(.25,.46,.45,.94)`** (repouso `scale(1.005)`); caixa de data **no canto superior direito da imagem**:
   fundo `#111`, texto branco, padding 12px 18px, formato "24 out" (dia + mês abreviado minúsculo). Abaixo, conteúdo com
   padding-top 27px: linha de info (categoria / autor, separados por "/" com 12px de cada lado, fonte .9em, cor `#111`,
   hover `#3c3c3c`), depois título h2 (secondary 28/700 → 23 tablet) com margem `0 0 .5em`, link para o post.
   Implemente com o `data-sb-slider` do fx-runtime (autoplay/loop/pausa/arrastar) — estenda-o se faltar "sem pontos",
   "intervalo" e "duração da transição" como atributos. No editor fica parado no 1º slide.
2. **Ticker "ÚLTIMAS NOTÍCIAS"** dentro de uma caixa branca (padding 6px, margin-top 12px, largura 100%):
   faixa altura 45px, fundo `#111`, `border-bottom: 3px solid #f00`, flex. Rótulo à esquerda: fundo `#f00`, branco, 14px bold,
   padding 0 15px, `box-shadow: 5px 0 15px rgba(0,0,0,.5)`, `z-index:2`, sem quebra. Trilho: itens = títulos dos **10 posts
   mais recentes** (links), branco 15px, padding 0 40px, cada um seguido de "•" vermelho com 40px à esquerda. Animação
   `translate3d(0,0,0) → translate3d(-100%,0,0)` **linear infinita de 80s**, começando com `padding-left:100%` (entra pela
   direita), **pausa no hover**. Fonte Arial no original — use Inter. No original os itens vêm por `fetch` da API do WP; aqui
   renderize no build a partir dos posts (sem fetch). Reaproveite/estenda `textMarquee` ou faça `zyTicker`; o texto do
   rótulo, quantidade e duração são props.

**Coluna direita (38%; tablet/celular 100%, margin-top 20px no tablet)**: caixa preta, padding 28px (celular 20px),
centralizada verticalmente. Lista de **6 posts**, uma coluna (tablet 2 colunas, celular 1), gap 20px (tablet linha 20 /
coluna 32): miniatura à esquerda com 24% da largura (tablet 28%, celular 32%), proporção 0.8 (tablet/celular 1 = quadrada),
margem 20px (tablet/celular 16px); título branco `fa61f50` (margem 4px), data `e298f28` `#FFFFFFCC`. **Hover no item:
miniatura `filter: brightness(88%)`.**

> Esse mesmo "post em lista com miniatura à esquerda" aparece em várias seções: crie um bloco **`zyPostList`** configurável
> (colunas por tela, largura da miniatura por tela, proporção por tela, gap, mostrar autor/data, tema claro/escuro, tamanho
> do título) em vez de vários blocos.

### 4.3 "Em alta" (bloco `zyCards` duas vezes + divisor)

Contêiner margin-top 80px (tablet/celular padding lateral 40/16px). Divisor "Em alta" (§2, linha 2.4px, `fadeInDown`).
Linha com gap 20px (tablet: empilha):

- **Esquerda (57%)**: cards 2 colunas (celular 1), gap 20px, 2 posts "em destaque". Card Elementor _cards_: fundo branco,
  raio 0; imagem proporção 0.8 largura 100% com margem inferior 18px; **badge da categoria** sobre a imagem no canto
  superior esquerdo (fundo `#000`, branco, `bff4b0b` 11px, margem 16px, raio 0); **avatar redondo 36px** do autor sobre a
  borda da imagem (`top: -18px`, padding lateral 20px); texto padding 0 20px, margin-top 20px; título `8722f49` (margem 12);
  resumo `05bd7bc` `#3C414C` (margem 12); "Ler mais »" no estilo accent (margem 8); rodapé de meta com borda superior branca,
  padding 10px 20px, `e298f28` `#656B77`, "autor | data" com separador "|" `#C6CEDD`. **Hover: imagem brightness 88%.**
- **Direita**: cards 2 colunas também no celular, gap 16px (celular 8px), 4 posts: igual, menor — imagem margem 12px,
  badge 9px margem 12px, avatar 24px (top -12px), texto padding 0 12px margin-top 12px, título `eb4c43f` 14/500, **sem
  resumo e sem meta** (confirmar **[medir]**). Tablet: margin-top 40px.
- Avatar: imagem do autor em `brand.ts` (um autor só, como no original).

### 4.4 Faixa de anúncio horizontal 2

Contêiner padding-top 50px, centralizado, `adSlot` (banner horizontal "Comunidade").

### 4.5 Quatro caixas por categoria (2×2) — Mundo, Brasil, Educação, Entretenimento

Contêiner margin-top 80px, padding 0 40px (celular 16px), linha com wrap, gap 20px; cada caixa 50% (tablet/celular 100%,
margin-top 24px), fundo `linear-gradient(135deg,#FFF 0%,#F7F6FF 64%)`, padding 36px (celular 20px). Dentro:
divisor com o nome da categoria (`fadeInDown`) → `zyPostList` de **3 posts da categoria**: 1 coluna (tablet 2, celular 1),
miniatura 24% quadrada (tablet 28%, celular 32%), margem 12px (tablet/celular 16px), gap 20px (tablet 24/32), título
`fa61f50`, meta "autor | data" `e298f28` `#656B77` → botão **"Ver todas"** largura total (`justify`), margin-top 24px,
link para a página da seção, **entrada `fadeInUp`** com durações normal / fast / slow / normal nas 4 caixas.

### 4.6 Tecnologia — grade escura com cards de imagem de fundo (bloco **`zyOverlayGrid`**)

Contêiner preto, margin-top 80px, padding 60px 0 (tablet 60px 40px; celular 60px 16px). Divisor "Tecnologia" com texto
branco e linha `#FFFFFF29` (`fadeInDown`). Grade **3 colunas (tablet 2, celular 1)**, gap 12px, `grid-auto-rows: 1fr`,
6 posts; **um item ocupa 2 colunas** (`grid-column: span min(2, var(--grid-columns))` — no original é um item específico
do loop **[medir]** qual; deixe como prop "item largo" = índice).
Card (template de loop 13044): `min-height:400px`, padding 32px (celular 20px), flex coluna `space-between`, imagem do post
como fundo `cover` `center center`; véu `::before` `linear-gradient(180deg, transparent 36%, #020817 96%)` com opacidade .72.
**Hover (tudo em 0.8s): `background-position` vai para `bottom center` (a foto "desliza") e o véu vira
`linear-gradient(180deg, transparent 36%, #000 92%)`.**
Conteúdo: no topo, **badge** da categoria (ícone 12px + texto, accent 12/700 maiúsc. branco, fundo `#004CFF99`, padding
4px 8px, **hover fundo `#540CF19C` em 0.6s**); embaixo, título branco Inter 26/700/1.3 (celular 23px) e linha de meta
(autor + data no formato "outubro 20, 2026", ícones 14px, `42f1d11` 13/500 `#FFFFFFCC`, gap 16px, margin-top 12px).
O card inteiro é link para o post.

### 4.7 Faixa de anúncio (GIF)

Contêiner padding-top 50px, centralizado; `adSlot` com largura máx. 485px e imagem 485×175 `object-fit:cover`.

### 4.8 Esportes + coluna de categorias

Contêiner margin 80px 0, linha com gap 60px (tablet: empilha, padding 0 40px; celular 0 16px).

- **Esquerda (72%)**: divisor "Esportes" (`fadeInDown`) → cards 2 colunas (celular 1), gap 28px, 6 posts de Esportes:
  imagem proporção 0.66 largura 100%, fundo branco, texto padding 0 28px margin-top 12px, título `8722f49` margem 12px, meta
  padding 10px 28px `e298f28` `#656B77` "autor | data", **sem badge/resumo/avatar**, hover brightness 88%.
- **Direita (28%; tablet 100% com margin-top 60px)**, coluna centralizada:
  1. `adSlot` quadrado (no celular ele sobe para o topo da coluna: `order:-99999`);
  2. **6 tiles de categoria** (bloco **`zyCategoryTiles`**; Elementor _Call to Action_ skin cover): MUNDO, BRASIL,
     TECNOLOGIA / ENTRETENIMENTO, EDUCAÇÃO, ESPORTES em duas pilhas (no tablet cada pilha vira grade com gap 12px), cada
     tile largura 100%, margin-top 12px, `min-height:100px`, padding 16px, texto centralizado `8722f49` branco maiúsc.,
     imagem de fundo da categoria; **véu `#02081752` → hover `#004CFF99`; hover dá zoom-in no fundo (`scale(1.2)`) — fundo e
     véu com `transition-duration: 1600ms`**. Entrada **`fadeInUp`** em cada tile. Link para a página da seção.
     Itens (rótulo, imagem, link) editáveis como lista.
  3. `adSlot` quadrado 2 (banner "Comunidade").
- Existe uma seção **"Videos"** com 3 vídeos 16:9 que está **oculta em todas as telas** no original — crie-a com
  `hidden: true` (o usuário pode ligar), usando o bloco de vídeo/YouTube existente.

### 4.9 Rodapé (template 12820) — `site.footer`, bloco **`zyFooter`**

1. **Caixa CTA flutuante**: contêiner `z-index:10`; caixa `#141414` padding 48px (tablet 40/28; celular 40/24),
   centralizada, **`margin-bottom:-136px`** (tablet −110px; celular −190px) para **sobrepor a seção preta de baixo**.
   Título "Entre para a comunidade {marca}" secondary branco centralizado (**`fadeInDown`**), texto "Conteúdo premium e
   benefícios exclusivos!" branco, botão "Faça parte" com borda branca e `box-shadow: 0 0 10px rgba(0,0,0,.5)` → `/comunidade/`.
2. **Seção preta**: `min-height:360px`, padding-top 136px (tablet 110; celular 190), padding-bottom 80px (60), `z-index:2`.
   - Bloco central (44% da largura; tablet 80%; margem 80px 0; celular margem-bottom 40, padding 0 20): **logo 180px**
     (celular 140px) com **entrada `fadeInUp` + hover `translateY(-2px)` em 600ms**; slogan "Notícias • Negócios •
     Entretenimento" (`fa61f50` branco, margem 28px acima, 8 abaixo; descrição `05bd7bc` `#FFFFFFCC`); ícones sociais 20px
     (celular 18px), gap 20px (16px), margin-top 32px, `#FFFFFFCC` → hover branco, **entrada `fadeInUp`**.
   - **4 colunas** (gap 60px; tablet wrap, gap 48px, cada uma 46%, padding 0 40px; celular empilhadas com margin-top 60px):
     **Últimas Notícias** (3 posts, miniatura 18% proporção 0.8 margem 16px, gap 16px, só título `42f1d11` `#FFFFFFCC`,
     hover brightness 88%), **Categorias** (lista com ícone 11px `#656B77` → hover branco, texto `05bd7bc` `#FFFFFFCC` → hover
     branco, transição .3s, espaço 12px entre itens), **Termos** (Política de privacidade, Termos e Condições, Política de
     anúncios — mesmo estilo), **Contato** (ícone quadrado 12px com padding 6px fundo `#000`, título "E-MAIL" `bff4b0b`
     `#FFFFFFCC`, e-mail `42f1d11` branco). Títulos das colunas = divisor (linha 1px `#FFFFFF29`, texto accent `#FFFFFFCC`,
     espaço 20px, margem 24px).
3. **Barra de copyright** preta, padding 16px 0 (tablet 16/40; celular 10/20), centralizada, inline: "© 2026 {marca}.
   Todos os direitos reservados." em `42f1d11` `#C6CEDD`. Ano automático.

---

## 5. Blocos novos (resumo) — `blocks/zyrion.tsx`

Todos com `fields` completos em português (o inspetor é gerado deles), defaults que reproduzem o original, `data-zy="<tipo>"`
na raiz, e renderizando a partir de `ctx.site.posts`/`categories`. Filhos estáveis (para `elStyles`/`fx` por caminho).

| Bloco             | Faz                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `zyHeader`        | barra superior (data + redes) + barra sticky (logo, menu, busca tela cheia, hambúrguer com dropdown)                          |
| `zyHero`          | slider date-boxed + ticker (ou componha `zySlider` + `zyTicker` + `zyPostList` dentro de `twoColumns` se ficar mais editável) |
| `zyPostList`      | lista com miniatura à esquerda, configurável por tela, tema claro/escuro, botão opcional "Ver todas"                          |
| `zyCards`         | cards Elementor (badge, avatar, resumo, ler mais, meta) com variações `large`/`small`/`plain`                                 |
| `zyOverlayGrid`   | grade de cards com imagem de fundo e véu, item largo, hover de posição + véu                                                  |
| `zyCarousel`      | carrossel de cards escuros (páginas de seção, §6)                                                                             |
| `zyCategoryTiles` | tiles CTA com zoom 1.6s                                                                                                       |
| `zyFooter`        | CTA sobreposta + seção preta + colunas + copyright                                                                            |
| `zyArchiveHeader` | faixa do título do arquivo/busca (§7)                                                                                         |
| `zyCommunity`     | página da comunidade (texto + lista + tabela de preço + banner alto + "outras comunidades")                                   |
| `zyLinkBio`       | página "link da bio"                                                                                                          |
| `zyNotFound`      | caixa do 404                                                                                                                  |
| `zyNewsletter`    | caixa "inscreva-se" da sidebar do post                                                                                        |

Se um bloco genérico existente já resolve (ex.: `postShare`, `postContent`, `adSlot`, `heading`), use-o e só estenda com props
opcionais que não mudem sites existentes.

---

## 6. Páginas de seção (`/mundo/` … `/esportes/`, 22840 etc.)

Mesma linguagem da home, filtrada pela categoria da página (prop `categorySlug` em cada bloco). Estrutura medida em
`/esportes/` (repita nas 6, **[medir]** os rótulos dos divisores e diferenças de cada uma):

1. `adSlot` horizontal (topo, mesmo da home).
2. Destaque: slider (posts da categoria) + ticker + lista preta (6 posts da categoria) — igual §4.2.
3. Divisor + dois blocos de cards (igual §4.3) + `adSlot` horizontal entre eles.
4. **Carrossel de cards escuros** (Elementor _Loop Carousel_ com o mesmo card do §4.6) — bloco `zyCarousel`:
   **3 slides visíveis no desktop, 1 no tablet e no celular; avança 1 por vez; autoplay 5000 ms; velocidade 500 ms;
   loop infinito; pausa no hover e após interação; setas dentro do carrossel; "offset" de 100px dos dois lados
   (cards cortados nas bordas mostrando que há mais) — 24px no celular; espaço entre slides 4px.** Estilo das setas
   **[medir]** (CSS da página 22840). Use `.sb-cslider` + fx-runtime (já tem setas, autoplay e pausa) e estenda para
   "slides por tela", "offset lateral" e "velocidade".
5. Quatro colunas de lista com divisores (`posts classic`, 3 posts cada) — **[medir]** títulos (provavelmente subcategorias /
   "mais lidas" — se o original usar tags, use a mesma categoria com offsets diferentes).
6. `adSlot` GIF.
7. Grade escura `zyOverlayGrid` com **4 colunas** (tablet 2, celular 1).

---

## 7. Arquivo de categoria (`categoryLayout`, template 12970)

1. **Faixa do título** (`zyArchiveHeader`): fundo `linear-gradient(135deg, #000 0%, #000 53%)` com imagem de fundo por cima
   em opacidade 0.08, **`background-attachment: fixed` no desktop (≥1025px)** — efeito parallax; padding 60px 0 44px
   (tablet 48/32/40; celular 48/32/20); conteúdo 40% da largura (tablet 80%), centralizado; título = nome da categoria em h1
   branco centralizado; descrição opcional `05bd7bc` margin-top 20px. Imagem **[medir]** (URL no CSS do 12970).
2. `adSlot` horizontal (contêiner branco, padding-top 20px).
3. Contêiner margin 60px 0 (padding lateral 40/20): **grade de cards de arquivo 3 colunas (tablet 2, celular 1)**, gap
   linha 35px / coluna 30px: imagem proporção 0.66 (celular 0.5), **badge da categoria no canto superior direito**
   (fundo `#000`, margem 20px), texto margin-top 20px, título, resumo, "Ler mais »", meta "autor | data".
   **Paginação "carregar mais" ao clicar** (botão preto, hover `#3C414C`, spinner branco): implemente no export estático
   mostrando N cards e revelando +N por clique (script pequeno no fx-runtime; sem JS, mostra todos).
4. Caixa de anúncio quadrado à direita/abaixo **[medir]** com hover `translateY(-3px)` 600ms.

## 8. Post (`postLayout`, template 12953 + sidebar 13271)

Contêiner margin-top 80px (celular 60), linha gap 60px (tablet: empilha, padding 0 40px; celular 0 20px).

**Coluna principal (72%)**:

1. Categoria (ícone 13px `#656B77` + texto `bff4b0b`), margem 20px, **`fadeInDown`**; centralizada no tablet/celular.
2. Título **h1** (primary 40/700 → 32 tablet, `#020817`); centralizado no tablet/celular.
3. Linha de meta (margin-top 20px, gap 32px; celular em coluna gap 12px; centralizada no tablet): **avatar 32px** (24px no
   celular) + autor em `249c256` (14/500 sublinhado) | data "outubro 18, 2026" e "Sem comentários" com ícones 13px,
   `e298f28` `#656B77`, 20px entre itens.
4. Divisor 1px `#C6CEDD` com 32px acima/abaixo.
5. Imagem destacada 100%, margem inferior 40px.
6. Conteúdo do post (`postContent`), estilos do Hello Elementor para h2/h3, links, listas, legendas de imagem **[medir]**.
7. Divisor 1px com 40px acima/abaixo.
8. **Caixa de compartilhar**: gradiente vertical `#ECF1FF → #F1EDFD`, margem 40px 0, padding 24px 32px, flex
   `space-between` (celular em coluna): "Compartilhe esta notícia" (`fa61f50`) + botões só-ícone, skin **gradiente**,
   tamanho 8px base (7px celular), ícone 2em, gap 8px, **entrada `fadeInUp`** (redes **[medir]**: Facebook, X, WhatsApp,
   Telegram, LinkedIn…). Use/estenda `postShare`.
9. `adSlot` horizontal.
10. Bloco da marca (margem 80px 0; celular 0 0 40px): logo 180px (140) com `fadeInUp` + hover −2px 600ms, slogan.

**Sidebar (28%; tablet 100% com margin-top 60px, itens lado a lado com gap 24px)** — 4 caixas com gradiente
`#ECF1FF → #F1EDFD`, padding 24px (tablet 40px; celular 32/20), 32px entre elas:

1. **"inscreva-se"** (`zyNewsletter`): divisor 1px, campo e-mail + botão "inscreva-se" largura total (gap 8px), nota
   "Ao clicar no botão "Inscreva-se", você confirma que leu nossa Política de Privacidade." `e298f28` (centralizada no tablet).
   Site estático: o formulário envia para uma URL configurável (prop) ou fica desabilitado no editor com aviso — **não**
   invente backend.
2. **"últimas notícias"**: 6 posts, miniatura 26% proporção 0.8, margem 16px, gap 16px (celular 12), título `eb4c43f`, data.
3. `adSlot` quadrado com hover `translateY(-3px)` 600ms.
4. **"destaques"**: menu vertical com as categorias, itens `05bd7bc` `#020817`, padding 6px 12px, 4px entre itens,
   **ponteiro "background": no hover/ativo o fundo do item fica `#000` e o texto branco** (Elementor `e--pointer-background`,
   animação padrão _fade_ **[medir]**), raio 0.

**Abaixo das colunas — "Mais novidades"**: caixa gradiente `135deg #ECF1FF → #F1EDFD`, **raio 8px**, margin-top 80px, padding
40px 0 (tablet 40px; celular 32px 12px); divisor centralizado com texto secondary (28px) e espaço 32px (16 no celular),
margem 40px; grade **4 colunas (tablet e celular 2)**, gap 24px (celular 12px), imagem 0.66, título `eb4c43f` margem 6px,
meta, **hover brightness 92%**, 8 posts.

**Comentários**: o original tem o formulário do WordPress ("Deixe um comentário", nome, e-mail, site). Site estático não
tem backend → **não renderize** o formulário; registre no inventário.

## 9. Busca (`/pesquisa/`, template 12959)

Faixa igual à do arquivo com o título "Resultados para: {termo}" (o original mostra "Search Results for:" em inglês — traduza),
formulário de busca clássico com botão de ícone e **entrada `zoomIn`**, `adSlot`, grade de cards de arquivo (§7) filtrada
por `?q=` no navegador, "carregar mais", e `adSlot` no fim.

## 10. 404 (template 12965) — `zyNotFound`

Caixa gradiente `#ECF1FF → #F1EDFD 50%`, conteúdo 700px, padding 80px 0 216px (tablet/celular 60px/196px + 40/20 laterais),
**`margin-bottom:-136px`** (encosta na CTA do rodapé). Dentro, centralizado: "página não encontrada" (`f68e8f8`, margem 20),
"404" (primary 40/700) + texto "Opss... Parece que você não encontrou o que procura por aqui, …" (text 16), formulário de busca
(altura 40px, fundo branco, botão `#000` com `min-width` 80px — tablet 56px, celular 44px — hover accent), divisor centralizado
"últimas notícias" (20px acima/abaixo), grade de 4 posts (tablet 4, celular 2), gap 16/12, imagem 0.66, título `42f1d11`,
hover brightness 88%; botão "voltar para o início" largura total, margin-top 32px.

## 11. Comunidade (`/comunidade/`, página 22839) — `zyCommunity`

- Só no celular: imagem do banner no topo (margem 20px).
- Linha (padding 50px 0 100px; celular 0): **coluna esquerda 50%** (margem 10px −40px… **[medir]**, espaçador 60px/35/10):
  h2 "Você não está apenas por dentro. Você faz parte." (centralizado no celular), parágrafo com a marca em negrito,
  h "Ao entrar, você terá acesso a:" (18px), lista com **rótulo em negrito + descrição** (6 itens: Enquetes exclusivas,
  Conteúdo antecipado, Clube de Benefícios, Clube de Experiências, Exclusividade, Envie notícias e acontecimentos),
  h "Entre para a Comunidade {marca}" (24px centralizado no tablet), **tabela de preço** (widget price-table: cabeçalho
  `#000` com "Zyrion Member", "R$ 2,00 / Mês" com a moeda alinhada no topo, lista de recursos `#000` separados por linha
  2px `#ddd` com 15px acima/abaixo, botão "Fazer parte"; raio 10px; margem lateral 150px no desktop, 0 no tablet).
  Preço e link de checkout em `brand.ts`.
- **Coluna direita 50%** (oculta no celular): banner vertical alto, `min-height:1206px` (tablet 738px), raio 25px,
  imagem `center` (tablet `cover`), margin-top 50px.
- No tablet a tabela de preço aparece numa seção própria embaixo (margem 200px laterais) — oculta no desktop/celular.
- "Outras Comunidades:" centralizado + 4 cartões (imagem com margem 10px + título 20px centralizado), linha com wrap.
  Lista editável (imagem, título, link). Espaçadores 50/100px.

## 12. Link da Bio (`/links/`, `bare: true`) — `zyLinkBio`

Página sem cabeçalho/rodapé (Elementor Canvas). Fundo com **slideshow de imagens em fade (5000 ms por imagem, transição
500 ms, loop)** e véu 0.5; cartão central (widget _Link in Bio_): foto de perfil redonda (115px no celular), nome,
bio ("Notícias • Negócios • Entretenimento / +80M views nos últimos 60 dias / Conheça nossas soluções"), 5 botões largura
total com fundo `#020817` e emojis: "🚀 Entre para a Comunidade", "📰 Acesse o Portal de Notícias", "📈 Divulgue sua marca
para milhões", "☁️ Hospede seu site • 100% Cashback", "📚 Acesse a plataforma …". Medidas/hover dos botões **[medir]**.
Tudo editável (lista de links, imagens do slideshow; slideshow em CSS puro com `@keyframes` gerado por quantidade, como o
`logoStepKeyframes`, para funcionar sem JS).

## 13. Páginas legais

Layout padrão do Hello Elementor: título h1 + conteúdo (`prose`). 5 páginas (Privacidade, Termos e Condições, Política de
Anúncios, Política Editorial, Política de Correções) com texto genérico LGPD parametrizado pela marca/e-mail em `legal.ts`
(mesma estrutura de seções do original: o que coletamos, como usamos, cookies, compartilhamento, segurança, direitos, contato).

---

## 14. Editor, IA e documentação

- Todo campo novo aparece no inspetor; listas (tiles, links da bio, comunidades, slides) com adicionar/remover/reordenar.
- O canvas do editor mostra tudo **parado**: slider no 1º slide, ticker sem animação, carrossel sem autoplay, busca
  fechada, entradas visíveis (padrão `.sb-js` do fx-runtime).
- Sticky do cabeçalho com `--sb-sticky-top`.
- Atualize **`packages/site-builder/src/ai/guide.ts`** (onde ficam: cabeçalho com busca, ticker, slider, tiles, anúncios,
  newsletter, página Comunidade, Link da Bio) e, se a IA puder operar algo novo (ex.: trocar categoria de uma seção,
  intervalo do slider), **`src/ai/tools.ts`**.
- Atualize **`docs/development/site-builder.md`**: variante `zyrion` e template `zyrion` (mesmo nível de detalhe das entradas
  `marketplace`/`areaflix`), runtimes que mudaram e versões que subiram, pendências (imagens a copiar, comentários e
  newsletter sem backend).
- Registre o template em `templates/index.ts` (lista visível) com `preview`.

## 15. Testes e verificação (obrigatório antes de entregar)

`templates/zyrion/zyrion.test.ts` (bun test), no mínimo:

- aparece em `listTemplates()`; passa no `siteSchema` e no schema de **todos** os blocos (header, páginas, footer,
  postLayout, categoryLayout);
- ids únicos; menu aponta para páginas existentes; slugs sem colisão (`isSlugTaken`);
- export estático: home contém `sb-zy`, o slider (`data-sb-slider` ou equivalente) com 6 slides, o ticker com 10 links,
  os 6 tiles, a grade escura com 1 item largo, 3+ `adSlot`; nenhuma página contém `undefined` nem "Bloco desconhecido";
  `/links/` sem cabeçalho/rodapé; 404 existe; post renderiza sidebar e "Mais novidades";
- nenhum título de notícia do original aparece (lista de títulos reais no teste, como no central-marketing).

Rodar e deixar limpo:

```
bun test packages/site-builder
cd frontend; ..\node_modules\.bin\tsc --noEmit
.\node_modules\.bin\biome check --write <só os arquivos que você criou/alterou>
npm run build
```

Não rode nada contra o banco (nenhuma migration é necessária para este template).

Abra a prévia do template (`/criador-de-sites/novo/zyrion` e o editor) em 1440/820/390 e compare lado a lado com o original:
cabeçalho sticky, busca tela cheia, menu mobile, slider (5s/800ms), ticker (80s, pausa no hover), hovers (zoom do slider,
brightness das miniaturas, posição/véu da grade escura, badge azul→roxo, zoom 1.6s dos tiles, lift do logo/anúncio),
entradas (fadeInDown nos divisores, fadeInUp nos botões/tiles/rodapé com durações variadas), CTA do rodapé sobreposta,
parallax fixo do arquivo, carrossel das páginas de seção (3/1 slides, offset 100/24px, setas, pausa).

Entregue: lista de arquivos, o que ficou diferente do original e por quê, e os itens **[medir]** que você confirmou.
