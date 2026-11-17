import { beforeEach, describe, expect, mock, test } from "bun:test";
import { getTemplate } from "@repo/site-builder";

let allowed = false;
let builder: { id: string } | null = { id: "u1" };
const inserted: Record<string, unknown>[] = [];

mock.module("next/cache", () => ({ revalidatePath: () => undefined }));
// Os mocks de módulo vazam entre arquivos de teste: mantém todos os exports que os outros testes importam.
mock.module("@/lib/site-builder/access", () => ({
  canUseWordpressTemplates: async () => allowed,
  FORBIDDEN_MESSAGE: "Recurso disponível apenas para usuários autorizados.",
  getBuilderUser: async () => builder,
  getTemplateEditor: async () => null,
  requireBuilderUser: async () => ({ id: "u1" }),
  requireTemplateEditor: async () => ({ id: "u1" }),
}));
mock.module("@/lib/site-builder/templates", () => {
  return {
    getEffectiveTemplate: async (id: string) => getTemplate(id),
    getTemplateDrafts: async () => ({}),
    getTemplateOverrides: async () => ({}),
  };
});
mock.module("@/lib/template-exclusivity/status", () => ({
  BLOCKED_SITE_MESSAGE: "bloqueado",
  getResaleConfig: async () => ({ feePercent: 0 }),
  getTemplateExclusivityMap: async () => ({}),
  getTemplateState: async () => ({ kind: "free" }),
  templateUseError: async () => null,
}));
mock.module("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: (v: Record<string, unknown>) => {
        inserted.push(v);
        return { returning: async () => [{ id: "site-1" }] };
      },
    }),
  },
}));

const { createSite } = await import("./actions");

beforeEach(() => {
  allowed = false;
  builder = { id: "u1" };
  inserted.length = 0;
});

describe("createSite com cópias do WordPress", () => {
  test("quem não tem a permissão não cria site com a cópia (mesmo mandando o id na mão)", async () => {
    const result = await createSite({ name: "x", templateId: "wp-margem" });
    expect(result.ok).toBe(false);
    expect(inserted).toHaveLength(0);
  });

  test("quem tem a permissão cria site a partir da cópia", async () => {
    allowed = true;
    const result = await createSite({ name: "x", templateId: "wp-margem" });
    expect(result.ok).toBe(true);
    expect(inserted[0]?.templateId).toBe("wp-margem");
  });

  test("o template original continua livre para quem não tem a permissão", async () => {
    const result = await createSite({ name: "x", templateId: "margem" });
    expect(result.ok).toBe(true);
  });
});
