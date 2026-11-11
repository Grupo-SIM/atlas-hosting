"use client";

import { useRef, useState } from "react";
import type { FieldDef } from "../blocks/types.js";
import {
  isVideoFile,
  isYouTubeChannelId,
  parseMediaSource,
  type YouTubeChannel,
} from "../blocks/youtube.js";
import { Icon } from "./icons.js";

/** Confere o canal no YouTube e devolve o ID `UC…` e o nome. Lança `Error` com mensagem para a pessoa. */
export type ResolveChannel = (
  input: string
) => Promise<{ id: string; name: string }>;

type Values = Record<string, unknown>;

/** Campo genérico do painel de propriedades, dirigido pelo `FieldDef` do bloco. */
export function FieldInput({
  field,
  onChange,
  onResolveChannel,
  onUpload,
  value,
}: {
  field: FieldDef;
  onChange: (value: unknown) => void;
  onResolveChannel?: ResolveChannel;
  onUpload?: (file: File) => Promise<string>;
  value: unknown;
}) {
  const str =
    typeof value === "string" ? value : value == null ? "" : String(value);

  if (field.kind === "list") {
    const items = Array.isArray(value) ? (value as Values[]) : [];
    const itemFields = field.itemFields ?? [];
    const update = (index: number, key: string, v: unknown) =>
      onChange(items.map((it, i) => (i === index ? { ...it, [key]: v } : it)));
    return (
      <div className="sbe-list">
        {items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: itens da lista não têm id estável
          <div className="sbe-list-item" key={index}>
            {itemFields
              .filter(
                f => !f.showWhen || item[f.showWhen.key] === f.showWhen.equals
              )
              .map(f => (
                <FieldInput
                  field={f}
                  key={f.key}
                  onChange={v => update(index, f.key, v)}
                  onResolveChannel={onResolveChannel}
                  onUpload={onUpload}
                  value={item[f.key]}
                />
              ))}
            <div className="sbe-row">
              <button
                disabled={index === 0}
                onClick={() => {
                  const copy = [...items];
                  const [moved] = copy.splice(index, 1);
                  if (moved) copy.splice(index - 1, 0, moved);
                  onChange(copy);
                }}
                type="button"
              >
                ↑
              </button>
              <button
                disabled={index === items.length - 1}
                onClick={() => {
                  const copy = [...items];
                  const [moved] = copy.splice(index, 1);
                  if (moved) copy.splice(index + 1, 0, moved);
                  onChange(copy);
                }}
                type="button"
              >
                ↓
              </button>
              <button
                onClick={() =>
                  onChange([
                    ...items.slice(0, index + 1),
                    structuredClone(item),
                    ...items.slice(index + 1),
                  ])
                }
                type="button"
              >
                Duplicar
              </button>
              <button
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                type="button"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            onChange([
              ...items,
              Object.fromEntries(
                itemFields.map(f => [
                  f.key,
                  f.kind === "number"
                    ? 0
                    : f.kind === "youtubeChannel"
                      ? { id: "", input: "", name: "" }
                      : f.kind === "select"
                        ? (f.options?.[0]?.value ?? "")
                        : "",
                ])
              ),
            ])
          }
          type="button"
        >
          + Adicionar item
        </button>
      </div>
    );
  }

  if (field.kind === "youtubeChannel") {
    const channel =
      value && typeof value === "object"
        ? (value as Partial<YouTubeChannel>)
        : {};
    return (
      <ChannelField
        field={field}
        onChange={onChange}
        onResolve={onResolveChannel}
        value={{
          id: channel.id ?? "",
          input: channel.input ?? "",
          name: channel.name ?? "",
        }}
      />
    );
  }

  if (field.kind === "image" || field.kind === "media") {
    return (
      <ImageField
        field={field}
        media={field.kind === "media" || field.key !== "favicon"}
        onChange={onChange}
        onUpload={onUpload}
        value={str}
      />
    );
  }

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: o controle muda conforme o tipo do campo
    <label className="sbe-field">
      <span>{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          onChange={e => onChange(e.target.value)}
          rows={4}
          value={str}
        />
      ) : field.kind === "select" ? (
        <select onChange={e => onChange(e.target.value)} value={str}>
          {field.options?.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.kind === "color" ? (
        <input
          onChange={e => onChange(e.target.value)}
          type="color"
          value={str || "#000000"}
        />
      ) : field.kind === "number" ? (
        <input
          onChange={e => onChange(Number(e.target.value))}
          type="number"
          value={str}
        />
      ) : (
        <input
          onChange={e => onChange(e.target.value)}
          type="text"
          value={str}
        />
      )}
    </label>
  );
}

