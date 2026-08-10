import { describe, expect, test } from "bun:test";
import type { CloudflareZone } from "@/lib/server/apis/cloudflare";
import { provisionPurchasedDomainDns } from "./registerFromPaidInvoice";

describe("purchased domain DNS provisioning", () => {
  test("creates the zone before sending its assigned nameservers to the registrar", async () => {
    const calls: string[] = [];
    const zone: CloudflareZone = {
      id: "zone-1",
      name: "example.com",
      name_servers: ["betty.ns.cloudflare.com", "rodrigo.ns.cloudflare.com"],
      status: "pending",
      type: "full",
    };

    const result = await provisionPurchasedDomainDns("example.com", {
      provisionZone: async (domain, scanExistingRecords) => {
        calls.push(`zone:${domain}:${scanExistingRecords}`);
        return zone;
      },
      setNameservers: async (domain, nameservers) => {
        calls.push(`registrar:${domain}:${nameservers.join(",")}`);
      },
    });

    expect(result).toEqual(zone);
    expect(calls).toEqual([
      "zone:example.com:false",
      "registrar:example.com:betty.ns.cloudflare.com,rodrigo.ns.cloudflare.com",
    ]);
  });
});
