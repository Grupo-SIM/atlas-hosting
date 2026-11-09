import { describe, expect, test } from "bun:test";
import { canAccessSiteBuilder, hasComplimentaryAtlasHosting } from "./access";

describe("canAccessSiteBuilder", () => {
  test("autoriza administradores", () => {
    expect(
      canAccessSiteBuilder({ email: "admin@example.com", isAdmin: true })
    ).toBe(true);
  });

  test("autoriza brenohslima@gmail.com sem diferenciar maiúsculas", () => {
    expect(
      canAccessSiteBuilder({
        email: "BrenoHSLima@Gmail.com",
        isAdmin: false,
      })
    ).toBe(true);
  });

  test("recusa usuários comuns", () => {
    expect(
      canAccessSiteBuilder({ email: "cliente@example.com", isAdmin: false })
    ).toBe(false);
  });
});

describe("hasComplimentaryAtlasHosting", () => {
  test("isenta admins e brenohslima@gmail.com", () => {
    expect(
      hasComplimentaryAtlasHosting({
        email: "admin@example.com",
        isAdmin: true,
      })
    ).toBe(true);
    expect(
      hasComplimentaryAtlasHosting({
        email: "BrenoHSLima@Gmail.com",
        isAdmin: false,
      })
    ).toBe(true);
  });

  test("mantém a cobrança para outros usuários", () => {
    expect(
      hasComplimentaryAtlasHosting({
        email: "cliente@example.com",
        isAdmin: false,
      })
    ).toBe(false);
  });
});
