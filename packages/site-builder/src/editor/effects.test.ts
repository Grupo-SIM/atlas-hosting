import { describe, expect, test } from "bun:test";
import {
  formatShadow,
  parseShadow,
  presetOf,
  SHADOW_PRESETS,
} from "./effects.js";

describe("sombras", () => {
  test("monta o CSS da caixa e do texto (sem espalhamento)", () => {
    const s = {
      alpha: 0.25,
      blur: 24,
      color: "#112233",
      spread: 2,
      x: 0,
      y: 10,
    };
    expect(formatShadow(s)).toBe("0px 10px 24px 2px rgba(17,34,51,0.25)");
    expect(formatShadow(s, true)).toBe("0px 10px 24px rgba(17,34,51,0.25)");
  });

  test("lê de volta o que montou", () => {
    const s = {
      alpha: 0.4,
      blur: 44,
      color: "#000000",
      spread: 0,
      x: 3,
      y: -4,
    };
    expect(parseShadow(formatShadow(s))).toEqual(s);
    expect(parseShadow(formatShadow(s, true))).toEqual(s);
  });

  test("sombra escrita à mão não é lida", () => {
    expect(parseShadow("0 0 5px red")).toBeNull();
    expect(parseShadow(undefined)).toBeNull();
  });

  test("reconhece as predefinições", () => {
    for (const p of SHADOW_PRESETS) {
      if (p.shadow) expect(presetOf(formatShadow(p.shadow))).toBe(p.id);
    }
    expect(presetOf(undefined)).toBe("none");
    expect(presetOf("1px 1px 1px rgba(0,0,0,0.5)")).toBe("custom");
  });
});
