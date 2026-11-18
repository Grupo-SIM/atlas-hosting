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

const shape = (
  type: string,
  label: string,
  kind: "circle" | "line" | "rect" | "square"
) =>
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
          <div className={`sb-fig sb-fig-${kind}`} />
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
];
