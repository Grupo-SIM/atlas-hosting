import { describe, expect, test } from "bun:test";
import { barSizes, linePoints, parseTable, slices } from "./chart-math.js";

describe("chart-math", () => {
  test("fatias somam 100% e cada uma começa onde a anterior termina", () => {
    const s = slices([50, 30, 20]);
    expect(s.map(x => Math.round(x.pct))).toEqual([50, 30, 20]);
    expect(s[1]?.from).toBe(50);
    expect(s[2]?.from).toBe(80);
  });

  test("valores zerados, negativos e lixo não viram fatia", () => {
    expect(slices([10, 0, -5, Number.NaN]).map(x => x.pct)).toEqual([
      100, 0, 0, 0,
    ]);
    expect(slices([0, 0]).map(x => x.pct)).toEqual([0, 0]);
  });

  test("barras: a maior tem 100% e as outras são proporcionais", () => {
    expect(barSizes([40, 80, 20])).toEqual([50, 100, 25]);
    expect(barSizes([0, 0])).toEqual([0, 0]);
  });

  test("linha: o maior valor fica no topo e o primeiro ponto na margem", () => {
    const pts = linePoints([0, 50, 100], 300, 140, 14);
    expect(pts[0]).toEqual({ x: 14, y: 126 });
    expect(pts[2]).toEqual({ x: 286, y: 14 });
    expect(linePoints([5], 300, 140, 14)[0]?.x).toBe(150);
  });

  test("tabela: aceita tab (colar da planilha), |, ; e ,", () => {
    expect(parseTable("a\tb\nc\td")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
    expect(parseTable("a | b\n\nc | d")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
    expect(parseTable("a;b")).toEqual([["a", "b"]]);
    expect(parseTable("só uma coluna\noutra")).toEqual([
      ["só uma coluna"],
      ["outra"],
    ]);
  });
});
