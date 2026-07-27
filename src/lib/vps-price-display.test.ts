import { describe, expect, test } from "bun:test";
import { convertVpsPriceFromEuro } from "./vps-price-display";

describe("VPS price display conversion", () => {
  const rates = { eurToBrl: 6.25, eurToUsd: 1.08 };

  test("keeps euro prices unchanged", () => {
    expect(convertVpsPriceFromEuro(8.8, "EUR", rates)).toBe(8.8);
  });

  test("converts euro prices to reais and dollars", () => {
    expect(convertVpsPriceFromEuro(8.8, "BRL", rates)).toBe(55);
    expect(convertVpsPriceFromEuro(8.8, "USD", rates)).toBe(9.5);
  });
});
