import { expect, mock, test } from "bun:test";

const planLookups: unknown[] = [];
let invoice: Record<string, unknown> | undefined;

mock.module("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
}));
mock.module("@/app/actions", () => ({
  isBoletoEligibleForVpsConfig: async () => false,
  isPixEligibleForVpsConfig: async () => false,
}));
mock.module("@/lib/auth", () => ({ getOptionalUser: async () => null }));
mock.module("@/lib/db", () => ({
  db: {
    query: {
      pgInvoice: { findFirst: async () => invoice },
      // plans.id é uuid: procurar plano por "EXCL-…" derruba a página em produção.
      pgPlan: {
        findFirst: async (arg: unknown) => {
          planLookups.push(arg);
          throw new Error('invalid input syntax for type uuid: "EXCL-x"');
        },
      },
    },
  },
}));
mock.module("./checkout-client", () => ({ default: () => null }));

const { default: CheckoutPage } = await import("./page");

const render = (inv: Record<string, unknown>) => {
  invoice = inv;
  return CheckoutPage({
    params: Promise.resolve({ id: String(inv.id) }),
    searchParams: Promise.resolve({}),
  });
};

test("fatura de exclusividade não busca plano e mostra a descrição", async () => {
  planLookups.length = 0;
  const element = await render({
    description: "Exclusividade do template Portal — 12 meses",
    id: "inv-1",
    metadata: {
      templateExclusivity: {
        exclusivityId: "ex-1",
        kind: "purchase",
        templateId: "portal-noticias",
      },
    },
    reference: "EXCL-ex-1",
    status: "pending",
    type: "subscription",
  });
  expect(planLookups).toHaveLength(0);
  expect((element as { props: { reference: string } }).props.reference).toBe(
    "Exclusividade do template Portal — 12 meses"
  );
});

test("fatura de plano continua buscando o plano pela referência", async () => {
  planLookups.length = 0;
  await expect(
    render({
      description: "Plano",
      id: "inv-2",
      metadata: {},
      reference: "3b1f7c0e-0000-4000-8000-000000000000",
      status: "pending",
      type: "subscription",
    })
  ).rejects.toThrow("uuid");
  expect(planLookups).toHaveLength(1);
});
