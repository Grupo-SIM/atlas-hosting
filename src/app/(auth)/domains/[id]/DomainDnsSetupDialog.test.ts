import { describe, expect, test } from "bun:test";
import { getDomainDnsSetupStep } from "./DomainDnsSetupDialog";

describe("domain DNS setup step", () => {
  test("opens record review until the import is complete", () => {
    expect(
      getDomainDnsSetupStep("review_records", "scanning", [
        "a.ns.cloudflare.com",
        "b.ns.cloudflare.com",
      ])
    ).toBe("records");
  });

  test("opens nameserver configuration after record review", () => {
    expect(
      getDomainDnsSetupStep("awaiting_nameservers", "complete", [
        "a.ns.cloudflare.com",
        "b.ns.cloudflare.com",
      ])
    ).toBe("nameservers");
  });

  test("hides the setup button before provisioning or after connection", () => {
    expect(getDomainDnsSetupStep("provisioning", "scanning", [])).toBeNull();
    expect(
      getDomainDnsSetupStep("connected", "complete", [
        "a.ns.cloudflare.com",
        "b.ns.cloudflare.com",
      ])
    ).toBeNull();
  });
});
