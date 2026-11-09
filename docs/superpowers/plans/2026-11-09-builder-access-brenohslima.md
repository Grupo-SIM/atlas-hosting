# Liberação individual do Criador de Sites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Autorizar `brenohslima@gmail.com` a acessar e ver o Criador de Sites, sem tornar a conta administradora.

**Architecture:** Centralizar a política de autorização em `site-builder/access.ts` e derivar uma flag de navegação dela no layout autenticado. Sidebar e menu mobile usarão essa flag apenas para o item do Criador de Sites, mantendo a política de Admin inalterada.

**Tech Stack:** Next.js, TypeScript, Bun test runner, React.

**Spec:** `docs/superpowers/specs/2026-11-09-builder-access-brenohslima-design.md`

## Global Constraints

- Não executar comandos nem mudanças contra o banco de produção.
- Não conceder `isAdmin` à conta autorizada.
- Comparar e-mail sem distinção entre maiúsculas e minúsculas.

## Review Focus

- Administradores continuam autorizados mesmo com outro endereço de e-mail — coberto no teste do predicado.
- A conta autorizada com capitalização diferente continua autorizada — coberto no teste do predicado.
- Usuário comum não autorizado continua sem rota nem item de navegação — coberto no teste do predicado e na prop de navegação.
- Acesso ao Criador não expõe Administração — preservado pelo uso separado de `isAdmin`.
- O menu mobile recebe a mesma flag da sidebar — coberto pela alteração do layout autenticado.

---

### Task 1: Política de acesso do Criador

**Files:**
- Create: `frontend/src/lib/site-builder/access.test.ts`
- Modify: `frontend/src/lib/site-builder/access.ts`

**Interfaces:**
- Produces: `canAccessSiteBuilder(user: Pick<User, "isAdmin" | "email">): boolean`.

- [x] **Step 1: Write the failing tests**

Test that an admin is authorized, `brenohslima@gmail.com` is authorized case-insensitively, and an ordinary email is refused.

- [x] **Step 2: Run test to verify it fails**

Run: `bun test frontend/src/lib/site-builder/access.test.ts`
Expected: FAIL because `canAccessSiteBuilder` does not exist.

- [x] **Step 3: Implement `canAccessSiteBuilder` and use it from `getBuilderUser`**

Keep the allowlist private to `access.ts`; return true for `isAdmin` or the normalized authorized e-mail.

- [x] **Step 4: Run test to verify it passes**

Run: `bun test frontend/src/lib/site-builder/access.test.ts`
Expected: PASS.

### Task 2: Visibilidade do item de navegação

**Files:**
- Modify: `frontend/src/app/(auth)/layout.tsx`
- Modify: `frontend/src/components/layouts/components/Sidebar.tsx`
- Modify: `frontend/src/components/layouts/components/MobileSidebarSheet.tsx`
- Modify: `frontend/src/components/layouts/navigation.ts`

**Interfaces:**
- Consumes: `canAccessSiteBuilder(user)` from Task 1.
- Produces: `builderOnly?: boolean` navigation item condition and `canAccessSiteBuilder: boolean` layout props.

- [x] **Step 1: Extend the failing navigation test or add one if absent**

Assert that the Criador de Sites item is present when `canAccessSiteBuilder` is true and absent when it is false, independently of `isAdmin`.

- [x] **Step 2: Run the targeted test to verify it fails**

Run the established component/unit-test command for the new test.
Expected: FAIL because navigation only has `adminOnly`.

- [x] **Step 3: Implement the separate builder visibility flag**

Mark only the Criador de Sites item as builder-only; pass the derived access flag through desktop and mobile navigation filtering. Do not alter admin filtering.

- [x] **Step 4: Run focused tests and type-check**

Run: `bun test frontend/src/lib/site-builder/access.test.ts` and `cd frontend; ..\node_modules\.bin\tsc --noEmit`
Expected: PASS and exit code 0.

- [x] **Step 5: Format changed source files and inspect the diff**

Run: `.\node_modules\.bin\biome check --write` for only the changed TypeScript files, followed by `git diff --check`.
