import { beforeEach, describe, expect, mock, test } from "bun:test";

const MASTER = {
  email: "contatosimintermediacoes@gmail.com",
  id: "master-1",
  isAdmin: true,
};
const TEAM_ADMIN = { email: "adm@exemplo.com", id: "adm-2", isAdmin: false };

let actor: { email: string; id: string; isAdmin: boolean } = MASTER;
let levels: Record<string, string> = {};
/** O que cada consulta devolve, na ordem em que o código consulta. */
let queue: unknown[][] = [];
const writes: { op: string; values?: unknown }[] = [];

mock.module("next/cache", () => ({ revalidatePath: () => undefined }));
mock.module("@/lib/auth/index", () => ({
  getRealUser: async () => actor,
  getUser: async () => actor,
}));
mock.module("@/lib/auth/scrypt", () => ({ hash: async () => "hash" }));
mock.module("@/lib/auth/utils", () => ({
  generateAffiliateCode: () => "X",
  invalidateAllSessions: async () => {
    writes.push({ op: "sessions" });
  },
}));
mock.module("@/lib/permissions/access", () => ({
  hasAreaAccess: async () => true,
  levelFor: async () => "edit",
  levelsFor: async () => levels,
  loadTeamAccess: async () => null,
}));
mock.module("@/lib/db", () => {
  const next = () => queue.shift() ?? [];
  const chain = (): unknown => {
    const q: Record<string, unknown> = {};
    for (const k of ["from", "where", "orderBy", "innerJoin", "limit"])
      q[k] = () => chain();
    q.then = (res: (v: unknown) => unknown) =>
      Promise.resolve(next()).then(res);
    return q;
  };
  const tx = {
    delete: () => ({
      where: () => {
        writes.push({ op: "delete" });
        return Promise.resolve();
      },
    }),
    insert: () => ({
      values: (v: unknown) => {
        writes.push({ op: "insert", values: v });
        return Promise.resolve();
      },
    }),
    update: () => ({
      set: (v: unknown) => ({
        where: () => {
          writes.push({ op: "update", values: v });
          return Promise.resolve();
        },
      }),
    }),
  };
  return {
    db: {
      select: () => chain(),
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
  setAdminMode: async () => undefined,
  submitForReview: async () => ({ ok: true }),
  VALIDATION_MODES: ["auto", "owner", "master"],
}));

const {
  grantExistingUserAction,
  removeTeamUserAction,
  searchExistingUsersAction,
} = await import("./team-actions");

const grant = (over: Record<string, unknown> = {}) => ({
  accessAll: null,
  permissions: [{ area: "admin_overview", level: "view" }],
  profile: "viewer",
  ...over,
});

beforeEach(() => {
  actor = MASTER;
  levels = {
    admin_overview: "edit",
    admin_users: "edit",
    admin_users_existing: "edit",
  };
  queue = [];
  writes.length = 0;
});

describe("dar acesso a usuários já cadastrados", () => {
  test("o master procura contas que já existem", async () => {
    queue = [[{ email: "a@x.com", id: "u1", name: "Ana" }]];
    const out = await searchExistingUsersAction("ana");
    expect(out.ok).toBe(true);
    if (out.ok)
      expect(out.users).toEqual([{ email: "a@x.com", id: "u1", name: "Ana" }]);
  });

  test("busca curta demais é recusada", async () => {
    expect((await searchExistingUsersAction("a")).ok).toBe(false);
  });

  test("admin de equipe sem a permissão não procura nem concede", async () => {
    actor = TEAM_ADMIN;
    levels = { admin_users: "edit" };
    expect((await searchExistingUsersAction("ana")).ok).toBe(false);
    const out = await grantExistingUserAction("u1", grant() as never);
    expect(out.ok).toBe(false);
    expect(writes).toHaveLength(0);
  });

  test("admin de equipe a quem o master liberou consegue", async () => {
    actor = TEAM_ADMIN;
    levels = {
      admin_overview: "edit",
      admin_users: "edit",
      admin_users_existing: "edit",
    };
    queue = [
      [{ deletedAt: null, id: "u1", isAdmin: false, suspendedAt: null }],
      [],
    ];
    const out = await grantExistingUserAction("u1", grant() as never);
    expect(out.ok).toBe(true);
    const access = writes.find(w => w.op === "insert");
    expect(access?.values).toMatchObject({
      parentUserId: "adm-2",
      profile: "viewer",
      userId: "u1",
    });
  });

  test("concede ao existente sem criar conta nem mexer em senha", async () => {
    queue = [
      [{ deletedAt: null, id: "u1", isAdmin: false, suspendedAt: null }],
      [],
    ];
    const out = await grantExistingUserAction("u1", grant() as never);
    expect(out.ok).toBe(true);
    expect(writes.filter(w => w.op === "insert")).toHaveLength(2); // acesso + permissões
    expect(writes.some(w => w.op === "update")).toBe(false);
  });

  test("não concede a administrador completo, a quem já é da equipe nem a conta suspensa", async () => {
    queue = [[{ deletedAt: null, id: "u1", isAdmin: true, suspendedAt: null }]];
    expect((await grantExistingUserAction("u1", grant() as never)).ok).toBe(
      false
    );
    queue = [
      [{ deletedAt: null, id: "u1", isAdmin: false, suspendedAt: null }],
      [{ id: "u1" }],
    ];
    expect((await grantExistingUserAction("u1", grant() as never)).ok).toBe(
      false
    );
    queue = [
      [{ deletedAt: null, id: "u1", isAdmin: false, suspendedAt: new Date() }],
    ];
    expect((await grantExistingUserAction("u1", grant() as never)).ok).toBe(
      false
    );
    expect(writes).toHaveLength(0);
  });

  test("ninguém concede mais do que tem", async () => {
    actor = TEAM_ADMIN;
    levels = {
      admin_overview: "view",
      admin_users: "edit",
      admin_users_existing: "edit",
    };
    const out = await grantExistingUserAction(
      "u1",
      grant({
        permissions: [{ area: "admin_overview", level: "edit" }],
        profile: "editor",
      }) as never
    );
    expect(out.ok).toBe(false);
  });

  test("só o master libera 'Usuários já cadastrados' a outro admin", async () => {
    actor = TEAM_ADMIN;
    levels = {
      admin_overview: "edit",
      admin_users: "edit",
      admin_users_existing: "edit",
    };
    const out = await grantExistingUserAction(
      "u1",
      grant({
        permissions: [{ area: "admin_users_existing", level: "edit" }],
        profile: "editor",
      }) as never
    );
    expect(out.ok).toBe(false);
  });

  test("retirar o acesso de conta existente só tira as permissões: não suspende nem derruba sessão", async () => {
    // inScope: [{parent: master}] ; createdByTeam: usuário sem organização → conta existente
    queue = [[{ parent: "master-1" }], [{ orgId: null }]];
    const out = await removeTeamUserAction("u1");
    expect(out.ok).toBe(true);
    expect(writes.filter(w => w.op === "delete")).toHaveLength(2);
    expect(writes.some(w => w.op === "update")).toBe(false);
    expect(writes.some(w => w.op === "sessions")).toBe(false);
  });
});
