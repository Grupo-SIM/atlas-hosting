import { describe, expect, test } from "bun:test";
import { hasActiveDomainAccess } from "./authorization";

describe("hasActiveDomainAccess", () => {
  test("denies an inactive domain even when it belongs to the organization", () => {
    expect(
      hasActiveDomainAccess(
        [
          { active: false, domain: "client.com" },
          { active: true, domain: "other.com" },
        ],
        "CLIENT.COM"
      )
    ).toBe(false);
  });

  test("allows the active domain independent of letter casing", () => {
    expect(
      hasActiveDomainAccess([{ active: true, domain: "client.com" }], "CLIENT.COM")
    ).toBe(true);
  });
});
