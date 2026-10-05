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
