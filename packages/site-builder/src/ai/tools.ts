import {
  createBlock,
  getBlockDefinition,
  listBlockDefinitions,
} from "../blocks/registry.js";
import {
  addCategory,
  addPage,
  addPost,
  removeCategory,
  removePage,
  removePost,
  renameCategory,
  setMenu,
  setTheme,
  updatePage,
  updatePost,
  withAdBlocks,
} from "../editor/site-ops.js";
import {
  allRoots,
  type DropTarget,
  duplicateBlock,
  findBlock,
  insertBlockAt,
  moveBlockTo,
  removeBlock,
  rootBlocks,
  setBlockAnchor,
  setBlockHidden,
  updateBlockFx,
  updateBlockProps,
  updateBlockStyle,
  updateElementStyle,
} from "../editor/tree.js";
import { ENTER_EFFECTS, HOVER_EFFECTS, HOVER_MS } from "../model/fx.js";
import { BLOCK_ANCHOR, type Block, type Site } from "../model/index.js";
import { siteSchema } from "../model/schema.js";
import { BLOCK_STYLE_KEYS, cleanStyle, ELEMENT_PATH } from "../model/style.js";
import { customFonts, fontStack, SITE_FONTS } from "../renderer/fonts.js";

/** Definição de ferramenta no formato MCP (nome, descrição e JSON Schema da entrada). */
export interface AiToolDef {
  description: string;
  inputSchema: Record<string, unknown>;
  name: string;
}

export interface AiToolOutcome {
  /** Mensagem curta, no passado, para o usuário (ex.: "Adicionou Hero"). Só em ferramentas que alteram. */
  change?: string;
  /** Texto ou objeto devolvido à IA. */
  result: unknown;
  /** Site depois da ferramenta (o mesmo objeto de entrada quando nada mudou). */
  site: Site;
}

class ToolError extends Error {}

type Input = Record<string, unknown>;

// ---------- helpers de JSON Schema ----------
const str = (description: string) => ({ description, type: "string" });
const bool = (description: string) => ({ description, type: "boolean" });
const num = (description: string) => ({ description, type: "number" });
const obj = (
  description: string,
  properties: Record<string, unknown> = {},
  required: string[] = []
) => ({ description, properties, required, type: "object" });
const oneOf = (description: string, values: readonly string[]) => ({
  description,
  enum: [...values],
  type: "string",
});

const REGISTERED_STYLE_KEYS = BLOCK_STYLE_KEYS.join(", ");

const ROOT_HELP =
  'Raiz (lista de blocos): "header", "footer", "postLayout", "categoryLayout", "page:<id da página>" ou "post:<id do post>". Veja as raízes em ver_site.';

