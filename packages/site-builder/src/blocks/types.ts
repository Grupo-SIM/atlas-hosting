import type { ReactNode } from "react";
import type { z } from "zod";
import type { Block, Category, Post, Site } from "../model/index.js";

export interface RenderContext {
  /** Post/categoria da rota atual — usados pelos blocos de layout. */
  current: { category?: Category; post?: Post };
  /** Prefixo das URLs internas (ex.: `/criador-de-sites/preview/spyhacker`). */
  basePath: string;
  mode: "edit" | "view";
  /** Caminho da rota atual dentro do site (`/`, `/produtos/`…), para marcar o item ativo do menu. */
  path?: string;
  query: Record<string, string>;
  renderBlocks: (blocks: Block[]) => ReactNode;
  site: Site;
  /** Miniatura (galeria de templates, "Meus sites"): iframes saem sem player (`frameProps`). */
  thumbnail?: boolean;
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
  /** Clicar no elemento deste campo também abre estes campos no painel (ex.: a foto do hover junto da foto). */
  related?: string[];
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
  /** Schema das props: a IA valida o que grava, porque prop inválida faz o bloco voltar aos defaults ao renderizar. */
  schema: z.ZodTypeAny;
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
