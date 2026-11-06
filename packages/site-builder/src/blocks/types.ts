import type { ReactNode } from "react";
import type { z } from "zod";
import type { Block, Category, Post, Site } from "../model/index.js";

export interface RenderContext {
  /** Post/categoria da rota atual — usados pelos blocos de layout. */
  current: { category?: Category; post?: Post };
  /** Prefixo das URLs internas (ex.: `/criador-de-sites/preview/spyhacker`). */
  basePath: string;
  mode: "edit" | "view";
  query: Record<string, string>;
  renderBlocks: (blocks: Block[]) => ReactNode;
  site: Site;
}

export type FieldKind =
  | "color"
  | "image"
  | "list"
  | "media"
  | "number"
  | "select"
  | "text"
  | "textarea"
  | "url"
  | "youtubeChannel";

/** Descreve como o painel de propriedades edita cada prop do bloco. */
export interface FieldDef {
  itemFields?: FieldDef[];
  key: string;
  kind: FieldKind;
  label: string;
  options?: { label: string; value: string }[];
  /** Só mostra o campo (dentro de um item de lista) quando o campo `key` do item vale `equals`. */
  showWhen?: { equals: string; key: string };
}

export type BlockGroup = "blog" | "content" | "layout" | "media";

/** `children` = filhos já renderizados (só blocos contêiner usam). */
export type RenderFn<P> = (
  props: P,
  ctx: RenderContext,
  children: ReactNode[]
) => ReactNode;

export interface BlockDefinition {
  defaults: Record<string, unknown>;
  fields: FieldDef[];
  group: BlockGroup;
  label: string;
  render: RenderFn<unknown>;
  type: string;
}

export interface BlockSpec<S extends z.ZodTypeAny> {
  fields: FieldDef[];
  group: BlockGroup;
  label: string;
  render: RenderFn<z.infer<S>>;
  type: string;
}
