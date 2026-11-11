"use client";

import { startSiteFx } from "@repo/site-builder/fx";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AutoScroll } from "./AutoScroll";
import { FitSite } from "./FitSite";

/*
 * Fila de montagem: cada miniatura é um site inteiro (centenas de elementos e dezenas de KB de CSS), então
 * monta uma por vez, quando o navegador está livre, em vez de todas no mesmo quadro.
 */
const queue: (() => void)[] = [];
let draining = false;

const whenIdle = (fn: () => void) => {
  // O Safari não tem `requestIdleCallback`.
  if (typeof window.requestIdleCallback === "function")
    window.requestIdleCallback(fn, { timeout: 250 });
  else setTimeout(fn, 32);
};

function drain() {
  const next = queue.shift();
  if (!next) {
    draining = false;
    return;
  }
  next();
  whenIdle(drain);
}

function enqueue(fn: () => void) {
  if (queue.includes(fn)) return;
  queue.push(fn);
  if (!draining) {
    draining = true;
    whenIdle(drain);
  }
}

function dequeue(fn: () => void) {
  const i = queue.indexOf(fn);
  if (i >= 0) queue.splice(i, 1);
}

/** Contêiner que realmente rola (o `main` do app); `null` quando quem rola é a janela. */
function scrollParent(el: Element): Element | null {
  for (
    let p = el.parentElement;
    p && p !== document.body;
    p = p.parentElement
  ) {
    const { overflowY } = getComputedStyle(p);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      p.scrollHeight > p.clientHeight + 1
    )
      return p;
  }
  return null;
}

/** Tempo fora da área antes de desmontar: rolar para cima e para baixo não remonta o site à toa. */
const UNMOUNT_MS = 1500;

/**
 * Miniatura ao vivo de um site, para grades com muitos cartões. Preenche o pai (que precisa ser `relative`)
 * e só monta o site quando o cartão está a até uma tela de distância da área visível; longe, desmonta e fica
 * só a cor de fundo do cartão. Os efeitos ligam só dentro do cartão (`startSiteFx`), então o `SiteRenderer`
 * passado deve vir com `skipFxRuntime`.
 */
export function LiveThumb({
  children,
  scrollSpeed,
}: {
  children: ReactNode;
  /** Rola o site sozinho (`AutoScroll`) nesta velocidade; sem valor, fica parado no topo. */
  scrollSpeed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    let leave: ReturnType<typeof setTimeout> | undefined;
    const mount = () => setLive(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          clearTimeout(leave);
          enqueue(mount);
        } else {
          dequeue(mount);
          clearTimeout(leave);
          leave = setTimeout(() => setLive(false), UNMOUNT_MS);
        }
      },
      { root: scrollParent(box), rootMargin: "100% 0px" }
    );
    observer.observe(box);
    return () => {
      observer.disconnect();
      dequeue(mount);
      clearTimeout(leave);
    };
  }, []);

  useEffect(() => {
    const box = ref.current;
    if (!(live && box)) return;
    return startSiteFx(box);
  }, [live]);

  return (
    <div className="absolute inset-0 overflow-hidden" ref={ref}>
      {live ? (
        scrollSpeed ? (
          <AutoScroll speed={scrollSpeed}>
            <FitSite>{children}</FitSite>
          </AutoScroll>
        ) : (
          <FitSite>{children}</FitSite>
        )
      ) : null}
    </div>
  );
}
