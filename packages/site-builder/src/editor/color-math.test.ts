import { describe, expect, test } from "bun:test";
import { hexToHsv, hsvToHex, normalizeHex } from "./color-math.js";

describe("color-math", () => {
  test("normaliza #rgb, sem # e maiúsculas; recusa lixo", () => {
    expect(normalizeHex("#FFF")).toBe("#ffffff");
    expect(normalizeHex("ff0000")).toBe("#ff0000");
    expect(normalizeHex(" #1A2b3C ")).toBe("#1a2b3c");
    expect(normalizeHex("#12")).toBeUndefined();
    expect(normalizeHex("vermelho")).toBeUndefined();
  });

  test("hex → HSV nas cores conhecidas", () => {
    expect(hexToHsv("#ff0000")).toEqual({ h: 0, s: 1, v: 1 });
    expect(hexToHsv("#00ff00").h).toBe(120);
    expect(hexToHsv("#0000ff").h).toBe(240);
    expect(hexToHsv("#ffffff")).toEqual({ h: 0, s: 0, v: 1 });
    expect(hexToHsv("#000000")).toEqual({ h: 0, s: 0, v: 0 });
  });

  test("HSV → hex e a volta não muda a cor", () => {
    expect(hsvToHex({ h: 0, s: 1, v: 1 })).toBe("#ff0000");
    expect(hsvToHex({ h: 120, s: 1, v: 0.5 })).toBe("#008000");
    for (const hex of ["#ff00aa", "#3b82f6", "#1d1c1a", "#fde047", "#808080"]) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    }
  });
});
