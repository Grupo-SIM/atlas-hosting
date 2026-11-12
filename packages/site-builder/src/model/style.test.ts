import { describe, expect, test } from "bun:test";
import { cleanStyle, elementStylesCss, hoverCss } from "./style.js";

describe("cores ao passar o mouse", () => {
  test("viram regra :hover e não entram no estilo inline do elemento", () => {
    const css = elementStylesCss("b1", {
      "1.2": { color: "#fff", hoverBackground: "#ff0000", hoverColor: "#000" },
    });
    expect(css).toContain(
      '[data-block-id="b1"]>:nth-child(1)>:nth-child(2){color:#fff!important}'
    );
    expect(css).toContain(
      '[data-block-id="b1"]>:nth-child(1)>:nth-child(2):hover{background:#ff0000!important;color:#000!important}'
    );
  });

  test("valor vazio ou suspeito é ignorado", () => {
    expect(hoverCss("x", { hoverColor: "" })).toBe("");
    expect(cleanStyle({ hoverColor: "red;}body{" })).toBeUndefined();
  });
});
