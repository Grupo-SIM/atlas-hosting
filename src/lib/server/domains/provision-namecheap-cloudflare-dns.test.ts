import { describe, expect, test } from "bun:test";
import type {
  CloudflareDnsRecord,
  CloudflareZone,
} from "@/lib/server/apis/cloudflare";
import type { DomainsGetInfoCleanedResponse } from "@/lib/server/apis/namecheap/types";
import {
  type NamecheapCloudflareCandidate,
  type NamecheapCloudflareProvisioningDependencies,
  type NamecheapCloudflareStatePatch,
  provisionNamecheapCloudflareDomains,
} from "./provision-namecheap-cloudflare-dns";

const zone: CloudflareZone = {
  id: "zone-1",
  name: "example.com",
  name_servers: ["betty.ns.cloudflare.com", "rodrigo.ns.cloudflare.com"],
  status: "pending",
  type: "full",
};

const record: CloudflareDnsRecord = {
  content: "192.0.2.1",
  id: "record-1",
  name: "example.com",
  ttl: 3600,
  type: "A",
};

function candidate(
  overrides: Partial<NamecheapCloudflareCandidate> = {}
): NamecheapCloudflareCandidate {
  return {
    cloudflareZoneId: null,
    dnsImportStatus: "not_started",
    domain: "example.com",
    id: "domain-1",
    ...overrides,
  };
}

function registrarInfo(
  overrides: Partial<DomainsGetInfoCleanedResponse> = {}
): DomainsGetInfoCleanedResponse {
  return {
    AutoRenew: false,
    CreatedDate: "2026-01-01",
    DnsDetails: {
      DynamicDNSStatus: false,
      EmailType: "UNKNOWN",
      HostCount: 1,
      IsFailover: false,
      IsUsingOurDNS: false,
      Nameservers: ["old-ns-1.example.net", "old-ns-2.example.net"],
      ProviderType: "CUSTOM",
    },
    DomainName: "example.com",
    ExpireDate: "2027-01-01",
    ID: 1,
    IsLocked: false,
    IsOurDNS: false,
    IsOwner: true,
    IsPremium: false,
    Modificationrights: { All: true, ChangeDNS: true },
    OwnerName: "Atlas",
    Status: "Ok",
    Whoisguard: { Enabled: false },
    ...overrides,
  };
}

function dependencies(options?: {
  activationCheckError?: Error;
  currentNameservers?: string[];
  dnssec?: boolean;
  existingRecords?: CloudflareDnsRecord[];
  info?: DomainsGetInfoCleanedResponse;
  scannedRecords?: CloudflareDnsRecord[];
  setNameserversError?: Error;
  zone?: CloudflareZone;
  zoneStatuses?: CloudflareZone["status"][];
}) {
  const calls: string[] = [];
  const patches: Array<{ id: string; patch: NamecheapCloudflareStatePatch }> =
    [];
  let liveRecords = [...(options?.existingRecords || [])];
  let zoneStatusIndex = 0;
  const info =
    options?.info ||
    registrarInfo({
      DnsDetails: {
        ...registrarInfo().DnsDetails,
        Nameservers:
          options?.currentNameservers || registrarInfo().DnsDetails.Nameservers,
      },
    });

  const value: NamecheapCloudflareProvisioningDependencies = {
    async ensureZone(domain) {
      calls.push(`ensure:${domain}`);
      return options?.zone || zone;
    },
    async getRegistrarInfo(domain) {
      calls.push(`info:${domain}`);
      return info;
    },
    async getZone(zoneId) {
      calls.push(`get-zone:${zoneId}`);
      const statuses = options?.zoneStatuses || ["active"];
      const status = statuses[Math.min(zoneStatusIndex, statuses.length - 1)];
      zoneStatusIndex += 1;
      return { ...(options?.zone || zone), status };
    },
    async hasPublishedDsRecords(domain) {
      calls.push(`ds:${domain}`);
      return options?.dnssec || false;
    },
    async listDnsRecords(zoneId) {
      calls.push(`records:${zoneId}`);
      return liveRecords;
    },
    async listScannedRecords(zoneId) {
      calls.push(`scanned:${zoneId}`);
      return options?.scannedRecords || [];
    },
    async reviewScannedRecords(zoneId, accepts) {
      calls.push(`review:${zoneId}:${accepts.length}`);
      liveRecords = [...accepts];
    },
    async setNameservers(domain, nameservers) {
      calls.push(`nameservers:${domain}:${nameservers.join(",")}`);
      if (options?.setNameserversError) throw options.setNameserversError;
    },
    async sleep(milliseconds) {
      calls.push(`sleep:${milliseconds}`);
    },
    async triggerActivationCheck(zoneId) {
      calls.push(`activation:${zoneId}`);
      if (options?.activationCheckError) throw options.activationCheckError;
    },
    async triggerDnsScan(zoneId) {
      calls.push(`scan:${zoneId}`);
    },
    async updateDomain(id, patch) {
      calls.push(`update:${id}:${patch.connectionStatus}`);
      patches.push({ id, patch });
    },
  };

  return { calls, dependencies: value, patches };
}

