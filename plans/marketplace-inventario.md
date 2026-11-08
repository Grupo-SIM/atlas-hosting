# Marketplace Central do Marketing → Criador de Sites: inventário (Etapa 1)

Fonte: https://marketplace.centraldomarketing.com/ (WordPress 6 + Elementor 4.3 / Pro Elements, Element Pack Lite,
Premium Addons, Selection Lite "crawler"), levantado em 2026-11-08 pela REST API (`/wp-json/wp/v2/{pages,posts,categories,media}`),
`sitemap.xml`/`wp-sitemap.xml`, CSS do Elementor (`post-36` kit global, `post-63` cabeçalho, `post-67` rodapé, `post-873` home) e DOM
renderizado (Playwright/Chromium) em 1440 / 820 / 390 px, com o menu mobile aberto. Screenshots ficaram fora do repositório
(pasta temporária da sessão): 10 rotas × 3 larguras + menu aberto + recortes em resolução real.

## 1. O que o site é

Uma **vitrine** de produtos digitais do grupo (cursos, e-books, sistemas, serviços) com páginas de parceiros. **Não há** carrinho,
checkout, login, formulário, comentários nem preço. Cada "produto" é um *post* do WordPress cujo conteúdo é só um `<iframe>`
(plugin *iframe*, 900 px de altura) com o site externo do produto, entre cabeçalho e rodapé.

| Tipo | Rota | Observação |
| --- | --- | --- |
| Página | `/` (Marketplace, id 873) | landing — §3 |
| Página | `/produtos/` | banner de título + busca/select + grade de 16 produtos |
| Página | `/categorias/` | 8 cartões de categoria + 4 "tipos de produto" |
| Página | `/blogs/` | 6 cartões de blogs parceiros (links externos) + "Powerd by" |
| Página | `/politica-de-privacidade/`, `/termos-de-uso/` | banner de título + texto + botão "Voltar" |
| Post (produto) | `/<slug>/` (16) | só o `iframe` do site do produto |
| Categoria | `/category/<slug>/` (9, uma vazia) | banner com o nome + busca/select + grade (imagem + título) |
| Busca | `/?s=` | banner "Resultado da pesquisa" + busca/select + grade |
| 404 | qualquer rota | cartão "Página não encontrada!" + letreiro "DESCULPE · PÁGINA NÃO ENCONTRADA" |

Categorias (API): Sistemas 7, Marketing 6, Cursos Profissionalizantes 2, Desenvolvimento Pessoal 1, Dinheiro e Finanças 1, Outros 1,
Serviços 1, Saúde e Fitness 0 ("Sem categoria" não entra). Produtos com mais de uma categoria: Seo Pack (Marketing, Sistemas) e
Habilidades de Comunicação (Cursos, Desenv. Pessoal, Marketing).

## 2. Decisões sobre o que é dinâmico

| Funcionalidade | No original | No template |
| --- | --- | --- |
| Busca (`/?s=`) e select de categoria | busca do WordPress | página `/pesquisa/` + filtro no navegador que o export estático já tem (`?q=`, `?category=`) — bloco `categorySearch` existente |
| Página do produto | `iframe` do site externo | **bloco novo `siteEmbed`** (URL, altura, título e link "abrir em nova aba", porque vários sites bloqueiam iframe com `X-Frame-Options`) |
| Contagem "(N)" nas categorias da home | texto fixo (desatualizado: diz Marketing 5, Serviços 2) | contada dos produtos publicados (`categoryGrid.showCount`) |
| Produto em várias categorias | taxonomia múltipla | o modelo tem uma categoria por post: Seo Pack → Sistemas (como na página da categoria), Habilidades → Desenvolvimento Pessoal |
| "Resolvit" no ranking "Mais quentes" | link para `/resolvit/`, que **não existe** (404) | item mantido, link para `/produtos/` |
| Vídeo "Por que somos os melhores?" | lightbox do Elementor (Vimeo 1088198038) | popup de vídeo existente (`data-sb-video`, `nav-runtime`) |
| Carrinho, checkout, login, formulários | não existem | fora do escopo |

## 3. Global

**Cores** (kit `post-36`): fundo `#111111`, título/primária `#FFFFFF`, secundária `#BBBBBB`, texto `#969696`, destaque `#FCB808`
(amarelo), rosa `#F9075E`, bordas `#424242`, superfícies `#1B1B1B` / `#161616`, item de menu ativo `#FF7C03`. **Gradiente da marca:**
`linear-gradient(150deg, #FCB808 5%, #F2295B 80%)` (botões, etiquetas, play). **Fontes:** *Sora* 600 (títulos, menu, botões, hero) e
*Roboto* 400/600 (corpo). Tamanhos: hero 45/49.5, título de seção 38/43.7, título de cartão 21/27.3, corpo 17/23.8, menu 15/19.95,
letreiro 200/180 (90 no tablet, 60 no celular). **Breakpoints Elementor:** celular ≤ 767, tablet ≤ 1024 (o kit tem ainda 1200 e 1400
para ajustes finos). Contêiner 1400 px + 20 px de borda.

