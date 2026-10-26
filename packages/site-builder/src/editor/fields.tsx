"use client";

import { useRef, useState } from "react";
import type { FieldDef } from "../blocks/types.js";
import { Icon } from "./icons.js";

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

  if (field.kind === "image") {
    return (
      <ImageField
        field={field}
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
  onChange,
  onUpload,
  value,
}: {
  field: FieldDef;
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
    if (!file.type.startsWith("image/")) {
      setError("Envie um arquivo de imagem.");
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
            {value ? <img alt="" className="sbe-thumb" src={value} /> : null}
            {value ? (
              <span className="cover">
                <Icon name="upload" size={18} />
                <b>{uploading ? "Enviando..." : "Trocar imagem"}</b>
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
            accept="image/*"
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
        placeholder="ou cole a URL da imagem"
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
          Remover imagem
        </button>
      ) : null}
      {error ? <small className="sbe-error">{error}</small> : null}
    </div>
  );
}
