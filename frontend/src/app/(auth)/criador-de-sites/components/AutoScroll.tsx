"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Faz o conteúdo rolar sozinho dentro do contêiner pai (que precisa ter altura fixa e `overflow-hidden`),
 * como um vídeo da página passando: desce até o fim, pausa e volta. Respeita "reduzir movimento".
 */
export function AutoScroll({
  children,
  speed = 45,
}: {
  children: ReactNode;
  /** Pixels por segundo, na escala em que o site aparece na tela. */
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!(el && box)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animation: Animation | undefined;
    const start = () => {
      animation?.cancel();
      // O filho é o site reduzido por `transform`: só o retângulo dele tem a altura visível real.
      const shown = (el.firstElementChild ?? el).getBoundingClientRect().height;
      const distance = shown - box.clientHeight;
      if (distance <= 8) return;
      // 10% parado no topo, rola por 80%, 10% parado no fim; vai e volta.
      animation = el.animate(
        [
          { offset: 0, transform: "translateY(0)" },
          { offset: 0.1, transform: "translateY(0)" },
          { offset: 0.9, transform: `translateY(-${distance}px)` },
          { offset: 1, transform: `translateY(-${distance}px)` },
        ],
        {
          direction: "alternate",
          duration: ((distance / speed) * 1000) / 0.8,
          easing: "linear",
          iterations: Number.POSITIVE_INFINITY,
        }
      );
    };

    start();
    // O site cresce conforme as imagens carregam: remede.
    const observer = new ResizeObserver(start);
    observer.observe(el);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [speed]);

  return (
    <div ref={ref} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
