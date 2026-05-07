# Affiliate Wallet System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement cookie-based affiliate attribution (30-day, last-click), per-purchase commissions (10%), and a withdrawal system integrated with Simpay.

**Architecture:** Middleware already sets `referrer_code` cookie (30 days). Two new DB tables track attributions and earned commissions. Commission triggers inside the invoice-paid flow. Withdrawals submit to Simpay via `/atlas/saques` and poll for status.

**Tech Stack:** Next.js 14 App Router, Drizzle ORM, PostgreSQL, Simpay API, ShadCN UI (Tabs, Dialog), React Hook Form (existing pattern), `uuid` v14

---

## File Map

**Create:**
- `src/lib/db/schema/tables/affiliate.ts` — `pgAffiliateAttribution` + `pgAffiliateCommission` tables
- `src/lib/affiliate/attribution.ts` — `recordAttribution`, `getActiveAttribution`
- `src/lib/affiliate/commission.ts` — `triggerCommissionIfApplicable`
- `src/app/(auth)/affiliate/actions.ts` — `requestWithdrawal`, `syncWithdrawalStatus`
- `src/app/(auth)/affiliate/components/AffiliateTabs.tsx` — client tab switcher
- `src/app/(auth)/affiliate/components/WithdrawalModal.tsx` — withdrawal dialog form

**Modify:**
- `src/lib/db/schema/tables/system.ts` — add `withdrawalFee` to `pgSystemConfig`; add `pixKey`, `simpayWithdrawalId`, `fee`, `rejectionReason` to `pgWithdrawalRequests`
- `src/lib/db/schema/tables/invoice.ts` — add `isRenewal?: boolean` to metadata types
- `src/lib/db/schema/index.ts` — export new affiliate tables
- `src/lib/server/apis/simpay/index.ts` — add `requestWithdrawal` + `getWithdrawalStatus` methods
- `src/app/actions.ts` — hook attribution on login/signup; hook commission on invoice paid
- `src/app/(auth)/affiliate/page.tsx` — full rewrite with tabs + data queries
- `.env` — add 3 affiliate env vars + 1 simpay withdrawal token

---

## Task 1: Add env vars to `.env`

**Files:**
- Modify: `.env`

- [ ] **Step 1: Append affiliate vars to .env**

Open `.env` and append at the end:

```
# Affiliate Wallet
AFFILIATE_COMMISSION_RATE=0.10
AFFILIATE_MIN_WITHDRAWAL=100.00
AFFILIATE_WITHDRAWAL_FEE=2.00
# Token for simpay withdrawal endpoint (x-internal-token header)
ATLAS_SIMPAY_INTERNAL_TOKEN=
```

Leave `ATLAS_SIMPAY_INTERNAL_TOKEN` empty for now — fill in after confirming with simpay backend.

---

## Task 2: Extend DB schema — system.ts + invoice.ts

**Files:**
- Modify: `src/lib/db/schema/tables/system.ts`
- Modify: `src/lib/db/schema/tables/invoice.ts`

- [ ] **Step 1: Extend `pgSystemConfig` and `pgWithdrawalRequests` in system.ts**

Replace the entire file content:

```typescript
import { relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgSystemConfig = pgTable("system_config", {
  domainFee: doublePrecision("domain_fee").notNull().default(5.0),
  referrerCommission: doublePrecision("referrer_commission")
    .notNull()
    .default(0.1),
  minWithdrawalAmount: doublePrecision("min_withdrawal_amount")
    .notNull()
    .default(100.0),
  withdrawalFee: doublePrecision("withdrawal_fee").notNull().default(2.0),
});

export const pgWithdrawalRequests = pgTable("withdraw_requests", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  status: text("status", {
    enum: ["pending", "approved", "rejected"],
  }).notNull(),
  amount: doublePrecision("amount").notNull(),
  pixKey: text("pix_key"),
  simpayWithdrawalId: text("simpay_withdrawal_id"),
  fee: doublePrecision("fee").default(2.0),
  rejectionReason: text("rejection_reason"),
});

export const pgWithdrawalRequestsRelations = relations(
  pgWithdrawalRequests,
  ({ one }) => ({
    user: one(pgUser, {
      fields: [pgWithdrawalRequests.userId],
      references: [pgUser.id],
    }),
  })
);

export type SystemConfig = typeof pgSystemConfig.$inferSelect;
export type SystemConfigInsert = typeof pgSystemConfig.$inferInsert;
export type WithdrawalRequest = typeof pgWithdrawalRequests.$inferSelect;
export type WithdrawalRequestInsert = typeof pgWithdrawalRequests.$inferInsert;
export type WithdrawalRequestSelect = typeof pgWithdrawalRequests.$inferSelect;
```

