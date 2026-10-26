"use client";

import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getBlockDefinition,
  listBlockDefinitions,
} from "../blocks/registry.js";
import type { BlockGroup } from "../blocks/types.js";
import type { Block, Site } from "../model/index.js";
import { resolveRoute } from "../renderer/routes.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { FieldInput } from "./fields.js";
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
} from "./site-ops.js";
import { editorCss } from "./styles.js";
import {
  allRoots,
  duplicateBlock,
  findBlock,
  insertBlock,
  moveBlock,
  type RootKey,
  removeBlock,
  rootBlocks,
  rootForRoute,
  rootLabel,
  rootOf,
  updateBlockProps,
} from "./tree.js";

export type SaveResult = { ok: true } | { error: string; ok: false };

export interface SiteEditorProps {
  /** Prefixo das URLs do canvas (o editor intercepta os cliques, mas os hrefs precisam ser coerentes). */
  basePath?: string;
  initialSite: Site;
  /** Envia o arquivo e devolve a URL pública. Sem isso, imagens aceitam só URL. */
  onUploadImage?: (file: File) => Promise<string>;
  onSave: (site: Site) => Promise<SaveResult>;
  /** Conteúdo extra na barra superior (ex.: botão Publicar). `dirty` = há alterações não salvas. */
  toolbarExtra?: (state: { dirty: boolean }) => ReactNode;
}

type Tab =
  | "blocos"
  | "categorias"
  | "estrutura"
  | "aparencia"
  | "menu"
  | "paginas"
  | "posts";

const TABS: { id: Tab; label: string }[] = [
  { id: "estrutura", label: "Estrutura" },
  { id: "blocos", label: "Blocos" },
  { id: "paginas", label: "Páginas" },
  { id: "posts", label: "Posts" },
  { id: "categorias", label: "Categorias" },
  { id: "menu", label: "Menu" },
  { id: "aparencia", label: "Aparência" },
];

const GROUP_LABEL: Record<BlockGroup, string> = {
  blog: "Blog",
  content: "Conteúdo",
  layout: "Estrutura",
  media: "Mídia",
};

interface History {
  future: Site[];
  past: Site[];
  present: Site;
}

