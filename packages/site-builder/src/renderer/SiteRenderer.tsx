import type { CSSProperties, ReactNode } from "react";
import { getBlockDefinition } from "../blocks/registry.js";
import type { RenderContext } from "../blocks/types.js";
import type { Block, Site } from "../model/index.js";
import { type Route, resolveRoute } from "./routes.js";
import { siteCss, themeVars } from "./styles.js";

export interface SiteRendererProps {
  /** Prefixo das URLs internas; vazio quando o site roda na raiz do domínio. */
  basePath?: string;
  mode?: "edit" | "view";
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
  path,
  query = {},
  site,
}: SiteRendererProps) {
  const route = resolveRoute(site, path, mode);

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
    <div className="sb" style={themeVars(site.theme) as CSSProperties}>
      <style>{siteCss}</style>
      {renderBlocks(site.header, ctx)}
      <main>
        {route.kind === "notFound" ? (
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
      {renderBlocks(site.footer, ctx)}
    </div>
  );
}

function renderBlocks(blocks: Block[], ctx: RenderContext): ReactNode {
  return blocks.map(block => {
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
      >
        {def.render(block.props, ctx, children)}
      </div>
    );
  });
}
