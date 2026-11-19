import { describe, expect, test } from "bun:test";
import {
  cartAllowsBoleto,
  cartAllowsPix,
  cartHasDomains,
  cartParentIdOf,
  splitCartDiscount,
} from "./invoice";

const child = (
  id: string,
  amount: number,
  originalAmount: number | null = null
) => ({
  amount,
  id,
  originalAmount,
});

describe("splitCartDiscount", () => {
  test("sem desconto não mexe nas filhas", () => {
    expect(splitCartDiscount(150, [child("a", 50), child("b", 100)]).size).toBe(
      0
    );
  });

  test("reparte o desconto na proporção e fecha a soma exata", () => {
    const split = splitCartDiscount(100, [
      child("a", 33.33),
      child("b", 33.33),
      child("c", 83.34),
    ]);
    const values = ["a", "b", "c"].map(id => split.get(id)!);
    expect(values.reduce((s, v) => s + v, 0)).toBeCloseTo(100, 2);
    expect(values[0]).toBeCloseTo(22.22, 2);
    expect(values[2]).toBeGreaterThan(values[0]);
  });

  test("voucher integral zera todas as filhas", () => {
    const split = splitCartDiscount(0, [child("a", 40), child("b", 60)]);
    expect(split.get("a")).toBe(0);
    expect(split.get("b")).toBe(0);
  });

  test("não reparte duas vezes (retentativa da entrega)", () => {
    expect(
      splitCartDiscount(50, [child("a", 25, 50), child("b", 25, 50)]).size
    ).toBe(0);
  });
});

describe("cartParentIdOf", () => {
  test("filha aponta para o pedido", () => {
    expect(
      cartParentIdOf({
        metadata: { cartInvoiceId: "cart-1" } as never,
        type: "vps",
      })
    ).toBe("cart-1");
  });

  test("o próprio pedido e faturas soltas não têm pai", () => {
    expect(
      cartParentIdOf({
        metadata: { cartInvoiceId: "x" } as never,
        type: "cart",
      })
    ).toBeNull();
    expect(
      cartParentIdOf({ metadata: {} as never, type: "domain" })
    ).toBeNull();
  });
});

describe("regras de pagamento do pedido", () => {
  const vps = (duration: string) =>
    ({ metadata: { config: { duration } }, type: "vps" }) as never;
  const domain = { metadata: {}, type: "domain" } as never;
  const pixOnlyFor24 = async (config: unknown) =>
    (config as { duration?: string }).duration === "24";

  test("PIX só quando toda VPS aceita PIX", async () => {
    expect(await cartAllowsPix([domain, vps("24")], pixOnlyFor24)).toBe(true);
    expect(await cartAllowsPix([domain, vps("1")], pixOnlyFor24)).toBe(false);
    expect(await cartAllowsPix([domain], pixOnlyFor24)).toBe(true);
  });

  test("boleto com domínio depende da chave global", async () => {
    const yes = async () => true;
    const no = async () => false;
    expect(await cartAllowsBoleto([domain], yes, no)).toBe(false);
    expect(await cartAllowsBoleto([domain, vps("1")], yes, yes)).toBe(true);
    expect(await cartAllowsBoleto([vps("1")], no, yes)).toBe(false);
  });

  test("cartHasDomains lê os itens do pedido", () => {
    expect(
      cartHasDomains({
        metadata: {
          cart: { childInvoiceIds: ["a"], items: [{ kind: "domain" }] },
        } as never,
        type: "cart",
      })
    ).toBe(true);
    expect(
      cartHasDomains({
        metadata: {
          cart: { childInvoiceIds: ["a"], items: [{ kind: "vps" }] },
        } as never,
        type: "cart",
      })
    ).toBe(false);
  });
});
