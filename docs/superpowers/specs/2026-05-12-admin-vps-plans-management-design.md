# Admin VPS Plans — Subscription Management

**Date:** 2026-05-12  
**Route:** `/admin/vps-plans`  
**Status:** Approved

---

## Goal

Allow admins to suspend (pause) or reactivate VPS subscriptions from the admin panel. Current page shows invoice-derived data with no status control; this replaces it with real subscription data from `pgVpsSubscription`.

---

## Business Rules

### Suspend
- Sets `status = "paused"` and records `pausedAt = now`.
- The renewal cron (`/api/internal/vps-subscriptions/renew`) already skips non-`active` subscriptions, so no billing occurs while paused.

### Reactivate
- Remaining time at pause = `nextChargeDate - pausedAt` (milliseconds).
- New next charge date = `today + remaining`.
- Sets `status = "active"`, `pausedAt = null`, `failureCount = 0`.
- This ensures: a 6-month sub paused at month 2 with 4 months remaining will charge in 4 months from reactivation, not 6.

### Statuses `cancelled` / `failed`
- Read-only in the UI — no actions available.

---

## Schema Change

File: `src/lib/db/schema/tables/vps-subscription.ts`

Add column:
```ts
pausedAt: timestamp("paused_at", { mode: "date" }),
```
Nullable. No default. Run `npx drizzle-kit generate` + `npx drizzle-kit migrate`.

---

## Data Layer

### `src/app/(auth)/admin/vps-plans/actions.ts` — full replacement

**`getVpsPlanSubscriptionsAction()`**
- Reads `pgVpsSubscription` with `with: { user: { columns: { id, name, email } } }`
- Orders by `createdAt desc`
- Returns `VpsPlanRow[]`

**`VpsPlanRow` type:**
```ts
{
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  planId: string;
  planType: "vps" | "vds" | "storage-vps" | "vps-windows";
  intervalMonths: number;
  amountBrl: number;
  status: "active" | "cancelled" | "failed" | "paused";
  nextChargeDate: Date;
  pausedAt: Date | null;
  createdAt: Date;
}
```

**`suspendVpsSubscriptionAction(id: string)`**
1. `getUser()` — redirect if not admin
2. `db.update(pgVpsSubscription).set({ status: "paused", pausedAt: new Date(), updatedAt: new Date() }).where(eq(pgVpsSubscription.id, id))`
3. `revalidatePath("/admin/vps-plans")`

**`reactivateVpsSubscriptionAction(id: string)`**
1. `getUser()` — redirect if not admin
2. Fetch subscription to get `nextChargeDate` and `pausedAt`
3. `remaining = nextChargeDate.getTime() - pausedAt.getTime()`
4. `newNextChargeDate = new Date(Date.now() + remaining)`
5. `db.update(...).set({ status: "active", pausedAt: null, nextChargeDate: newNextChargeDate, failureCount: 0, updatedAt: new Date() })`
6. `revalidatePath("/admin/vps-plans")`

---

## UI

### `src/app/(auth)/admin/vps-plans/page.tsx` — full replacement

**Server component.** Fetches subscriptions, computes stats, passes data to table.

**Stats cards (4):**
| Card | Icon | Color |
|------|------|-------|
| Total | Server | neutral |
| Ativas | CheckCircle | green |
| Pausadas | PauseCircle | yellow |
| Canceladas/Falhas | XCircle | red |

**Table columns:**
| Column | Notes |
|--------|-------|
| Cliente | name + email (two lines) |
| Tipo | Badge: VPS / VDS / Storage / Windows |
| Período | Badge: "1 mês" / "3 meses" / "6 meses" |
| Próx. cobrança | formatted dd/MM/yyyy |
| Valor | BRL formatted |
| Status | colored Badge |
| Ações | `SubscriptionActionsCell` |

### `src/app/(auth)/admin/vps-plans/SubscriptionActionsCell.tsx` — new file

`"use client"` component. Props: `{ id, status, intervalMonths }`.

- **Suspender** (shown when `status === "active"`):  
  `AlertDialog` — "Suspender Assinatura?" with warning text → confirm calls `suspendVpsSubscriptionAction(id)` via `useTransition`
- **Reativar** (shown when `status === "paused"`):  
  Direct button → calls `reactivateVpsSubscriptionAction(id)` via `useTransition`
- **Cancelled/Failed**: renders `—`

---

## File Changelist

| File | Action |
|------|--------|
| `src/lib/db/schema/tables/vps-subscription.ts` | Add `pausedAt` column |
| `src/app/(auth)/admin/vps-plans/actions.ts` | Replace entirely |
| `src/app/(auth)/admin/vps-plans/page.tsx` | Replace entirely |
| `src/app/(auth)/admin/vps-plans/SubscriptionActionsCell.tsx` | Create new |
| `drizzle migration` | Generate + apply |
