import { beforeEach, describe, expect, mock, test } from "bun:test";
import { getTemplate } from "@repo/site-builder";

type Actor = {
  delegated: boolean;
  owner: { id: string; organizationId: string | null };
  site: { exclusivityBlockedAt: Date | null };
} | null;

let actor: Actor = null;
let mode: "auto" | "master" | "owner" = "auto";
const proposals: {
  content: unknown;
  reviewer: string;
  siteId: string;
  userId: string;
}[] = [];
const updates: Record<string, unknown>[] = [];
const wheres: unknown[] = [];
const published: { owner: string }[] = [];

mock.module("next/cache", () => ({ revalidatePath: () => undefined }));
// Os mocks de módulo vazam entre arquivos de teste: mantém todos os exports que os outros testes importam.
mock.module("@/lib/site-builder/access", () => ({
  canUseWordpressTemplates: async () => false,
  FORBIDDEN_MESSAGE: "Recurso disponível apenas para usuários autorizados.",
  getBuilderUser: async () => ({ id: "admin-1", organization: null }),
  getTemplateEditor: async () => null,
  hasComplimentaryAtlasHosting: () => false,
  requireBuilderUser: async () => ({ id: "admin-1" }),
  requireTemplateEditor: async () => ({ id: "admin-1" }),
}));
mock.module("@/lib/site-builder/delegation", () => ({
  // Os mocks de módulo vazam entre arquivos de teste: lista todos os exports.
  canReview: () => false,
  clientSiteStatus: () => "draft",
  getAdminMode: async () => mode,
  getReview: async () => null,
  isUuid: () => true,
  listDelegatedAdmins: async () => [],
  masterUserId: async () => null,
  openRequestFor: async () => null,
  pendingForReviewer: async () => [],
  resolveSiteActor: async () => actor,
  reviewChange: async () => ({ ok: true }),
  saveProposal: async (
    siteId: string,
    userId: string,
    content: unknown,
    reviewer: string
  ) => {
    proposals.push({ content, reviewer, siteId, userId });
    return { ok: true };
  },
  setAdminMode: async () => undefined,
  submitForReview: async () => ({ ok: true }),
  VALIDATION_MODES: ["auto", "owner", "master"],
}));
mock.module("@/lib/site-builder/runPublish", () => ({
  currentPublication: async () => undefined,
  LABEL_RE: /^[a-z0-9](?:[a-z0-9-]{0,40}[a-z0-9])?$/,
  ownedSite: async () => undefined,
  runPublish: async (user: { id: string }) => {
    published.push({ owner: user.id });
    return { domain: "x.com", ok: true };
  },
  savePublication: async () => undefined,
}));
mock.module("@/lib/db", () => ({
  db: {
    update: () => ({
      set: (v: Record<string, unknown>) => {
        updates.push(v);
        return {
          where: (w: unknown) => {
            wheres.push(w);
            return { returning: async () => [{ id: "s1" }] };
          },
        };
      },
    }),
  },
}));

const { saveSite } = await import("./actions");
const { publishSite } = await import("./publish-actions");

const content = () => getTemplate("margem")?.site;
const owner = { id: "owner-1", organizationId: "org-1" };

beforeEach(() => {
  actor = null;
  mode = "auto";
  proposals.length = 0;
  updates.length = 0;
  wheres.length = 0;
  published.length = 0;
});

describe("saveSite em site de cliente", () => {
  const delegated = () => ({
    delegated: true,
    owner,
    site: { exclusivityBlockedAt: null },
  });

  test("quem não é dono nem admin liberado não salva", async () => {
    const result = await saveSite("s1", content());
    expect(result.ok).toBe(false);
    expect(updates).toHaveLength(0);
    expect(proposals).toHaveLength(0);
  });

  test("o dono salva direto, qualquer que seja o modo (o modo é do admin)", async () => {
    actor = { delegated: false, owner, site: { exclusivityBlockedAt: null } };
    mode = "owner";
    expect((await saveSite("s1", content())).ok).toBe(true);
    expect(updates).toHaveLength(1);
    expect(proposals).toHaveLength(0);
  });

  test("admin com validação automática (padrão): salva direto no site do cliente", async () => {
    actor = delegated();
    expect((await saveSite("s1", content())).ok).toBe(true);
    expect(updates).toHaveLength(1);
    expect(proposals).toHaveLength(0);
  });

  test("admin validado pelo cliente: vira proposta para o dono e o site não muda", async () => {
    actor = delegated();
    mode = "owner";
    expect((await saveSite("s1", content())).ok).toBe(true);
    expect(updates).toHaveLength(0);
    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.reviewer).toBe("owner");
    expect(proposals[0]?.userId).toBe("admin-1");
  });

  test("admin validado pelo Lucas: vira proposta para o master", async () => {
    actor = delegated();
    mode = "master";
    expect((await saveSite("s1", content())).ok).toBe(true);
    expect(updates).toHaveLength(0);
    expect(proposals[0]?.reviewer).toBe("master");
  });

  test("site bloqueado pela exclusividade não salva nem propõe", async () => {
    actor = {
      delegated: true,
      owner,
      site: { exclusivityBlockedAt: new Date() },
    };
    mode = "owner";
    expect((await saveSite("s1", content())).ok).toBe(false);
    expect(updates).toHaveLength(0);
    expect(proposals).toHaveLength(0);
  });
});

describe("publishSite em site de cliente", () => {
  const input = {
    domain: "x.com",
    kind: "domain" as const,
    siteId: "s1",
    target: "user_vps" as const,
  };

  test("admin com validação automática publica como o dono", async () => {
    actor = { delegated: true, owner, site: { exclusivityBlockedAt: null } };
    expect((await publishSite(input)).ok).toBe(true);
    expect(published).toEqual([{ owner: "owner-1" }]);
  });

  test("admin com validação (cliente ou Lucas) não publica", async () => {
    actor = { delegated: true, owner, site: { exclusivityBlockedAt: null } };
    for (const m of ["owner", "master"] as const) {
      mode = m;
      expect((await publishSite(input)).ok).toBe(false);
    }
    expect(published).toHaveLength(0);
  });
});
