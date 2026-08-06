import { describe, expect, test } from "bun:test";
import { DnsRecordRequestTypeEnum, DnsRecordTypeEnum } from "@/plesk";
import { normalizePleskDnsRecord } from "./dns";

describe("normalizePleskDnsRecord", () => {
  test("preserves Plesk IDs and MX priority for record-level edits", () => {
    expect(
      normalizePleskDnsRecord({
        host: "nraremodeling.com.",
        id: 42,
        opt: "10",
        ttl: 3600,
        type: DnsRecordTypeEnum.MX,
        value: "mail.nraremodeling.com.",
      })
    ).toEqual({
      host: "nraremodeling.com.",
      id: 42,
      priority: 10,
      ttl: 3600,
      type: DnsRecordRequestTypeEnum.MX,
      value: "mail.nraremodeling.com.",
    });
  });
});