export const AI_TOOLS: AiToolDef[] = [
  {
    description:
      "Visão geral do site: nome, tema, menu, páginas, posts, categorias e as raízes de blocos. Comece por aqui.",
    inputSchema: obj("Sem parâmetros."),
    name: "ver_site",
  },
  {
    description:
      "Árvore de blocos de uma raiz, com id, tipo, se está oculto e as props principais (textos longos e listas vêm resumidos; use ver_bloco para o completo).",
    inputSchema: obj("", { raiz: str(ROOT_HELP) }, ["raiz"]),
    name: "ver_blocos",
  },
  {
    description:
      "Um bloco completo (props, estilo, efeitos, filhos) mais a descrição dos campos editáveis do tipo.",
    inputSchema: obj("", { id: str("Id do bloco.") }, ["id"]),
    name: "ver_bloco",
  },
  {
    description:
      "Catálogo dos tipos de bloco. Sem `tipo`: lista todos (tipo, nome, grupo). Com `tipo`: campos editáveis (chave, tipo de campo, opções) e os valores padrão. Consulte antes de adicionar ou editar um bloco que você não conhece.",
    inputSchema: obj("", { tipo: str("Tipo do bloco, ex.: hero.") }),
    name: "tipos_de_bloco",
  },
  {
    description:
      "Adiciona um bloco novo. Posição: `depois_de`/`antes_de` (id de um bloco), `dentro_de` (id de um bloco contêiner), ou só `raiz` (vai para o fim da raiz, ou o início com posicao=inicio). `props` opcionais sobrescrevem os padrões.",
    inputSchema: obj(
      "",
      {
        antes_de: str("Id do bloco de referência."),
        dentro_de: str("Id do contêiner."),
        depois_de: str("Id do bloco de referência."),
        posicao: oneOf("Com `raiz`: início ou fim (padrão fim).", [
          "inicio",
          "fim",
        ]),
        props: obj("Props do bloco (chaves de tipos_de_bloco)."),
        raiz: str(ROOT_HELP),
        tipo: str("Tipo do bloco (tipos_de_bloco)."),
      },
      ["tipo"]
    ),
    name: "adicionar_bloco",
  },
  {
    description:
      "Altera props de um bloco (mescla: só as chaves enviadas mudam). Listas (ex.: items, cards) são substituídas por inteiro: envie a lista completa.",
    inputSchema: obj(
      "",
      { id: str("Id do bloco."), props: obj("Props a alterar.") },
      ["id", "props"]
    ),
    name: "editar_bloco",
  },
  {
    description: `Estilo CSS de um bloco ou de um elemento dentro dele. Chaves aceitas: ${REGISTERED_STYLE_KEYS}. Valor null apaga a chave. Números viram px (exceto opacity, fontWeight, order). Com \`caminho\` (ex.: "1.2" = nth-child) o estilo vale só para aquele elemento interno.`,
    inputSchema: obj(
      "",
      {
        caminho: str(
          'Caminho nth-child do elemento, ex.: "1.2". Vazio = o bloco.'
        ),
        estilo: obj("Chave CSS → valor (ou null para apagar)."),
        id: str("Id do bloco."),
      },
      ["id", "estilo"]
    ),
    name: "estilizar",
  },
  {
    description:
      "Move um bloco existente (com tudo que tem dentro). Informe UM destino: `antes_de`, `depois_de`, `dentro_de` ou `raiz` (+ `posicao`).",
    inputSchema: obj(
      "",
      {
        antes_de: str("Id de referência."),
        dentro_de: str("Id do contêiner."),
        depois_de: str("Id de referência."),
        id: str("Id do bloco a mover."),
        posicao: oneOf("Com `raiz`.", ["inicio", "fim"]),
        raiz: str(ROOT_HELP),
      },
      ["id"]
    ),
    name: "mover_bloco",
  },
  {
    description: "Duplica um bloco logo abaixo dele.",
    inputSchema: obj("", { id: str("Id do bloco.") }, ["id"]),
    name: "duplicar_bloco",
  },
  {
    description:
      "Remove um bloco (com os filhos). Só faça se o usuário pediu para apagar; para esconder use ocultar_bloco.",
    inputSchema: obj("", { id: str("Id do bloco.") }, ["id"]),
    name: "remover_bloco",
  },
  {
    description: "Oculta ou mostra um bloco no site (continua nas Camadas).",
    inputSchema: obj(
      "",
      { id: str("Id do bloco."), oculto: bool("true oculta, false mostra.") },
      ["id", "oculto"]
    ),
    name: "ocultar_bloco",
  },
  {
    description:
      "Dá um nome (âncora) ao bloco para links #nome rolarem até ele (ex.: botão com link #sabermais). Vazio remove. Letras, números, - e _, começando com letra.",
    inputSchema: obj(
      "",
      {
        ancora: str("Nome da âncora, sem #. Vazio remove."),
        id: str("Id do bloco."),
      },
      ["id", "ancora"]
    ),
    name: "ancora_bloco",
  },
  {
    description:
      "Efeitos de animação de um bloco/elemento: entrada ao rolar, atraso, hover, parallax, seguir o mouse, contador. Só as chaves enviadas mudam; null apaga.",
    inputSchema: obj(
      "",
      {
        atraso: num("Atraso da entrada em ms (0-3000)."),
        cada: bool("Aplica a cada filho direto."),
        caminho: str("Elemento interno (nth-child). Vazio = o bloco."),
        contar: bool("Conta os números de 0 até o valor."),
        entrada: oneOf(`Entrada: ${ENTER_EFFECTS.join(", ")}.`, ENTER_EFFECTS),
        hover: oneOf(
          `Ao passar o mouse: ${HOVER_EFFECTS.join(", ")}.`,
          HOVER_EFFECTS
        ),
        hover_ms: num(
          `Duração do hover em ms (${HOVER_MS.min}-${HOVER_MS.max}; padrão ${HOVER_MS.default}).`
        ),
        id: str("Id do bloco."),
        mouse: num(
          "Seguir o mouse: -10 a 10 (0 desliga; negativo vai ao contrário do ponteiro)."
        ),
        parallax: num("-10 a 10 (0 desliga)."),
      },
      ["id"]
    ),
    name: "efeitos",
  },
  {
    description: `Tema do site inteiro. Cores aceitam hex (#rrggbb) ou nome CSS. \`fonte\` define títulos e corpo juntos; opções: ${SITE_FONTS.join(", ")} (ou o nome de uma fonte que o usuário já enviou). \`favicon\` é uma URL de imagem.`,
    inputSchema: obj("", {
      cor_fundo: str("Fundo da página (bg)."),
      cor_principal: str("Cor de destaque (accent)."),
      cor_superficie: str("Cartões (card)."),
      cor_texto: str("Cor do texto (fg)."),
      cor_texto_secundario: str("Texto secundário (muted)."),
      favicon: str("URL do ícone."),
      fonte: str("Fonte de títulos e corpo."),
      fonte_corpo: str("Só corpo."),
      fonte_titulos: str("Só títulos."),
    }),
    name: "editar_tema",
  },
  {
    description:
      "Liga ou desliga os espaços de anúncio do site. Ligar também cria o bloco Anúncio no topo de cada página. As mídias dos anúncios o usuário envia pelo editor.",
    inputSchema: obj("", { ligar: bool("true liga, false desliga.") }, [
      "ligar",
    ]),
    name: "anuncios",
  },
  {
    description: "Muda o nome do site.",
    inputSchema: obj("", { nome: str("Novo nome (até 120 caracteres).") }, [
      "nome",
    ]),
    name: "editar_site",
  },
  {
    description:
      "Cria uma página nova (rascunho, com título e um texto). Devolve o id e a raiz para adicionar blocos. Para entrar no menu use definir_menu.",
    inputSchema: obj(
      "",
      { slug: str("Endereço opcional, ex.: sobre."), titulo: str("Título.") },
      ["titulo"]
    ),
    name: "criar_pagina",
  },
  {
    description:
      "Altera título, endereço (slug) ou status de uma página. A home não muda de endereço.",
    inputSchema: obj(
      "",
      {
        id: str("Id da página."),
        slug: str("Novo endereço."),
        status: oneOf("Status.", ["draft", "published"]),
        titulo: str("Novo título."),
      },
      ["id"]
    ),
    name: "editar_pagina",
  },
  {
    description: "Exclui uma página (a home não pode). Só se o usuário pediu.",
    inputSchema: obj("", { id: str("Id da página.") }, ["id"]),
    name: "remover_pagina",
  },
  {
    description: "Cria um post (rascunho).",
    inputSchema: obj(
      "",
      { categoria_id: str("Id da categoria."), titulo: str("Título.") },
      ["titulo"]
    ),
    name: "criar_post",
  },
  {
    description:
      "Altera um post: título, slug, status, resumo, capa (URL), categoria, data (AAAA-MM-DD).",
    inputSchema: obj(
      "",
      {
        capa: str("URL da imagem de capa."),
        categoria_id: str("Id da categoria (ou vazio para nenhuma)."),
        data: str("Data de publicação AAAA-MM-DD."),
        id: str("Id do post."),
        resumo: str("Resumo."),
        slug: str("Endereço."),
        status: oneOf("Status.", ["draft", "published"]),
        titulo: str("Título."),
      },
      ["id"]
    ),
    name: "editar_post",
  },
  {
    description: "Exclui um post. Só se o usuário pediu.",
    inputSchema: obj("", { id: str("Id do post.") }, ["id"]),
    name: "remover_post",
  },
  {
    description: "Cria uma categoria.",
    inputSchema: obj("", { nome: str("Nome.") }, ["nome"]),
    name: "criar_categoria",
  },
  {
    description: "Renomeia uma categoria.",
    inputSchema: obj("", { id: str("Id."), nome: str("Novo nome.") }, [
      "id",
      "nome",
    ]),
    name: "renomear_categoria",
  },
  {
    description:
      "Exclui uma categoria (os posts dela ficam sem categoria). Só se o usuário pediu.",
    inputSchema: obj("", { id: str("Id.") }, ["id"]),
    name: "remover_categoria",
  },
  {
    description:
      'Substitui o menu do site inteiro. Cada item: {label, href, filhos?: [{label, href}]}. href interno no formato "/slug/" (home: "/").',
    inputSchema: obj(
      "",
      { itens: { description: "Itens do menu.", type: "array" } },
      ["itens"]
    ),
    name: "definir_menu",
  },
];

