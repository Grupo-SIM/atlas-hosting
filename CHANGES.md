# Alterações — Sprint de Melhorias

## 1. Confirmação PIX instantânea

**Problema:** Confirmação de pagamento PIX demorava ~1 minuto.

**Causa raiz:** O sistema aguardava o webhook da DOM Pagamentos chegar ao back-simpay para então marcar o pagamento como pago. A DOM pode levar 30–90 segundos para disparar o webhook.

**O que foi feito:**

### back-simpay — `atlas-payment.service.ts`
Novo método `checkPixStatusDirect(domPaymentId)` que consulta a DOM API diretamente:
```
GET https://apiv3.dompagamentos.com.br/checkout/production/transactions/:id
Authorization: Bearer ATLAS_DOM_TOKEN
```
Retorna o status atual sem depender de webhook.

### back-simpay — `atlas-payment.controller.ts`
Novo endpoint exposto:
```
GET /atlas/payments/pix-status/:domPaymentId
```

### atlas-hosting — `src/app/actions.ts` (`syncCheckoutPixPayment`)
O polling do frontend (a cada 1,5 s) agora:
1. **Primeiro** chama `/atlas/payments/pix-status/:id` → status direto da DOM
2. **Fallback** chama `/atlas/payments/status/:id` → status via DB (webhook-based)

Resultado: pagamento confirmado em segundos após o PIX ser pago, sem aguardar webhook.

---

## 2. Valores corretos no WhatsApp

**Problema:** Mensagem enviada ao admin mostrava preços errados:
- Taxa de câmbio hardcoded como `11,72` (real: ~`5,80`)
- NVMe 400 GB mostrado como "Grátis"
- Backup, localização e outros add-ons com valores incorretos

**O que foi feito:**

### atlas-hosting — `src/app/actions.ts` (`createVpsInvoice`)
Ao criar a invoice VPS, agora salva `priceBreakdown` no metadata:
```json
{
  "eurRate": 5.797,
  "baseBrlPerMonth": 146.05,
  "locationBrlPerMonth": 34.20,
  "storageBrlPerMonth": 37.67,
  "imageBrlPerMonth": 223.14,
  "backupBrlPerMonth": 40.57,
  "managedBrlPerMonth": 1274.97,
  "monitoringBrlPerMonth": 133.19,
  "privateNetworkBrlPerMonth": 13.27,
  "additionalIpBrlPerMonth": 40.57,
  "objectStorageBrlPerMonth": 28.86,
  "setupBrl": 0
}
```
Os valores usam a mesma taxa de câmbio e os mesmos preços EUR do checkout — garantindo que o WhatsApp mostra exatamente o que o cliente pagou.

### atlas-hosting — `src/lib/notifications/vps-purchase.ts`
- `buildAdminWhatsAppMessage` lê `priceBreakdown` da invoice ao invés de recalcular com tabelas hardcoded
- Labels de armazenamento completadas: `nvme-400`, `nvme-200`, `ssd-400`, `ssd-800`, `nvme-600`, etc.

---

## 3. Recorrência VPS/VDS

**O que foi feito anteriormente (mesma sessão):**

### atlas-hosting — `src/lib/db/schema/tables/vps-subscription.ts` (novo)
Tabela `vps_subscriptions` com:
- `orgId`, `userId`, `planId`, `planType`
- `config` (JSON com cardToken e configuração da VM)
- `intervalMonths` (1, 6 ou 12)
- `amountBrl` (valor a cobrar)
- `nextChargeDate` (próxima data de cobrança)
- `status`, `failureCount`

### atlas-hosting — `src/app/actions.ts`
Após pagamento no cartão, cria registro na `vps_subscriptions` com o `cardToken` salvo.

### atlas-hosting — `src/app/api/internal/vps-subscriptions/renew/route.ts` (novo)
Endpoint de renovação chamado diariamente:
- Busca assinaturas com `status=active` e `nextChargeDate <= hoje`
- Cobra o cartão via `simpayApi.createCardPayment` com o `cardToken` salvo
- Cria invoice de renovação, avança `nextChargeDate += intervalMonths`
- Após 3 falhas consecutivas, suspende a assinatura

### atlas-hosting — `instrumentation.ts` (novo)
Cron interno ao processo Next.js (roda no Docker, sem Vercel):
- Na inicialização, agenda disparo diário às **08:00** (fuso `America/Fortaleza`)
- Chama `POST /api/internal/vps-subscriptions/renew`

---

## 4. Salvar seleções na URL em tempo real

**O que foi feito:**

### atlas-hosting — páginas de configuração
`src/app/vps/configure/[id]/page.tsx`  
`src/app/vds/configure/[id]/page.tsx`  
`src/app/vps-windows/configure/[id]/page.tsx`  
`src/app/vps-armazenamento/configure/[id]/page.tsx`

- Estado inicializado a partir de `useSearchParams()` (restaura seleção via URL)
- `useEffect` com `window.history.replaceState` atualiza URL a cada mudança de estado
- Todos os campos salvos: plano, duração, localização, storage, imagem, add-ons, senha, etc.

---

## Deploy necessário

Para o fix de PIX instantâneo funcionar em produção: **fazer rebuild e redeploy do `back-simpay`** no Portainer.
