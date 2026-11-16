import { describe, expect, test } from "bun:test";
import {
  areaForAdminPath,
  covers,
  GRANTABLE_AREAS,
  isGrantableArea,
  OUTSIDE_ALL_AREAS,
  resolveLevels,
} from "./catalog";

describe("catálogo de áreas", () => {
  test("área em breve não pode ser concedida", () => {
    expect(isGrantableArea("client_panel")).toBe(false);
    expect(isGrantableArea("admin_vouchers")).toBe(true);
    expect(isGrantableArea("inventada")).toBe(false);
  });

  test("rota → área: o prefixo mais longo vence", () => {
    expect(areaForAdminPath("/admin/vps-plans/payment-links")).toBe(
      "admin_vps_plans"
    );
    expect(areaForAdminPath("/admin/vps")).toBe("admin_vps");
    expect(areaForAdminPath("/admin/users")).toBe("admin_users");
    expect(areaForAdminPath("/admin")).toBe("admin_overview");
    expect(areaForAdminPath("/home")).toBeUndefined();
  });

  test("edita cobre visualiza, visualiza não cobre edita", () => {
    expect(covers("edit", "view")).toBe(true);
    expect(covers("view", "edit")).toBe(false);
    expect(covers("none", "view")).toBe(false);
  });
});

describe("resolveLevels", () => {
  test("sem nada marcado não tem acesso a nenhuma área", () => {
    const l = resolveLevels({
      accessAll: null,
      permissions: [],
      profile: "viewer",
    });
    expect(Object.values(l).every(v => v === "none")).toBe(true);
  });

  test("todas as áreas dá o nível a tudo, menos Usuários", () => {
    const l = resolveLevels({
      accessAll: "view",
      permissions: [],
      profile: "viewer",
    });
    expect(l.admin_vouchers).toBe("view");
    expect(l[OUTSIDE_ALL_AREAS]).toBe("none");
  });

  test("Usuários se libera à parte; área explícita vale sobre o nível geral", () => {
    const l = resolveLevels({
      accessAll: "edit",
      permissions: [
        { area: "admin_users", level: "view" },
        { area: "admin_vouchers", level: "view" },
      ],
      profile: "editor",
    });
    expect(l.admin_users).toBe("view");
    expect(l.admin_vouchers).toBe("view");
    expect(l.admin_vps).toBe("edit");
  });

  test("Administrador edita tudo, inclusive Usuários, e ignora permissões soltas", () => {
    const l = resolveLevels({
      accessAll: null,
      permissions: [{ area: "admin_vps", level: "view" }],
      profile: "admin",
    });
    expect(GRANTABLE_AREAS.every(a => l[a.key] === "edit")).toBe(true);
  });

  test("área inventada nas permissões é ignorada", () => {
    const l = resolveLevels({
      accessAll: null,
      permissions: [{ area: "inventada", level: "edit" }],
      profile: "editor",
    });
    expect("inventada" in l).toBe(false);
  });
});
