# Cancelamento de assinatura pela DOM

## Objetivo

Fazer com que o webhook `SIGNATURE-CANCELLED` da DOM reflita o cancelamento
da recorrência no Atlas, usando a fatura Atlas recebida em
`data.external_reference` como vínculo.

## Fluxo

1. O endpoint `POST /webhook/dom` recebe `SIGNATURE-CANCELLED`.
2. O handler procura a fatura pelo ID em `data.external_reference`.
3. Caso a fatura seja do tipo `subscription`, ele remove o plano da
   organização somente se o plano atual for o mesmo referenciado pela fatura.
4. Caso a fatura seja do tipo `vps`, ele cancela a assinatura VPS cuja
   `lastInvoiceId` corresponde à fatura, preenchendo `cancelledAt` e
   `updatedAt`.
5. Caso a fatura ou o vínculo não exista, o handler registra o fato e conclui
   o webhook com sucesso, para não gerar retentativas inúteis.

## Regras

- Faturas já pagas não são alteradas: cancelar uma recorrência não reverte um
  pagamento concluído.
- As atualizações são idempotentes: o reenvio do evento mantém o mesmo estado.
- Um webhook atrasado não remove um plano mais novo da organização.
- O escopo não inclui desprovisionar recursos externos nem persistir o ID da
  assinatura da DOM; o vínculo atual e confiável é a fatura Atlas.

## Testes

- Cancela o plano da organização quando a fatura de assinatura corresponde ao
  plano atual.
- Preserva um plano mais novo quando chega um webhook antigo.
- Cancela a assinatura VPS vinculada à fatura.
- Aceita com sucesso referências sem fatura ou sem assinatura VPS vinculada.
