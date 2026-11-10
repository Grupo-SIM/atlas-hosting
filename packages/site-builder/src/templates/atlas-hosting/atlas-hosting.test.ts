import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("atlas-hosting");
if (!template) throw new Error("template atlas-hosting não registrado");
const { site } = template;

const all = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...all(b.children ?? [])]);
const blocks = [
  ...all(site.header),
  ...all(site.footer),
  ...site.pages.flatMap(p => all(p.blocks)),
];

const files = await exportSiteToStatic(site);
const html = (path: string) => files.find(f => f.path === path)?.content ?? "";
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe("template atlas-hosting", () => {
  test("aparece na tela de escolha", () => {
    expect(listTemplates().some(t => t.id === "atlas-hosting")).toBe(true);
  });

  test("passa no siteSchema e nos schemas de todos os blocos", () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      expect(def?.schema.safeParse(b.props).success, b.type).toBe(true);
    }
  });

  test("ids únicos e as mesmas rotas do original", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug)).toEqual([
      "",
      "vps",
      "vds",
      "vps-armazenamento",
      "vps-windows",
      "termos",
      "privacidade",
      "404",
    ]);
  });

  test("menu e rodapé apontam para páginas que existem", () => {
    const slugs = new Set(site.pages.map(p => p.slug));
    const internal = blocks
      .flatMap(b => [
        ...((b.props.submenu as { url: string }[] | undefined) ?? []),
        ...((b.props.menu as { url: string }[] | undefined) ?? []),
        ...((b.props.legal as { url: string }[] | undefined) ?? []),
      ])
      .map(l => l.url)
      .filter(u => u.startsWith("/") && !u.includes("#"));
    expect(internal.length).toBeGreaterThan(0);
    for (const u of internal) expect(slugs.has(u.slice(1))).toBe(true);
  });

  test("home traz as seções, o contador, o mapa e a chave de backup", () => {
    const home = html("index.html");
    expect(home).toContain("sb-at");
    for (const t of [
      "Receba até R$250,00 de volta!",
      "A única hospedagem do Brasil com cashback",
      "Garantia de 30 dias",
      "Performance Garantida,",
      "Potência dedicada para tirar seus projetos do papel.",
      "Feedback &amp; Avaliações",
      "Júlia Alba",
    ])
      expect(home).toContain(t);
    expect(count(home, /data-sb-count=/g)).toBe(4);
    expect(count(home, /data-sb-lottie=/g)).toBe(1);
    expect(count(home, /<article class="at-plan/g)).toBe(6);
    expect(count(home, /<figure class="at-depo-card"/g)).toBe(3);
    expect(home).toContain('id="planos"');
    expect(home).toContain('id="testimonials"');
    expect(home).toContain("domains/search");
  });

  test("planos de cada produto levam ao checkout certo", () => {
    expect(count(html("vps/index.html"), /<article class="at-plan/g)).toBe(6);
    expect(html("vps/index.html")).toContain("backup=true");
    expect(count(html("vds/index.html"), /<article class="at-plan/g)).toBe(5);
    expect(html("vds/index.html")).toContain("/vds/configure/m?duration=24");
    expect(
      count(html("vps-armazenamento/index.html"), /<article class="at-plan/g)
    ).toBe(5);
    expect(
      count(html("vps-windows/index.html"), /<article class="at-plan/g)
    ).toBe(6);
  });

  test("termos e privacidade", () => {
    expect(html("termos/index.html")).toContain("1. Aceitação dos termos");
    expect(html("privacidade/index.html")).toContain("LGPD");
    expect(
      count(html("privacidade/index.html"), /<li>/g)
    ).toBeGreaterThanOrEqual(8);
  });

  test("nenhuma página quebrada", () => {
    for (const f of files.filter(f => f.path.endsWith(".html"))) {
      expect(f.content).not.toContain("undefined");
      expect(f.content).not.toContain("Bloco desconhecido");
    }
  });

  test("site criado antes da remoção do chat não mostra bloco desconhecido", () => {
    const old = structuredClone(site);
    const home = old.pages.find(p => p.slug === "");
    home?.blocks.splice(4, 0, {
      id: "legacy-chat",
      props: { title: "Ficou com alguma dúvida?" },
      type: "atChat",
    });
    for (const mode of ["edit", "view"] as const) {
      const out = renderToStaticMarkup(
        SiteRenderer({ mode, path: "/", site: old, skipFxRuntime: true })
      );
      expect(out).not.toContain("Bloco desconhecido");
      expect(out).not.toContain("Ficou com alguma dúvida?");
    }
  });
});
