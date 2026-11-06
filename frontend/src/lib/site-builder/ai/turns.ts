import type { Site } from "@repo/site-builder";

/**
 * Turno de chat em andamento. A ferramenta que o Claude chama chega por HTTP (rota `/ai/tool/<id>`),
 * então o turno vive num mapa em memória, em `globalThis` porque cada rota do Next pode ter seu
 * próprio módulo. Cada turno guarda o site "de trabalho" que as ferramentas vão alterando.
 */
export interface Turn {
  /** Fila: o Claude pode chamar ferramentas em paralelo, e cada uma parte do site da anterior. */
  chain: Promise<unknown>;
  /** Avisa o navegador (fluxo SSE/NDJSON do chat). */
  emit: (event: Record<string, unknown>) => void;
  site: Site;
  token: string;
  userId: string;
}

const g = globalThis as unknown as { __atlasAiTurns?: Map<string, Turn> };
g.__atlasAiTurns = g.__atlasAiTurns ?? new Map<string, Turn>();
export const turns: Map<string, Turn> = g.__atlasAiTurns;
