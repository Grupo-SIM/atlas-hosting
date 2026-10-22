export type DisplayCurrency = "BRL" | "EUR" | "USD";

export const DISPLAY_CURRENCY_STORAGE_KEY = "atlas-display-currency";
export const DISPLAY_CURRENCY_CHANGE_EVENT = "atlas-display-currency-change";

export function readDisplayCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "BRL";
  const stored = window.localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY);
  return stored === "EUR" || stored === "USD" ? stored : "BRL";
}

export function saveDisplayCurrency(currency: DisplayCurrency) {
  window.localStorage.setItem(DISPLAY_CURRENCY_STORAGE_KEY, currency);
  window.dispatchEvent(new CustomEvent(DISPLAY_CURRENCY_CHANGE_EVENT));
}
