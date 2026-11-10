# Seguidores em Alta → Criador de Sites: inventário (Etapa 1)

Fonte: https://seguidoresemalta.com (WordPress + Hello Elementor + Elementor/Pro + ElementsKit Lite + The Post Grid +
Sticky Header Effects + Header Footer Elementor), levantado em 2026-11-10 pela REST API (`/wp-json/wp/v2/*`), HTML da home e
CSS do Elementor (`post-7`, `441`, `62`, `12`, `409`, `424`, `434`, `444`, `446`, `620`, `837`, `804`, `797`).
**Sem navegador headless nesta máquina** (Playwright/Chromium não instalado): o que depende de medição renderizada
(1440/820/390, menu aberto, rolagem) está marcado **[pendente]** e será conferido na etapa de comparação lado a lado.

## 1. Conteúdo (API)

**10 posts** (todos publicados, `categories` = 1 por post, exceto onde indicado):

| Slug | Categoria | Tag | Data |
| --- | --- | --- | --- |
| comprar-seguidores-como-funciona-e-beneficios | Redes Sociais | — | 2026-01-08 |
| videos-curtos-nova-tendencia-para-engajamento | Criação de Conteúdo | — | 2026-01-06 |
| reels-para-empresas-descubra-como-transformar | Monetização e Vendas | — | 2025-11-22 |
| como-apagar-sugestoes-e-pesquisa-do-instagram | Redes Sociais | melhores-posts | 2025-11-22 |
| como-vender-no-instagram-estrategias-de-venda | Redes Sociais | melhores-posts | 2025-11-22 |
| ganhar-seguidores-no-instagram-melhores-dicas | Crescimento Rápido | posts-mais-pesquisados | 2025-11-22 |
| como-aproveitar-o-modo-silencioso-desativando | Redes Sociais | posts-mais-pesquisados | 2025-11-22 |
| como-fazer-uma-bio-no-instagram-passo-a-passo | Criação de Conteúdo | melhores-posts | 2025-11-22 |
| como-aumentar-o-alcance-dos-stories-para-20k | Ferramentas | posts-mais-pesquisados | 2025-11-22 |
| ganhar-dinheiro-no-instagram-monetizar-perfil | Segurança* | posts-mais-pesquisados | 2025-11-21 |

\* a API devolve `cats [20]` (Segurança) para este post, mas o prompt cita "Monetização e Vendas" para ele — a categoria vale a da API.
(Ids 16/19/20 etc. conferidos em `cats.json`.) Cada corpo tem ~21–28 mil caracteres de HTML.

**8 categorias:** Branding e Marca (0 posts), Crescimento Rápido, Criação de Conteúdo, Ferramentas, Monetização e Vendas,
Novidades e Atualizações (0), Redes Sociais, Segurança. As duas vazias existem no original: ficam no template (o grid de
categorias do original mostra 6 cards — **[pendente]** quais).

**Tags → grades:** `posts-mais-pesquisados` (4 posts) alimenta §4.3; `melhores-posts` (3 posts) alimenta §4.7 — viram lista
explícita de slugs no bloco.

**Páginas:** 12 (home), 620 `todos-os-posts`, 446 `blogs`, 444 `categorias`, 837 `links`, 804 `termos-de-uso`,
797 `politica-de-privacidade`.

## 2. Confirmado pelo CSS/HTML

- Kit 7: cores, fontes e tamanhos do prompt conferem. Line-heights: h1 `1.3em`, h2/primary `1.3em`, secondary (h3) `1.4em`,
  text `1.8em`, `04aefa7` (palavra destacada/contadores) e `ab782fd` `0.8em` (75px), accent sem line-height.
- Contadores: `data-duration="2000"` (2000 ms) — confere.
- Header usa o plugin *Sticky Header Effects for Elementor* 2.2.3 (`she-header.js`); opções exatas (60px, hide on scroll) vêm do
  prompt, duração/curva da animação **[pendente]**.
- Lottie (ElementsKit) e Reviews (Swiper do Elementor Pro): os `data-settings` não estão no HTML estático (renderizados por
  JS) → **[pendente]** loop/autoplay/velocidade e slides por tela; usar os padrões do prompt (autoplay 5000 ms, 500 ms).

## 3. Decisões

| Tema | No original | No template |
| --- | --- | --- |
| Busca / select de categoria | WP `?s=` / Elementor Search | `categorySearch` existente + página `/pesquisa/` (`?q=`) |
| Tag `melhores-posts` / `posts-mais-pesquisados` | taxonomia | lista de slugs no bloco `sgPostGrid` |
| Lottie | ElementsKit | bloco genérico `lottie` + runtime sob demanda (`lottie_light` de CDN fixado) |
| Cabeçalho que some/volta | Sticky Header Effects | classes `is-scrolled`/`is-hidden` no `NAV_RUNTIME` |
| Parallax fixo dos depoimentos | `background-attachment: fixed` ≥ 1025px | CSS puro |
| Carregar mais (arquivo/busca) | JS do TPG | script curto no fx-runtime; sem JS mostra todos |
| 404 | tela padrão do tema | página 404 no visual do template (banner "404" + busca + botão) |
| Imagens | WordPress original | URLs do WP em `images.ts`; pendência em `plans/seguidoresemalta-imagens.md` |
| Banco | — | **nenhuma migration** |

## 4. Pendências de medição (browser)

Hover/efeito do TPG na imagem, destino e cor do véu dos banners, "Voltar", paginação (itens por página), sidebar do post
(imagem sticky + link), links do `/links/`, destinos do rodapé ("Outras Opções"), cores do carrossel, hover dos cartões de
blogs, 2º elemento com `float`, tablet/celular das Lotties. Serão fechados na comparação lado a lado.

## 5. Fechado na implementação (2026-11-10, Chromium em 1440/820/390 sobre o HTML exportado)

- **Resolvido pelo HTML/CSS do original:** os 8 cartões de `/categorias/` e suas imagens; as 4 redes da colagem
  (Kwai, Instagram, YouTube, TikTok); os 5 produtos e links; as 3 tags (`melhores-posts` = apagar sugestões, vender,
  bio; `posts-mais-pesquisados` = ganhar seguidores, modo silencioso, stories, ganhar dinheiro); destinos do rodapé e
  do menu (todos externos em nova aba); `/links/` (3 botões + redes); avatares e fundo dos depoimentos.
- **Verificado no navegador:** cabeçalho transparente → branco após 60 px, some ao descer e volta ao subir; menu em
  dropdown ≤ 1024; contadores (+420%, 1,119+, 100%, 365); "carregar mais"; filtro `?q=`; sidebar sticky (top 100 px).
- **Ainda aproximado (sem como medir sem o JS do original):** loop/velocidade das Lotties, slides por tela do carrossel
  (2/1/1), distribuição exata da colagem de logos, hover dos cartões de blogs, véu dos banners (preto 50%), shadow/curva
  do cabeçalho.
- **Achado:** `Social-Bubble.json` do WordPress original não manda CORS — a Lottie de baixo só toca depois de copiar o
  JSON para o storage (`plans/seguidoresemalta-imagens.md`).
