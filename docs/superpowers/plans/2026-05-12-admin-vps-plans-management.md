# Admin VPS Plans — Subscription Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the invoice-based `/admin/vps-plans` page with a real subscription management UI backed by `pgVpsSubscription`, allowing admins to suspend and reactivate user VPS subscriptions with correct time-remaining logic.

**Architecture:** Add `pausedAt` column to `pgVpsSubscription` schema → push to DB → replace `actions.ts` to read from `pgVpsSubscription` with two new mutation actions → replace `page.tsx` with stats + table → add `SubscriptionActionsCell.tsx` client component for suspend/reactivate buttons.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, `drizzle-kit push`, shadcn/ui (Card, Badge, Table, AlertDialog, Button), date-fns, `"use server"` actions with `revalidatePath`.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/db/schema/tables/vps-subscription.ts` | Modify | Add `pausedAt` nullable timestamp column |
| `src/app/(auth)/admin/vps-plans/actions.ts` | Replace | `VpsPlanRow` type + 3 server actions |
| `src/app/(auth)/admin/vps-plans/SubscriptionActionsCell.tsx` | Create | Client component: suspend AlertDialog + reactivate button |
| `src/app/(auth)/admin/vps-plans/page.tsx` | Replace | Server page: stats cards + subscriptions table |

---

## Task 1: Add `pausedAt` column to schema and push

**Files:**
- Modify: `src/lib/db/schema/tables/vps-subscription.ts`

- [ ] **Step 1: Add `pausedAt` column**

In `src/lib/db/schema/tables/vps-subscription.ts`, add one line inside `pgTable(...)` after the `updatedAt` field:

```ts
// existing last lines of the table definition:
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  pausedAt: timestamp("paused_at", { mode: "date" }),
```

The column is nullable with no default — correct for new rows (will be `null` on active subscriptions).

- [ ] **Step 2: Push schema to database**

```bash
npm run db:push
```

Expected: prompts confirmation if needed, then `All changes applied`. The `vps_subscriptions` table gains a nullable `paused_at` column.

- [ ] **Step 3: Verify column exists**

```bash
npm run db:push
```

Expected: `No changes detected` (idempotent — confirms column is in sync).

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema/tables/vps-subscription.ts
git commit -m "feat: add pausedAt column to vps_subscriptions"
```

---

## Task 2: Replace `actions.ts`

**Files:**
- Replace: `src/app/(auth)/admin/vps-plans/actions.ts`

- [ ] **Step 1: Write the full replacement**

Replace the entire file contents of `src/app/(auth)/admin/vps-plans/actions.ts` with:

```ts
"use server";

import { db } from "@/lib/db";
import { pgVpsSubscription } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { addMilliseconds } from "date-fns";

export type VpsPlanRow = {
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
};

export async function getVpsPlanSubscriptionsAction(): Promise<VpsPlanRow[]> {
  const subs = await db.query.pgVpsSubscription.findMany({
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: [desc(pgVpsSubscription.createdAt)],
  });

  return subs.map((s) => ({
    id: s.id,
    userId: s.userId,
    userName: (s.user as any)?.name ?? null,
    userEmail: (s.user as any)?.email ?? "",
    planId: s.planId,
    planType: s.planType as VpsPlanRow["planType"],
    intervalMonths: s.intervalMonths,
    amountBrl: s.amountBrl,
    status: s.status as VpsPlanRow["status"],
    nextChargeDate: s.nextChargeDate,
    pausedAt: s.pausedAt ?? null,
    createdAt: s.createdAt,
  }));
}

export async function suspendVpsSubscriptionAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  await db
    .update(pgVpsSubscription)
    .set({ status: "paused", pausedAt: new Date(), updatedAt: new Date() })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}

export async function reactivateVpsSubscriptionAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const sub = await db.query.pgVpsSubscription.findFirst({
    where: eq(pgVpsSubscription.id, id),
  });

  if (!sub || !sub.pausedAt) return;

  const remaining = sub.nextChargeDate.getTime() - sub.pausedAt.getTime();
  const newNextChargeDate = addMilliseconds(new Date(), remaining);

  await db
    .update(pgVpsSubscription)
    .set({
      status: "active",
      pausedAt: null,
      nextChargeDate: newNextChargeDate,
      failureCount: 0,
      updatedAt: new Date(),
    })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors for this file.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/admin/vps-plans/actions.ts
git commit -m "feat: replace vps-plans actions to use pgVpsSubscription"
```

