# DOM Payment Declined Implementation Plan

**Goal:** Inativar imediatamente a assinatura e a fatura Atlas quando a DOM informar recusa terminal de cobrança.

1. Criar teste de serviço para fatura recusada, incluindo VPS, plano da organização e reentrega idempotente.
2. Executar o teste e confirmar a falha antes do código novo.
3. Estender o serviço de processamento com a transição imediata para `failed`.
4. Integrar `SIGNATURE-INVOICE-FAILED`, `CHARGE-NOT_AUTHORIZED` e `CHARGE-REJECTED_ANTIFRAUD` ao handler DOM, validando assinatura nos eventos `CHARGE-*`.
5. Executar `bun test` e `bunx tsc --noEmit`; registrar o resultado em commit.
