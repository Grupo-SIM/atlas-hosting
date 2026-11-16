import { describe, expect, test } from "bun:test";
import { coverCrop, ratioLabel } from "./ad-crop.js";

describe("coverCrop (object-fit: cover centralizado)", () => {
  test("mídia na mesma proporção do espaço: nada é cortado", () => {
    const c = coverCrop({ h: 300, w: 1940 }, { h: 150, w: 970 });
    expect(c.cuts).toBe("none");
    expect(c.visiblePercent).toBe(100);
  });

  test("foto 16:9 numa faixa larga 970×150: corta em cima e embaixo, fica ~27%", () => {
    const c = coverCrop({ h: 1080, w: 1920 }, { h: 150, w: 970 });
    expect(c.cuts).toBe("top-bottom");
    expect(c.rect.w).toBeCloseTo(1920, 3);
    expect(Math.round(c.rect.h)).toBe(297);
    expect(c.visiblePercent).toBe(27);
    // centralizado
    expect(Math.round(c.rect.y)).toBe(Math.round((1080 - c.rect.h) / 2));
  });

  test("foto 16:9 num quadrado 300×300: corta dos lados", () => {
    const c = coverCrop({ h: 1080, w: 1920 }, { h: 300, w: 300 });
    expect(c.cuts).toBe("sides");
    expect(Math.round(c.rect.w)).toBe(1080);
    expect(c.visiblePercent).toBe(56);
  });

  test("foto vertical numa coluna alta 300×600 quase não corta", () => {
    const c = coverCrop({ h: 1200, w: 600 }, { h: 600, w: 300 });
    expect(c.cuts).toBe("none");
  });
});

describe("ratioLabel", () => {
  test("proporção legível", () => {
    expect(ratioLabel(970, 150)).toBe("6,5 : 1");
    expect(ratioLabel(300, 300)).toBe("1 : 1");
    expect(ratioLabel(300, 600)).toBe("0,5 : 1");
  });
});
