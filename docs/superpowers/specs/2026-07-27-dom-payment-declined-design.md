# Recusa imediata de pagamento pela DOM

## Objetivo

Impedir que uma assinatura continue ativa quando a DOM informar uma recusa
terminal de cartão, como `NOT_AUTHORIZED`.

## Eventos cobertos

- `SIGNATURE-INVOICE-FAILED`
- `CHARGE-NOT_AUTHORIZED`
- `CHARGE-REJECTED_ANTIFRAUD`

## Fluxo

1. O webhook resolve a fatura Atlas pela referência externa da DOM.
2. Faturas `pending` ou `processing` passam para `failed`; faturas já pagas
   nunca são revertidas.
3. Para fatura VPS, a assinatura vinculada é imediatamente marcada como
   `failed`, com incremento do contador de falhas. Não há espera por três
   tentativas.
4. Para fatura `subscription`, o plano da organização é removido somente se
   ainda coincidir com o plano daquela fatura.
5. O processamento é idempotente e referências ausentes ou desconhecidas
   retornam sucesso sem mudança persistida.

## Testes

- Fatura VPS recusada marca a fatura e a assinatura como `failed`.
- Plano de organização é removido somente quando ainda corresponde à fatura.
- Eventos repetidos e referências ausentes não alteram estado indevidamente.
