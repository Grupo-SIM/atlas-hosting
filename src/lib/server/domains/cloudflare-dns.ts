import { query } from "dns-query";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import {
  type CloudflareZone,
  cloudflareApi,
} from "@/lib/server/apis/cloudflare";

export async function hasPublishedDsRecords(domain: string): Promise<boolean> {
  try {
    const responses = await Promise.all(
      ["1.1.1.1", "8.8.8.8"].map(endpoint =>
        query(
          { question: { name: domain, type: "DS" } },
          { endpoints: [endpoint] }
        )
      )
    );
    return responses.some(response =>
      (response.answers || []).some(answer => answer.type === "DS")
    );
  } catch {
    return false;
  }
}

export function formatAtlasDnsError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return message.replace(/cloudflare/gi, "serviço de DNS do Atlas");
}

export async function provisionCloudflareZone(
  domain: string,
  scanExistingRecords: boolean
): Promise<CloudflareZone> {
  const zone = await cloudflareApi.ensureZone(domain);
  if (scanExistingRecords) await cloudflareApi.triggerDnsScan(zone.id);
  return zone;
}

export async function persistCloudflareZone(
  domainId: string,
  zone: CloudflareZone,
  options: { importStatus: string; connectionStatus: string }
) {
  await db
    .update(pgOrganizationDomains)
    .set({
      cloudflareZoneId: zone.id,
      cloudflareZoneStatus: zone.status,
      connectionStatus: options.connectionStatus,
      dnsImportStatus: options.importStatus,
      dnsMode: "cloudflare",
      dnsScanStartedAt:
        options.importStatus === "scanning" ? new Date() : undefined,
      expectedNameservers: zone.name_servers,
      lastDnsCheckAt: new Date(),
      lastDnsError: null,
    })
    .where(eq(pgOrganizationDomains.id, domainId));
}

export async function refreshCloudflareZone(domainId: string, zoneId: string) {
  const zone = await cloudflareApi.getZone(zoneId);
  await db
    .update(pgOrganizationDomains)
    .set({
      cloudflareZoneStatus: zone.status,
      connectionStatus:
        zone.status === "active" ? "connected" : "awaiting_activation",
      expectedNameservers: zone.name_servers,
      lastDnsCheckAt: new Date(),
      lastDnsError: null,
    })
    .where(eq(pgOrganizationDomains.id, domainId));
  return zone;
}

export async function getManagedCloudflareZone(domain: string) {
  const managed = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.domain, domain.toLowerCase()),
      eq(pgOrganizationDomains.dnsMode, "cloudflare"),
      eq(pgOrganizationDomains.active, true)
    ),
  });
  if (!managed?.cloudflareZoneId)
    throw new Error(
      `O domínio ${domain} não possui uma zona DNS gerenciada pelo Atlas.`
    );
  return { domain: managed, zoneId: managed.cloudflareZoneId };
}

export async function configureWebHostingDns(domain: string, serverIp: string) {
  const { zoneId } = await getManagedCloudflareZone(domain);
  await Promise.all([
    cloudflareApi.upsertDnsRecord(zoneId, {
      content: serverIp,
      name: domain,
      proxied: false,
      ttl: 1,
      type: "A",
    }),
    cloudflareApi.upsertDnsRecord(zoneId, {
      content: serverIp,
      name: `www.${domain}`,
      proxied: false,
      ttl: 1,
      type: "A",
    }),
  ]);
}
