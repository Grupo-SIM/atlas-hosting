"use client";

import { ColorPickerButton } from "./ColorPicker.js";
import {
  formatShadow,
  parseShadow,
  presetOf,
  SHADOW_PRESETS,
  type Shadow,
} from "./effects.js";

type Style = Record<string, string | number | undefined>;
type OnStyle = (
  patch: Record<string, string | number | undefined>,
  what: string
) => void;

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

const Range = ({
  label,
  max,
  min = 0,
  onChange,
  suffix = "",
  value,
}: {
  label: string;
  max: number;
  min?: number;
  onChange: (v: number) => void;
  suffix?: string;
  value: number;
}) => (
  <label className="sbe-line">
    <span>{label}</span>
    <input
      max={max}
      min={min}
      onChange={e => onChange(Number(e.target.value))}
      type="range"
      value={value}
    />
    <span className="sbfx-val">
      {value}
      {suffix}
    </span>
  </label>
);

const BORDER_STYLES = [
  { label: "Sólida", value: "solid" },
  { label: "Tracejada", value: "dashed" },
  { label: "Pontilhada", value: "dotted" },
];

/** Borda (espessura, estilo e cor) e cantos arredondados do elemento. */
export function BorderControls({
  onStyle,
  style,
}: {
  onStyle: OnStyle;
  style: Style;
}) {
  const width = num(style.borderWidth);
  const radius = String(style.borderRadius ?? "").endsWith("%")
    ? 50
    : num(style.borderRadius);
  const color =
    typeof style.borderColor === "string" &&
    /^#[0-9a-f]{6}$/i.test(style.borderColor)
      ? style.borderColor
      : undefined;
  return (
    <div className="sbfx">
      <b>Borda</b>
      <Range
        label="Espessura"
        max={24}
        onChange={w =>
          onStyle(
            w
              ? {
                  borderColor: style.borderColor ?? "#1d1c1a",
                  borderStyle: style.borderStyle ?? "solid",
                  borderWidth: w,
                }
              : { borderWidth: undefined },
            "Borda"
          )
        }
        suffix="px"
        value={width}
      />
      {width > 0 ? (
        <div className="sbfx-row">
          <div className="sbfx-seg">
            {BORDER_STYLES.map(o => (
              <button
                className={
                  (style.borderStyle ?? "solid") === o.value ? "on" : ""
                }
                key={o.value}
                onClick={() =>
                  onStyle({ borderStyle: o.value }, "Estilo da borda")
                }
                type="button"
              >
                {o.label}
              </button>
            ))}
          </div>
          <ColorPickerButton
            onPick={c => onStyle({ borderColor: c }, "Cor da borda")}
            value={color}
          />
        </div>
      ) : null}
      <b>Cantos</b>
      <Range
        label="Arredondar"
        max={64}
        onChange={r =>
          onStyle({ borderRadius: r || undefined }, "Arredondamento")
        }
        suffix="px"
        value={Math.min(64, radius)}
      />
      <div className="sbfx-row">
        <button
          className="sbfx-btn"
          onClick={() => onStyle({ borderRadius: undefined }, "Cantos retos")}
          type="button"
        >
          Retos
        </button>
        <button
          className="sbfx-btn"
          onClick={() => onStyle({ borderRadius: "50%" }, "Círculo")}
          type="button"
        >
          Círculo
        </button>
      </div>
    </div>
  );
}

/** Sombra: predefinições e ajuste fino de desfoque, distância, intensidade e cor. `text` = sombra de letra. */
export function ShadowControls({
  onStyle,
  style,
  text = false,
}: {
  onStyle: OnStyle;
  style: Style;
  text?: boolean;
}) {
  const key = text ? "textShadow" : "boxShadow";
  const css = style[key];
  const current = presetOf(css, text);
  const shadow = parseShadow(css);
  const set = (s: Shadow | undefined) =>
    onStyle({ [key]: s ? formatShadow(s, text) : undefined }, "Sombra");
  const patch = (p: Partial<Shadow>) => {
    if (shadow) set({ ...shadow, ...p });
  };
  return (
    <div className="sbfx">
      <b>{text ? "Sombra da letra" : "Sombra"}</b>
      <div className="sbfx-seg">
        {SHADOW_PRESETS.map(p => (
          <button
            className={current === p.id ? "on" : ""}
            key={p.id}
            onClick={() => set(p.shadow)}
            type="button"
          >
            {p.label}
          </button>
        ))}
      </div>
      {shadow ? (
        <>
          <Range
            label="Desfoque"
            max={80}
            onChange={blur => patch({ blur })}
            suffix="px"
            value={shadow.blur}
          />
          <Range
            label="Para baixo"
            max={50}
            min={-50}
            onChange={y => patch({ y })}
            suffix="px"
            value={shadow.y}
          />
          <Range
            label="Para o lado"
            max={50}
            min={-50}
            onChange={x => patch({ x })}
            suffix="px"
            value={shadow.x}
          />
          <Range
            label="Intensidade"
            max={100}
            onChange={a => patch({ alpha: a / 100 })}
            suffix="%"
            value={Math.round(shadow.alpha * 100)}
          />
          <div className="sbe-line">
            <span>Cor da sombra</span>
            <ColorPickerButton
              onPick={color => patch({ color })}
              value={shadow.color}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