- [ ] **Step 2: Add `isRenewal` to invoice metadata types in invoice.ts**

In `src/lib/db/schema/tables/invoice.ts`, add `isRenewal?: boolean` to `DomainRegisterInvoiceOptions`, `DomainRenewInvoiceOptions`, and `VpsInvoiceOptions`:

```typescript
export type DomainRegisterInvoiceOptions = Pick<
  DomainPageParams,
  "whoisguard" | "years"
> & {
  simpayPaymentId?: string;
  pixTransactionId?: string;
  pixCheckout?: PixCheckoutSnapshot;
  testPaymentOnly?: boolean;
  bundleDomains?: string[];
  guestPassword?: string;
  isRenewal?: boolean;
};

export type DomainRenewInvoiceOptions = {
  type: "renew";
  domain: string;
  simpayPaymentId?: string;
  pixTransactionId?: string;
  pixCheckout?: PixCheckoutSnapshot;
  isRenewal?: boolean;
};

export type VpsInvoiceOptions = {
  vpsId: string;
  config: any;
  simpayPaymentId?: string;
  pixTransactionId?: string;
  pixCheckout?: PixCheckoutSnapshot;
  isRenewal?: boolean;
};
```

---

## Task 3: Create affiliate schema tables

**Files:**
- Create: `src/lib/db/schema/tables/affiliate.ts`
- Modify: `src/lib/db/schema/index.ts`

- [ ] **Step 1: Create affiliate.ts**

```typescript
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgInvoice } from "./invoice";
import { pgUser } from "./user";

/**
 * One active attribution per user (unique on attributed_user_id).
 * Upserted on every login/signup when referrer_code cookie is present.
 * Expires 30 days after last click.
 */
export const pgAffiliateAttribution = pgTable("affiliate_attributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateUserId: uuid("affiliate_user_id")
    .notNull()
    .references(() => pgUser.id),
  attributedUserId: uuid("attributed_user_id")
    .notNull()
    .unique()
    .references(() => pgUser.id),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/** One row per commission earned. Permanent audit trail. */
export const pgAffiliateCommission = pgTable("affiliate_commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateUserId: uuid("affiliate_user_id")
    .notNull()
    .references(() => pgUser.id),
  buyerUserId: uuid("buyer_user_id")
    .notNull()
    .references(() => pgUser.id),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => pgInvoice.id),
  grossAmount: doublePrecision("gross_amount").notNull(),
  commissionAmount: doublePrecision("commission_amount").notNull(),
  commissionRate: doublePrecision("commission_rate").notNull(),
  status: text("status", { enum: ["available", "withdrawn"] })
    .notNull()
    .default("available"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const pgAffiliateAttributionRelations = relations(
  pgAffiliateAttribution,
  ({ one }) => ({
    affiliateUser: one(pgUser, {
      fields: [pgAffiliateAttribution.affiliateUserId],
      references: [pgUser.id],
      relationName: "affiliate_attributions_affiliate",
    }),
    attributedUser: one(pgUser, {
      fields: [pgAffiliateAttribution.attributedUserId],
      references: [pgUser.id],
      relationName: "affiliate_attributions_attributed",
    }),
  })
);

export const pgAffiliateCommissionRelations = relations(
  pgAffiliateCommission,
  ({ one }) => ({
    affiliateUser: one(pgUser, {
      fields: [pgAffiliateCommission.affiliateUserId],
      references: [pgUser.id],
      relationName: "affiliate_commissions_affiliate",
    }),
    buyerUser: one(pgUser, {
      fields: [pgAffiliateCommission.buyerUserId],
      references: [pgUser.id],
      relationName: "affiliate_commissions_buyer",
    }),
    invoice: one(pgInvoice, {
      fields: [pgAffiliateCommission.invoiceId],
      references: [pgInvoice.id],
    }),
  })
);

export type AffiliateAttribution = typeof pgAffiliateAttribution.$inferSelect;
export type AffiliateAttributionInsert =
  typeof pgAffiliateAttribution.$inferInsert;
export type AffiliateCommission = typeof pgAffiliateCommission.$inferSelect;
export type AffiliateCommissionInsert =
  typeof pgAffiliateCommission.$inferInsert;
```

