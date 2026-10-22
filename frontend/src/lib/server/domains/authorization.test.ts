import { describe, expect, test } from "bun:test";
import { hasActiveDomainAccess, normalizeDomainName } from "./authorization";

describe("domain authorization", () => {
  test("normalizes protocol, case and final dot", () => {
    expect(normalizeDomainName(" HTTPS://Example.COM./path ")).toBe(
      "example.com"
    );
  });

  test("requires an active Atlas-managed domain for DNS writes", () => {
    const domains = [
      { active: true, dnsMode: "external", domain: "external.test" },
      { active: true, dnsMode: "cloudflare", domain: "atlas.test" },
    ];
    expect(hasActiveDomainAccess(domains, "external.test", true)).toBe(false);
    expect(hasActiveDomainAccess(domains, "ATLAS.TEST.", true)).toBe(true);
  });
});
