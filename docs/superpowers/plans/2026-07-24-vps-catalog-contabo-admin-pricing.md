# VPS Catalog: Contabo-Synced Specs + Admin-Managed Multi-Currency Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded VPS/VDS/Storage-VPS/VPS-Windows plan data (specs + prices) that is currently duplicated across 4 client pages and 1 server action with a single DB-backed catalog. OS images sync live from the Contabo API. Prices are entered by an admin in the admin panel, in EUR, USD, or BRL per price row, and converted to BRL at checkout time.

**Architecture:** Two new tables (`vps_catalog_plans`, `vps_catalog_options`) hold specs and every priceable line item (duration, location, storage, addon, image, object storage). A third table (`vps_catalog_images`) caches the OS image list pulled from Contabo's `GET /v1/compute/images`. A single server-side pricing function (`calculateVpsPrice`) reads the catalog and replaces the hardcoded pricing block in `src/app/actions.ts`. The 4 client configure pages and the marketing/landing pages fetch the same catalog through one new API route instead of importing local mock objects. An admin UI under `/admin/vps-catalog` lets the admin edit specs and prices and trigger an image sync from Contabo.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM (Postgres), react-hook-form + zod (existing admin form pattern), Bun runtime, existing `currencyConversion` module (`src/lib/server/apis/currency`) for EUR/USD/BRL conversion, axios for the Contabo HTTP client.

---

## Important scope note — read before implementing

Contabo's public API (verified against `https://api.contabo.com/`, full endpoint list pulled 2026-07-24) has **no endpoint for products, pricing, or a pre-purchase spec catalog**. The only "configs" it exposes ahead of a purchase are:

- `GET /v1/compute/images` — the real, live list of OS images (id, name, osType, version) Contabo currently offers. This is what gets synced automatically.
- `GET /v1/compute/instances/{instanceId}` — real specs (`cpuCores`, `ramMb`, `diskMb`, `region`, `productId`, `addOns`, ...) but only for an instance that has **already been created**. Atlas today provisions VPS manually (the admin buys the VM by hand on Contabo's panel; the customer's monitoring bot self-registers via a token — see `src/lib/db/schema/tables/vps.ts`). There is no code anywhere in this repo that calls Contabo's instance-creation API.

So "specs" (vCPU/RAM/disk/traffic per plan tier) **cannot** be pulled live from Contabo before a sale — they must be entered once by the admin per plan, the same as today, just in a DB row instead of a hardcoded object. This plan does that, and additionally makes the **OS image list** genuinely live (Task 2 + Task 5). It does not attempt automatic post-purchase spec reconciliation, since Atlas doesn't call Contabo's provisioning API today — that would be a separate, larger project.

