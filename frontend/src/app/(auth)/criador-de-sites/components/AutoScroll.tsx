"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Faz o conteúdo rolar sozinho dentro do contêiner pai (que precisa ter altura fixa e `overflow-hidden`),
 * como um vídeo da página passando: desce até o fim, pausa e volta. Respeita "reduzir movimento" e fica
 * pausado enquanto o contêiner não aparece na tela.
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
    let distance = 0;
    let duration = 0;
    let visible = true;

    const start = () => {
      // O filho é o site reduzido por `transform`: só o retângulo dele tem a altura visível real.
      const shown = (el.firstElementChild ?? el).getBoundingClientRect().height;
      const next = shown - box.clientHeight;
      // O ResizeObserver também dispara quando nada que importa mudou.
      if (animation && Math.abs(next - distance) < 1) return;
      // O site cresce conforme as imagens carregam: continua do mesmo ponto em vez de voltar ao topo.
      const done =
        animation && duration
          ? Number(animation.currentTime ?? 0) / duration
          : 0;
      animation?.cancel();
      animation = undefined;
      distance = next;
      if (distance <= 8) return;
      duration = ((distance / speed) * 1000) / 0.8;
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
          duration,
          easing: "linear",
          iterations: Number.POSITIVE_INFINITY,
        }
      );
      animation.currentTime = done * duration;
      if (!visible) animation.pause();
    };

    start();
    const resize = new ResizeObserver(start);
    resize.observe(el);
    resize.observe(box);
    // Fora da tela não há o que ver: pausa e retoma de onde parou.
    const view = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) animation?.play();
      else animation?.pause();
    });
    view.observe(box);
    return () => {
      resize.disconnect();
      view.disconnect();
      animation?.cancel();
    };
  }, [speed]);

  return (
    <div ref={ref} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
