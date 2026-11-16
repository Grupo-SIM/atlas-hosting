import { beforeEach, describe, expect, mock, test } from "bun:test";
import { getTemplate } from "@repo/site-builder";

let editor: { id: string } | null = { id: "u1" };
const inserted: {
  conflict?: Record<string, unknown>;
  values?: Record<string, unknown>;
}[] = [];
const updates: Record<string, unknown>[] = [];
let draftRow: { draft: unknown } | undefined;

mock.module("next/cache", () => ({ revalidatePath: () => undefined }));
mock.module("@/lib/site-builder/access", () => ({
  FORBIDDEN_MESSAGE: "Recurso disponível apenas para usuários autorizados.",
  getTemplateEditor: async () => editor,
}));
mock.module("@/lib/db", () => {
  const rows = () => {
    const list = draftRow ? [draftRow] : [];
    return Object.assign(Promise.resolve(list), {
      for: () => Promise.resolve(list),
    });
  };
  const update = () => ({
    set: (v: Record<string, unknown>) => {
      updates.push(v);
      return { where: () => Promise.resolve() };
    },
  });
  const tx = {
    select: () => ({ from: () => ({ where: rows }) }),
    update,
  };
  return {
    db: {
      delete: () => ({ where: () => Promise.resolve() }),
      insert: () => ({
        values: (values: Record<string, unknown>) => {
          const entry: (typeof inserted)[number] = { values };
          inserted.push(entry);
          return {
            onConflictDoUpdate: (o: { set: Record<string, unknown> }) => {
              entry.conflict = o.set;
              return Promise.resolve();
            },
          };
        },
      }),
      transaction: async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
      update,
    },
  };
});

const { discardTemplateDraft, publishTemplateDraft, saveTemplateDraft } =
  await import("./template-actions");

const site = () => {
  const s = getTemplate("margem")?.site;
  if (!s) throw new Error("sem template");
  return s;
};

beforeEach(() => {
  editor = { id: "u1" };
  inserted.length = 0;
  updates.length = 0;
  draftRow = undefined;
});

describe("saveTemplateDraft", () => {
  test("quem não pode editar template é recusado e nada é gravado", async () => {
    editor = null;
    const r = await saveTemplateDraft("margem", site());
    expect(r.ok).toBe(false);
    expect(inserted).toHaveLength(0);
  });

  test("grava só o rascunho: a versão publicada (content) nunca é tocada", async () => {
    const r = await saveTemplateDraft("margem", site());
    expect(r.ok).toBe(true);
    const [entry] = inserted;
    expect(Object.keys(entry?.values ?? {})).toContain("draftContent");
    expect(Object.keys(entry?.values ?? {})).not.toContain("content");
    expect(Object.keys(entry?.conflict ?? {})).not.toContain("content");
    expect(Object.keys(entry?.conflict ?? {})).toContain("draftContent");
  });

  test("template inexistente e conteúdo inválido são recusados", async () => {
    expect((await saveTemplateDraft("nao-existe", site())).ok).toBe(false);
    expect((await saveTemplateDraft("margem", { lixo: true })).ok).toBe(false);
    expect(inserted).toHaveLength(0);
  });
});

describe("publishTemplateDraft", () => {
  test("copia o rascunho para a versão publicada e limpa o rascunho", async () => {
    draftRow = { draft: site() };
    const r = await publishTemplateDraft("margem");
    expect(r.ok).toBe(true);
    const [u] = updates;
    expect(u?.content).toBeTruthy();
    expect(u?.draftContent).toBeNull();
    expect(u?.draftUpdatedAt).toBeNull();
  });

  test("sem rascunho não há o que publicar", async () => {
    draftRow = undefined;
    const r = await publishTemplateDraft("margem");
    expect(r.ok).toBe(false);
    expect(updates).toHaveLength(0);
  });

  test("quem não pode editar template não publica", async () => {
    editor = null;
    draftRow = { draft: site() };
    expect((await publishTemplateDraft("margem")).ok).toBe(false);
    expect(updates).toHaveLength(0);
  });
});

describe("discardTemplateDraft", () => {
  test("limpa só as colunas do rascunho e recusa quem não pode", async () => {
    expect((await discardTemplateDraft("margem")).ok).toBe(true);
    const [u] = updates;
    expect(u).toEqual({
      draftContent: null,
      draftUpdatedAt: null,
      draftUpdatedBy: null,
    });
    editor = null;
    expect((await discardTemplateDraft("margem")).ok).toBe(false);
  });
});
