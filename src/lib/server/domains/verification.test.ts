import { describe, expect, test } from "bun:test";
import { createDomainVerificationRecord, txtEntriesContainToken } from "./verification";

describe("domain TXT verification", () => {
  test("creates a stable TXT record without using the website A record", () => {
    expect(
      createDomainVerificationRecord("Client.com", "org-123", "test-secret")
    ).toEqual({
      host: "_atlas-verification.client.com",
      value: "atlas-domain-verification=78c52f72bebc432107f6e1612fa2dab3",
    });
  });

  test("recognizes a token returned among unrelated TXT entries", () => {
    expect(
      txtEntriesContainToken(
        ["google-site-verification=abc", "atlas-domain-verification=expected"],
        "atlas-domain-verification=expected"
      )
    ).toBe(true);
  });
});

