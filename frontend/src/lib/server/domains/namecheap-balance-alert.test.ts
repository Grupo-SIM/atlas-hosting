import { describe, expect, test } from "bun:test";
import {
  NAMECHEAP_LOW_BALANCE_USD,
  shouldSendNamecheapBalanceAlert,
  validateNamecheapFundsForPayment,
} from "./namecheap-balance-alert";

describe("Namecheap low balance alert", () => {
  test("alerts only below USD 40", () => {
    expect(shouldSendNamecheapBalanceAlert(39.99)).toBe(true);
    expect(shouldSendNamecheapBalanceAlert(NAMECHEAP_LOW_BALANCE_USD)).toBe(
      false
    );
  });

  test("allows payment when available balance covers the quoted cost", async () => {
    const result = await validateNamecheapFundsForPayment(
      {
        metadata: { namecheapCostUsd: 45, years: "1" },
        type: "domain",
      } as any,
      {
        getBalances: async () => ({
          AccountBalance: 50,
          AvailableBalance: 50,
          Currency: "USD",
          EarnedAmount: 0,
          FundsRequiredForAutoRenew: 0,
          WithdrawableAmount: 0,
        }),
      }
    );

    expect(result).toEqual({ ok: true });
  });

  test("cart order: skips the check without domains and blocks when domains exceed the balance", async () => {
    let balanceReads = 0;
    const reader = {
      getBalances: async () => {
        balanceReads++;
        return {
          AccountBalance: 20,
          AvailableBalance: 20,
          Currency: "USD",
          EarnedAmount: 0,
          FundsRequiredForAutoRenew: 0,
          WithdrawableAmount: 0,
        };
      },
    };
    const onlyVps = await validateNamecheapFundsForPayment(
      {
        metadata: {
          cart: { childInvoiceIds: ["v"], items: [{ kind: "vps" }] },
        },
        type: "cart",
      } as any,
      reader
    );
    expect(onlyVps).toEqual({ ok: true });
    expect(balanceReads).toBe(0);

    const withDomains = await validateNamecheapFundsForPayment(
      {
        metadata: {
          cart: {
            childInvoiceIds: ["d", "v"],
            items: [{ kind: "domain" }, { kind: "vps" }],
          },
          namecheapCostUsd: 30,
        },
        type: "cart",
      } as any,
      reader,
      { notify: async () => {} }
    );
    expect(withDomains.ok).toBe(false);
  });

  test("blocks payment when available balance does not cover the cost", async () => {
    const notifications: Array<{
      availableBalance: number;
      requiredBalance: number;
    }> = [];
    const result = await validateNamecheapFundsForPayment(
      {
        metadata: { namecheapCostUsd: 55, years: "1" },
        type: "domain",
      } as any,
      {
        getBalances: async () => ({
          AccountBalance: 50,
          AvailableBalance: 50,
          Currency: "USD",
          EarnedAmount: 0,
          FundsRequiredForAutoRenew: 0,
          WithdrawableAmount: 0,
        }),
      },
      {
        notify: async (availableBalance, requiredBalance) => {
          notifications.push({ availableBalance, requiredBalance });
        },
      }
    );

    expect(result).toMatchObject({ ok: false, reason: "insufficient_balance" });
    expect(notifications).toEqual([
      { availableBalance: 50, requiredBalance: 55 },
    ]);
  });

  test("blocks payment when the balance query fails", async () => {
    const result = await validateNamecheapFundsForPayment(
      {
        metadata: { namecheapCostUsd: 10, years: "1" },
        type: "domain",
      } as any,
      {
        getBalances: async () => {
          throw new Error("timeout");
        },
      }
    );

    expect(result).toMatchObject({ ok: false, reason: "balance_unavailable" });
    if (!result.ok) {
      expect(result.message).toBe(
        "Não foi possível processar sua solicitação no momento. Nenhuma cobrança foi realizada. Tente novamente em instantes."
      );
    }
  });

  test("blocks legacy invoices without a USD registrar cost", async () => {
    const result = await validateNamecheapFundsForPayment(
      {
        metadata: { years: "1" },
        type: "domain",
      } as any,
      {
        getBalances: async () => {
          throw new Error("must not query");
        },
      }
    );

    expect(result).toMatchObject({ ok: false, reason: "cost_unavailable" });
  });
});
