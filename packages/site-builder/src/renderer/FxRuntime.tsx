"use client";

import { useEffect } from "react";
import { FX_RUNTIME, FX_VERSION } from "./fx-runtime.js";
import { MARGEM_RUNTIME, MG_VERSION } from "./margem-runtime.js";
import { NAV_RUNTIME } from "./nav-runtime.js";

declare global {
  interface Window {
    __sbFxV?: number;
    __sbMgV?: number;
    __sbNav?: number;
    __sbNavOff?: () => void;
    sbFx?: () => () => void;
    sbMargem?: () => () => void;
  }
}

const inject = (code: string) => {
  const script = document.createElement("script");
  script.textContent = code;
  document.body.appendChild(script);
  script.remove();
};

/** Liga os efeitos na prévia (no site publicado o mesmo script vai inline no HTML). */
export function FxRuntime() {
  useEffect(() => {
    if (!window.sbFx || window.__sbFxV !== FX_VERSION) inject(FX_RUNTIME);
    if (window.__sbNav !== 4) inject(NAV_RUNTIME);
    const offFx = window.sbFx?.();
    // Movimento do template Margem: só carrega quando a página tem um bloco dele.
    let offMg: (() => void) | undefined;
    if (document.querySelector("[data-mg]")) {
      if (!window.sbMargem || window.__sbMgV !== MG_VERSION)
        inject(MARGEM_RUNTIME);
      offMg = window.sbMargem?.();
    }
    return () => {
      offFx?.();
      offMg?.();
    };
  }, []);
  return null;
}