| Elemento | Desktop | ≤ 1024 |
| --- | --- | --- |
| Cabeçalho (109 px, **sticky**, fundo `#111`, borda inferior `#2a2a2a`) | logo 70 px à esquerda (≈ 22% da largura), menu "Produtos / Categorias / Blogs" à direita (Sora 15/600 branco, ativo `#FF7C03`) | logo + hambúrguer branco à direita |
| Menu mobile (off-canvas) | — | gaveta à **direita**, 50% da largura, fundo `#242424`, véu `rgba(0,0,0,.8)`, entra com `slideInRight`; logo grande no topo e itens centralizados |
| Rodapé | linha `#2a2a2a`; logo grande (≈ 190 px) / "Menu" / "Políticas e Termos" (Sora 19/600 + links Roboto 15 `#BBB`); linha; "© SIM Intermediações — Todos os direitos reservados." centralizado `#969696` | colunas empilhadas |

**Botões:** `15px 35px`, raio 10, Sora 15/600 branco; primário com o gradiente, secundário transparente com borda `#424242`; hover:
gradiente some e a borda fica `#FCB808`; animação `push` do Elementor (encolhe e volta, 0,3 s).
**Cartões:** borda 1 px `#424242`, raio 10, 20 px de respiro; hover: borda `#FCB808` (transição 0,3 s).

## 4. Home — seções na ordem

| # | Seção | Conteúdo | Bloco | Efeitos |
| --- | --- | --- | --- | --- |
| 1 | Cabeçalho | logo, menu | `header` + variante `marketplace` | sticky |
| 2 | Hero (1005 px) | foto vertical 600 px com faixa em gradiente inclinada −3° atrás; textura de estrelas no fundo; 2 linhas decorativas; h2 "Tudo o que você precisa…", parágrafo, botões "Explorar" e "Ver produtos". No tablet/celular a foto some | **FALTA** → `mkHero` | coluna de texto `fadeInUp`; faixa `fadeIn` 700 ms; linhas decorativas `rotateIn` + seguem o mouse (Motion FX `mouseTrack`, 0,3, sentido inverso) |
| 3 | "TOP Produtos 💥" | 3 cartões altos (foto de fundo, véu escuro embaixo, etiqueta em gradiente, título, texto, pílula com avatar + "Adquirir agora") | `heading` + **FALTA** → `mkCards` | `fadeInUp` na fileira; hover: borda amarela |
| 4 | "Mais quentes 🔥" | ranking 01–10 em 2 fileiras de 5 (número, miniatura redonda com 🔥, nome) | **FALTA** → `mkRank` | `fadeInUp` por fileira só no desktop |
| 5 | "Categorias 🚀" | 8 fotos quadradas 310 px (raio 10) com legenda "emoji Nome (N)" | `categoryGrid` (novos `labelStyle: caption` e `showCount`) | — |
| 6 | Letreiro | "MARKETPLACE · CENTRAL DO MARKETING" em amarelo, Sora 200, rolando 55 s | **FALTA** → `textMarquee` | CSS puro, parado no editor |
| 7 | Tipos | 4 colunas: ícone laranja, título, texto (Cursos, E-books, Sistemas, Outros) | `featureGrid` (estilo `icon`, 4 colunas) + CSS da variante | `fadeInUp` |
| 8 | "Por que somos os melhores? ⚡" | imagem 1400×600 arredondada com play em gradiente no centro (abre vídeo) | **FALTA** → `mkVideo` | parallax no fundo (`translateY` negativo, velocidade 5) |
| 9 | "Parceiros:" | 6 cartões iguais aos do TOP (blogs externos, "Acessar") | `mkCards` | `fadeInUp` por fileira |
| 10 | "Powerd by:" | logo SIMINT (link simintermediacoes.com) | `text` + `image` (novo `url`) | — |
| 11 | Rodapé | ver §3 | `ctFooter` (reuso, CSS da variante) | — |

## 5. Demais páginas

