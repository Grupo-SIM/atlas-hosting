import type { FieldMatch } from "./Inspector.js";

/** O que o Delete apaga: o bloco inteiro, um item de uma lista do bloco, ou só o elemento selecionado (oculto). */
export type DeleteTarget =
  | { kind: "block" }
  | { index: number; key: string; kind: "listItem" }
  | { kind: "hide"; path: string };

/**
 * Decide o que excluir. Sem elemento selecionado, é o bloco. Com um elemento selecionado, só ele: se ele é um item
 * inteiro de uma lista do bloco (um link do menu, um ícone de rede social, um card), o item sai da lista — assim os
 * outros itens não mudam de lugar; qualquer outro elemento (título, texto, imagem, botão) fica oculto, só ele.
 *
 * "Item inteiro" = o elemento é um dos irmãos que o bloco repete: tantos irmãos quantos itens na lista, e ele na
 * mesma posição do item que o clique achou. Um trecho de dentro do item (o título de um card) não conta: some só ele.
 */
export function deleteTargetFor(input: {
  elPath: string;
  /** Campos que o clique achou para o elemento (`matchItem`). */
  matches: FieldMatch[];
  /** Tamanho atual de uma lista do bloco. */
  listLength: (key: string) => number;
  /** Quantos irmãos o elemento tem (contando ele) e em que posição ele está (a partir de 0). */
  siblings: number;
  position: number;
}): DeleteTarget {
  const { elPath, listLength, matches, position, siblings } = input;
  if (!elPath) return { kind: "block" };
  const items = new Map<string, { index: number; key: string }>();
  for (const m of matches)
    if (m.kind === "item")
      items.set(`${m.field.key}#${m.index}`, {
        index: m.index,
        key: m.field.key,
      });
  if (items.size === 1) {
    const [item] = items.values();
    if (
      item &&
      listLength(item.key) === siblings &&
      siblings > 0 &&
      item.index === position
    )
      return { index: item.index, key: item.key, kind: "listItem" };
  }
  return { kind: "hide", path: elPath };
}
