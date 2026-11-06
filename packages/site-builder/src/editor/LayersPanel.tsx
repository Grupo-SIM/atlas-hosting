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
import type { DropPlace, DropTarget } from "./tree.js";

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
  onInsert: (type: string, target: DropTarget) => void;
  onMove: (id: string, target: DropTarget) => void;
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
  onInsert,
  onMove,
  onSelect,
  onSelectElement,
  onToggleHidden,
  sections,
  selectedId,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);

  // Arrastar e soltar: `drag` = o que está sendo arrastado; `over` = linha/zona sob o ponteiro.
  const [drag, setDrag] = useState<{ id?: string; type?: string } | null>(null);
  const [over, setOver] = useState<{ key: string; place: DropPlace } | null>(
    null
  );
  const endDrag = () => {
    setDrag(null);
    setOver(null);
  };
  const drop = (target: DropTarget) => {
    if (drag?.id) onMove(drag.id, target);
    else if (drag?.type) onInsert(drag.type, target);
    endDrag();
  };

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
              drag?.id === b.id ? "dragging" : "",
              over?.key === b.id ? `drop-${over.place}` : "",
            ].join(" ")}
            draggable
            onClick={() => onSelect(b.id)}
            onDragEnd={endDrag}
            onDragOver={e => {
              if (!drag || drag.id === b.id) return;
              e.preventDefault();
              const r = e.currentTarget.getBoundingClientRect();
              const y = (e.clientY - r.top) / r.height;
              const place: DropPlace =
                Array.isArray(b.children) && y > 0.3 && y < 0.7
                  ? "inside"
                  : y < 0.5
                    ? "before"
                    : "after";
              if (over?.key !== b.id || over.place !== place)
                setOver({ key: b.id, place });
            }}
            onDragStart={e => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", b.id);
              setDrag({ id: b.id });
            }}
            onDrop={e => {
              e.preventDefault();
              if (over?.key === b.id) drop({ id: b.id, place: over.place });
              else endDrag();
            }}
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
            {/* biome-ignore lint/a11y/noStaticElementInteractions: título da seção também recebe blocos soltos */}
            <div
              className={
                over?.key === `start:${section.key}`
                  ? "sbe-layer group drop-after"
                  : "sbe-layer group"
              }
              onDragOver={e => {
                if (!drag) return;
                e.preventDefault();
                if (over?.key !== `start:${section.key}`)
                  setOver({ key: `start:${section.key}`, place: "after" });
              }}
              onDrop={e => {
                e.preventDefault();
                drop({ end: false, root: section.key });
              }}
            >
              <span className="gap" />
              <span className="ico">
                <Icon name="file" size={13} />
              </span>
              <span className="name">{section.label}</span>
            </div>
            {rows(section.blocks, 1)}
            {drag ? (
              // biome-ignore lint/a11y/noStaticElementInteractions: zona para soltar no fim da seção
              <div
                className={
                  over?.key === `end:${section.key}`
                    ? "sbe-dropend over"
                    : "sbe-dropend"
                }
                onDragOver={e => {
                  e.preventDefault();
                  if (over?.key !== `end:${section.key}`)
                    setOver({ key: `end:${section.key}`, place: "after" });
                }}
                onDrop={e => {
                  e.preventDefault();
                  drop({ end: true, root: section.key });
                }}
              />
            ) : null}
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
                        draggable
                        key={d.type}
                        onClick={() => {
                          onAdd(d.type);
                          setAdding(false);
                        }}
                        onDragEnd={endDrag}
                        onDragStart={e => {
                          e.dataTransfer.effectAllowed = "copy";
                          e.dataTransfer.setData("text/plain", d.type);
                          setDrag({ type: d.type });
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
