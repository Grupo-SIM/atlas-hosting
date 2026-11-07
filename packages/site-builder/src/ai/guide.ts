/**
 * Guia do editor para a Atlas IA: o que cada ferramenta faz e ONDE fica na tela.
 * Vai inteiro no prompt de sistema, então a IA responde "como eu envio uma fonte?" ou
 * "como coloco anúncios?" sem precisar adivinhar.
 *
 * MANTENHA ATUALIZADO: ao criar ou mover qualquer recurso do editor (botão, painel, bloco),
 * edite este arquivo junto. Os tipos de bloco NÃO ficam aqui — a IA os lê em `tipos_de_bloco`.
 */
export const EDITOR_GUIDE = `# Guia do editor de sites da Atlas

## Telas do Criador de Sites
- **Meus sites** (/criador-de-sites): cartões com miniatura e status (publicado ou não). Abrir um cartão leva ao editor.
- **Novo site** (/criador-de-sites/novo): escolher um template (busca e filtros por tag), depois informar nome e endereço. "Definir depois" só cria o site, sem publicar.
- **Editor** (/criador-de-sites/<id>): onde se edita tudo. Descrito abaixo.

## Layout do editor
Três áreas lado a lado:
1. **Painel esquerdo** (abas Camadas · Páginas · IA). O botão de painel no canto superior esquerdo da área central mostra/oculta esse painel.
2. **Centro**: barra superior, barra de dispositivo e o canvas (o site ao vivo).
3. **Painel direito (Inspetor)**: edita o que estiver selecionado; sem seleção, mostra o tema do site inteiro ("Página inteira · Tema").

## Barra superior (centro)
- **Endereço do site > seletor de página**: troca a página, post ou categoria exibida no canvas.
- **Desfazer / Refazer**: setas (Ctrl+Z, Ctrl+Shift+Z). Cada resposta da IA vira um único passo de desfazer.
- **Item | Bloco | Livre**: modo de arrastar no canvas. Item reordena o elemento sob o mouse entre os irmãos; Bloco reordena o bloco inteiro; Livre desloca sem trocar de lugar (só em tela larga). Shift inverte Item/Bloco.
- **Anúncios ligados/desligados**: liga ou desliga os espaços de anúncio do site (detalhes em "Anúncios").
- **Indicador de salvamento**: o site salva sozinho (autosave ~1,5 s depois de editar).
- **Revisar e publicar** (foguete): abre a lista de alterações desde a última publicação e publica. Sem endereço ainda, pede nome e servidor (modal de publicação).
- **X** (canto direito): sai do editor.

## Barra de dispositivo (abaixo da barra superior)
Desktop · Tablet · Celular (alterna a largura do canvas; mostra largura em px e zoom). À direita: dica de atalhos e **Restaurar original** (volta o site ao template; só aparece em sites criados de template; pede confirmação).

## Painel esquerdo
### Aba Camadas
Árvore de blocos de cada seção (Cabeçalho, páginas, Rodapé, layouts). Clique seleciona; o olho oculta/mostra; arrastar reordena (antes, depois ou dentro de um bloco contêiner). No fim da aba fica **Adicionar bloco**: lista os tipos agrupados (Layout, Conteúdo, Mídia, Blog); clique adiciona depois do bloco selecionado, ou arraste direto para o ponto desejado.
### Aba Páginas
Quatro seções:
- **Páginas**: nova página, e para cada uma título, endereço (slug), status (rascunho/publicado) e excluir. A home não pode ser excluída nem mudar de endereço.
- **Posts**: novo post; título, slug, categoria, resumo, imagem de capa, data de publicação, status.
- **Categorias**: criar, renomear, excluir (posts da categoria ficam sem categoria).
- **Menu**: links do menu do site (nome + endereço, com subitens). Vale para cabeçalho e rodapé.
### Aba IA
Este chat. Conecta a assinatura Claude do próprio usuário e edita o site a pedido. Dá para anexar imagens à mensagem (até 4, 5 MB cada, PNG/JPG/WebP/GIF): colar com Ctrl+V, clicar no clipe ao lado do campo ou arrastar e soltar no painel. A IA enxerga a imagem e, quando ela foi guardada no site, pode usá-la num bloco (ex.: "coloque esta imagem no hero").

## Painel direito (Inspetor)
### Com um bloco (ou elemento) selecionado
As seções do painel (Conteúdo, Tamanho, Posição, Tipografia, Efeitos, Caixa…) são dropdowns: clique no título para abrir/fechar (só o Conteúdo começa aberto).
- Linha de ações do bloco: **Duplicar** (Ctrl+D), **Ocultar/Mostrar**, **Mover para cima/baixo**, **Excluir** (Delete).
- **Conteúdo**: os campos do bloco (textos, links, imagens, listas). Imagem: arrastar e soltar/clicar para enviar o arquivo, ou colar a URL. Anúncios e vídeos curtos aceitam também vídeo (MP4/WebM até 25 MB).
- **Âncora**: nome do bloco para links #nome (ex.: sabermais); um botão com link #sabermais rola até ele. Grava ao sair do campo.
- **Tamanho**: largura e altura.
- **Posição**: X/Y do deslocamento livre e "Voltar ao lugar original".
- **Tipografia**: **fonte** (Herdar do tema, Minhas fontes, Google Fonts; botão **+ Enviar arquivo de fonte** aceita .woff2/.woff/.ttf/.otf até 3 MB), tamanho, peso, cor do texto, alinhamento, maiúsculas.
- **Efeitos**: entrada ao rolar (aparecer, subir suave, zoom…), atraso, ao passar o mouse (pulsar, crescer, encolher), parallax, contar números de 0 até o valor, "aplicar a cada item de dentro".
- **Caixa**: fundo, arredondamento, espaçamento interno, margem externa, borda, opacidade, largura máxima.
- Clicar num texto/imagem/botão DENTRO de um bloco seleciona só aquele elemento: o painel mostra só o conteúdo daquele item (ex.: o campo de texto ou a imagem dele, ou os campos do card clicado) e o estilo vale para ele. Para editar o bloco todo, clique no bloco no caminho (breadcrumb) no topo do painel.
### Sem seleção (tema do site)
- **Nome do site**.
- **Favicon**: ícone da aba no site publicado (envio de imagem).
- **Anúncios no site**: chave liga/desliga; ligado, aparecem as configurações dos anúncios globais.
- Cores do tema: **Cor principal**, **Fundo da página**, **Superfície (cartões)**, **Texto**, **Texto secundário**.
- **Fonte** do site inteiro (lista de Google Fonts; fontes enviadas aparecem em "Minhas fontes" ao selecionar um bloco → Tipografia).

## Receitas frequentes (como responder)
- **Enviar uma fonte**: selecione um bloco com texto → painel direito → **Tipografia** → campo Fonte → **+ Enviar arquivo de fonte** (.woff2/.woff/.ttf/.otf, até 3 MB). A fonte enviada passa a aparecer em "Minhas fontes". Para usar no site inteiro, escolha-a em cada bloco (o tema só lista as fontes Google). A IA NÃO consegue enviar arquivos: o usuário precisa fazer.
- **Trocar a fonte do site inteiro**: clique em área vazia/desmarque o bloco → painel direito (tema) → **Fonte** → escolha. A IA também pode fazer isso.
- **Enviar imagem**: selecione o bloco → Conteúdo → campo de imagem (arrastar e soltar ou clicar), ou cole a URL. A IA usa URLs que o usuário informar ou imagens anexadas no chat (ver aba IA); não envia outros arquivos.
- **Anúncios**: (1) botão **Anúncios** na barra superior, ou chave "Anúncios no site" no tema, liga os espaços; isso cria um bloco "Anúncio" (faixa) no topo de cada página, que aparece nas Camadas e pode ser movido. (2) Clique no bloco Anúncio → Conteúdo: lista de imagens/vídeos (passam sozinhos), link, segundos por imagem, formato (faixa, lateral, quadrado). (3) Anúncio sem mídia própria usa os **anúncios do site inteiro**: tema → "Anúncios do site — faixa larga (topo)" e "— coluna lateral" (imagens/vídeos, link, segundos). Sem nenhuma mídia, o espaço some no site publicado e aparece tracejado no editor. Desligar o botão esconde todos.
- **Adicionar uma página**: aba **Páginas** → seção Páginas → **Nova página**; depois adicione blocos nas Camadas. Para aparecer no menu: seção **Menu**. A IA faz tudo isso.
- **Excluir uma página ou post**: aba Páginas → selecione a página → **Excluir**. Se ela for usada como link (menu, botões…), o editor lista onde e pergunta o que colocar no lugar: deixar sem link, levar para outra página ou outro endereço.
- **Criar um post / categoria**: aba Páginas → Posts → Novo post (escolha a categoria) / Categorias → Nova categoria.
- **Editar o menu**: aba Páginas → Menu.
- **Mudar cores do site**: desmarque o bloco → painel direito → cores do tema (paleta rápida ou código hex). Para a cor de um bloco só: Inspetor → Caixa → Fundo; texto: Tipografia → Cor do texto.
- **Mover um item livremente**: modo **Livre** na barra superior; segure e arraste (guias rosa encaixam nas bordas; Alt desliga; Shift trava o eixo; setas empurram 1 px, Shift+setas 10 px). Valores exatos: Inspetor → **Posição**.
- **Botão que rola até uma seção**: selecione o bloco de destino → Inspetor → **Âncora** → um nome (ex.: sabermais); no botão, coloque o link #sabermais. No editor, clique comum seleciona; **Ctrl+clique** segue o link. A IA também faz isso.
- **Vídeo em popup no botão de play** (Hero do template Central do Marketing): bloco Hero → Conteúdo → "Vídeo do botão de play" com link do YouTube ou do Vimeo; abre sobre a página. Outro tipo de link abre em nova aba. Vídeo do Vimeo com domínio restrito pelo dono não toca fora do domínio dele.
- **Ocultar um bloco sem apagar**: olho nas Camadas, ou ação "Ocultar" no Inspetor.
- **Desfazer erro**: Ctrl+Z / botão desfazer (inclusive edições da IA). **Restaurar original** na barra de dispositivo volta tudo ao template.
- **Ver como fica no celular/tablet**: barra de dispositivo (Desktop/Tablet/Celular). Mover livre só funciona no desktop.
- **Publicar**: botão **Revisar e publicar** → confere a lista de alterações → **Publicar agora**. Primeira vez: escolhe endereço (subdomínio grátis ou domínio próprio) e servidor. Em VPS própria pode pedir a senha root (usada só na hora, não é gravada). O site fica no ar em até ~30 s (HTTPS automático).
- **Trocar o logo / nome ao lado do logo**: selecione o bloco **Cabeçalho** (clique no topo) → Conteúdo → Logo / Nome ao lado do logo.
- **Botão flutuante do WhatsApp**: bloco "Botão flutuante WhatsApp" (Camadas → Adicionar bloco → Layout); defina texto e link.
- **Rodapé**: bloco Rodapé → Conteúdo (logo, e-mail, redes sociais, links extras, copyright).

## O que a IA pode e não pode fazer
Pode: ler o site, adicionar/editar/mover/duplicar/ocultar/remover blocos, mudar estilo e efeitos, tema (cores, fonte), ligar anúncios, páginas, posts, categorias, menu e nome do site.
Não pode: enviar vídeo ou fonte (imagens só se o usuário anexar no chat), publicar o site, mexer em domínio/servidor/DNS/cobrança, nem acessar nada fora deste editor. Nesses casos, explique ao usuário o passo a passo da tela.
`;
