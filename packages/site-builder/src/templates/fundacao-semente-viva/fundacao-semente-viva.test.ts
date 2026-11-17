import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import {
  crc16,
  pixKeyValue,
  pixPayload,
  pixText,
} from "../../blocks/fundacao-lib.js";
import { BLOBS } from "../../blocks/fundacao-shapes.js";
import { getBlockDefinition } from "../../blocks/registry.js";
import { SiCar } from "../../blocks/sim-lib.js";
import type { Block, Site } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";
import { BRAND } from "./brand.js";

const template = getTemplate("fundacao-semente-viva");
if (!template) throw new Error("template fundacao-semente-viva não registrado");
const { site } = template;

let exported: ReturnType<typeof exportSiteToStatic> | undefined;
const exportOnce = () => (exported ??= exportSiteToStatic(site));
const EXPORT_TIMEOUT = 120_000;

const allBlocks = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...allBlocks(b.children ?? [])]);

const everyBlock = (s: Site) => [
  ...s.pages.flatMap(p => allBlocks(p.blocks)),
  ...allBlocks(s.header),
  ...allBlocks(s.footer),
  ...allBlocks(s.postLayout),
  ...allBlocks(s.categoryLayout),
  ...s.posts.flatMap(p => allBlocks(p.blocks)),
];

async function html(
  s: Site,
  path = "/",
  opts: { mode?: "edit" | "view"; query?: Record<string, string> } = {}
) {
  const { prelude } = await prerender(
    createElement(SiteRenderer, {
      mode: opts.mode ?? "view",
      path,
      query: opts.query ?? {},
      site: s,
      skipFxRuntime: true,
    })
  );
  return new Response(prelude).text();
}

const noScripts = (c: string) =>
  c
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");

const file = (files: { content: string; path: string }[], path: string) =>
  files.find(f => f.path === path)?.content ?? "";

/** O que identifica o site de referência (marca, pessoas, documentos, contatos, tema comercial) e não pode voltar. */
const FORBIDDEN = [
  "Afif",
  "Arão",
  "Apóstolo",
  "Dayse",
  "Perpétua",
  "Suzenilson",
  "Bruno Gonçalves",
  "Recanto Azul",
  "24.435.155",
  "PIXFUNDACAO",
  "2102-5560",
  "Jáguari",
  "Jaguari",
  "Isaura Parente",
  "Estação Experimental",
  "Rio Branco",
  "EjamdQ7Ojr27IXXHNoBqrM",
  "drive.google.com/drive/folders/1AlE1",
  "Onum",
  "onum_company",
  "Seattle",
  "University St",
  "values-driven SEO",
  "bg-shape1-home5",
  "bg-bottom-home5",
  "fundoverdeabstrato",
  "AFIFARAOPRINCIPAL",
  "qrcode-pix.png",
];

