import { describe, expect, test } from "bun:test";
import {
  createDomainVerificationRecord,
  txtEntriesContainToken,
} from "./verification";

describe("domain ownership verification", () => {
  test("creates a stable organization-scoped TXT record", () => {
    const first = createDomainVerificationRecord(
      "Example.com",
      "org-1",
      "secret"
    );
    const second = createDomainVerificationRecord(
      "example.com.",
      "org-1",
      "secret"
    );
    expect(first).toEqual(second);
    expect(first.host).toBe("_atlas-verification.example.com");
    expect(first.value).toStartWith("atlas-domain-verification=");
  });

  test("accepts quoted TXT answers", () => {
    expect(
      txtEntriesContainToken(
        ['"atlas-domain-verification=abc"'],
        "atlas-domain-verification=abc"
      )
    ).toBe(true);
  });
});
