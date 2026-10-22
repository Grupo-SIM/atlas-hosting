"use server";

import { desc, eq, inArray, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { classifySubscriptions, type BillingMethod } from "./subscription-status";
import {
  pgAffiliateCommission,
  pgOrganizationDomains,
  pgUser,
  pgVpsSubscription,
} from "@/lib/db/schema";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  balanceCents: number;
  totalEarnedBrl: number;
  suspendedAt: Date | null;
  createdAt: Date;
  hasActiveSubscription: boolean;
  /** Tem ao menos um domínio ativo registrado na organização dele. */
  hasActiveDomain: boolean;
  /** Métodos de cobrança de todas as assinaturas vigentes. */
  billingMethods: BillingMethod[];
}

export async function getAllUsersWithBalanceAction(): Promise<UserRow[]> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const [users, commissionTotals, activeSubscriptions, activeDomains] =
    await Promise.all([
      db.query.pgUser.findMany({
        orderBy: [desc(pgUser.createdAt)],
        with: { organization: { with: { wallet: true } } },
      }),
      db
        .select({
          affiliateUserId: pgAffiliateCommission.affiliateUserId,
          total: sum(pgAffiliateCommission.commissionAmount),
        })
        .from(pgAffiliateCommission)
        .groupBy(pgAffiliateCommission.affiliateUserId),
      db
        .select({
          createdAt: pgVpsSubscription.createdAt,
          paymentMethod: pgVpsSubscription.paymentMethod,
          status: pgVpsSubscription.status,
          nextChargeDate: pgVpsSubscription.nextChargeDate,
          userId: pgVpsSubscription.userId,
        })
        .from(pgVpsSubscription)
        .where(inArray(pgVpsSubscription.status, ["active", "paused"]))
        .orderBy(desc(pgVpsSubscription.createdAt)),
      db
        .selectDistinct({
          organizationId: pgOrganizationDomains.organizationId,
        })
        .from(pgOrganizationDomains)
        .where(eq(pgOrganizationDomains.active, true)),
    ]);

  const totalsMap = new Map(
    commissionTotals.map(r => [r.affiliateUserId, Number(r.total ?? 0)])
  );
  const subscriptionsByUser = new Map<string, typeof activeSubscriptions>();
  for (const subscription of activeSubscriptions) {
    const current = subscriptionsByUser.get(subscription.userId) ?? [];
    current.push(subscription);
    subscriptionsByUser.set(subscription.userId, current);
  }

  const orgsWithDomain = new Set(activeDomains.map(d => d.organizationId));

  return users.map(u => ({
    balanceCents: (u.organization as any)?.wallet?.balance ?? 0,
    createdAt: u.createdAt,
    email: u.email,
    hasActiveDomain:
      u.organizationId !== null && orgsWithDomain.has(u.organizationId),
    ...classifySubscriptions(subscriptionsByUser.get(u.id) ?? []),
    id: u.id,
    isAdmin: u.isAdmin ?? false,
    name: u.name,
    suspendedAt: u.suspendedAt ?? null,
    totalEarnedBrl: totalsMap.get(u.id) ?? 0,
  }));
}

export async function suspendUserAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");
  if (admin.id === id) return;

  const target = await db.query.pgUser.findFirst({
    columns: { isAdmin: true },
    where: eq(pgUser.id, id),
  });
  if (target?.isAdmin) return;

  await db
    .update(pgUser)
    .set({ suspendedAt: new Date(), updatedAt: new Date() })
    .where(eq(pgUser.id, id));

  revalidatePath("/admin/users");
}

export async function reactivateUserAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  await db
    .update(pgUser)
    .set({ suspendedAt: null, updatedAt: new Date() })
    .where(eq(pgUser.id, id));

  revalidatePath("/admin/users");
}

export async function promoteToAdminAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");
  if (admin.id === id) return;

  await db
    .update(pgUser)
    .set({ isAdmin: true, updatedAt: new Date() })
    .where(eq(pgUser.id, id));

  revalidatePath("/admin/users");
}