describe("manual Namecheap to Cloudflare provisioning", () => {
  test("scans, accepts records, delegates and persists the completed state", async () => {
    const fake = dependencies({ scannedRecords: [record] });

    const results = await provisionNamecheapCloudflareDomains(
      [candidate()],
      60_000,
      0,
      fake.dependencies
    );

    expect(results).toEqual([
      {
        domain: "example.com",
        message:
          "Zona configurada e nameservers atualizados no registro do domínio. Ativação da zona DNS confirmada.",
        status: "success",
      },
    ]);
    expect(fake.calls).toContain("sleep:60000");
    expect(fake.calls).toContain("review:zone-1:1");
    expect(fake.calls).toContain(
      "nameservers:example.com:betty.ns.cloudflare.com,rodrigo.ns.cloudflare.com"
    );
    expect(fake.patches.at(-1)?.patch).toEqual(
      expect.objectContaining({
        cloudflareZoneStatus: "active",
        connectionStatus: "connected",
        lastDnsError: null,
      })
    );
    expect(fake.patches).toContainEqual(
      expect.objectContaining({
        patch: expect.objectContaining({
          cloudflareZoneId: "zone-1",
          dnsImportStatus: "complete",
        }),
      })
    );
  });

  test("reuses populated zones and does not resend matching nameservers", async () => {
    const fake = dependencies({
      currentNameservers: [
        "RODRIGO.NS.CLOUDFLARE.COM.",
        "betty.ns.cloudflare.com",
      ],
      existingRecords: [record],
      zone: { ...zone, status: "active" },
    });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate({ cloudflareZoneId: "zone-1", dnsImportStatus: "complete" })],
      60_000,
      0,
      fake.dependencies
    );

    expect(result.status).toBe("success");
    expect(result.message).toContain("já estavam corretos");
    expect(fake.calls).not.toContain("scan:zone-1");
    expect(fake.calls.some(call => call.startsWith("sleep:"))).toBe(false);
    expect(fake.calls.some(call => call.startsWith("nameservers:"))).toBe(
      false
    );
    expect(fake.patches.at(-1)?.patch.connectionStatus).toBe("connected");
  });

  test("rechecks an active zone after repairing delegation", async () => {
    const fake = dependencies({
      existingRecords: [record],
      zone: { ...zone, status: "active" },
    });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      0,
      fake.dependencies
    );

    expect(result.status).toBe("success");
    expect(fake.calls).toContain("get-zone:zone-1");
    expect(fake.patches.at(-1)?.patch.connectionStatus).toBe("connected");
  });

  test("accepts the account-wide modification permission without ChangeDNS", async () => {
    const fake = dependencies({
      existingRecords: [record],
      info: registrarInfo({ Modificationrights: { All: true } }),
    });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      0,
      fake.dependencies
    );

    expect(result.status).toBe("success");
    expect(fake.calls.some(call => call.startsWith("nameservers:"))).toBe(true);
  });

  test("blocks delegation when DNSSEC is published", async () => {
    const fake = dependencies({ dnssec: true });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      0,
      fake.dependencies
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("DNSSEC/registro DS");
    expect(fake.calls.some(call => call.startsWith("ensure:"))).toBe(false);
    expect(fake.calls.some(call => call.startsWith("nameservers:"))).toBe(
      false
    );
    expect(fake.patches.at(-1)?.patch.connectionStatus).toBe("error");
  });

  test("rejects domains outside the account or without DNS permission", async () => {
    const outside = dependencies({ info: registrarInfo({ IsOwner: false }) });
    const restricted = dependencies({
      info: registrarInfo({
        Modificationrights: { All: false, ChangeDNS: false },
      }),
    });

    const [outsideResult] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      0,
      outside.dependencies
    );
    const [restrictedResult] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      0,
      restricted.dependencies
    );

    expect(outsideResult.message).toContain("não pertence");
    expect(restrictedResult.message).toContain("Não é permitido alterar");
    expect(outside.calls.some(call => call.startsWith("nameservers:"))).toBe(
      false
    );
    expect(restricted.calls.some(call => call.startsWith("nameservers:"))).toBe(
      false
    );
  });

  test("does not delegate when the scan finds no records", async () => {
    const fake = dependencies();

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      0,
      fake.dependencies
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("Nenhum registro DNS");
    expect(fake.calls.some(call => call.startsWith("nameservers:"))).toBe(
      false
    );
    expect(fake.patches.at(-1)?.patch.lastDnsError).toContain(
      "Nenhum registro DNS"
    );
  });

  test("continues the batch after a registrar failure and waits only once", async () => {
    const fake = dependencies({ scannedRecords: [record] });
    const originalGetInfo = fake.dependencies.getRegistrarInfo;
    fake.dependencies.getRegistrarInfo = async domain => {
      if (domain === "outside.test")
        return registrarInfo({ DomainName: domain, IsOwner: false });
      return originalGetInfo(domain);
    };

    const results = await provisionNamecheapCloudflareDomains(
      [
        candidate({ domain: "outside.test", id: "domain-outside" }),
        candidate(),
      ],
      30_000,
      0,
      fake.dependencies
    );

    expect(results.map(result => result.status)).toEqual(["error", "success"]);
    expect(fake.calls.filter(call => call === "sleep:30000")).toHaveLength(1);
  });

  test("polls pending zones until Cloudflare confirms activation", async () => {
    const fake = dependencies({
      existingRecords: [record],
      zoneStatuses: ["pending", "pending", "active"],
    });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      60_000,
      fake.dependencies
    );

    expect(result.status).toBe("success");
    expect(fake.calls.filter(call => call === "sleep:15000")).toHaveLength(2);
    expect(fake.patches.at(-1)?.patch).toEqual(
      expect.objectContaining({
        cloudflareZoneStatus: "active",
        connectionStatus: "connected",
        lastDnsError: null,
      })
    );
  });

  test("triggers activation once after 60 seconds and survives trigger errors", async () => {
    const fake = dependencies({
      activationCheckError: new Error("Activation check rate limited"),
      existingRecords: [record],
      zoneStatuses: ["pending", "pending", "pending", "pending", "active"],
    });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      75_000,
      fake.dependencies
    );

    expect(result.status).toBe("success");
    expect(
      fake.calls.filter(call => call === "activation:zone-1")
    ).toHaveLength(1);
    expect(fake.patches.at(-1)?.patch.connectionStatus).toBe("connected");
    expect(fake.patches.at(-1)?.patch.lastDnsError).toBeNull();
  });

  test("times out without changing the connection status to error", async () => {
    const fake = dependencies({
      existingRecords: [record],
      zoneStatuses: ["pending"],
    });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      30_000,
      fake.dependencies
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("dentro de 30 segundos");
    expect(fake.patches.at(-1)?.patch.connectionStatus).toBe(
      "awaiting_activation"
    );
    expect(fake.patches.at(-1)?.patch.lastDnsError).toContain(
      "dentro de 30 segundos"
    );
    expect(fake.calls.some(call => call.startsWith("activation:"))).toBe(false);
  });

  test("treats a moved Cloudflare zone as a terminal error", async () => {
    const fake = dependencies({
      existingRecords: [record],
      zoneStatuses: ["moved"],
    });

    const [result] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      60_000,
      fake.dependencies
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("movida");
    expect(fake.patches.at(-1)?.patch).toEqual(
      expect.objectContaining({
        cloudflareZoneStatus: "moved",
        connectionStatus: "error",
      })
    );
  });

  test("polls multiple zones within one shared wait budget", async () => {
    const fake = dependencies({ existingRecords: [record] });
    const reads = new Map<string, number>();
    fake.dependencies.ensureZone = async domain => ({
      ...zone,
      id: `zone-${domain}`,
      name: domain,
    });
    fake.dependencies.getZone = async zoneId => {
      const read = (reads.get(zoneId) || 0) + 1;
      reads.set(zoneId, read);
      const activatesAfter = zoneId.includes("one.test") ? 2 : 3;
      return {
        ...zone,
        id: zoneId,
        name: zoneId.slice("zone-".length),
        status: read >= activatesAfter ? "active" : "pending",
      };
    };

    const results = await provisionNamecheapCloudflareDomains(
      [
        candidate({ domain: "one.test", id: "domain-one" }),
        candidate({ domain: "two.test", id: "domain-two" }),
      ],
      0,
      60_000,
      fake.dependencies
    );

    expect(results.map(result => result.status)).toEqual([
      "success",
      "success",
    ]);
    expect(fake.calls.filter(call => call === "sleep:15000")).toHaveLength(2);
  });

  test("a retry resumes after a nameserver failure without rescanning", async () => {
    const first = dependencies({
      existingRecords: [record],
      setNameserversError: new Error("Namecheap indisponível"),
    });
    const [failed] = await provisionNamecheapCloudflareDomains(
      [candidate()],
      0,
      0,
      first.dependencies
    );
    expect(failed.status).toBe("error");

    const retry = dependencies({ existingRecords: [record] });
    const [completed] = await provisionNamecheapCloudflareDomains(
      [candidate({ cloudflareZoneId: "zone-1" })],
      0,
      0,
      retry.dependencies
    );

    expect(completed.status).toBe("success");
    expect(retry.calls).not.toContain("scan:zone-1");
    expect(retry.calls.some(call => call.startsWith("nameservers:"))).toBe(
      true
    );
  });
});
