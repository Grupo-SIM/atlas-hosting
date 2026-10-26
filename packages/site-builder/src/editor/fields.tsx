"use client";

import { useState } from "react";
import type { FieldDef } from "../blocks/types.js";

type Values = Record<string, unknown>;

/** Campo genérico do painel de propriedades, dirigido pelo `FieldDef` do bloco. */
export function FieldInput({
  field,
  onChange,
  onUpload,
  value,
}: {
  field: FieldDef;
  onChange: (value: unknown) => void;
  onUpload?: (file: File) => Promise<string>;
  value: unknown;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
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
            {itemFields.map(f => (
              <FieldInput
                field={f}
                key={f.key}
                onChange={v => update(index, f.key, v)}
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
                itemFields.map(f => [f.key, f.kind === "number" ? 0 : ""])
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
          placeholder={
            field.kind === "image" ? "Cole a URL da imagem" : undefined
          }
          type="text"
          value={str}
        />
      )}
      {field.kind === "image" && onUpload ? (
        <input
          accept="image/*"
          disabled={uploading}
          onChange={async e => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setUploading(true);
            setUploadError("");
            try {
              onChange(await onUpload(file));
            } catch (err) {
              setUploadError(
                err instanceof Error ? err.message : "Falha no envio"
              );
            } finally {
              setUploading(false);
            }
          }}
          type="file"
        />
      ) : null}
      {uploading ? <small>Enviando...</small> : null}
      {uploadError ? <small className="sbe-error">{uploadError}</small> : null}
      {field.kind === "image" && str ? (
        <img alt="" className="sbe-thumb" src={str} />
      ) : null}
    </label>
  );
}
