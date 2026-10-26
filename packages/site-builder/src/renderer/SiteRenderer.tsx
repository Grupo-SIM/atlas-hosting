import type { CSSProperties, ReactNode } from "react";
import { getBlockDefinition } from "../blocks/registry.js";
import type { RenderContext } from "../blocks/types.js";
import type { Block, Site } from "../model/index.js";
import { cleanStyle, elementStylesCss } from "../model/style.js";
import { fontStylesheet } from "./fonts.js";
import { type Route, resolveRoute } from "./routes.js";
import { siteCss, themeVars } from "./styles.js";

export interface SiteRendererProps {
  /** Prefixo das URLs internas; vazio quando o site roda na raiz do domínio. */
  basePath?: string;
  mode?: "edit" | "view";
  /** Força o layout de tela estreita (preview de celular/tablet no editor, onde a media query não enxerga o quadro). */
  narrow?: boolean;
  /** Caminho dentro do site (`/`, `/blogs/`…). */
  path: string;
  query?: Record<string, string>;
  site: Site;
}

function layoutFor(site: Site, route: Route): Block[] {
  switch (route.kind) {
    case "page":
      return route.page.blocks;
    case "post":
      return site.postLayout;
    case "category":
      return site.categoryLayout;
    default:
      return [];
  }
}

export function SiteRenderer({
  basePath = "",
  mode = "view",
  narrow = false,
  path,
  query = {},
  site,
}: SiteRendererProps) {
  const route = resolveRoute(site, path, mode);
  const fonts = fontStylesheet(site.theme);
  const notFoundPage =
    route.kind === "notFound"
      ? site.pages.find(p => p.slug === "404")
      : undefined;
  const wide =
    route.kind === "category" ||
    (route.kind === "page" && route.page.wide === true);
  const bare = route.kind === "page" && route.page.bare === true;

  const ctx: RenderContext = {
    basePath,
    current: {
      category: route.kind === "category" ? route.category : undefined,
      post: route.kind === "post" ? route.post : undefined,
    },
    mode,
    query,
    renderBlocks: blocks => renderBlocks(blocks, ctx),
    site,
  };

  return (
    <div
      className={["sb", narrow ? "sb-narrow" : "", wide ? "sb-wide" : ""]
        .filter(Boolean)
        .join(" ")}
      style={themeVars(site.theme) as CSSProperties}
    >
      <style>{siteCss}</style>
      {fonts ? <link href={fonts} rel="stylesheet" /> : null}
      {bare ? null : renderBlocks(site.header, ctx)}
      <main>
        {route.kind === "notFound" && notFoundPage ? (
          renderBlocks(notFoundPage.blocks, ctx)
        ) : route.kind === "notFound" ? (
          <div className="sb-container sb-align-center">
            <h1>Página não encontrada</h1>
            <a className="sb-link" href={basePath || "/"}>
              Voltar para a home
            </a>
          </div>
        ) : (
          renderBlocks(layoutFor(site, route), ctx)
        )}
      </main>
      {bare ? null : renderBlocks(site.footer, ctx)}
    </div>
  );
}

function renderBlocks(blocks: Block[], ctx: RenderContext): ReactNode {
  return blocks.map(block => {
    if (block.hidden) return null;
    const def = getBlockDefinition(block.type);
    if (!def) {
      return ctx.mode === "edit" ? (
        <div className="sb-container" key={block.id}>
          Bloco desconhecido: {block.type}
        </div>
      ) : null;
    }
    const children = (block.children ?? []).map(child =>
      renderBlocks([child], ctx)
    );
    return (
      <div
        className="sb-block"
        data-block-id={block.id}
        data-block-type={block.type}
        key={block.id}
        style={cleanStyle(block.style) as CSSProperties | undefined}
      >
        {def.render(block.props, ctx, children)}
        {block.elStyles ? (
          <style>{elementStylesCss(block.id, block.elStyles)}</style>
        ) : null}
      </div>
    );
  });
}
