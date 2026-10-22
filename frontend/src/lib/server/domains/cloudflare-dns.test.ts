import { describe, expect, test } from "bun:test";
import { matchesExpectedNameservers } from "./cloudflare-dns";

describe("Atlas nameserver status", () => {
  test("accepts the exact assigned nameservers regardless of order and final dot", () => {
    expect(
      matchesExpectedNameservers(
        ["betty.ns.cloudflare.com", "rodrigo.ns.cloudflare.com"],
        ["RODRIGO.NS.CLOUDFLARE.COM.", "betty.ns.cloudflare.com."]
      )
    ).toBe(true);
  });

  test("rejects missing or additional nameservers", () => {
    expect(
      matchesExpectedNameservers(
        ["betty.ns.cloudflare.com", "rodrigo.ns.cloudflare.com"],
        ["betty.ns.cloudflare.com"]
      )
    ).toBe(false);
    expect(
      matchesExpectedNameservers(
        ["betty.ns.cloudflare.com", "rodrigo.ns.cloudflare.com"],
        [
          "betty.ns.cloudflare.com",
          "rodrigo.ns.cloudflare.com",
          "old.example.net",
        ]
      )
    ).toBe(false);
  });
});
