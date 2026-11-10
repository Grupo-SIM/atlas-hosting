import { describe, expect, test } from "bun:test";
import {
  cleanFx,
  ENTER_EFFECTS,
  ENTER_LABELS,
  fxCss,
  fxRuntimeData,
  HOVER_EFFECTS,
  HOVER_LABELS,
  HOVER_MS,
} from "./fx.js";

describe("entrada", () => {
  test("todo tipo de entrada tem rótulo e estado inicial com .sb-js", () => {
    for (const enter of ENTER_EFFECTS) {
      expect(ENTER_LABELS[enter]).toBeTruthy();
      expect(fxCss("b1", { "": { enter } })).toContain(
        '.sb-js [data-block-id="b1"]:not(.sb-in){'
      );
      if (enter !== "slideInUp")
        expect(fxCss("b1", { "": { enter } })).toContain(
          ":not(.sb-in){opacity:0"
        );
    }
    expect(fxCss("b1", { "": { enter: "rotateIn" } })).toContain(
      "transform:rotate(-200deg)"
    );
  });
});

describe("seguir o mouse", () => {
  test("vai para o script com a força escolhida; 0 ou fora dos limites some", () => {
    expect(fxRuntimeData({ "1.2": { mouse: -3 } })).toEqual([
      { m: -3, p: "1.2" },
    ]);
    expect(cleanFx({ mouse: 0 })).toBeUndefined();
    expect(cleanFx({ mouse: 11 })).toBeUndefined();
  });
});

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
    expect(fxCss("b1", { "": { hover: "push" } })).toContain(
      "animation:sb-fx-push 300ms"
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

describe("duração e atraso da entrada", () => {
  test("enterMs troca a duração padrão (.8s) e vale também na sequência", () => {
    const base = fxCss("b1", { "": { delay: 200, enter: "fadeInUp" } });
    expect(base).toContain("opacity .8s ease 200ms");
    const css = fxCss("b1", {
      "": {
        delay: 100,
        each: true,
        enter: "fadeInLeft",
        enterMs: 1250,
        stagger: 100,
      },
    });
    expect(css).toContain(
      "opacity 1250ms ease 100ms,transform 1250ms ease 100ms"
    );
    expect(css).toContain(
      ">:nth-child(3){transition:opacity 1250ms ease 300ms"
    );
    expect(cleanFx({ enter: "fadeIn", enterMs: 100 })).toBeUndefined();
  });
});

describe("slideInUp e hang (efeitos do Elementor)", () => {
  test("slideInUp desliza de baixo, sem fade", () => {
    const css = fxCss("b1", {
      "": { delay: 50, enter: "slideInUp", enterMs: 1250 },
    });
    expect(css).toContain("visibility:hidden;transform:translate3d(0,100%,0)");
    expect(css).not.toContain("opacity");
    expect(css).toContain("transition:transform 1250ms ease 50ms");
    expect(
      fxCss("b1", { "": { each: true, enter: "slideInUp", stagger: 80 } })
    ).not.toContain("opacity");
  });

  test("hang afunda 8px (.3s) e balança (1.5s, infinito, alternado, com .3s de atraso)", () => {
    const css = fxCss("b1", { "": { hover: "hang" } });
    expect(css).toContain(
      "animation:sb-fx-hang-sink .3s ease-out 1 forwards,sb-fx-hang 1.5s ease-in-out .3s infinite alternate"
    );
    expect(css).toContain("prefers-reduced-motion:no-preference");
    expect(HOVER_LABELS.hang).toBe("Balançar");
  });
});
