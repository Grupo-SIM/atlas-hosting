# Admin Users Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an `/admin/users` page where admins can view all users with wallet balances and suspend or reactivate accounts, with suspended users redirected to a `/suspended` page.

**Architecture:** Add `suspendedAt` nullable timestamp to `pgUser` schema → push to DB → patch `getUser` to redirect suspended users → create public `/suspended` page → create admin users page with table + server actions + client action cell, following the exact same pattern as `/admin/vps-plans`.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, `npm run db:push`, shadcn/ui (Card, Badge, Table, AlertDialog, Button), date-fns, `"use server"` actions with `revalidatePath`.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/db/schema/tables/user.ts` | Modify | Add `suspendedAt` nullable timestamp |
| `src/lib/auth/index.ts` | Modify | Redirect suspended users in `getUser` |
| `src/app/suspended/page.tsx` | Create | Public page shown to suspended users |
| `src/app/(auth)/admin/users/actions.ts` | Create | `UserRow` type + 3 server actions |
| `src/app/(auth)/admin/users/UserActionsCell.tsx` | Create | Client component: suspend AlertDialog + reactivate button |
| `src/app/(auth)/admin/users/page.tsx` | Create | Server page: stats cards + users table |

---

## Task 1: Add `suspendedAt` column to schema and push

**Files:**
- Modify: `src/lib/db/schema/tables/user.ts`

- [ ] **Step 1: Add the column**

In `src/lib/db/schema/tables/user.ts`, find the `deletedAt` line and add `suspendedAt` right after it:

```ts
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  suspendedAt: timestamp("suspended_at", { mode: "date" }),
```

The column is nullable with no default — correct for existing rows.

- [ ] **Step 2: Push schema to database**

```bash
npm run db:push
```

Expected: schema syncs, `users` table gains nullable `suspended_at` column. Accept any prompts with `y`.

- [ ] **Step 3: Verify idempotent**

```bash
npm run db:push
```

Expected: `No changes detected`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema/tables/user.ts
git commit -m "feat: add suspendedAt column to users"
```

---

## Task 2: Redirect suspended users in `getUser`

**Files:**
- Modify: `src/lib/auth/index.ts`

The current `getUser` function (line 39–94) has two auth paths. The first path fetches the full user from DB via `db.query.pgUser.findFirst`. After the user is fetched and validated, we add a suspension check.

Current code (around line 76–82):
```ts
    user.organization = organization;

    return user as User;
  }
```

- [ ] **Step 1: Add suspension check**

Replace the section above with:
```ts
    user.organization = organization;

    if (user.suspendedAt) redirect("/suspended");

    return user as User;
  }
```

Use Serena's `replace_content` tool with mode `literal`.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No new errors in `src/lib/auth/index.ts`. Pre-existing errors in other files are OK.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth/index.ts
git commit -m "feat: redirect suspended users to /suspended in getUser"
```

---

## Task 3: Create `/suspended` public page

**Files:**
- Create: `src/app/suspended/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Metadata } from "next";

export const metadata: Metadata = { title: "Conta Suspensa" };

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-foreground">Conta Suspensa</h1>
        <p className="text-muted-foreground">
          Sua conta foi suspensa pelo administrador. Entre em contato com o
          suporte para mais informações.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the route is accessible**

```bash
npm run dev
```

Open `http://localhost:3000/suspended` — should show the suspended page without any auth redirect.

- [ ] **Step 3: Commit**

```bash
git add src/app/suspended/page.tsx
git commit -m "feat: add /suspended public page"
```

---

## Task 4: Create `actions.ts`

**Files:**
- Create: `src/app/(auth)/admin/users/actions.ts`

- [ ] **Step 1: Create the file**

