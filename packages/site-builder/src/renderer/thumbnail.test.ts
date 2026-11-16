import { describe, expect, test } from "bun:test";
import { getTemplate, listTemplates } from "../templates/index.js";
import { thumbnailSite } from "./thumbnail.js";

describe("thumbnailSite", () => {
  test("mantém só a home, o cabeçalho e os primeiros blocos, sem mexer no original", () => {
    for (const meta of listTemplates()) {
      const site = getTemplate(meta.id)?.site;
      if (!site) throw new Error(meta.id);
      const before = JSON.stringify(site);
      const thumb = thumbnailSite(site);
      expect(JSON.stringify(site), meta.id).toBe(before);
      expect(thumb.header, meta.id).toEqual(site.header);
      expect(thumb.footer, meta.id).toEqual([]);
      const home = site.pages.find(p => p.slug === "");
      if (home) {
        expect(thumb.pages, meta.id).toHaveLength(1);
        expect(thumb.pages[0]?.blocks, meta.id).toEqual(
          home.blocks.slice(0, 4)
        );
      }
    }
  });

  test("site sem página inicial fica como está", () => {
    const site = getTemplate(listTemplates()[0]?.id ?? "")?.site;
    if (!site) throw new Error("sem template");
    const noHome = { ...site, pages: site.pages.filter(p => p.slug !== "") };
    expect(thumbnailSite(noHome)).toBe(noHome);
  });
});
