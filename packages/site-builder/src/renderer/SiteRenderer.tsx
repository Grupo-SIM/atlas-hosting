import type { CSSProperties, ReactNode } from "react";
import { getBlockDefinition } from "../blocks/registry.js";
import type { RenderContext } from "../blocks/types.js";
import { fxCss, fxRuntimeData } from "../model/fx.js";
import { BLOCK_ANCHOR, type Block, type Site } from "../model/index.js";
import {
  cleanStyle,
  elementStylesCss,
  fontFamilyCss,
  hoverCss,
  translateCss,
} from "../model/style.js";
import { areaflixCss, areaflixVars, isAreaflix } from "./areaflix.js";
import { atlasCss, atlasVars, isAtlas } from "./atlas.js";
import { centralCss, centralVars, isCentral } from "./central.js";
import {
  consultoriaCss,
  consultoriaVars,
  isConsultoria,
} from "./consultoria.js";
import { corteCss, corteVars, isCorte } from "./corte.js";
import { diarioCss, diarioVars, isDiario } from "./diario.js";
import { FxRuntime } from "./FxRuntime.js";
import { customFonts, fontFaceCss, fontStylesheet } from "./fonts.js";
import { fundacaoCss, fundacaoVars, isFundacao } from "./fundacao.js";
import { gatilhosCss, gatilhosVars, isGatilhos } from "./gatilhos.js";
import { granaCss, granaVars, isGrana } from "./grana.js";
import {
  habilidadesCss,
  habilidadesVars,
  isHabilidades,
} from "./habilidades.js";
import { holofoteCss, holofoteVars, isHolofote } from "./holofote.js";
import { igrejaCss, igrejaVars, isIgreja } from "./igreja.js";
import { instafanCss, instafanVars, isInstafan } from "./instafan.js";
import { isJournal, journalCss, journalVars } from "./journal.js";
import { isMargem, margemCss, margemVars } from "./margem.js";
import {
  isMarketplace,
  marketplaceCss,
  marketplaceVars,
} from "./marketplace.js";
import { isMotorista, motoristaCss, motoristaVars } from "./motorista.js";
import { isOutroLado, outroladoCss, outroladoVars } from "./outrolado.js";
import { isPagaTg, pagatgCss, pagatgVars } from "./pagatg.js";
import {
  isPatrimonial,
  patrimonialCss,
  patrimonialVars,
} from "./patrimonial.js";
import { isPortal, portalCss, portalVars } from "./portal.js";
import { isPousada, pousadaCss, pousadaVars } from "./pousada.js";
import { isPresets, presetsCss, presetsVars } from "./presets.js";
import { isRaiz, raizCss, raizVars } from "./raiz.js";
import { isResolvit, resolvitCss, resolvitVars } from "./resolvit.js";
import { type Route, resolveRoute } from "./routes.js";
import { isSaut, sautCss, sautVars } from "./saut.js";
import { isSeguidores, seguidoresCss, seguidoresVars } from "./seguidores.js";
import { isSeopack, seopackCss, seopackVars } from "./seopack.js";
import { isSim, simCss, simVars } from "./sim.js";
import { isSorveteria, sorveteriaCss, sorveteriaVars } from "./sorveteria.js";
import { isSpy, spyCss } from "./spyhacker.js";
import { siteCss, themeVars } from "./styles.js";
import { isUniverso, universoCss, universoVars } from "./universo.js";
import { isViralpack, viralpackCss, viralpackVars } from "./viralpack.js";
import {
  isVslMilionario,
  vslmilionarioCss,
  vslmilionarioVars,
} from "./vslmilionario.js";
import { isZyrion, zyrionCss, zyrionVars } from "./zyrion.js";

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
  /** Miniatura reduzida (galeria, "Meus sites"): iframes de vídeo/site saem sem player. */
  thumbnail?: boolean;
  /**
   * Sem o CSS do Google Fonts nem as fontes enviadas (cai na fonte do sistema). Para miniaturas bem pequenas: o
   * `<link rel="stylesheet">` no corpo da página bloqueia a renderização até chegar, e a 30% de escala ninguém
   * distingue a fonte. As imagens pré-geradas da galeria de templates não usam isto (saem com a fonte certa).
   */
  skipFonts?: boolean;
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

