# DOM Signature Cancellation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar no Atlas os cancelamentos de recorrência recebidos no webhook `SIGNATURE-CANCELLED` da DOM.

**Architecture:** Extrair a decisão de cancelamento para um módulo testável com persistência injetada. O handler fornece o adaptador Drizzle e o serviço atualiza apenas o plano ou VPS ainda ligado à fatura cancelada.

**Tech Stack:** Next.js route handler, TypeScript, Drizzle ORM, Bun test.

## Global Constraints

- Não modificar faturas já pagas.
- Tratar reentregas como idempotentes.
- Não remover um plano de organização que mudou após a fatura cancelada.
- Não desprovisionar recursos externos nem criar migração de banco.

---

### Task 1: Serviço e testes de cancelamento

**Files:**
- Create: `src/lib/server/dom/signature-cancellation.ts`
- Create: `src/lib/server/dom/signature-cancellation.test.ts`

**Interfaces:**
- Produces: `processSignatureCancellation(externalReference, repository)`.

- [ ] **Step 1: Write failing tests for the happy paths**

```ts
test("clears a matching organization plan", async () => {
  await expect(processSignatureCancellation(subscriptionInvoice.id, fakeRepository({ invoice: subscriptionInvoice, planCleared: true })))
    .resolves.toEqual({ status: "organisation-plan-cancelled", invoiceId: subscriptionInvoice.id });
});
test("cancels a VPS subscription linked to the invoice", async () => {
  await expect(processSignatureCancellation(vpsInvoice.id, fakeRepository({ invoice: vpsInvoice, vpsSubscriptionsCancelled: 1 })))
    .resolves.toEqual({ status: "vps-subscription-cancelled", invoiceId: vpsInvoice.id });
});
```

- [ ] **Step 2: Verify red**

Run: `bun test src/lib/server/dom/signature-cancellation.test.ts`

Expected: FAIL because the service does not exist.

- [ ] **Step 3: Implement the service**

```ts
if (!externalReference) return { status: "missing-reference" };
const invoice = await repository.findInvoice(externalReference);
if (!invoice) return { status: "invoice-not-found", invoiceId: externalReference };
if (invoice.type === "subscription") {
  const cleared = await repository.clearOrganizationPlan(invoice.orgId, invoice.reference);
  return { status: cleared ? "organisation-plan-cancelled" : "organisation-plan-unchanged", invoiceId: invoice.id };
}
if (invoice.type === "vps") {
  const cancelled = await repository.cancelVpsSubscriptions(invoice.id, new Date());
  return { status: cancelled ? "vps-subscription-cancelled" : "vps-subscription-not-found", invoiceId: invoice.id };
}
return { status: "invoice-type-ignored", invoiceId: invoice.id };
```

- [ ] **Step 4: Verify green**

Run: `bun test src/lib/server/dom/signature-cancellation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/lib/server/dom/signature-cancellation.ts src/lib/server/dom/signature-cancellation.test.ts`

Run: `git commit -m "feat: add DOM signature cancellation service"`

### Task 2: Conectar o serviço ao webhook DOM

**Files:**
- Modify: `src/app/webhook/dom/route.ts:3-33`

**Interfaces:**
- Consumes: `processSignatureCancellation` da Task 1.
- Produces: tratamento persistente de `SIGNATURE-CANCELLED`.

- [ ] **Step 1: Add failing edge-case tests**

```ts
test("does not fail for a missing reference or unknown invoice", async () => {
  const repository = fakeRepository({ invoice: undefined });
  await expect(processSignatureCancellation(undefined, repository)).resolves.toEqual({ status: "missing-reference" });
  await expect(processSignatureCancellation("unknown", repository)).resolves.toEqual({ status: "invoice-not-found", invoiceId: "unknown" });
});
```

- [ ] **Step 2: Verify red**

Run: `bun test src/lib/server/dom/signature-cancellation.test.ts`

Expected: FAIL because the no-op result branches are absent.

- [ ] **Step 3: Implement the Drizzle adapter in the handler**

```ts
const result = await processSignatureCancellation(data.external_reference, cancellationRepository);
console.log("[Webhook] SIGNATURE-CANCELLED:", result);
```

`cancellationRepository` must find `pgInvoice` by ID, set `pgOrganization.planId` to null only where it equals `invoice.reference`, and set matching active `pgVpsSubscription` rows to `cancelled` with timestamps.

- [ ] **Step 4: Verify tests and types**

Run: `bun test src/lib/server/dom/signature-cancellation.test.ts; bunx tsc --noEmit`

Expected: both commands exit 0.

- [ ] **Step 5: Commit**

Run: `git add src/app/webhook/dom/route.ts src/lib/server/dom/signature-cancellation.test.ts`

Run: `git commit -m "feat: process DOM cancellation webhooks"`
