import { describe, expect, test } from "bun:test";
import type { User } from "@/lib/db/schema";
import {
  canAccessSiteBuilder,
  hasComplimentaryAtlasHosting,
  isMasterAdmin,
  pickBuilderUser,
} from "./access";

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

describe("isMasterAdmin", () => {
  test("só o admin com o e-mail do master, sem diferenciar maiúsculas", () => {
    expect(
      isMasterAdmin({
        email: " ContatoSimIntermediacoes@Gmail.com ",
        isAdmin: true,
      })
    ).toBe(true);
  });

  test("o e-mail sem ser admin não vale", () => {
    expect(
      isMasterAdmin({
        email: "contatosimintermediacoes@gmail.com",
        isAdmin: false,
      })
    ).toBe(false);
  });

  test("outros admins e a conta do Breno não são master", () => {
    expect(isMasterAdmin({ email: "admin@example.com", isAdmin: true })).toBe(
      false
    );
    expect(
      isMasterAdmin({ email: "brenohslima@gmail.com", isAdmin: true })
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

describe("quem usa o Criador de Sites (pickBuilderUser)", () => {
  const user = (id: string, over: Partial<User> = {}) =>
    ({ email: `${id}@x.com`, id, isAdmin: false, ...over }) as User;
  const admin = user("admin", { isAdmin: true });
  const client = user("cliente");
  const yes = async () => true;
  const no = async () => false;

  test("sem impersonação vale o usuário da sessão", async () => {
    expect((await pickBuilderUser(admin, admin, yes))?.id).toBe("admin");
    expect(await pickBuilderUser(client, client, no)).toBeNull();
  });

  test("admin dentro da conta de um cliente usa os sites do cliente, não os dele", async () => {
    expect((await pickBuilderUser(admin, client, yes))?.id).toBe("cliente");
  });

  test("dentro da conta de um cliente sem acesso ao Criador, não abre (nem com o admin tendo acesso)", async () => {
    const onlyAdmin = async (u: User) => u.id === "admin";
    expect(await pickBuilderUser(admin, client, onlyAdmin)).toBeNull();
  });
});
