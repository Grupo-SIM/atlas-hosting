import { describe, expect, test } from "bun:test";
import { parseCssColor } from "./live-colors.js";

describe("parseCssColor", () => {
  test("rgb e rgba do getComputedStyle", () => {
    expect(parseCssColor("rgb(185, 44, 33)")).toEqual({
      alpha: 1,
      hex: "#b92c21",
    });
    expect(parseCssColor("rgba(0, 0, 0, 0)")).toEqual({
      alpha: 0,
      hex: "#000000",
    });
    expect(parseCssColor("rgba(255, 255, 255, 0.5)")).toEqual({
      alpha: 0.5,
      hex: "#ffffff",
    });
    expect(parseCssColor("rgb(20 30 40 / 50%)")).toEqual({
      alpha: 0.5,
      hex: "#141e28",
    });
  });

  test("color(srgb …) que o navegador devolve para color-mix", () => {
    expect(parseCssColor("color(srgb 1 0 0 / 0.5)")).toEqual({
      alpha: 0.5,
      hex: "#ff0000",
    });
    expect(parseCssColor("color(srgb 0.2 0.4 0.6)")?.hex).toBe("#336699");
  });

  test("transparent e formato desconhecido", () => {
    expect(parseCssColor("transparent")?.alpha).toBe(0);
    expect(parseCssColor("oklch(0.5 0.1 20)")).toBeUndefined();
    expect(parseCssColor("")).toBeUndefined();
  });

  test("valores fora de 0–255 são limitados", () => {
    expect(parseCssColor("rgb(300, -5, 0)")?.hex).toBe("#ff0000");
  });
});
