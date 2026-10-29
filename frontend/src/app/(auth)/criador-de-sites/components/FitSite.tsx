"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

/**
 * Mostra o site numa largura de desktop (`designWidth`) reduzida para caber na largura do contêiner pai,
 * então a miniatura sempre preenche o espaço, qualquer que seja o tamanho do cartão.
 */
export function FitSite({
  children,
  designWidth = 1280,
}: {
  children: ReactNode;
  designWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () => setScale(parent.clientWidth / designWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [designWidth]);

  return (
    <div
      aria-hidden="true"
      ref={ref}
      style={{
        pointerEvents: "none",
        transform: `scale(${scale ?? 0.3})`,
        transformOrigin: "top left",
        visibility: scale === null ? "hidden" : "visible",
        width: designWidth,
      }}
    >
      {children}
    </div>
  );
}