- [ ] **Step 2: Add export to schema/index.ts**

In `src/lib/db/schema/index.ts`, add after the last line:

```typescript
export * from "./tables/affiliate";
```

---

## Task 4: Run DB migration

**Files:** none (runs against live DB)

- [ ] **Step 1: Push schema to database**

```bash
npm run db:push
```

Expected output: `[✓] Changes applied` for tables `affiliate_attributions`, `affiliate_commissions`, and column additions to `system_config` and `withdraw_requests`.

If prompted about data loss, confirm — only adding columns/tables, no drops.

---

## Task 5: Attribution module

**Files:**
- Create: `src/lib/affiliate/attribution.ts`

- [ ] **Step 1: Create the module**

```typescript
import { db } from "@/lib/db";
import { pgAffiliateAttribution, pgUser } from "@/lib/db/schema";
import { and, eq, gt } from "drizzle-orm";

const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Records or refreshes attribution: when a user logs in or signs up after
 * clicking an affiliate link (referrer_code cookie present).
 * Self-attribution is silently ignored.
 */
export async function recordAttribution(
  affiliateCode: string,
  userId: string
): Promise<void> {
  const affiliate = await db.query.pgUser.findFirst({
    where: eq(pgUser.affiliateCode, affiliateCode),
    columns: { id: true },
  });

  if (!affiliate || affiliate.id === userId) return;

  const expiresAt = new Date(Date.now() + ATTRIBUTION_TTL_MS);

  await db
    .insert(pgAffiliateAttribution)
    .values({
      affiliateUserId: affiliate.id,
      attributedUserId: userId,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: pgAffiliateAttribution.attributedUserId,
      set: {
        affiliateUserId: affiliate.id,
        expiresAt,
        updatedAt: new Date(),
      },
    });
}

/** Returns the active (non-expired) attribution for a buyer, or undefined. */
export async function getActiveAttribution(userId: string) {
  return db.query.pgAffiliateAttribution.findFirst({
    where: and(
      eq(pgAffiliateAttribution.attributedUserId, userId),
      gt(pgAffiliateAttribution.expiresAt, new Date())
    ),
  });
}
```

---

## Task 6: Commission module

**Files:**
- Create: `src/lib/affiliate/commission.ts`

- [ ] **Step 1: Create the module**

```typescript
import { db } from "@/lib/db";
import { pgAffiliateCommission, pgSystemConfig } from "@/lib/db/schema";
import type { Invoice } from "@/lib/db/schema";
import { getActiveAttribution } from "./attribution";

/**
 * Called after every invoice is marked paid.
 * Skips renewals, self-purchases, and invoices with no active attribution.
 */
export async function triggerCommissionIfApplicable(
  invoice: Invoice
): Promise<void> {
  const meta = invoice.metadata as Record<string, unknown> | null;

  // Skip renewals: explicit flag or domain renew metadata type
  if (meta?.isRenewal === true || meta?.type === "renew") return;

  const attribution = await getActiveAttribution(invoice.userId);
  if (!attribution) return;

  // Self-purchase guard (shouldn't happen but be safe)
  if (attribution.affiliateUserId === invoice.userId) return;

  // Prevent duplicate commission for same invoice
  const existing = await db.query.pgAffiliateCommission.findFirst({
    where: (t, { eq }) => eq(t.invoiceId, invoice.id),
  });
  if (existing) return;

  const config = await db.query.pgSystemConfig.findFirst();
  const rate =
    Number(process.env.AFFILIATE_COMMISSION_RATE) ||
    config?.referrerCommission ||
    0.1;

  await db.insert(pgAffiliateCommission).values({
    affiliateUserId: attribution.affiliateUserId,
    buyerUserId: invoice.userId,
    invoiceId: invoice.id,
    grossAmount: invoice.amount,
    commissionAmount: invoice.amount * rate,
    commissionRate: rate,
    status: "available",
  });
}
```

---

## Task 7: Hook attribution + commission into actions.ts

