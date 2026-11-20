import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getBlockDefinition,
  listBlockDefinitions,
} from "../blocks/registry.js";
import type { FieldDef } from "../blocks/types.js";
import { ENTER_EFFECTS, HOVER_EFFECTS } from "../model/fx.js";
import type { Block, Site } from "../model/index.js";
import { repairSite } from "../model/repair.js";
import { siteSchema } from "../model/schema.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { VARIANT_TOKENS } from "../renderer/variant-tokens.js";
import { getTemplate, listTemplates } from "../templates/index.js";
import { ANIMATIONS, formatShadow, SHADOW_PRESETS } from "./effects.js";
import {
  addCategory,
  addPage,
  addPostToPage,
  duplicatePost,
  POST_FORMATS,
  renameCategory,
  setMenu,
  setTheme,
  updatePage,
  updatePost,
  withAdBlocks,
} from "./site-ops.js";
import {
  allRoots,
  duplicateBlock,
  insertBlock,
  moveBlock,
  setBlockAnchor,
  setBlockHidden,
  updateBlockFx,
  updateBlockProps,
  updateBlockStyle,
  updateElementStyle,
} from "./tree.js";

/**
 * Varredura do editor: em todos os templates, aplica cada opção que o painel oferece (cada campo de cada bloco, cada
 * estilo, cada efeito, ocultar, duplicar, mover, âncora) e as operações do site (páginas, posts de cada formato,
 * categorias, menu, tema, todos os tipos de bloco). Depois de cada bloco o site precisa passar na validação do
 * servidor **sem conserto nenhum** e todas as páginas precisam renderizar. Um erro aqui é exatamente o que faria o
 * salvamento falhar (ou o editor quebrar) para quem edita aquele template.
 */

const shadow = SHADOW_PRESETS.find(p => p.shadow)?.shadow;
const STYLE_VALUES: Record<string, (string | number)[]> = {
  alignItems: ["center"],
  animation: ANIMATIONS.map(a => a.value).filter(Boolean),
  aspectRatio: [1.5],
  background: [
    "#ff0000",
    "rgba(0, 0, 0, 0.4)",
    "linear-gradient(90deg, #ff0000 0%, #00ff88 50%, #0000ff 100%)",
  ],
  borderColor: ["#00ff00"],
  borderRadius: [12, "50%"],
  borderStyle: ["solid", "dashed"],
  borderWidth: [2],
  boxShadow: shadow ? [formatShadow(shadow)] : [],
  color: ["#123456", "var(--sb-accent)"],
  display: ["flex", "inline-block", "none"],
  flexDirection: ["column"],
  fontFamily: ["'Playfair Display', Georgia, serif"],
  fontSize: [22],
  fontStyle: ["italic"],
  fontWeight: [700],
  frame: ["1.5 -20 10"],
  gap: [12],
  height: [300, "auto"],
  hoverBackground: ["#eeeeee"],
  hoverBorderColor: ["#111111"],
  hoverColor: ["#ff00ff"],
  margin: ["0 0 24px"],
  maxWidth: [600],
  objectFit: ["cover"],
  opacity: [0.5],
  order: [2],
  padding: ["16px 24px"],
  position: ["relative"],
  textAlign: ["center"],
  textDecoration: ["underline"],
  textShadow: shadow ? [formatShadow(shadow, true)] : [],
  textTransform: ["uppercase"],
  translate: ["12px -8px"],
  width: ["62.5%", 320],
  zIndex: [3],
};

/** O que a pessoa digitaria/escolheria em cada tipo de campo. */
function valuesFor(field: FieldDef, current: unknown): unknown[] {
  switch (field.kind) {
    case "text":
      return ["Texto de teste com acentuação e “aspas”", ""];
    case "textarea":
      return [
        "Linha 1 com **negrito** e [link](https://exemplo.com)\n\nParágrafo 2",
      ];
    case "url":
      return ["https://exemplo.com/pagina?x=1", "/contato", "#secao", ""];
    case "image":
      return ["https://exemplo.com/imagem.webp", ""];
    case "media":
      return [
        "https://exemplo.com/video.mp4",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://exemplo.com/imagem.webp",
        "",
      ];
    case "number":
      return [0, 3, 12];
    case "color":
      return ["#ff0000", ""];
    case "select":
      return (field.options ?? []).map(o => o.value);
    case "youtubeChannel":
      return [
        { id: "UC_x5XG1OV2P6uZZ5FSM9Ttw", input: "@teste", name: "Canal" },
      ];
    case "list": {
      // "+ Adicionar item", "Duplicar" e "Remover", como no painel.
      const items = Array.isArray(current) ? current : [];
      const empty = Object.fromEntries(
        (field.itemFields ?? []).map(f => [
          f.key,
          f.kind === "number"
            ? 0
            : f.kind === "youtubeChannel"
              ? { id: "", input: "", name: "" }
              : f.kind === "select"
                ? (f.options?.[0]?.value ?? "")
                : "",
        ])
      );
      return [
        [...items, empty],
        items.length ? [...items, structuredClone(items[0])] : [empty],
        items.slice(1),
        [],
      ];
    }
    default:
      return [];
  }
}

