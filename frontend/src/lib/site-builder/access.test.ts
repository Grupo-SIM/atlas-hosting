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

function withFreeFlag(value: string | undefined, fn: () => void) {
  const original = process.env.SITE_BUILDER_HOSTING_FREE;
  if (value === undefined) {
    delete process.env.SITE_BUILDER_HOSTING_FREE;
  } else {
    process.env.SITE_BUILDER_HOSTING_FREE = value;
  }
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env.SITE_BUILDER_HOSTING_FREE;
    } else {
      process.env.SITE_BUILDER_HOSTING_FREE = original;
    }
  }
}

describe("hasComplimentaryAtlasHosting", () => {
  test("cobra todos (inclusive admin) sem a flag", () => {
    withFreeFlag(undefined, () => {
      expect(hasComplimentaryAtlasHosting()).toBe(false);
    });
  });

  test("cobra todos com SITE_BUILDER_HOSTING_FREE=false", () => {
    withFreeFlag("false", () => {
      expect(hasComplimentaryAtlasHosting()).toBe(false);
    });
  });

  test("SITE_BUILDER_HOSTING_FREE=true isenta todo mundo", () => {
    withFreeFlag(" TRUE ", () => {
      expect(hasComplimentaryAtlasHosting()).toBe(true);
    });
  });
});