/** Imagem: arrastar e soltar ou clicar para enviar, ou colar a URL. */
function ImageField({
  field,
  media = false,
  onChange,
  onUpload,
  value,
}: {
  field: FieldDef;
  /** Aceita também vídeo (anúncios). */
  media?: boolean;
  onChange: (value: unknown) => void;
  onUpload?: (file: File) => Promise<string>;
  value: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const picker = useRef<HTMLInputElement>(null);

  const send = async (file: File | undefined) => {
    if (!(file && onUpload)) return;
    if (
      !(
        file.type.startsWith("image/") ||
        (media && file.type.startsWith("video/"))
      )
    ) {
      setError(
        media ? "Envie uma imagem ou um vídeo." : "Envie um arquivo de imagem."
      );
      return;
    }
    setUploading(true);
    setError("");
    try {
      onChange(await onUpload(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no envio");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sbe-field">
      <span>{field.label}</span>
      {onUpload ? (
        <>
          {/* Com imagem: ela própria é o alvo (hover ou clique troca). Sem imagem: área de envio. */}
          <button
            className={[
              value ? "sbe-imgdrop has" : "sbe-drop",
              over ? "over" : "",
            ].join(" ")}
            onClick={() => picker.current?.click()}
            onDragLeave={() => setOver(false)}
            onDragOver={e => {
              e.preventDefault();
              setOver(true);
            }}
            onDrop={e => {
              e.preventDefault();
              setOver(false);
              void send(e.dataTransfer.files[0]);
            }}
            type="button"
          >
            {value && media && isVideoFile(value) ? (
              <video
                className="sbe-thumb"
                muted
                preload="metadata"
                src={value}
              />
            ) : value && media && parseMediaSource(value) ? (
              <span
                className="sbe-thumb"
                style={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {(() => {
                  const m = parseMediaSource(value);
                  return m?.kind === "embed" ? `Vídeo do ${m.title}` : "Vídeo";
                })()}
              </span>
            ) : value ? (
              <img alt="" className="sbe-thumb" src={value} />
            ) : null}
            {value ? (
              <span className="cover">
                <Icon name="upload" size={18} />
                <b>
                  {uploading
                    ? "Enviando..."
                    : media
                      ? "Trocar mídia"
                      : "Trocar imagem"}
                </b>
              </span>
            ) : (
              <>
                <Icon name="upload" size={20} />
                <b>
                  {uploading
                    ? "Enviando..."
                    : over
                      ? "Solte para enviar"
                      : "Arraste e solte aqui"}
                </b>
                <small>ou clique para enviar</small>
              </>
            )}
          </button>
          <input
            accept={media ? "image/*,video/*" : "image/*"}
            hidden
            onChange={e => {
              const file = e.target.files?.[0];
              e.target.value = "";
              void send(file);
            }}
            ref={picker}
            type="file"
          />
        </>
      ) : null}
      <input
        onChange={e => onChange(e.target.value)}
        placeholder={
          media
            ? "ou cole a URL da imagem/vídeo (ou link do Instagram, TikTok, YouTube…)"
            : "ou cole a URL da imagem"
        }
        type="text"
        value={value}
      />
      {value ? (
        <button
          className="sbe-btn danger"
          onClick={() => onChange("")}
          style={{ alignSelf: "flex-start" }}
          type="button"
        >
          <Icon name="trash-2" size={13} />
          {media ? "Remover mídia" : "Remover imagem"}
        </button>
      ) : null}
      {error ? <small className="sbe-error">{error}</small> : null}
    </div>
  );
}

/** Canal do YouTube: cola o link, @usuario ou ID e o editor confere e mostra o nome do canal. */
function ChannelField({
  field,
  onChange,
  onResolve,
  value,
}: {
  field: FieldDef;
  onChange: (value: unknown) => void;
  onResolve?: ResolveChannel;
  value: YouTubeChannel;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const resolve = async (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    setBusy(true);
    setError("");
    try {
      if (onResolve) {
        const found = await onResolve(input);
        onChange({ id: found.id, input, name: found.name });
      } else if (isYouTubeChannelId(input)) {
        onChange({ id: input, input, name: "" });
      } else {
        throw new Error("Cole o ID do canal (começa com UC).");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não achei esse canal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sbe-field">
      <span>{field.label}</span>
      <div className="sbe-row">
        <input
          onChange={e => {
            setError("");
            onChange({ id: "", input: e.target.value, name: "" });
          }}
          onKeyDown={e => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            void resolve(value.input);
          }}
          onPaste={e => {
            const text = e.clipboardData.getData("text");
            if (!text.trim()) return;
            e.preventDefault();
            onChange({ id: "", input: text.trim(), name: "" });
            void resolve(text);
          }}
          placeholder="Cole o link do canal ou @usuario"
          style={{ flex: 1 }}
          type="text"
          value={value.input}
        />
        <button
          className="sbe-btn"
          disabled={busy || !value.input.trim()}
          onClick={() => void resolve(value.input)}
          type="button"
        >
          {busy ? "Buscando..." : "Buscar"}
        </button>
      </div>
      {value.id ? (
        <small className="sbe-chan-ok">
          ✓ {value.name || "Canal encontrado"}
        </small>
      ) : null}
      {error ? <small className="sbe-error">{error}</small> : null}
    </div>
  );
}
