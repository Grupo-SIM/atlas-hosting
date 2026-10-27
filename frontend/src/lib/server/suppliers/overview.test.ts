import { describe, expect, test } from "bun:test";
import {
  isContaboConfigured,
  readContaboInventory,
  readSupplier,
  validateSupplierBalances,
} from "./overview";

describe("supplier overview", () => {
  test("denies non-admin without consulting supplier", async () => {
    let called = false;
    await expect(
      readSupplier(false, true, async () => {
        called = true;
        return 0;
      })
    ).rejects.toThrow("Acesso administrativo");
    expect(called).toBe(false);
  });
  test("unavailable balance is an error, never zero", async () => {
    const result = await readSupplier(true, true, async () => {
      throw new Error("timeout");
    });
    expect(result.state).toBe("error");
    expect(result).not.toHaveProperty("data");
  });
  test("returns actual balance fields including zero", async () => {
    const balances = {
      autoRenewRequired: 50,
      available: 0,
      currency: "USD",
      total: 12,
    };
    expect(
      await readSupplier(true, true, async () =>
        validateSupplierBalances(balances)
      )
    ).toEqual({ data: balances, state: "ready" });
    expect(() =>
      validateSupplierBalances({ ...balances, available: Number.NaN })
    ).toThrow();
  });
  test("unconfigured skips supplier; configuration checks all credentials", async () => {
    expect(
      await readSupplier(true, false, async () => {
        throw new Error("must not call");
      })
    ).toEqual({ state: "unconfigured" });
    expect(
      isContaboConfigured({ CONTABO_CLIENT_ID: "set", NODE_ENV: "test" })
    ).toBe(false);
    expect(
      isContaboConfigured({
        CONTABO_CLIENT_ID: "set",
        CONTABO_CLIENT_SECRET: "set",
        CONTABO_PASSWORD: "set",
        CONTABO_USERNAME: "set",
        NODE_ENV: "test",
      })
    ).toBe(true);
  });
});

test("inventory reads every page and does not invent missing IPs", async () => {
  const calls: number[] = [];
  const result = await readContaboInventory(async page => {
    calls.push(page);
    return {
      _pagination: { totalPages: 2 },
      data: [
        {
          instanceId: page,
          region: "EU",
          status: "running",
          ...(page === 1 ? { ipConfig: { v4: [{ ip: "192.0.2.1" }] } } : {}),
        },
      ],
    };
  });
  expect(calls).toEqual([1, 2]);
  expect(result.map(instance => instance.ipv4)).toEqual(["192.0.2.1", null]);
});
test("partial inventory failure does not return misleading incomplete data", async () => {
  await expect(
    readContaboInventory(async page => {
      if (page === 2) throw new Error("timeout");
      return { _pagination: { totalPages: 2 }, data: [] };
    })
  ).rejects.toThrow("timeout");
});
