import { describe, expect, test } from "bun:test";
import { getTemplate } from "../templates/index.js";
import { clearDraft, draftKey, readDraft, saveDraft } from "./draft-backup.js";

const memory = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    removeItem: (k: string) => void data.delete(k),
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};

const base = getTemplate("portal-noticias")?.site;
if (!base) throw new Error("template de teste não existe");
const edited = { ...structuredClone(base), name: "Outro nome" };

describe("draft-backup", () => {
  test("guarda, lê de volta e limpa", () => {
    const store = memory();
    saveDraft(store, "s1", edited);
    expect(store.data.has(draftKey("s1"))).toBe(true);
    expect(readDraft(store, "s1", base)?.name).toBe("Outro nome");
    clearDraft(store, "s1");
    expect(readDraft(store, "s1", base)).toBe(null);
  });

  test("cópia igual ao site do servidor não é oferecida", () => {
    const store = memory();
    saveDraft(store, "s1", base);
    expect(readDraft(store, "s1", base)).toBe(null);
  });

  test("lixo ou site inválido é ignorado", () => {
    const store = memory();
    store.setItem(draftKey("s1"), "{não é json");
    expect(readDraft(store, "s1", base)).toBe(null);
    store.setItem(draftKey("s1"), JSON.stringify({ name: 1 }));
    expect(readDraft(store, "s1", base)).toBe(null);
  });

  test("armazenamento que falha não derruba", () => {
    const broken = {
      getItem: () => {
        throw new Error("bloqueado");
      },
      removeItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("cheio");
      },
    };
    expect(() => saveDraft(broken, "s1", base)).not.toThrow();
    expect(() => clearDraft(broken, "s1")).not.toThrow();
    expect(readDraft(broken, "s1", base)).toBe(null);
  });
});
