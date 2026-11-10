# Prompt para o Claude Code — template "Marketing Raiz" no Criador de Sites

> Cole tudo abaixo num chat novo do Claude Code aberto na raiz do repositório (ou diga "siga `plans/marketingraiz-prompt.md`").
> Medidas tiradas do HTML e dos CSS do Elementor de https://marketingraiz.com (WordPress 7 + Hello Elementor + Elementor 4.3 /
> Elementor Pro + The Post Grid) em 2026-11-10. O que estiver marcado **[medir]** precisa ser conferido no site renderizado.

---

## 0. Como trabalhar e regras do repositório

- Trabalho grande: comece em **modo de planejamento**. Leia os arquivos abaixo, faça o inventário (item 4) e me apresente o
  plano (blocos novos, extensões de blocos/runtimes existentes, arquivos) antes de escrever código.
- O `CLAUDE.md` da raiz já vem no contexto; siga-o à risca — principalmente **nada contra o banco** (não há migration aqui).
- Para medir o site renderizado use Playwright/Chromium numa pasta temporária fora do repositório (sem adicionar dependência
  ao projeto). Se o navegador não rodar, siga com o HTML/CSS do Elementor e me diga o que ficou sem conferir.
- Subagentes podem pesquisar em paralelo; implementação e decisões de arquitetura ficam na conversa principal.
- Etapas, verificando cada uma (`bun test`, `tsc`): variante + cabeçalho/rodapé/botão flutuante → home → páginas do blog
  (categorias, blogs, arquivo, busca, post, 404, links, legais) → páginas de funil → editor, IA e docs.
- Não faça commit nem push sem eu pedir.

Você vai criar um **template novo** no Criador de Sites migrando **todas as páginas, layout, animações, hovers, carrosséis,
paginação e as mecânicas das páginas de funil** de **https://marketingraiz.com**. O resultado tem que ser **editável no
editor** (props por bloco com `fields`, posts/categorias do JSON do site), nunca HTML colado.

### Leitura obrigatória

1. `docs/development/site-builder.md` inteiro — variantes (`theme.variant`, CSS escopado, breakpoints 1024/767 repetidos sob
   `.sb-narrow`), `Block.fx`, runtimes (`fx-runtime.ts` com `data-sb-slider`/contador, `nav-runtime.ts` com `.sb-cslider` e popup
   de vídeo; subir `FX_VERSION`/`__sbNav` ao mudar), `whatsappFloat`, `categorySearch`, `safeUrl`, `cssUrl` sem `;`, páginas
   `bare`/`prose`.
2. `docs/development/project-scaffolding.md` se mexer em exports/workspaces.
3. Referências: `templates/marketplace/` (mesmo grupo SIM/Central do Marketing, conteúdo original, `brand.ts`/`images.ts`/
   `legal.ts`/`posts.ts`/teste), `templates/central-marketing/`, `templates/areaflix/` (carrossel com setas/bolinhas e FAQ).
4. **Se o template `seguidores-em-alta` já existir no repositório** (prompt em `plans/seguidoresemalta-prompt.md`), ele é do
   mesmo grupo e compartilha quase toda a estrutura das páginas internas (banner de título, "O que você procura?" com busca +
   select, grades do The Post Grid, cartões de blogs, carrossel de depoimentos com os mesmos 4 depoimentos, página do post com
   sidebar, página de links). **Generalize e reutilize esses blocos** (props novas opcionais) em vez de duplicar. Se não
   existir, crie os blocos de forma que o outro template possa reaproveitá-los depois.

### Inventário primeiro

