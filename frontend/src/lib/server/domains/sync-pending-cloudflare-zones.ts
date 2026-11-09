import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import { reconcileCloudflareActivation } from "./reconcile-cloudflare-activation";

interface PendingDomain {
  cloudflareZoneId: string | null;
  domain: string;
  id: string;
}

/**
 * Confirma no carregamento da página zonas que a Cloudflare já ativou, sem
 * depender do cron ou do polling do cliente. Falhas nunca quebram a página.
 */
export async function syncPendingCloudflareZones(
  domains: PendingDomain[]
): Promise<boolean> {
  const results = await Promise.all(
    domains
      .filter(domain => domain.cloudflareZoneId)
      .map(domain =>
        reconcileCloudflareActivation(
          {
            domain: domain.domain,
            id: domain.id,
            zoneId: domain.cloudflareZoneId as string,
          },
          {
            getZone: zoneId => cloudflareApi.getZone(zoneId),
            triggerActivationCheck: zoneId =>
              cloudflareApi.triggerActivationCheck(zoneId),
            updateDomain: async (id, patch) => {
              await db
                .update(pgOrganizationDomains)
                .set(patch)
                .where(eq(pgOrganizationDomains.id, id));
            },
          }
        ).catch(() => null)
      )
  );
  return results.some(result => result?.status === "connected");
}
