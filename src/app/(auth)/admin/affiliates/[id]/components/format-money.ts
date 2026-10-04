export function toBrl(value: number) {
  return value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
}
