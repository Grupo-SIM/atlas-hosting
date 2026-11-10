import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("pagatg");
if (!template) throw new Error("template pagatg não registrado");
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

describe("template pagatg", () => {
  test("aparece na tela de escolha", () => {
    const t = listTemplates().find(t => t.id === "pagatg");
    expect(t?.name).toBe("PagaTG — Vendas no Telegram");
    expect(t?.tags).toEqual(["Landing", "Negócios"]);
  });

  test("passa no siteSchema e nos schemas de todos os blocos", () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      expect(def?.schema.safeParse(b.props).success, b.type).toBe(true);
    }
  });

  test("ids únicos, slugs sem colisão e menu válido", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug)).toEqual([
      "",
      "termos-de-uso",
      "politica-de-privacidade",
      "404",
    ]);
    const header = site.header[0];
    const items = header?.props.items as { url: string }[];
    expect(items.map(i => i.url)).toEqual([
      "/#beneficios",
      "/#comofunciona",
      "/#solucoes",
      "/#faq",
    ]);
    const anchors = new Set(
      site.pages.flatMap(p => p.blocks.map(b => b.anchor)).filter(Boolean)
    );
    for (const it of items) expect(anchors.has(it.url.slice(2))).toBe(true);
  });

  test("home publicada traz as seções do original", () => {
    const home = html("index.html");
    expect(home).toContain("sb-pg");
    expect(home).toContain("6Ru53yI80L4");
    for (const id of [
      "sabermais",
      "beneficios",
      "comofunciona",
      "solucoes",
      "faq",
    ])
      expect(home).toContain(`id="${id}"`);
    expect(count(home, /class="pg-hl-item"/g)).toBe(4);
    expect(count(home, /<article class="pg-ben-card"/g)).toBe(4);
    expect(count(home, /<figure class="pg-seal"/g)).toBe(6);
    expect(home).toContain('data-sb-count="10"');
    expect(home).toContain('data-suffix="+"');
    expect(count(home, /class="pg-sol-card"/g)).toBe(4);
    for (const t of [
      "Engajamento &amp; Escala",
      "Conteúdo &amp; Exclusividade",
      "Educação &amp; Automação",
      "Assinatura &amp; Controle",
      "9.9% + R$1,00",
      "8.9% + R$1,00",
      "Acima de 7 dígitos",
      "Quais nossas taxas?",
      "Quem usa, Recomenda",
      "Performance comprovada",
      "Praticidade &amp; Segurança",
    ])
      expect(home).toContain(t);
    expect(count(home, /class="pg-tcard"/g)).toBe(4);
    expect(count(home, /<article class="pg-step"/g)).toBe(4);
    expect(count(home, /class="pg-q"/g)).toBe(7);
    expect(home).toContain("app.pagatg.com");
    expect(home).toContain('href="/termos-de-uso/"');
    expect(home).toContain('href="/politica-de-privacidade/"');
    expect(home).toContain('data-si-car="1"');
    expect(home).toContain("sb-shape");
  });

  test("rodapé: o ano é texto, não link", () => {
    const home = html("index.html");
    expect(home).toContain("2026 PagaTG. Todos os direitos reservados.");
    expect(home).not.toMatch(/<a[^>]*href="#"[^>]*>[^<]*2026/);
  });

  test("legais e 404", () => {
    for (const path of [
      "termos-de-uso/index.html",
      "politica-de-privacidade/index.html",
    ])
      expect(html(path)).toContain("contatosimintermediacoes@gmail.com");
    expect(html("termos-de-uso/index.html")).toContain(
      "1. Aceitando os Termos"
    );
    expect(html("politica-de-privacidade/index.html")).toContain(
      "Dados Coletados e Motivos da Coleta"
    );
    expect(html("404.html")).toContain("Voltar para o início");
  });

  test("nenhuma página quebrada nem texto que foi corrigido/traduzido", () => {
    const pages = files.filter(f => f.path.endsWith(".html"));
    expect(pages.length).toBeGreaterThanOrEqual(4);
    for (const f of pages) {
      expect(f.content).not.toContain("undefined");
      expect(f.content).not.toContain("Bloco desconhecido");
      expect(f.content).not.toContain("Back to Homepage");
      expect(f.content).not.toContain("wrong turn");
      expect(f.content).not.toContain("solicitos");
      expect(f.content).not.toContain("digitos");
      expect(f.content).not.toContain('href="#beneficios"');
    }
  });
});