/** Hash curto (FNV-1a) do CSS de uma variante: nome estável do `<style href>` compartilhado entre miniaturas. */
function cssKey(css: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < css.length; i++) {
    h ^= css.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function SiteRenderer({
  basePath = "",
  mode = "view",
  narrow = false,
  path,
  query = {},
  site,
  skipFonts = false,
  skipFxRuntime = false,
  thumbnail = false,
}: SiteRendererProps) {
  const route = resolveRoute(site, path, mode);
  const fonts = skipFonts ? "" : fontStylesheet(site);
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
  const market = isMarketplace(site.theme);
  const margem = isMargem(site.theme);
  const patrimonial = isPatrimonial(site.theme);
  const motorista = isMotorista(site.theme);
  const areaflix = isAreaflix(site.theme);
  const resolvit = isResolvit(site.theme);
  const zyrion = isZyrion(site.theme);
  const seguidores = isSeguidores(site.theme);
  const raiz = isRaiz(site.theme);
  const holofote = isHolofote(site.theme);
  const sim = isSim(site.theme);
  const pagatg = isPagaTg(site.theme);
  const outrolado = isOutroLado(site.theme);
  const habilidades = isHabilidades(site.theme);
  const presets = isPresets(site.theme);
  const instafan = isInstafan(site.theme);
  const seopack = isSeopack(site.theme);
  const atlas = isAtlas(site.theme);
  const vslmilionario = isVslMilionario(site.theme);
  const gatilhos = isGatilhos(site.theme);
  const corte = isCorte(site.theme);
  const viralpack = isViralpack(site.theme);
  const consultoria = isConsultoria(site.theme);
  const diario = isDiario(site.theme);
  const grana = isGrana(site.theme);
  const universo = isUniverso(site.theme);
  const pousada = isPousada(site.theme);
  const igreja = isIgreja(site.theme);
  const saut = isSaut(site.theme);
  const sorveteria = isSorveteria(site.theme);
  const fundacao = isFundacao(site.theme);

  const ctx: RenderContext = {
    basePath,
    current: {
      category: route.kind === "category" ? route.category : undefined,
      post: route.kind === "post" ? route.post : undefined,
    },
    mode,
    path,
    query,
    renderBlocks: blocks => renderBlocks(blocks, ctx),
    site,
    thumbnail,
  };

  // CSS da variante do template (além do base): a primeira que valer, na mesma ordem de antes.
  const variants: [boolean, string][] = [
    [fundacao, fundacaoCss],
    [igreja, igrejaCss],
    [pousada, pousada ? pousadaCss(site.theme) : ""],
    [saut, sautCss],
    [sorveteria, sorveteriaCss],
    [universo, universoCss],
    [atlas, atlasCss],
    [diario, diarioCss],
    [grana, granaCss],
    [consultoria, consultoriaCss],
    [viralpack, viralpackCss],
    [corte, corteCss],
    [gatilhos, gatilhosCss],
    [resolvit, resolvitCss],
    [seopack, seopackCss],
    [instafan, instafanCss],
    [presets, presetsCss],
    [habilidades, habilidadesCss],
    [outrolado, outroladoCss],
    [pagatg, pagatgCss],
    [sim, simCss],
    [holofote, holofoteCss],
    [raiz, raizCss],
    [zyrion, zyrionCss],
    [journal, journalCss],
    [portal, portalCss],
    [spy, spyCss],
    [central, centralCss],
    [market, marketplaceCss],
    [margem, margemCss],
    [seguidores, seguidoresCss],
    [areaflix, areaflixCss],
    [patrimonial, patrimonialCss],
    [motorista, motoristaCss],
    [vslmilionario, vslmilionarioCss],
  ];
  const variantCss = variants.find(([on]) => on)?.[1] ?? "";
  const fontFaces = skipFonts ? "" : fontFaceCss(customFonts(site.theme));

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
        market ? "sb-mk" : "",
        margem ? "sb-mg" : "",
        patrimonial ? "sb-cp" : "",
        motorista ? "sb-cm" : "",
        areaflix ? "sb-af" : "",
        resolvit ? "sb-rv" : "",
        zyrion ? "sb-zy" : "",
        seguidores ? "sb-sg" : "",
        raiz ? "sb-mr" : "",
        holofote ? "sb-hf" : "",
        sim ? "sb-si" : "",
        pagatg ? "sb-pg" : "",
        outrolado ? "sb-ol" : "",
        habilidades ? "sb-hc" : "",
        presets ? "sb-p7" : "",
        instafan ? "sb-if" : "",
        seopack ? "sb-sp" : "",
        atlas ? "sb-at" : "",
        vslmilionario ? "sb-vm" : "",
        gatilhos ? "sb-gm" : "",
        corte ? "sb-ac" : "",
        viralpack ? "sb-vp" : "",
        consultoria ? "sb-cf" : "",
        diario ? "sb-dd" : "",
        grana ? "sb-gh" : "",
        universo ? "sb-uv" : "",
        pousada ? "sb-vv" : "",
        igreja ? "sb-cv" : "",
        saut ? "sb-sa" : "",
        sorveteria ? "sb-fr" : "",
        fundacao ? "sb-sv" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          ...themeVars(site.theme),
          ...(journal ? journalVars(site.theme) : {}),
          ...(portal ? portalVars(site.theme) : {}),
          ...(central ? centralVars(site.theme) : {}),
          ...(market ? marketplaceVars(site.theme) : {}),
          ...(margem ? margemVars(site.theme) : {}),
          ...(patrimonial ? patrimonialVars(site.theme) : {}),
          ...(motorista ? motoristaVars(site.theme) : {}),
          ...(areaflix ? areaflixVars(site.theme) : {}),
          ...(resolvit ? resolvitVars(site.theme) : {}),
          ...(zyrion ? zyrionVars(site.theme) : {}),
          ...(seguidores ? seguidoresVars(site.theme) : {}),
          ...(raiz ? raizVars(site.theme) : {}),
          ...(holofote ? holofoteVars(site.theme) : {}),
          ...(sim ? simVars(site.theme) : {}),
          ...(pagatg ? pagatgVars(site.theme) : {}),
          ...(outrolado ? outroladoVars(site.theme) : {}),
          ...(habilidades ? habilidadesVars(site.theme) : {}),
          ...(presets ? presetsVars(site.theme) : {}),
          ...(instafan ? instafanVars(site.theme) : {}),
          ...(seopack ? seopackVars(site.theme) : {}),
          ...(atlas ? atlasVars(site.theme) : {}),
          ...(vslmilionario ? vslmilionarioVars(site.theme) : {}),
          ...(gatilhos ? gatilhosVars(site.theme) : {}),
          ...(corte ? corteVars(site.theme) : {}),
          ...(viralpack ? viralpackVars(site.theme) : {}),
          ...(consultoria ? consultoriaVars(site.theme) : {}),
          ...(diario ? diarioVars(site.theme) : {}),
          ...(grana ? granaVars(site.theme) : {}),
          ...(universo ? universoVars(site.theme) : {}),
          ...(pousada ? pousadaVars(site.theme) : {}),
          ...(igreja ? igrejaVars(site.theme) : {}),
          ...(saut ? sautVars(site.theme) : {}),
          ...(sorveteria ? sorveteriaVars(site.theme) : {}),
          ...(fundacao ? fundacaoVars(site.theme) : {}),
        } as CSSProperties
      }
    >
      {thumbnail ? (
        <>
          {/* Miniatura: o CSS base e o da variante vão em <style href precedence>, que o React coloca uma vez só
              no documento mesmo com dezenas de miniaturas (antes cada cartão carregava ~70 KB do mesmo CSS). */}
          <style href="sb-base" precedence="sb">
            {siteCss}
          </style>
          {variantCss ? (
            <style href={`sb-v-${cssKey(variantCss)}`} precedence="sb">
              {variantCss}
            </style>
          ) : null}
          {fontFaces ? <style>{fontFaces}</style> : null}
        </>
      ) : (
        <style>{fontFaces + siteCss + variantCss}</style>
      )}
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

