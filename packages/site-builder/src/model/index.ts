import { z } from "zod";
import { type Fx, fxMapSchema } from "./fx.js";
import { ELEMENT_PATH, isValidStyle } from "./style.js";

/** Âncora de bloco (`id` no HTML, alvo de links `#nome`): letra inicial, depois letras, números, `-` e `_`. */
export const BLOCK_ANCHOR = /^[A-Za-z][\w-]{0,59}$/;

/** Nó da árvore de blocos de uma página. `props` é validado pelo schema do tipo. */
export const blockSchema: z.ZodType<Block> = z.lazy(() =>
  z.object({
    anchor: z.string().regex(BLOCK_ANCHOR).optional(),
    children: z.array(blockSchema).optional(),
    elStyles: z
      .record(
        z
          .record(z.union([z.string().max(200), z.number()]))
          .refine(isValidStyle, "Estilo inválido")
      )
      .refine(
        o => Object.keys(o).every(k => ELEMENT_PATH.test(k)),
        "Caminho inválido"
      )
      .optional(),
    fx: fxMapSchema.optional(),
    hidden: z.boolean().optional(),
    id: z.string(),
    props: z.record(z.unknown()),
    style: z
      .record(z.union([z.string().max(200), z.number()]))
      .refine(isValidStyle, "Estilo inválido")
      .optional(),
    type: z.string(),
  })
);

export interface Block {
  /** `id` do bloco no HTML, para links `#ancora` (ver `BLOCK_ANCHOR`). Não é copiado ao duplicar. */
  anchor?: string;
  children?: Block[];
  /** Estilos por elemento interno do bloco, indexados por caminho `nth-child` (ver `ELEMENT_PATH`). */
  elStyles?: Record<string, Record<string, string | number>>;
  /** Efeitos (entrada, hover, parallax, contador) por item: chave `""` = bloco, senão caminho do elemento. */
  fx?: Record<string, Fx>;
  /** Oculto no site publicado e no preview; continua listado nas camadas do editor. */
  hidden?: boolean;
  id: string;
  props: Record<string, unknown>;
  /** Sobrescritas de CSS aplicadas ao contêiner do bloco (ver `BLOCK_STYLE_KEYS`). */
  style?: Record<string, string | number>;
  type: string;
}

export type PublishStatus = "draft" | "published";

export interface Page {
  /** Página "solta": sem cabeçalho nem rodapé do site (ex.: link na bio). */
  bare?: boolean;
  blocks: Block[];
  id: string;
  slug: string;
  status: PublishStatus;
  title: string;
  /** Texto corrido (termos, políticas): coluna mais estreita no centro. */
  prose?: boolean;
  /** Conteúdo em largura quase total (listas e arquivos), em vez da coluna centralizada. */
  wide?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  blocks: Block[];
  categoryId: string | null;
  coverImage: string | null;
  excerpt: string;
  id: string;
  publishedAt: string | null;
  slug: string;
  status: PublishStatus;
  title: string;
}

export interface MenuItem {
  /** Subitens do dropdown. */
  children?: { href: string; label: string }[];
  /** `categories`: os subitens são as categorias do site (sempre atualizadas). */
  dynamic?: "categories";
  href: string;
  label: string;
}

export interface Site {
  categories: Category[];
  /** Layout de cada arquivo de categoria (`/category/:slug`). */
  categoryLayout: Block[];
  footer: Block[];
  header: Block[];
  menu: MenuItem[];
  name: string;
  pages: Page[];
  /** Layout de cada post (`/:slug`). */
  postLayout: Block[];
  posts: Post[];
  /** Tokens de tema: `bg`, `fg`, `accent`, `card`, `muted`, `fontHeading`, `fontBody`. */
  theme: Record<string, string>;
}

export interface TemplateMeta {
  description: string;
  id: string;
  name: string;
  /** Quantidade de páginas do template. */
  pageCount: number;
  preview: string;
  /** Filtros da galeria (ex.: "Blog", "Loja"). */
  tags: string[];
}

export interface SiteTemplate extends Omit<TemplateMeta, "pageCount"> {
  site: Site;
}

export {
  ENTER_EFFECTS,
  ENTER_LABELS,
  ENTER_SCREEN_VALUES,
  type EnterEffect,
  type EnterScreen,
  type Fx,
  HOVER_EFFECTS,
  HOVER_LABELS,
  HOVER_MS,
  type HoverEffect,
} from "./fx.js";
