/**
 * Formas orgânicas (blobs) da variante `fundacao`, **desenhadas aqui** — nada vem do tema comercial da referência.
 * Cada blob é uma curva fechada gerada de pontos em volta de um círculo (raio sorteado por uma semente fixa, então o
 * resultado é sempre o mesmo) e suavizada com Catmull-Rom → Bézier. Coordenadas em um quadro de 200 × 200.
 *
 * Usos (CSS em `renderer/fundacao.ts`): atrás dos cartões de atuação, no "quem somos", nas faixas verdes, no rodapé,
 * no rótulo da foto e como recorte da foto da doação (`mask-image`). Arquivo sem imports: o CSS e os blocos o leem.
 */

/** Gerador pseudoaleatório pequeno e determinístico (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n1 = (v: number) => Math.round(v * 10) / 10;

/** Caminho SVG (`d`) de um blob de `points` pontos; `spread` (0–1) é o quanto o raio varia. */
export function blobPath(seed: number, points = 8, spread = 0.28): string {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = 100 * (0.62 + rand() * spread + (1 - spread) * 0.18);
    pts.push([
      100 + Math.cos(angle) * r * 0.92,
      100 + Math.sin(angle) * r * 0.92,
    ]);
  }
  const at = (i: number) => pts[(i + points) % points] as [number, number];
  let d = `M${n1(at(0)[0])},${n1(at(0)[1])}`;
  for (let i = 0; i < points; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: [number, number] = [
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
    ];
    const c2: [number, number] = [
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
    ];
    d += `C${n1(c1[0])},${n1(c1[1])},${n1(c2[0])},${n1(c2[1])},${n1(p2[0])},${n1(p2[1])}`;
  }
  return `${d}Z`;
}

/** As quatro formas da variante. */
export const BLOBS = [
  blobPath(7, 8, 0.3),
  blobPath(23, 7, 0.32),
  blobPath(41, 9, 0.26),
  blobPath(58, 8, 0.34),
] as const;

/** Blob como imagem de fundo (`data:` sem `;` — o `cssUrl` recusa ponto e vírgula). */
export function blobUri(index: number, fill: string): string {
  const d = BLOBS[((index % BLOBS.length) + BLOBS.length) % BLOBS.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="${d}" fill="${fill}"/></svg>`
  )}`;
}

/** Blob preto, para `mask-image` (recorta a foto da doação no formato da forma). */
export const BLOB_MASK = blobUri(2, "#000");
