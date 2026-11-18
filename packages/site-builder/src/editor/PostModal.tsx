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

/**
 * Modal "Novo post": a página (aba) onde ele entra e o que ele mostra (título opcional, descrição, imagem ou
 * vídeo). Só depois de criar o editor vai para a página, onde o post pode ser movido para cima ou para baixo.
 */
export function PostModal({
  initialPageId,
  onClose,
  onCreate,
  onUploadImage,
  site,
}: {
  initialPageId?: string;
  onClose: () => void;
  onCreate: (form: PostForm) => void;
  onUploadImage?: (file: File) => Promise<string>;
  site: Site;
}) {
  const pages = site.pages.filter(p => p.slug !== "404");
  const [pageId, setPageId] = useState(
    pages.find(p => p.id === initialPageId)?.id ?? pages[0]?.id ?? ""
  );
  const [format, setFormat] = useState<PostFormat>("text");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState("");
  const [tried, setTried] = useState(false);
  const firstRef = useRef<HTMLSelectElement>(null);
  const spec = POST_FORMATS.find(f => f.value === format) ?? POST_FORMATS[0];

  useEffect(() => firstRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const form: PostForm = { description, format, media, pageId, title };
  const error = postFormError(form, site);

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
            <p>
              Escolha a página e o conteúdo. Depois você coloca o post onde
              quiser nela.
            </p>
          </div>
        </header>
        <div className="body">
          <label className="sbe-field">
            <span>Página (a aba onde o post vai ficar)</span>
            <select
              onChange={e => setPageId(e.target.value)}
              ref={firstRef}
              value={pageId}
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <div className="sbe-field">
            <span>O que o post tem</span>
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
            <span>Título (opcional)</span>
            <input
              onChange={e => setTitle(e.target.value)}
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