Prices are 100% admin-entered (never pulled from Contabo, since no such endpoint exists), in whichever of EUR/USD/BRL the admin picks per row.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/db/schema/tables/vps-catalog.ts` | New tables: `pgVpsCatalogPlan`, `pgVpsCatalogOption`, `pgVpsCatalogImage` |
| `src/lib/db/schema/index.ts` | Export the new table file |
| `src/lib/server/apis/contabo/index.ts` | Contabo OAuth2 client + `getImages()` |
| `src/lib/server/apis/contabo/types.ts` | Contabo API response types |
| `src/lib/server/vps-pricing.ts` | `calculateVpsPrice()` — the one place price math happens now |
| `src/app/api/vps-catalog/[planType]/[planKey]/route.ts` | Public GET route the client pages fetch from |
| `src/app/(auth)/admin/vps-catalog/actions.ts` | Admin server actions: CRUD plans/options, sync images |
| `src/app/(auth)/admin/vps-catalog/page.tsx` | Admin catalog list (tabs by planType) |
| `src/app/(auth)/admin/vps-catalog/[planId]/page.tsx` | Admin plan editor (specs + options table) |
| `src/app/(auth)/admin/vps-catalog/[planId]/OptionForm.tsx` | Client form to create/edit one price row |
| `src/app/(auth)/admin/vps-catalog/ImageSyncButton.tsx` | Client button that triggers the Contabo image sync action |
| `scripts/seed-vps-catalog.ts` | One-time script: migrates today's hardcoded numbers into the new tables |
| `src/app/actions.ts` | `createVpsInvoice` refactored to call `calculateVpsPrice` instead of the hardcoded block (~lines 2753-3020) |
| `src/app/vps/configure/[id]/page.tsx`, `src/app/vds/configure/[id]/page.tsx`, `src/app/vps-windows/configure/[id]/page.tsx`, `src/app/vps-armazenamento/configure/[id]/page.tsx` | Remove local `plansData` mock, fetch from the new API route |
| `src/app/landing/components/VpsCloudPage.tsx`, `VdsPage.tsx`, `VpsWindowsPage.tsx`, `VpsStoragePage.tsx`, `src/app/(auth)/plans/components/PlansCarousel.tsx` | Remove local hardcoded arrays, fetch "starting at" price from the new API route |

---

### Task 1: Catalog schema

**Files:**
- Create: `src/lib/db/schema/tables/vps-catalog.ts`
- Modify: `src/lib/db/schema/index.ts`

- [ ] **Step 1: Write the schema file**

```ts
// src/lib/db/schema/tables/vps-catalog.ts
import {
  pgTable,
  text,
  uuid,
  integer,
  doublePrecision,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const vpsCatalogPlanTypeEnum = pgEnum("vps_catalog_plan_type", [
  "vps",
  "vds",
  "storage-vps",
  "vps-windows",
]);

export const vpsCatalogCurrencyEnum = pgEnum("vps_catalog_currency", [
  "EUR",
  "USD",
  "BRL",
]);

export const vpsCatalogOptionCategoryEnum = pgEnum("vps_catalog_option_category", [
  "duration",
  "location",
  "storage",
  "addon",
  "image",
  "object_storage",
]);

/**
 * One row per sellable tier (what today is a key like "10", "20", "s", "m" inside
 * the hardcoded `plansData` objects). Specs are admin-entered because Contabo's API
 * has no pre-purchase product/spec endpoint (see plan doc scope note).
 */
export const pgVpsCatalogPlan = pgTable("vps_catalog_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  planKey: text("plan_key").notNull(), // "10" | "20" | "s" | "m" | ... — matches config.type/planId used across checkout
  planType: vpsCatalogPlanTypeEnum("plan_type").notNull(),
  contaboProductId: text("contabo_product_id"), // e.g. "V45" — admin reference only, not fetched from any API
  name: text("name").notNull(), // "Cloud VPS 20"
  vcpuLabel: text("vcpu_label").notNull(), // "6 núcleos de vCPU"
  ramLabel: text("ram_label").notNull(), // "12 GB de RAM"
  storageLabel: text("storage_label").notNull(), // "100 GB NVMe ou SSD de 200 GB"
  snapshotsLabel: text("snapshots_label").notNull(),
  trafficLabel: text("traffic_label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Every priceable line item for a plan: durations, region surcharges, storage
 * upgrades, addons (backup/private network/additional IP/managed/monitoring),
 * OS/panel images, object storage tiers. One generic shape avoids 6 near-identical
 * tables — every category is "a key, a label, a price the admin set".
 */
export const pgVpsCatalogOption = pgTable("vps_catalog_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => pgVpsCatalogPlan.id, { onDelete: "cascade" }),
  category: vpsCatalogOptionCategoryEnum("category").notNull(),
  optionKey: text("option_key").notNull(), // "12" (months) | "us-east" (location) | "ssd-400" (storage) | "backup" (addon) | contabo imageId (image) | "1tb" (object storage)
  label: text("label").notNull(),
  currency: vpsCatalogCurrencyEnum("currency").notNull().default("EUR"),
  amount: doublePrecision("amount").notNull().default(0), // recurring monthly amount, in `currency`
  setupAmount: doublePrecision("setup_amount"), // one-time setup fee — only meaningful for category="duration"
  compareAtAmount: doublePrecision("compare_at_amount"), // "was" price shown struck-through — only category="duration"
  discountLabel: text("discount_label"), // "ECONOMIZE 20%"
  freeIncluded: boolean("free_included").notNull().default(false), // true = render "Incluído"/"Livre" instead of a price
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}), // latency+recommended (location), icon (image), unit (object_storage)
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Live cache of Contabo's OS image list (GET /v1/compute/images). Refreshed by an
 * admin action, never hand-typed. Prices for images live in pgVpsCatalogOption
 * (category="image", optionKey=contaboImageId) because Contabo does not return prices.
 */
export const pgVpsCatalogImage = pgTable("vps_catalog_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  contaboImageId: text("contabo_image_id").notNull().unique(),
  name: text("name").notNull(),
  osType: text("os_type"),
  version: text("version"),
  standardImage: boolean("standard_image").notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at", { mode: "date" }).defaultNow().notNull(),
});

export const vpsCatalogPlanRelations = relations(pgVpsCatalogPlan, ({ many }) => ({
  options: many(pgVpsCatalogOption),
}));

export const vpsCatalogOptionRelations = relations(pgVpsCatalogOption, ({ one }) => ({
  plan: one(pgVpsCatalogPlan, {
    fields: [pgVpsCatalogOption.planId],
    references: [pgVpsCatalogPlan.id],
  }),
}));

export type VpsCatalogPlan = typeof pgVpsCatalogPlan.$inferSelect;
export type VpsCatalogPlanInsert = typeof pgVpsCatalogPlan.$inferInsert;
export type VpsCatalogOption = typeof pgVpsCatalogOption.$inferSelect;
export type VpsCatalogOptionInsert = typeof pgVpsCatalogOption.$inferInsert;
export type VpsCatalogImage = typeof pgVpsCatalogImage.$inferSelect;
```

- [ ] **Step 2: Register the table file**

In `src/lib/db/schema/index.ts`, add this line after the existing `vps-subscription` export:

```ts
export * from "./tables/vps-catalog";
```

- [ ] **Step 3: Push the schema**

Run: `npm run db:push`
Expected: drizzle-kit reports the 3 new tables + 3 new enums created, no destructive changes to existing tables. Confirm by connecting to the DB and running `\dt vps_catalog*` (or the project's usual DB inspection method) and seeing `vps_catalog_plans`, `vps_catalog_options`, `vps_catalog_images`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema/tables/vps-catalog.ts src/lib/db/schema/index.ts
git commit -m "feat: add vps catalog schema (plans, options, images)"
```

---

### Task 2: Contabo API client (OAuth2 + image sync)

**Files:**
- Create: `src/lib/server/apis/contabo/types.ts`
- Create: `src/lib/server/apis/contabo/index.ts`
- Test: `src/tests/test-contabo-client.ts` (bun script, matching the existing convention in `src/tests/test-server-status.ts` — this repo has no jest/vitest, `bun run` scripts that print pass/fail are the established pattern)

- [ ] **Step 1: Write the types**

```ts
// src/lib/server/apis/contabo/types.ts
export interface ContaboTokenResponse {
  access_token: string;
  expires_in: number; // seconds
  token_type: string;
}

export interface ContaboImage {
  imageId: string;
  name: string;
  description?: string;
  osType?: string;
  version?: string;
  standardImage: boolean;
  uploadedSize?: number;
  minStorageGb?: number;
  status?: string;
  errorMessage?: string;
  createdDate?: string;
}

export interface ContaboImagesListResponse {
  _pagination: { page: number; size: number; totalElements: number; totalPages: number };
  data: ContaboImage[];
}
```

- [ ] **Step 2: Write the client**

```ts
// src/lib/server/apis/contabo/index.ts
import axios from "axios";
import { randomUUID } from "crypto";
import type { ContaboImage, ContaboImagesListResponse, ContaboTokenResponse } from "./types";

const TOKEN_URL = "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token";
const BASE_URL = "https://api.contabo.com/v1";

class ContaboApi {
  private token: string | null = null;
  private tokenExpiresAt = 0;

  private requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`[Contabo] variável de ambiente ausente: ${name}`);
    return value;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;

    const params = new URLSearchParams({
      client_id: this.requiredEnv("CONTABO_CLIENT_ID"),
      client_secret: this.requiredEnv("CONTABO_CLIENT_SECRET"),
      username: this.requiredEnv("CONTABO_API_USER"),
      password: this.requiredEnv("CONTABO_API_PASSWORD"),
      grant_type: "password",
    });

    const { data } = await axios.post<ContaboTokenResponse>(TOKEN_URL, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.token = data.access_token;
    // refresh 60s early to avoid using a token that expires mid-request
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.token;
  }

  private async authedGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const token = await this.getAccessToken();
    const { data } = await axios.get<T>(`${BASE_URL}${path}`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-request-id": randomUUID(),
      },
    });
    return data;
  }

  /** Pulls every OS image Contabo currently offers. Paginates until totalPages is exhausted. */
  public async getImages(): Promise<ContaboImage[]> {
    const images: ContaboImage[] = [];
    let page = 1;
    while (true) {
      const res = await this.authedGet<ContaboImagesListResponse>("/compute/images", {
        page,
        size: 100,
      });
      images.push(...res.data);
      if (page >= res._pagination.totalPages) break;
      page += 1;
    }
    return images;
  }
}

const contaboApi = new ContaboApi();
export default contaboApi;
```

- [ ] **Step 3: Add required env vars**

Add to the project's local `.env` (not committed) and to whatever secrets store production uses:

```
CONTABO_CLIENT_ID=
CONTABO_CLIENT_SECRET=
CONTABO_API_USER=
CONTABO_API_PASSWORD=
```

These come from the Contabo customer panel under API credentials (my.contabo.com → API Management).

- [ ] **Step 4: Write a manual verification script**

```ts
#!/usr/bin/env bun
// src/tests/test-contabo-client.ts
import contaboApi from "@/lib/server/apis/contabo";

async function main() {
  const images = await contaboApi.getImages();
  if (!Array.isArray(images) || images.length === 0) {
    console.error("FAIL: getImages() returned no images");
    process.exit(1);
  }
  const sample = images[0];
  if (!sample.imageId || !sample.name) {
    console.error("FAIL: image missing imageId/name", sample);
    process.exit(1);
  }
  console.log(`PASS: fetched ${images.length} images from Contabo. Sample:`, sample);
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
```

- [ ] **Step 5: Run it against real Contabo credentials**

Run: `bun run src/tests/test-contabo-client.ts`
Expected: `PASS: fetched N images from Contabo. Sample: { imageId: ..., name: ... }`. If it fails with a 401, double-check the 4 env vars match the API credentials shown in my.contabo.com.

- [ ] **Step 6: Commit**

```bash
git add src/lib/server/apis/contabo src/tests/test-contabo-client.ts
git commit -m "feat: add contabo API client with OAuth2 token handling and image sync"
```

---

### Task 3: Currency helper for the catalog

**Files:**
- Create: `src/lib/server/vps-currency.ts`

The existing `currencyConversion` module (`src/lib/server/apis/currency/index.ts`) already does cached daily FX lookups via `.convert({ from, to, amount })`. This task just adds a thin, catalog-specific wrapper so the pricing engine (Task 4) doesn't deal with lowercase/uppercase currency code mismatches (the existing module expects lowercase codes like `"eur"`, the catalog enum is uppercase `"EUR"`).

- [ ] **Step 1: Write the wrapper**

```ts
// src/lib/server/vps-currency.ts
import currencyConversion from "@/lib/server/apis/currency";
import type { VpsCatalogOption } from "@/lib/db/schema";

export type CatalogCurrency = "EUR" | "USD" | "BRL";

/** Converts a catalog amount (in EUR/USD/BRL) to BRL for charging. No-op if already BRL. */
export async function toBrl(amount: number, currency: CatalogCurrency): Promise<number> {
  if (currency === "BRL") return amount;
  return currencyConversion.convert({
    from: currency.toLowerCase(),
    to: "brl",
    amount,
  });
}

/** Formats a catalog option's price as the admin entered it, e.g. "€ 9,00" / "US$ 9.00" / "R$ 45,00". */
export function formatCatalogPrice(option: Pick<VpsCatalogOption, "amount" | "currency" | "freeIncluded">): string {
  if (option.freeIncluded) return "Incluído";
  const symbols: Record<CatalogCurrency, string> = { EUR: "€", USD: "US$", BRL: "R$" };
  const locale = option.currency === "BRL" ? "pt-BR" : "en-US";
  return `${symbols[option.currency as CatalogCurrency]} ${option.amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/server/vps-currency.ts
git commit -m "feat: add catalog currency conversion/formatting helpers"
```

---

### Task 4: Pricing engine

**Files:**
- Create: `src/lib/server/vps-pricing.ts`
- Test: `src/tests/test-vps-pricing.ts`

This function is the single replacement for the hardcoded `basePrices`, `locationPrices`, storage/addon `if` chains currently duplicated inside `createVpsInvoice` (`src/app/actions.ts:2753-3020`) and inside each configure page's client-side preview.

- [ ] **Step 1: Write the engine**

```ts
// src/lib/server/vps-pricing.ts
import { db } from "@/lib/db";
import { pgVpsCatalogPlan, pgVpsCatalogOption } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { toBrl } from "./vps-currency";

export type VpsPlanType = "vps" | "vds" | "storage-vps" | "vps-windows";

export interface VpsPriceSelection {
  planType: VpsPlanType;
  planKey: string; // "10" | "s" | ...
  durationMonths: number; // must match an option with category="duration", optionKey=String(durationMonths)
  locationKey?: string; // optionKey of a category="location" row
  storageKey?: string; // optionKey of a category="storage" row
  addonKeys?: string[]; // optionKeys of category="addon" rows
  imageKeys?: string[]; // optionKeys of category="image" rows (contaboImageId)
  objectStorageKey?: string; // optionKey of a category="object_storage" row
}

export interface VpsPriceBreakdownLine {
  category: string;
  key: string;
  label: string;
  monthlyAmount: number; // in the option's own currency
  currency: "EUR" | "USD" | "BRL";
}

export interface VpsPriceResult {
  planId: string; // pgVpsCatalogPlan.id, needed by callers to store a stable reference
  monthlyAmountBrl: number;
  setupAmountBrl: number;
  breakdown: VpsPriceBreakdownLine[];
}

export class VpsPricingError extends Error {}

/** Loads a plan + its active options by (planType, planKey). Throws if not found. */
async function loadPlan(planType: VpsPlanType, planKey: string) {
  const plan = await db.query.pgVpsCatalogPlan.findFirst({
    where: and(
      eq(pgVpsCatalogPlan.planType, planType),
      eq(pgVpsCatalogPlan.planKey, planKey),
      eq(pgVpsCatalogPlan.active, true)
    ),
    with: { options: { where: eq(pgVpsCatalogOption.active, true) } },
  });
  if (!plan) throw new VpsPricingError(`Plano não encontrado: ${planType}/${planKey}`);
  return plan;
}

function findOption(options: typeof pgVpsCatalogOption.$inferSelect[], category: string, key: string) {
  return options.find((o) => o.category === category && o.optionKey === key);
}

/**
 * Computes the full recurring monthly price (converted to BRL) and one-time setup
 * fee for a given plan + selected options. This is the ONLY place VPS pricing math
 * happens — both the checkout server action and the client preview call the API
 * route that wraps this function, so they can never drift.
 */
export async function calculateVpsPrice(selection: VpsPriceSelection): Promise<VpsPriceResult> {
  const plan = await loadPlan(selection.planType, selection.planKey);
  const options = plan.options;

  const durationOption = findOption(options, "duration", String(selection.durationMonths));
  if (!durationOption) {
    throw new VpsPricingError(
      `Duração ${selection.durationMonths} meses não configurada para o plano ${selection.planKey}`
    );
  }

  const breakdown: VpsPriceBreakdownLine[] = [
    {
      category: "duration",
      key: durationOption.optionKey,
      label: durationOption.label,
      monthlyAmount: durationOption.amount,
      currency: durationOption.currency,
    },
  ];

  const addKeys: Array<{ category: "location" | "storage" | "addon" | "image" | "object_storage"; key?: string }> = [
    { category: "location", key: selection.locationKey },
    { category: "storage", key: selection.storageKey },
    { category: "object_storage", key: selection.objectStorageKey },
  ];

  for (const { category, key } of addKeys) {
    if (!key) continue;
    const opt = findOption(options, category, key);
    if (!opt) continue; // unknown/retired option id — silently skip rather than fail checkout
    if (opt.freeIncluded) continue;
    breakdown.push({ category, key, label: opt.label, monthlyAmount: opt.amount, currency: opt.currency });
  }

  for (const key of selection.addonKeys ?? []) {
    const opt = findOption(options, "addon", key);
    if (!opt || opt.freeIncluded) continue;
    breakdown.push({ category: "addon", key, label: opt.label, monthlyAmount: opt.amount, currency: opt.currency });
  }

  for (const key of selection.imageKeys ?? []) {
    const opt = findOption(options, "image", key);
    if (!opt || opt.freeIncluded) continue;
    breakdown.push({ category: "image", key, label: opt.label, monthlyAmount: opt.amount, currency: opt.currency });
  }

  let monthlyAmountBrl = 0;
  for (const line of breakdown) {
    monthlyAmountBrl += await toBrl(line.monthlyAmount, line.currency);
  }

  const setupAmountBrl = durationOption.setupAmount
    ? await toBrl(durationOption.setupAmount, durationOption.currency)
    : 0;

  return { planId: plan.id, monthlyAmountBrl, setupAmountBrl, breakdown };
}
```

- [ ] **Step 2: Write a manual verification script**

This needs at least one seeded plan to run against — run it after Task 8 (seed) instead of right now, but write it in this task so it's ready:

```ts
#!/usr/bin/env bun
// src/tests/test-vps-pricing.ts
import { calculateVpsPrice } from "@/lib/server/vps-pricing";

async function main() {
  const result = await calculateVpsPrice({
    planType: "vps",
    planKey: "10",
    durationMonths: 1,
  });

  if (result.monthlyAmountBrl <= 0) {
    console.error("FAIL: expected a positive monthlyAmountBrl, got", result.monthlyAmountBrl);
    process.exit(1);
  }
  if (result.breakdown.length === 0) {
    console.error("FAIL: expected a non-empty breakdown");
    process.exit(1);
  }
  console.log("PASS:", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
```

Run after Task 8 is done: `bun run src/tests/test-vps-pricing.ts`
Expected: `PASS:` followed by a result whose `monthlyAmountBrl` is close to `9.00 * <current EUR/BRL rate>` (the seeded Cloud VPS 10 / 1-month price).

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/vps-pricing.ts src/tests/test-vps-pricing.ts
git commit -m "feat: add centralized vps pricing engine"
```

---

### Task 5: Public catalog API route

**Files:**
- Create: `src/app/api/vps-catalog/[planType]/[planKey]/route.ts`

This is what the 4 configure pages and the landing pages call instead of importing a local `plansData` object.

- [ ] **Step 1: Write the route**

```ts
// src/app/api/vps-catalog/[planType]/[planKey]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgVpsCatalogPlan, pgVpsCatalogOption } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { formatCatalogPrice } from "@/lib/server/vps-currency";

const VALID_TYPES = ["vps", "vds", "storage-vps", "vps-windows"] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planType: string; planKey: string }> }
) {
  const { planType, planKey } = await params;

  if (!VALID_TYPES.includes(planType as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "planType inválido" }, { status: 400 });
  }

  const plan = await db.query.pgVpsCatalogPlan.findFirst({
    where: and(
      eq(pgVpsCatalogPlan.planType, planType as (typeof VALID_TYPES)[number]),
      eq(pgVpsCatalogPlan.planKey, planKey),
      eq(pgVpsCatalogPlan.active, true)
    ),
    with: { options: { where: eq(pgVpsCatalogOption.active, true) } },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  const grouped = {
    durations: plan.options.filter((o) => o.category === "duration"),
    locations: plan.options.filter((o) => o.category === "location"),
    storageTypes: plan.options.filter((o) => o.category === "storage"),
    addons: plan.options.filter((o) => o.category === "addon"),
    images: plan.options.filter((o) => o.category === "image"),
    objectStorage: plan.options.filter((o) => o.category === "object_storage"),
  };

  const withDisplayPrice = <T extends { amount: number; currency: "EUR" | "USD" | "BRL"; freeIncluded: boolean }>(
    rows: T[]
  ) => rows.map((r) => ({ ...r, displayPrice: formatCatalogPrice(r) }));

  return NextResponse.json({
    id: plan.id,
    planKey: plan.planKey,
    planType: plan.planType,
    name: plan.name,
    vcpuLabel: plan.vcpuLabel,
    ramLabel: plan.ramLabel,
    storageLabel: plan.storageLabel,
    snapshotsLabel: plan.snapshotsLabel,
    trafficLabel: plan.trafficLabel,
    durations: withDisplayPrice(grouped.durations),
    locations: withDisplayPrice(grouped.locations),
    storageTypes: withDisplayPrice(grouped.storageTypes),
    addons: withDisplayPrice(grouped.addons),
    images: withDisplayPrice(grouped.images),
    objectStorage: withDisplayPrice(grouped.objectStorage),
  });
}
```

- [ ] **Step 2: Verify manually**

Run: `npm run dev`, then in another terminal: `curl http://localhost:3000/api/vps-catalog/vps/10`
Expected (once Task 8's seed has run): a JSON object with `name: "Cloud VPS 10"` and a non-empty `durations` array. Before the seed runs, expect `404 { "error": "Plano não encontrado" }` — that's fine at this point in the plan.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/vps-catalog/[planType]/[planKey]/route.ts"
git commit -m "feat: add public vps catalog API route"
```

---

### Task 6: Admin server actions (CRUD)

**Files:**
- Create: `src/app/(auth)/admin/vps-catalog/actions.ts`

Follows the existing admin action pattern in `src/app/(auth)/admin/vps-plans/actions.ts` (auth check via `getUser()` + `isAdmin`, then `revalidatePath`).

- [ ] **Step 1: Write the actions**

```ts
// src/app/(auth)/admin/vps-catalog/actions.ts
"use server";

import { db } from "@/lib/db";
import { pgVpsCatalogPlan, pgVpsCatalogOption, pgVpsCatalogImage } from "@/lib/db/schema";
import type { VpsCatalogPlanInsert, VpsCatalogOptionInsert } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import contaboApi from "@/lib/server/apis/contabo";

async function requireAdmin() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");
  return admin;
}

export async function listVpsCatalogPlansAction() {
  await requireAdmin();
  return db.query.pgVpsCatalogPlan.findMany({
    orderBy: [asc(pgVpsCatalogPlan.planType), asc(pgVpsCatalogPlan.sortOrder)],
  });
}

export async function getVpsCatalogPlanAction(planId: string) {
  await requireAdmin();
  return db.query.pgVpsCatalogPlan.findFirst({
    where: eq(pgVpsCatalogPlan.id, planId),
    with: { options: { orderBy: [asc(pgVpsCatalogOption.category), asc(pgVpsCatalogOption.sortOrder)] } },
  });
}

export async function createVpsCatalogPlanAction(data: Omit<VpsCatalogPlanInsert, "id" | "createdAt" | "updatedAt">) {
  await requireAdmin();
  const [plan] = await db.insert(pgVpsCatalogPlan).values(data).returning();
  revalidatePath("/admin/vps-catalog");
  return plan;
}

export async function updateVpsCatalogPlanAction(
  planId: string,
  data: Partial<Omit<VpsCatalogPlanInsert, "id" | "createdAt" | "updatedAt">>
) {
  await requireAdmin();
  await db
    .update(pgVpsCatalogPlan)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pgVpsCatalogPlan.id, planId));
  revalidatePath("/admin/vps-catalog");
  revalidatePath(`/admin/vps-catalog/${planId}`);
}

export async function deleteVpsCatalogPlanAction(planId: string) {
  await requireAdmin();
  await db.delete(pgVpsCatalogPlan).where(eq(pgVpsCatalogPlan.id, planId));
  revalidatePath("/admin/vps-catalog");
}

export async function upsertVpsCatalogOptionAction(
  data: Omit<VpsCatalogOptionInsert, "id" | "createdAt" | "updatedAt"> & { id?: string }
) {
  await requireAdmin();
  if (data.id) {
    const { id, ...rest } = data;
    await db
      .update(pgVpsCatalogOption)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(pgVpsCatalogOption.id, id));
  } else {
    await db.insert(pgVpsCatalogOption).values(data);
  }
  revalidatePath(`/admin/vps-catalog/${data.planId}`);
}

export async function deleteVpsCatalogOptionAction(optionId: string, planId: string) {
  await requireAdmin();
  await db.delete(pgVpsCatalogOption).where(eq(pgVpsCatalogOption.id, optionId));
  revalidatePath(`/admin/vps-catalog/${planId}`);
}

/** Pulls the current OS image list from Contabo and upserts it into vps_catalog_images. */
export async function syncContaboImagesAction(): Promise<{ synced: number }> {
  await requireAdmin();
  const images = await contaboApi.getImages();

  for (const img of images) {
    await db
      .insert(pgVpsCatalogImage)
      .values({
        contaboImageId: img.imageId,
        name: img.name,
        osType: img.osType ?? null,
        version: img.version ?? null,
        standardImage: img.standardImage,
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pgVpsCatalogImage.contaboImageId,
        set: {
          name: img.name,
          osType: img.osType ?? null,
          version: img.version ?? null,
          standardImage: img.standardImage,
          lastSyncedAt: new Date(),
        },
      });
  }

  revalidatePath("/admin/vps-catalog");
  return { synced: images.length };
}

export async function listSyncedContaboImagesAction() {
  await requireAdmin();
  return db.query.pgVpsCatalogImage.findMany({ orderBy: [asc(pgVpsCatalogImage.name)] });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/admin/vps-catalog/actions.ts
git commit -m "feat: add admin server actions for vps catalog CRUD and image sync"
```

---

### Task 7: Admin UI

**Files:**
- Create: `src/app/(auth)/admin/vps-catalog/page.tsx`
- Create: `src/app/(auth)/admin/vps-catalog/[planId]/page.tsx`
- Create: `src/app/(auth)/admin/vps-catalog/[planId]/OptionForm.tsx`
- Create: `src/app/(auth)/admin/vps-catalog/ImageSyncButton.tsx`
- Reference pattern: `src/app/(auth)/admin/components/PlanForm.tsx` (react-hook-form + zod + shadcn `Form*` components + `useTransition`), `src/app/(auth)/admin/vps-plans/page.tsx` (server component fetching + stats cards + table layout)

- [ ] **Step 1: List page**

```tsx
// src/app/(auth)/admin/vps-catalog/page.tsx
import Link from "next/link";
import { listVpsCatalogPlansAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { ImageSyncButton } from "./ImageSyncButton";

const TYPE_LABELS: Record<string, string> = {
  vps: "Cloud VPS",
  vds: "Cloud VDS",
  "storage-vps": "VPS Armazenamento",
  "vps-windows": "VPS Windows",
};

export default async function VpsCatalogPage() {
  const plans = await listVpsCatalogPlansAction();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catálogo de VPS</h1>
        <ImageSyncButton />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Plano</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Specs</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left" />
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-t">
                <td className="p-3 font-medium">{plan.name}</td>
                <td className="p-3">{TYPE_LABELS[plan.planType] ?? plan.planType}</td>
                <td className="p-3 text-muted-foreground">
                  {plan.vcpuLabel} · {plan.ramLabel}
                </td>
                <td className="p-3">
                  <Badge variant={plan.active ? "default" : "secondary"}>
                    {plan.active ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/vps-catalog/${plan.id}`} className="text-sky-500 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Image sync button**

```tsx
// src/app/(auth)/admin/vps-catalog/ImageSyncButton.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { syncContaboImagesAction } from "./actions";

export function ImageSyncButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            const { synced } = await syncContaboImagesAction();
            toast.success(`${synced} imagens sincronizadas da Contabo`);
          } catch {
            toast.error("Falha ao sincronizar imagens da Contabo");
          }
        })
      }
    >
      <RefreshCw className={isPending ? "animate-spin" : ""} />
      Sincronizar imagens (Contabo)
    </Button>
  );
}
```

- [ ] **Step 3: Plan editor page (specs form + options table)**

```tsx
// src/app/(auth)/admin/vps-catalog/[planId]/page.tsx
import { notFound } from "next/navigation";
import { getVpsCatalogPlanAction } from "../actions";
import { OptionForm } from "./OptionForm";
import { formatCatalogPrice } from "@/lib/server/vps-currency";

