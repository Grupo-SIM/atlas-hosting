import type { z } from "zod";
import type { BlockDefinition, BlockSpec } from "./types.js";

/**
 * Liga schema → render. As props salvas são validadas na hora de renderizar;
 * dados inválidos/antigos caem nos defaults do schema em vez de quebrar a página.
 */
export function defineBlock<S extends z.ZodTypeAny>(
  schema: S,
  spec: BlockSpec<S>
): BlockDefinition {
  const defaults = schema.parse({}) as Record<string, unknown>;
  return {
    defaults,
    fields: spec.fields,
    group: spec.group,
    label: spec.label,
    render: (props, ctx, children) => {
      const parsed = schema.safeParse(props);
      return spec.render(
        (parsed.success ? parsed.data : defaults) as z.infer<S>,
        ctx,
        children
      );
    },
    type: spec.type,
  };
}
