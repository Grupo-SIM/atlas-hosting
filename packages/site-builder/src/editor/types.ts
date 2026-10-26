export type SaveResult = { ok: true } | { error: string; ok: false };

export type ChangeKind = "Editado" | "Novo" | "Oculto" | "Removido" | "Tema";

/** Linha da lista "Revisar e publicar". */
export interface ChangeEntry {
  /** Bloco para selecionar ao clicar na linha. */
  id?: string;
  kind: ChangeKind;
  label: string;
}

/** Descreve uma edição: `key` junta edições seguidas do mesmo campo num passo de desfazer. */
export interface EditMeta {
  id?: string;
  key?: string;
  kind?: ChangeKind;
  label?: string;
}
