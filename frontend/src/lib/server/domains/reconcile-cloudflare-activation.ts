import type { CloudflareZone } from "@/lib/server/apis/cloudflare";

export interface PendingCloudflareZone {
  domain: string;
  id: string;
  zoneId: string;
}

export interface CloudflareActivationStatePatch {
  cloudflareZoneStatus: CloudflareZone["status"];
  connectionStatus: "awaiting_activation" | "connected" | "error";
  expectedNameservers: string[];
  lastDnsCheckAt: Date;
  lastDnsError: string | null;
}

export interface CloudflareActivationReconciliationDependencies {
  getZone(zoneId: string): Promise<CloudflareZone>;
  triggerActivationCheck(zoneId: string): Promise<void>;
  updateDomain(id: string, patch: CloudflareActivationStatePatch): Promise<void>;
}

export interface CloudflareActivationReconciliationResult {
  domain: string;
  status: "awaiting_activation" | "connected" | "error";
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message.replace(/cloudflare/gi, "serviço de DNS do Atlas")
    : "Falha ao consultar a ativação da zona DNS.";
}

export async function reconcileCloudflareActivation(
  candidate: PendingCloudflareZone,
  dependencies: CloudflareActivationReconciliationDependencies
): Promise<CloudflareActivationReconciliationResult> {
  const now = new Date();

  try {
    const zone = await dependencies.getZone(candidate.zoneId);
    const connectionStatus =
      zone.status === "active"
        ? "connected"
        : zone.status === "moved"
          ? "error"
          : "awaiting_activation";
    const lastDnsError =
      zone.status === "moved"
        ? "A zona DNS foi movida. Configure novamente o DNS do domínio."
        : null;

    if (connectionStatus === "awaiting_activation") {
      try {
        await dependencies.triggerActivationCheck(candidate.zoneId);
      } catch (error) {
        await dependencies.updateDomain(candidate.id, {
          cloudflareZoneStatus: zone.status,
          connectionStatus,
          expectedNameservers: zone.name_servers,
          lastDnsCheckAt: now,
          lastDnsError: errorMessage(error),
        });
        return { domain: candidate.domain, status: connectionStatus };
      }
    }

    await dependencies.updateDomain(candidate.id, {
      cloudflareZoneStatus: zone.status,
      connectionStatus,
      expectedNameservers: zone.name_servers,
      lastDnsCheckAt: now,
      lastDnsError,
    });
    return { domain: candidate.domain, status: connectionStatus };
  } catch (error) {
    await dependencies.updateDomain(candidate.id, {
      cloudflareZoneStatus: "pending",
      connectionStatus: "awaiting_activation",
      expectedNameservers: [],
      lastDnsCheckAt: now,
      lastDnsError: errorMessage(error),
    });
    return { domain: candidate.domain, status: "error" };
  }
}
