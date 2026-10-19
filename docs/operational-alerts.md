# Fornecedores e avisos operacionais

## Consulta administrativa

No painel de Administração, abra **Fornecedores** (`/admin/suppliers`). O servidor valida o usuário real como administrador; credenciais nunca chegam ao navegador.

A Namecheap retorna saldo disponível, saldo total da conta, moeda e fundos necessários para renovação automática no fornecedor. Esses fundos não representam o valor das assinaturas Atlas. A consulta é feita ao abrir/atualizar a página. Falhas aparecem como indisponibilidade, nunca como saldo zero.

A Contabo mostra se todas as credenciais estão configuradas e consulta o inventário VPS, incluindo todas as páginas. A API integrada não oferece consulta financeira; a interface não estima saldo. Inventário vazio só aparece após consulta concluída. Falha em uma página invalida a consulta completa.

## Destinatários de emergência

Configure no servidor:

```dotenv
EMERGENCY_ALERT_EMAILS=operacao@example.com, financeiro@example.com
```

A lista usa vírgulas. Espaços são removidos e endereços repetidos são normalizados sem distinção entre maiúsculas e minúsculas. Se a variável estiver ausente ou vazia, `DOMAIN_EMAIL` permanece como fallback. `DOMAIN_EMAIL` continua sendo o endereço de contato do registrante; a nova variável não altera esse contato.

Cada aviso é enviado individualmente, sem expor os demais destinatários. Falha de um envio é registrada e não impede os seguintes. Sem destinatário configurado, o evento fica registrado no log e não há envio.

Disparos permanecem nas operações existentes: saldo disponível Namecheap abaixo de **USD 40** após uma operação, compra bloqueada por saldo insuficiente e falha operacional. Consulta administrativa não dispara alertas. Não há monitoramento periódico novo nem recarga automática.

## Validação local

Fornecedores e envio devem ser simulados. `unshare -Urn bun --no-env-file test` bloqueia rede e ignora `.env` nos testes. Nenhuma migration foi aplicada ao banco externo; SQL entregue deve ser revisado antes de execução pelo operador.

### Renovação paga após cancelamento agendado

O fluxo de renovação VPS usa os mesmos destinatários `EMERGENCY_ALERT_EMAILS` (lista separada por vírgulas, fallback `DOMAIN_EMAIL`). Quando uma renovação Pix ou cartão é reconhecida após agendamento de cancelamento, o email **URGENTE: desagendar cancelamento da VPS na Contabo** informa nome, ID Contabo, data agendada e assinatura Atlas. Retire o cancelamento no painel Contabo antes da data indicada. O envio não retira o cancelamento e não comprova continuidade de uma instância já removida.

A pendência fica em `vps_subscriptions.config.renewalCancellation.withdrawalRequired`; `alertSentAt` indica envio SMTP aceito, não execução da retirada. Erros SMTP são retentados pelo agendador. Sem `vpsNodeId`/ID Contabo, cancelamento não é presumido: consulte logs de falha operacional e recupere o vínculo correto.

Prévia local dos emails: `bun scripts/render-renewal-email.ts` gera `docs/examples/vps-renewal-15-days.html` e `vps-renewal-8-days.html`, sem enviar mensagens nem criar cobranças. Link da prévia é ilustrativo.

### Envio manual de lembrete de renovação

`POST /api/internal/vps-subscriptions/renewal-email` aceita JSON com `subscriptionId`
e Bearer `CRON_SECRET`, `API_MACHINE_INTERNAL_TOKEN` ou `INTERNAL_SERVICE_TOKEN`.
Envia somente para o titular da assinatura indicada, ativa e com cobrança futura,
usando os dias restantes no calendário de Recife, mesmo fora dos checkpoints 15/8.
Reutiliza/cria checkout de renovação; não executa cobrança automática.

```sh
curl -X POST 'http://localhost:3000/api/internal/vps-subscriptions/renewal-email' \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"subscriptionId":"SUBSCRIPTION_ID"}'
```

Resposta: `{ subscriptionId, daysLeft, sent }`. `sent: false` indica envio ignorado
(por exemplo, lembrete já enviado naquele dia/ciclo ou assinatura alterada durante
processamento). Compartilha proteção contra duplicação com o cron. SMTP aceito
não comprova entrega na caixa de entrada. Falhas de envio retornam HTTP 500 e não
marcam lembrete como enviado. JSON inválido retorna 400; assinatura inexistente,
404; inativa, sem destinatário ou com cobrança hoje/passada, 409.
