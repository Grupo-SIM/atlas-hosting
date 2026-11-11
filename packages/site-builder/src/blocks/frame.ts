import type { CSSProperties } from "react";
import type { RenderContext } from "./types.js";

const YOUTUBE_ID =
  /(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/|[?&]v=)([\w-]{11})/;

/**
 * Props de `src` de um iframe (vídeo do YouTube/Vimeo, site incorporado). Na miniatura
 * (`ctx.thumbnail`) o iframe fica sem `src` — vira `about:blank`, sem player, JS nem rede — e mostra a
 * capa do vídeo do YouTube (ou fundo preto) no lugar. O elemento continua lá para o CSS do template
 * posicionar o quadro igual. Uma galeria com 30 miniaturas chegava a ter 15 players, alguns em autoplay.
 */
export function frameProps(
  ctx: Pick<RenderContext, "thumbnail">,
  src: string,
  style?: CSSProperties
): { src?: string; style?: CSSProperties; tabIndex?: number } {
  if (!ctx.thumbnail) return { src, style };
  const id = YOUTUBE_ID.exec(src)?.[1];
  return {
    style: {
      ...style,
      background: id
        ? `#000 url("https://i.ytimg.com/vi/${id}/hqdefault.jpg") center / cover no-repeat`
        : "#000",
    },
    tabIndex: -1,
  };
}
