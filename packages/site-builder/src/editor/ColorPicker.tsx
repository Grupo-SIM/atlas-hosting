"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type Hsv, hexToHsv, hsvToHex, normalizeHex } from "./color-math.js";
import { Icon } from "./icons.js";

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

/** Chama `fn` no máximo uma vez por quadro: arrastar no seletor não refaz o site mais vezes do que a tela mostra. */
function useFrameThrottle<T>(fn: (value: T) => void) {
  const latest = useRef(fn);
  latest.current = fn;
  const pending = useRef<{ value: T } | null>(null);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (value: T, flush = false) => {
    pending.current = { value };
    if (flush) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      latest.current(value);
      pending.current = null;
      return;
    }
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      if (pending.current) latest.current(pending.current.value);
      pending.current = null;
    });
  };
}

/** Arrasta dentro de uma área: devolve a posição (0–1) a cada movimento. */
function useDrag(onMove: (x: number, y: number) => void) {
  const at = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onMove(
      Math.min(1, Math.max(0, (e.clientX - r.left) / (r.width || 1))),
      Math.min(1, Math.max(0, (e.clientY - r.top) / (r.height || 1)))
    );
  };
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      at(e);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) at(e);
    },
  };
}

/**
 * Seletor de cor como o do Canva: um quadrado em degradê onde se escolhe a cor e a intensidade (saturação e brilho),
 * a barra de matiz, o código da cor e o conta-gotas (onde o navegador tem).
 */
export function ColorPicker({
  onChange,
  value,
}: {
  onChange: (hex: string) => void;
  value: string;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [text, setText] = useState(normalizeHex(value) ?? value);
  const emit = useFrameThrottle<string>(onChange);

  // Mudança que veio de fora (outro seletor, "voltar ao padrão"): acompanha, sem perder o matiz em cinza e preto.
  useEffect(() => {
    const next = normalizeHex(value);
    if (!next || next === hsvToHex(hsv)) return;
    const parsed = hexToHsv(next);
    setHsv(h => ({
      h: parsed.s === 0 || parsed.v === 0 ? h.h : parsed.h,
      s: parsed.s,
      v: parsed.v,
    }));
    setText(next);
  }, [value]);

  const apply = (next: Hsv, flush = false) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setText(hex);
    emit(hex, flush);
  };

  const box = useDrag((x, y) => apply({ ...hsv, s: x, v: 1 - y }));
  const hue = useDrag(x => apply({ ...hsv, h: x * 360 }));
  const hex = hsvToHex(hsv);
  const dropper = (globalThis as unknown as { EyeDropper?: EyeDropperCtor })
    .EyeDropper;

  return (
    <div className="sbp">
      <div
        className="sbp-box"
        style={{ background: `hsl(${hsv.h} 100% 50%)` }}
        title="Cor e intensidade"
        {...box}
      >
        <i
          className="sbp-dot"
          style={
            {
              background: hex,
              left: `${hsv.s * 100}%`,
              top: `${(1 - hsv.v) * 100}%`,
            } as CSSProperties
          }
        />
      </div>
      <div className="sbp-hue" title="Matiz" {...hue}>
        <i
          className="sbp-dot"
          style={{
            background: `hsl(${hsv.h} 100% 50%)`,
            left: `${(hsv.h / 360) * 100}%`,
          }}
        />
      </div>
      <div className="sbp-row">
        <label className="sbp-hex">
          <i style={{ background: hex }} />
          <input
            aria-label="Código da cor"
            onChange={e => {
              setText(e.target.value);
              const n = normalizeHex(e.target.value);
              if (n) apply(hexToHsv(n), true);
            }}
            spellCheck={false}
            type="text"
            value={text}
          />
        </label>
        {dropper ? (
          <button
            aria-label="Conta-gotas: pegar uma cor da tela"
            className="sbp-eye"
            onClick={() => {
              new dropper()
                .open()
                .then(r => {
                  const n = normalizeHex(r.sRGBHex);
                  if (n) apply(hexToHsv(n), true);
                })
                .catch(() => {});
            }}
            title="Conta-gotas: pegar uma cor da tela"
            type="button"
          >
            <Icon name="pipette" size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Botão que abre o seletor: o quadradinho com a cor atual (`square`) ou o círculo de arco-íris "Adicionar nova cor"
 * (`add`). A janela abre ao lado do botão e fecha ao clicar fora.
 */
export function ColorPickerButton({
  onPick,
  value,
  variant = "square",
}: {
  onPick: (hex: string) => void;
  /** Cor atual (hex); sem valor o seletor começa em branco. */
  value?: string;
  variant?: "add" | "square";
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = normalizeHex(value ?? "") ?? "#ffffff";

  useLayoutEffect(() => {
    if (!(open && button.current)) return;
    const r = button.current.getBoundingClientRect();
    const w = 232;
    const h = 250;
    setPos({
      left: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)),
      top:
        r.bottom + 6 + h > window.innerHeight
          ? Math.max(8, r.top - h - 6)
          : r.bottom + 6,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const down = (e: globalThis.PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", down);
    return () => window.removeEventListener("pointerdown", down);
  }, [open]);

  return (
    <div className="sbp-wrap" ref={root}>
      <button
        aria-expanded={open}
        className={variant === "add" ? "sbp-add" : "sbp-square"}
        onClick={() => setOpen(o => !o)}
        ref={button}
        style={variant === "square" ? { background: current } : undefined}
        title={
          variant === "add" ? "Adicionar nova cor" : "Escolher a cor no seletor"
        }
        type="button"
      >
        {variant === "add" ? <Icon name="plus" size={13} /> : null}
      </button>
      {open && pos ? (
        <div className="sbp-pop" style={{ left: pos.left, top: pos.top }}>
          <ColorPicker onChange={onPick} value={current} />
        </div>
      ) : null}
    </div>
  );
}
