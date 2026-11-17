import { describe, expect, mock, test } from "bun:test";

mock.module("@/lib/auth", () => ({
  getRealUser: async () => ({
    email: "cliente@exemplo.com",
    id: "u1",
    isAdmin: false,
  }),
  getUser: async () => ({ id: "u1" }),
}));
// Sem linha em user_access: o usuário não é de equipe e não recebe nenhuma área.
mock.module("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: async () => [] }) }),
    }),
  },
}));

const {
  getAdminValidation,
  listClientSites,
  searchClients,
  setAdminValidation,
} = await import("./client-actions");

describe("sites de clientes: quem não tem a permissão", () => {
  test("não pesquisa clientes", async () => {
    expect((await searchClients("a")).ok).toBe(false);
  });

  test("não lista os sites de um cliente", async () => {
    expect(
      (await listClientSites("3d5f8bc8-1154-4436-a7ba-dc4fe29189f6")).ok
    ).toBe(false);
  });

  test("não vê como os admins são validados", async () => {
    expect((await getAdminValidation()).ok).toBe(false);
  });

  test("não muda a validação de um admin (só o admin master)", async () => {
    expect(
      (
        await setAdminValidation(
          "3d5f8bc8-1154-4436-a7ba-dc4fe29189f6",
          "owner"
        )
      ).ok
    ).toBe(false);
  });
});