```ts
"use server";

import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  balanceCents: number;
  suspendedAt: Date | null;
  createdAt: Date;
};

export async function getAllUsersWithBalanceAction(): Promise<UserRow[]> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const users = await db.query.pgUser.findMany({
    with: {
      organization: {
        with: {
          wallet: true,
        },
      },
    },
    orderBy: [desc(pgUser.createdAt)],
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isAdmin: u.isAdmin ?? false,
    balanceCents: (u.organization as any)?.wallet?.balance ?? 0,
    suspendedAt: u.suspendedAt ?? null,
    createdAt: u.createdAt,
  }));
}

export async function suspendUserAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");
  if (admin.id === id) return; // cannot suspend self
  
  const target = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, id),
    columns: { isAdmin: true },
  });
  if (target?.isAdmin) return; // cannot suspend other admins

  await db
    .update(pgUser)
    .set({ suspendedAt: new Date(), updatedAt: new Date() })
    .where(eq(pgUser.id, id));

  revalidatePath("/admin/users");
}

export async function reactivateUserAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  await db
    .update(pgUser)
    .set({ suspendedAt: null, updatedAt: new Date() })
    .where(eq(pgUser.id, id));

  revalidatePath("/admin/users");
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors in this file. Pre-existing errors in other files are OK.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(auth)/admin/users/actions.ts"
git commit -m "feat: add admin users server actions"
```

---

## Task 5: Create `UserActionsCell.tsx`

**Files:**
- Create: `src/app/(auth)/admin/users/UserActionsCell.tsx`

- [ ] **Step 1: Verify `alert-dialog` component exists**

```bash
ls src/components/ui/alert-dialog.tsx
```

Expected: file exists (was confirmed during vps-plans task). If missing: `npx shadcn@latest add alert-dialog --yes`.

- [ ] **Step 2: Create the file**

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
import { suspendUserAction, reactivateUserAction } from "./actions";

interface Props {
  id: string;
  suspendedAt: Date | null;
  isAdmin: boolean;
}

export function UserActionsCell({ id, suspendedAt, isAdmin }: Props) {
  const [pending, startTransition] = useTransition();

  if (isAdmin) {
    return <span className="text-muted-foreground text-sm">Admin</span>;
  }

  if (suspendedAt === null) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={pending}>
            Suspender
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender conta?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário será redirecionado para a página de conta suspensa ao
              tentar acessar o painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => startTransition(() => suspendUserAction(id))}
            >
              Confirmar suspensão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => reactivateUserAction(id))}
    >
      Reativar
    </Button>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors in this file.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(auth)/admin/users/UserActionsCell.tsx"
git commit -m "feat: add UserActionsCell with suspend/reactivate"
```

---

## Task 6: Create `page.tsx`

**Files:**
- Create: `src/app/(auth)/admin/users/page.tsx`

- [ ] **Step 1: Verify `toBrl` utility**

```bash
grep -n "toBrl" src/lib/utils.ts
```

If `toBrl` exists: use `import { toBrl } from "@/lib/utils"` and `{toBrl(row.balanceCents / 100)}`.  
If not: use inline `{(row.balanceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` and skip the import.

- [ ] **Step 2: Create the file**

```tsx
import { getAllUsersWithBalanceAction } from "./actions";
import { UserActionsCell } from "./UserActionsCell";
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
import { Users, ShieldCheck, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Usuários — Admin" };

export default async function AdminUsersPage() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const users = await getAllUsersWithBalanceAction();

  const active    = users.filter((u) => u.suspendedAt === null).length;
  const suspended = users.filter((u) => u.suspendedAt !== null).length;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie contas de usuários da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-primary">
            Acesso Restrito: Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspended}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {toBrl(u.balanceCents / 100)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(u.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {u.suspendedAt === null ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="destructive">Suspenso</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActionsCell
                      id={u.id}
                      suspendedAt={u.suspendedAt}
                      isAdmin={u.isAdmin}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors in vps-plans or admin/users files. Pre-existing errors in checkout-client.tsx are OK.

- [ ] **Step 4: Run dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/admin/users`.

Check:
- Stats cards show correct counts
- Table shows all users with wallet balance
- Admin users show "Admin" in Ações column (no suspend button)
- Non-admin active users: "Suspender" button → AlertDialog → confirm → status becomes Suspenso
- Suspended users: "Reativar" button → click → status becomes Ativo
- Open `/suspended` in a new tab — shows suspended page without auth

- [ ] **Step 5: Commit**

```bash
git add "src/app/(auth)/admin/users/page.tsx"
git commit -m "feat: add admin users management page"
```
