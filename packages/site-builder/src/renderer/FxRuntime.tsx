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
    sbFx?: (root?: ParentNode) => () => void;
    sbMargem?: (root?: ParentNode) => () => void;
  }
}

const inject = (code: string) => {
  const script = document.createElement("script");
  script.textContent = code;
  document.body.appendChild(script);
  script.remove();
};

const ensureFx = () => {
  if (!window.sbFx || window.__sbFxV !== FX_VERSION) inject(FX_RUNTIME);
};

const ensureMargem = () => {
  if (!window.sbMargem || window.__sbMgV !== MG_VERSION) inject(MARGEM_RUNTIME);
};

/** Liga os efeitos na prévia (no site publicado o mesmo script vai inline no HTML). */
export function FxRuntime() {
  useEffect(() => {
    ensureFx();
    if (window.__sbNav !== 6) inject(NAV_RUNTIME);
    const offFx = window.sbFx?.();
    // Movimento do template Margem: só carrega quando a página tem um bloco dele.
    let offMg: (() => void) | undefined;
    if (document.querySelector("[data-mg]")) {
      ensureMargem();
      offMg = window.sbMargem?.();
    }
    return () => {
      offFx?.();
      offMg?.();
    };
  }, []);
  return null;
}

/**
 * Liga os efeitos só dentro de `root` e devolve o desligamento. Para miniaturas (várias na mesma tela, cada uma
 * montada e desmontada conforme aparece): renderize o `SiteRenderer` com `skipFxRuntime` e chame isto com o
 * contêiner dele. Sem o runtime de navegação, porque miniatura não recebe clique.
 */
export function startSiteFx(root: ParentNode): () => void {
  ensureFx();
  const offFx = window.sbFx?.(root);
  let offMg: (() => void) | undefined;
  if (root.querySelector("[data-mg]")) {
    ensureMargem();
    offMg = window.sbMargem?.(root);
  }
  return () => {
    offFx?.();
    offMg?.();
  };
}