Escreva `plans/marketingraiz-inventario.md` (formato de `plans/marketplace-inventario.md`) usando este prompt como base e
completando os **[medir]** no navegador em **1440 / 820 / 390 px** (menu mobile aberto; páginas de funil passo a passo).
Fontes: `/wp-json/wp/v2/{pages,posts,categories,media}` (42 posts, 4 categorias), `sitemap.xml`, e os CSS do Elementor em
`/wp-content/uploads/elementor/css/post-<id>.css`: kit **26** (é o kit padrão do Elementor — os estilos reais estão por
elemento), cabeçalho **4819**, rodapé **5422**, home **5293**, post **4885**, arquivo **4892**, busca **4908**, blogs **5302**,
categorias **5338**, links **6235**, termos **5253**, privacidade **5279**, funil: plano **811**, entrar-na-sala **832**,
história **1095**, solicitação **1566**, último passo **1622**, sala **1787**, liberação **2278**, quiz **3965**. O 404 usa um
template próprio — [medir] o id no HTML da 404.

### Nomes

- Template id **`marketing-raiz`**, nome **"Marketing Raiz"**, tags `["Blog", "Marketing", "Funil"]`.
- Variante **`theme.variant = "raiz"`**, CSS em `renderer/raiz.ts`, escopo **`.sb-mr`**, registrada no `SiteRenderer.tsx`.
- Blocos próprios em `blocks/raiz.tsx`, prefixo **`mr`**, exportados como `raizBlocks` (só o que não der para reaproveitar).
- Arquivos: `templates/marketing-raiz/{index.ts, brand.ts, images.ts, posts.ts, legal.ts, funnel.ts, marketing-raiz.test.ts}`.

### Conteúdo

- O site é da **SIM Intermediações** (mesmo grupo do Atlas): **use o conteúdo original do blog** — os **42 posts** (título,
  resumo, corpo, capa, categoria, data via API), as 4 categorias (Estudos, Funil de Vendas, Marketing, Vendas & Monetização),
  textos da home, depoimentos, links de produtos/blogs/redes e contatos. Marca/contatos/links em `brand.ts`; legais em
  `legal.ts`. Imagens podem apontar para o WordPress original por enquanto, todas centralizadas em `images.ts` e listadas em
  `plans/marketingraiz-imagens.md` como pendência de cópia para o storage.
