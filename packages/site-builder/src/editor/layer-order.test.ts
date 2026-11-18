import { describe, expect, test } from "bun:test";
import { reorderLayers } from "./layer-order.js";

const stack = ["fundo", "foto", "texto"]; // de trás para a frente

describe("reorderLayers", () => {
  test("trazer para frente e enviar para trás", () => {
    expect(reorderLayers(stack, "fundo", "front")).toEqual([
      "foto",
      "texto",
      "fundo",
    ]);
    expect(reorderLayers(stack, "texto", "back")).toEqual([
      "texto",
      "fundo",
      "foto",
    ]);
  });

  test("avançar e recuar andam uma camada", () => {
    expect(reorderLayers(stack, "foto", "forward")).toEqual([
      "fundo",
      "texto",
      "foto",
    ]);
    expect(reorderLayers(stack, "foto", "backward")).toEqual([
      "foto",
      "fundo",
      "texto",
    ]);
  });

  test("nas pontas ou fora da lista nada muda", () => {
    expect(reorderLayers(stack, "texto", "front")).toBe(stack);
    expect(reorderLayers(stack, "fundo", "backward")).toBe(stack);
    expect(reorderLayers(stack, "nada", "front")).toBe(stack);
  });
});