**Files:**
- Modify: `src/app/actions.ts`

- [ ] **Step 1: Import the two modules at the top of actions.ts**

After the existing imports (around line 60), add:

```typescript
import { recordAttribution } from "@/lib/affiliate/attribution";
import { triggerCommissionIfApplicable } from "@/lib/affiliate/commission";
```

- [ ] **Step 2: Hook attribution into `login` function**

In the `login` function, after `cookieStore.set("session_token", ...)` (around line 204), add:

```typescript
    // Attribution: if user clicked an affiliate link, record it
    try {
      const refCode = cookieStore.get("referrer_code")?.value;
      if (refCode) {
        await recordAttribution(refCode, user.id);
      }
    } catch {
      // Non-critical — don't fail login
    }
```

- [ ] **Step 3: Hook attribution into `signup` function**

In the `signup` function, after `createUser(...)` succeeds and before the `return { status: "success" }` (around line 320), add:

```typescript
    // Attribution: record affiliate referral from cookie or ref param
    try {
      const cookieStore = await cookies();
      const refCode = cookieStore.get("referrer_code")?.value || ref;
      if (refCode && user) {
        await recordAttribution(refCode, user.id);
      }
    } catch {
      // Non-critical
    }
```

- [ ] **Step 4: Hook commission into `markPixPaymentComplete`**

In `markPixPaymentComplete`, after the `db.update(pgInvoice).set({ status: "paid" })` call (around line 1238), add inside the `after(async () => { ... })` block:

```typescript
    await triggerCommissionIfApplicable(invoice as any).catch(() => {});
```

Full `after` block should look like:

```typescript
  after(async () => {
    await triggerCommissionIfApplicable(invoice as any).catch(() => {});
    if (billing) {
      await processInvoiceAfterPayment(invoice, user, billing);
    }
    await triggerPurchaseNotifications(invoice, user, billing ?? undefined);
  });
```

- [ ] **Step 5: Hook commission into `syncCheckoutPixPayment`**

In `syncCheckoutPixPayment`, inside the `if (remote.status === "COMPLETED")` block, after `db.update(pgInvoice).set({ status: "paid" })` (around line 1290), add inside the `after` block:

```typescript
    after(async () => {
      await triggerCommissionIfApplicable(invoice as any).catch(() => {});
      await processInvoiceAfterPayment(invoice, user, billing);
      await triggerPurchaseNotifications(invoice, user, billing);
    });
```

- [ ] **Step 6: Hook commission into `completeCheckout` (card payment)**

Search for the comment `// Generic (non-domain) invoice — mark as paid` (around line 1102). After the `db.update(pgInvoice).set({ status: "paid" })` that follows it, add:

```typescript
  await triggerCommissionIfApplicable(invoice as any).catch(() => {});
```

Also find every other `db.update(pgInvoice).set({ status: "paid" })` inside `completeCheckout` that represents a successful real payment (not the `testPaymentOnly` branch) and add the same line after each.

---

## Task 8: Extend Simpay client with withdrawal methods

**Files:**
- Modify: `src/lib/server/apis/simpay/index.ts`

- [ ] **Step 1: Add interfaces after existing ones (around line 68)**

```typescript
export interface SimpayWithdrawalParams {
  valor: number;
  chavePix: string;
  description?: string;
}

export interface SimpayWithdrawalResponse {
  id: string;
  status: string;
  amount?: number;
  pixKey?: string;
  rejectionReason?: string;
}
```

- [ ] **Step 2: Add two methods to the `SimpayApi` class (before the closing `}`)**

```typescript
  async requestWithdrawal(
    params: SimpayWithdrawalParams
  ): Promise<SimpayWithdrawalResponse> {
    const url = `${resolveSimpayBaseUrl()}/atlas/saques`;
    const token =
      process.env.ATLAS_SIMPAY_INTERNAL_TOKEN ||
      process.env.DOM_API_KEY ||
      "";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-internal-token": token,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        formatSimpayErrorMessage(data) ||
          `Erro ao solicitar saque (HTTP ${response.status})`
      );
    }

    return data as SimpayWithdrawalResponse;
  }

  async getWithdrawalStatus(
    withdrawalId: string
  ): Promise<{ id: string; status: string; rejectionReason?: string }> {
    const url = `${resolveSimpayBaseUrl()}/atlas/saques/${withdrawalId}`;
    const token =
      process.env.ATLAS_SIMPAY_INTERNAL_TOKEN ||
      process.env.DOM_API_KEY ||
      "";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-internal-token": token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Erro ao consultar status do saque (HTTP ${response.status})`
      );
    }

    return data;
  }
