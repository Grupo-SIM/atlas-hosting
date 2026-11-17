import { beforeEach, describe, expect, mock, test } from "bun:test";

type Review = {
  request: { id: string; requestedBy: string; reviewer: "master" | "owner" };
  role: "requester" | "reviewer";
  site: { id: string; name: string; userId: string };
} | null;

let review: Review = null;
let result: { ok: true; request: object } | { error: string; ok: false } = {
  ok: true,
  request: {},
};
let user = { email: "dono@exemplo.com", id: "owner-1", isAdmin: false };
const reviews: { action: string; body: string }[] = [];
const notified: { to: string; kind: string }[] = [];

mock.module("next/cache", () => ({ revalidatePath: () => undefined }));
mock.module("@/lib/notifications/inbox", () => ({
  notifyUser: async (to: string, input: { kind: string }) => {
    notified.push({ kind: input.kind, to });
  },
}));
// Os mocks de módulo vazam entre arquivos de teste: mantém todos os exports que os outros testes importam.
mock.module("@/lib/site-builder/access", () => ({
  canUseWordpressTemplates: async () => false,
  FORBIDDEN_MESSAGE: "negado",
  getBuilderUser: async () => user,
  getTemplateEditor: async () => null,
  hasComplimentaryAtlasHosting: () => false,
  requireBuilderUser: async () => user,
  requireTemplateEditor: async () => user,
}));
mock.module("@/lib/site-builder/delegation", () => ({
  canReview: () => false,
  clientSiteStatus: () => "draft",
  getAdminMode: async () => "owner",
  getReview: async () => review,
  isUuid: () => true,
  listDelegatedAdmins: async () => [],
  masterUserId: async () => "master-1",
  openRequestFor: async () => null,
  pendingForReviewer: async () => [],
  resolveSiteActor: async () => null,
  reviewChange: async (
    _id: string,
    _u: unknown,
    action: string,
    body: string
  ) => {
    reviews.push({ action, body });
    return result;
  },
  saveProposal: async () => ({ ok: true }),
  setAdminMode: async () => undefined,
  submitForReview: async () => ({ ok: true }),
  VALIDATION_MODES: ["auto", "owner", "master"],
}));

const { reviewSiteChange } = await import("./approval-actions");

const base = (
  reviewer: "master" | "owner",
  role: "requester" | "reviewer"
) => ({
  request: { id: "r1", requestedBy: "admin-1", reviewer },
  role,
  site: { id: "s1", name: "Site X", userId: "owner-1" },
});

beforeEach(() => {
  review = null;
  result = { ok: true, request: {} };
  user = { email: "dono@exemplo.com", id: "owner-1", isAdmin: false };
  reviews.length = 0;
  notified.length = 0;
});

describe("reviewSiteChange", () => {
  test("recusa uma ação desconhecida sem chamar a revisão", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: ação inválida de propósito
    const out = await reviewSiteChange("r1", "delete" as any, "x");
    expect(out.ok).toBe(false);
    expect(reviews).toHaveLength(0);
  });

  test("o revisor aprova: o admin autor é avisado", async () => {
    review = base("owner", "reviewer");
    expect((await reviewSiteChange("r1", "approve", "ok")).ok).toBe(true);
    expect(notified).toEqual([{ kind: "site_change_approved", to: "admin-1" }]);
  });

  test("o revisor pede ajustes: o admin autor é avisado", async () => {
    review = base("owner", "reviewer");
    await reviewSiteChange("r1", "request_changes", "troque a cor");
    expect(notified).toEqual([
      { kind: "site_change_requested", to: "admin-1" },
    ]);
  });

  test("o admin autor comenta: o dono (revisor) é avisado", async () => {
    user = { email: "adm@exemplo.com", id: "admin-1", isAdmin: false };
    review = base("owner", "requester");
    await reviewSiteChange("r1", "comment", "feito");
    expect(notified).toEqual([{ kind: "site_change_comment", to: "owner-1" }]);
  });

  test("o admin autor comenta numa validação do Lucas: o Lucas é avisado", async () => {
    user = { email: "adm@exemplo.com", id: "admin-1", isAdmin: false };
    review = base("master", "requester");
    await reviewSiteChange("r1", "comment", "feito");
    expect(notified).toEqual([{ kind: "site_change_comment", to: "master-1" }]);
  });

  test("se a revisão falha (ex.: sem permissão), ninguém é avisado", async () => {
    review = base("owner", "requester");
    result = { error: "Só quem valida pode decidir.", ok: false };
    expect((await reviewSiteChange("r1", "approve", "")).ok).toBe(false);
    expect(notified).toHaveLength(0);
  });
});
