"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { AdSpec } from "../blocks/ads.js";
import type { FieldDef } from "../blocks/types.js";
import {
  isVideoFile,
  isYouTubeChannelId,
  parseMediaSource,
  type YouTubeChannel,
} from "../blocks/youtube.js";
import {
  IMAGE_FORMATS,
  UPLOAD_LIMIT_MB,
  uploadSizeError,
  VIDEO_FORMATS,
} from "../upload-limits.js";
import { AdPreviewDialog } from "./AdPreviewDialog.js";
import { ratioLabel } from "./ad-crop.js";
import { Icon } from "./icons.js";

/** Confere o canal no YouTube e devolve o ID `UC…` e o nome. Lança `Error` com mensagem para a pessoa. */
export type ResolveChannel = (
  input: string
) => Promise<{ id: string; name: string }>;

type Values = Record<string, unknown>;

/** Campo genérico do painel de propriedades, dirigido pelo `FieldDef` do bloco. */
/** Explicação recolhida: o painel mostra só o título e o campo; quem precisa do detalhe abre. */
export function Tip({
  children,
  label,
  open,
}: {
  children: ReactNode;
  label: string;
  open?: boolean;
}) {
  return (
    <details className="sbe-tip" open={open}>
      <summary>{label}</summary>
      <div>{children}</div>
    </details>
  );
}

export function FieldInput({
  adSpec,
  field,
  onChange,
  onResolveChannel,
  onUpload,
  value,
}: {
  /** Mídia de espaço de anúncio: mostra o tamanho ideal e a prévia do corte antes de enviar. */
  adSpec?: AdSpec;
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
                  adSpec={adSpec}
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
        adSpec={adSpec}
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
          {field.customLabel && !field.options?.some(o => o.value === str) ? (
            <option value={str}>{field.customLabel}</option>
          ) : null}
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
  adSpec,
  field,
  media = false,
  onChange,
  onUpload,
  value,
}: {
  /** Espaço de anúncio: tamanho ideal embaixo do campo e prévia do corte antes de enviar. */
  adSpec?: AdSpec;
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
  // Mídia de anúncio escolhida e ainda não enviada: a prévia do corte pergunta se a pessoa quer usar.
  const [staged, setStaged] = useState<{ file: File; url: string } | null>(
    null
  );
  const [viewing, setViewing] = useState(false);
  useEffect(
    () => () => {
      if (staged) URL.revokeObjectURL(staged.url);
    },
    [staged]
  );

  const upload = async (file: File) => {
    if (!onUpload) return;
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
    // Passou do limite: avisa agora, sem gastar o envio (o servidor também recusa).
    const tooBig = uploadSizeError(
      file,
      file.type.startsWith("video/") ? "video" : "image"
    );
    if (tooBig) {
      setError(tooBig);
      return;
    }
    // Espaço de anúncio: mostra como a mídia fica cortada antes de enviar.
    if (adSpec) {
      setError("");
      setStaged({ file, url: URL.createObjectURL(file) });
      return;
    }
    await upload(file);
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
          <Tip label="Tamanho e formatos" open={Boolean(adSpec)}>
            {adSpec ? (
              <>
                Tamanho ideal:{" "}
                <b>
                  {adSpec.w} × {adSpec.h} px
                </b>{" "}
                ({ratioLabel(adSpec.w, adSpec.h)}).{" "}
                {adSpec.note ? `${adSpec.note} ` : ""}O que passar das bordas é
                cortado, a partir do centro.
                <br />
              </>
            ) : null}
            {media
              ? `Imagens até ${UPLOAD_LIMIT_MB.image} MB (${IMAGE_FORMATS}) · vídeos até ${UPLOAD_LIMIT_MB.video} MB (${VIDEO_FORMATS}).`
              : `Até ${UPLOAD_LIMIT_MB.image} MB · ${IMAGE_FORMATS}.`}
          </Tip>
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
        <div className="sbe-row" style={{ justifyContent: "flex-start" }}>
          {adSpec && !parseMediaSource(value)?.kind?.startsWith("embed") ? (
            <button
              className="sbe-btn"
              onClick={() => setViewing(true)}
              type="button"
            >
              <Icon name="eye" size={13} />
              Ver como fica o corte
            </button>
          ) : null}
          <button
            className="sbe-btn danger"
            onClick={() => onChange("")}
            type="button"
          >
            <Icon name="trash-2" size={13} />
            {media ? "Remover mídia" : "Remover imagem"}
          </button>
        </div>
      ) : null}
      {error ? <small className="sbe-error">{error}</small> : null}
      {adSpec && staged ? (
        <AdPreviewDialog
          busy={uploading}
          fileSize={staged.file.size}
          isVideo={staged.file.type.startsWith("video/")}
          mode="confirm"
          onClose={() => setStaged(null)}
          onConfirm={async () => {
            await upload(staged.file);
            setStaged(null);
          }}
          spec={adSpec}
          src={staged.url}
        />
      ) : null}
      {adSpec && viewing && value ? (
        <AdPreviewDialog
          isVideo={isVideoFile(value)}
          mode="view"
          onClose={() => setViewing(false)}
          spec={adSpec}
          src={value}
        />
      ) : null}
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
