import { describe, expect, test } from "bun:test";
import {
  domainTransferStatusMessage,
  getDomainTransferStatus,
  invoiceReferencesDomain,
} from "./domain-transfer";

describe("domain transfer state", () => {
  test("requires both parties before completing", () => {
    expect(
      getDomainTransferStatus({ sourceAcceptedAt: null, targetAcceptedAt: null })
    ).toBe("pending_both");
    expect(
      getDomainTransferStatus({
        sourceAcceptedAt: new Date(),
        targetAcceptedAt: null,
      })
    ).toBe("awaiting_target");
    expect(
      getDomainTransferStatus({
        sourceAcceptedAt: null,
        targetAcceptedAt: new Date(),
      })
    ).toBe("awaiting_source");
  });

  test("describes whether the viewer or another party must accept", () => {
    expect(
      domainTransferStatusMessage("awaiting_target", "target", "source", "target")
    ).toBe("Aguardando sua confirmação.");
    expect(
      domainTransferStatusMessage("awaiting_target", "source", "source", "target")
    ).toBe("Aguardando confirmação da outra parte.");
  });
});

describe("domain transfer invoice eligibility", () => {
  test("finds single and bundle domain invoices", () => {
    expect(
      invoiceReferencesDomain(
        { metadata: { domain: "Example.com" }, reference: "renew" },
        "example.com"
      )
    ).toBe(true);
    expect(
      invoiceReferencesDomain(
        {
          metadata: { bundleDomains: ["one.com", "two.com"] },
          reference: "package",
        },
        "two.com"
      )
    ).toBe(true);
    expect(
      invoiceReferencesDomain(
        { metadata: {}, reference: "other.com" },
        "example.com"
      )
    ).toBe(false);
  });
});
