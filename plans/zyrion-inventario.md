# Zyrion → Criador de Sites: inventário (Etapa 0, em andamento)

Fonte: https://zyrionbrazil.com (WordPress + Elementor), levantado em 2026-11-10 pela REST API
(`/wp-json/wp/v2/{categories,pages}`), HTML/CSS inline do Elementor e DOM renderizado
(Playwright/Chromium headless em 1440 / 820 / 390 px). Screenshots e JSON de medidas ficam fora do repositório.
O resto das medidas continua no `plans/zyrion-prompt.md` (cores, tipografia, seções); este arquivo só registra
**o que foi conferido** e **o que corrige o prompt**.

## Conferido / corrige o prompt

| Item [medir] | Resultado |
| --- | --- |
| Largura do contêiner "boxed" | **1280px** (não 1140): cards da grade escura têm 419px × 3 + 2 × 12px = 1280, começando em x=80 no viewport de 1440 |
| Alturas das faixas da home em 1440 | barra superior 38px, barra principal 104px (sticky), banner 1 142px (padding-top 20) |
| Cabeçalho no celular (390) | barra superior 34px (padding 0 20), barra principal 66px; a barra principal vira `position: fixed` ao rolar (o Elementor clona o elemento sticky) |
| Padding lateral das seções (390) | 16px (hero, "Em alta", grade escura, "Mais novidades"); 8px na faixa do ticker; 20px no cabeçalho |
| `e-animation-grow` | está nos **ícones sociais do cabeçalho** (scale 1.1 em .3s), não no botão "Faça parte" |
| Imagem de fundo do arquivo de categoria (12970) | `https://zyrionbrazil.com/wp-content/uploads/2026/02/BG-Asset.png` (registrar em `zyrion-imagens.md`) |
| Busca em tela cheia | fundo `var(--secondary)` = `#020817` sem transparência; contêiner do input com borda 4px `#FFFFFF` e raio 0; texto do input `#020817` (secondary) |
| Altura total da home | 6462px (1440) / 13310px (390) |
| Páginas de seção | cada uma tem **seus próprios divisores por subtema** (não é "mais lidas"): ver tabela abaixo |

### Divisores das páginas de seção (ordem na página)

| Página | Divisores |
| --- | --- |
| Home | Em alta · Mundo · Brasil · Educação · Entretenimento · Tecnologia · Esportes · Videos (oculta) |
| `/mundo/` | Em alta · Economia Mundial · Ciência · Meio Ambiente e Clima · Segurança · Esportes |
| `/brasil/` | Em alta · Política · Economia · Segurança · Saúde · Turismo · Educação · Esportes |
| `/tecnologia/` | Em alta · Ciência e Futuro · Apps e Ferramentas · Cripto e Blockchain · Segurança Digital · Empresas e Mercado Tech |
| `/entretenimento/` | Em alta · Filmes, Séries e TV · Famosos · Música · Games · Redes Sociais · Curiosidades e Nostalgia · Podcasts |
| `/educacao/` | Educação em Foco · Intercâmbio · Psicologia · Inclusão e Acessibilidade · Educação dos Filhos · Entretenimento |
| `/esportes/` | Futebol · Basquete · Tênis · Luta · Automobilismo · Futebol Americano · Outros Esportes · Entretenimento |

Rodapé em todas: Últimas Notícias · Categorias · Termos · Contato.

Decisão: o modelo tem uma categoria por post, então cada divisor vira um bloco de lista com **título editável + categoria
da página + offset diferente** (sem subcategorias), com os rótulos acima.

### Categorias (API)

Brasil 124 · Educação 74 · Entretenimento 96 · Esportes 64 · Mundo 166 · Outros 32 · Saúde 13 · Tecnologia 77
(ids de página: home 12906, mundo 22061, brasil 22054, tecnologia 22725, entretenimento 22401, educacao 22824,
esportes 22840, comunidade 22839, links 21793, privacidade 13142, termos 13140, anúncios 13144, editorial 16656, corrigir-erros 16660).

## Ainda a medir (próximas passadas)

- Menu mobile aberto (transição max-height/scaleY), setas do carrossel das páginas de seção (CSS da 22840), sidebar do post,
  ícones/redes do compartilhar, caixa de anúncio quadrado do arquivo, botões do Link da Bio, margens da coluna da Comunidade.
- Conferir as medidas de cada seção da home no DOM (o script `measure.mjs` já dá retângulo, padding, margem, fundo e gap por contêiner).

## Ambiente de trabalho

Neste Mac foi preciso instalar `bun` (1.4.4, em `~/.bun`) e rodar `bun install --frozen-lockfile`; linha de base
`bun test packages/site-builder` = 75 testes passando antes de qualquer alteração. Playwright + Chromium ficam numa pasta
temporária fora do repositório.

## Atualização (implementação)

- Grade escura da home: **sem item largo** (6 cards iguais de 419px em 3 colunas); o bloco mantém a opção `wideIndex` (padrão −1).
- Divisores das páginas de seção viraram caixas de lista com a categoria da página e `offset` diferente (o modelo não tem subcategorias).
- Não conferidos no navegador do original (ficaram pelo CSS/medidas já registradas): transição do menu mobile aberto, estilo das setas do
  carrossel, botões do Link da Bio, margens da coluna da Comunidade, caixa de anúncio quadrado do arquivo.
- Verificado no export estático (Chromium headless, 1440 e 390 px): home, página de seção, post, arquivo, 404 e Link da Bio renderizam sem sobreposição.
