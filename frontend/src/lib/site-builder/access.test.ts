import { describe, expect, test } from "bun:test";
import { canAccessSiteBuilder } from "./access";

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