// ---------- leitura de entrada ----------
const text = (input: Input, key: string, required = true): string => {
  const v = input[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  if (required) throw new ToolError(`Falta o parâmetro "${key}".`);
  return "";
};
const record = (input: Input, key: string): Record<string, unknown> => {
  const v = input[key];
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  throw new ToolError(`O parâmetro "${key}" precisa ser um objeto.`);
};

// ---------- leitura do site ----------
const short = (v: unknown): unknown => {
  if (typeof v === "string") return v.length > 80 ? `${v.slice(0, 80)}…` : v;
  if (Array.isArray(v)) return `[lista com ${v.length} itens]`;
  if (v && typeof v === "object") return "{…}";
  return v;
};

function outline(block: Block): unknown {
  return {
    anchor: block.anchor,
    children: block.children?.length ? block.children.map(outline) : undefined,
    hidden: block.hidden || undefined,
    id: block.id,
    props: Object.fromEntries(
      Object.entries(block.props).map(([k, v]) => [k, short(v)])
    ),
    type: block.type,
  };
}

function rootsOf(site: Site) {
  return allRoots(site).map(([key, blocks]) => ({
    blocos: blocks.length,
    raiz: key,
  }));
}

function mustBlock(site: Site, id: string): Block {
  const block = findBlock(site, id);
  if (!block) throw new ToolError(`Bloco "${id}" não existe (use ver_blocos).`);
  return block;
}

function mustRoot(site: Site, key: string) {
  if (!rootBlocks(site, key)) {
    throw new ToolError(`Raiz "${key}" não existe (veja ver_site).`);
  }
}

/** Valida as props de um bloco contra o schema do tipo (prop inválida zera o bloco ao renderizar). */
function checkProps(type: string, props: Record<string, unknown>) {
  const def = getBlockDefinition(type);
  if (!def) throw new ToolError(`Tipo de bloco "${type}" não existe.`);
  const parsed = def.schema.safeParse(props);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 4)
      .map(i => `${i.path.join(".") || "props"}: ${i.message}`)
      .join("; ");
    throw new ToolError(
      `Props inválidas para ${type}: ${issues}. Veja tipos_de_bloco.`
    );
  }
}

