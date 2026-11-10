import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("sim-intermediacoes");
if (!template) throw new Error("template sim-intermediacoes não registrado");
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

describe("template sim-intermediacoes", () => {
  test("aparece na tela de escolha", () => {
    expect(listTemplates().some(t => t.id === "sim-intermediacoes")).toBe(true);
  });

  test("passa no siteSchema e nos schemas de todos os blocos", () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      expect(def?.schema.safeParse(b.props).success, b.type).toBe(true);
    }
  });

  test("ids únicos e slugs sem colisão", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slugs = site.pages.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual([
      "",
      "sobre",
      "portfolio-tecnologia",
      "portfolio-marketing",
      "politica-de-privacidade",
      "termos-de-uso",
      "404",
    ]);
  });

  test("menu do cabeçalho aponta para páginas que existem", () => {
    const header = site.header[0];
    const items = header?.props.items as { url: string }[];
    expect(items).toHaveLength(4);
    for (const it of items.slice(0, 3)) {
      const slug = it.url.replaceAll("/", "");
      expect(site.pages.some(p => p.slug === slug)).toBe(true);
    }
    expect(items[3]?.url).toContain("api.whatsapp.com");
  });

  test("home publicada traz as seções do original", () => {
    const home = html("index.html");
    expect(home).toContain("sb-si");
    expect(home).toContain(
      'data-sb-video="https://player.vimeo.com/video/1081562046"'
    );
    for (const t of [
      "Altíssima taxa de aprovação",
      "Saque ágil para o seu negócio (D+1)",
      "Cashback em todas as transações",
      "Transparente e seguro",
      "Inovação em Pagamentos Online",
      "Pagamentos Online",
      "QUALIDADE GARANTIDA!",
      "Adquirir Serviços",
      "CNPJ: 38.486.051/0001-48",
    ])
      expect(home).toContain(t);
    expect(
      count(
        home,
        /fundacao-logo-press-jb|frendz-logo-press-jb|atlas-logo-press-jb|simpass-logo-press-jb|logo-igreja-renovada-12/g
      )
    ).toBe(5);
    expect(count(home, /class="si-t"/g)).toBe(4);
    expect(count(home, /<article class="si-plan/g)).toBe(5);
    expect(count(home, /<details/g)).toBe(12);
    expect(home).toContain('id="faq"');
    expect(home).toContain('data-si-car="1"');
  });

  test("sobre, tecnologia e marketing", () => {
    const sobre = html("sobre/index.html");
    expect(sobre).toContain("player.vimeo.com/video/1079042475");
    expect(sobre).toContain("Lucas Acre");
    for (const t of ["Visão", "Valores", "Missão"]) expect(sobre).toContain(t);

    const tec = html("portfolio-tecnologia/index.html");
    for (const u of [
      "https://simintpay.com",
      "http://Pagatg.com",
      "https://atlashosting.com.br/",
      "https://ebooksim.com/",
      "http://areaflix.simintermediacoes.com/",
      "https://teron.app",
      "https://controlepatrimonial.simintermediacoes.com/",
      "https://motorista.simintermediacoes.com/",
    ])
      expect(tec).toContain(u);
    expect(tec).toContain("App para igrejas");

    const mkt = html("portfolio-marketing/index.html");
    expect(count(mkt, /data-sb-video=/g)).toBe(40);
    expect(count(mkt, /class="si-vid"/g)).toBe(40);
    expect(mkt).toContain("Tráfego Pago");
    expect(mkt).toContain("Influenciadores parceiros");
  });

  test("nenhuma página quebrada nem texto do plugin que ficou de fora", () => {
    for (const f of files.filter(f => f.path.endsWith(".html"))) {
      expect(f.content).not.toContain("undefined");
      expect(f.content).not.toContain("Bloco desconhecido");
      expect(f.content).not.toContain("A small river named Duden");
      expect(f.content).not.toContain("info@example.com");
      expect(f.content).not.toContain("+1 (859)");
      expect(f.content).not.toContain("/produtos");
    }
  });
});
