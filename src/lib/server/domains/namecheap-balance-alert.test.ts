import { describe, expect, test } from "bun:test";
import {
  NAMECHEAP_LOW_BALANCE_USD,
  shouldSendNamecheapBalanceAlert,
  validateNamecheapFundsForPayment,
} from "./namecheap-balance-alert";

const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;

describe("Namecheap low balance alert", () => {
  test("alerts only below USD 40", () => {
    expect(shouldSendNamecheapBalanceAlert(39.99, 0, TWENTY_HOURS_MS)).toBe(
      true
    );
    expect(
      shouldSendNamecheapBalanceAlert(
        NAMECHEAP_LOW_BALANCE_USD,
        0,
        TWENTY_HOURS_MS
      )
    ).toBe(false);
  });

  test("suppresses another alert during the cooldown", () => {
    const previousAlertAt = 1_000;
    expect(
      shouldSendNamecheapBalanceAlert(
        10,
        previousAlertAt,
        previousAlertAt + TWENTY_HOURS_MS - 1
      )
    ).toBe(false);
    expect(
      shouldSendNamecheapBalanceAlert(
        10,
        previousAlertAt,
        previousAlertAt + TWENTY_HOURS_MS
      )
    ).toBe(true);
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