const routesOf = (site: Site) => [
  "/",
  ...site.pages.map(p => (p.slug ? `/${p.slug}/` : "/")),
  ...site.posts.slice(0, 2).map(p => `/${p.slug}/`),
  ...site.categories.slice(0, 1).map(c => `/category/${c.slug}/`),
];

function renderAll(site: Site, where: string): string[] {
  const errors: string[] = [];
  for (const path of new Set(routesOf(site))) {
    for (const mode of ["edit", "view"] as const) {
      try {
        renderToStaticMarkup(createElement(SiteRenderer, { mode, path, site }));
      } catch (e) {
        errors.push(`${where} · ${mode} ${path}: ${(e as Error).message}`);
      }
    }
  }
  return errors;
}

function schemaErrors(site: Site, where: string): string[] {
  const parsed = siteSchema.safeParse(site);
  const out: string[] = [];
  if (!parsed.success)
    out.push(
      `${where}: recusado pelo servidor → ${parsed.error.issues
        .slice(0, 3)
        .map(i => `${i.path.join(".")}: ${i.message}`)
        .join(" | ")}`
    );
  // O conserto do servidor não pode ter nada a fazer: o editor só pode produzir conteúdo válido.
  const { fixes } = repairSite(site);
  if (fixes.length)
    out.push(`${where}: precisaria de conserto → ${fixes.join(", ")}`);
  return out;
}

/** Todas as opções do painel num bloco, uma depois da outra (como alguém editando sem parar). */
function editBlock(site: Site, block: Block): Site {
  let s = site;
  const def = getBlockDefinition(block.type);
  for (const field of def?.fields ?? []) {
    const current = block.props[field.key] ?? def?.defaults[field.key];
    for (const value of valuesFor(field, current))
      s = updateBlockProps(s, block.id, { [field.key]: value });
  }
  for (const [key, values] of Object.entries(STYLE_VALUES)) {
    for (const v of values) {
      s = updateBlockStyle(s, block.id, { [key]: v });
      s = updateElementStyle(s, block.id, "1", { [key]: v });
      s = updateElementStyle(s, block.id, "1.2.1", { [key]: v });
    }
  }
  // O que alguém digitaria errado nos campos livres: não pode entrar.
  s = updateBlockStyle(s, block.id, { margin: "0 0 24px;", padding: "{}" });
  s = updateElementStyle(s, block.id, "1", { fontSize: Number.NaN });
  for (const enter of ENTER_EFFECTS)
    s = updateBlockFx(s, block.id, "", { enter, enterMs: 800 });
  for (const hover of HOVER_EFFECTS)
    s = updateBlockFx(s, block.id, "1", { hover, hoverMs: 300 });
  s = updateBlockFx(s, block.id, "", { count: true, mouse: -3, parallax: 4 });
  s = setBlockHidden(s, block.id, true);
  s = setBlockHidden(s, block.id, false);
  s = setBlockAnchor(s, block.id, "secao-teste");
  s = setBlockAnchor(s, block.id, "minha seção com espaço");
  s = duplicateBlock(s, block.id).site;
  s = moveBlock(s, block.id, 1);
  s = moveBlock(s, block.id, -1);
  return s;
}

/**
 * O site só com o necessário para aquele bloco: a página (ou post) dele contendo só ele, poucos posts (as listas
 * precisam de algum) e o resto como está. Cada opção copia o site inteiro, então isso mantém a varredura rápida.
 */
