"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import {
  formatAtlasDnsError,
  hasPublishedDsRecords,
  persistCloudflareZone,
  provisionCloudflareZone,
  refreshCloudflareZone,
} from "@/lib/server/domains/cloudflare-dns";
import { REGISTRAR_ADAPTERS } from "@/lib/server/registrars";

export interface ModeActionResult {
  message: string;
  success: boolean;
}

async function ownedDomain(id: string) {
  const user = await getUser();
  if (!user) return null;
  return db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.id, id),
      eq(pgOrganizationDomains.organizationId, user.organization.id)
    ),
  });
}

async function saveError(id: string, error: unknown) {
  const message = formatAtlasDnsError(error, "Falha ao configurar a zona DNS.");
  await db
    .update(pgOrganizationDomains)
    .set({ connectionStatus: "error", lastDnsError: message })
    .where(eq(pgOrganizationDomains.id, id));
  return { message, success: false } satisfies ModeActionResult;
}

export async function startCloudflareMigration(
  id: string
): Promise<ModeActionResult> {
  const domain = await ownedDomain(id);
  if (!domain?.active)
    return { message: "Domínio ativo não encontrado.", success: false };
  if (await hasPublishedDsRecords(domain.domain)) {
    return {
      message:
        "Remova primeiro o DNSSEC/registro DS no registrador atual para evitar indisponibilidade durante a troca.",
      success: false,
    };
  }
  try {
    const zone = await provisionCloudflareZone(domain.domain, true);
    await persistCloudflareZone(domain.id, zone, {
      connectionStatus: "review_records",
      importStatus: "scanning",
    });
    revalidatePath(`/domains/${id}`);
    return {
      message:
        "DNS preparado. O Atlas está procurando registros para sua revisão.",
      success: true,
    };
  } catch (error) {
    return saveError(id, error);
  }
}

export async function completeCloudflareScanReview(
  id: string,
  acceptedIds: string[]
): Promise<ModeActionResult> {
  const domain = await ownedDomain(id);
  if (!domain?.active || !domain.cloudflareZoneId)
    return { message: "Zona DNS não encontrada.", success: false };
  try {
    const scanned = await cloudflareApi.listScannedRecords(
      domain.cloudflareZoneId
    );
    const accepted = new Set(acceptedIds);
    await cloudflareApi.reviewScannedRecords(
      domain.cloudflareZoneId,
      scanned.filter(record => accepted.has(record.id)),
      scanned
        .filter(record => !accepted.has(record.id))
        .map(record => record.id)
    );

    let connectionStatus = "awaiting_nameservers";
    if (domain.registrarProvider === "namecheap") {
      const adapter = REGISTRAR_ADAPTERS.get("namecheap");
      if (!adapter)
        throw new Error("Integração com o registrador indisponível.");
      await adapter.setNameservers(
        domain.domain,
        domain.expectedNameservers || []
      );
      connectionStatus = "awaiting_activation";
    }

    await db
      .update(pgOrganizationDomains)
      .set({
        connectionStatus,
        dnsImportedAt: new Date(),
        dnsImportStatus: "complete",
        lastDnsError: null,
      })
      .where(eq(pgOrganizationDomains.id, id));
    revalidatePath(`/domains/${id}`);
    return {
      message:
        domain.registrarProvider === "namecheap"
          ? "Registros importados e nameservers atualizados na Namecheap."
          : "Registros importados. Agora altere os nameservers no registrador.",
      success: true,
    };
  } catch (error) {
    return saveError(id, error);
  }
}

export async function refreshCloudflareConnection(
  id: string
): Promise<ModeActionResult> {
  const domain = await ownedDomain(id);
  if (!domain?.cloudflareZoneId)
    return { message: "Zona DNS não encontrada.", success: false };
  try {
    await cloudflareApi
      .triggerActivationCheck(domain.cloudflareZoneId)
      .catch(() => undefined);
    const zone = await refreshCloudflareZone(id, domain.cloudflareZoneId);
    revalidatePath(`/domains/${id}`);
    return {
      message:
        zone.status === "active"
          ? "Nameservers confirmados. O DNS do Atlas está ativo."
          : "O Atlas ainda aguarda a propagação dos nameservers.",
      success: zone.status === "active",
    };
  } catch (error) {
    return saveError(id, error);
  }
}

export async function keepExternalDns(id: string): Promise<ModeActionResult> {
  const domain = await ownedDomain(id);
  if (!domain?.active)
    return { message: "Domínio ativo não encontrado.", success: false };
  if (domain.registrarProvider === "namecheap") {
    return {
      message: "Domínios comprados pelo Atlas usam o DNS do Atlas.",
      success: false,
    };
  }
  await db
    .update(pgOrganizationDomains)
    .set({
      connectionStatus: "unmanaged",
      dnsMode: "external",
      lastDnsError: null,
    })
    .where(eq(pgOrganizationDomains.id, id));
  revalidatePath(`/domains/${id}`);
  return {
    message: "O DNS continuará no provedor atual.",
    success: true,
  };
}
