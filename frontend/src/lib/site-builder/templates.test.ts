import { describe, expect, mock, test } from "bun:test";
import { getTemplate } from "@repo/site-builder";

const site = () => {
  const s = getTemplate("margem")?.site;
  if (!s) throw new Error("sem template");
  return s;
};

let published: { content: unknown; templateId: string }[] = [];
let drafts: { draft: unknown; templateId: string }[] = [];
let failDrafts = false;

mock.module("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () =>
        Object.assign(Promise.resolve(published), {
          where: () =>
            failDrafts
              ? Promise.reject(
                  new Error('column "draft_content" does not exist')
                )
              : Promise.resolve(drafts),
        }),
    }),
  },
}));

const { getEffectiveTemplate, getTemplateDrafts, getTemplateOverrides } =
  await import("./templates");

describe("versão publicada x rascunho", () => {
  test("linha só com rascunho (content nulo) não conta como publicada: vale o template do código", async () => {
    published = [{ content: null, templateId: "margem" }];
    expect(await getTemplateOverrides()).toEqual({});
    const t = await getEffectiveTemplate("margem");
    expect(t?.site.name).toBe(site().name);
  });

  test("a versão publicada vale para quem usa o template", async () => {
    const edited = { ...site(), name: "Editado pelo Dev" };
    published = [{ content: edited, templateId: "margem" }];
    expect((await getTemplateOverrides()).margem?.name).toBe(
      "Editado pelo Dev"
    );
    expect((await getEffectiveTemplate("margem"))?.site.name).toBe(
      "Editado pelo Dev"
    );
  });

  test("o rascunho NÃO aparece para quem usa o template", async () => {
    published = [];
    drafts = [
      { draft: { ...site(), name: "Só rascunho" }, templateId: "margem" },
    ];
    expect((await getEffectiveTemplate("margem"))?.site.name).not.toBe(
      "Só rascunho"
    );
    expect((await getTemplateDrafts()).margem?.name).toBe("Só rascunho");
  });

  test("se as colunas do rascunho não existem, os publicados continuam valendo", async () => {
    published = [
      { content: { ...site(), name: "Publicado" }, templateId: "margem" },
    ];
    failDrafts = true;
    expect(await getTemplateDrafts()).toEqual({});
    expect((await getTemplateOverrides()).margem?.name).toBe("Publicado");
    failDrafts = false;
  });
});
