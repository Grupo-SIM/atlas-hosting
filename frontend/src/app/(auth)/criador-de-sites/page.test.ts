import { expect, mock, test } from "bun:test";

const redirect = mock((_href: string): never => {
  throw new Error("redirect");
});

mock.module("next/navigation", () => ({ redirect }));
mock.module("@/lib/auth", () => ({}));
mock.module("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        leftJoin: () => ({
          where: () => ({
            orderBy: async () => [],
          }),
        }),
      }),
    }),
  },
}));
mock.module("@/lib/site-builder/access", () => ({
  canUseWordpressTemplates: async () => false,
  FORBIDDEN_MESSAGE: "",
  getBuilderUser: async () => null,
  // Os mocks de módulo vazam entre arquivos de teste: mantém os outros exports que outros testes importam.
  getTemplateEditor: async () => null,
  requireBuilderUser: async () => ({ id: "user-1" }),
  requireTemplateEditor: async () => ({ id: "user-1" }),
}));

const { default: SiteBuilderPage } = await import("./page");

test("redireciona à galeria de templates quando não há sites", async () => {
  await expect(
    SiteBuilderPage({ searchParams: Promise.resolve({}) })
  ).rejects.toThrow("redirect");
  expect(redirect).toHaveBeenCalledWith("/criador-de-sites/novo");
});
