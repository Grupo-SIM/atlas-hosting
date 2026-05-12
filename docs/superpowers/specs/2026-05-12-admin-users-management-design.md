# Admin Users Management Design

**Date:** 2026-05-12  
**Route:** `/admin/users`  
**Status:** Approved

---

## Goal

Allow admins to view all users with their wallet balances and suspend or reactivate accounts. Suspended users are redirected to a `/suspended` page when accessing the panel.

---

## Schema Change

File: `src/lib/db/schema/tables/user.ts`

Add column after `deletedAt`:
```ts
suspendedAt: timestamp("suspended_at", { mode: "date" }),
```
Nullable, no default. Run `npm run db:push`.

---

## Auth Flow Change

File: `src/lib/auth/index.ts` — function `getUser`

After fetching the user from DB, before returning, add:
```ts
if (user.suspendedAt) redirect("/suspended");
```

---

## Suspended Page

File: `src/app/suspended/page.tsx` — public page (no auth wrapper)

Simple message: "Sua conta foi suspensa. Entre em contato com o suporte."
No layout required — standalone page.

---

## Admin Page

### `src/app/(auth)/admin/users/page.tsx`

Server component. Admin guard (`getUser` + `isAdmin` check). Calls `getAllUsersWithBalanceAction()`.

**Stats cards (3):**
- Total de usuários
- Ativos (suspendedAt is null)
- Suspensos (suspendedAt is not null)

**Table columns:**
| Column | Notes |
|--------|-------|
| Usuário | name + email (two lines) |
| Saldo | wallet.balance formatted as BRL (balance is in centavos → divide by 100) |
| Criado em | formatted dd/MM/yyyy |
| Status | Badge: Ativo (green) / Suspenso (red) |
| Ações | `UserActionsCell` |

---

## Data Layer

### `src/app/(auth)/admin/users/actions.ts`

**`UserRow` type:**
```ts
{
  id: string;
  name: string;
  email: string;
  balanceCents: number;
  suspendedAt: Date | null;
  createdAt: Date;
}
```

**`getAllUsersWithBalanceAction()`**
- `db.query.pgUser.findMany` with `with: { organization: { with: { wallet: true } } }`
- Orders by `createdAt desc`
- Maps to `UserRow`, balance from `user.organization?.wallet?.balance ?? 0`

**`suspendUserAction(id)`**
- Admin guard
- Cannot suspend self (check `admin.id !== id`)
- Cannot suspend other admins
- `db.update(pgUser).set({ suspendedAt: new Date() })`
- `revalidatePath("/admin/users")`

**`reactivateUserAction(id)`**
- Admin guard
- `db.update(pgUser).set({ suspendedAt: null })`
- `revalidatePath("/admin/users")`

---

## Client Component

### `src/app/(auth)/admin/users/UserActionsCell.tsx`

`"use client"`. Props: `{ id, suspendedAt: Date | null }`.

- `suspendedAt === null` → AlertDialog "Suspender conta?" → confirm calls `suspendUserAction(id)`
- `suspendedAt !== null` → direct button "Reativar" → calls `reactivateUserAction(id)`
- Uses `useTransition` for loading state

---

## File Changelist

| File | Action |
|------|--------|
| `src/lib/db/schema/tables/user.ts` | Add `suspendedAt` column |
| `src/lib/auth/index.ts` | Add suspension redirect in `getUser` |
| `src/app/suspended/page.tsx` | Create public suspended page |
| `src/app/(auth)/admin/users/actions.ts` | Create with 3 actions |
| `src/app/(auth)/admin/users/UserActionsCell.tsx` | Create client component |
| `src/app/(auth)/admin/users/page.tsx` | Create admin users page |
| DB | `npm run db:push` |
