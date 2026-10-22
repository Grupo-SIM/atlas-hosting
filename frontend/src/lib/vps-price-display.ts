export type VpsDisplayCurrency = "BRL" | "EUR" | "USD";

export interface VpsCurrencyRates {
  eurToBrl: number;
  eurToUsd: number;
}

export function convertVpsPriceFromEuro(
  euroAmount: number,
  currency: VpsDisplayCurrency,
  rates: VpsCurrencyRates
) {
  if (currency === "BRL")
    return Math.round(euroAmount * rates.eurToBrl * 100) / 100;
  if (currency === "USD")
    return Math.round(euroAmount * rates.eurToUsd * 100) / 100;
  return euroAmount;
}
