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

  test("conta com acesso de equipe só vê as áreas do cliente que foram liberadas", () => {
    const hrefs = (clientAreas: string[] | null) =>
      getClientNavigation({
        canAccessSiteBuilder: false,
        clientAreas,
        isAdmin: false,
      }).map(i => i.href);
    // sem nada liberado sobra só o Painel
    expect(hrefs([])).toEqual(["/home"]);
    expect(hrefs(["client_domains"])).toEqual(["/home", "/domains"]);
    expect(hrefs(["client_billing"])).toEqual([
      "/home",
      "/billing",
      "/carteira",
    ]);
    // cliente comum (sem restrição) vê tudo, como antes
    expect(hrefs(null)).toContain("/manage/vps");
    expect(hrefs(null)).toContain("/vouchers");
  });

  test("o Criador de Sites segue a própria regra, não as áreas do cliente", () => {
    const hasBuilder = getClientNavigation({
      canAccessSiteBuilder: true,
      clientAreas: [],
      isAdmin: false,
    }).some(i => i.href === "/criador-de-sites");
    expect(hasBuilder).toBe(true);
  });
});
