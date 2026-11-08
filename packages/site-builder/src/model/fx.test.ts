import { describe, expect, test } from "bun:test";
import { cleanFx, fxCss, HOVER_EFFECTS, HOVER_LABELS, HOVER_MS } from "./fx.js";

describe("hover", () => {
  test("todo tipo de hover tem rótulo e gera CSS de :hover", () => {
    for (const hover of HOVER_EFFECTS) {
      expect(HOVER_LABELS[hover]).toBeTruthy();
      expect(fxCss("b1", { "": { hover } })).toContain(
        '[data-block-id="b1"]:hover{'
      );
    }
  });

  test("usa a duração escolhida (padrão 300 ms)", () => {
    expect(fxCss("b1", { "": { hover: "grow" } })).toContain(
      `transition:scale ${HOVER_MS.default}ms ease`
    );
    expect(fxCss("b1", { "": { hover: "lift", hoverMs: 800 } })).toContain(
      "transition:translate 800ms ease"
    );
    expect(fxCss("b1", { "": { hover: "pop", hoverMs: 600 } })).toContain(
      "animation:sb-fx-pop 600ms"
    );
  });

  test("duração fora dos limites é descartada", () => {
    expect(cleanFx({ hover: "grow", hoverMs: 99_999 })).toBeUndefined();
    expect(cleanFx({ hover: "grow", hoverMs: 500 })).toEqual({
      hover: "grow",
      hoverMs: 500,
    });
  });

  test("entrada em sequência mantém a transição do hover em cada item", () => {
    const css = fxCss("b1", {
      "": {
        each: true,
        enter: "fadeInUp",
        hover: "shadow",
        hoverMs: 450,
        stagger: 100,
      },
    });
    expect(css).toContain(">:nth-child(2){transition:opacity .8s ease 100ms");
    expect(css).toContain(",box-shadow 450ms ease}");
  });
});