---

## Task 3: Create `SubscriptionActionsCell.tsx`

**Files:**
- Create: `src/app/(auth)/admin/vps-plans/SubscriptionActionsCell.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { suspendVpsSubscriptionAction, reactivateVpsSubscriptionAction } from "./actions";

interface Props {
  id: string;
  status: "active" | "cancelled" | "failed" | "paused";
}

export function SubscriptionActionsCell({ id, status }: Props) {
  const [pending, startTransition] = useTransition();

  if (status === "active") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={pending}>
            Suspender
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender assinatura?</AlertDialogTitle>
            <AlertDialogDescription>
              A assinatura será pausada e nenhuma cobrança ocorrerá. O tempo
              restante será preservado e retomará a partir da data de reativação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                startTransition(() => suspendVpsSubscriptionAction(id))
              }
            >
              Confirmar suspensão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === "paused") {
    return (
      <Button
        variant="default"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(() => reactivateVpsSubscriptionAction(id))
        }
      >
        Reativar
      </Button>
    );
  }

  return <span className="text-muted-foreground text-sm">—</span>;
}
```

- [ ] **Step 2: Check AlertDialog is available**

```bash
ls src/components/ui/alert-dialog.tsx
```

Expected: file exists. If not: `npx shadcn@latest add alert-dialog`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/admin/vps-plans/SubscriptionActionsCell.tsx
git commit -m "feat: add SubscriptionActionsCell with suspend/reactivate"
```

---

## Task 4: Replace `page.tsx`

**Files:**
- Replace: `src/app/(auth)/admin/vps-plans/page.tsx`

- [ ] **Step 1: Write the full replacement**

Replace the entire file contents of `src/app/(auth)/admin/vps-plans/page.tsx` with:

```tsx
import { getVpsPlanSubscriptionsAction } from "./actions";
import { SubscriptionActionsCell } from "./SubscriptionActionsCell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toBrl } from "@/lib/utils";
import { Metadata } from "next";
import {
  Server,
  ShieldCheck,
  CheckCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Planos VPS — Admin" };

const PLAN_TYPE_LABEL: Record<string, string> = {
  vps: "VPS",
  vds: "VDS",
  "storage-vps": "Storage",
  "vps-windows": "Windows",
};

function periodLabel(months: number) {
  if (months === 1) return "1 mês";
  return `${months} meses`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active:    { label: "Ativa",      variant: "default" },
    paused:    { label: "Pausada",    variant: "secondary" },
    cancelled: { label: "Cancelada",  variant: "outline" },
    failed:    { label: "Falhou",     variant: "destructive" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
}

export default async function AdminVpsPlansPage() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const plans = await getVpsPlanSubscriptionsAction();

  const active    = plans.filter((p) => p.status === "active").length;
  const paused    = plans.filter((p) => p.status === "paused").length;
  const inactive  = plans.filter((p) => p.status === "cancelled" || p.status === "failed").length;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planos VPS</h2>
          <p className="text-muted-foreground">
            Gerencie assinaturas VPS dos clientes.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-primary">
            Acesso Restrito: Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pausadas</CardTitle>
            <PauseCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactive}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Assinaturas ({plans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Próx. cobrança</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{plan.userName ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{plan.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {PLAN_TYPE_LABEL[plan.planType] ?? plan.planType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {periodLabel(plan.intervalMonths)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(plan.nextChargeDate, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {toBrl(plan.amountBrl)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={plan.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <SubscriptionActionsCell id={plan.id} status={plan.status} />
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma assinatura registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify `toBrl` utility exists**

```bash
grep -n "toBrl" src/lib/utils.ts
```

Expected: a line exporting `toBrl`. If missing, use `(v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })` inline in the page and remove the import.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Run dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/admin/vps-plans`.

Check:
- Stats cards render with counts
- Table shows subscriptions from `vps_subscriptions` (not invoices)
- Active rows: "Suspender" button visible
- Paused rows: "Reativar" button visible
- Suspended → clicking "Suspender" shows AlertDialog → confirm → row status changes to Pausada
- Reativar → row status changes to Ativa, next charge date updates

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/admin/vps-plans/page.tsx
git commit -m "feat: replace vps-plans page with subscription management UI"
```
