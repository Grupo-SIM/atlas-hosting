# PIX anual para VPS/VDS + renovação self-service + visão admin

Data: 2026-06-23
Branch: feature/landing-page-update

## Objetivo

1. Permitir compra de VPS/VDS via **PIX**, **somente no plano anual (12 meses)**. Mensal/semestral continuam exclusivos para cartão (cobrança recorrente).
2. Painel admin de assinaturas VPS: exibir **forma de pagamento** (PIX/Cartão) e quais estão **a vencer** (15 dias).
3. **Renovação PIX self-service**: quando a assinatura está a vencer (≤15 dias) ou já vencida/pausada, tanto o **cliente** (dono da VPS) quanto o **admin** podem gerar um QR code PIX e renovar. Ao pagar, a renovação é efetivada (estende +12 meses e reativa).

## Decisões

- Janela "a vencer": **15 dias**.
- Exibição admin: **badge "Vence em N dias" + linha destacada** na tabela + card de contagem no topo.
- PIX é pagamento único (sem recorrência automática).
- Assinatura PIX que passa de `next_charge_date` sem renovar: o cron **pausa automaticamente** (`status:"paused"`, `pausedAt:now`). Não cobra, não marca `failed`.
- Botão **Renovar** disponível quando: assinatura PIX **e** (`a vencer ≤15d` **ou** `paused`/vencida).
- Fluxo de renovação: botão gera uma **fatura de renovação** (`isRenewal`) e **redireciona para `/checkout/[id]`** já existente (reusa QR PIX + SSE de confirmação).
- Cliente vê suas assinaturas VPS numa **nova página do painel**: `/minhas-assinaturas`.

## Contexto do código atual

- `src/components/checkout/ModernCheckoutForm.tsx:192` — `allowPix = invoiceType === "domain"`. PIX hoje bloqueado para VPS/VDS.
- `src/app/actions.ts:1435` `createVpsSubscriptionIfNeeded(invoice, user, cardToken)` — cria assinatura; chamada **só** nos fluxos de cartão (`completeCheckout`, `completeCheckoutWithSavedCard`). Fluxo PIX não cria assinatura.
- Fluxo PIX: `initiateCheckoutPix`, `syncCheckoutPixPayment` (`actions.ts:1346`), `markPixPaymentComplete` (`actions.ts:1311`). Ambos chamam `processInvoiceAfterPayment` (`actions.ts:1104`), que hoje **só trata domínio**.
- `src/app/api/internal/vps-subscriptions/renew/route.ts` — cron; subs sem `cardToken` viram `failed`. Já entende `metadata.isRenewal` + `subscriptionId` (cartão).
- `src/lib/db/schema/tables/vps-subscription.ts` — sem coluna de forma de pagamento.
- `src/app/(auth)/admin/vps-plans/actions.ts` / `page.tsx` — server action + tabela admin.
- `src/app/actions.ts:2623` `createVpsInvoice` — cria fatura de compra VPS (type `vps`; `metadata.config.duration` = meses; `config.type` distingue vds/storage/windows).
- `src/components/layouts/navigation.ts` — itens do menu lateral.
- Não há lista de assinaturas VPS voltada ao cliente (`/subscriptions` é página estática; `SubscriptionSection` é do plano de hospedagem).

## Mudanças

### 1. Schema — `vps_subscriptions`

```ts
paymentMethod: text("payment_method", { enum: ["credit_card", "pix"] })
  .notNull()
  .default("credit_card"),
```

Migração Drizzle. Linhas existentes herdam `credit_card` (todas têm `cardToken`).

### 2. Checkout — liberar PIX só no anual

- `src/app/checkout/[id]/page.tsx`: ler `invoice.metadata.config.duration`; `isAnnualVps = invoice.type === "vps" && Number(duration) === 12`; passar a prop até `ModernCheckoutForm`.
- `checkout-client.tsx`: repassar `isAnnualVps`.
- `ModernCheckoutForm.tsx`: nova prop `isAnnualVps?: boolean`; `allowPix = invoiceType === "domain" || isAnnualVps`.

### 3. Helper de criação de assinatura

- Refatorar `createVpsSubscriptionIfNeeded(invoice, user, opts)` com `opts: { paymentMethod: "credit_card" | "pix"; cardToken?: string }`.
  - Cartão: grava `config.cardToken`, `paymentMethod:"credit_card"`.
  - PIX: sem `cardToken`, `paymentMethod:"pix"`.
- Atualizar os 2 chamadores de cartão para `{ paymentMethod:"credit_card", cardToken }`.

### 4. Pagamento PIX trata VPS (novo + renovação)

Novo helper `handleVpsPixPaid(invoice, user)`, chamado nas duas conclusões PIX (`markPixPaymentComplete`, `syncCheckoutPixPayment`) quando `invoice.type === "vps"`:

