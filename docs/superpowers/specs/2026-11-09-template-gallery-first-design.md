# Galeria de templates na primeira visita

## Intenção

Quem ainda não criou um site deve chegar diretamente à galeria de templates ao abrir o Criador de Sites.

## Metas

- Redirecionar a conta sem sites de `/criador-de-sites` para `/criador-de-sites/novo`.
- Preservar a tela “Meus sites” e o botão “Criar site” para contas que já possuem sites.

## Fora de escopo

- Alterar a galeria, os templates ou o fluxo de criação.
- Modificar dados no banco.

## Abordagens

1. Duplicar a galeria na página principal: descartada, pois repetiria a montagem de miniaturas e o fluxo de criação.
2. Redirecionar apenas quando a consulta não encontra sites: escolhida. Reaproveita integralmente a galeria existente e mantém a lista para usuários que já criaram sites.

## Design

Após carregar os sites do usuário, a página principal chama `redirect("/criador-de-sites/novo")` quando a lista está vazia. A decisão é feita no servidor, sem estado no cliente.