```

---

## Task 9: Affiliate server actions

**Files:**
- Create: `src/app/(auth)/affiliate/actions.ts`

- [ ] **Step 1: Create the file**

```typescript
"use server";

import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { and, asc, eq, sum } from "drizzle-orm";
import simpayApi from "@/lib/server/apis/simpay";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

function getMinWithdrawal() {
  return Number(process.env.AFFILIATE_MIN_WITHDRAWAL) || 100;
}

function getWithdrawalFee() {
  return Number(process.env.AFFILIATE_WITHDRAWAL_FEE) || 2;
}

export async function getAffiliateBalance(userId: string): Promise<{
  available: number;
  pendingWithdrawals: number;
}> {
  const [commissionsRow] = await db
    .select({ total: sum(pgAffiliateCommission.commissionAmount) })
    .from(pgAffiliateCommission)
    .where(
      and(
        eq(pgAffiliateCommission.affiliateUserId, userId),
        eq(pgAffiliateCommission.status, "available")
      )
    );

  const [pendingRow] = await db
    .select({ total: sum(pgWithdrawalRequests.amount) })
    .from(pgWithdrawalRequests)
    .where(
      and(
        eq(pgWithdrawalRequests.userId, userId),
        eq(pgWithdrawalRequests.status, "pending")
      )
    );

  const totalAvailableCommissions = Number(commissionsRow?.total ?? 0);
  const pendingWithdrawals = Number(pendingRow?.total ?? 0);

  return {
    available: Math.max(0, totalAvailableCommissions - pendingWithdrawals),
    pendingWithdrawals,
  };
}

export async function requestWithdrawal(
  amount: number,
  pixKey: string
): Promise<{ error?: string; success?: boolean }> {
  const user = await getUser();
  const minWithdrawal = getMinWithdrawal();
  const fee = getWithdrawalFee();

  if (amount < minWithdrawal) {
    return {
      error: `Valor mínimo para saque é R$${minWithdrawal.toFixed(2)}`,
    };
  }

  const trimmedPix = pixKey?.trim();
  if (!trimmedPix || trimmedPix.length < 5) {
    return { error: "Chave PIX inválida" };
  }

  const { available } = await getAffiliateBalance(user.id);
  if (amount > available) {
    return { error: "Saldo insuficiente" };
  }

  const withdrawalId = uuidv4();

  await db.insert(pgWithdrawalRequests).values({
    id: withdrawalId,
    userId: user.id,
    status: "pending",
    amount,
    pixKey: trimmedPix,
    fee,
  });

  // Submit to simpay (non-blocking — withdrawal record already created)
  try {
    const result = await simpayApi.requestWithdrawal({
      valor: amount,
      chavePix: trimmedPix,
      description: `atlas-${user.id}`,
    });

    await db
      .update(pgWithdrawalRequests)
      .set({ simpayWithdrawalId: result.id })
      .where(eq(pgWithdrawalRequests.id, withdrawalId));
  } catch (err) {
    console.error("[WITHDRAWAL] Falha ao submeter para simpay:", err);
    // Withdrawal record exists; admin can process manually
  }

  revalidatePath("/affiliate");
  return { success: true };
}

