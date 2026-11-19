import { beforeEach, describe, expect, mock, test } from "bun:test";

const MASTER = {
  email: "contatosimintermediacoes@gmail.com",
  id: "master-1",
  isAdmin: true,
};
const OTHER_ADMIN = { email: "outro@exemplo.com", id: "adm-2", isAdmin: true };

let actor: typeof MASTER = MASTER;
const modeCalls: { mode: string; userId: string }[] = [];
let modeFails = false;

mock.module("next/cache", () => ({ revalidatePath: () => undefined }));
mock.module("@/lib/auth/index", () => ({
  getRealUser: async () => actor,
  getUser: async () => actor,
}));
mock.module("@/lib/auth/scrypt", () => ({ hash: async () => "hash" }));
mock.module("@/lib/auth/utils", () => ({
  generateAffiliateCode: () => "X",
  invalidateAllSessions: async () => undefined,
}));
mock.module("@/lib/permissions/access", () => ({
  hasAreaAccess: async () => true,
  levelFor: async () => "edit",
  levelsFor: async () => ({
    admin_overview: "edit",
    admin_templates: "edit",
    admin_users: "edit",
  }),
  loadTeamAccess: async () => null,
}));
// O usuário alvo está na equipe do ator (inScope) e a transação de gravação é um no-op.
mock.module("@/lib/db", () => {
  // `orgId`/`name`: a conta alvo foi criada pela equipe (organização "Fulano (equipe)").
  const row = { name: "Fulano (equipe)", orgId: "o1", parent: "master-1" };
  const rows = () =>
    Object.assign(Promise.resolve([row]), {
      limit: () => Promise.resolve([row]),
    });
  const tx = {
    delete: () => ({ where: () => Promise.resolve() }),
    insert: () => ({ values: () => Promise.resolve() }),
    select: () => ({ from: () => ({ where: rows }) }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  };
  return {
    db: {
      select: () => ({ from: () => ({ where: rows }) }),
      transaction: async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
    },
  };
});
mock.module("@/lib/site-builder/delegation", () => ({
  canReview: () => false,
  clientSiteStatus: () => "draft",
  getAdminMode: async () => "auto",
  getReview: async () => null,
  isUuid: () => true,
  listDelegatedAdmins: async () => [],
  masterUserId: async () => null,
  openRequestFor: async () => null,
  pendingForReviewer: async () => [],
  resolveSiteActor: async () => null,
  reviewChange: async () => ({ ok: true }),
  saveProposal: async () => ({ ok: true }),
  setAdminMode: async (userId: string, mode: string) => {
    if (modeFails)
      throw new Error('relation "builder_admin_validation" does not exist');
    modeCalls.push({ mode, userId });
  },
  submitForReview: async () => ({ ok: true }),
  VALIDATION_MODES: ["auto", "owner", "master"],
}));

const { updateTeamUserAction } = await import("./team-actions");

const input = (over: Record<string, unknown> = {}) => ({
  accessAll: null,
  email: "x@exemplo.com",
  name: "Fulano",
  password: "",
  permissions: [{ area: "admin_templates", level: "edit" }],
  profile: "editor",
  ...over,
});

beforeEach(() => {
  actor = MASTER;
  modeCalls.length = 0;
  modeFails = false;
});

describe("validação das alterações do admin (Equipe e acessos)", () => {
  test("o master define: validar com o cliente", async () => {
    const out = await updateTeamUserAction(
      "u-9",
      input({ validation: "owner" }) as never
    );
    expect(out.ok).toBe(true);
    expect(modeCalls).toEqual([{ mode: "owner", userId: "u-9" }]);
  });

  test("sem 'Editar templates' o modo volta ao padrão (automática)", async () => {
    const out = await updateTeamUserAction(
      "u-9",
      input({
        permissions: [{ area: "admin_overview", level: "view" }],
        validation: "master",
      }) as never
    );
    expect(out.ok).toBe(true);
    expect(modeCalls).toEqual([{ mode: "auto", userId: "u-9" }]);
  });

  test("sem o campo validation não mexe no que já está", async () => {
    expect((await updateTeamUserAction("u-9", input() as never)).ok).toBe(true);
    expect(modeCalls).toHaveLength(0);
  });

  test("quem não é o master não muda a validação", async () => {
    actor = OTHER_ADMIN as unknown as typeof MASTER;
    const out = await updateTeamUserAction(
      "u-9",
      input({
        permissions: [{ area: "admin_overview", level: "view" }],
        validation: "auto",
      }) as never
    );
    expect(out.ok).toBe(true);
    expect(modeCalls).toHaveLength(0);
  });

  test("valor inválido é recusado", async () => {
    const out = await updateTeamUserAction(
      "u-9",
      input({ validation: "qualquer" }) as never
    );
    expect(out.ok).toBe(false);
    expect(modeCalls).toHaveLength(0);
  });

  test("se a tabela não existe, avisa que os acessos foram salvos mas a validação não", async () => {
    modeFails = true;
    const out = await updateTeamUserAction(
      "u-9",
      input({ validation: "owner" }) as never
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("acessos foram salvos");
  });
});
