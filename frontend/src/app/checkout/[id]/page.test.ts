import { expect, mock, test } from "bun:test";

const planLookups: unknown[] = [];
let invoice: Record<string, unknown> | undefined;
/** Respostas seguintes de `findFirst` (ex.: o pedido-pai de uma fatura-filha). */
let nextLookups: (Record<string, unknown> | undefined)[] = [];
let children: Record<string, unknown>[] = [];

mock.module("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
mock.module("@/app/actions", () => ({
  isBoletoEligibleForVpsConfig: async () => true,
  isBoletoEnabledGlobally: async () => true,
  isPixEligibleForVpsConfig: async (config: { duration?: string }) =>
    config?.duration === "24",
}));
mock.module("@/lib/auth", () => ({ getOptionalUser: async () => null }));
mock.module("@/lib/db", () => ({
  db: {
    query: {
      pgInvoice: {
        findFirst: async () => {
          if (invoice) {
            const current = invoice;
            invoice = undefined;
            return current;
          }
          return nextLookups.shift();
        },
        findMany: async () => children,
      },
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

test("item de pedido do carrinho manda para o checkout do pedido", async () => {
  nextLookups = [{ id: "cart-1", status: "pending" }];
  await expect(
    render({
      id: "child-1",
      metadata: { cartInvoiceId: "cart-1", config: {} },
      reference: "VPS-10-1",
      status: "pending",
      type: "vps",
    })
  ).rejects.toThrow("redirect:/checkout/cart-1");
});

test("pedido do carrinho mostra os itens e só libera PIX se toda VPS aceitar", async () => {
  const cart = {
    description: "Pedido com 2 itens",
    id: "cart-2",
    metadata: {
      cart: {
        childInvoiceIds: ["d-1", "v-1"],
        items: [
          { amount: 50, invoiceId: "d-1", kind: "domain", label: "atlas.com" },
          {
            amount: 300,
            invoiceId: "v-1",
            kind: "vps",
            label: "Cloud VPS 10 (1 mês)",
          },
        ],
      },
    },
    orgId: "org-1",
    reference: "Carrinho: atlas.com · Cloud VPS 10 (1 mês)",
    status: "pending",
    type: "cart",
  };
  children = [
    {
      id: "d-1",
      metadata: { cartInvoiceId: "cart-2" },
      orgId: "org-1",
      type: "domain",
    },
    {
      id: "v-1",
      metadata: { cartInvoiceId: "cart-2", config: { duration: "1" } },
      orgId: "org-1",
      type: "vps",
    },
  ];
  const element = (await render(cart)) as {
    props: {
      allowBoleto: boolean;
      cartItems: unknown[];
      isAnnualVps: boolean;
      reference: string;
    };
  };
  expect(element.props.cartItems).toHaveLength(2);
  expect(element.props.reference).toBe("Pedido com 2 itens");
  // VPS mensal não aceita PIX neste mock: o pedido inteiro fica só no cartão/boleto.
  expect(element.props.isAnnualVps).toBe(false);
  expect(element.props.allowBoleto).toBe(true);
});