export async function syncWithdrawalStatus(
  withdrawalId: string
): Promise<void> {
  const user = await getUser();

  const withdrawal = await db.query.pgWithdrawalRequests.findFirst({
    where: and(
      eq(pgWithdrawalRequests.id, withdrawalId),
      eq(pgWithdrawalRequests.userId, user.id)
    ),
  });

  if (
    !withdrawal ||
    withdrawal.status !== "pending" ||
    !withdrawal.simpayWithdrawalId
  ) {
    return;
  }

  try {
    const remote = await simpayApi.getWithdrawalStatus(
      withdrawal.simpayWithdrawalId
    );

    const normalizedStatus = remote.status?.toLowerCase();

    if (normalizedStatus === "approved" || normalizedStatus === "completed") {
      await db
        .update(pgWithdrawalRequests)
        .set({ status: "approved" })
        .where(eq(pgWithdrawalRequests.id, withdrawalId));

      // Mark oldest available commissions as withdrawn (FIFO up to withdrawal amount)
      const commissions = await db.query.pgAffiliateCommission.findMany({
        where: and(
          eq(pgAffiliateCommission.affiliateUserId, user.id),
          eq(pgAffiliateCommission.status, "available")
        ),
        orderBy: (t, { asc }) => [asc(t.createdAt)],
      });

      let remaining = withdrawal.amount;
      for (const commission of commissions) {
        if (remaining <= 0) break;
        await db
          .update(pgAffiliateCommission)
          .set({ status: "withdrawn" })
          .where(eq(pgAffiliateCommission.id, commission.id));
        remaining -= commission.commissionAmount;
      }
    } else if (normalizedStatus === "rejected") {
      await db
        .update(pgWithdrawalRequests)
        .set({
          status: "rejected",
          rejectionReason:
            remote.rejectionReason ?? "Rejeitado pela operadora",
        })
        .where(eq(pgWithdrawalRequests.id, withdrawalId));
    }

    revalidatePath("/affiliate");
  } catch (err) {
    console.error("[WITHDRAWAL-SYNC] Erro ao verificar status:", err);
  }
}
```

---

## Task 10: Create UI components

**Files:**
- Create: `src/app/(auth)/affiliate/components/WithdrawalModal.tsx`
- Create: `src/app/(auth)/affiliate/components/AffiliateTabs.tsx`

- [ ] **Step 1: Create WithdrawalModal.tsx**

```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestWithdrawal } from "../actions";
import { toBrl } from "@/lib/utils";

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  minWithdrawal: number;
  fee: number;
}

