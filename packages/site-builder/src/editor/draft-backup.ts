import type { Site } from "../model/index.js";

/**
 * Cópia do site no navegador quando o salvamento falha (página desatualizada depois de um deploy, internet fora…).
 * Quem recarrega a página não perde o que fez: o editor oferece recuperar. É só uma rede de segurança; o site de
 * verdade é o do servidor, e a cópia sai assim que um salvamento dá certo.
 */
type Store = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export const draftKey = (storageKey: string) => `sbe-draft:${storageKey}`;

export function saveDraft(store: Store, storageKey: string, site: Site): void {
  try {
    store.setItem(draftKey(storageKey), JSON.stringify(site));
  } catch {
    // Sem espaço ou armazenamento bloqueado: segue sem a cópia.
  }
}

export function clearDraft(store: Store, storageKey: string): void {
  try {
    store.removeItem(draftKey(storageKey));
  } catch {
    // nada a fazer
  }
}

/**
 * Confere só a forma (não o conteúdo de cada bloco): é o suficiente para não recuperar lixo, e o servidor valida o
 * site inteiro ao salvar. Não usa o `siteSchema` aqui de propósito: o editor roda no navegador e não deve puxá-lo.
 */
export function looksLikeSite(value: unknown): value is Site {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    ["categories", "footer", "header", "menu", "pages", "posts"].every(k =>
      Array.isArray(v[k])
    ) &&
    typeof v.theme === "object" &&
    v.theme !== null
  );
}

/** A cópia guardada, se existe, é um site válido e é diferente do que o servidor entregou agora. */
export function readDraft(
  store: Store,
  storageKey: string,
  current: Site
): Site | null {
  try {
    const raw = store.getItem(draftKey(storageKey));
    if (!raw) return null;
    const draft: unknown = JSON.parse(raw);
    if (!looksLikeSite(draft)) return null;
    return JSON.stringify(draft) === JSON.stringify(current) ? null : draft;
  } catch {
    return null;
  }
}
