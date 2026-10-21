import { describe, expect, test } from "bun:test";
import { shouldRefreshDomainConnection } from "./connection-state";

const pending = {
  active: true,
  cloudflareZoneId: "zone-1",
  connectionStatus: "awaiting_activation",
  dnsMode: "cloudflare",
};

describe("automatic domain activation refresh", () => {
  test("includes purchased and external domains awaiting activation", () => {
    for (const registrarProvider of ["namecheap", "external"]) {
      const domain = { ...pending, registrarProvider };
      expect(shouldRefreshDomainConnection(domain)).toBe(true);
      expect(
        shouldRefreshDomainConnection({
          ...domain,
          connectionStatus: "awaiting_nameservers",
        })
      ).toBe(true);
    }
  });

  test("stops refreshing settled domains and excludes unfinished setup", () => {
    for (const patch of [
      { active: false },
      { cloudflareZoneId: null },
      { dnsMode: "external" },
      { connectionStatus: "connected" },
      { connectionStatus: "review_records" },
    ]) {
      expect(shouldRefreshDomainConnection({ ...pending, ...patch })).toBe(
        false
      );
    }
  });
});
