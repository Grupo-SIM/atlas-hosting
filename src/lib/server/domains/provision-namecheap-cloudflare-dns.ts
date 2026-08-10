import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import {
  type CloudflareDnsRecord,
  type CloudflareZone,
  cloudflareApi,
} from "@/lib/server/apis/cloudflare";
import namecheapApi from "@/lib/server/apis/namecheap";
import type { DomainsGetInfoCleanedResponse } from "@/lib/server/apis/namecheap/types";
import {
  formatAtlasDnsError,
  hasPublishedDsRecords,
  matchesExpectedNameservers,
} from "@/lib/server/domains/cloudflare-dns";
import { REGISTRAR_ADAPTERS } from "@/lib/server/registrars";

export interface NamecheapCloudflareCandidate {
  cloudflareZoneId: string | null;
  dnsImportStatus: string;
  domain: string;
  id: string;
}

export interface NamecheapCloudflareStatePatch {
  cloudflareZoneId?: string | null;
  cloudflareZoneStatus?: string | null;
  connectionStatus?: string;
  dnsImportedAt?: Date | null;
  dnsImportStatus?: string;
  dnsScanStartedAt?: Date | null;
  expectedNameservers?: string[] | null;
  lastDnsCheckAt?: Date | null;
  lastDnsError?: string | null;
}

export interface NamecheapCloudflareProvisioningDependencies {
  ensureZone(domain: string): Promise<CloudflareZone>;
  getRegistrarInfo(domain: string): Promise<DomainsGetInfoCleanedResponse>;
  hasPublishedDsRecords(domain: string): Promise<boolean>;
  listDnsRecords(zoneId: string): Promise<CloudflareDnsRecord[]>;
  listScannedRecords(zoneId: string): Promise<CloudflareDnsRecord[]>;
  reviewScannedRecords(
    zoneId: string,
    accepts: CloudflareDnsRecord[],
    rejectIds: string[]
  ): Promise<void>;
  setNameservers(domain: string, nameservers: string[]): Promise<void>;
  sleep(milliseconds: number): Promise<void>;
  triggerDnsScan(zoneId: string): Promise<void>;
  updateDomain(id: string, patch: NamecheapCloudflareStatePatch): Promise<void>;
}

export interface NamecheapCloudflareProvisioningResult {
  domain: string;
  message: string;
  status: "error" | "success";
}

interface PreparedDomain {
  candidate: NamecheapCloudflareCandidate;
  currentNameservers: string[];
  scanStarted: boolean;
  zone: CloudflareZone;
}

function errorMessage(error: unknown) {
  return formatAtlasDnsError(error, "Falha ao provisionar o DNS do domínio.");
}

async function saveFailure(
  candidate: NamecheapCloudflareCandidate,
  error: unknown,
  dependencies: NamecheapCloudflareProvisioningDependencies
): Promise<NamecheapCloudflareProvisioningResult> {
  const message = errorMessage(error);
  try {
    await dependencies.updateDomain(candidate.id, {
      connectionStatus: "error",
      lastDnsCheckAt: new Date(),
      lastDnsError: message,
    });
  } catch (persistenceError) {
    return {
      domain: candidate.domain,
      message: `${message} Também não foi possível salvar o erro: ${errorMessage(persistenceError)}`,
      status: "error",
    };
  }
  return { domain: candidate.domain, message, status: "error" };
}

async function prepareDomain(
  candidate: NamecheapCloudflareCandidate,
  dependencies: NamecheapCloudflareProvisioningDependencies
): Promise<PreparedDomain> {
  const registrarInfo = await dependencies.getRegistrarInfo(candidate.domain);
  if (!registrarInfo.IsOwner)
    throw new Error("O domínio não pertence à conta Namecheap configurada.");
  const modificationRights = registrarInfo.Modificationrights;
  if (
    modificationRights &&
    modificationRights.All !== true &&
    modificationRights.ChangeDNS !== true
  )
    throw new Error("A Namecheap não permite alterar o DNS deste domínio.");
  if (await dependencies.hasPublishedDsRecords(candidate.domain))
    throw new Error(
      "O domínio possui DNSSEC/registro DS publicado. Remova-o antes da migração."
    );

  const zone = await dependencies.ensureZone(candidate.domain);
  if (zone.name_servers.length === 0)
    throw new Error("A zona não recebeu nameservers da Cloudflare.");

  const existingRecords = await dependencies.listDnsRecords(zone.id);
  const scanStarted = existingRecords.length === 0;
  if (scanStarted) await dependencies.triggerDnsScan(zone.id);

  await dependencies.updateDomain(candidate.id, {
    cloudflareZoneId: zone.id,
    cloudflareZoneStatus: zone.status,
    connectionStatus: "provisioning",
    dnsImportStatus: scanStarted ? "scanning" : candidate.dnsImportStatus,
    dnsScanStartedAt: scanStarted ? new Date() : undefined,
    expectedNameservers: zone.name_servers,
    lastDnsCheckAt: new Date(),
    lastDnsError: null,
  });

  return {
    candidate,
    currentNameservers: registrarInfo.DnsDetails.Nameservers,
    scanStarted,
    zone,
  };
}