function target(input: Input): DropTarget {
  const given = (
    ["antes_de", "depois_de", "dentro_de", "raiz"] as const
  ).filter(k => typeof input[k] === "string" && input[k]);
  if (given.length !== 1) {
    throw new ToolError(
      "Informe exatamente um destino: antes_de, depois_de, dentro_de ou raiz."
    );
  }
  const kind = given[0];
  const value = text(input, kind as string);
  if (kind === "raiz") {
    return { end: input.posicao !== "inicio", root: value };
  }
  const place =
    kind === "antes_de" ? "before" : kind === "depois_de" ? "after" : "inside";
  return { id: value, place };
}

const CSS_COLOR =
  /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,24}|(rgb|hsl)a?\([0-9 ,.%/]+\))$/;
const URLISH = /^(https?:\/\/|\/)[^\s"'()<>;{}\\]+$/;

function themePatch(site: Site, input: Input): Record<string, string> {
  const patch: Record<string, string> = {};
  const colors: [string, string][] = [
    ["cor_principal", "accent"],
    ["cor_fundo", "bg"],
    ["cor_superficie", "card"],
    ["cor_texto", "fg"],
    ["cor_texto_secundario", "muted"],
  ];
  for (const [param, key] of colors) {
    const v = text(input, param, false);
    if (!v) continue;
    if (!CSS_COLOR.test(v))
      throw new ToolError(`Cor inválida em ${param}: ${v}`);
    patch[key] = v;
  }
  const known = [
    ...SITE_FONTS,
    ...customFonts(site.theme).map(f => f.name),
  ] as string[];
  const font = (param: string) => {
    const v = text(input, param, false);
    if (!v) return undefined;
    const hit = known.find(f => f.toLowerCase() === v.toLowerCase());
    if (!hit) {
      throw new ToolError(
        `Fonte "${v}" não está disponível. Opções: ${known.join(", ")}.`
      );
    }
    return fontStack(hit);
  };
  const both = font("fonte");
  if (both) {
    patch.fontBody = both;
    patch.fontHeading = both;
  }
  const body = font("fonte_corpo");
  if (body) patch.fontBody = body;
  const heading = font("fonte_titulos");
  if (heading) patch.fontHeading = heading;
  const favicon = text(input, "favicon", false);
  if (favicon) {
    if (!URLISH.test(favicon))
      throw new ToolError("Favicon precisa ser uma URL http(s).");
    patch.favicon = favicon;
  }
  if (Object.keys(patch).length === 0) {
    throw new ToolError("Nenhuma mudança de tema informada.");
  }
  return patch;
}

const label = (type: string) => getBlockDefinition(type)?.label ?? type;

/**
 * Executa uma ferramenta sobre o site. Lança `Error` com mensagem legível quando o pedido é inválido
 * (a IA recebe a mensagem e pode corrigir); nunca devolve um site que não passe no `siteSchema`.
 */
export function runAiTool(
  site: Site,
  name: string,
  input: Input = {}
): AiToolOutcome {
  const out = execute(site, name, input);
  if (out.site !== site) {
    const checked = siteSchema.safeParse(out.site);
    if (!checked.success) {
      const first = checked.error.issues[0];
      throw new ToolError(
        `A mudança deixaria o site inválido (${first?.path.join(".")}: ${first?.message}). Nada foi alterado.`
      );
    }
  }
  return out;
}

function execute(site: Site, name: string, input: Input): AiToolOutcome {
  const done = (next: Site, change: string, result: unknown = "ok") => ({
    change,
    result,
    site: next,
  });
  const read = (result: unknown): AiToolOutcome => ({ result, site });

  switch (name) {
    case "ver_site":
      return read({
        categorias: site.categories,
        menu: site.menu,
        nome: site.name,
        paginas: site.pages.map(p => ({
          id: p.id,
          raiz: `page:${p.id}`,
          slug: p.slug,
          status: p.status,
          titulo: p.title,
        })),
        posts: site.posts.map(p => ({
          categoria_id: p.categoryId,
          id: p.id,
          raiz: `post:${p.id}`,
          slug: p.slug,
          status: p.status,
          titulo: p.title,
        })),
        raizes: rootsOf(site),
        tema: site.theme,
      });

    case "ver_blocos": {
      const key = text(input, "raiz");
      mustRoot(site, key);
      return read((rootBlocks(site, key) ?? []).map(outline));
    }

    case "ver_bloco": {
      const block = mustBlock(site, text(input, "id"));
      const def = getBlockDefinition(block.type);
      return read({ bloco: block, campos: def?.fields, nome: def?.label });
    }

    case "tipos_de_bloco": {
      const type = text(input, "tipo", false);
      if (!type) {
        return read(
          listBlockDefinitions().map(d => ({
            grupo: d.group,
            nome: d.label,
            tipo: d.type,
          }))
        );
      }
      const def = getBlockDefinition(type);
      if (!def) throw new ToolError(`Tipo "${type}" não existe.`);
      return read({
        campos: def.fields,
        nome: def.label,
        padrao: def.defaults,
      });
    }

    case "adicionar_bloco": {
      const type = text(input, "tipo");
      const props = input.props ? record(input, "props") : {};
      const dest = target(input);
      if ("root" in dest) mustRoot(site, dest.root);
      else mustBlock(site, dest.id);
      const probe = createBlock(type);
      checkProps(type, { ...probe.props, ...props });
      const res = insertBlockAt(site, type, dest);
      if (res.site === site)
        throw new ToolError("Não foi possível inserir nesse destino.");
      const next = Object.keys(props).length
        ? updateBlockProps(res.site, res.id, props)
        : res.site;
      return done(next, `Adicionou ${label(type)}`, { id: res.id });
    }

    case "editar_bloco": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      const patch = record(input, "props");
      checkProps(block.type, { ...block.props, ...patch });
      return done(
        updateBlockProps(site, id, patch),
        `Editou ${label(block.type)}`
      );
    }

    case "estilizar": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      const raw = record(input, "estilo") as Record<
        string,
        string | number | null
      >;
      const path = text(input, "caminho", false);
      if (path && !ELEMENT_PATH.test(path)) {
        throw new ToolError(
          'Caminho inválido; use posições nth-child como "1.2".'
        );
      }
      const set: Record<string, string | number> = {};
      const patch: Record<string, string | number | undefined> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (v === null || v === "") patch[k] = undefined;
        else if (typeof v === "string" || typeof v === "number") set[k] = v;
      }
      const clean = cleanStyle(set) ?? {};
      const rejected = Object.keys(set).filter(k => !(k in clean));
      if (rejected.length) {
        throw new ToolError(
          `Estilo não aceito: ${rejected.join(", ")}. Chaves válidas: ${REGISTERED_STYLE_KEYS}.`
        );
      }
      Object.assign(patch, clean);
      const next = path
        ? updateElementStyle(site, id, path, patch)
        : updateBlockStyle(site, id, patch);
      return done(next, `Estilizou ${label(block.type)}`);
    }

    case "mover_bloco": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      const dest = target(input);
      if ("root" in dest) mustRoot(site, dest.root);
      else mustBlock(site, dest.id);
      const next = moveBlockTo(site, id, dest);
      if (next === site)
        throw new ToolError("Não foi possível mover para esse destino.");
      return done(next, `Moveu ${label(block.type)}`);
    }

    case "duplicar_bloco": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      const res = duplicateBlock(site, id);
      return done(res.site, `Duplicou ${label(block.type)}`, { id: res.id });
    }

    case "remover_bloco": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      return done(removeBlock(site, id), `Removeu ${label(block.type)}`);
    }

    case "ocultar_bloco": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      const hide = input.oculto === true;
      return done(
        setBlockHidden(site, id, hide),
        `${hide ? "Ocultou" : "Mostrou"} ${label(block.type)}`
      );
    }

    case "ancora_bloco": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      const name = text(input, "ancora", false).replace(/^#/, "");
      if (name && !BLOCK_ANCHOR.test(name))
        throw new ToolError(
          "Âncora inválida: use letras, números, - ou _, começando com letra."
        );
      return done(
        setBlockAnchor(site, id, name),
        name
          ? `Âncora #${name} em ${label(block.type)}`
          : `Removeu a âncora de ${label(block.type)}`
      );
    }

    case "efeitos": {
      const id = text(input, "id");
      const block = mustBlock(site, id);
      const path = text(input, "caminho", false);
      if (path && !ELEMENT_PATH.test(path))
        throw new ToolError("Caminho inválido.");
      const patch: Record<string, unknown> = {};
      const map = {
        atraso: "delay",
        cada: "each",
        contar: "count",
        entrada: "enter",
        hover: "hover",
        hover_ms: "hoverMs",
        mouse: "mouse",
        parallax: "parallax",
      } as const;
      for (const [param, key] of Object.entries(map)) {
        if (!(param in input)) continue;
        const v = input[param];
        patch[key] = v === null ? undefined : v;
      }
      if (
        patch.enter &&
        !(ENTER_EFFECTS as readonly string[]).includes(String(patch.enter))
      ) {
        throw new ToolError(
          `Entrada inválida. Use: ${ENTER_EFFECTS.join(", ")}.`
        );
      }
      if (
        patch.hover &&
        !(HOVER_EFFECTS as readonly string[]).includes(String(patch.hover))
      ) {
        throw new ToolError(
          `Hover inválido. Use: ${HOVER_EFFECTS.join(", ")}.`
        );
      }
      if (
        patch.hoverMs !== undefined &&
        (typeof patch.hoverMs !== "number" ||
          patch.hoverMs < HOVER_MS.min ||
          patch.hoverMs > HOVER_MS.max)
      ) {
        throw new ToolError(
          `hover_ms deve ser um número de ${HOVER_MS.min} a ${HOVER_MS.max}.`
        );
      }
      if (
        patch.mouse !== undefined &&
        (typeof patch.mouse !== "number" ||
          patch.mouse < -10 ||
          patch.mouse > 10)
      ) {
        throw new ToolError("mouse deve ser um número de -10 a 10.");
      }
      if (patch.mouse === 0) patch.mouse = undefined;
      return done(
        updateBlockFx(site, id, path, patch as never),
        `Ajustou efeitos de ${label(block.type)}`
      );
    }

    case "editar_tema":
      return done(setTheme(site, themePatch(site, input)), "Mudou o tema");

    case "anuncios": {
      const on = input.ligar === true;
      const themed = setTheme(site, { ads: on ? "on" : "off" });
      return done(
        on ? withAdBlocks(themed) : themed,
        on ? "Ligou os anúncios" : "Desligou os anúncios"
      );
    }

    case "editar_site": {
      const nome = text(input, "nome");
      if (nome.length > 120)
        throw new ToolError("Nome com até 120 caracteres.");
      return done({ ...site, name: nome }, "Renomeou o site");
    }

    case "criar_pagina": {
      const res = addPage(site, text(input, "titulo"));
      const slug = text(input, "slug", false);
      const next = slug
        ? updatePage(res.site, res.page.id, { slug })
        : res.site;
      return done(next, `Criou a página ${res.page.title}`, {
        id: res.page.id,
        raiz: `page:${res.page.id}`,
      });
    }

    case "editar_pagina": {
      const id = text(input, "id");
      if (!site.pages.some(p => p.id === id))
        throw new ToolError(`Página "${id}" não existe.`);
      const patch: Record<string, unknown> = {};
      if (input.titulo) patch.title = text(input, "titulo");
      if (input.slug !== undefined) patch.slug = String(input.slug);
      if (input.status) patch.status = text(input, "status");
      return done(updatePage(site, id, patch), "Editou a página");
    }

    case "remover_pagina": {
      const id = text(input, "id");
      const page = site.pages.find(p => p.id === id);
      if (!page) throw new ToolError(`Página "${id}" não existe.`);
      if (page.slug === "")
        throw new ToolError("A home não pode ser excluída.");
      return done(removePage(site, id), `Excluiu a página ${page.title}`);
    }

    case "criar_post": {
      const cat = text(input, "categoria_id", false) || null;
      if (cat && !site.categories.some(c => c.id === cat)) {
        throw new ToolError(`Categoria "${cat}" não existe.`);
      }
      const res = addPost(site, text(input, "titulo"), cat);
      return done(res.site, `Criou o post ${res.post.title}`, {
        id: res.post.id,
        raiz: `post:${res.post.id}`,
      });
    }

    case "editar_post": {
      const id = text(input, "id");
      if (!site.posts.some(p => p.id === id))
        throw new ToolError(`Post "${id}" não existe.`);
      const patch: Record<string, unknown> = {};
      if (input.titulo) patch.title = text(input, "titulo");
      if (input.slug !== undefined) patch.slug = String(input.slug);
      if (input.status) patch.status = text(input, "status");
      if (input.resumo !== undefined) patch.excerpt = String(input.resumo);
      if (input.capa !== undefined)
        patch.coverImage = String(input.capa) || null;
      if (input.data !== undefined)
        patch.publishedAt = String(input.data) || null;
      if (input.categoria_id !== undefined) {
        const cat = String(input.categoria_id) || null;
        if (cat && !site.categories.some(c => c.id === cat)) {
          throw new ToolError(`Categoria "${cat}" não existe.`);
        }
        patch.categoryId = cat;
      }
      return done(updatePost(site, id, patch), "Editou o post");
    }

    case "remover_post": {
      const id = text(input, "id");
      const post = site.posts.find(p => p.id === id);
      if (!post) throw new ToolError(`Post "${id}" não existe.`);
      return done(removePost(site, id), `Excluiu o post ${post.title}`);
    }

    case "criar_categoria":
      return done(
        addCategory(site, text(input, "nome")),
        "Criou uma categoria"
      );

    case "renomear_categoria": {
      const id = text(input, "id");
      if (!site.categories.some(c => c.id === id))
        throw new ToolError(`Categoria "${id}" não existe.`);
      return done(
        renameCategory(site, id, text(input, "nome")),
        "Renomeou a categoria"
      );
    }

    case "remover_categoria": {
      const id = text(input, "id");
      if (!site.categories.some(c => c.id === id))
        throw new ToolError(`Categoria "${id}" não existe.`);
      return done(removeCategory(site, id), "Excluiu a categoria");
    }

    case "definir_menu": {
      const items = input.itens;
      if (!Array.isArray(items))
        throw new ToolError('"itens" precisa ser uma lista.');
      const menu = items.map((raw, i) => {
        const it = (raw ?? {}) as Record<string, unknown>;
        const itemLabel = String(it.label ?? "").trim();
        const href = String(it.href ?? "").trim();
        if (!(itemLabel && href))
          throw new ToolError(`Item ${i + 1} do menu precisa de label e href.`);
        const kids = Array.isArray(it.filhos)
          ? it.filhos.map(k => ({
              href: String((k as Record<string, unknown>).href ?? ""),
              label: String((k as Record<string, unknown>).label ?? ""),
            }))
          : undefined;
        return kids?.length
          ? { children: kids, href, label: itemLabel }
          : { href, label: itemLabel };
      });
      return done(setMenu(site, menu), "Atualizou o menu");
    }

    default:
      throw new ToolError(`Ferramenta desconhecida: ${name}`);
  }
}

export { ToolError as AiToolError };
