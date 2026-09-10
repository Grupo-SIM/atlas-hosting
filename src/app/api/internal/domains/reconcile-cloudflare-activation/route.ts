import { and, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import {
  reconcileCloudflareActivation,
  type CloudflareActivationStatePatch,
  type PendingCloudflareZone,
} from "@/lib/server/domains/reconcile-cloudflare-activation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PROCESS_LIMIT = 100;
const PROCESS_CONCURRENCY = 5;

function ensureAuthorized(request: Request): boolean {
  const token = (request.headers.get("authorization") || "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  const accepted = [
    process.env.CRON_SECRET,
    process.env.API_MACHINE_INTERNAL_TOKEN,
    process.env.INTERNAL_SERVICE_TOKEN,
  ].filter(Boolean);
  return token.length > 0 && accepted.includes(token);
}

async function updateDomain(id: string, patch: CloudflareActivationStatePatch) {
  await db
    .update(pgOrganizationDomains)
    .set(patch)
    .where(eq(pgOrganizationDomains.id, id));
}

export async function GET(request: Request) {
  if (!ensureAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidates = await db
    .select({
      domain: pgOrganizationDomains.domain,
      id: pgOrganizationDomains.id,
      zoneId: pgOrganizationDomains.cloudflareZoneId,
    })
    .from(pgOrganizationDomains)
    .where(
      and(
        eq(pgOrganizationDomains.active, true),
        eq(pgOrganizationDomains.connectionStatus, "awaiting_activation"),
        eq(pgOrganizationDomains.dnsMode, "cloudflare"),
        isNotNull(pgOrganizationDomains.cloudflareZoneId)
      )
    )
    .limit(PROCESS_LIMIT);
  const pendingCandidates = candidates.filter(
    (candidate): candidate is PendingCloudflareZone => candidate.zoneId !== null
  );
  const results = [] as Awaited<
    ReturnType<typeof reconcileCloudflareActivation>
  >[];

  for (
    let index = 0;
    index < pendingCandidates.length;
    index += PROCESS_CONCURRENCY
  ) {
    const batch = pendingCandidates.slice(index, index + PROCESS_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(candidate =>
        reconcileCloudflareActivation(candidate, {
            getZone: zoneId => cloudflareApi.getZone(zoneId),
            triggerActivationCheck: zoneId =>
              cloudflareApi.triggerActivationCheck(zoneId),
            updateDomain,
          })
      )
    );
    results.push(...batchResults);
  }

  return NextResponse.json({
    awaitingActivation: results.filter(
      result => result.status === "awaiting_activation"
    ).length,
    connected: results.filter(result => result.status === "connected").length,
    errors: results.filter(result => result.status === "error").length,
    processed: results.length,
  });
}