function miniSite(
  site: Site,
  root: string,
  block: Block
): { path: string; site: Site } {
  const posts = site.posts.slice(0, 3).map(p => ({ ...p, blocks: [] }));
  const home = site.pages.find(p => p.slug === "") ?? site.pages[0];
  const base: Site = {
    ...site,
    pages: home ? [{ ...home, blocks: [] }] : [],
    posts,
  };
  if (root.startsWith("page:")) {
    const page = site.pages.find(p => p.id === root.slice(5));
    if (page) {
      base.pages = [{ ...page, blocks: [block] }];
      return { path: page.slug ? `/${page.slug}/` : "/", site: base };
    }
  }
  if (root.startsWith("post:")) {
    const post = site.posts.find(p => p.id === root.slice(5));
    if (post) {
      base.posts = [
        { ...post, blocks: [block] },
        ...posts.filter(p => p.id !== post.id),
      ];
      return { path: `/${post.slug}/`, site: base };
    }
  }
  if (root === "postLayout" && posts[0])
    return { path: `/${posts[0].slug}/`, site: base };
  if (root === "categoryLayout" && site.categories[0])
    return { path: `/category/${site.categories[0].slug}/`, site: base };
  return { path: "/", site: base };
}

function renderPath(site: Site, path: string, where: string): string[] {
  const errors: string[] = [];
  for (const mode of ["edit", "view"] as const) {
    try {
      renderToStaticMarkup(createElement(SiteRenderer, { mode, path, site }));
    } catch (e) {
      errors.push(`${where} · ${mode} ${path}: ${(e as Error).message}`);
    }
  }
  return errors;
}

const templates = listTemplates().map(m => m.id);

describe("varredura do editor em todos os templates", () => {
  for (const id of templates) {
    test(`${id}: toda opção de todo bloco salva e renderiza`, () => {
      const original = getTemplate(id)?.site;
      if (!original) throw new Error("sem template");
      const problems: string[] = [];
      // Cada tipo de bloco em cada lugar (página, post, cabeçalho, rodapé, modelos) uma vez por template.
      const seen = new Set<string>();
      for (const [root, blocks] of allRoots(original)) {
        const kind = root.split(":")[0];
        for (const block of blocks) {
          if (seen.has(`${kind}:${block.type}`)) continue;
          seen.add(`${kind}:${block.type}`);
          const mini = miniSite(original, root, block);
          const edited = editBlock(mini.site, block);
          const where = `${root} › ${block.type}`;
          problems.push(...schemaErrors(edited, where));
          problems.push(...renderPath(edited, mini.path, where));
        }
      }
      expect(problems).toEqual([]);
    }, 120_000);

    test(`${id}: páginas, posts, categorias, menu, tema e todos os blocos`, () => {
      const original = getTemplate(id)?.site;
      if (!original) throw new Error("sem template");
      let s = withAdBlocks(original);
      const added = addPage(s, "Nova página de teste");
      s = updatePage(added.site, added.page.id, {
        slug: "Contato & Ajuda",
        title: "Contato & Ajuda",
      });
      const home = s.pages[0];
      if (!home) throw new Error("sem página");
      for (const f of POST_FORMATS) {
        s = addPostToPage(s, {
          description: f.text ? "Descrição do post" : "",
          format: f.value,
          media:
            f.media === "video"
              ? "https://exemplo.com/video.mp4"
              : f.media === "image"
                ? "https://exemplo.com/imagem.webp"
                : "",
          pageId: home.id,
          title: "Post de teste",
        }).site;
      }
      s = addCategory(s, "Esportes Radicais");
      const cat = s.categories.at(-1);
      if (cat) s = renameCategory(s, cat.id, "Esportes & Aventura");
      const post = s.posts[0];
      if (post) {
        s = updatePost(s, post.id, {
          slug: "Título com Acento",
          title: "Novo",
        });
        s = duplicatePost(s, post.id)?.site ?? s;
      }
      s = setMenu(s, [
        ...s.menu,
        {
          children: [{ href: "/sub", label: "Sub" }],
          href: "https://exemplo.com",
          label: "Externo",
        },
      ]);
      const tokens = VARIANT_TOKENS[s.theme.variant ?? ""] ?? [];
      s = setTheme(
        s,
        Object.fromEntries([
          ["accent", "#ff6600"],
          ["background", "#fafafa"],
          ...tokens.map(t => [t.key, t.kind === "color" ? "#334455" : "Texto"]),
        ])
      );
      // Todo tipo de bloco da aba "Elementos"/"Adicionar bloco" no fim da primeira página.
      for (const def of listBlockDefinitions())
        s = insertBlock(s, `page:${home.id}`, def.type).site;
      const problems = [...schemaErrors(s, "site"), ...renderAll(s, "site")];
      expect(problems).toEqual([]);
    }, 120_000);
  }
});
