import { type Site, SiteRenderer, thumbnailSite } from "@repo/site-builder";
import { Suspense } from "react";
import { StaticThumb } from "./StaticThumb";

/** Blocos da página inicial por cartão: o cartão (~190 px de altura, site reduzido a ~30%) mostra ~800 px do topo. */
const THUMB_BLOCKS = 3;

async function SiteThumbContent({
  contents,
  siteId,
}: {
  contents: Promise<Map<string, Site>>;
  siteId: string;
}) {
  const site = (await contents).get(siteId);
  if (!site) return null;
  return (
    <StaticThumb>
      <SiteRenderer
        path="/"
        site={thumbnailSite(site, THUMB_BLOCKS)}
        skipFonts
        skipFxRuntime
        thumbnail
      />
    </StaticThumb>
  );
}

/**
 * Miniatura de um site de "Meus sites", carregada **depois** da página (streaming): o cartão aparece na hora com a
 * cor de fundo do site e a miniatura entra quando o conteúdo chega. Sem fontes do Google (ver `skipFonts`).
 */
export function SiteThumb(props: {
  contents: Promise<Map<string, Site>>;
  siteId: string;
}) {
  return (
    <Suspense fallback={null}>
      <SiteThumbContent {...props} />
    </Suspense>
  );
}
