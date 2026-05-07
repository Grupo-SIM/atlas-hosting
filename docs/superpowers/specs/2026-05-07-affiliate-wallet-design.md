# Affiliate Wallet System — Design Spec
**Date:** 2026-05-07

## Overview
Every atlas user gets an affiliate wallet. When anyone makes a new purchase (not renewal) after clicking that user's affiliate link, the link owner earns 10% commission. Users can request withdrawal to PIX via simpay (min R$100, fee R$2), approved/rejected by simpay admin.

---

## Environment Variables

```env
AFFILIATE_COMMISSION_RATE=0.10         # 10%
AFFILIATE_MIN_WITHDRAWAL=100.00        # R$100 minimum
AFFILIATE_WITHDRAWAL_FEE=2.00          # R$2 fixed fee
```

---

## Database Schema (Drizzle, PostgreSQL)

### New table: `affiliate_attribution`
Tracks which affiliate is attributed to which user/visitor (30-day cookie, last-click wins).

```ts
{
  id: uuid PK
  affiliateUserId: uuid FK → users.id
  visitorCookieId: text (anonymous cookie ID before signup)
  attributedUserId: uuid FK → users.id (null until user registers/identified)
  expiresAt: timestamp
  createdAt: timestamp
}
```

### New table: `affiliate_commission`
One row per commission earned. Permanent audit trail.

```ts
{
  id: uuid PK
  affiliateUserId: uuid FK → users.id
  buyerUserId: uuid FK → users.id
  invoiceId: uuid FK → invoices.id
  grossAmount: numeric(12,2)      # invoice amount in BRL
  commissionAmount: numeric(12,2) # grossAmount * rate
  commissionRate: numeric(5,4)    # snapshot of rate at time of purchase
  status: enum(available|withdrawn)
  createdAt: timestamp
}
```

### Extend `pgWithdrawalRequests` (already exists in system.ts)
Add:
```ts
  pixKey: text
  simpayWithdrawalId: text (nullable)
  fee: numeric(12,2)              # snapshot of fee at time of request
  rejectionReason: text (nullable)
```

### Extend invoice metadata
Add `isRenewal: boolean` to invoice metadata JSON. Renewal invoices do NOT trigger commission.

---

## Attribution Flow

1. User lands on any atlas URL with `?ref=CODE`
2. Next.js middleware sets cookie `atlas_ref=CODE` (30 days, httpOnly, sameSite=lax)
3. Cookie overwrites previous (last-click wins)
4. On signup (`/signup`): if cookie present → lookup user by affiliateCode → create `affiliate_attribution` with `attributedUserId`
5. On login of existing user who has cookie: create/update `affiliate_attribution` for that user

---

## Commission Flow

Triggered inside `markInvoicePaid()` (already in `actions.ts`):

1. If `invoice.metadata.isRenewal === true` → skip, no commission
2. Query `affiliate_attribution` where `attributedUserId = invoice.userId` AND `expiresAt > now()`
3. If found → insert `affiliate_commission`:
   - `commissionAmount = invoice.amount * AFFILIATE_COMMISSION_RATE`
   - `status = available`
4. If no active attribution → skip

---

## Withdrawal Flow

1. User opens `/affiliate` → clicks "Solicitar Saque"
2. Modal: enter `amount` (>= MIN_WITHDRAWAL) + `pixKey`
3. Atlas validates: amount >= min, available balance >= amount
4. Creates `pgWithdrawalRequests` (status `pending`, fee snapshot)
5. Calls simpay `POST /saques` with `{ valor: amount, chavePix: pixKey }` + description `atlas-{userId}`
6. Saves returned `simpayWithdrawalId`
7. Status sync: when user views saques tab OR via background check, call `GET /saques/{simpayWithdrawalId}`
8. On `APPROVED`: mark commissions as `withdrawn`, update withdrawal status
9. On `REJECTED`: save `rejectionReason`, balance unchanged (commissions remain `available`)

---

## UI Structure

### Sidebar
Existing "Afiliados" nav item → `/affiliate` (unchanged route)

### `/affiliate` page — 3 tabs

**Tab 1: Visão Geral**
- Available balance (sum of `available` commissions minus pending withdrawals)
- Affiliate link with copy button
- Stats: total referrals, total earned all-time, total withdrawn

**Tab 2: Vendas**
Table columns: Date | Product type | Purchase amount | Your commission (%) | Status

**Tab 3: Saques**
Table columns: Date | Gross amount | Fee (R$2) | Net amount | Status (pending/approved/rejected) | Rejection reason (if any)
Button: "Solicitar Saque" → opens modal

### Withdrawal modal
- Amount input (min = AFFILIATE_MIN_WITHDRAWAL)
- PIX key input
- Summary: "Você receberá R$X (R$Y bruto - R$2 taxa)"
- Confirm button

---

## Simpay API calls

Using existing `SimpayApi` client pattern in `src/lib/server/apis/simpay/index.ts`:

```
POST /saques         → submit withdrawal request
GET  /saques/:id     → check status (poll on page load)
```

Auth: same JWT/token pattern used by existing simpay integration.

---

## What does NOT change

- Existing `/admin/affiliates` page (admin view) — kept as-is or lightly updated to show commission data
- Existing `affiliateCode` generation on users — unchanged
- Existing `referrerId` on users — kept but now supplemented by `affiliate_attribution` (more accurate)
- Checkout flow — only `markInvoicePaid` gets the commission hook added

---

## Out of scope

- Email notification when commission is earned
- Admin approval flow in atlas (simpay handles approval)
- Affiliate link click tracking/analytics
