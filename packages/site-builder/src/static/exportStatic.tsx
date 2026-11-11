import { createElement } from "react";
import { prerender } from "react-dom/static";
import type { Site } from "../model/index.js";
import { FX_RUNTIME } from "../renderer/fx-runtime.js";
import { MARGEM_RUNTIME } from "../renderer/margem-runtime.js";
import { NAV_RUNTIME } from "../renderer/nav-runtime.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { themeVars } from "../renderer/styles.js";
import { UNIVERSO_RUNTIME } from "../renderer/universo-runtime.js";

export interface StaticFile {
  content: string;
  /** Caminho relativo à raiz do site (`index.html`, `blogs/index.html`…). */
  path: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * O site estático não tem servidor, então a busca/filtro (`?q=` e `?category=`) roda no
 * navegador: esconde os cards que não batem e preenche os campos do formulário.
 */
const filterScript = `(function(){var p=new URLSearchParams(location.search);var q=(p.get("q")||"").toLowerCase();var c=p.get("category")||"";document.querySelectorAll("[data-hf-q]").forEach(function(e){e.textContent=p.get("q")||""});if(!q&&!c)return;document.querySelectorAll(".sb-filter input[name=q],.sb-mag input[name=q],.sg-search input[name=q],.sg-side input[name=q]").forEach(function(i){i.value=p.get("q")||""});document.querySelectorAll(".sb-filter select[name=category],.sb-mag select[name=category],.sb-sidebar select[name=category],.sg-search select[name=category],.sg-side select[name=category]").forEach(function(s){s.value=c});document.querySelectorAll(".sb-post-card").forEach(function(el){var t=(el.getAttribute("data-search")||"").toLowerCase();var k=el.getAttribute("data-category")||"";if((q&&t.indexOf(q)<0)||(c&&k!==c))el.style.display="none"})})();`;

/**
 * `react-dom/static` em vez de `react-dom/server`: o Next recusa importar o segundo em código
 * do app router, e aqui só precisamos do HTML final.
 */
async function render(path: string, site: Site): Promise<string> {
  const { prelude } = await prerender(
    createElement(SiteRenderer, { path, site, skipFxRuntime: true })
  );
  return new Response(prelude).text();
}

async function document(
  site: Site,
  path: string,
  title: string,
  description: string
): Promise<string> {
  const body = await render(path, site);
  const bg = themeVars(site.theme)["--sb-bg"];
  // Favicon do usuário (guardado no tema); só URL http(s), caminho do site ou imagem embutida.
  const favicon = site.theme.favicon?.trim() ?? "";
  const faviconTag = /^(https?:\/\/|\/|data:image\/)/.test(favicon)
    ? `<link rel="icon" href="${escapeHtml(favicon)}">`
    : "";
  // Descrição do site (tema `seoDescription`) vale para as páginas; posts usam o resumo.
  const desc = description || (site.theme.seoDescription ?? "").trim();
  const pageTitle =
    title && title !== site.name ? `${title} — ${site.name}` : site.name;
  return [
    "<!doctype html>",
    '<html lang="pt-BR">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(pageTitle)}</title>`,
    faviconTag,
    desc ? `<meta name="description" content="${escapeHtml(desc)}">` : "",
    `<style>body{margin:0;background:${bg}}</style>`,
    "</head>",
    "<body>",
    body,
    `<script>${filterScript}</script>`,
    `<script>${FX_RUNTIME};window.sbFx()</script>`,
    `<script>${NAV_RUNTIME}</script>`,
    // Movimento dos blocos do template Margem: só nas páginas que têm um deles.
    body.includes(" data-mg=")
      ? `<script>${MARGEM_RUNTIME};window.sbMargem()</script>`
      : "",
    // Cartas e contagem do template Universo: só nas páginas que têm um bloco dele.
    body.includes(" data-uv=")
      ? `<script>${UNIVERSO_RUNTIME};window.sbUniverso()</script>`
      : "",
    "</body>",
    "</html>",
  ].join("");
}

/**
 * Gera o site publicado: uma pasta por rota com `index.html` (URLs com barra final, como no
 * WordPress), mais `404.html`. Só entra o que está publicado — rascunhos ficam de fora.
 */
export async function exportSiteToStatic(site: Site): Promise<StaticFile[]> {
  const files: StaticFile[] = [];

  for (const page of site.pages) {
    if (page.status !== "published") continue;
    files.push({
      content: await document(site, `/${page.slug}/`, page.title, ""),
      path: page.slug ? `${page.slug}/index.html` : "index.html",
    });
  }
  for (const post of site.posts) {
    if (post.status !== "published") continue;
    files.push({
      content: await document(site, `/${post.slug}/`, post.title, post.excerpt),
      path: `${post.slug}/index.html`,
    });
  }
  for (const category of site.categories) {
    files.push({
      content: await document(
        site,
        `/category/${category.slug}/`,
        category.name,
        ""
      ),
      path: `category/${category.slug}/index.html`,
    });
  }
  files.push({
    content: await document(
      site,
      "/__nao-encontrado__/",
      "Página não encontrada",
      ""
    ),
    path: "404.html",
  });

  return files;
}
