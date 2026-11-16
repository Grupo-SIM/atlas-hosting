/**
 * Como uma mídia aparece num espaço de anúncio: o site usa `object-fit: cover` centralizado (`.sb-ad-item` em
 * `renderer/styles.ts`), ou seja, a mídia preenche o espaço inteiro e o que passar das bordas é cortado.
 */
export interface CoverCrop {
  /** A mídia é mais larga que o espaço (corta dos lados), mais alta (corta em cima e embaixo) ou já tem a proporção. */
  cuts: "none" | "sides" | "top-bottom";
  /** Parte visível, em % da mídia (0–100). */
  visiblePercent: number;
  /** Área visível dentro da mídia, em pixels da mídia. */
  rect: { h: number; w: number; x: number; y: number };
}

export function coverCrop(
  media: { h: number; w: number },
  box: { h: number; w: number }
): CoverCrop {
  const scale = Math.max(box.w / media.w, box.h / media.h);
  const w = Math.min(media.w, box.w / scale);
  const h = Math.min(media.h, box.h / scale);
  const x = (media.w - w) / 2;
  const y = (media.h - h) / 2;
  const mediaRatio = media.w / media.h;
  const boxRatio = box.w / box.h;
  const same = Math.abs(mediaRatio - boxRatio) / boxRatio < 0.01;
  return {
    cuts: same ? "none" : mediaRatio > boxRatio ? "sides" : "top-bottom",
    rect: { h, w, x, y },
    visiblePercent: Math.round(((w * h) / (media.w * media.h)) * 100),
  };
}

/** "6,5 : 1", "1 : 1", "1,2 : 1" — proporção do espaço, para a pessoa entender o formato. */
export function ratioLabel(w: number, h: number): string {
  const r = w / h;
  const n = Math.round(r * 10) / 10;
  return `${String(n).replace(".", ",")} : 1`;
}
