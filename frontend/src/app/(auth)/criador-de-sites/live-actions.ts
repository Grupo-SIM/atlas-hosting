"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import { FORBIDDEN_MESSAGE, getBuilderUser } from "@/lib/site-builder/access";
import { checkSiteLive, type LiveState } from "@/lib/site-builder/liveCheck";

/** Confere se o site publicado já está acessível (DNS + HTTPS). */
export async function checkSiteLiveStatus(
  siteId: string
): Promise<{ ok: true; state: LiveState } | { error: string; ok: false }> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };

  const [row] = await db
    .select({
      domain: pgBuilderPublication.domain,
      serverIp: pgBuilderPublication.serverIp,
      status: pgBuilderPublication.status,
    })
    .from(pgBuilderPublication)
    .innerJoin(pgBuilderSite, eq(pgBuilderSite.id, pgBuilderPublication.siteId))
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, user.id)))
    .limit(1);

  if (row?.status !== "published") {
    return { error: "Site não publicado.", ok: false };
  }
  return { ok: true, state: await checkSiteLive(row.domain, row.serverIp) };
}
