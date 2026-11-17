import { describe, expect, mock, test } from "bun:test";

mock.module("@/lib/auth", () => ({
  getRealUser: async () => ({ id: "u" }),
  getUser: async () => ({ id: "u" }),
}));

let failRead = false;
let settingRow: { mode: "master" | "owner" } | undefined;

mock.module("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            if (failRead) throw new Error('relation "x" does not exist');
            return settingRow ? [settingRow] : [];
          },
        }),
      }),
    }),
  },
}));

const { canReview, clientSiteStatus, getAdminMode, isUuid } = await import(
  "./delegation"
);

const date = (iso: string) => new Date(iso);

describe("clientSiteStatus", () => {
  test("no ar e sem mudanças depois da publicação", () => {
    expect(
      clientSiteStatus({
        publicationStatus: "published",
        publishedAt: date("2026-01-02"),
        updatedAt: date("2026-01-01"),
      })
    ).toBe("live");
  });

  test("no ar, mas editado depois de publicar = em edição", () => {
    expect(
      clientSiteStatus({
        publicationStatus: "published",
        publishedAt: date("2026-01-01"),
        updatedAt: date("2026-01-02"),
      })
    ).toBe("editing");
  });

  test("nunca publicado, suspenso e sem publicação = não publicado; falha = falhou", () => {
    const base = { publishedAt: null, updatedAt: date("2026-01-01") };
    expect(clientSiteStatus({ ...base, publicationStatus: null })).toBe(
      "draft"
    );
    expect(clientSiteStatus({ ...base, publicationStatus: "suspended" })).toBe(
      "draft"
    );
    expect(clientSiteStatus({ ...base, publicationStatus: "failed" })).toBe(
      "failed"
    );
  });
});

describe("isUuid", () => {
  test("aceita uuid e recusa o resto", () => {
    expect(isUuid("3d5f8bc8-1154-4436-a7ba-dc4fe29189f6")).toBe(true);
    expect(isUuid("[siteId]")).toBe(false);
    expect(isUuid("")).toBe(false);
  });
});

describe("getAdminMode", () => {
  test("sem linha, a validação é automática (padrão)", async () => {
    failRead = false;
    settingRow = undefined;
    expect(await getAdminMode("u1")).toBe("auto");
  });

  test("devolve o modo configurado pelo master", async () => {
    failRead = false;
    settingRow = { mode: "owner" };
    expect(await getAdminMode("u1")).toBe("owner");
    settingRow = { mode: "master" };
    expect(await getAdminMode("u1")).toBe("master");
  });

  test("se a leitura falha (tabela ausente), fecha: valida com o master", async () => {
    failRead = true;
    expect(await getAdminMode("u1")).toBe("master");
    failRead = false;
  });
});

describe("canReview", () => {
  const master = {
    email: "contatosimintermediacoes@gmail.com",
    id: "m1",
    isAdmin: true,
  };
  const owner = { email: "dono@exemplo.com", id: "o1", isAdmin: false };
  const admin = { email: "adm@exemplo.com", id: "a1", isAdmin: false };

  test("validação do dono: só o dono do site revisa", () => {
    expect(canReview(owner, { reviewer: "owner" }, "o1")).toBe(true);
    expect(canReview(admin, { reviewer: "owner" }, "o1")).toBe(false);
    expect(canReview(master, { reviewer: "owner" }, "o1")).toBe(false);
  });

  test("validação do Lucas: só o master revisa (nem o dono)", () => {
    expect(canReview(master, { reviewer: "master" }, "o1")).toBe(true);
    expect(canReview(owner, { reviewer: "master" }, "o1")).toBe(false);
    expect(canReview(admin, { reviewer: "master" }, "o1")).toBe(false);
  });
});
