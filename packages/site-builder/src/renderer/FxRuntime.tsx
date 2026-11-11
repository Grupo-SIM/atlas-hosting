"use client";

import { useEffect } from "react";
import { FX_RUNTIME, FX_VERSION } from "./fx-runtime.js";
import { MARGEM_RUNTIME, MG_VERSION } from "./margem-runtime.js";
import { NAV_RUNTIME } from "./nav-runtime.js";
import { UNIVERSO_RUNTIME, UV_VERSION } from "./universo-runtime.js";

declare global {
  interface Window {
    __sbFxV?: number;
    __sbMgV?: number;
    __sbNav?: number;
    __sbNavOff?: () => void;
    __sbUvV?: number;
    sbFx?: (root?: ParentNode) => () => void;
    sbMargem?: (root?: ParentNode) => () => void;
    sbUniverso?: (root?: ParentNode) => () => void;
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

const ensureUniverso = () => {
  if (!window.sbUniverso || window.__sbUvV !== UV_VERSION)
    inject(UNIVERSO_RUNTIME);
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
    // Cartas do template Universo: idem, só com um bloco `data-uv`.
    let offUv: (() => void) | undefined;
    if (document.querySelector("[data-uv]")) {
      ensureUniverso();
      offUv = window.sbUniverso?.();
    }
    return () => {
      offFx?.();
      offMg?.();
      offUv?.();
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
  let offUv: (() => void) | undefined;
  if (root.querySelector("[data-uv]")) {
    ensureUniverso();
    offUv = window.sbUniverso?.(root);
  }
  return () => {
    offFx?.();
    offMg?.();
    offUv?.();
  };
}