export default async function VpsCatalogPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const plan = await getVpsCatalogPlanAction(planId);
  if (!plan) notFound();

  const categories = ["duration", "location", "storage", "addon", "image", "object_storage"] as const;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{plan.name}</h1>
        <p className="text-muted-foreground">
          {plan.vcpuLabel} · {plan.ramLabel} · {plan.storageLabel}
        </p>
      </div>

      {categories.map((category) => {
        const rows = plan.options.filter((o) => o.category === category);
        return (
          <section key={category} className="space-y-3">
            <h2 className="text-lg font-semibold capitalize">{category.replace("_", " ")}</h2>
            <div className="rounded-md border divide-y">
              {rows.map((option) => (
                <div key={option.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      chave: {option.optionKey} · {formatCatalogPrice(option)}
                    </div>
                  </div>
                  <OptionForm planId={plan.id} category={category} existing={option} />
                </div>
              ))}
            </div>
            <OptionForm planId={plan.id} category={category} />
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Option form (create/edit one price row, with EUR/USD/BRL picker)**

```tsx
// src/app/(auth)/admin/vps-catalog/[planId]/OptionForm.tsx
"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { upsertVpsCatalogOptionAction, deleteVpsCatalogOptionAction } from "../actions";
import type { VpsCatalogOption } from "@/lib/db/schema";

const optionSchema = z.object({
  optionKey: z.string().min(1, "Chave é obrigatória"),
  label: z.string().min(1, "Rótulo é obrigatório"),
  currency: z.enum(["EUR", "USD", "BRL"]),
  amount: z.coerce.number().min(0),
  setupAmount: z.coerce.number().min(0).optional(),
  compareAtAmount: z.coerce.number().min(0).optional(),
  discountLabel: z.string().optional(),
  freeIncluded: z.boolean().default(false),
  active: z.boolean().default(true),
});

type OptionFormValues = z.infer<typeof optionSchema>;

interface OptionFormProps {
  planId: string;
  category: "duration" | "location" | "storage" | "addon" | "image" | "object_storage";
  existing?: VpsCatalogOption;
}

export function OptionForm({ planId, category, existing }: OptionFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OptionFormValues>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      optionKey: existing?.optionKey ?? "",
      label: existing?.label ?? "",
      currency: (existing?.currency as "EUR" | "USD" | "BRL") ?? "EUR",
      amount: existing?.amount ?? 0,
      setupAmount: existing?.setupAmount ?? undefined,
      compareAtAmount: existing?.compareAtAmount ?? undefined,
      discountLabel: existing?.discountLabel ?? "",
      freeIncluded: existing?.freeIncluded ?? false,
      active: existing?.active ?? true,
    },
  });

  function onSubmit(values: OptionFormValues) {
    startTransition(async () => {
      await upsertVpsCatalogOptionAction({ id: existing?.id, planId, category, ...values });
      setOpen(false);
    });
  }

  function onDelete() {
    if (!existing) return;
    startTransition(async () => {
      await deleteVpsCatalogOptionAction(existing.id, planId);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={existing ? "outline" : "default"}>
          {existing ? "Editar" : `+ Adicionar ${category}`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Editar opção" : "Nova opção"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="optionKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave (ex: "12" para 12 meses, "us-east" para região)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rótulo exibido ao cliente</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD (US$)</SelectItem>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço mensal</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {category === "duration" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="setupAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de instalação (opcional)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço "de" riscado (opcional)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="freeIncluded"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <FormLabel>Incluído sem custo</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              {existing && (
                <Button type="button" variant="destructive" disabled={isPending} onClick={onDelete}>
                  Excluir
                </Button>
              )}
              <Button type="submit" disabled={isPending}>Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Add nav link**

In `src/components/layouts/navigation.ts`, add an admin nav entry pointing at `/admin/vps-catalog` next to the existing `/admin/vps-plans` entry (open the file, find the admin section array, copy the shape of the neighboring VPS entry).

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, log in as an admin, visit `/admin/vps-catalog`.
Expected: empty table (pre-seed) or seeded plans (post-seed, see Task 8), an "Editar" link per row, and the "Sincronizar imagens (Contabo)" button works and shows a toast with a synced count > 0.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(auth)/admin/vps-catalog" src/components/layouts/navigation.ts
git commit -m "feat: add admin UI for vps catalog plans, pricing options, and image sync"
```

---

### Task 8: Seed script — migrate today's hardcoded data into the catalog

**Files:**
- Create: `scripts/seed-vps-catalog.ts`

This is a **one-time, run-once** script. Its job is to take the exact numbers that exist today in the 4 hardcoded `plansData` objects (and the mirrored table in `src/app/actions.ts`) and turn them into `pgVpsCatalogPlan` + `pgVpsCatalogOption` rows, so the site keeps working with identical prices the moment the hardcoded objects are deleted in Tasks 9-11. After running, all further price changes happen through the admin UI (Task 7), not by editing this script again.

Plan keys that must be covered (read directly from the source files being replaced):
- `planType: "vps"` — keys `10, 20, 30, 40, 50, 60`, source: `src/app/vps/configure/[id]/page.tsx` (lines 50-…, one object per key)
- `planType: "vds"` — keys `s, m, l, xl, xxl`, source: `src/app/vds/configure/[id]/page.tsx`
- `planType: "storage-vps"` — keys `10, 20, 30, 40, 50`, source: `src/app/vps-armazenamento/configure/[id]/page.tsx`
- `planType: "vps-windows"` — keys `10, 20, 30, 40, 50, 60`, source: `src/app/vps-windows/configure/[id]/page.tsx`

For each plan object in those 4 files, map fields into rows like this (full worked example below using the real `"10"` / `vps` object from `src/app/vps/configure/[id]/page.tsx:51-104`):

- [ ] **Step 1: Write the seed script with one fully worked plan**

```ts
#!/usr/bin/env bun
// scripts/seed-vps-catalog.ts
//
// One-time migration: copies the numbers that are hardcoded today in
//   src/app/vps/configure/[id]/page.tsx
//   src/app/vds/configure/[id]/page.tsx
//   src/app/vps-armazenamento/configure/[id]/page.tsx
//   src/app/vps-windows/configure/[id]/page.tsx
// into vps_catalog_plans / vps_catalog_options, so deleting the hardcoded
// objects in later tasks doesn't change any price the customer sees.
//
// Run once: `bun run scripts/seed-vps-catalog.ts`
// Safe to re-run: uses onConflict-free inserts guarded by an existence check per planKey/planType.

import { db } from "@/lib/db";
import { pgVpsCatalogPlan, pgVpsCatalogOption } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { VpsCatalogOptionInsert } from "@/lib/db/schema";

type PlanSeed = {
  planType: "vps" | "vds" | "storage-vps" | "vps-windows";
  planKey: string;
  contaboProductId?: string;
  name: string;
  vcpuLabel: string;
  ramLabel: string;
  storageLabel: string;
  snapshotsLabel: string;
  trafficLabel: string;
  sortOrder: number;
  options: Omit<VpsCatalogOptionInsert, "planId">[];
};

// ---- WORKED EXAMPLE: Cloud VPS 10 (src/app/vps/configure/[id]/page.tsx:51-104) ----
// Every other plan/type follows this exact shape — copy the literal eur/label/latency
// values straight out of the corresponding object in the 4 files listed above.
const VPS_10: PlanSeed = {
  planType: "vps",
  planKey: "10",
  name: "Cloud VPS 10",
  vcpuLabel: "4 núcleos de vCPU",
  ramLabel: "8 GB de RAM",
  storageLabel: "75 GB NVMe ou SSD de 150 GB",
  snapshotsLabel: "1 Instantâneo",
  trafficLabel: "Porta de 200 Mbit/s",
  sortOrder: 0,
  options: [
    { category: "duration", optionKey: "1", label: "1 mês", currency: "EUR", amount: 9.0, setupAmount: 9.0, sortOrder: 0 },
    { category: "duration", optionKey: "6", label: "6 meses", currency: "EUR", amount: 8.1, setupAmount: 4.5, compareAtAmount: 9.0, discountLabel: "ECONOMIZE 10%", sortOrder: 1 },
    { category: "duration", optionKey: "12", label: "12 meses", currency: "EUR", amount: 7.2, setupAmount: 0, compareAtAmount: 9.0, discountLabel: "ECONOMIZE 20%", sortOrder: 2 },

    { category: "storage", optionKey: "ssd-150", label: "SSD de 150 GB", currency: "EUR", amount: 0, freeIncluded: true, sortOrder: 0 },
    { category: "storage", optionKey: "ssd-300", label: "SSD de 300 GB", currency: "EUR", amount: 3.1, sortOrder: 1 },
    { category: "storage", optionKey: "nvme-75", label: "NVMe de 75 GB", currency: "EUR", amount: 0, freeIncluded: true, sortOrder: 2 },
    { category: "storage", optionKey: "nvme-150", label: "NVMe de 150 GB", currency: "EUR", amount: 3.7, sortOrder: 3 },

    { category: "location", optionKey: "eu", label: "União Europeia", currency: "EUR", amount: 0, freeIncluded: true, meta: { latency: "146 ms" }, sortOrder: 0 },
    { category: "location", optionKey: "us-east", label: "Estados Unidos (Leste)", currency: "EUR", amount: 2.8, meta: { latency: "87 ms", recommended: true }, sortOrder: 1 },
    { category: "location", optionKey: "uk", label: "Reino Unido", currency: "EUR", amount: 1.9, meta: { latency: "132 ms" }, sortOrder: 2 },
    { category: "location", optionKey: "us-central", label: "Estados Unidos (Central)", currency: "EUR", amount: 1.9, meta: { latency: "118 ms" }, sortOrder: 3 },
    { category: "location", optionKey: "us-west", label: "Estados Unidos (Oeste)", currency: "EUR", amount: 2.3, meta: { latency: "146 ms" }, sortOrder: 4 },
    { category: "location", optionKey: "sg", label: "Ásia (Singapura)", currency: "EUR", amount: 4.3, meta: { latency: "304 ms" }, sortOrder: 5 },
    { category: "location", optionKey: "jp", label: "Ásia (Japão)", currency: "EUR", amount: 4.7, meta: { latency: "232 ms" }, sortOrder: 6 },
    { category: "location", optionKey: "in", label: "Ásia (Índia)", currency: "EUR", amount: 4.3, meta: { latency: "286 ms" }, sortOrder: 7 },
    { category: "location", optionKey: "au-sydney", label: "Austrália (Sydney)", currency: "EUR", amount: 3.9, meta: { latency: "306 ms" }, sortOrder: 8 },

    { category: "addon", optionKey: "backup", label: "Backup automático", currency: "EUR", amount: 3.0, sortOrder: 0 },
    { category: "addon", optionKey: "private-network", label: "Rede privada", currency: "EUR", amount: 4.58, sortOrder: 1 },
    { category: "addon", optionKey: "additional-ip", label: "IP adicional", currency: "EUR", amount: 7.0, sortOrder: 2 },
    { category: "addon", optionKey: "managed", label: "Serviço gerenciado", currency: "EUR", amount: 219.98, sortOrder: 3 },

    { category: "object_storage", optionKey: "250gb", label: "Object Storage 250 GB", currency: "EUR", amount: 4.98, sortOrder: 0 },
    { category: "object_storage", optionKey: "500gb", label: "Object Storage 500 GB", currency: "EUR", amount: 9.96, sortOrder: 1 },
    { category: "object_storage", optionKey: "750gb", label: "Object Storage 750 GB", currency: "EUR", amount: 14.94, sortOrder: 2 },
    { category: "object_storage", optionKey: "1tb", label: "Object Storage 1 TB", currency: "EUR", amount: 19.92, sortOrder: 3 },
  ],
};

// TODO-FOR-IMPLEMENTER (not a code placeholder — a data-entry task):
// Add one `PlanSeed` object per remaining plan key, following the VPS_10 shape above,
// reading the literal values from:
//   vps:          "20","30","40","50","60"  → src/app/vps/configure/[id]/page.tsx
//   vds:          "s","m","l","xl","xxl"    → src/app/vds/configure/[id]/page.tsx
//   storage-vps:  "10","20","30","40","50"  → src/app/vps-armazenamento/configure/[id]/page.tsx
//   vps-windows:  "10","20","30","40","50","60" → src/app/vps-windows/configure/[id]/page.tsx
// Each source object already has durations/storageTypes/locations/addon-equivalent
// fields (backupEur, privateNetworkEur, additionalIpEur, managedEur, monitoringEur,
// objectStoragePrices) in the exact same shape as VPS_10 — map field-by-field.
// vps-windows also has the per-tier panel override table at the top of that file
// (lines 48-53: windows/win2016/cpanel/pleskLinux/pleskHost/pleskPro/pleskWin) —
// map those into category="image" rows keyed "windows"/"cpanel"/"plesk-linux"/etc.
const ALL_PLANS: PlanSeed[] = [
  VPS_10,
  // ...remaining PlanSeed objects for every key listed above go here.
];

async function seedPlan(seed: PlanSeed) {
  const existing = await db.query.pgVpsCatalogPlan.findFirst({
    where: and(eq(pgVpsCatalogPlan.planType, seed.planType), eq(pgVpsCatalogPlan.planKey, seed.planKey)),
  });
  if (existing) {
    console.log(`skip (already seeded): ${seed.planType}/${seed.planKey}`);
    return;
  }

  const [plan] = await db
    .insert(pgVpsCatalogPlan)
    .values({
      planType: seed.planType,
      planKey: seed.planKey,
      contaboProductId: seed.contaboProductId,
      name: seed.name,
      vcpuLabel: seed.vcpuLabel,
      ramLabel: seed.ramLabel,
      storageLabel: seed.storageLabel,
      snapshotsLabel: seed.snapshotsLabel,
      trafficLabel: seed.trafficLabel,
      sortOrder: seed.sortOrder,
    })
    .returning();

  await db.insert(pgVpsCatalogOption).values(seed.options.map((o) => ({ ...o, planId: plan.id })));
  console.log(`seeded: ${seed.planType}/${seed.planKey} (${seed.options.length} options)`);
}

async function main() {
  for (const seed of ALL_PLANS) {
    await seedPlan(seed);
  }
  console.log(`Done. Seeded/verified ${ALL_PLANS.length} plans.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FAIL:", err);
    process.exit(1);
  });
```

- [ ] **Step 2: Fill in the remaining `PlanSeed` objects**

Open each of the 4 source files and, for every remaining plan key listed in the comment above, add a `PlanSeed` object to `ALL_PLANS` using the literal `eur`/label/latency values already present in that file's object. Do not invent numbers — copy them.

- [ ] **Step 3: Run the seed**

Run: `bun run scripts/seed-vps-catalog.ts`
Expected: one `seeded: ...` line per plan key (22 total: 6 vps + 5 vds + 5 storage-vps + 6 vps-windows), then `Done. Seeded/verified 22 plans.`

- [ ] **Step 4: Verify via the API route from Task 5**

Run: `curl http://localhost:3000/api/vps-catalog/vps/10`
Expected: `name: "Cloud VPS 10"`, `durations` has 3 entries with `displayPrice` `"€ 9,00"` / `"€ 8,10"` / `"€ 7,20"`.

- [ ] **Step 5: Run the pricing engine test from Task 4**

Run: `bun run src/tests/test-vps-pricing.ts`
Expected: `PASS:` with `monthlyAmountBrl` ≈ `9.00 * <current EUR→BRL rate>`.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-vps-catalog.ts
git commit -m "feat: seed vps catalog from existing hardcoded plan data"
```

---

### Task 9: Refactor `createVpsInvoice` to use the pricing engine

**Files:**
- Modify: `src/app/actions.ts:2753-3020` (approx — the whole hardcoded pricing block inside `createVpsInvoice`)

- [ ] **Step 1: Replace the hardcoded pricing block**

The current function (`src/app/actions.ts:2753`) hand-computes `monthlyEuro`, `setupBrl`, `additionalMonthlyEuro`, etc. via nested `if`/`Record` lookups (~270 lines). Replace the pricing computation portion with a call to `calculateVpsPrice`, keeping the rest of the function (guest checkout, invoice creation, `createVpsSubscriptionIfNeeded` call) unchanged.

```ts
// src/app/actions.ts — inside createVpsInvoice, replacing the block from
// "// Fetch real-time EUR to BRL rate" through the final amount computation.
import { calculateVpsPrice, VpsPricingError } from "@/lib/server/vps-pricing";

// ... (keep the existing user/guest resolution code above unchanged) ...

const planType = config.type === "storage-vps" ? "storage-vps"
  : config.type === "vds" ? "vds"
  : config.type === "vps-windows" ? "vps-windows"
  : "vps";

let priceResult;
try {
  priceResult = await calculateVpsPrice({
    planType,
    planKey: planId,
    durationMonths: parseInt(config.duration || "1", 10),
    locationKey: config.location,
    storageKey: config.storage,
    addonKeys: config.addons as string[] | undefined,
    imageKeys: config.images as string[] | undefined,
    objectStorageKey: config.objectStorage,
  });
} catch (err) {
  if (err instanceof VpsPricingError) {
    return { status: "error", message: err.message };
  }
  throw err;
}

const totalAmount = priceResult.monthlyAmountBrl + priceResult.setupAmountBrl;
// `totalAmount` now replaces whatever local variable the rest of the function
// used to build the invoice (check the existing code right after the current
// hardcoded block for the exact variable name passed into the invoice insert —
// wire `totalAmount` into that same spot).
```

- [ ] **Step 2: Confirm the addon/image/objectStorage keys the client already sends**

Read the existing `config` shape the 4 configure pages currently POST (search `createVpsInvoice(` call sites in the 4 configure pages) and confirm the field names (`config.addons`, `config.images`, `config.objectStorage`) match what those pages actually send. If a page uses different field names (e.g. a single `config.image` string instead of an array), adjust the `calculateVpsPrice` call above to match — do not change the client's field names, adapt the server call to them.

- [ ] **Step 3: Delete the now-dead hardcoded tables**

Remove `basePrices`, `locationPrices`, and the `if (planId === ...)` storage/addon chains that Step 1 replaced. Keep the fallback-rate try/catch removed too — `calculateVpsPrice` → `toBrl` already goes through `currencyConversion` with its own daily cache.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, complete a VPS checkout in the browser for plan "10", 1 month, EU location, no addons.
Expected: invoice amount shown equals `9.00 * <current EUR/BRL rate>` (same as before the refactor — compare against the value the site showed prior to this task, e.g. via git stash if unsure).

- [ ] **Step 5: Commit**

```bash
git add src/app/actions.ts
git commit -m "refactor: createVpsInvoice uses calculateVpsPrice instead of hardcoded tables"
```

---

### Task 10: Refactor the 4 configure pages to fetch from the catalog API

**Files:**
- Modify: `src/app/vps/configure/[id]/page.tsx`
- Modify: `src/app/vds/configure/[id]/page.tsx`
- Modify: `src/app/vps-windows/configure/[id]/page.tsx`
- Modify: `src/app/vps-armazenamento/configure/[id]/page.tsx`

Full worked example for `src/app/vps/configure/[id]/page.tsx`; repeat the same transformation in the other 3 files (each has the identical `const plansData: Record<string, any> = { ... }; ... const plan = plansData[planId] || plansData["10"];` shape — confirmed at `vds:61`/`414`, `vps-windows:62`/pattern, `vps-armazenamento:78`/`398`).

- [ ] **Step 1: Remove the hardcoded object, add a fetch**

Delete the entire `const plansData: Record<string, any> = { ... }` block (`src/app/vps/configure/[id]/page.tsx:49-...` through its closing `};`). Replace the line that reads `const plan = plansData[planId as keyof typeof plansData] || plansData["10"];` with client-side state + fetch, since this is a `"use client"` component (confirmed at the top of the file):

```tsx
// Add near the other useState/useEffect hooks, replacing the removed plansData lookup:
const [plan, setPlan] = useState<any | null>(null);
const [planLoading, setPlanLoading] = useState(true);

useEffect(() => {
  let cancelled = false;
  setPlanLoading(true);
  fetch(`/api/vps-catalog/vps/${planId}`)
    .then((res) => {
      if (!res.ok) throw new Error("not found");
      return res.json();
    })
    .then((data) => {
      if (!cancelled) setPlan(data);
    })
    .catch(() => {
      if (!cancelled) setPlan(null);
    })
    .finally(() => {
      if (!cancelled) setPlanLoading(false);
    });
  return () => {
    cancelled = true;
  };
}, [planId]);
```

- [ ] **Step 2: Guard rendering until `plan` is loaded**

Wrap the existing JSX return with an early loading/not-found state, matching the component's existing conventions (check how other async states are handled in this file, e.g. existing `useState` + conditional render patterns already present for other fields):

```tsx
if (planLoading) return <div className="p-8 text-center text-muted-foreground">Carregando plano...</div>;
if (!plan) return <div className="p-8 text-center text-muted-foreground">Plano não encontrado.</div>;
```

- [ ] **Step 3: Adjust field access to the API route's response shape**

The API route (Task 5) returns `durations`, `locations`, `storageTypes`, `addons`, `images`, `objectStorage` as flat arrays of `{ optionKey, label, currency, amount, displayPrice, freeIncluded, meta, setupAmount, compareAtAmount, discountLabel }`, not the nested `locations: { best: [...], europe: [...] }` shape the old mock used. Update every place in this file that reads `plan.durations`, `plan.locations.best`, `plan.storageTypes`, `plan.images.popular`, etc. to read from the flat arrays and filter/group in the component instead (e.g. `plan.locations.filter(l => l.meta?.recommended)` for the old "best" group, or add a `group` field to `meta` during seeding — Task 8 — if the UI needs the same visual grouping, e.g. `meta: { group: "europe" }` alongside `latency`/`recommended`). Where the old code read `p.eur` directly for a price, read `p.displayPrice` (already formatted, e.g. `"€ 9,00"`) or `p.amount` + `p.currency` if the component needs to do its own formatting/math (e.g. the running total calculation as the user picks options — keep that calculation client-side against `amount`, but call the server (`createVpsInvoice`, unchanged from Task 9) for the authoritative final price at submit time; never trust the client total for the actual charge).

- [ ] **Step 4: Repeat Steps 1-3 for the other 3 configure pages**

Apply the identical transformation to `src/app/vds/configure/[id]/page.tsx` (fetch `/api/vps-catalog/vds/${planId}`), `src/app/vps-windows/configure/[id]/page.tsx` (fetch `/api/vps-catalog/vps-windows/${planId}`), and `src/app/vps-armazenamento/configure/[id]/page.tsx` (fetch `/api/vps-catalog/storage-vps/${planId}`).

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, visit `/vps/configure/10`, `/vds/configure/s`, `/vps-windows/configure/10`, `/vps-armazenamento/configure/10`.
Expected: each page renders the same specs/prices it did before this task (compare against a `git stash` of the pre-refactor version if needed), sourced from the DB instead of the deleted mock object.

- [ ] **Step 6: Commit**

```bash
git add "src/app/vps/configure/[id]/page.tsx" "src/app/vds/configure/[id]/page.tsx" "src/app/vps-windows/configure/[id]/page.tsx" "src/app/vps-armazenamento/configure/[id]/page.tsx"
git commit -m "refactor: configure pages fetch plan catalog from API instead of hardcoded mocks"
```

---

### Task 11: Refactor landing/marketing pages

**Files:**
- Modify: `src/app/landing/components/VpsCloudPage.tsx`
- Modify: `src/app/landing/components/VdsPage.tsx`
- Modify: `src/app/landing/components/VpsWindowsPage.tsx`
- Modify: `src/app/landing/components/VpsStoragePage.tsx`
- Modify: `src/app/(auth)/plans/components/PlansCarousel.tsx`

These only need the "starting at" price per tier (`vcpu`, `ram`, and the cheapest duration's price — confirmed shape at `VpsCloudPage.tsx:24-25,38-39`), not the full addon/location matrix.

- [ ] **Step 1: Add a lightweight list route**

```ts
// src/app/api/vps-catalog/[planType]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgVpsCatalogPlan, pgVpsCatalogOption } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { formatCatalogPrice } from "@/lib/server/vps-currency";

const VALID_TYPES = ["vps", "vds", "storage-vps", "vps-windows"] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ planType: string }> }) {
  const { planType } = await params;
  if (!VALID_TYPES.includes(planType as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "planType inválido" }, { status: 400 });
  }

  const plans = await db.query.pgVpsCatalogPlan.findMany({
    where: and(eq(pgVpsCatalogPlan.planType, planType as (typeof VALID_TYPES)[number]), eq(pgVpsCatalogPlan.active, true)),
    orderBy: [asc(pgVpsCatalogPlan.sortOrder)],
    with: { options: { where: eq(pgVpsCatalogOption.category, "duration") } },
  });

  const result = plans.map((plan) => {
    const cheapest = [...plan.options].sort((a, b) => a.amount - b.amount)[0];
    return {
      planKey: plan.planKey,
      name: plan.name,
      vcpuLabel: plan.vcpuLabel,
      ramLabel: plan.ramLabel,
      startingPrice: cheapest ? formatCatalogPrice(cheapest) : null,
    };
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 2: Replace `VpsCloudPage.tsx`'s hardcoded array**

The file currently has a local array with entries like `{ vcpu: "4 núcleos", ram: "8 GB", ... }` (`VpsCloudPage.tsx:38-100`) driving the cards rendered around line 193-220. Replace the local array with a `useEffect` fetch of `/api/vps-catalog/vps` (same pattern as Task 10 Step 1), and update the price-string-splitting logic at lines 193-196/251-254 (`formattedPrice.split(" ")`) to operate on the `startingPrice` field the new route already returns pre-formatted (e.g. `"€ 9,00"` splits the same way the old hardcoded strings did — no changes needed to that splitting logic itself, only to where `formattedPrice` comes from).

- [ ] **Step 3: Repeat for the other 4 files**

`VdsPage.tsx` → fetch `/api/vps-catalog/vds`, `VpsWindowsPage.tsx` → `/api/vps-catalog/vps-windows`, `VpsStoragePage.tsx` → `/api/vps-catalog/storage-vps`, `PlansCarousel.tsx` → whichever single `planType` it currently hardcodes (open the file to confirm — it may aggregate multiple types into one carousel, in which case fetch each of the 4 list routes and concatenate).

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, visit the landing pages (`/vps`, `/vds`, `/vps-windows`, `/vps-armazenamento`) and the plans page.
Expected: same cards, same prices as before this task, now DB-sourced.

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/vps-catalog/[planType]/route.ts" src/app/landing/components/VpsCloudPage.tsx src/app/landing/components/VdsPage.tsx src/app/landing/components/VpsWindowsPage.tsx src/app/landing/components/VpsStoragePage.tsx "src/app/(auth)/plans/components/PlansCarousel.tsx"
git commit -m "refactor: landing pages pull starting prices from vps catalog API"
```

---

### Task 12: Final cleanup and full-flow verification

**Files:** none new — verification only.

- [ ] **Step 1: Grep for leftover hardcoded price references**

Run: `grep -rn "basePrices\|locationPrices\|plansData" src/app` (or the project's Grep tool)
Expected: no matches. If any remain, they're leftover dead code from Tasks 9-11 — delete them.

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors referencing removed `plansData`/pricing tables.

- [ ] **Step 3: End-to-end manual check**

In the running dev server: as an admin, go to `/admin/vps-catalog`, edit the Cloud VPS 10 / 1-month price to a different EUR amount, save. Then, as a customer (or logged out with guest checkout), visit `/vps/configure/10`, confirm the new price shows up, and complete checkout. Confirm the created invoice's BRL amount reflects `newAmount * currentEURtoBRLrate`.
Expected: price change made in the admin UI is visible in the storefront and in the actual charged amount, without touching any code.

- [ ] **Step 4: Commit (if any cleanup was needed in Step 1)**

```bash
git add -A
git commit -m "chore: remove dead hardcoded vps pricing tables"
```

---

## Self-Review Notes

- **Spec coverage:** "usar as configs que api contabo manda" → Task 2 (live image sync) + scope note explaining why full spec-catalog sync isn't possible (no such Contabo endpoint). "preços settados pelo admin" → Task 7 (admin UI) + Task 6 (server actions), enforced server-side in Task 9 (checkout always recomputes via `calculateVpsPrice`, never trusts client price). "podendo ser em euro, dolar ou real" → `vpsCatalogCurrencyEnum` (Task 1) + currency `Select` in `OptionForm` (Task 7) + `toBrl()` conversion (Task 3) used at charge time (Task 9).
- **No placeholders:** the one intentionally-open item is the seed script's remaining 21 `PlanSeed` objects (Task 8, Step 2) — this is explicitly data entry from existing source files, not unresolved design; the worked example (`VPS_10`) shows the exact shape and the exact source lines to copy from.
