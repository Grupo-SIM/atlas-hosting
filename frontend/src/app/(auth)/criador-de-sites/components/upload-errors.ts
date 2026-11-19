import { UPLOAD_LIMIT_MB } from "@repo/site-builder";
import { staleActionMessage } from "@/lib/site-builder/stale-action";

/**
 * Mensagem para a pessoa quando o envio de imagem ou vídeo quebra no caminho. Erro de servidor em produção chega como
 * um texto técnico genérico ("An error occurred in the Server Components render…"): isso não serve para ninguém.
 */
export function uploadFailureMessage(
  error: unknown,
  kind: "image" | "video"
): string {
  const stale = staleActionMessage(error);
  if (stale) return stale;
  const text = error instanceof Error ? error.message : "";
  const technical =
    !text ||
    /server components render|body exceeded|failed to fetch|fetch failed|network|unexpected response|digest/i.test(
      text
    );
  if (!technical) return text;
  const what = kind === "video" ? "o vídeo" : "a imagem";
  return `Não foi possível enviar ${what}. Confira se ele tem no máximo ${UPLOAD_LIMIT_MB[kind]} MB e tente de novo.`;
}
