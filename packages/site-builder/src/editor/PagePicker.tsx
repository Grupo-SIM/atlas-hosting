"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons.js";

export interface RouteGroup {
  items: { label: string; value: string }[];
  label: string;
}

/** Seletor de página do topo: menu próprio, agrupado, com a página atual marcada. */
export function PagePicker({
  current,
  groups,
  onPick,
  value,
}: {
  current: string;
  groups: RouteGroup[];
  onPick: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="sbe-pick" ref={root}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="sbe-pickbtn"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <strong>{current}</strong>
        <Icon name="chevron-down" size={12} />
      </button>
      {open ? (
        <div className="sbe-pickmenu" role="listbox">
          {groups
            .filter(g => g.items.length > 0)
            .map(g => (
              <div key={g.label}>
                <div className="sbe-pickgroup">{g.label}</div>
                {g.items.map(o => (
                  <button
                    aria-selected={o.value === value}
                    className={o.value === value ? "on" : ""}
                    key={o.value}
                    onClick={() => {
                      setOpen(false);
                      onPick(o.value);
                    }}
                    role="option"
                    type="button"
                  >
                    <span>{o.label}</span>
                    {o.value === value ? <Icon name="check" size={13} /> : null}
                  </button>
                ))}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
