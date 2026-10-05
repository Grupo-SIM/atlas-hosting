# Entrega local: domínios e cobrança

SQL entregue como artefato; nenhuma migration executada. Não usar `db:push` como substituto: ele não instala o trigger de consumo de vouchers.

## Ordem e efeito

Pré-requisito: migrations anteriores do projeto já aplicadas e backup operacional disponível.

1. `drizzle/0007_preserve_deleted_domain_transfers.sql`: guarda nome do domínio no histórico de transferências, permite referência nula e substitui a FK por `ON DELETE SET NULL`.
2. `drizzle/0008_voucher-lifecycle.sql`: adiciona vínculo voucher/fatura, valor original, desconto em centavos e indicador de consumo. Trigger incrementa usos somente uma vez ao confirmar pagamento e limpa reserva/valor ao expirar fatura sem pagamento iniciado.
3. `drizzle/0009_vps_subscription_initial_invoice.sql`: identifica fatura inicial da assinatura e cria índice único para impedir duplicação. Backfill só associa origens históricas inequívocas; duplicatas antigas não são removidas automaticamente. Revisar duplicatas históricas antes de habilitar rotinas de recuperação.

Código novo depende das três migrations. SQL 0008/0009 é de aplicação única; coordenar revisão e execução pelo operador antes de liberar código. Nenhuma publicação foi realizada nesta tarefa.

## Reservas e conciliação

Reserva ocupa um uso enquanto fatura pendente estiver válida, estiver em processamento ou tiver evidência de pagamento iniciado. `paymentStartedAt` mantém resultado incerto de cartão/PIX/boleto reservado mesmo sem resposta com ID. Recusa definitiva do cartão remove esse marcador e permite tentar novamente; timeout ou PENDING não libera a fatura.

Remover voucher antes do pagamento restaura valor original. Trocar titular de fatura pendente em link também remove a associação anterior; voucher vinculado a uma conta não acompanha a cobrança para outra.

Expiração sem pagamento iniciado libera reserva. Cobrança emitida/incerta exige verificar resultado no provedor antes de alterar situação local. Não apagar IDs nem limpar marcador apenas porque usuário abandonou checkout; isso permitiria desconto reutilizado e cobrança duplicada. Procedimento de conciliação não foi automatizado além dos fluxos existentes.

Consumo único de voucher depende do trigger 0008, inclusive nos webhooks legados. Proteção contra nova assinatura duplicada depende do índice 0009. Testes usam banco, gateways, e-mails e fornecedores simulados; SQL foi revisado estaticamente, sem execução. Testes de integração que exigem banco explícito permanecem condicionais.

`knowledge-base-n8n.txt` é a base atualizada para Atlas IA. Arquivo permanece local; não foi enviado ao N8N.
