import type { Site } from "../model/index.js";

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

// ---------- Atlas IA (aba "IA") ----------

/** Conexão da assinatura Claude do usuário. */
export type AiStatus =
  | { available: false }
  | { available: true; connected: false }
  | { available: true; connected: true; email?: string; plan?: string };

export interface AiFailure {
  error: string;
  ok: false;
}

/** Imagem anexada a uma mensagem (colada, escolhida ou arrastada). */
export interface AiImage {
  /** Base64 sem o prefixo `data:`. */
  data: string;
  mediaType: string;
  /** URL pública, se o arquivo já foi enviado ao site (a IA pode usá-la nos blocos). */
  url?: string;
}

export interface AiMessage {
  role: "assistant" | "user";
  text: string;
}

/** O que o editor sabe do momento, enviado à IA junto com o site. */
export interface AiChatContext {
  currentRoot?: string;
  currentTitle?: string;
  selected?: { id: string; type: string };
}

/** Evento do chat em andamento (o servidor manda um por linha). */
export type AiChatEvent =
  | { text: string; type: "delta" }
  | { reading: boolean; type: "tool" }
  | { change?: string; site: Site; type: "site" }
  | { message: string; type: "error" }
  | { type: "done" };

/** Ligação do editor com a Atlas IA; quem hospeda o editor (o Atlas) implementa. Sem isso a aba fica "em breve". */
export interface AiConfig {
  chat: (
    input: {
      context: AiChatContext;
      /** Anexos da última mensagem do usuário. */
      images?: AiImage[];
      messages: AiMessage[];
      site: Site;
    },
    onEvent: (event: AiChatEvent) => void,
    signal: AbortSignal
  ) => Promise<void>;
  disconnect: () => Promise<{ ok: true } | AiFailure>;
  finishLogin: (
    loginId: string,
    code: string
  ) => Promise<{ email?: string; ok: true; plan?: string } | AiFailure>;
  startLogin: () => Promise<
    { loginId: string; ok: true; url: string } | AiFailure
  >;
  status: () => Promise<AiFailure | AiStatus>;
}
