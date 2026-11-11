"use client";

import { useEffect, useState } from "react";
import type { LiveState } from "@/lib/site-builder/liveCheck";

/** `checking` até a primeira resposta; `null` quando não há o que checar. */
export type SiteLive = LiveState | "checking" | null;

const RETRY_MS = 5000;

/*
 * Um verificador só para a tela inteira: junta os sites de todos os cartões numa requisição
 * (`/api/site-builder/live-status`, checagens em paralelo no servidor) em vez de uma server action por
 * cartão — actions rodam em fila e seguravam a navegação enquanto o HEAD de cada site esperava.
 */
const listeners = new Map<string, Set<(state: SiteLive) => void>>();
const known = new Map<string, SiteLive>();
let timer: ReturnType<typeof setTimeout> | undefined;
let running = false;

function emit(id: string, state: SiteLive) {
  known.set(id, state);
  for (const fn of listeners.get(id) ?? []) fn(state);
}

/** Sites com cartão na tela que ainda não estão no ar (nem fora da checagem, `null`). */
const pending = () =>
  [...listeners.keys()].filter(id => {
    const state = known.get(id);
    return state !== "live" && state !== null;
  });

function schedule(delay: number) {
  if (timer || running) return;
  timer = setTimeout(tick, delay);
}

async function tick() {
  timer = undefined;
  const ids = pending();
  if (ids.length === 0) return;
  // Aba em segundo plano não precisa consultar.
  if (document.hidden) {
    schedule(RETRY_MS);
    return;
  }
  running = true;
  try {
    const res = await fetch(
      `/api/site-builder/live-status?ids=${ids.map(encodeURIComponent).join(",")}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const { states } = (await res.json()) as {
        states: Record<string, LiveState>;
      };
      // Fora da resposta = não publicado ou sem acesso: não há o que mostrar.
      for (const id of ids) emit(id, states[id] ?? null);
    } else if (res.status === 403) {
      for (const id of ids) emit(id, null);
    }
  } catch {
    // Rede instável: tenta de novo no próximo ciclo.
  } finally {
    running = false;
  }
  if (pending().length > 0) schedule(RETRY_MS);
}

/**
 * Confere se o site publicado já abre. Repete de poucos em poucos segundos
 * enquanto o DNS propaga ou o HTTPS é emitido e para assim que fica no ar.
 */
export function useSiteLive(siteId: string, enabled: boolean): SiteLive {
  const [state, setState] = useState<SiteLive>(enabled ? "checking" : null);

  useEffect(() => {
    if (!enabled) {
      setState(null);
      return;
    }
    // Remontou depois de já saber que está no ar (ou recém-publicado): confere de novo.
    if (known.get(siteId) !== "live") known.delete(siteId);
    // (`null` também é esquecido: o site pode ter sido publicado desde a última consulta.)
    setState(known.get(siteId) ?? "checking");
    let set = listeners.get(siteId);
    if (!set) {
      set = new Set();
      listeners.set(siteId, set);
    }
    set.add(setState);
    // Cartões que montam juntos entram na mesma requisição.
    schedule(0);
    return () => {
      set.delete(setState);
      if (set.size === 0) listeners.delete(siteId);
    };
  }, [siteId, enabled]);

  return state;
}
