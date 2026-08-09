import { describe, expect, test } from "bun:test";
import {
  absoluteRecordName,
  parseCloudflareRecordForm,
} from "./cloudflare-record-input";

describe("Cloudflare DNS record input", () => {
  test("normalizes apex and relative hosts", () => {
    expect(absoluteRecordName("@", "Example.COM")).toBe("example.com");
    expect(absoluteRecordName("www", "example.com")).toBe("www.example.com");
  });

  test("keeps proxy disabled unless explicitly selected", () => {
    const form = new FormData();
    form.set("recordType", "A");
    form.set("hostName", "@");
    form.set("content", "192.0.2.1");
    form.set("ttl", "1");
    expect(parseCloudflareRecordForm(form, "example.com").input).toEqual(
      expect.objectContaining({ proxied: false, ttl: 1 })
    );
  });

  test("builds structured SRV data", () => {
    const form = new FormData();
    form.set("recordType", "SRV");
    form.set("hostName", "_sip._tcp");
    form.set("content", "sip.example.com");
    form.set("priority", "10");
    form.set("srvWeight", "5");
    form.set("srvPort", "5060");
    form.set("ttl", "300");
    expect(parseCloudflareRecordForm(form, "example.com").input?.data).toEqual({
      port: 5060,
      priority: 10,
      target: "sip.example.com",
      weight: 5,
    });
  });

  test("blocks apex NS records", () => {
    const form = new FormData();
    form.set("recordType", "NS");
    form.set("hostName", "@");
    form.set("content", "ns.example.net");
    form.set("ttl", "3600");
    expect(parseCloudflareRecordForm(form, "example.com").message).toContain(
      "atribuídos pela Cloudflare"
    );
  });
});
