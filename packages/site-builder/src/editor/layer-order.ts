/** Mudanças de camada que o editor oferece (como no Figma). */
export type LayerOp = "back" | "backward" | "forward" | "front";

export const LAYER_OPS: { label: string; op: LayerOp }[] = [
  { label: "Trazer para frente", op: "front" },
  { label: "Avançar", op: "forward" },
  { label: "Recuar", op: "backward" },
  { label: "Enviar para trás", op: "back" },
];

/**
 * Nova ordem das camadas depois de `op` no item `target`. A lista vai de baixo (atrás) para cima (na frente).
 * Devolve a mesma lista quando nada muda (já está na frente, ou `target` não está nela).
 */
export function reorderLayers(
  order: string[],
  target: string,
  op: LayerOp
): string[] {
  const i = order.indexOf(target);
  if (i < 0) return order;
  const rest = order.filter(x => x !== target);
  const to =
    op === "front"
      ? order.length - 1
      : op === "back"
        ? 0
        : op === "forward"
          ? Math.min(order.length - 1, i + 1)
          : Math.max(0, i - 1);
  if (to === i) return order;
  rest.splice(to, 0, target);
  return rest;
}
