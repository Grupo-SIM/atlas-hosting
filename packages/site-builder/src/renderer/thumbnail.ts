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

/**
 * Impressão digital do que a miniatura mostra (o site já enxuto por `thumbnailSite`). A galeria usa para saber se a
 * imagem pré-gerada de um template ainda vale: mudou o template, o hash muda e a tela volta à miniatura ao vivo.
 * FNV-1a em duas passadas (52 bits): serve para detectar mudança, não é criptográfico.
 */
export function thumbnailHash(site: Site): string {
  const text = JSON.stringify(thumbnailSite(site));
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b + c, 0x85ebca6b) ^ (b >>> 13);
  }
  return `${(a >>> 0).toString(36)}${(b >>> 0).toString(36)}`;
}
