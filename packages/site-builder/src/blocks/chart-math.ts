/** Contas dos gráficos e da tabela (sem React, para poder testar). */

export interface Slice {
  /** Começo da fatia, em % do círculo. */
  from: number;
  /** Tamanho da fatia, em % do círculo. */
  pct: number;
}

/** Fatias de uma pizza/rosca: cada valor vira a sua % do total; valores negativos ou zerados somem. */
export function slices(values: number[]): Slice[] {
  const clean = values.map(v => (Number.isFinite(v) && v > 0 ? v : 0));
  const total = clean.reduce((a, b) => a + b, 0);
  let from = 0;
  return clean.map(v => {
    const pct = total > 0 ? (v / total) * 100 : 0;
    const s = { from, pct };
    from += pct;
    return s;
  });
}

/** Pontos da linha (x e y em unidades do desenho); o maior valor fica no topo e o 0 na base. */
export function linePoints(
  values: number[],
  width: number,
  height: number,
  pad: number
): { x: number; y: number }[] {
  const max =
    Math.max(...values.map(v => (Number.isFinite(v) ? v : 0)), 0) || 1;
  const n = values.length;
  return values.map((v, i) => ({
    x: n === 1 ? width / 2 : pad + (i * (width - 2 * pad)) / (n - 1),
    y:
      pad +
      (1 - Math.max(0, Number.isFinite(v) ? v : 0) / max) * (height - 2 * pad),
  }));
}

/** Altura (0–100%) de cada barra em relação à maior. */
export function barSizes(values: number[]): number[] {
  const max = Math.max(...values.map(v => (Number.isFinite(v) ? v : 0)), 0);
  return values.map(v =>
    max > 0 && Number.isFinite(v) && v > 0 ? (v / max) * 100 : 0
  );
}

/**
 * Texto de planilha → linhas e células. Aceita o que se cola do Excel/Google Planilhas (colunas separadas por
 * tab) e também `|`, `;` ou `,`. Linhas vazias são ignoradas.
 */
export function parseTable(text: string): string[][] {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trimEnd())
    .filter(l => l.trim() !== "");
  const sep = ["\t", "|", ";", ","].find(s => lines.some(l => l.includes(s)));
  return lines.map(l => (sep ? l.split(sep).map(c => c.trim()) : [l.trim()]));
}
