import { describe, expect, test } from "bun:test";
import { isContaboConfigured, readSupplier, readContaboInventory, validateSupplierBalances } from "./overview";

describe("supplier overview", () => {
  test("denies non-admin without consulting supplier", async () => {
    let called = false;
    await expect(readSupplier(false, true, async () => { called = true; return 0; })).rejects.toThrow("Acesso administrativo");
    expect(called).toBe(false);
  });
  test("unavailable balance is an error, never zero", async () => {
    const result = await readSupplier(true, true, async () => { throw new Error("timeout"); });
    expect(result.state).toBe("error");
    expect(result).not.toHaveProperty("data");
  });
  test("returns actual balance fields including zero", async () => {
    const balances = { available: 0, total: 12, currency: "USD", autoRenewRequired: 50 };
    expect(await readSupplier(true, true, async () => validateSupplierBalances(balances))).toEqual({ state: "ready", data: balances });
    expect(() => validateSupplierBalances({ ...balances, available: NaN })).toThrow();
  });
  test("unconfigured skips supplier; configuration checks all credentials", async () => {
    expect(await readSupplier(true, false, async () => { throw new Error("must not call"); })).toEqual({ state: "unconfigured" });
    expect(isContaboConfigured({ CONTABO_CLIENT_ID: "set" })).toBe(false);
    expect(isContaboConfigured({ CONTABO_CLIENT_ID: "set", CONTABO_CLIENT_SECRET: "set", CONTABO_USERNAME: "set", CONTABO_PASSWORD: "set" })).toBe(true);
  });
});

test("inventory reads every page and does not invent missing IPs", async () => {
  const calls: number[] = [];
  const result = await readContaboInventory(async page => {
    calls.push(page);
    return { data: [{ instanceId: page, status: "running", region: "EU", ...(page === 1 ? { ipConfig: { v4: [{ ip: "192.0.2.1" }] } } : {}) }], _pagination: { totalPages: 2 } };
  });
  expect(calls).toEqual([1, 2]);
  expect(result.map(instance => instance.ipv4)).toEqual(["192.0.2.1", null]);
});
test("partial inventory failure does not return misleading incomplete data", async () => {
  await expect(readContaboInventory(async page => {
    if (page === 2) throw new Error("timeout");
    return { data: [], _pagination: { totalPages: 2 } };
  })).rejects.toThrow("timeout");
});