- Se `metadata.isRenewal && metadata.subscriptionId` → **renovação**: na sub existente, `nextChargeDate = addMonths(max(now, nextChargeDate atual), intervalMonths)`, `status:"active"`, `pausedAt:null`, `failureCount:0`, `lastInvoiceId`, `updatedAt`.
- Senão → **nova compra**: `createVpsSubscriptionIfNeeded(invoice, user, { paymentMethod:"pix" })`, somente quando `Number(config.duration) === 12`.

### 5. Cron de renovação — tratar PIX

`src/app/api/internal/vps-subscriptions/renew/route.ts`: para sub vencida com `paymentMethod === "pix"` (ou sem `cardToken`): **não cobrar**; `status:"paused"`, `pausedAt:now`, `updatedAt`, `continue`. Subs de cartão inalteradas.

### 6. Ação de renovação (cliente + admin)

Novo server action `createVpsRenewalInvoice(subscriptionId)` em `src/app/(auth)/...` (ou `actions.ts`):

- Auth: requisitante é **dono** da sub (`sub.userId === user.id`) **ou** `user.isAdmin`.
- Elegibilidade: `sub.paymentMethod === "pix"` **e** (`nextChargeDate <= now + 15d` **ou** `status === "paused"`).
- Cria fatura `type:"vps"`, `amount = sub.amountBrl`, `metadata: { vpsId: sub.planId, config: sub.config /* duration 12 */, isRenewal:true, subscriptionId: sub.id }`.
- Retorna `{ status:"success", redirectUrl: "/checkout/<id>?initialStep=payment" }`.
- `config.duration === 12` garante `allowPix` no checkout.

### 7. Página do cliente — `/minhas-assinaturas`

- Nova rota `src/app/(auth)/minhas-assinaturas/page.tsx` (server): busca `vps_subscriptions` do `user.id`. Lista: tipo, período, próx. cobrança, valor, status, badge de pagamento (PIX/Cartão), badge "Vence em N dias" quando aplicável.
- Componente cliente `RenewButton` (ex.: `SubscriptionRenewCell.tsx`): visível só para subs elegíveis; chama `createVpsRenewalInvoice` e faz `router.push(redirectUrl)`.
- `src/components/layouts/navigation.ts`: adicionar `{ name: "Minhas Assinaturas", href: "/minhas-assinaturas", icon: Server }` (cliente).

### 8. Admin — tabela de assinaturas

`src/app/(auth)/admin/vps-plans/actions.ts`:
- `VpsPlanRow`: adicionar `paymentMethod: "credit_card" | "pix"`. Map: `s.paymentMethod`; legado infere `(config as any)?.cardToken ? "credit_card" : "pix"`.

`src/app/(auth)/admin/vps-plans/page.tsx`:
- Coluna **"Pagamento"**: badge PIX/Cartão.
- "A vencer": `status === "active" && nextChargeDate <= now + 15d` → badge "Vence em N dias" + linha âmbar.
- Card de estatística **"A vencer (15d)"**.
- Ação **Renovar (PIX)** na coluna Ações para subs PIX elegíveis → reusa `createVpsRenewalInvoice` → redireciona para checkout (admin vê o QR).

## Componentes e fronteiras

- Gating PIX: prop booleana page → client → form.
- Criação/renovação de assinatura: helpers em `actions.ts` (`createVpsSubscriptionIfNeeded`, `handleVpsPixPaid`, `createVpsRenewalInvoice`).
- Renovação reusa 100% do checkout/QR existente via fatura `isRenewal`.
- Cliente e admin compartilham a mesma ação de renovação (diferença só na autorização).
- Apresentação isolada: página cliente + ajustes na tabela admin.

## Fora de escopo

- Notificações de vencimento (WhatsApp/e-mail) específicas para PIX.
- Renovação PIX para assinaturas de **cartão** (cartão renova via cron).
- Mudanças de preço/desconto.

## Testes

- `allowPix`: domínio → true; VPS 1m/6m → false; VPS/VDS 12m → true.
- Compra PIX 12m: cria sub `paymentMethod:"pix"` sem cardToken. Cartão mantém cardToken.
- `handleVpsPixPaid` renovação: estende `nextChargeDate` +12 a partir de `max(now, atual)`, reativa pausada, zera `failureCount`.
- Cron: sub PIX vencida → `paused`, sem cobrança; sub cartão vencida → cobra (inalterado).
- `createVpsRenewalInvoice`: nega não-dono/não-admin; nega quando fora da janela e não pausada; cria fatura `isRenewal` com `duration 12`.
- Admin map: legado sem `paymentMethod` infere por `cardToken`.
- "A vencer": 10 dias + `active` → true; 20 dias → false; pausada → fora de "a vencer" mas elegível a Renovar.
- Elegibilidade do botão Renovar: PIX + (≤15d ou pausada) → mostra; cartão ou >15d ativa → não mostra.
