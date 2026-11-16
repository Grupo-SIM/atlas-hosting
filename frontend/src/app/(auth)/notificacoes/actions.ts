"use server";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { type Notification, pgNotification } from "@/lib/db/schema";

export async function listMyNotifications(limit = 10): Promise<{
  items: Notification[];
  unread: number;
}> {
  const user = await getUser();
  const [items, [unreadRow]] = await Promise.all([
    db
      .select()
      .from(pgNotification)
      .where(eq(pgNotification.userId, user.id))
      .orderBy(desc(pgNotification.createdAt))
      .limit(limit),
    db
      .select({ total: count() })
      .from(pgNotification)
      .where(
        and(eq(pgNotification.userId, user.id), isNull(pgNotification.readAt))
      ),
  ]);
  return { items, unread: Number(unreadRow?.total ?? 0) };
}

/** Marca uma (ou, sem id, todas) como lida. */
export async function markNotificationsRead(
  id?: string
): Promise<{ ok: true }> {
  const user = await getUser();
  await db
    .update(pgNotification)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(pgNotification.userId, user.id),
        isNull(pgNotification.readAt),
        id ? eq(pgNotification.id, id) : undefined
      )
    );
  revalidatePath("/notificacoes");
  return { ok: true };
}
