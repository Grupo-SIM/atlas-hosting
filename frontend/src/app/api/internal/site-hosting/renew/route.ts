import { and, inArray, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgBuilderHostingSubscription, pgLog } from "@/lib/db/schema";
import {
  chargeSiteHostingCycle,
  suspendSiteHosting,
} from "@/lib/server/site-hosting/renewal";

function ensureAuthorized(req: Request): boolean {
  const token = (req.headers.get("authorization") || "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  return (
    !!token &&
    [
      process.env.CRON_SECRET,
      process.env.API_MACHINE_INTERNAL_TOKEN,
      process.env.INTERNAL_SERVICE_TOKEN,
    ]
      .filter(Boolean)
      .includes(token)
  );
}

export async function GET(req: Request) {
  return POST(req);
}

/**
 * Cobrança mensal da hospedagem de sites na VM do Atlas e suspensão de quem
 * passou da carência. Roda pelo agendador interno (`internal-scheduler.ts`) e
 * aceita chamada manual com o mesmo `Bearer` das outras rotas internas.
 */
export async function POST(req: Request) {
  if (!ensureAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const endOfToday = new Date(
    `${now.toLocaleDateString("en-CA", { timeZone: "America/Recife" })}T23:59:59.999-03:00`
  );

  const subscriptions = await db.query.pgBuilderHostingSubscription.findMany({
    where: and(
      inArray(pgBuilderHostingSubscription.status, ["active", "past_due"]),
      or(
        lte(pgBuilderHostingSubscription.nextChargeDate, endOfToday),
        lte(pgBuilderHostingSubscription.graceUntil, now)
      )
    ),
  });

  const results: { id: string; status: string }[] = [];
  for (const sub of subscriptions) {
    try {
      // Carência vencida: suspende primeiro, sem tentar cobrar de novo hoje.
      if (
        sub.status === "past_due" &&
        sub.graceUntil &&
        sub.graceUntil.getTime() <= now.getTime()
      ) {
        const suspension = await suspendSiteHosting(
          sub,
          sub.config?.lastFailure ?? "fatura em aberto após a carência"
        );
        results.push({
          id: sub.id,
          status: suspension.ok ? "suspended" : "suspend_failed",
        });
        continue;
      }

      const status = await chargeSiteHostingCycle(sub, now);
      results.push({ id: sub.id, status });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await db.insert(pgLog).values({
        description: `Assinatura de hospedagem ${sub.id}: ${message}`,
        severity: "danger",
        title: "Falha operacional na renovação da hospedagem de site",
        type: "hosting",
        userId: sub.userId,
      });
      results.push({ id: sub.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