| Página | Seções | Cobertura |
| --- | --- | --- |
| `/produtos/` | banner de 3 painéis (foto 3D à esquerda, caixa `#1B1B1B` com h1 no meio, foto à direita; no celular só a caixa); busca + "Categorias" (select) à direita; grade 3 col de produtos (imagem 16:9 raio 10, título Sora 18, "Ver mais »") | **FALTA** `mkBanner`; `categorySearch` (`compact`); `postList` novo `cardStyle: product` |
| `/categorias/` | 8 cartões (foto com etiqueta em gradiente no canto, borda + 20 px), 4 por linha; os 4 tipos | `categoryGrid` (`labelStyle: tag`); `featureGrid` |
| `/blogs/` | 6 cartões de parceiros; "Powerd by" + SIMINT | `mkCards`; `text` + `image` |
| `/category/:slug` | banner com o nome; busca/select (categoria marcada); grade (imagem + título 21, sem "Ver mais") | `mkBanner` (título vazio = categoria); `categorySearch`; `postList` (`product`, sem botão) |
| Busca | igual, título "Resultado da pesquisa" | página `/pesquisa/` |
| Produto | `iframe` 100% × 900 | `siteEmbed` no corpo do post; `postLayout` = `postContent` |
| Políticas/Termos | banner; texto 1140 px (Roboto 15, h2 Sora 24), listas; botão "Voltar" | `mkBanner`; `heading`/`text`; `button`; página `prose` |
| 404 | cartão com textura e ilustração "404" apagada à direita; h1, 2 parágrafos, botão "Página inicial"; letreiro amarelo | `mkHero` (`layout: error`) + `textMarquee` |

## 6. Efeitos e o que falta no `fx`

Suportados hoje: `fadeIn`, `fadeInUp`, `fadeInDown`, atraso, parallax. **Faltam** (estender `model/fx.ts` + `fxCss` + `fx-runtime.ts`):

- entrada `rotateIn` (Elementor: gira −200° e aparece) — linhas decorativas do hero;
- `mouse` (seguir o mouse, −10..10; Motion FX *mouse track*) — linhas decorativas do hero;
- hover `push` (encolhe para 0,8 e volta) — botões.

Hover de cartão (borda amarela) e de botão (troca de fundo/borda) são estilo da variante. Off-canvas `slideInRight`: CSS da variante.
Nada de contador, carrossel de cartões ou setas no site.

## 7. Decisão sobre blocos novos (regra dos 90%)

Nenhum bloco existente chega a 90% para hero com foto inclinada, cartões altos com etiqueta + pílula de avatar, ranking numerado,
letreiro de texto, banner de 3 painéis, capa de vídeo com play e o `iframe` do produto. Os blocos da variante `central` (`ctHero`,
`ctSplit`, `ctBanner`) têm outra estrutura e não foram usados (regra: nada copiado de outros templates).

| Bloco novo | Cobre | Props (resumo) |
| --- | --- | --- |
| `mkHero` | hero da home, 404 | `layout` (`hero`/`error`), título, texto, 2 botões, foto, faixa em gradiente, textura, 2 imagens decorativas |
| `mkCards` | TOP Produtos, Parceiros, Blogs | colunas, avatar da pílula, itens (imagem, etiqueta, título, texto, rótulo, link) |
| `mkRank` | Mais quentes | selo (emoji), colunas, itens (imagem, título, link); números automáticos |
| `textMarquee` | letreiro da home e do 404 | frases, separador, duração, cor, tamanhos por tela |
| `mkBanner` | títulos de produtos, categoria, busca, políticas | título (vazio = nome da categoria), fotos da esquerda/direita |
| `mkVideo` | Por que somos os melhores? | imagem, vídeo (YouTube/Vimeo, popup), texto do play |
| `siteEmbed` | página do produto | URL, altura, título, texto do link |

Extensões de blocos existentes (opcionais, defaults iguais ao comportamento atual): `image.url`, `categoryGrid.labelStyle`/`showCount`,
`postList.cardStyle: product` (+ `PostCard variant="product"`), `header` (`aria-current` no item ativo e var `--sb-logo`). Fonte *Sora*
em `SITE_FONTS`. Variante `marketplace` (`renderer/marketplace.ts`, escopo `.sb-mk`).

## 8. Diferenças aceitas desde já

- Imagens: placeholders (Unsplash + SVG gerado para logo e SIMINT) — originais listadas em `plans/marketplace-imagens.md`, aguardando aprovação.
- Ícones dos 4 tipos: ícones de traço do editor em laranja (o original usa Font Awesome sólido).
- Ranking: miniaturas são as capas dos produtos; o selo 🔥 é emoji (o original usa `fire-logo.webp`).
- Página de produto: os sites externos que recusam `iframe` aparecem em branco no original e no template; o template mostra o link para abrir.
