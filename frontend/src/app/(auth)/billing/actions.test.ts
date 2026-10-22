import { beforeEach, expect, mock, test } from "bun:test";

let authenticated = true;
let profile: Record<string, string | null> | undefined;
let saved: unknown;
mock.module("@/lib/auth/index", () => ({
  getOptionalUser: async () => authenticated ? { id: "customer" } : null,
}));
mock.module("next/cache", () => ({ revalidatePath: mock() }));
mock.module("@/lib/db", () => ({
  db: {
    query: { pgUser: { findFirst: async () => profile } },
    update: () => ({ set: (data: unknown) => ({ where: async () => { saved = data; } }) }),
  },
}));
const { getUserBillingInfo, saveUserBillingInfo } = await import("./actions");
beforeEach(() => {
  authenticated = true;
  profile = { name: "  Maria   Silva  ", billingDocument: null, billingCity: "Recife" };
  saved = undefined;
});
test("preserves partial billing data and profile name without a document", async () => {
  expect(await getUserBillingInfo()).toEqual({
    firstName: "Maria", lastName: "Silva", document: "", phoneNumber: "",
    address: { city: "Recife", neighborhood: "", number: "", state: "", street: "", zipCode: "" },
  });
});
test("guests receive no profile and cannot save billing data", async () => {
  authenticated = false;
  expect(await getUserBillingInfo()).toBeNull();
  expect((await saveUserBillingInfo({ document: "", phoneNumber: "", address: { city: "", neighborhood: "", number: "", state: "", street: "", zipCode: "" } })).status).toBe("error");
  expect(saved).toBeUndefined();
});
test("saves normalized billing fields for the next checkout", async () => {
  const result = await saveUserBillingInfo({
    document: "123.456.789-00", phoneNumber: "(81) 99999-9999",
    address: { city: "Recife", neighborhood: "Boa Viagem", number: "123", state: "PE", street: "Rua dos Navegantes", zipCode: "51020-000" },
  });
  expect(result.status).toBe("success");
  expect(saved).toMatchObject({ billingDocument: "12345678900", billingPhone: "81999999999", billingNumber: "123", billingZipCode: "51020000" });
});
