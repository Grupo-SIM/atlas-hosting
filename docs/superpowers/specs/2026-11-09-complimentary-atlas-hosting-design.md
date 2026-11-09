# Isenção de hospedagem Atlas

## Intenção

Manter gratuita a publicação na VM do Atlas para administradores e `brenohslima@gmail.com`, como era antes, sem alterar cobranças de domínio.

## Metas

- Não incluir o primeiro mês de hospedagem da VM do Atlas na fatura dos usuários isentos.
- Permitir a publicação direta quando não houver outra cobrança.
- Exibir que a hospedagem é gratuita para os usuários isentos.

## Fora de escopo

- Isentar registro ou renovação de domínio.
- Alterar preços ou a cobrança dos demais usuários.
- Criar ou renovar assinatura de hospedagem para a publicação isenta.

## Abordagens

1. Zerar a variável global de mensalidade: descartada, pois liberaria todos os usuários.
2. Isentar apenas no cliente: descartada, pois um pedido forjado ainda criaria cobrança e a publicação direta continuaria bloqueada.
3. Centralizar a política de isenção no servidor, reutilizá-la no checkout, publicação direta e exibição: escolhida. A cobrança é efetivamente removida e a interface corresponde ao resultado.

## Design

`access.ts` exportará um predicado de hospedagem gratuita para admins e o e-mail autorizado. O checkout não adicionará `hostingAmountBrl` para esse público e chamará a publicação com a verificação de assinatura dispensada. A ação de publicação direta aplicará a mesma dispensa. A tela de publicação receberá uma flag para trocar a etiqueta e o cálculo do primeiro mês por “gratuita”.