- **Exceções (não copiar):**
  - A foto do hero vem do Unsplash ("hannah-wei-…-unsplash") — pode manter (licença Unsplash), registre o crédito.
  - **Imagens da série Prison Break** (`wallpaper-prison-break.png`, `wp9822230-lincoln-burrows-wallpapers.webp` e fundos do
    funil): são de terceiros — use placeholders escuros equivalentes (Unsplash ou gradiente) e registre a troca.
  - **Textos das páginas de funil**: o funil original vende um produto de apostas ("BetAi") com escassez fabricada ("isso não
    é uma estratégia de marketing", "solicitação pré-aprovada", "capacidade limitada") e a narrativa da série. **Reproduza só as
    mecânicas e o visual** (§6) com **textos de exemplo neutros** — sugestão: um quiz "Descubra seu perfil de vendedor" que leva
    a um e-book/LP do grupo — tudo editável em `funnel.ts`. Registre essa decisão no inventário.

---

## 1. Rotas

| Original | Template | Notas |
| --- | --- | --- |
| `/` (5293) | home | §3 — inclui a listagem paginada de todos os posts |
| `/page/2/`… `/page/5/` | paginação da grade da home | §3.6 |
| `/categorias/` (5338) | página `/categorias/` | §4.2 |
| `/blogs/` (5302) | página `/blogs/` | §4.3 |
| `/category/<slug>/` (4892) | `categoryLayout` | §4.4 |
| `/?s=` (4908) | página `/pesquisa/` com o filtro `?q=` do export | §4.5 |
| `/<slug-do-post>/` (4885) | `postLayout` | §4.6 |
| 404 | página `404` | §4.7 |
| `/links/` (6235, canvas) | `/links/` com `bare: true` | §4.8 |
| `/termos-de-uso/`, `/politica-de-privacidade/` | páginas legais (`prose`) | §4.9 |
| `/plano/`, `/sala/`, `/historia/`, `/entrar-na-sala/`, `/liberacao-de-disponibilidade/`, `/quiz-desafio-fraternidade/`, `/ultimo-passo/`, `/solicitacao-pre-aprovada/` (canvas) | 8 páginas `bare` de funil | §6 — mecânicas sim, copy do BetAi não |

Menu: **Categorias**, **Blogs** e externos **Central do Marketing**, **007SpyHacker**, **Seguidores em alta**, **Renovada**,
**Zyrion Brazil**, **Marketplace** (URLs em `brand.ts`; [medir] quais abrem em nova aba).

---

## 2. Global

### Cores

| Uso | Valor |
| --- | --- |
| Roxo de destaque (hover/ativo do menu, paginação, ícones sociais do rodapé, hover dos links do rodapé) | `#6617FF` |
| Fundo claro (cabeçalho, seções de carrossel) | `#F8F8F8` |
| Texto do título do banner | `#F8F8F8` (cor `cc5bcdf` do kit) |
| Resumo dos cards de post | `#2C495F` |
| Títulos escuros do post | `#1C244B`; legenda `#324A6D` |
| Linha do título de seção do TPG | `#2962FF` |
| Rodapé | fundo `#000`, títulos `#F7F9FF`, linha `#EAECF0` |
| Funil | fundo preto + foto escura, texto branco, botões **`#FAB837`** com texto preto, barra de progresso **`#88CA58`** |
| Botão flutuante | `#25D366`, hover `#1EBE5D` |

### Fontes

Roboto (menu e títulos padrão), **Nunito** (subtítulo do hero, cards, banners), **Poppins** (post), **Montserrat** (rodapé,
funil), **Work Sans** (botões do funil), **Trebuchet MS** (textos do quiz — fonte de sistema, use pilha com fallback), Inter
(botão flutuante). Adicione o que faltar em `SITE_FONTS`/`FONT_WEIGHTS` só com pesos existentes no Google Fonts.

### Componentes

- Contêiner 1200px (seções de carrossel 1250px; listagem 1216px). Breakpoints tablet ≤1024, celular ≤767 (sob `.sb-narrow` também).
- Não há animações de entrada do Elementor na home/blog — **não invente**. Efeitos: hovers, carrosséis, pulse e fades do funil.

---

## 3. Home (5293) — ordem das seções

### 3.0 Cabeçalho (4819) — `site.header` (bloco próprio ou `header` com variante)

- **Não é sticky.** Grade `auto 1fr`, fundo `#F8F8F8`, padding 20px, largura 1200px.
- Logo à esquerda, `max-width:222px`, centralizada verticalmente (celular: alinhada à esquerda).
- Menu à direita (`align-self:flex-end`): Roboto 600 [medir tamanho], preto; **hover/ativo `#6617FF`**; sem ponteiro.
- ≤1024px: hambúrguer 28px preto (sem borda) → **dropdown esticado** (largura total), itens com padding 12px 0, centralizados;
  hover/ativo com **fundo `#6617FF`** [medir cor do texto no hover]. Celular: logo à esquerda e hambúrguer à direita
  (`grid-auto-flow: column; justify-content: space-between`). Sem JS: checkbox, como `#sb-burger`.

### 3.0b Botão flutuante "Entre nas nossas comunidades" (em todas as páginas, inclusive funil)

HTML/CSS próprio do original — reproduza estendendo o bloco **`whatsappFloat`** existente (props: texto, link, cor, cor do
hover, texto do celular):
- `position:fixed; bottom:20px; right:20px; z-index:9999`; fundo `#25d366` → hover `#1ebe5d` (`transition: background .3s`);
  texto branco **bold**, padding `10px 16px`, raio 40px, `box-shadow: 0 4px 8px rgba(0,0,0,.2)`, Inter; ícone do WhatsApp em SVG
  branco 44×47px com 7px à direita; texto "Entre nas nossas comunidades" 14px.
- **≤600px**: vira círculo 48×48 (padding 12px, `border-radius:50%`) só com o ícone, e o texto aparece **fora do botão,
  acima dele** ("Entre nas nossas<br>comunidades"), `position:fixed; bottom:78px; right:20px`, cor `#25d366`, 600 12px,
  line-height 1.1, alinhado à direita.
- Link: `https://lp.centraldomarketing.com/comunidades-no-whatsapp/` (nova aba).

### 3.1 Hero — duas versões por tela (bloco **`mrHero`** com as duas variações embutidas, ou 2 blocos com `hidden` por tela)

**Desktop/tablet** (oculta no celular): seção com **foto de fundo** (Unsplash hannah-wei, `no-repeat`, [medir] posição/tamanho;
tablet `background-position: -167px 0`) e **véu `linear-gradient(360deg, #000000FA 27%, transparent 31%)` a 42%** (faixa escura
na base); largura 1200px; **padding 150px 0 100px**; colunas **66% / 33%** alinhadas embaixo.
- Esquerda: "ESQUEÇA O MARKETING NUTELLA!" **42px/600 branco** (Roboto), margem inferior 20px; "A verdade sobre como vender
  na internet" **Nunito 25/600 branco** (tablet largura ~490px; oculto no celular).
- Direita: **grade "hover" do The Post Grid (layout 1), 1 coluna, 2 posts** (Gatilhos Mentais; Marketing Digital Pode
  Transformar…): cartão com **imagem de 240px de altura**, **raio 5px**, `overflow:hidden`, véu
  `linear-gradient(180deg, transparent 0%, #000000ED 100%)` e o **conteúdo por cima, alinhado embaixo** (título em até 2 linhas
  + resumo curto ~17 palavras com "..."), espaçamento 8px (16px entre cartões). [medir o hover do TPG: zoom da imagem e/ou véu.]

**Celular** (oculta no desktop/tablet): mesma foto com `background-position: -229px -90px; background-size: 977px auto`, fundo
branco, **padding 290px 0 0**, título **42px/800**; a grade da direita está oculta no celular (no original ela mostra "No posts
found." — bug; não reproduza).

### 3.2 Melhores Post's + Últimas Novidades + banner lateral

Seção 1200px, padding 30px 0 50px, colunas **66% / 33%** com respiro de 15px.
- **Esquerda**, duas grades TPG com **título de seção estilo 1** (texto + linha `#2962FF`) [medir tipografia do título]:
  - "Melhores Post's" — layout 4, **2 colunas (celular 1)**, 2 posts (Renda Extra Online; Ganhando Leads): imagem 260px,
    título **22px/600, line-height 30px**, 2 linhas no máx., margem 10px abaixo; espaçamento 8px/16px.
  - "Últimas Novidades" — layout 1, 2 colunas, 2 posts mais recentes (mesma tipografia). Margem inferior −10px.
- **Direita**: banner (imagem clicável → `/plano/`, margin-top 57px — **troque a imagem de Prison Break por placeholder**) e
  ícones sociais **quadrados** (YouTube, Instagram) em 2 colunas, raio 5px, gap 7px, padding inferior 30px [medir cores].
  Crie um bloco **`mrPostGrid`** (ou reaproveite o `sgPostGrid`) que cubra todas as grades do site: layouts `hover`, `card`
  (layout 1), `side` (layout 4), colunas por tela, altura da imagem, título de seção com linha, resumo, paginação.

### 3.3 Carrossel de produtos + depoimentos — três versões por tela

Três seções iguais em conteúdo, uma por tela (desktop: fundo `#F8F8F8`, padding 50px 0; celular: fundo transparente, padding 0;
tablet: fundo `#F8F8F8`, padding 100px 0), largura 1250px. Em vez de 3 cópias, faça **um bloco responsivo** e só reproduza as
diferenças de medida. Cada uma tem:
1. **Media Carousel do Elementor, skin "slideshow"**: slide grande + **fileira de miniaturas embaixo** (proporção **21:9**,
   10px abaixo do slide), **efeito slide, velocidade 500ms, autoplay 5000ms, loop, pausa no hover, setas**; no celular o slide
   principal tem **altura 380px**; cada slide é imagem clicável para uma LP (desktop: habilidades de comunicação, e-book
   gatilhos mentais, InstaFanFortune, 757 Presets; celular/tablet: + e-book "como ganhar dinheiro na internet com 8 ideias") —
   lista editável (imagem, link). Clique na miniatura leva ao slide [medir comportamento e se a miniatura ativa muda de
   opacidade/borda].
2. **Carrossel de depoimentos** (Elementor Reviews): **setas, bolinhas, velocidade 500ms, autoplay 5000ms, loop, pausa no hover
   e após interação, 10px entre slides**, separador entre cabeçalho e texto, avatar, nome, **5 estrelas** (ícone `\e934`) e texto —
   os mesmos 4 depoimentos do Seguidores em Alta (Daniel Santos, Yasmin, Elissandra Gama, João Gabriel). [medir slides por tela,
   cores do cartão/estrelas/setas.]
Implemente sobre o fx-runtime/NAV_RUNTIME (`data-sb-slider`, `.sb-cslider`), estendendo para "miniaturas sincronizadas" se
preciso; no editor tudo parado no 1º slide.

### 3.4 Listagem de todos os posts (seção "branca")

Contêiner 1216px, **min-height 100vh** (celular 145vh), padding-top 90px (tablet 40px; celular 80px, padding-bottom 97px),
laterais 24px.
- Linha: **busca** à esquerda (margin-top 15px) e **select "Categorias:" / "Selecionar categoria"** à direita (navega para a
  categoria) — reaproveite/estenda `categorySearch` (layout `compact`).
- **Grade TPG layout 1, 3 colunas (tablet 2, celular 1), 10 por página**: cartão raio 10px, **imagem com altura 200px** e raio 10px,
  margem 10px abaixo; título **Nunito 18/700/120%**; resumo **Nunito 16/500 `#2C495F`** (~30 palavras com "..."); margem inferior 50px.
- **Paginação numerada centralizada** (5 páginas no original): itens colados com **pontas arredondadas (raio 16px no primeiro e
  no último)**, **ativo e hover: fundo `#6617FF`, texto branco, borda `#6617FF`**. No export estático, gere as páginas
  `/page/2/`… ou pagine no navegador (sem JS mostra tudo) — decida e registre.

### 3.5 Rodapé (5422) — `site.footer`

Fundo `#000`, padding 100px 0 50px, coluna centralizada com gap 50px:
- Linha (min-height 160px; tablet em coluna e centralizada): **logo** (100% da coluna) | **"Outras Opções"** (20%: "AJUDE:
  Fundação Afif Arão", "Igreja Renovada") | **"Políticas e Termos"** (20%: Termos de Uso, Política de Privacidade) | coluna com
  título [medir — parece vazio] e links "Seguidores em Alta", "Zyrion Brasil" | **"Redes Sociais"** (ícones em **círculo fundo
  `#6617FF`, ícone branco 16px, padding 12px, gap 5px** — celular 14px/10px: Threads, X, TikTok, Kwai/vídeo, Facebook) +
  **"Fale conosco"** (e-mail).
- Títulos **Montserrat 20/600, line-height 20px, `#F7F9FF`**; listas com texto e ícone brancos 14px, **hover do texto `#6617FF`
  (transição .3s)**.
- Barra final: borda superior 1px `#EAECF0`, padding-top 30px, "© Marketing Raiz - Todos os direitos reservados. Proibida
  reprodução não autorizada." **Montserrat 14/400/24px branco**, centralizado.

---

## 4. Páginas do blog

### 4.1 Banner de título (reaproveite `sgTitleBanner` se existir)

Mesmo componente do Seguidores em Alta: caixa com foto de fundo (Categorias: `categoria.jpeg`; outra: `06_result.webp` [medir
qual página usa cada uma]), raio 25px, véu 50% [medir cor], caixa interna 70%, título **Nunito 80/700/120% `#F8F8F8`** (tablet 55;
celular 45). Seguido de "O que você procura?" **Roboto 40/900 preto** (celular 30) e da linha **busca + select de categorias**.
[medir margens — no Seguidores o banner tem margin-top 150px por causa do cabeçalho absoluto; aqui o cabeçalho não é absoluto.]

### 4.2 `/categorias/`

Banner "Categorias" → "O que você procura?" → busca + select → **grade de categorias 4 colunas (tablet 2, celular 1)**: cartão
com imagem (opacidade 1, transição .5s, sem raio) e nome **24px branco** por cima/abaixo [medir layout exato e hover]. Itens:
Monetização e Vendas, Marketing, Estudos, Funil de Vendas [medir os 4 e imagens]. Link para `/category/<slug>/`.

### 4.3 `/blogs/`

Banner "Blogs" → busca + select → cartões dos blogs do grupo (Central do Marketing, Seguidores em Alta, Renovada, 007SpyHacker,
Zyrion Brazil… [medir lista, links e estilo]) — reaproveite `sgBlogCards`.

### 4.4 Arquivo de categoria (4892)

Espaçador → busca + select → "Categoria:" + nome da categoria + botão **"Voltar"** (há uma versão desktop e outra mobile —
reproduza com responsivo, não duplicado) → **cards de arquivo** com badge da categoria, título e **"Leia mais »"** [medir
colunas, paginação/"carregar mais" e estilo].

### 4.5 Busca (4908) — `/pesquisa/`

Busca + select → "Resultado da pesquisa:" + "Voltar" → cards iguais ao arquivo filtrados por `?q=` (só posts) → espaçador.

### 4.6 Post (4885)

Mesmo layout do Seguidores em Alta: grade **`1fr 300px`** (celular 1 coluna); imagem destacada **530px** de altura (tablet 470;
celular 250) `object-fit:cover`, `brightness(105%)`; categoria **Poppins 16/300 MAIÚSCULAS letter-spacing 10px** (tablet 14);
título **Poppins 40/600, line-height 1em, `#1C244B`** (tablet 30; celular 23); data Poppins 16/300; conteúdo Poppins [medir];
título extra **Roboto 59/600/1.2 `#1C244B`** (tablet 45; celular 24) e legenda Poppins 16/300 `#324A6D` [medir onde aparecem —
provável bloco de chamada no fim do post]; **sidebar sticky (`top:0`)** [medir conteúdo]. CSS global do site para o corpo dos
posts: títulos h1–h6 do conteúdo com `margin-top:1.5em; margin-bottom:calc(.5em + 10px)`; parágrafos com `margin: 1.5em 0`.

### 4.7 404

Espaçador → imagem [medir] → "Ops.. Parece que essa página não existe mais. Lamentamos por isso." → "Últimas postagens:" + lista
dos **5 posts mais recentes** (Elementor posts classic) → "Você pode também:" + botões **"VOLTAR PARA PÁGINA PRINCIPAL"** e
**"CONHECER A FUNDAÇÃO QUE AJUDAMOS"** [medir estilos e link da fundação].

### 4.8 `/links/` (`bare`)

Link in Bio: "Marketing Raiz", "A verdade sobre como vender na internet.", botões **Conteúdo Gratuito**, **Comunidades**,
**Marketplace** [medir links, fundo, cores, hover]. Reaproveite `sgLinkBio`.

### 4.9 Legais

Termos de Uso e Política de Privacidade com texto original parametrizado em `legal.ts`, layout `prose` [medir largura/tipografia].

---

## 5. Blocos (resumo)

| Bloco | Faz |
| --- | --- |
| cabeçalho (variante) | logo + menu + dropdown roxo |
| `whatsappFloat` (estendido) | pílula verde com texto; círculo + texto acima no celular |
| `mrHero` | hero com véu na base, título/subtítulo e grade "hover" de 2 posts; versão celular |
| `mrPostGrid` / `sgPostGrid` | grades do TPG (hover, card, side) com título de seção com linha e paginação |
| `mrShowcase` | carrossel de mídia com miniaturas 21:9 + carrossel de depoimentos |
| `mrFooter` | colunas, ícones roxos, copyright |
| `mrFunnel*` | mecânicas do funil (§6) |
| reaproveitados | `categorySearch`, banner de título, cartões de blogs, cards de categoria, post, link bio |

Todos com `fields` em português, defaults do original, `data-mr="<tipo>"` e filhos estáveis.

---

## 6. Páginas de funil (canvas, `bare: true`) — **mecânicas e visual, com textos neutros**

Visual comum: página escura (fundo `#000` + foto escura em `cover` — use placeholder no lugar das imagens da série), texto
branco centralizado, botões **`#FAB837`** com texto preto, raio 5px, Work Sans 20/400 com padding `18px 60px` (CTA final 600 com
`15px 50px`; botões do vídeo Montserrat 20/700), hover mantém `#FAB837` [medir]. Todas têm o botão flutuante. Nenhuma usa
cabeçalho/rodapé.

Crie em `blocks/raiz.tsx` blocos genéricos, todos com JS **vanilla** no fx-runtime (o original usa jQuery 3 + Bootstrap 4 do CDN —
**não carregue jQuery/Bootstrap**); sem JS, tudo aparece empilhado e utilizável:

1. **`mrVsl` — vídeo com botão atrasado** (páginas `/plano/` e `/sala/`):
   título Montserrat 45/700 branco (tablet 25; celular 18) + subtítulo ("Entenda em menos de 2 minutos…"), **vídeo do Vimeo**
   com `title=0&portrait=0&byline=0` (o original troca os parâmetros por script — gere a URL já limpa) e um **botão escondido
   que aparece com fade lento depois de N segundos** (`/plano/`: **90s**, `/sala/`: **30s**; prop `delaySeconds`) e então
   **pulsa**: `animation: pulse .7s infinite alternate` (`@keyframes pulse { 0% { transform: scale(1) } … }` — [medir a escala
   final, tipicamente 1.05–1.1]). No editor o botão aparece. Link para a próxima página.
2. **`mrSteps` — história em telas** (`/historia/`): sequência de "telas" (texto Montserrat 18/600, line-height 19px, branco;
   tablet 17, celular 16) cada uma com botão "Continuar..."; clicar faz **fade-out lento (~600ms) da tela atual e fade-in da
   próxima**; a última leva à próxima página. Lista de telas editável (texto rico simples + rótulo do botão).
3. **`mrQuiz` — quiz com barra de análise** (`/entrar-na-sala/`, `/liberacao-de-disponibilidade/`, `/quiz-desafio-fraternidade/`):
   tela de abertura (texto + "COMEÇAR"/"Sim, continuar...") → perguntas, cada uma com várias respostas em botões (qualquer
   resposta avança, com o mesmo fade) → **tela "analisando"**: título + **barra de progresso arredondada** (altura 15px, largura
   90%, raio 50px no trilho e 20px na barra, **listrada e animada**, cor `#88CA58`, texto "N%" dentro) que **começa em 5% e soma
   3,7% a cada 250ms até 100%**, então tira as listras, mostra **"Concluído!"** e, **2s depois**, troca (fade) para a **tela final**
   com mensagem e botão CTA. Textos das perguntas em Trebuchet MS 24/300, letter-spacing .5px, branco (celular 17px); título da
   tela final 24/600. Props: perguntas (texto + respostas), textos de carregamento, velocidade, mensagem final, CTA. O quiz de
   `/quiz-desafio-fraternidade/` tem também um título e imagem só no celular ("Está preparado?").
4. **`/ultimo-passo/`**: lista de vantagens com "✓" + botão que revela uma segunda tela (mesmo fade) com texto e botão para a
   página externa do produto. Monte com `mrSteps` (sem barra) ou um modo "checklist". Título Roboto 25/600 `#6EC1E4`.
5. **`/solicitacao-pre-aprovada/`** → no template, **página de captura de e-mail neutra** (título Montserrat 24/700 branco,
   campo "Digite seu melhor e-mail", botão largura total). Site estático: o formulário envia para uma **URL configurável**
   (prop, ex.: ferramenta de e-mail marketing) ou fica desabilitado no editor com aviso — não invente backend.

Encadeie as 8 páginas como no original (plano → entrar-na-sala → sala → história → liberação → solicitação; quiz e último passo
avulsos) com os textos neutros de `funnel.ts`, e documente no guia como reaproveitar os blocos de funil em qualquer site.

---

## 7. Editor, IA e documentação

- Todos os campos no inspetor; listas (slides, miniaturas, depoimentos, perguntas/respostas, telas da história, links) com
  adicionar/remover/reordenar. No canvas: carrosséis parados, botões atrasados visíveis, quiz mostrando todas as telas em
  sequência (ou um seletor de "tela em edição"), barra de progresso estática.
- Atualize **`packages/site-builder/src/ai/guide.ts`** (botão flutuante, hero, carrossel de produtos, paginação, blocos de
  funil: vídeo com botão atrasado, história em telas, quiz com barra) e, se a IA puder operar algo novo (ex.: editar perguntas
  do quiz, atraso do botão), **`src/ai/tools.ts`**.
- Atualize **`docs/development/site-builder.md`** com a variante `raiz` e o template `marketing-raiz` (nível de detalhe das
  entradas `marketplace`/`areaflix`), runtimes alterados e versões, pendências (imagens no WP original, placeholders no lugar
  das imagens da série, formulários sem backend).
- Registre em `templates/index.ts` com `preview`.

## 8. Testes e verificação (obrigatório)

`templates/marketing-raiz/marketing-raiz.test.ts` (bun test), no mínimo:
- aparece em `listTemplates()`; passa no `siteSchema` e no schema de **todos** os blocos (header, páginas, footer, postLayout,
  categoryLayout); ids únicos; menu válido; slugs sem colisão;
- export estático: home contém `sb-mr`, botão flutuante, hero com 2 posts, carrossel com miniaturas e os links das LPs, 4
  depoimentos, grade com paginação; 42 posts e 4 categorias presentes; páginas de funil `bare` sem cabeçalho/rodapé, com o botão
  atrasado (`delaySeconds` 90 e 30), quiz com a barra de progresso; nenhuma página contém `undefined` nem "Bloco desconhecido";
- **nenhum texto do funil original aparece** ("BetAi", "pré-aprovada", "não é uma estratégia de marketing", "Michael") e nenhuma
  imagem da série é referenciada.

Rodar e deixar limpo:
```
bun test packages/site-builder
cd frontend; ..\node_modules\.bin\tsc --noEmit
.\node_modules\.bin\biome check --write <só os arquivos criados/alterados>
npm run build
```

Compare a prévia (`/criador-de-sites/novo/marketing-raiz` e o editor) com o original em 1440/820/390: cabeçalho e dropdown roxo,
botão flutuante (pílula no desktop, círculo + texto acima no celular), hero nas duas versões, grades e títulos de seção com linha
azul, carrossel com miniaturas 21:9 (5s/500ms), depoimentos com setas e bolinhas, paginação roxa, rodapé, páginas internas, e no
funil: botão que aparece após 90s/30s e pulsa, fades entre telas, barra de 5%→100% em passos de 3,7%/250ms, "Concluído!" e troca
após 2s.

Entregue: lista de arquivos, o que ficou diferente do original e por quê, e os itens **[medir]** que você confirmou.
