# Template Gallery First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Abrir a seleção de templates na primeira visita ao Criador de Sites.

**Architecture:** A página servidor já carrega os sites do proprietário autenticado. Após a consulta, ela redirecionará para a rota de criação somente quando a lista estiver vazia; todos os demais caminhos preservam a renderização atual.

**Tech Stack:** Next.js App Router, TypeScript, Bun.

**Spec:** `docs/superpowers/specs/2026-11-09-template-gallery-first-design.md`

## Global Constraints

- Não executar comandos nem mudanças contra o banco de produção.
- Não duplicar a galeria de templates.
- Não mudar o comportamento de contas que já possuem sites.

## Review Focus

- Lista vazia redireciona para `/criador-de-sites/novo`.
- Lista não vazia continua renderizando os cards existentes.
- A decisão ocorre após filtrar por `user.id`, preservando isolamento entre usuários.

---

### Task 1: Redirecionamento da primeira visita

**Files:**
- Modify: `frontend/src/app/(auth)/criador-de-sites/page.tsx`
- Test: `frontend/src/app/(auth)/criador-de-sites/page.test.ts`

**Interfaces:**
- Consumes: resultado de `db.select(...).where(eq(pgBuilderSite.userId, user.id))`.
- Produces: `redirect("/criador-de-sites/novo")` quando não houver sites.

- [x] **Step 1: Write the failing test**

Mocke a consulta vazia e verifique que a página solicita o redirecionamento para `/criador-de-sites/novo`.

- [x] **Step 2: Run test to verify it fails**

Run: `bun test frontend/src/app/(auth)/criador-de-sites/page.test.ts`
Expected: FAIL because the empty state currently renders a link.

- [x] **Step 3: Add the minimal server redirect**

Import `redirect` from `next/navigation` and invoke it after `mySites` is loaded when `mySites.length === 0`.

- [x] **Step 4: Run focused test and type-check**

Run: `bun test frontend/src/app/(auth)/criador-de-sites/page.test.ts` and `cd frontend; ..\node_modules\.bin\tsc --noEmit`
Expected: PASS and exit code 0.