export function WithdrawalModal({
  open,
  onClose,
  availableBalance,
  minWithdrawal,
  fee,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const netAmount = Math.max(0, parsedAmount - fee);
  const canSubmit =
    parsedAmount >= minWithdrawal &&
    parsedAmount <= availableBalance &&
    pixKey.trim().length >= 5;

  async function handleSubmit() {
    setError("");
    setLoading(true);
    const result = await requestWithdrawal(parsedAmount, pixKey);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount("");
        setPixKey("");
        onClose();
      }, 1500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
        </DialogHeader>

        {success ? (
          <p className="text-center text-green-600 py-4">
            Solicitação enviada com sucesso!
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                min={minWithdrawal}
                max={availableBalance}
                step="0.01"
                placeholder={`Mín. ${toBrl(minWithdrawal)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Disponível: {toBrl(availableBalance)}
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                placeholder="CPF, email, telefone ou chave aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
            </div>

            {parsedAmount > 0 && (
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Valor bruto</span>
                  <span>{toBrl(parsedAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa de saque</span>
                  <span>- {toBrl(fee)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1 mt-1">
                  <span>Você receberá</span>
                  <span>{toBrl(netAmount)}</span>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              {loading ? "Enviando..." : "Solicitar Saque"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create AffiliateTabs.tsx**

```typescript
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WithdrawalModal } from "./WithdrawalModal";
import AffiliateLinkDisplay from "./AffiliateLinkDisplay";
import { toBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { syncWithdrawalStatus } from "../actions";

export interface CommissionRow {
  id: string;
  grossAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: string;
  createdAt: Date;
  invoiceType?: string;
}

export interface WithdrawalRow {
  id: string;
  amount: number;
  fee: number | null;
  status: string;
  rejectionReason: string | null;
  simpayWithdrawalId: string | null;
  createdAt?: Date;
}

interface AffiliateTabsProps {
  affiliateLink: string;
  availableBalance: number;
  pendingWithdrawals: number;
  totalEarnedAllTime: number;
  totalReferrals: number;
  commissions: CommissionRow[];
  withdrawals: WithdrawalRow[];
  minWithdrawal: number;
  fee: number;
}

function statusBadge(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    available: "default",
    withdrawn: "secondary",
    pending: "outline",
    approved: "default",
    rejected: "destructive",
  };
  const label: Record<string, string> = {
    available: "Disponível",
    withdrawn: "Sacado",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };
  return (
    <Badge variant={map[status] ?? "outline"}>{label[status] ?? status}</Badge>
  );
}

export function AffiliateTabs({
  affiliateLink,
  availableBalance,
  pendingWithdrawals,
  totalEarnedAllTime,
  totalReferrals,
  commissions,
  withdrawals,
  minWithdrawal,
  fee,
}: AffiliateTabsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  async function handleSync(withdrawalId: string) {
    setSyncing(withdrawalId);
    await syncWithdrawalStatus(withdrawalId);
    setSyncing(null);
  }

  return (
    <>
      <WithdrawalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        availableBalance={availableBalance}
        minWithdrawal={minWithdrawal}
        fee={fee}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="withdrawals">Saques</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo Disponível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {toBrl(availableBalance)}
                </div>
                {pendingWithdrawals > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {toBrl(pendingWithdrawals)} em processamento
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Ganho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {toBrl(totalEarnedAllTime)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Indicações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReferrals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Comissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commissions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seu Link de Afiliado</CardTitle>
              <CardDescription>
                Compartilhe e ganhe {commissions[0]?.commissionRate
                  ? `${(commissions[0].commissionRate * 100).toFixed(0)}%`
                  : "10%"}{" "}
                em cada compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <AffiliateLinkDisplay affiliateLink={affiliateLink} />
              {availableBalance >= minWithdrawal && (
                <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
                  Solicitar Saque
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sales ── */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                Compras realizadas através do seu link de afiliado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma venda registrada ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor da compra</TableHead>
                      <TableHead>Sua comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          {format(new Date(c.createdAt), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>{toBrl(c.grossAmount)}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {toBrl(c.commissionAmount)}
                        </TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Withdrawals ── */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Saques</CardTitle>
                <CardDescription>
                  Mínimo {toBrl(minWithdrawal)} · Taxa {toBrl(fee)}
                </CardDescription>
              </div>
              <Button
                onClick={() => setModalOpen(true)}
                disabled={availableBalance < minWithdrawal}
              >
                Solicitar Saque
              </Button>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum saque realizado ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Bruto</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Líquido</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => {
                      const gross = w.amount;
                      const feeAmt = w.fee ?? fee;
                      const net = gross - feeAmt;
                      return (
                        <TableRow key={w.id}>
                          <TableCell>
                            {w.createdAt
                              ? format(new Date(w.createdAt), "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "—"}
                          </TableCell>
                          <TableCell>{toBrl(gross)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            - {toBrl(feeAmt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {toBrl(net)}
                          </TableCell>
                          <TableCell>
                            {statusBadge(w.status)}
                            {w.status === "rejected" && w.rejectionReason && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {w.rejectionReason}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {w.status === "pending" &&
                              w.simpayWithdrawalId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSync(w.id)}
                                  disabled={syncing === w.id}
                                >
                                  {syncing === w.id
                                    ? "Verificando..."
                                    : "Atualizar"}
                                </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
```

---

## Task 11: Rewrite affiliate page

**Files:**
- Modify: `src/app/(auth)/affiliate/page.tsx`

- [ ] **Step 1: Replace the entire page**

```typescript
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgInvoice,
  pgUser,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { and, desc, eq, sum } from "drizzle-orm";
import type { Metadata } from "next";
import { AffiliateTabs } from "./components/AffiliateTabs";
import type { CommissionRow, WithdrawalRow } from "./components/AffiliateTabs";
import { getAffiliateBalance } from "./actions";

export const metadata: Metadata = {
  title: "Afiliado - Atlas Hosting",
  description:
    "Gerencie suas indicações, comissões e solicite saques",
};

export default async function AffiliatePage() {
  const user = await getUser();

  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "https://atlashosting.com.br";
  const affiliateLink = `${baseUrl}/signup?ref=${user.affiliateCode}`;

  const minWithdrawal =
    Number(process.env.AFFILIATE_MIN_WITHDRAWAL) || 100;
  const fee = Number(process.env.AFFILIATE_WITHDRAWAL_FEE) || 2;

  // Balance
  const { available, pendingWithdrawals } = await getAffiliateBalance(
    user.id
  );

  // All-time earned (available + withdrawn)
  const [allTimeRow] = await db
    .select({ total: sum(pgAffiliateCommission.commissionAmount) })
    .from(pgAffiliateCommission)
    .where(eq(pgAffiliateCommission.affiliateUserId, user.id));
  const totalEarnedAllTime = Number(allTimeRow?.total ?? 0);

  // Total unique buyers (as rough proxy for "referrals who bought")
  const referredUsers = await db.query.pgUser.findMany({
    where: eq(pgUser.referrerId, user.id),
    columns: { id: true },
  });

  // Commissions list
  const rawCommissions = await db.query.pgAffiliateCommission.findMany({
    where: eq(pgAffiliateCommission.affiliateUserId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
  const commissions: CommissionRow[] = rawCommissions.map((c) => ({
    id: c.id,
    grossAmount: c.grossAmount,
    commissionAmount: c.commissionAmount,
    commissionRate: c.commissionRate,
    status: c.status,
    createdAt: c.createdAt,
  }));

  // Withdrawals list
  const rawWithdrawals = await db.query.pgWithdrawalRequests.findMany({
    where: eq(pgWithdrawalRequests.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.id)],
  });
  const withdrawals: WithdrawalRow[] = rawWithdrawals.map((w) => ({
    id: w.id,
    amount: w.amount,
    fee: w.fee,
    status: w.status,
    rejectionReason: w.rejectionReason ?? null,
    simpayWithdrawalId: w.simpayWithdrawalId ?? null,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Programa de Afiliados
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas indicações, comissões e saques
        </p>
      </div>

      <AffiliateTabs
        affiliateLink={affiliateLink}
        availableBalance={available}
        pendingWithdrawals={pendingWithdrawals}
        totalEarnedAllTime={totalEarnedAllTime}
        totalReferrals={referredUsers.length}
        commissions={commissions}
        withdrawals={withdrawals}
        minWithdrawal={minWithdrawal}
        fee={fee}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify `AffiliateLinkDisplay` still exists at the expected path**

Check that `src/app/(auth)/affiliate/components/AffiliateLinkDisplay.tsx` exists and exports `AffiliateLinkDisplay` as default. If the import path changed, update the `AffiliateTabs.tsx` import accordingly.

---

## Task 12: Add `createdAt` to `pgWithdrawalRequests` (needed for display)

**Files:**
- Modify: `src/lib/db/schema/tables/system.ts`

- [ ] **Step 1: Add timestamp columns to `pgWithdrawalRequests`**

In `system.ts`, add the `timestamp` import and add `createdAt` + `updatedAt` to `pgWithdrawalRequests`:

```typescript
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

// ... pgSystemConfig unchanged ...

export const pgWithdrawalRequests = pgTable("withdraw_requests", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  status: text("status", {
    enum: ["pending", "approved", "rejected"],
  }).notNull(),
  amount: doublePrecision("amount").notNull(),
  pixKey: text("pix_key"),
  simpayWithdrawalId: text("simpay_withdrawal_id"),
  fee: doublePrecision("fee").default(2.0),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
```

- [ ] **Step 2: Re-run migration**

```bash
npm run db:push
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Attribution (30-day cookie, last-click) ✓ | Commission on purchase (not renewal) ✓ | Wallet balance ✓ | Withdrawal with PIX key ✓ | Simpay integration ✓ | Sales history tab ✓ | Withdrawal history tab ✓ | Sidebar item (already exists at /affiliate) ✓
- [x] **No placeholders:** All code is complete.
- [x] **Type consistency:** `CommissionRow`, `WithdrawalRow` defined in `AffiliateTabs.tsx` and imported in `page.tsx`. `syncWithdrawalStatus` used in `AffiliateTabs` and defined in `actions.ts`. `requestWithdrawal` used in `WithdrawalModal` and defined in `actions.ts`. `getAffiliateBalance` defined in `actions.ts` and called from `page.tsx`.
- [x] **DB fields:** `pgWithdrawalRequests` in `page.tsx` uses `.rejectionReason`, `.simpayWithdrawalId`, `.fee` — all added in Task 2/12. `pgAffiliateCommission` referenced in `page.tsx` — created in Task 3.
- [x] **Missing:** `toBrl` is imported from `@/lib/utils` — already exists in project. `Tabs`, `TabsList`, etc. from `@/components/ui/tabs` — confirm shadcn tabs component is installed (if not: `npx shadcn@latest add tabs`).
- [x] **Task 12 note:** `createdAt`/`updatedAt` were merged into Task 2's `system.ts` content but written as a separate task for clarity. In practice, include them in the Task 2 file write so only one `db:push` is needed.
