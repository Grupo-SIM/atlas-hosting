import { beforeEach, expect, mock, test } from "bun:test";

let realId = "owner";
let tokenizations = 0;
let revocations = 0;
let saved: any;
let selectedCard: any;
let linked: any;
let updates = 0;
const user = {
  email: "client@example.test",
  id: "owner",
  name: "Client",
  organization: {
    domId: "customer",
    id: "org",
    ownerId: "owner",
    wallet: { id: "wallet" },
  },
};
mock.module("@/lib/auth", () => ({
  getRealUser: async () => ({ id: realId }),
  getUser: async () => user,
}));
mock.module("@/auth", () => ({
  auth: async () => ({ user: { id: "owner" } }),
}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("@/lib/server/apis/dom", () => ({
  default: {
    createCardToken: async () => {
      tokenizations++;
      return {
        brand: "Visa",
        expiryMonth: "12",
        expiryYear: "2099",
        holderName: "Client",
        last4: "4242",
        token: "opaque-token",
      };
    },
    deleteCardToken: async () => {
      revocations++;
    },
  },
}));
const db: any = {
  insert: () => ({
    values: async (value: any) => {
      saved = value;
    },
  }),
  query: {
    pgUser: { findFirst: async () => user },
    pgUserCard: {
      findFirst: async () => selectedCard,
      findMany: async () => [],
    },
    pgVpsSubscription: { findFirst: async () => linked },
  },
  transaction: async (run: any) => run(db),
  update: () => ({
    set: () => ({
      where: async () => {
        updates++;
      },
    }),
  }),
};
mock.module("@/lib/db", () => ({ db }));
const { addCard, deleteCard, setDefaultCard } = await import("./actions");
const input = () => ({
  cardCvv: "123",
  cardExpiration: "12/99",
  cardNumber: "4111 1111 1111 1111",
  holderDocument: "529.982.247-25",
  holderName: "Client",
});
beforeEach(() => {
  realId = "owner";
  tokenizations = 0;
  revocations = 0;
  saved = null;
  selectedCard = null;
  linked = null;
  updates = 0;
});
test("only the real owner can tokenize a card", async () => {
  realId = "admin";
  expect((await addCard(input())).status).toBe("error");
  expect(tokenizations).toBe(0);
});
test("invalid and expired cards are rejected before calling supplier", async () => {
  expect((await addCard({ ...input(), cardExpiration: "01/20" })).status).toBe(
    "error"
  );
  expect((await addCard({ ...input(), cardCvv: "x" })).status).toBe("error");
  expect(tokenizations).toBe(0);
});
test("saves opaque token to the organization wallet without retaining PAN or CVV", async () => {
  expect((await addCard(input())).status).toBe("success");
  expect(saved.walletId).toBe("wallet");
  expect(saved.cardToken).toBe("opaque-token");
  expect(saved.cardNumber).toBeUndefined();
  expect(saved.cardCvv).toBeUndefined();
});
test("linked subscription blocks token revocation", async () => {
  selectedCard = { cardToken: "opaque-token", id: "card" };
  linked = { id: "sub" };
  expect((await deleteCard("card")).status).toBe("error");
  expect(revocations).toBe(0);
});
test("foreign default card cannot clear existing default", async () => {
  expect((await setDefaultCard("foreign-card")).status).toBe("error");
  expect(updates).toBe(0);
});
