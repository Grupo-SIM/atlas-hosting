import type { CSSProperties, ReactNode } from "react";
import { getBlockDefinition } from "../blocks/registry.js";
import type { RenderContext } from "../blocks/types.js";
import { fxCss, fxRuntimeData } from "../model/fx.js";
import type { Block, Site } from "../model/index.js";
import {
  cleanStyle,
  elementStylesCss,
  fontFamilyCss,
  translateCss,
} from "../model/style.js";
import { centralCss, centralVars, isCentral } from "./central.js";
import { FxRuntime } from "./FxRuntime.js";
import { customFonts, fontFaceCss, fontStylesheet } from "./fonts.js";
import { isJournal, journalCss, journalVars } from "./journal.js";
import { isPortal, portalCss, portalVars } from "./portal.js";
import { type Route, resolveRoute } from "./routes.js";
import { isSpy, spyCss } from "./spyhacker.js";
import { siteCss, themeVars } from "./styles.js";

export interface SiteRendererProps {
  /** Prefixo das URLs internas; vazio quando o site roda na raiz do domínio. */
  basePath?: string;
  mode?: "edit" | "view";
  /** O HTML publicado liga os efeitos com um script inline; aí o componente cliente não é necessário. */
  skipFxRuntime?: boolean;
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
  skipFxRuntime = false,
}: SiteRendererProps) {
  const route = resolveRoute(site, path, mode);
  const fonts = fontStylesheet(site);
  const notFoundPage =
    route.kind === "notFound"
      ? site.pages.find(p => p.slug === "404")
      : undefined;
  const wide =
    route.kind === "category" ||
    (route.kind === "page" && route.page.wide === true);
  const prose = route.kind === "page" && route.page.prose === true;
  const bare = route.kind === "page" && route.page.bare === true;
  const journal = isJournal(site.theme);
  const portal = isPortal(site.theme);
  const spy = isSpy(site.theme);
  const central = isCentral(site.theme);

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
      className={[
        "sb",
        narrow ? "sb-narrow" : "",
        wide ? "sb-wide" : "",
        prose ? "sb-prose" : "",
        journal ? "sb-j" : "",
        (journal || central) && bare ? "sb-bare" : "",
        portal ? "sb-pt" : "",
        spy ? "sb-sh" : "",
        central ? "sb-ct" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          ...themeVars(site.theme),
          ...(journal ? journalVars(site.theme) : {}),
          ...(portal ? portalVars(site.theme) : {}),
          ...(central ? centralVars(site.theme) : {}),
        } as CSSProperties
      }
    >
      <style>
        {fontFaceCss(customFonts(site.theme)) +
          (journal
            ? siteCss + journalCss
            : portal
              ? siteCss + portalCss
              : spy
                ? siteCss + spyCss
                : central
                  ? siteCss + centralCss
                  : siteCss)}
      </style>
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
      {mode === "view" && !skipFxRuntime ? <FxRuntime /> : null}
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
    const fxData = fxRuntimeData(block.fx);
    const fxStyles = fxCss(block.id, block.fx);
    const { translate: blockShift, ...blockStyle } =
      cleanStyle(block.style) ?? {};
    return (
      <div
        className="sb-block"
        data-block-id={block.id}
        data-block-type={block.type}
        data-fx={fxData.length ? JSON.stringify(fxData) : undefined}
        key={block.id}
        style={blockStyle as CSSProperties}
      >
        {def.render(block.props, ctx, children)}
        {block.elStyles ? (
          <style>{elementStylesCss(block.id, block.elStyles)}</style>
        ) : null}
        {fxStyles ? <style>{fxStyles}</style> : null}
        {blockShift ? (
          <style>
            {translateCss(
              `[data-block-id="${block.id.replace(/["<>]/g, "")}"]`,
              blockShift
            )}
          </style>
        ) : null}
        {block.style?.fontFamily ? (
          <style>
            {fontFamilyCss(
              `[data-block-id="${block.id.replace(/["<>]/g, "")}"] *`,
              cleanStyle(block.style)
            )}
          </style>
        ) : null}
      </div>
    );
  });
}
