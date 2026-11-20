import { SESSION_EXPIRED_MESSAGE } from "./editor-route";

/**
 * Chamadas do editor às rotas `/api/site-builder/...` (salvar e enviar arquivos). Toda falha vira `{ ok: false,
 * error }` com uma mensagem que a pessoa entende — nunca uma exceção que derrube o editor nem um redirecionamento
 * que tire a pessoa da página (lá estão as alterações que ainda não foram salvas).
 */
export interface Failure {
  error: string;
  ok: false;
}

const OFFLINE =
  "Sem conexão com o servidor. Suas alterações continuam nesta página; clique em “Tentar de novo”.";

/** Resposta da rota → o JSON dela, ou uma falha com mensagem (sessão, arquivo grande, servidor fora). */
export async function readEditorResponse<T extends { ok: boolean }>(
  res: Response
): Promise<T | Failure> {
  // Sessão expirada em algum ponto do caminho virou redirecionamento para o login.
  if (res.redirected && /\/login/.test(res.url))
    return { error: SESSION_EXPIRED_MESSAGE, ok: false };
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (body && typeof body === "object" && "ok" in body) return body as T;
  if (res.status === 401) return { error: SESSION_EXPIRED_MESSAGE, ok: false };
  if (res.status === 413)
    return {
      error:
        "O arquivo é grande demais para enviar. Reduza o tamanho e tente de novo.",
      ok: false,
    };
  return {
    error: `O servidor não respondeu agora (erro ${res.status}). Suas alterações continuam nesta página; tente de novo em instantes.`,
    ok: false,
  };
}

export async function postEditorJson<T extends { ok: boolean }>(
  url: string,
  body: unknown
): Promise<T | Failure> {
  let res: Response;
  try {
    res = await fetch(url, {
      body: JSON.stringify(body),
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  } catch {
    return { error: OFFLINE, ok: false };
  }
  return readEditorResponse<T>(res);
}

export type UploadKind = "font" | "image" | "video";

/** Envia o arquivo pela rota de upload do editor. */
export async function uploadEditorFile<T extends { ok: boolean }>(
  kind: UploadKind,
  file: File
): Promise<T | Failure> {
  const data = new FormData();
  data.append("kind", kind);
  data.append("file", file);
  let res: Response;
  try {
    res = await fetch("/api/site-builder/upload", {
      body: data,
      credentials: "same-origin",
      method: "POST",
    });
  } catch {
    return { error: OFFLINE, ok: false };
  }
  return readEditorResponse<T>(res);
}
