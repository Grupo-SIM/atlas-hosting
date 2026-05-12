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
  if (admin.id === id) return;

  const target = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, id),
    columns: { isAdmin: true },
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
  if (!admin || !admin.isAdmin) redirect("/home");

  await db
    .update(pgUser)
    .set({ suspendedAt: null, updatedAt: new Date() })
    .where(eq(pgUser.id, id));

  revalidatePath("/admin/users");
}
