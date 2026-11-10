# Marketing Raiz → Criador de Sites: inventário

Fonte: https://marketingraiz.com (WordPress + Elementor + The Post Grid), levantado em 2026-11-10 pela REST API
(`/wp-json/wp/v2/{pages,posts,categories,media}`: 42 posts, 4 categorias, 14 páginas) e pelo HTML/CSS do Elementor
(kit 26, cabeçalho 4819, rodapé 5422, home 5293, categorias 5338, blogs 5302, arquivo 4892, links 6235, funil 811/1095…).
As medidas do prompt (`plans/marketingraiz-prompt.md`) bateram com o CSS onde conferi (hero 150/100px, véu `#000000FA 27%→31%`
a 42%, container 1200/1250, cor `#6617FF`, menu Roboto 600 `#000`, hover roxo, tablet `-167px 0`).

## Decisões

| Tema | Decisão |
| --- | --- |
| Reuso | Páginas internas usam os blocos `sg*` do Seguidores em Alta (banner, busca, barra de categoria, cartões de blog, post, link bio, grade `archive`); o CSS é reaproveitado trocando o escopo `.sb-sg` → `.sb-mr` em `renderer/raiz.ts`. |
| Blocos novos (`mr*`) | `mrHeader`, `mrHero`, `mrHighlights`, `mrPostGrid` (paginação), `mrShowcase`, `mrCategories`, `mrFooter`, `mrNotFound`, `mrVsl`, `mrSteps`, `mrQuiz`, `mrCapture`. `whatsappFloat` ganhou `layout: pill`, cores e texto do celular. |
| Runtime | tudo em `fx-runtime.ts` (JS vanilla; sem jQuery/Bootstrap): paginação, carrossel com miniaturas, botão atrasado, telas/quiz. |
| Paginação | feita no navegador (sem JS aparecem todos os posts; busca `?q=` filtra antes de paginar), em vez de gerar `/page/N/`. |
| Hero | bloco único responsivo (desktop/tablet/celular por CSS); a grade da direita some no celular (o original mostra "No posts found." — bug não reproduzido). |
| Carrossel | um bloco responsivo no lugar das 3 cópias; 5 slides (a lista do tablet/celular). Troca em loop com translate; da última volta à primeira deslizando de volta. |
| Funil | **só mecânicas e visual**; textos neutros (quiz "Descubra seu perfil de vendedor" → e-book do grupo). Não foram copiados o produto de apostas, a escassez fabricada, a narrativa da série nem as imagens da série. Vídeo de exemplo: YouTube público (o Vimeo do grupo recusa incorporação fora do domínio). |
| Captura de e-mail | formulário envia (POST) para uma URL configurável; vazio = desligado, com aviso no editor. Sem backend. |
| Imagens | ver `plans/marketingraiz-imagens.md`. |

## Verificado no navegador (Chromium headless, export estático)

Cabeçalho e dropdown de largura total no tablet; botão flutuante (pílula; círculo no celular); hero; grades; paginação 1→2;
carrossel (translate −100% após 5 s); depoimentos; quiz (telas com fade → barra 5%→100% → "Concluído!" → tela final); botão
atrasado (oculto → visível aos 30 s, animação `mr-pulse`).

## Não conferido (suposto)

- Tipografia do título de seção do TPG, hover do cartão do hero (zoom 1.06), tamanho do menu (15px), mapeamento imagem↔LP dos
  slides, slides por tela dos depoimentos (2 desktop / 1 tablet+celular), cores dos botões sociais da lateral, proporção do
  slide principal (16:7) e a escala final do pulse (1.07).
- Título extra "Roboto 59/600" e legenda `#324A6D` do post, conteúdo da sidebar sticky, imagem/estilos do 404 e do botão da fundação.
- Largura/tipografia das páginas legais (usam o `prose` padrão).
- Comparação lado a lado com o original em 1440/820/390 px (só revisei o resultado, sem sobrepor as capturas).
