"use client";

import { useEffect, useState } from "react";
import type { LiveState } from "@/lib/site-builder/liveCheck";
import { checkSiteLiveStatus } from "../live-actions";

/** `checking` até a primeira resposta; `null` quando não há o que checar. */
export type SiteLive = LiveState | "checking" | null;

const RETRY_MS = 5000;

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
    setState(prev => prev ?? "checking");
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      // Aba em segundo plano não precisa consultar.
      if (!document.hidden) {
        try {
          const result = await checkSiteLiveStatus(siteId);
          if (cancelled) return;
          if (!result.ok) {
            setState(null);
            return;
          }
          setState(result.state);
          if (result.state === "live") return;
        } catch {
          if (cancelled) return;
        }
      }
      timer = setTimeout(tick, RETRY_MS);
    };
    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [siteId, enabled]);

  return state;
}