async function finalizeDomain(
  prepared: PreparedDomain,
  dependencies: NamecheapCloudflareProvisioningDependencies
): Promise<NamecheapCloudflareProvisioningResult> {
  const { candidate, currentNameservers, scanStarted, zone } = prepared;
  if (scanStarted) {
    const scannedRecords = await dependencies.listScannedRecords(zone.id);
    if (scannedRecords.length > 0)
      await dependencies.reviewScannedRecords(zone.id, scannedRecords, []);
  }

  const records = await dependencies.listDnsRecords(zone.id);
  if (records.length === 0)
    throw new Error(
      "Nenhum registro DNS foi encontrado; os nameservers não foram alterados."
    );

  const nameserversAlreadyMatch = matchesExpectedNameservers(
    zone.name_servers,
    currentNameservers
  );
  if (!nameserversAlreadyMatch)
    await dependencies.setNameservers(candidate.domain, zone.name_servers);

  await dependencies.updateDomain(candidate.id, {
    cloudflareZoneId: zone.id,
    cloudflareZoneStatus: zone.status,
    connectionStatus:
      nameserversAlreadyMatch && zone.status === "active"
        ? "connected"
        : "awaiting_activation",
    dnsImportedAt: new Date(),
    dnsImportStatus: "complete",
    expectedNameservers: zone.name_servers,
    lastDnsCheckAt: new Date(),
    lastDnsError: null,
  });

  return {
    domain: candidate.domain,
    message: nameserversAlreadyMatch
      ? "Zona configurada; os nameservers já estavam corretos."
      : "Zona configurada e nameservers enviados à Namecheap.",
    status: "success",
  };
}

export async function provisionNamecheapCloudflareDomains(
  candidates: NamecheapCloudflareCandidate[],
  scanWaitMilliseconds: number,
  dependencies: NamecheapCloudflareProvisioningDependencies = defaultNamecheapCloudflareProvisioningDependencies
): Promise<NamecheapCloudflareProvisioningResult[]> {
  const prepared: PreparedDomain[] = [];
  const results = new Map<string, NamecheapCloudflareProvisioningResult>();

  for (const candidate of candidates) {
    try {
      prepared.push(await prepareDomain(candidate, dependencies));
    } catch (error) {
      results.set(
        candidate.id,
        await saveFailure(candidate, error, dependencies)
      );
    }
  }

  if (prepared.some(domain => domain.scanStarted) && scanWaitMilliseconds > 0)
    await dependencies.sleep(scanWaitMilliseconds);

  for (const domain of prepared) {
    try {
      results.set(
        domain.candidate.id,
        await finalizeDomain(domain, dependencies)
      );
    } catch (error) {
      results.set(
        domain.candidate.id,
        await saveFailure(domain.candidate, error, dependencies)
      );
    }
  }

  return candidates.map(candidate => {
    const result = results.get(candidate.id);
    if (!result) throw new Error(`Resultado ausente para ${candidate.domain}.`);
    return result;
  });
}

export const defaultNamecheapCloudflareProvisioningDependencies: NamecheapCloudflareProvisioningDependencies =
  {
    ensureZone: domain => cloudflareApi.ensureZone(domain),
    getRegistrarInfo: domain => namecheapApi.getInfo({ DomainName: domain }),
    hasPublishedDsRecords,
    listDnsRecords: zoneId => cloudflareApi.listDnsRecords(zoneId),
    listScannedRecords: zoneId => cloudflareApi.listScannedRecords(zoneId),
    reviewScannedRecords: (zoneId, accepts, rejectIds) =>
      cloudflareApi.reviewScannedRecords(zoneId, accepts, rejectIds),
    async setNameservers(domain, nameservers) {
      const registrar = REGISTRAR_ADAPTERS.get("namecheap");
      if (!registrar)
        throw new Error("Integração com a Namecheap indisponível.");
      await registrar.setNameservers(domain, nameservers);
    },
    sleep: milliseconds =>
      new Promise(resolve => setTimeout(resolve, milliseconds)),
    triggerDnsScan: zoneId => cloudflareApi.triggerDnsScan(zoneId),
    async updateDomain(id, patch) {
      await db
        .update(pgOrganizationDomains)
        .set(patch)
        .where(eq(pgOrganizationDomains.id, id));
    },
  };
