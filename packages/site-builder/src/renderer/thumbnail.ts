import type { Site } from "../model/index.js";

/** Blocos da página inicial que a miniatura mantém: o resto fica abaixo da área visível do cartão. */
const THUMB_BLOCKS = 4;

/**
 * Versão enxuta de um site para a miniatura dos cartões (galeria de templates e "Meus sites"): só a página
 * inicial, com o cabeçalho e os primeiros blocos. O cartão mostra o topo do site (4:3 num site de 1280 px =
 * ~960 px de altura) e não rola, então o resto só serviria para baixar imagens, fontes e HTML que ninguém vê.
 * Não altera o site original.
 */
export function thumbnailSite(site: Site, blocks = THUMB_BLOCKS): Site {
  const home = site.pages.find(p => p.slug === "");
  if (!home) return site;
  return {
    ...site,
    footer: [],
    pages: [{ ...home, blocks: home.blocks.slice(0, blocks) }],
  };
}
