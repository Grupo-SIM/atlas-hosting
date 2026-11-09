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
  FORBIDDEN_MESSAGE: "",
  getBuilderUser: async () => null,
  requireBuilderUser: async () => ({ id: "user-1" }),
}));

const { default: SiteBuilderPage } = await import("./page");

test("redireciona à galeria de templates quando não há sites", async () => {
  await expect(SiteBuilderPage()).rejects.toThrow("redirect");
  expect(redirect).toHaveBeenCalledWith("/criador-de-sites/novo");
});
