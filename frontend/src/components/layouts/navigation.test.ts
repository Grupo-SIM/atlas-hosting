import { describe, expect, test } from "bun:test";
import { getClientNavigation } from "./navigation";

describe("getClientNavigation", () => {
  test("mostra o Criador de Sites ao usuário autorizado sem admin", () => {
    expect(
      getClientNavigation({ canAccessSiteBuilder: true, isAdmin: false }).some(
        item => item.href === "/criador-de-sites"
      )
    ).toBe(true);
  });

  test("oculta o Criador de Sites ao usuário não autorizado", () => {
    expect(
      getClientNavigation({ canAccessSiteBuilder: false, isAdmin: false }).some(
        item => item.href === "/criador-de-sites"
      )
    ).toBe(false);
  });
});
