# PIX anual para VPS/VDS + visão admin de vencimento

Data: 2026-06-23
Branch: feature/landing-page-update

## Objetivo

1. Permitir que clientes comprem VPS/VDS via **PIX**, mas **somente no plano anual (12 meses)**. Planos mensais e semestrais continuam exclusivos para cartão (cobrança recorrente).
2. No painel admin de assinaturas VPS, exibir:
   - A **forma de pagamento** de cada assinatura (PIX ou Cartão).
   - Quais assinaturas estão **prestes a vencer** (próximos 15 dias).

## Decisões

- Janela "a vencer": **15 dias**.
- Exibição: **badge "Vence em X dias" + linha destacada** na própria tabela, mais um card de contagem no topo.
- PIX é pagamento único (sem cobrança recorrente). A renovação **não** é cobrada automaticamente.
- Quando uma assinatura PIX passa de `next_charge_date`, o cron **pausa automaticamente** (`status: "paused"`, `pausedAt: now`). Não tenta cobrar, não marca como `failed`.
- Escopo deste PR: **checkout + visão admin**. Sem fluxo de auto-renovação pelo cliente.

## Contexto do código atual

- `src/components/checkout/ModernCheckoutForm.tsx:192` — `allowPix = invoiceType === "domain"`. Hoje PIX é bloqueado para VPS/VDS por completo.
- `src/app/actions.ts:1435` `createVpsSubscriptionIfNeeded(invoice, user, cardToken)` — cria a assinatura VPS. Chamada **apenas** nos fluxos de cartão (`completeCheckout`, `completeCheckoutWithSavedCard`). O fluxo PIX não cria assinatura.
- Fluxo PIX: `initiateCheckoutPix` / `syncCheckoutPixPayment` / `markPixPaymentComplete` em `src/app/actions.ts`.
- `src/app/api/internal/vps-subscriptions/renew/route.ts:80` — cron de renovação; subs sem `cardToken` viram `failed`.
- `src/lib/db/schema/tables/vps-subscription.ts` — sem coluna de forma de pagamento.
- `src/app/(auth)/admin/vps-plans/actions.ts` — `VpsPlanRow` + `getVpsPlanSubscriptionsAction`.
- `src/app/(auth)/admin/vps-plans/page.tsx` — tabela admin (Cliente, Tipo, Período, Próx. cobrança, Valor, Status, Ações).
- Fluxo de compra VPS: `/vds/configure/[id]` → `/checkout/personal-data` → `createVpsInvoice` (`src/app/actions.ts:2623`) → `/checkout/[id]`. Invoice sempre `type: "vps"`; `metadata.config.duration` guarda os meses; `metadata.config.type` distingue vds/storage/windows.

## Mudanças

### 1. Schema — `vps_subscriptions`

Adicionar coluna:

```ts
paymentMethod: text("payment_method", { enum: ["credit_card", "pix"] })
  .notNull()
  .default("credit_card"),
```

- Gerar migração Drizzle.
- Linhas existentes herdam `credit_card` (todas têm `cardToken` — correto).

### 2. Checkout — liberar PIX só no anual

- `src/app/checkout/[id]/page.tsx`: ler `invoice.metadata.config.duration`; calcular `isAnnualVps = invoice.type === "vps" && Number(duration) === 12`; passar como prop para `CheckoutClient` → `ModernCheckoutForm`.
- `CheckoutClient` (`src/app/checkout/[id]/checkout-client.tsx`): repassar a prop `isAnnualVps`.
- `ModernCheckoutForm.tsx`: nova prop `isAnnualVps?: boolean`; alterar `allowPix`:

```ts
const allowPix = invoiceType === "domain" || isAnnualVps;
```

- Resultado: VPS/VDS mensal/6m → só cartão. VPS/VDS 12m → cartão **ou** PIX. Domínio inalterado.

### 3. Backend — criar assinatura no PIX anual

- Refatorar `createVpsSubscriptionIfNeeded(invoice, user, opts)` com `opts: { paymentMethod: "credit_card" | "pix"; cardToken?: string }`.
  - Cartão: `paymentMethod: "credit_card"`, mantém `config.cardToken`.
  - PIX: `paymentMethod: "pix"`, sem `cardToken`.
- Atualizar as duas chamadas de cartão existentes para `{ paymentMethod: "credit_card", cardToken }`.
- Chamar no fluxo de conclusão do PIX para invoices VPS (hoje ausente) — no ponto onde o pagamento PIX é confirmado (`syncCheckoutPixPayment` / `markPixPaymentComplete`). Guard: só criar quando `Number(config.duration) === 12`.

### 4. Cron de renovação — tratar PIX

`src/app/api/internal/vps-subscriptions/renew/route.ts`:

- Para cada sub vencida com `paymentMethod === "pix"` (ou sem `cardToken`): **não cobrar**. Em vez de `failed`, definir `status: "paused"`, `pausedAt: now`, `updatedAt: now`, e `continue`.
- Subs de cartão: comportamento atual inalterado.

### 5. Admin — tabela de assinaturas

`src/app/(auth)/admin/vps-plans/actions.ts`:

- `VpsPlanRow`: adicionar `paymentMethod: "credit_card" | "pix"`.
- No map: usar `s.paymentMethod`; para linhas legadas sem o campo, inferir `(s.config as any)?.cardToken ? "credit_card" : "pix"`.

`src/app/(auth)/admin/vps-plans/page.tsx`:

- Nova coluna **"Pagamento"**: badge `PIX` / `Cartão`.
- Lógica "a vencer": `status === "active" && nextChargeDate <= now + 15 dias`.
  - Badge **"Vence em N dias"** ao lado de Próx. cobrança (âmbar).
  - Destaque na linha (fundo âmbar suave).
- Cards de estatística do topo: adicionar card **"A vencer (15d)"** com a contagem.

## Componentes e fronteiras

- Schema/migração: isolado em `vps-subscription.ts` + migração gerada.
- Gating de PIX: prop booleana fluindo page → client → form. Sem lógica nova no form além do OR.
- Criação de assinatura: um único helper `createVpsSubscriptionIfNeeded` com assinatura por opts; três chamadores.
- Cron: ramo extra para PIX, isolado por `continue`.
- Admin: derivação de `paymentMethod` e cálculo "a vencer" no server action / componente de página; apenas apresentação.

## Fora de escopo

- Botão de renovação PIX pelo cliente.
- Notificações de vencimento (WhatsApp/e-mail) específicas para PIX.
- Mudança de preços ou descontos.

## Testes

- `allowPix`: domínio → true; VPS 1m/6m → false; VPS/VDS 12m → true.
- `createVpsSubscriptionIfNeeded`: PIX 12m cria sub `paymentMethod:"pix"` sem cardToken; cartão mantém cardToken.
- Cron: sub PIX vencida → `paused`, sem chamada de cobrança; sub cartão vencida → cobra (inalterado).
- Admin map: linha legada sem `paymentMethod` infere corretamente por `cardToken`.
- "A vencer": sub com `nextChargeDate` em 10 dias e `active` → flag true; em 20 dias → false; pausada em 5 dias → false.
