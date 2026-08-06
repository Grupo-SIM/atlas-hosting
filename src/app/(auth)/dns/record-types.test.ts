import { describe, expect, test } from "bun:test";
import { dnsRecordTypes } from "./record-types";

describe("dnsRecordTypes", () => {
  test("offers Plesk advanced records and excludes Namecheap URL redirects", () => {
    expect(dnsRecordTypes.map(type => type.value)).toEqual([
      "A", "AAAA", "CNAME", "MX", "TXT", "CAA", "NS", "SRV", "TLSA",
    ]);
  });
});
