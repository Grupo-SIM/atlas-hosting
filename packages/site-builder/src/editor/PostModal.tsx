"use client";

import { useEffect, useRef, useState } from "react";
import type { Site } from "../model/index.js";
import { FieldInput } from "./fields.js";
import {
  POST_FORMATS,
  type PostForm,
  type PostFormat,
  postFormError,
} from "./site-ops.js";

const NEW_CATEGORY = "__new";

/** Modal "Novo post": categoria (a aba), formato e o conteúdo (título, descrição, imagem ou vídeo). */
export function PostModal({
  initialCategoryId,
  onClose,
  onCreate,
  onUploadImage,
  site,
}: {
  initialCategoryId?: string | null;
  onClose: () => void;
  onCreate: (form: PostForm) => void;
  onUploadImage?: (file: File) => Promise<string>;
  site: Site;
}) {
  const hasCategories = site.categories.length > 0;
  const [category, setCategory] = useState(
    hasCategories
      ? (initialCategoryId ?? site.categories[0]?.id ?? "")
      : NEW_CATEGORY
  );
  const [newCategory, setNewCategory] = useState("");
  const [format, setFormat] = useState<PostFormat>("text");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState("");
  const [publish, setPublish] = useState(true);
  const [tried, setTried] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const spec = POST_FORMATS.find(f => f.value === format) ?? POST_FORMATS[0];

  useEffect(() => titleRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const creating = category === NEW_CATEGORY;
  const form: PostForm = {
    categoryId: creating || !category ? null : category,
    description,
    format,
    media,
    newCategory: creating ? newCategory : undefined,
    publish,
    title,
  };
  const error =
    creating && !newCategory.trim()
      ? "Dê um nome para a nova categoria."
      : postFormError(form);

  const submit = () => {
    setTried(true);
    if (error) return;
    onCreate(form);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: clicar no fundo fecha o modal
    <div
      className="sbe-modal"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        aria-label="Novo post"
        aria-modal="true"
        className="sbe-dialog sbe-postdialog"
        role="dialog"
      >
        <header>
          <div>
            <h3>Novo post</h3>
            <p>Escolha a categoria e o que o post vai mostrar.</p>
          </div>
        </header>
        <div className="body">
          <label className="sbe-field">
            <span>Categoria (aba onde o post aparece)</span>
            <select
              onChange={e => setCategory(e.target.value)}
              value={category}
            >
              {site.categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="">Sem categoria</option>
              <option value={NEW_CATEGORY}>+ Nova categoria…</option>
            </select>
          </label>
          {creating ? (
            <label className="sbe-field">
              <span>Nome da nova categoria</span>
              <input
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Ex.: Esportes"
                type="text"
                value={newCategory}
              />
            </label>
          ) : null}

          <div className="sbe-field">
            <span>O que o post mostra</span>
            <div className="sbe-tabs2">
              {POST_FORMATS.map(f => (
                <button
                  aria-pressed={format === f.value}
                  className={format === f.value ? "on" : ""}
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  type="button"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <label className="sbe-field">
            <span>Título</span>
            <input
              onChange={e => setTitle(e.target.value)}
              ref={titleRef}
              type="text"
              value={title}
            />
          </label>
          {spec?.text ? (
            <FieldInput
              field={{
                key: "description",
                kind: "textarea",
                label: "Descrição",
              }}
              onChange={v => setDescription(String(v ?? ""))}
              value={description}
            />
          ) : null}
          {spec?.media ? (
            <FieldInput
              field={{
                key: "media",
                kind: spec.media === "video" ? "media" : "image",
                label:
                  spec.media === "video"
                    ? "Vídeo (envie o arquivo ou cole o link do YouTube, Instagram…)"
                    : "Imagem",
              }}
              onChange={v => setMedia(String(v ?? ""))}
              onUpload={onUploadImage}
              value={media}
            />
          ) : null}

          <label className="sbe-check">
            <input
              checked={publish}
              onChange={e => setPublish(e.target.checked)}
              type="checkbox"
            />
            <span>Publicar já (desmarque para salvar como rascunho)</span>
          </label>
          {tried && error ? <small className="sbe-error">{error}</small> : null}
        </div>
        <footer>
          <button className="sbe-btn" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="sbe-btn dark" onClick={submit} type="button">
            Criar post
          </button>
        </footer>
      </div>
    </div>
  );
}
