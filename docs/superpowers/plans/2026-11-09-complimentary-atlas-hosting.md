# Complimentary Atlas Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Isentar admins e `brenohslima@gmail.com` da mensalidade de hospedagem na VM do Atlas.

**Architecture:** A autorização permanece centralizada em `site-builder/access.ts`. As server actions consomem o predicado para remover exclusivamente o componente de hospedagem da fatura e permitir o deploy direto; a tela recebe a mesma informação para não apresentar cobrança inexistente.

**Tech Stack:** Next.js Server Actions, TypeScript, Bun.

**Spec:** `docs/superpowers/specs/2026-11-09-complimentary-atlas-hosting-design.md`

## Global Constraints

- Não executar comandos nem mudanças contra o banco de produção.
- Só a hospedagem na VM do Atlas é gratuita; domínio continua cobrado.
- Usuários não isentos continuam exigindo assinatura ou checkout para a VM do Atlas.

## Review Focus

- Usuário isento com domínio comprado ainda recebe cobrança pelo domínio.
- Usuário comum ainda recebe cobrança da hospedagem Atlas.
- Publicação isenta direta não cria assinatura mensal de hospedagem.
- Republicação de usuário isento não falha pela checagem de assinatura.

---

### Task 1: Política e checkout da isenção

**Files:**
- Modify: `frontend/src/lib/site-builder/access.ts`
- Modify: `frontend/src/app/(auth)/criador-de-sites/publish-checkout-actions.ts`
- Modify: `frontend/src/app/(auth)/criador-de-sites/publish-actions.ts`
- Test: `frontend/src/app/(auth)/criador-de-sites/publish-checkout-actions.test.ts`

**Interfaces:**
- Produces: `hasComplimentaryAtlasHosting(user: Pick<User, "email" | "isAdmin">): boolean`.

- [x] **Step 1: Write failing tests**

Verify that admins and `brenohslima@gmail.com` publish to `atlas_vm` without a hosting amount, while a normal user retains it.

- [x] **Step 2: Run the tests to verify failure**

Run: `bun test frontend/src/app/(auth)/criador-de-sites/publish-checkout-actions.test.ts`
Expected: FAIL because the checkout always charges the configured hosting amount.

- [x] **Step 3: Implement the server-side exemption**

Use the predicate to skip `hostingAmountBrl` and pass `skipHostingCheck` only for the authorized direct deployment.

- [x] **Step 4: Run focused tests and type-check**

Run: `bun test frontend/src/app/(auth)/criador-de-sites/publish-checkout-actions.test.ts` and `cd frontend; ..\node_modules\.bin\tsc --noEmit`
Expected: PASS and exit code 0.

### Task 2: Publicação UI

**Files:**
- Modify: `frontend/src/app/(auth)/criador-de-sites/[siteId]/publicar/page.tsx`
- Modify: `frontend/src/app/(auth)/criador-de-sites/[siteId]/publicar/components/PublishForm.tsx`

**Interfaces:**
- Consumes: `hasComplimentaryAtlasHosting(user)` from Task 1.
- Produces: `complimentaryAtlasHosting: boolean` prop for `PublishForm`.

- [x] **Step 1: Display the complimentary price state**

Pass the server-computed flag and label the Atlas hosting option as free; exclude its first-month amount from the client total.

- [x] **Step 2: Run type-check and focused tests**

Run: `cd frontend; ..\node_modules\.bin\tsc --noEmit` and Task 1 tests.
Expected: PASS and exit code 0.

### Task 3: Modal de publicação do editor

**Files:**
- Create: `frontend/src/app/(auth)/criador-de-sites/[siteId]/components/publish-pricing.ts`
- Test: `frontend/src/app/(auth)/criador-de-sites/[siteId]/components/publish-pricing.test.ts`
- Modify: `frontend/src/app/(auth)/criador-de-sites/[siteId]/components/PublishSetupModal.tsx`
- Modify: `frontend/src/app/(auth)/criador-de-sites/[siteId]/components/SiteEditorClient.tsx`
- Modify: `frontend/src/app/(auth)/criador-de-sites/[siteId]/page.tsx`

**Interfaces:**
- Produces: `atlasHostingPrice({ target, atlasVmMonthlyBrl, complimentaryAtlasHosting, hostingPaid }): number | null`.

- [x] **Step 1: Write the failing test**

Verify that the editor modal calculates no Atlas VM price for an exempt account and still returns the monthly price for a regular account.

- [x] **Step 2: Run test to verify it fails**

Run: `bun test frontend/src/app/(auth)/criador-de-sites/[siteId]/components/publish-pricing.test.ts`
Expected: FAIL because the shared pricing helper does not exist.

- [x] **Step 3: Pass the server-computed exemption into the editor modal**

Use the shared helper for the modal total and present the selected Atlas hosting as free for the exempt account.

- [x] **Step 4: Run focused tests and type-check**

Run: `bun test frontend/src/app/(auth)/criador-de-sites/[siteId]/components/publish-pricing.test.ts` and `cd frontend; ..\\node_modules\\.bin\\tsc --noEmit`
Expected: PASS and exit code 0.
