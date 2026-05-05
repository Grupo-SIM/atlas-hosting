# Admin VPS Plans Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new admin-only route `/admin/vps-plans` that lists all paid VPS invoices with subscription start/expiry dates, user info, and status badges.

**Architecture:** Query `pgInvoice` (type="vps", status="paid") joined with `pgUser`. Calculate `subscriptionStart = invoice.createdAt`, `subscriptionExpiry = createdAt + config.duration months`. No DB schema changes — all data exists in invoices. Add nav link with `isAdmin: true`.

**Tech Stack:** Next.js 14 App Router, Drizzle ORM, Tailwind CSS, shadcn/ui, date-fns, Lucide React

---

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/app/(auth)/admin/vps-plans/actions.ts` | Server action: query paid VPS invoices with user join |
| Create | `src/app/(auth)/admin/vps-plans/page.tsx` | Admin page: stats + table with subscription data |
| Modify | `src/components/layouts/navigation.ts` | Add nav link for new route |

---

### Task 1: Server Action — Query Paid VPS Invoices

**Files:**
- Create: `src/app/(auth)/admin/vps-plans/actions.ts`

- [ ] **Step 1: Create the actions file**

```typescript
"use server";

import { db } from "@/lib/db";
import { pgInvoice, pgUser, VpsInvoiceOptions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { addMonths } from "date-fns";

export type VpsPlanRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  amount: number;
  currency: string;
  description: string | null;
  duration: string; // "1", "6", "12"
  subscriptionStart: Date;
  subscriptionExpiry: Date;
  createdAt: Date;
};

export async function getVpsPlanSubscriptionsAction(): Promise<VpsPlanRow[]> {
  const invoices = await db.query.pgInvoice.findMany({
    where: and(
      eq(pgInvoice.type, "vps"),
      eq(pgInvoice.status, "paid")
    ),
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: [desc(pgInvoice.createdAt)],
  });

  return invoices.map((inv) => {
    const meta = inv.metadata as VpsInvoiceOptions;
    const duration = meta?.config?.duration ?? "1";
    const start = new Date(inv.createdAt);
    const expiry = addMonths(start, parseInt(duration, 10));

    return {
      id: inv.id,
      userId: inv.userId,
      userName: inv.user?.name ?? null,
      userEmail: inv.user?.email ?? "",
      amount: inv.amount,
      currency: inv.currency,
      description: inv.description ?? null,
      duration,
      subscriptionStart: start,
      subscriptionExpiry: expiry,
      createdAt: start,
    };
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles (no errors in this file)**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: no errors related to this file

---

### Task 2: Admin Page — Stats + Table

**Files:**
- Create: `src/app/(auth)/admin/vps-plans/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
import { getVpsPlanSubscriptionsAction, VpsPlanRow } from "./actions";
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
import { ShieldCheck, Server, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toBrl } from "@/lib/utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planos VPS - Admin",
};

function getSubscriptionStatus(expiry: Date): "active" | "expiring" | "expired" {
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring";
  return "active";
}

function StatusBadge({ expiry }: { expiry: Date }) {
  const status = getSubscriptionStatus(expiry);
  if (status === "active") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none gap-1">
        <CheckCircle className="h-3 w-3" /> Ativa
      </Badge>
    );
  }
  if (status === "expiring") {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-none gap-1">
        <AlertTriangle className="h-3 w-3" /> Vencendo
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-none gap-1">
      <XCircle className="h-3 w-3" /> Vencida
    </Badge>
  );
}

function periodLabel(duration: string): string {
  if (duration === "6") return "6 meses";
  if (duration === "12") return "12 meses";
  return "Mensal";
}

export default async function AdminVpsPlansPage() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const plans = await getVpsPlanSubscriptionsAction();
  const now = new Date();

  const active = plans.filter((p) => getSubscriptionStatus(p.subscriptionExpiry) === "active").length;
  const expiring = plans.filter((p) => getSubscriptionStatus(p.subscriptionExpiry) === "expiring").length;
  const expired = plans.filter((p) => getSubscriptionStatus(p.subscriptionExpiry) === "expired").length;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planos VPS</h2>
          <p className="text-muted-foreground">Assinaturas de VPS pagas e seus vencimentos.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-primary">Acesso Restrito: Admin</span>
        </div>
      </div>

      {/* Stats */}
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
            <CardTitle className="text-sm font-medium">Vencendo em 30 dias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
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
                <TableHead>Descrição</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{plan.userName}</span>
                      <span className="text-xs text-muted-foreground">{plan.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {plan.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{periodLabel(plan.duration)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(plan.subscriptionStart, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {format(plan.subscriptionExpiry, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {toBrl(plan.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge expiry={plan.subscriptionExpiry} />
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Nenhuma assinatura VPS paga encontrada.
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: no errors in this file

---

### Task 3: Add Navigation Link

**Files:**
- Modify: `src/components/layouts/navigation.ts`

- [ ] **Step 1: Add VPS Plans link to navigation array**

In `src/components/layouts/navigation.ts`, add after the `"Administração"` entry:

```typescript
{ name: "Planos VPS", href: "/admin/vps-plans", icon: Server, isAdmin: true },
```

Full file after edit:
```typescript
import {
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Server,
  Settings,
  Shield,
  Ticket,
  Users,
} from "lucide-react";

export const navigation = [
  { name: "Painel", href: "/home", icon: LayoutDashboard },
  { name: "Hospedagem", href: "/manage/vps", icon: Server },
  { name: "Domínios", href: "/domains", icon: Globe },
  { name: "Faturas", href: "/billing", icon: FileText },
  { name: "Afiliados", href: "/affiliate", icon: Users },
  { name: "Vouchers", href: "/vouchers", icon: Ticket },
  { name: "Administração", href: "/admin/vps", icon: Shield, isAdmin: true },
  { name: "Planos VPS", href: "/admin/vps-plans", icon: Server, isAdmin: true },
  { name: "Afiliados Admin", href: "/admin/affiliates", icon: Users, isAdmin: true },
  { name: "Vouchers Admin", href: "/admin/vouchers", icon: Ticket, isAdmin: true },
];
```

- [ ] **Step 2: Verify dev server has no errors**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: no errors

---

### Task 4: Verify Invoice Relations Include User

**Context:** The server action uses `db.query.pgInvoice.findMany({ with: { user: true } })`. This requires `invoiceRelations` in the schema to define a `user` relation — which it does (already in `src/lib/db/schema/tables/invoice.ts`). No changes needed.

- [ ] **Step 1: Confirm relation exists**

Check `src/lib/db/schema/tables/invoice.ts` line 44-53 — `invoiceRelations` defines `user: one(pgUser, ...)`. ✓ Already exists.

---
