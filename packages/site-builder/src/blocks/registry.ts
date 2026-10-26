import type { Block } from "../model/index.js";
import { blockDefinitions } from "./definitions.js";
import type { BlockDefinition } from "./types.js";

const byType = new Map(blockDefinitions.map(d => [d.type, d]));

export const getBlockDefinition = (type: string): BlockDefinition | undefined =>
  byType.get(type);

export const listBlockDefinitions = (): BlockDefinition[] => blockDefinitions;

let counter = 0;
export const newBlockId = () =>
  `b_${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Bloco novo com os defaults do schema — usado pelo "adicionar bloco" do editor. */
export function createBlock(type: string): Block {
  const def = byType.get(type);
  if (!def) throw new Error(`Bloco desconhecido: ${type}`);
  return { id: newBlockId(), props: { ...def.defaults }, type };
}
