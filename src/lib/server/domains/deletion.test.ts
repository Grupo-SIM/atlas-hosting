import { describe, expect, test } from "bun:test";
import { assertDomainDeletionAllowed, canDeleteOrganizationDomain, deleteDnsBeforeDetach, type DomainDeletionState } from "./deletion";

const now = new Date("2026-10-05T12:00:00Z");
const expired: DomainDeletionState = {
  autoRenew: false,
  domain: "example.com",
  expiresAt: "2026-10-04T12:00:00Z",
  invoices: [],
  purchased: true,
  transfers: [],
};

describe("domain deletion", () => {
  test("requires organization owner outside impersonation", () => {
    expect(canDeleteOrganizationDomain({ id: "owner", organization: { ownerId: "owner" } })).toBe(true);
    expect(canDeleteOrganizationDomain({ id: "member", organization: { ownerId: "owner" } })).toBe(false);
    expect(canDeleteOrganizationDomain({ id: "owner", impersonatedBy: "admin", organization: { ownerId: "owner" } })).toBe(false);
  });

  test("allows expired manually renewed purchase and external domain", () => {
    expect(() => assertDomainDeletionAllowed(expired, now)).not.toThrow();
    expect(() => assertDomainDeletionAllowed({ ...expired, purchased: false, expiresAt: null }, now)).not.toThrow();
  });

  test("paid validity blocks both renewal modes", () => {
    for (const autoRenew of [false, true]) {
      expect(() => assertDomainDeletionAllowed({ ...expired, autoRenew, expiresAt: "2026-11-01" }, now)).toThrow("vigência paga");
    }
  });

  test("expired automatic purchase is blocked, unknown expiry fails closed", () => {
    expect(() => assertDomainDeletionAllowed({ ...expired, autoRenew: true }, now)).toThrow("renovação automática");
    for (const expiresAt of [null, "N/A"]) {
      expect(() => assertDomainDeletionAllowed({ ...expired, expiresAt }, now)).toThrow("confirmar a vigência");
    }
  });

  test("blocks pending renewal including bundle references", () => {
    for (const status of ["pending", "processing"]) {
      expect(() => assertDomainDeletionAllowed({ ...expired, invoices: [{ status, reference: "bundle", metadata: { bundleDomains: ["EXAMPLE.COM"] } }] }, now)).toThrow("pendente");
    }
    expect(() => assertDomainDeletionAllowed({ ...expired, invoices: [{ status: "paid", reference: "example.com", metadata: {} }] }, now)).not.toThrow();
  });

  test("blocks open transfers, preserves completed history eligibility", () => {
    for (const status of ["pending_both", "awaiting_source", "awaiting_target"]) {
      expect(() => assertDomainDeletionAllowed({ ...expired, transfers: [{ status }] }, now)).toThrow("transferência");
    }
    expect(() => assertDomainDeletionAllowed({ ...expired, transfers: [{ status: "completed" }] }, now)).not.toThrow();
  });

  test("DNS failure preserves local association; success deletes DNS first", async () => {
    const calls: string[] = [];
    await expect(deleteDnsBeforeDetach("zone", async () => { throw new Error("unavailable"); }, async () => { calls.push("detach"); })).rejects.toThrow("unavailable");
    expect(calls).toEqual([]);
    await deleteDnsBeforeDetach("zone", async () => { calls.push("dns"); }, async () => { calls.push("detach"); });
    expect(calls).toEqual(["dns", "detach"]);
  });

  test("external DNS without zone removes only local association", async () => {
    const calls: string[] = [];
    await deleteDnsBeforeDetach(null, async () => { calls.push("dns"); }, async () => { calls.push("detach"); });
    expect(calls).toEqual(["detach"]);
  });
});
