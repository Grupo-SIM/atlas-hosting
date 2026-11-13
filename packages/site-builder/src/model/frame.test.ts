import { describe, expect, test } from "bun:test";
import { elementStylesCss, formatFrame, parseFrame } from "./style.js";

describe("enquadramento de imagem", () => {
  test("lê e limita zoom e posição", () => {
    expect(parseFrame("2.5 30 -40")).toEqual({ x: 30, y: -40, z: 2.5 });
    expect(parseFrame("9 500 -500")).toEqual({ x: 100, y: -100, z: 4 });
    expect(parseFrame(undefined)).toEqual({ x: 0, y: 0, z: 1 });
    expect(formatFrame({ x: 10.4, y: -3.6, z: 1.5 })).toBe("1.5 10 -4");
  });

  test("gera o CSS da imagem e corta no pai", () => {
    const css = elementStylesCss("b1", { "2.1": { frame: "2 50 0" } });
    expect(css).toContain('[data-block-id="b1"]>:nth-child(2)>:nth-child(1){');
    expect(css).toContain("object-fit:cover!important");
    expect(css).toContain("scale(2)");
    expect(css).toContain(
      '[data-block-id="b1"]>:nth-child(2){overflow:hidden!important}'
    );
  });

  test("sem zoom não corta o pai; valor inválido é ignorado", () => {
    expect(elementStylesCss("b1", { "1": { frame: "1 20 0" } })).not.toContain(
      "overflow"
    );
    expect(elementStylesCss("b1", { "1": { frame: "lixo" } })).toBe("");
  });
});
