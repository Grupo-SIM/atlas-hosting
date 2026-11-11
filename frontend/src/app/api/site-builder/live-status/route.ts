import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import { FORBIDDEN_MESSAGE, getBuilderUser } from "@/lib/site-builder/access";
import { checkSiteLive, type LiveState } from "@/lib/site-builder/liveCheck";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 50;

/**
 * `GET ?ids=a,b,c` — confere de uma vez, em paralelo, se os sites publicados já abrem (DNS + HTTPS).
 * É rota (fetch) e não server action de propósito: o Next roda server actions em fila no cliente e
 * navegar espera a fila; com uma checagem por cartão a cada 5 s (cada uma com até 6 s de HEAD) a
 * tela "Meus sites" ficava travada. Sites de outro usuário ou não publicados ficam fora da resposta.
 */
export async function GET(request: Request) {
  const user = await getBuilderUser();
  if (!user) {
    return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 });
  }

  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").filter(id => UUID_RE.test(id)))].slice(
    0,
    MAX_IDS
  );
  const states: Record<string, LiveState> = {};
  if (ids.length > 0) {
    const rows = await db
      .select({
        domain: pgBuilderPublication.domain,
        serverIp: pgBuilderPublication.serverIp,
        siteId: pgBuilderSite.id,
      })
      .from(pgBuilderPublication)
      .innerJoin(
        pgBuilderSite,
        eq(pgBuilderSite.id, pgBuilderPublication.siteId)
      )
      .where(
        and(
          inArray(pgBuilderSite.id, ids),
          eq(pgBuilderSite.userId, user.id),
          eq(pgBuilderPublication.status, "published")
        )
      );
    await Promise.all(
      rows.map(async row => {
        states[row.siteId] = await checkSiteLive(row.domain, row.serverIp);
      })
    );
  }

  return NextResponse.json(
    { states },
    { headers: { "Cache-Control": "no-store" } }
  );
}
