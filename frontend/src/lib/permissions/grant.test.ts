import { describe, expect, test } from "bun:test";
import { GRANTABLE_AREAS, type Level } from "./catalog";
import { normalizeGrant } from "./grant";

const full: Record<string, Level> = Object.fromEntries(
  GRANTABLE_AREAS.map(a => [a.key, "edit" as Level])
);
const limited: Record<string, Level> = {
  ...Object.fromEntries(GRANTABLE_AREAS.map(a => [a.key, "none" as Level])),
  admin_users: "edit",
  admin_vouchers: "edit",
  admin_vps: "view",
};

const run = (
  input: {
    accessAll?: "edit" | "view" | null;
    permissions?: { area: string; level: string }[];
    profile: string;
  },
  actor = full
) =>
  normalizeGrant(
    {
      accessAll: input.accessAll ?? null,
      permissions: input.permissions ?? [],
      profile: input.profile,
    },
    actor
  );

describe("normalizeGrant", () => {
  test("perfil inválido é recusado", () => {
    expect(run({ profile: "root" }).ok).toBe(false);
  });

  test("não concede mais do que tem", () => {
    const r = run(
      {
        permissions: [{ area: "admin_vps", level: "edit" }],
        profile: "editor",
      },
      limited
    );
    expect(r.ok).toBe(false);
    const ok = run(
      {
        permissions: [{ area: "admin_vps", level: "view" }],
        profile: "editor",
      },
      limited
    );
    expect(ok.ok).toBe(true);
  });

  test("não concede área em que não tem acesso", () => {
    expect(
      run(
        {
          permissions: [{ area: "admin_plans", level: "view" }],
          profile: "viewer",
        },
        limited
      ).ok
    ).toBe(false);
  });

  test("visualizador sempre fica em view, mesmo se pedir edit", () => {
    const r = run({
      permissions: [{ area: "admin_vouchers", level: "edit" }],
      profile: "viewer",
    });
    expect(r.ok && r.value.permissions[0]?.level).toBe("view");
  });

  test("área inexistente ou em breve é recusada", () => {
    expect(
      run({
        permissions: [{ area: "client_panel", level: "view" }],
        profile: "editor",
      }).ok
    ).toBe(false);
    expect(
      run({
        permissions: [{ area: "inventada", level: "view" }],
        profile: "editor",
      }).ok
    ).toBe(false);
  });

  test("sem área nenhuma é recusado", () => {
    expect(run({ profile: "editor" }).ok).toBe(false);
  });

  test("todas as áreas exige ter o nível em todas (menos Usuários)", () => {
    expect(run({ accessAll: "edit", profile: "editor" }, limited).ok).toBe(
      false
    );
    const r = run({ accessAll: "edit", profile: "editor" });
    expect(r.ok && r.value.accessAll).toBe("edit");
  });

  test("administrador só por quem edita tudo", () => {
    expect(run({ profile: "admin" }, limited).ok).toBe(false);
    const r = run({ profile: "admin" });
    expect(r.ok && r.value.profile).toBe("admin");
  });

  test("área repetida vale a última e não duplica", () => {
    const r = run({
      permissions: [
        { area: "admin_vps", level: "view" },
        { area: "admin_vps", level: "edit" },
      ],
      profile: "editor",
    });
    expect(r.ok && r.value.permissions).toEqual([
      { area: "admin_vps", level: "edit" },
    ]);
  });
});
