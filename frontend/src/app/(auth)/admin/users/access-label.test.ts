import { describe, expect, test } from "bun:test";
import { accessLabel, summary } from "./access-label";

const row = (over: Record<string, unknown> = {}) =>
  ({
    accessAll: null,
    email: "e@x.com",
    existing: false,
    id: "u1",
    name: "Ana",
    parentName: null,
    permissions: [{ area: "admin_overview", level: "view" }],
    profile: "editor",
    suspended: false,
    validation: "auto",
    ...over,
  }) as never;

describe("acesso na tabela de usuários", () => {
  test("usuário de equipe mostra o perfil e o resumo", () => {
    expect(
      accessLabel(
        { email: "e", id: "u1", isAdmin: false, name: "Ana" },
        row(),
        false
      )
    ).toEqual({
      badge: "Editor",
      text: "1 área",
    });
  });

  test("administrador completo e cliente comum", () => {
    expect(
      accessLabel(
        { email: "l", id: "l", isAdmin: true, name: "Lucas" },
        undefined,
        true
      ).badge
    ).toBe("Administrador");
    expect(
      accessLabel(
        { email: "c", id: "c", isAdmin: false, name: "Cli" },
        undefined,
        true
      )
    ).toEqual({
      text: "Cliente (sem acesso de equipe)",
    });
  });

  test("o que só o master concede não aparece para os outros", () => {
    const r = row({
      permissions: [
        { area: "admin_overview", level: "view" },
        { area: "admin_users_existing", level: "edit" },
      ],
    });
    expect(summary(r, false)).toBe("1 área");
    expect(summary(r, true)).toBe("2 áreas");
  });
});
