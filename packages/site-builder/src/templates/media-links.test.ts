import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../blocks/registry.js";
import type { FieldDef } from "../blocks/types.js";
import { linkProblem, mediaUrlProblem } from "../editor/link-rules.js";
import type { Block, Site } from "../model/index.js";
import { getTemplate, listTemplates } from "./index.js";

interface Found {
  field: string;
  kind: "link" | "media";
  value: string;
}

function collect(
  fields: FieldDef[],
  values: Record<string, unknown>,
  out: Found[]
) {
  for (const f of fields) {
    const v = values[f.key];
    if (f.kind === "list" && Array.isArray(v)) {
      for (const item of v)
        collect(f.itemFields ?? [], item as Record<string, unknown>, out);
    } else if (typeof v === "string" && v) {
      if (f.kind === "image" || f.kind === "media")
        out.push({ field: f.key, kind: "media", value: v });
      if (f.kind === "url") out.push({ field: f.key, kind: "link", value: v });
    }
  }
}

function walk(blocks: Block[], out: Found[]) {
  for (const b of blocks) {
    const def = getBlockDefinition(b.type);
    if (def) collect(def.fields, { ...def.defaults, ...b.props }, out);
    walk(b.children ?? [], out);
  }
}

const allBlocks = (s: Site): Block[] => [
  ...s.header,
  ...s.footer,
  ...s.postLayout,
  ...s.categoryLayout,
  ...s.pages.flatMap(p => p.blocks),
  ...s.posts.flatMap(p => p.blocks),
];

describe("links e mídias dos templates", () => {
  for (const meta of listTemplates()) {
    test(`${meta.id}: todo link e toda mídia dos campos passam na validação`, () => {
      const site = getTemplate(meta.id)?.site;
      if (!site) throw new Error("sem template");
      const found: Found[] = [];
      walk(allBlocks(site), found);
      const bad = found
        .map(f => ({
          ...f,
          problem:
            f.kind === "link" ? linkProblem(f.value) : mediaUrlProblem(f.value),
        }))
        .filter(f => f.problem)
        .map(
          f => `${f.kind} ${f.field}="${f.value.slice(0, 60)}": ${f.problem}`
        );
      expect(bad).toEqual([]);
    });
  }
});
