"use client";

import { type ReactNode, useState } from "react";
import {
  getBlockDefinition,
  listBlockDefinitions,
} from "../blocks/registry.js";
import type { BlockGroup } from "../blocks/types.js";
import type { Block } from "../model/index.js";
import type { ElementNode } from "./dom-tree.js";
import { Icon } from "./icons.js";

const GROUP_LABEL: Record<BlockGroup, string> = {
  blog: "Blog",
  content: "Conteúdo",
  layout: "Estrutura",
  media: "Mídia",
};

export interface LayerSection {
  blocks: Block[];
  key: string;
  label: string;
}

interface Props {
  elPath: string;
  getElements: (blockId: string) => ElementNode[];
  onAdd: (type: string) => void;
  onSelect: (id: string) => void;
  onSelectElement: (blockId: string, path: string, label: string) => void;
  onToggleHidden: (id: string) => void;
  sections: LayerSection[];
  selectedId: string | null;
}

/** Árvore de blocos da página aberta (cabeçalho, conteúdo e rodapé), como as camadas do protótipo. */
export function LayersPanel({
  elPath,
  getElements,
  onAdd,
  onSelect,
  onSelectElement,
  onToggleHidden,
  sections,
  selectedId,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);

  const toggle = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

  const elementRows = (
    blockId: string,
    nodes: ElementNode[],
    depth: number
  ): ReactNode =>
    nodes.map(n => {
      const key = `${blockId}:${n.path}`;
      const closed = collapsed[key];
      return (
        <div key={n.path}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: linha clicável da árvore */}
          <div
            className={
              selectedId === blockId && elPath === n.path
                ? "sbe-layer el on"
                : "sbe-layer el"
            }
            onClick={() => onSelectElement(blockId, n.path, n.label)}
            style={{ paddingLeft: 6 + depth * 14 }}
          >
            {n.children.length ? (
              <button
                className="eye"
                onClick={e => {
                  e.stopPropagation();
                  toggle(key);
                }}
                style={{ color: "#9a968e" }}
                type="button"
              >
                <Icon
                  name={closed ? "chevron-right" : "chevron-down"}
                  size={12}
                />
              </button>
            ) : (
              <span className="gap" />
            )}
            <span className="ico">
              <Icon name="box" size={11} />
            </span>
            <span className="name">{n.label}</span>
          </div>
          {n.children.length && !closed
            ? elementRows(blockId, n.children, depth + 1)
            : null}
        </div>
      );
    });

  const rows = (blocks: Block[], depth: number) =>
    blocks.map(b => {
      const elements = b.hidden ? [] : getElements(b.id);
      const kids = (b.children?.length ?? 0) + elements.length;
      // Só o bloco selecionado abre sozinho; os demais abrem pelo chevron.
      const closed = collapsed[b.id] ?? selectedId !== b.id;
      return (
        <div key={b.id}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: linha clicável da árvore */}
          <div
            className={[
              "sbe-layer",
              selectedId === b.id ? "on" : "",
              b.hidden ? "off" : "",
            ].join(" ")}
            onClick={() => onSelect(b.id)}
            style={{ paddingLeft: 6 + depth * 14 }}
          >
            {kids ? (
              <button
                className="eye"
                onClick={e => {
                  e.stopPropagation();
                  toggle(b.id);
                }}
                style={{ color: "#9a968e" }}
                type="button"
              >
                <Icon
                  name={closed ? "chevron-right" : "chevron-down"}
                  size={12}
                />
              </button>
            ) : (
              <span className="gap" />
            )}
            <span className="ico">
              <Icon name="box" size={13} />
            </span>
            <span className="name">
              {getBlockDefinition(b.type)?.label ?? b.type}
            </span>
            <button
              className={b.hidden ? "eye off" : "eye"}
              onClick={e => {
                e.stopPropagation();
                onToggleHidden(b.id);
              }}
              title={b.hidden ? "Mostrar" : "Ocultar"}
              type="button"
            >
              <Icon name={b.hidden ? "eye-off" : "eye"} size={13} />
            </button>
          </div>
          {kids && !closed ? (
            <>
              {elementRows(b.id, elements, depth + 1)}
              {rows(b.children ?? [], depth + 1)}
            </>
          ) : null}
        </div>
      );
    });

  return (
    <div className="sbe-scroll">
      <div className="sbe-layers">
        {sections.map(section => (
          <div key={section.key}>
            <div className="sbe-layer group">
              <span className="gap" />
              <span className="ico">
                <Icon name="file" size={13} />
              </span>
              <span className="name">{section.label}</span>
            </div>
            {rows(section.blocks, 1)}
          </div>
        ))}
      </div>

      <div className="sbe-pad" style={{ paddingTop: 0 }}>
        <button
          className="sbe-btn round"
          onClick={() => setAdding(a => !a)}
          type="button"
        >
          <Icon name="plus" size={14} />
          Adicionar bloco
        </button>
        {adding
          ? (Object.keys(GROUP_LABEL) as BlockGroup[]).map(group => (
              <div key={group} style={{ display: "grid", gap: 6 }}>
                <h4 className="sbe-h">{GROUP_LABEL[group]}</h4>
                <div className="sbe-addgrid">
                  {listBlockDefinitions()
                    .filter(d => d.group === group)
                    .map(d => (
                      <button
                        key={d.type}
                        onClick={() => {
                          onAdd(d.type);
                          setAdding(false);
                        }}
                        type="button"
                      >
                        <Icon name="plus" size={13} />
                        {d.label}
                      </button>
                    ))}
                </div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