/**
 * Tipos de bloco retirados de propósito. Sites criados antes da remoção ainda guardam o bloco nos dados;
 * em vez de "Bloco desconhecido" no editor, ele simplesmente não aparece (e some do site publicado).
 */
const REMOVED_BLOCK_TYPES = new Set(["atChat"]);

function renderBlocks(blocks: Block[], ctx: RenderContext): ReactNode {
  return blocks.map(block => {
    if (block.hidden) return null;
    const def = getBlockDefinition(block.type);
    if (!def) {
      if (REMOVED_BLOCK_TYPES.has(block.type)) return null;
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
    const {
      translate: blockShift,
      height: blockHeight,
      hoverBackground,
      hoverBorderColor,
      hoverColor,
      ...blockStyle
    } = cleanStyle(block.style) ?? {};
    const blockHover = hoverCss(
      `[data-block-id="${block.id.replace(/["<>]/g, "")}"]`,
      { hoverBackground, hoverBorderColor, hoverColor } as Record<
        string,
        string | number
      >
    );
    // Altura do bloco é mínima: se um elemento de dentro crescer, o bloco cresce junto e empurra os
    // de baixo, em vez de o conteúdo vazar por cima do bloco seguinte.
    if (blockHeight !== undefined) {
      (blockStyle as CSSProperties).minHeight = blockHeight;
    }
    return (
      <div
        className="sb-block"
        data-block-id={block.id}
        data-block-type={block.type}
        data-fx={fxData.length ? JSON.stringify(fxData) : undefined}
        id={
          block.anchor && BLOCK_ANCHOR.test(block.anchor)
            ? block.anchor
            : undefined
        }
        key={block.id}
        style={blockStyle as CSSProperties}
      >
        {def.render(block.props, ctx, children)}
        {block.elStyles ? (
          <style>{elementStylesCss(block.id, block.elStyles)}</style>
        ) : null}
        {fxStyles ? <style>{fxStyles}</style> : null}
        {blockHover ? <style>{blockHover}</style> : null}
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
