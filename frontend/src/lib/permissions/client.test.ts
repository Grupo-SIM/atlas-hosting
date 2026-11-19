import { describe, expect, test } from "bun:test";
import { ADMIN_AREA_KEYS, GRANTABLE_AREAS, isClientArea } from "./catalog";
import { clientAreasOf } from "./client";

describe("áreas do painel do cliente", () => {
  test("cliente comum (sem acesso de equipe) não tem restrição", () => {
    expect(clientAreasOf(null)).toBeNull();
  });

  test("conta de equipe sem nada marcado fica sem nenhuma área do cliente", () => {
    expect(clientAreasOf({ levels: {} })?.size).toBe(0);
    expect(
      clientAreasOf({ levels: { admin_overview: "edit", admin_users: "view" } })
        ?.size
    ).toBe(0);
  });

  test("só entram as áreas do cliente que estão liberadas", () => {
    const areas = clientAreasOf({
      levels: {
        admin_overview: "edit",
        client_domains: "view",
        client_email: "none",
        client_site_builder: "edit",
      },
    });
    expect([...(areas ?? [])].sort()).toEqual([
      "client_domains",
      "client_site_builder",
    ]);
  });

  test("as áreas do cliente são concedíveis, só ligam ou desligam e não abrem o painel /admin", () => {
    const client = GRANTABLE_AREAS.filter(a => isClientArea(a.key));
    expect(client.map(a => a.key)).toContain("client_site_builder");
    expect(client.every(a => a.binary)).toBe(true);
    for (const a of client) expect(ADMIN_AREA_KEYS).not.toContain(a.key);
  });
});
