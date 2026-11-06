"use client";

import { useState } from "react";
import type { Page, Post, Site } from "../model/index.js";
import type { ConfirmRequest } from "./ConfirmDialog.js";
import { FieldInput } from "./fields.js";
import { findLinkRefs, relinkSite } from "./links.js";
import {
  addCategory,
  addPage,
  addPost,
  removeCategory,
  removePage,
  removePost,
  renameCategory,
  setMenu,
  updatePage,
  updatePost,
} from "./site-ops.js";
import type { EditMeta } from "./types.js";

type Section = "categorias" | "menu" | "paginas" | "posts";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "paginas", label: "Páginas" },
  { id: "posts", label: "Posts" },
  { id: "categorias", label: "Categorias" },
  { id: "menu", label: "Menu" },
];

interface Props {
  confirm: (request: ConfirmRequest) => void;
  currentPage?: Page;
  currentPost?: Post;
  edit: (next: Site, meta?: EditMeta) => void;
  goTo: (path: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  setPath: (path: string) => void;
  site: Site;
}

/** Páginas, posts, categorias e menu do site (o que não é bloco da página aberta). */
export function ContentPanel({
  currentPage,
  currentPost,
  confirm,
  edit,
  goTo,
  onUploadImage,
  setPath,
  site,
}: Props) {
  const [section, setSection] = useState<Section>("paginas");

  return (
    <div className="sbe-pad">
      <div className="sbe-tabs2">
        {SECTIONS.map(s => (
          <button
            className={section === s.id ? "on" : ""}
            key={s.id}
            onClick={() => setSection(s.id)}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "paginas" && (
        <>
          <NewItem
            label="Nova página"
            onCreate={title => {
              const res = addPage(site, title);
              edit(res.site, { kind: "Novo", label: `Página · ${title}` });
              goTo(`/${res.page.slug}/`);
            }}
          />
          <ul className="sbe-items">
            {site.pages.map(p => (
              <li className={currentPage?.id === p.id ? "on" : ""} key={p.id}>
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
              <h4 className="sbe-h">Configurações da página</h4>
              <FieldInput
                field={{ key: "title", kind: "text", label: "Título" }}
                onChange={v =>
                  edit(updatePage(site, currentPage.id, { title: String(v) }), {
                    key: `pt-${currentPage.id}`,
                    label: `Título da página · ${currentPage.title}`,
                  })
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
                      edit(next, {
                        label: `Endereço · ${currentPage.title}`,
                      });
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
                    }),
                    { label: `Situação · ${currentPage.title}` }
                  )
                }
                value={currentPage.status}
              />
              {currentPage.slug !== "" && (
                <div className="sbe-list-row">
                  <button
                    onClick={() => {
                      const href = `/${currentPage.slug}/`;
                      if (site.menu.some(m => m.href === href)) return;
                      edit(
                        setMenu(site, [
                          ...site.menu,
                          { href, label: currentPage.title },
                        ]),
                        { label: `Menu · ${currentPage.title}` }
                      );
                    }}
                    type="button"
                  >
                    Adicionar ao menu
                  </button>
                  <button
                    className="sbe-btn danger"
                    onClick={() => {
                      const references = findLinkRefs(site, currentPage.slug);
                      const remove = (from: Site) => {
                        edit(removePage(from, currentPage.id), {
                          kind: "Removido",
                          label: `Página · ${currentPage.title}`,
                        });
                        goTo("/");
                      };
                      confirm({
                        confirmLabel: "Excluir",
                        message:
                          references.length > 0
                            ? `A página sairá do site, mas ela é usada como link em ${references.length} ${references.length > 1 ? "lugares" : "lugar"}:`
                            : "A página sairá do site.",
                        onConfirm: () => remove(site),
                        relink:
                          references.length > 0
                            ? {
                                onConfirm: href =>
                                  remove(
                                    relinkSite(site, currentPage.slug, href)
                                  ),
                                pages: site.pages
                                  .filter(
                                    p =>
                                      p.id !== currentPage.id &&
                                      p.slug !== "404"
                                  )
                                  .map(p => ({
                                    href: p.slug ? `/${p.slug}/` : "/",
                                    label: p.title,
                                  })),
                                references,
                              }
                            : undefined,
                        title: `Excluir a página "${currentPage.title}"?`,
                      });
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

      {section === "posts" && (
        <>
          <NewItem
            label="Novo post"
            onCreate={title => {
              const res = addPost(site, title, site.categories[0]?.id ?? null);
              edit(res.site, { kind: "Novo", label: `Post · ${title}` });
              goTo(`/${res.post.slug}/`);
            }}
          />
          <ul className="sbe-items">
            {site.posts.map(p => (
              <li className={currentPost?.id === p.id ? "on" : ""} key={p.id}>
                <button onClick={() => goTo(`/${p.slug}/`)} type="button">
                  {p.title}
                  {p.status === "draft" ? <em> rascunho</em> : null}
                </button>
              </li>
            ))}
          </ul>
          {currentPost && (
            <div className="sbe-box">
              <h4 className="sbe-h">Configurações do post</h4>
              <FieldInput
                field={{ key: "title", kind: "text", label: "Título" }}
                onChange={v =>
                  edit(updatePost(site, currentPost.id, { title: String(v) }), {
                    key: `ot-${currentPost.id}`,
                    label: `Título do post · ${currentPost.title}`,
                  })
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
                    const post = next.posts.find(p => p.id === currentPost.id);
                    edit(next, { label: `Endereço · ${currentPost.title}` });
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
                    }),
                    { label: `Categoria · ${currentPost.title}` }
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
                    {
                      key: `oc-${currentPost.id}`,
                      label: `Capa · ${currentPost.title}`,
                    }
                  )
                }
                onUpload={onUploadImage}
                value={currentPost.coverImage ?? ""}
              />
              <FieldInput
                field={{ key: "excerpt", kind: "textarea", label: "Resumo" }}
                onChange={v =>
                  edit(
                    updatePost(site, currentPost.id, { excerpt: String(v) }),
                    {
                      key: `oe-${currentPost.id}`,
                      label: `Resumo · ${currentPost.title}`,
                    }
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
                      }),
                      { label: `Data · ${currentPost.title}` }
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
                    }),
                    { label: `Situação · ${currentPost.title}` }
                  )
                }
                value={currentPost.status}
              />
              <button
                className="sbe-btn danger"
                onClick={() => {
                  const references = findLinkRefs(site, currentPost.slug);
                  const remove = (from: Site) => {
                    edit(removePost(from, currentPost.id), {
                      kind: "Removido",
                      label: `Post · ${currentPost.title}`,
                    });
                    goTo("/blogs/");
                  };
                  confirm({
                    confirmLabel: "Excluir",
                    message:
                      references.length > 0
                        ? `O post sairá do site, mas ele é usado como link em ${references.length} ${references.length > 1 ? "lugares" : "lugar"}:`
                        : "O post sairá do site.",
                    onConfirm: () => remove(site),
                    relink:
                      references.length > 0
                        ? {
                            onConfirm: href =>
                              remove(relinkSite(site, currentPost.slug, href)),
                            pages: site.pages
                              .filter(p => p.slug !== "404")
                              .map(p => ({
                                href: p.slug ? `/${p.slug}/` : "/",
                                label: p.title,
                              })),
                            references,
                          }
                        : undefined,
                    title: `Excluir o post "${currentPost.title}"?`,
                  });
                }}
                type="button"
              >
                Excluir post
              </button>
            </div>
          )}
        </>
      )}

      {section === "categorias" && (
        <>
          <NewItem
            label="Nova categoria"
            onCreate={name =>
              edit(addCategory(site, name), {
                kind: "Novo",
                label: `Categoria · ${name}`,
              })
            }
          />
          {site.categories.map(c => (
            <div className="sbe-list-row" key={c.id}>
              <input
                onChange={e =>
                  edit(renameCategory(site, c.id, e.target.value), {
                    key: `cn-${c.id}`,
                    label: `Categoria · ${c.name}`,
                  })
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
                className="sbe-btn danger"
                onClick={() =>
                  confirm({
                    confirmLabel: "Excluir",
                    message: "Os posts ficam sem categoria.",
                    onConfirm: () =>
                      edit(removeCategory(site, c.id), {
                        kind: "Removido",
                        label: `Categoria · ${c.name}`,
                      }),
                    title: `Excluir a categoria "${c.name}"?`,
                  })
                }
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}

      {section === "menu" && (
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
                    { key: `ml-${i}`, label: `Menu · ${item.label}` }
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
                    { key: `mh-${i}`, label: `Menu · ${item.label}` }
                  )
                }
                value={item.href}
              />
              <div className="sbe-list-row">
                <button
                  disabled={i === 0}
                  onClick={() => {
                    const copy = [...site.menu];
                    const [moved] = copy.splice(i, 1);
                    if (moved) copy.splice(i - 1, 0, moved);
                    edit(setMenu(site, copy), { label: "Menu · ordem" });
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
                    edit(setMenu(site, copy), { label: "Menu · ordem" });
                  }}
                  type="button"
                >
                  ↓
                </button>
                <button
                  className="sbe-btn danger"
                  onClick={() =>
                    edit(
                      setMenu(
                        site,
                        site.menu.filter((_, j) => j !== i)
                      ),
                      { kind: "Removido", label: `Menu · ${item.label}` }
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
            className="sbe-btn"
            onClick={() =>
              edit(
                setMenu(site, [
                  ...site.menu,
                  { href: "/", label: "Novo item" },
                ]),
                { kind: "Novo", label: "Menu · novo item" }
              )
            }
            type="button"
          >
            + Item de menu
          </button>
        </>
      )}
    </div>
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
      className="sbe-list-row"
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
