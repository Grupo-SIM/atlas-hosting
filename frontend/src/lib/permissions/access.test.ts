import { describe, expect, mock, test } from "bun:test";

mock.module("next/navigation", () => ({ redirect: () => undefined }));
mock.module("@/lib/auth/index", () => ({
  getRealUser: async () => ({}),
  getUser: async () => ({}),
}));
mock.module("@/lib/db", () => ({ db: {} }));

const { hasAreaAccess, levelFor, levelsFor } = await import("./access");

const master = {
  email: "ContatoSimIntermediacoes@gmail.com",
  id: "u-master",
  isAdmin: true,
};
const otherAdmin = { email: "outro@exemplo.com", id: "u-admin", isAdmin: true };

describe("quem edita templates", () => {
  test("o admin master edita os templates", async () => {
    expect(await levelFor(master, "admin_templates")).toBe("edit");
    expect(await hasAreaAccess(master, "admin_templates", "edit")).toBe(true);
  });

  test("outro admin completo NÃO tem: só o master libera, pessoa por pessoa", async () => {
    expect(await levelFor(otherAdmin, "admin_templates")).toBe("none");
    expect(await hasAreaAccess(otherAdmin, "admin_templates", "view")).toBe(
      false
    );
    // mas as demais áreas de administração seguem com acesso total
    expect(await levelFor(otherAdmin, "admin_vps")).toBe("edit");
  });

  test("e-mail do master sem ser admin não vale", async () => {
    const notAdmin = { ...master, isAdmin: false };
    // sem as tabelas/consulta (db vazio), fica sem acesso
    expect(await levelFor(notAdmin, "admin_templates")).toBe("none");
  });

  test("os níveis do teto: master tem todas as áreas, outro admin não tem templates", async () => {
    const m = await levelsFor(master);
    expect(m.admin_templates).toBe("edit");
    expect(m.admin_users).toBe("edit");
    const o = await levelsFor(otherAdmin);
    expect(o.admin_templates).toBe("none");
    expect(o.admin_users).toBe("edit");
  });
});