describe("template fundacao-semente-viva", () => {
  test("aparece na tela de escolha com nome, tags e descrição", () => {
    const meta = listTemplates().find(t => t.id === "fundacao-semente-viva");
    expect(meta?.name).toBe("Semente Viva — Fundação / ONG");
    expect(meta?.tags).toEqual(["Institucional", "ONG"]);
    expect(meta?.pageCount).toBe(site.pages.length);
    expect(meta?.description).toContain("página de doação com PIX");
  });

  test("passa no siteSchema e toda prop é válida para o schema do bloco", () => {
    const parsed = siteSchema.safeParse(site);
    if (!parsed.success) console.error(parsed.error.issues.slice(0, 5));
    expect(parsed.success).toBe(true);
    for (const b of everyBlock(site)) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      const p = def?.schema.safeParse(b.props);
      if (!p?.success) console.error(b.type, p?.error.issues);
      expect(p?.success, b.type).toBe(true);
    }
  });

  test("páginas, 6 posts e ids únicos; links do menu apontam para páginas que existem", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug).sort()).toEqual(
      [
        "",
        "quem-somos",
        "como-atuamos",
        "doacao",
        "noticias",
        "galeria",
        "contato",
        "privacidade",
        "termos",
        "404",
      ].sort()
    );
    expect(site.posts).toHaveLength(6);
    expect(site.posts.every(p => p.coverImage && p.excerpt)).toBe(true);
    const slugs = new Set(
      site.pages.map(p => `/${p.slug}${p.slug ? "/" : ""}`)
    );
    expect(site.menu.map(m => m.label)).toEqual([
      "Início",
      "Quem somos",
      "Como atuamos",
      "Notícias",
      "Galeria",
      "Contato",
    ]);
    for (const m of site.menu) expect(slugs.has(m.href), m.href).toBe(true);
  });

  test(
    "export estático: toda página renderiza, sem links mortos, sem imagem sem alt e sem texto quebrado",
    async () => {
      const files = await exportOnce();
      const pages = files.filter(f => f.path.endsWith(".html"));
      const paths = new Set(files.map(f => f.path));
      expect(pages.length).toBeGreaterThanOrEqual(10 + 6);
      for (const f of pages) {
        expect(f.content, f.path).not.toContain("Bloco desconhecido");
        expect(noScripts(f.content), f.path).not.toContain("undefined");
        expect(noScripts(f.content), f.path).not.toContain("[object");
        expect(f.content, f.path).not.toContain('href=""');
        expect(f.content, f.path).not.toContain('href="#"');
        expect(f.content, f.path).not.toContain('href="mailto:"');
        // toda imagem tem `alt`
        for (const tag of f.content.match(/<img\b[^>]*>/g) ?? [])
          expect(tag, `${f.path}: ${tag.slice(0, 120)}`).toMatch(/\balt="/);
        // links internos levam a uma página exportada
        for (const m of noScripts(f.content).matchAll(/\bhref="(\/[^"#?]*)/g)) {
          const url = m[1] ?? "/";
          if (url.startsWith("//")) continue;
          const target =
            url === "/" ? "index.html" : `${url.slice(1)}index.html`;
          expect(paths.has(target), `${f.path} → ${url}`).toBe(true);
        }
        expect(f.content, f.path).toContain('lang="pt-BR"');
      }
    },
    EXPORT_TIMEOUT
  );

  test(
    "home: um h1, hero com 5 fotos e 2 botões, 4 áreas, 8 fotos no círculo, faixa → /doacao/, 3 notícias, projetos e rodapé",
    async () => {
      const files = await exportOnce();
      const home = file(files, "index.html");
      const body = noScripts(home);
      expect(home).toContain("sb-sv");
      expect(body.match(/<h1\b/g)).toHaveLength(1);
      const hero =
        body.match(/<section class="sv-hero"[\s\S]*?<\/section>/)?.[0] ?? "";
      expect(hero.match(/class="sv-hero-img"/g)).toHaveLength(5);
      expect(hero.match(/class="sv-btn sv-btn-(?:white|ghost)"/g)).toHaveLength(
        2
      );
      expect(hero).toContain("juntos, plantamos sementes de um futuro melhor");
      expect(body.match(/<article class="sv-area/g)).toHaveLength(4);
      const circle =
        body.match(
          /<div class="sv-circ">[\s\S]*?<span class="sv-circ-tag">/
        )?.[0] ?? "";
      expect(circle.match(/class="sv-circ-img"/g)).toHaveLength(8);
      const band =
        body.match(/<div class="sv-band-card">[\s\S]*?<\/div>/)?.[0] ?? "";
      expect(band).toContain("Seja um colaborador");
      expect(band).toContain('href="/doacao/"');
      const cf =
        body.match(/<div class="sv-cf">[\s\S]*?<\/section>/)?.[0] ?? "";
      expect(cf.match(/class="sv-cf-card"/g)).toHaveLength(3);
      expect(cf).toContain('data-effect="coverflow"');
      expect(cf).toContain("si-slide on");
      expect(cf).toContain("si-slide is-next");
      expect(cf).toContain("si-slide is-prev");
      const proj =
        body.match(/<section class="sv-proj"[\s\S]*?<\/section>/)?.[0] ?? "";
      expect(proj.match(/class="sv-float/g)).toHaveLength(6);
      expect(proj).toMatch(
        /data-sb-video="https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}"/
      );
      expect(home).toContain('id="projetos"');
      const foot =
        body.match(/<footer class="sv-foot"[\s\S]*?<\/footer>/)?.[0] ?? "";
      expect(foot).toContain(`mailto:${BRAND.email}`);
      expect(foot).toMatch(/href="tel:\+?\d+"/);
      expect(foot).toContain(BRAND.cnpj);
      expect(foot).toContain("Copyright ©");
      // um endereço só, vindo do tema (cabeçalho e rodapé iguais)
      expect(body.split(BRAND.address).length - 1).toBeGreaterThanOrEqual(2);
    },
    EXPORT_TIMEOUT
  );

  test("menu e rodapé: rótulos certos (Como atuamos nos dois), Doe agora e busca", async () => {
    const files = await exportOnce();
    const home = noScripts(file(files, "index.html"));
    const menu = home.match(/<ul class="sv-menu">[\s\S]*?<\/ul>/)?.[0] ?? "";
    expect(menu.match(/<li>/g)).toHaveLength(6);
    expect(menu).toContain(">Como atuamos<");
    expect(home).not.toContain("AGENDA");
    const foot =
      home.match(/<nav aria-label="Menu do rodapé"[\s\S]*?<\/nav>/)?.[0] ?? "";
    expect(foot).toContain(">Como atuamos<");
    expect(home).toContain('class="sv-btn sv-btn-green sv-hdonate"');
    const form = home.match(/<form[^>]*class="sv-sform"[^>]*>/)?.[0] ?? "";
    expect(form).toContain('action="/noticias/"');
    expect(form).toContain('method="get"');
    expect(form).toContain('role="search"');
    expect(home).toContain('id="sb-burger"');
  });

  test("/doacao/: PIX com chave, botão de copiar, QR com alt e payload; botão abre o popup", async () => {
    const files = await exportOnce();
    const c = noScripts(file(files, "doacao/index.html"));
    expect(c).toContain("Nosso PIX");
    expect(c).toContain(BRAND.pix.key);
    expect(c).toContain("data-sv-copy=");
    expect(c).toContain(">Copiar chave<");
    expect(c).toMatch(/<img[^>]*alt="QR code para doar por PIX"/);
    expect(c).toContain('popover="auto"');
    expect(c).toContain('id="sv-pix-pop"');
    expect(c).toMatch(/popoverTarget="sv-pix-pop"/);
    expect(c).toContain("PIX copia e cola");
    expect(c).toContain("00020126");
    // a imagem do QR de exemplo é SVG com a marca d'água
    expect(decodeURIComponent(site.theme.pixQr ?? "")).toContain("EXEMPLO");
    // título, frase e botão empilhados (sem o botão sobreposto da referência)
    expect(c).toContain("Sua doação faz a diferença");
  });

  test("editor: aviso de PIX de exemplo só no canvas; popup fechado por padrão", async () => {
    const edit = await html(site, "/doacao/", { mode: "edit" });
    expect(edit).toContain("chave PIX de exemplo");
    const view = await html(site, "/doacao/");
    expect(view).not.toContain("chave PIX de exemplo");
    const s = structuredClone(site);
    s.theme.pixKey = "chave-real@fundacao.org.br";
    expect(await html(s, "/doacao/", { mode: "edit" })).not.toContain(
      "chave PIX de exemplo"
    );
    // com "mostrar no editor" o popup aparece como cartão (sem `popover`)
    const popup = s.pages
      .find(p => p.slug === "doacao")
      ?.blocks.find(b => b.type === "svPix" && b.props.layout === "popup");
    if (popup) popup.props.showInEditor = "yes";
    const shown = await html(s, "/doacao/", { mode: "edit" });
    expect(shown.match(/class="sv-pix/g)?.length).toBeGreaterThanOrEqual(2);
    expect(shown).not.toContain('popover="auto"');
  });

  test("como atuamos: abas com tablist/tab/tabpanel e tabela de atividades", async () => {
    const files = await exportOnce();
    const c = noScripts(file(files, "como-atuamos/index.html"));
    expect(c.match(/role="tablist"/g)).toHaveLength(1);
    expect(c.match(/role="tab"/g)).toHaveLength(4);
    expect(c.match(/role="tabpanel"/g)).toHaveLength(4);
    expect(c.match(/type="radio"/g)).toHaveLength(4);
    expect(c).toContain('aria-selected="true"');
    expect(c).toContain("<table");
    expect(c).toContain("Organização geral das atividades");
    expect(c).toMatch(/data-sb-video="https:\/\/www\.youtube-nocookie\.com/);
    expect(c).toContain("Dúvidas?");
    // WhatsApp do tema no botão "Fale com a gente"
    expect(c).toContain(`https://wa.me/${BRAND.whatsapp}`);
  });

  test("quem somos, notícias, galeria, contato e 404", async () => {
    const files = await exportOnce();
    const about = noScripts(file(files, "quem-somos/index.html"));
    expect(about).toContain("<iframe");
    expect(about).toMatch(/<iframe[^>]*title="[^"]+"/);
    expect(about).toContain('loading="lazy"');
    expect(about.match(/<li class="sv-member"/g)).toHaveLength(6);
    expect(about.match(/<article class="sv-area/g)).toHaveLength(4);
    expect(about).not.toContain("is-over");
    const news = noScripts(file(files, "noticias/index.html"));
    expect(news.match(/class="sb-post-card sv-ncard"/g)).toHaveLength(6);
    expect(news).toContain("Acompanhe também nas redes");
    const gal = noScripts(file(files, "galeria/index.html"));
    expect(gal.match(/class="sv-album"/g)).toHaveLength(4);
    const contact = noScripts(file(files, "contato/index.html"));
    expect(contact).toContain("Detalhes para contato");
    expect(contact).toContain(`action="mailto:${BRAND.email}"`);
    expect(contact).toContain(`href="mailto:${BRAND.email}"`);
    expect(contact).toMatch(/href="tel:\+?\d+"/);
    const nf = noScripts(file(files, "404/index.html"));
    expect(nf).toContain("Voltar ao início");
    expect(nf).toContain("sv-ph");
    // post: faixa, texto e "Doe agora" no fim
    const post = noScripts(file(files, `${site.posts[0]?.slug}/index.html`));
    expect(post).toContain("sv-post-cta");
    expect(post).toContain("Doe agora");
  });

  test("busca: o parâmetro q filtra as notícias na visualização", async () => {
    const q = await html(site, "/noticias/", { query: { q: "futebol" } });
    expect(noScripts(q).match(/class="sb-post-card sv-ncard"/g)).toHaveLength(
      1
    );
    const none = await html(site, "/noticias/", { query: { q: "zzzz" } });
    expect(noScripts(none)).toContain("Nenhuma notícia encontrada.");
  });

  test("formulário de contato usa a URL configurada quando existe", async () => {
    const s = structuredClone(site);
    const form = s.pages
      .find(p => p.slug === "contato")
      ?.blocks.find(b => b.type === "svContact");
    if (form) form.props.actionUrl = "https://formspree.io/f/exemplo";
    const out = noScripts(await html(s, "/contato/"));
    expect(out).toContain('action="https://formspree.io/f/exemplo"');
  });

  test("anticópia: nada da referência no export inteiro", async () => {
    const files = await exportOnce();
    for (const f of files)
      for (const term of FORBIDDEN)
        expect(f.content, `${f.path}: ${term}`).not.toContain(term);
    // CNPJ fictício claramente inválido
    expect(BRAND.cnpj).toBe("00.000.000/0001-00");
  });
});

describe("PIX (BR Code)", () => {
  const REF = {
    city: "BRASILIA",
    key: "123e4567-e12b-12d3-a456-426655440000",
    name: "Fulano de Tal",
  };

  test("CRC16-CCITT: valor de verificação padrão", () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  test("payload de uma chave conhecida bate com o valor de referência", () => {
    // O CRC de referência foi calculado de forma independente (binascii.crc_hqx, init 0xFFFF).
    expect(pixPayload(REF)).toBe(
      "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d3-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304CEDC"
    );
  });

  test("o CRC do payload confere e os campos têm o tamanho certo", () => {
    const p = pixPayload({ ...REF, txid: "DOACAO2026" });
    expect(p.slice(-4)).toBe(crc16(p.slice(0, -4)));
    // percorre os campos TLV: o tamanho declarado bate com o texto
    const fields: Record<string, string> = {};
    for (let i = 0; i < p.length; ) {
      const id = p.slice(i, i + 2);
      const len = Number(p.slice(i + 2, i + 4));
      expect(Number.isInteger(len), id).toBe(true);
      fields[id] = p.slice(i + 4, i + 4 + len);
      i += 4 + len;
      expect(i).toBeLessThanOrEqual(p.length);
    }
    expect(fields["00"]).toBe("01");
    expect(fields["53"]).toBe("986");
    expect(fields["58"]).toBe("BR");
    expect(fields["62"]).toBe("0510DOACAO2026");
  });

  test("nome até 25 e cidade até 15 caracteres, sem acentos", () => {
    const p = pixPayload({
      city: "São José dos Campos do Sul",
      key: "pix@exemplo.org.br",
      name: "Fundação Semente Viva de Apoio à Comunidade",
    });
    const name = /59(\d\d)/.exec(p);
    const nameLen = Number(name?.[1]);
    expect(nameLen).toBeLessThanOrEqual(25);
    expect(p).toContain("Fundacao Semente Viva de");
    expect(p).not.toMatch(/[^\x20-\x7e]/);
    expect(pixText("São José dos Campos do Sul", 15)).toBe("Sao Jose dos Ca");
    expect(pixText("Ação", 25)).toBe("Acao");
  });

  test("sem chave não há payload; chaves são normalizadas por tipo", () => {
    expect(pixPayload({ city: "X", key: "", name: "Y" })).toBe("");
    expect(pixKeyValue("cnpj", "12.345.678/0001-95")).toBe("12345678000195");
    expect(pixKeyValue("email", " Pix@Exemplo.ORG.br ")).toBe(
      "pix@exemplo.org.br"
    );
    expect(pixKeyValue("phone", "(11) 91234-5678")).toBe("+5511912345678");
    expect(pixKeyValue("phone", "+55 11 91234-5678")).toBe("+5511912345678");
  });
});

describe("blobs e carrossel coverflow", () => {
  test("os 4 blobs são caminhos fechados, diferentes e estáveis", () => {
    expect(BLOBS).toHaveLength(4);
    expect(new Set(BLOBS).size).toBe(4);
    for (const d of BLOBS) {
      expect(d.startsWith("M")).toBe(true);
      expect(d.endsWith("Z")).toBe(true);
      expect(d).not.toContain("NaN");
    }
  });

  test("SiCar sem `effect` não ganha `data-effect` nem classes de vizinho", () => {
    const render = async (effect?: "coverflow") => {
      const { prelude } = await prerender(
        createElement(SiCar, {
          effect,
          items: ["a", "b", "c"],
          p: {
            delay: 1,
            gap: 0,
            perView: 1,
            perViewMobile: 1,
            perViewTablet: 1,
            speed: 1,
          },
          transition: effect ? undefined : "fade",
        })
      );
      return new Response(prelude).text();
    };
    return Promise.all([render(), render("coverflow")]).then(
      ([plain, cover]) => {
        expect(plain).not.toContain("data-effect");
        expect(plain).not.toContain("is-prev");
        expect(plain).not.toContain("is-next");
        expect(plain).toContain('class="si-slide on"');
        expect(cover).toContain('data-effect="coverflow"');
        expect(cover).toContain('data-fade="1"');
        expect(cover).toContain("is-prev");
        expect(cover).toContain("is-next");
      }
    );
  });

  test("templates irmãos que usam SiCar continuam sem coverflow no HTML", async () => {
    for (const id of [
      "outro-lado-internet",
      "gatilhos-mentais",
      "sorveteria-frescor",
    ]) {
      const t = getTemplate(id);
      if (!t) continue;
      const out = await html(t.site);
      expect(out, id).toContain("data-si-car");
      // nem no HTML nem no CSS: o CSS do coverflow só vai nas variantes que o pedem
      expect(out, id).not.toContain("data-effect");
      expect(out, id).not.toContain("is-prev");
    }
  });
});
