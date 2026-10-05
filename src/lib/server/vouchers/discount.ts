export function calculateVoucherDiscount(amount: number, type: "fixed" | "percentage", value: number) {
  if (!["fixed", "percentage"].includes(type) || !Number.isFinite(amount) || amount < 0 || !Number.isFinite(value) || value < 0 || (type === "percentage" && value > 100)) {
    throw new Error("Valor do voucher inválido.");
  }
  const originalCents = Math.round(amount * 100);
  if (!Number.isSafeInteger(originalCents) || (type === "fixed" && !Number.isSafeInteger(Math.round(value * 100)))) throw new Error("Valor fora do limite de centavos seguros.");
  const discountCents = Math.min(originalCents, type === "fixed" ? Math.round(value * 100) : Math.round(originalCents * value / 100));
  return { discountCents, finalAmount: (originalCents - discountCents) / 100 };
}