export function SiteEditor({
  basePath = "/site",
  initialSite,
  onSave,
  onUploadImage,
  toolbarExtra,
}: SiteEditorProps) {
  const [history, setHistory] = useState<History>({
    future: [],
    past: [],
    present: initialSite,
  });
  const site = history.present;
  const savedRef = useRef(initialSite);
  const lastEdit = useRef<{ at: number; key: string }>({ at: 0, key: "" });

  const [path, setPath] = useState("/");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rootKey, setRootKey] = useState<RootKey>(() =>
    rootForRoute(resolveRoute(initialSite, "/", "edit"))
  );
  const [tab, setTab] = useState<Tab>("estrutura");
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const route = useMemo(() => resolveRoute(site, path, "edit"), [site, path]);
  const dirty = site !== savedRef.current;

  /** `key` agrupa edições seguidas do mesmo campo num único passo de desfazer. */
  const commit = useCallback((next: Site, key?: string) => {
    setHistory(h => {
      const now = Date.now();
      const merge =
        key !== undefined &&
        lastEdit.current.key === key &&
        now - lastEdit.current.at < 1000;
      lastEdit.current = { at: now, key: key ?? "" };
      return {
        future: [],
        past: merge ? h.past : [...h.past.slice(-49), h.present],
        present: next,
      };
    });
  }, []);

  const undo = useCallback(
    () =>
      setHistory(h => {
        const prev = h.past[h.past.length - 1];
        if (!prev) return h;
        return {
          future: [h.present, ...h.future],
          past: h.past.slice(0, -1),
          present: prev,
        };
      }),
    []
  );
  const redo = useCallback(
    () =>
      setHistory(h => {
        const [next, ...rest] = h.future;
        if (!next) return h;
        return { future: rest, past: [...h.past, h.present], present: next };
      }),
    []
  );

  const save = useCallback(async () => {
    setSaving(true);
    setStatus("Salvando...");
    try {
      const result = await onSave(site);
      if (result.ok) {
        savedRef.current = site;
        setStatus("Salvo");
      } else {
        setStatus(result.error);
      }
    } catch {
      setStatus("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [onSave, site]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        void save();
      } else if (
        k === "z" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, save, undo]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Destaque do bloco selecionado dentro do canvas.
  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;
    for (const el of Array.from(root.querySelectorAll("[data-selected]")))
      el.removeAttribute("data-selected");
    if (selectedId)
      root
        .querySelector(`[data-block-id="${selectedId}"]`)
        ?.setAttribute("data-selected", "true");
  });

  // Se o bloco selecionado foi apagado (ex.: desfazer), limpa a seleção.
  useEffect(() => {
    if (selectedId && !findBlock(site, selectedId)) setSelectedId(null);
  }, [selectedId, site]);

  const goTo = (next: string) => {
    setPath(next);
    setSelectedId(null);
    setRootKey(rootForRoute(resolveRoute(site, next, "edit")));
  };

  const onCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) {
      e.preventDefault();
      const href = anchor.getAttribute("href") ?? "";
      if (href.startsWith(basePath)) goTo(href.slice(basePath.length) || "/");
    }
    const blockEl = target.closest<HTMLElement>("[data-block-id]");
    if (blockEl?.dataset.blockId) {
      const id = blockEl.dataset.blockId;
      setSelectedId(id);
      const key = rootOf(site, id);
      if (key) setRootKey(key);
    }
  };

  const selected = selectedId ? findBlock(site, selectedId) : undefined;
  const selectedDef = selected ? getBlockDefinition(selected.type) : undefined;
  const currentPage = route.kind === "page" ? route.page : undefined;
  const currentPost = route.kind === "post" ? route.post : undefined;
  const roots = rootBlocks(site, rootKey) ?? [];

  const edit = (next: Site, key?: string) => commit(next, key);

  return (
    <div className="sbe">
      <style>{editorCss}</style>

      <div className="sbe-bar">
        <strong>{site.name}</strong>
        <span className="sbe-path">{path}</span>
        <span className="sbe-spacer" />
        <span className="sbe-status">
          {dirty && !saving ? "Alterações não salvas" : status}
        </span>
        <button
          disabled={history.past.length === 0}
          onClick={undo}
          type="button"
        >
          Desfazer
        </button>
        <button
          disabled={history.future.length === 0}
          onClick={redo}
          type="button"
        >
          Refazer
        </button>
        {toolbarExtra?.({ dirty })}
        <button
          className="sbe-primary"
          disabled={saving || !dirty}
          onClick={() => void save()}
          type="button"
        >
          Salvar
        </button>
      </div>

      <div className="sbe-body">
        <aside className="sbe-left">
          <div className="sbe-tabs">
            {TABS.map(t => (
              <button
                className={tab === t.id ? "active" : ""}
                key={t.id}
                onClick={() => setTab(t.id)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="sbe-panel">
            {tab === "estrutura" && (
              <>
                <label className="sbe-field">
                  <span>Editando</span>
                  <select
                    onChange={e => setRootKey(e.target.value)}
                    value={rootKey}
                  >
                    {allRoots(site).map(([key]) => (
                      <option key={key} value={key}>
                        {rootLabel(site, key)}
                      </option>
                    ))}
                  </select>
                </label>
                <Outline
                  blocks={roots}
                  onSelect={id => setSelectedId(id)}
                  selectedId={selectedId}
                />
              </>
            )}

            {tab === "blocos" && (
              <>
                <p className="sbe-hint">
                  Inserir em <strong>{rootLabel(site, rootKey)}</strong>
                  {selected ? ", depois do bloco selecionado" : ", no final"}.
                </p>
                {(Object.keys(GROUP_LABEL) as BlockGroup[]).map(group => (
                  <div key={group}>
                    <h4>{GROUP_LABEL[group]}</h4>
                    {listBlockDefinitions()
                      .filter(d => d.group === group)
                      .map(d => (
                        <button
                          key={d.type}
                          onClick={() => {
                            const res = insertBlock(
                              site,
                              rootKey,
                              d.type,
                              selectedId ?? undefined
                            );
                            edit(res.site);
                            setSelectedId(res.id);
                          }}
                          type="button"
                        >
                          + {d.label}
                        </button>
                      ))}
                  </div>
                ))}
              </>
            )}

            {tab === "paginas" && (
              <>
                <NewItem
                  label="Nova página"
                  onCreate={title => {
                    const res = addPage(site, title);
                    edit(res.site);
                    goTo(`/${res.page.slug}/`);
                  }}
                />
                <ul className="sbe-items">
                  {site.pages.map(p => (
                    <li
                      className={currentPage?.id === p.id ? "active" : ""}
                      key={p.id}
                    >
                      <button
                        onClick={() => goTo(p.slug ? `/${p.slug}/` : "/")}
                        type="button"
                      >
                        {p.title}
                        {p.status === "draft" ? <em> rascunho</em> : null}
                      </button>
                    </li>
                  ))}
                </ul>
                {currentPage && (
                  <div className="sbe-box">
                    <h4>Configurações da página</h4>
                    <FieldInput
                      field={{ key: "title", kind: "text", label: "Título" }}
                      onChange={v =>
                        edit(
                          updatePage(site, currentPage.id, {
                            title: String(v),
                          }),
                          `pt-${currentPage.id}`
                        )
                      }
                      value={currentPage.title}
                    />
                    {currentPage.slug !== "" && (
                      <label className="sbe-field">
                        <span>Endereço (slug)</span>
                        <input
                          defaultValue={currentPage.slug}
                          key={currentPage.id + currentPage.slug}
                          onBlur={e => {
                            const next = updatePage(site, currentPage.id, {
                              slug: e.target.value,
                            });
                            const page = next.pages.find(
                              p => p.id === currentPage.id
                            );
                            edit(next);
                            if (page) setPath(`/${page.slug}/`);
                          }}
                          type="text"
                        />
                      </label>
                    )}
                    <FieldInput
                      field={{
                        key: "status",
                        kind: "select",
                        label: "Situação",
                        options: [
                          { label: "Publicada", value: "published" },
                          { label: "Rascunho", value: "draft" },
                        ],
                      }}
                      onChange={v =>
                        edit(
                          updatePage(site, currentPage.id, {
                            status: v as "draft" | "published",
                          })
                        )
                      }
                      value={currentPage.status}
                    />
                    {currentPage.slug !== "" && (
                      <div className="sbe-row">
                        <button
                          onClick={() => {
                            const href = `/${currentPage.slug}/`;
                            if (site.menu.some(m => m.href === href)) return;
                            edit(
                              setMenu(site, [
                                ...site.menu,
                                { href, label: currentPage.title },
                              ])
                            );
                          }}
                          type="button"
                        >
                          Adicionar ao menu
                        </button>
                        <button
                          className="sbe-danger"
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Excluir a página "${currentPage.title}"?`
                              )
                            )
                              return;
                            edit(removePage(site, currentPage.id));
                            goTo("/");
                          }}
                          type="button"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {tab === "posts" && (
              <>
                <NewItem
                  label="Novo post"
                  onCreate={title => {
                    const res = addPost(
                      site,
                      title,
                      site.categories[0]?.id ?? null
                    );
                    edit(res.site);
                    goTo(`/${res.post.slug}/`);
                  }}
                />
                <ul className="sbe-items">
                  {site.posts.map(p => (
                    <li
                      className={currentPost?.id === p.id ? "active" : ""}
                      key={p.id}
                    >
                      <button onClick={() => goTo(`/${p.slug}/`)} type="button">
                        {p.title}
                        {p.status === "draft" ? <em> rascunho</em> : null}
                      </button>
                    </li>
                  ))}
                </ul>
                {currentPost && (
                  <div className="sbe-box">
                    <h4>Configurações do post</h4>
                    <FieldInput
                      field={{ key: "title", kind: "text", label: "Título" }}
                      onChange={v =>
                        edit(
                          updatePost(site, currentPost.id, {
                            title: String(v),
                          }),
                          `ot-${currentPost.id}`
                        )
                      }
                      value={currentPost.title}
                    />
                    <label className="sbe-field">
                      <span>Endereço (slug)</span>
                      <input
                        defaultValue={currentPost.slug}
                        key={currentPost.id + currentPost.slug}
                        onBlur={e => {
                          const next = updatePost(site, currentPost.id, {
                            slug: e.target.value,
                          });
                          const post = next.posts.find(
                            p => p.id === currentPost.id
                          );
                          edit(next);
                          if (post) setPath(`/${post.slug}/`);
                        }}
                        type="text"
                      />
                    </label>
                    <FieldInput
                      field={{
                        key: "categoryId",
                        kind: "select",
                        label: "Categoria",
                        options: [
                          { label: "Sem categoria", value: "" },
                          ...site.categories.map(c => ({
                            label: c.name,
                            value: c.id,
                          })),
                        ],
                      }}
                      onChange={v =>
                        edit(
                          updatePost(site, currentPost.id, {
                            categoryId: v ? String(v) : null,
                          })
                        )
                      }
                      value={currentPost.categoryId ?? ""}
                    />
                    <FieldInput
                      field={{
                        key: "coverImage",
                        kind: "image",
                        label: "Imagem de capa",
                      }}
                      onChange={v =>
                        edit(
                          updatePost(site, currentPost.id, {
                            coverImage: v ? String(v) : null,
                          }),
                          `oc-${currentPost.id}`
                        )
                      }
                      onUpload={onUploadImage}
                      value={currentPost.coverImage ?? ""}
                    />
                    <FieldInput
                      field={{
                        key: "excerpt",
                        kind: "textarea",
                        label: "Resumo",
                      }}
                      onChange={v =>
                        edit(
                          updatePost(site, currentPost.id, {
                            excerpt: String(v),
                          }),
                          `oe-${currentPost.id}`
                        )
                      }
                      value={currentPost.excerpt}
                    />
                    <label className="sbe-field">
                      <span>Data de publicação</span>
                      <input
                        onChange={e =>
                          edit(
                            updatePost(site, currentPost.id, {
                              publishedAt: e.target.value || null,
                            })
                          )
                        }
                        type="date"
                        value={currentPost.publishedAt ?? ""}
                      />
                    </label>
                    <FieldInput
                      field={{
                        key: "status",
                        kind: "select",
                        label: "Situação",
                        options: [
                          { label: "Publicado", value: "published" },
                          { label: "Rascunho", value: "draft" },
                        ],
                      }}
                      onChange={v =>
                        edit(
                          updatePost(site, currentPost.id, {
                            status: v as "draft" | "published",
                          })
                        )
                      }
                      value={currentPost.status}
                    />
                    <button
                      className="sbe-danger"
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Excluir o post "${currentPost.title}"?`
                          )
                        )
                          return;
                        edit(removePost(site, currentPost.id));
                        goTo("/blogs/");
                      }}
                      type="button"
                    >
                      Excluir post
                    </button>
                  </div>
                )}
              </>
            )}

            {tab === "categorias" && (
              <>
                <NewItem
                  label="Nova categoria"
                  onCreate={name => edit(addCategory(site, name))}
                />
                {site.categories.map(c => (
                  <div className="sbe-row" key={c.id}>
                    <input
                      onChange={e =>
                        edit(
                          renameCategory(site, c.id, e.target.value),
                          `cn-${c.id}`
                        )
                      }
                      type="text"
                      value={c.name}
                    />
                    <button
                      onClick={() => goTo(`/category/${c.slug}/`)}
                      type="button"
                    >
                      Ver
                    </button>
                    <button
                      className="sbe-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Excluir a categoria "${c.name}"? Os posts ficam sem categoria.`
                          )
                        ) {
                          edit(removeCategory(site, c.id));
                        }
                      }}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </>
            )}

            {tab === "menu" && (
              <>
                {site.menu.map((item, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: itens do menu não têm id
                  <div className="sbe-box" key={i}>
                    <FieldInput
                      field={{ key: "label", kind: "text", label: "Texto" }}
                      onChange={v =>
                        edit(
                          setMenu(
                            site,
                            site.menu.map((m, j) =>
                              j === i ? { ...m, label: String(v) } : m
                            )
                          ),
                          `ml-${i}`
                        )
                      }
                      value={item.label}
                    />
                    <FieldInput
                      field={{ key: "href", kind: "url", label: "Link" }}
                      onChange={v =>
                        edit(
                          setMenu(
                            site,
                            site.menu.map((m, j) =>
                              j === i ? { ...m, href: String(v) } : m
                            )
                          ),
                          `mh-${i}`
                        )
                      }
                      value={item.href}
                    />
                    <div className="sbe-row">
                      <button
                        disabled={i === 0}
                        onClick={() => {
                          const copy = [...site.menu];
                          const [moved] = copy.splice(i, 1);
                          if (moved) copy.splice(i - 1, 0, moved);
                          edit(setMenu(site, copy));
                        }}
                        type="button"
                      >
                        ↑
                      </button>
                      <button
                        disabled={i === site.menu.length - 1}
                        onClick={() => {
                          const copy = [...site.menu];
                          const [moved] = copy.splice(i, 1);
                          if (moved) copy.splice(i + 1, 0, moved);
                          edit(setMenu(site, copy));
                        }}
                        type="button"
                      >
                        ↓
                      </button>
                      <button
                        className="sbe-danger"
                        onClick={() =>
                          edit(
                            setMenu(
                              site,
                              site.menu.filter((_, j) => j !== i)
                            )
                          )
                        }
                        type="button"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    edit(
                      setMenu(site, [
                        ...site.menu,
                        { href: "/", label: "Novo item" },
                      ])
                    )
                  }
                  type="button"
                >
                  + Item de menu
                </button>
              </>
            )}

            {tab === "aparencia" && (
              <>
                <FieldInput
                  field={{ key: "name", kind: "text", label: "Nome do site" }}
                  onChange={v =>
                    edit({ ...site, name: String(v) || site.name }, "site-name")
                  }
                  value={site.name}
                />
                {(
                  [
                    ["bg", "Fundo"],
                    ["fg", "Texto"],
                    ["accent", "Destaque (botões, links)"],
                    ["card", "Cartões"],
                    ["muted", "Texto secundário"],
                  ] as const
                ).map(([key, label]) => (
                  <FieldInput
                    field={{ key, kind: "color", label }}
                    key={key}
                    onChange={v =>
                      edit(setTheme(site, { [key]: String(v) }), `theme-${key}`)
                    }
                    value={site.theme[key] ?? ""}
                  />
                ))}
              </>
            )}
          </div>
        </aside>
        <div
          className="sbe-canvas"
          onClickCapture={onCanvasClick}
          onSubmitCapture={e => e.preventDefault()}
          ref={canvasRef}
        >
          <SiteRenderer
            basePath={basePath}
            mode="edit"
            path={path}
            site={site}
          />
        </div>

        <aside className="sbe-right">
          {selected && selectedDef ? (
            <div className="sbe-panel">
              <h3>{selectedDef.label}</h3>
              <div className="sbe-row">
                <button
                  onClick={() => edit(moveBlock(site, selected.id, -1))}
                  type="button"
                >
                  ↑ Subir
                </button>
                <button
                  onClick={() => edit(moveBlock(site, selected.id, 1))}
                  type="button"
                >
                  ↓ Descer
                </button>
              </div>
              <div className="sbe-row">
                <button
                  onClick={() => {
                    const res = duplicateBlock(site, selected.id);
                    edit(res.site);
                    if (res.id) setSelectedId(res.id);
                  }}
                  type="button"
                >
                  Duplicar
                </button>
                <button
                  className="sbe-danger"
                  onClick={() => {
                    edit(removeBlock(site, selected.id));
                    setSelectedId(null);
                  }}
                  type="button"
                >
                  Excluir
                </button>
              </div>
              {selectedDef.fields.length === 0 ? (
                <p className="sbe-hint">
                  Este bloco não tem opções — ele usa os dados do site.
                </p>
              ) : null}
              {selectedDef.fields.map(field => (
                <FieldInput
                  field={field}
                  key={field.key}
                  onChange={v =>
                    edit(
                      updateBlockProps(site, selected.id, { [field.key]: v }),
                      `${selected.id}-${field.key}`
                    )
                  }
                  onUpload={onUploadImage}
                  value={
                    selected.props[field.key] ?? selectedDef.defaults[field.key]
                  }
                />
              ))}
            </div>
          ) : (
            <div className="sbe-panel">
              <p className="sbe-hint">
                Clique em um bloco da página para editar seus textos, imagens e
                links.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Outline({
  blocks,
  depth = 0,
  onSelect,
  selectedId,
}: {
  blocks: Block[];
  depth?: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  return (
    <ul className="sbe-outline">
      {blocks.map(b => (
        <li key={b.id} style={{ paddingLeft: depth * 12 }}>
          <button
            className={selectedId === b.id ? "active" : ""}
            onClick={() => onSelect(b.id)}
            type="button"
          >
            {getBlockDefinition(b.type)?.label ?? b.type}
          </button>
          {b.children?.length ? (
            <Outline
              blocks={b.children}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function NewItem({
  label,
  onCreate,
}: {
  label: string;
  onCreate: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="sbe-row"
      onSubmit={e => {
        e.preventDefault();
        const v = value.trim();
        if (!v) return;
        onCreate(v);
        setValue("");
      }}
    >
      <input
        onChange={e => setValue(e.target.value)}
        placeholder={label}
        type="text"
        value={value}
      />
      <button type="submit">+</button>
    </form>
  );
}
