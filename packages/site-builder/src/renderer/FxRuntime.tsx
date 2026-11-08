"use client";

import { useEffect } from "react";
import { FX_RUNTIME, FX_VERSION } from "./fx-runtime.js";
import { NAV_RUNTIME } from "./nav-runtime.js";

declare global {
  interface Window {
    __sbFxV?: number;
    __sbNav?: number;
    __sbNavOff?: () => void;
    sbFx?: () => () => void;
  }
}

/** Liga os efeitos na prévia (no site publicado o mesmo script vai inline no HTML). */
export function FxRuntime() {
  useEffect(() => {
    if (!window.sbFx || window.__sbFxV !== FX_VERSION) {
      const script = document.createElement("script");
      script.textContent = FX_RUNTIME;
      document.body.appendChild(script);
      script.remove();
    }
    if (window.__sbNav !== 4) {
      const script = document.createElement("script");
      script.textContent = NAV_RUNTIME;
      document.body.appendChild(script);
      script.remove();
    }
    return window.sbFx?.();
  }, []);
  return null;
}
