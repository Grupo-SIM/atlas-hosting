import { describe, expect, test } from "bun:test";
import type { CloudflareZone } from "@/lib/server/apis/cloudflare";
import {
  hasAmbiguousPreviousRegistration,
  provisionPurchasedDomainDns,
} from "./registerFromPaidInvoice";

describe("registration outcome reconciliation", () => {
  test("recognizes a previous create timeout as an ambiguous registration", () => {
    expect(
      hasAmbiguousPreviousRegistration(
        {
          domainRegistration: {
            at: "2026-08-13T21:48:19.647Z",
            errors: {
              "teron.app":
                "Axios request failed for namecheap.domains.create (GET): timeout of 60000ms exceeded",
            },
            failed: ["teron.app"],
            registered: [],
            skipped: [],
            status: "failed",
          },
          whoisguard: "on",
          years: "1",
        },
        "teron.app"
      )
    ).toBe(true);
  });

  test("does not classify a registrar rejection as an ambiguous result", () => {
    expect(
      hasAmbiguousPreviousRegistration(
        {
          domainRegistration: {
            at: "2026-08-13T21:48:19.647Z",
            errors: {
              "example.com": "NC API Error. Err 2011170: Domain not available",
            },
            failed: ["example.com"],
            registered: [],
            skipped: [],
            status: "failed",
          },
          whoisguard: "off",
          years: "1",
        },
        "example.com"
      )
    ).toBe(false);
  });
});

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
