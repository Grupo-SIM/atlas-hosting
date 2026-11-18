import { z } from "zod";
import { defineBlock } from "./define.js";

/**
 * Formas soltas na página: linha, retângulo, quadrado e círculo. A cor, a borda, o arredondamento, a sombra e o
 * tamanho vêm do estilo do elemento (os mesmos controles de qualquer caixa); aqui fica só o formato e o
 * alinhamento. O CSS de cada formato está em `renderer/styles.ts` (`.sb-fig`).
 */
const ALIGN = ["left", "center", "right"] as const;
const JUSTIFY = {
  center: "center",
  left: "flex-start",
  right: "flex-end",
} as const;

type ShapeKind =
  | "arrow"
  | "circle"
  | "cross"
  | "diamond"
  | "hexagon"
  | "line"
  | "pentagon"
  | "rect"
  | "square"
  | "star"
  | "triangle";

/** Formas de lados iguais: o arrasto mantém largura e altura iguais. */
const EQUAL = new Set<ShapeKind>([
  "arrow",
  "circle",
  "cross",
  "diamond",
  "hexagon",
  "pentagon",
  "square",
  "star",
  "triangle",
]);

const shape = (type: string, label: string, kind: ShapeKind) =>
  defineBlock(
    z.object({
      align: z
        .enum(ALIGN)
        .default(kind === "line" ? "center" : "left")
        .catch("left"),
    }),
    {
      fields: [
        {
          key: "align",
          kind: "select",
          label: "Alinhamento na página",
          options: [
            { label: "Esquerda", value: "left" },
            { label: "Centro", value: "center" },
            { label: "Direita", value: "right" },
          ],
        },
      ],
      group: "shapes",
      label,
      render: p => (
        <div
          className="sb-container sb-fig-wrap"
          style={{ justifyContent: JUSTIFY[p.align] }}
        >
          <div
            className={`sb-fig sb-fig-${kind}${EQUAL.has(kind) ? "sb-fig-eq" : ""}`}
          />
        </div>
      ),
      type,
    }
  );

export const shapeBlocks = [
  shape("shapeLine", "Linha", "line"),
  shape("shapeRect", "Retângulo", "rect"),
  shape("shapeSquare", "Quadrado", "square"),
  shape("shapeCircle", "Círculo", "circle"),
  shape("shapeTriangle", "Triângulo", "triangle"),
  shape("shapeDiamond", "Losango", "diamond"),
  shape("shapePentagon", "Pentágono", "pentagon"),
  shape("shapeHexagon", "Hexágono", "hexagon"),
  shape("shapeStar", "Estrela", "star"),
  shape("shapeArrow", "Seta", "arrow"),
  shape("shapeCross", "Cruz", "cross"),
];
