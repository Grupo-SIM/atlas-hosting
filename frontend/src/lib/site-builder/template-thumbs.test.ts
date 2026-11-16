import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { listTemplates } from "@repo/site-builder";
import { templateThumb } from "./template-thumbs";

// Falha quando um template muda (ou nasce) sem a miniatura ser refeita. Em produção nada quebra (a galeria cai na
// miniatura ao vivo, mais pesada), mas a gente quer a imagem em dia: rode `bun scripts/template-thumbs.mjs`.
test("todo template tem miniatura em dia e o arquivo existe", () => {
  const stale: string[] = [];
  for (const { id } of listTemplates()) {
    const thumb = templateThumb(id);
    const file = join(process.cwd(), "public", "template-thumbs", `${id}.webp`);
    if (!(thumb && existsSync(file))) stale.push(id);
  }
  expect(
    stale,
    `miniaturas faltando ou velhas: ${stale.join(", ")}. Rode: bun scripts/template-thumbs.mjs`
  ).toEqual([]);
});
