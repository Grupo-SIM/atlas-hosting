"use client";

import { mediaKindOf } from "@repo/site-builder";
import { uploadEditorFile } from "@/lib/site-builder/editor-client";
import { uploadFailureMessage } from "./upload-errors";

/**
 * Envia a imagem ou o vídeo escolhido no editor e devolve a URL pública. O tipo do arquivo escolhe o envio
 * (anúncios e posts aceitam vídeo); qualquer falha vira uma mensagem que a pessoa entende. Vai pela rota
 * `/api/site-builder/upload`, que não muda de endereço a cada deploy.
 */
export async function uploadSiteMedia(file: File): Promise<string> {
  const kind = mediaKindOf(file) === "video" ? "video" : "image";
  let result: { error: string; ok: false } | { ok: true; url: string };
  try {
    result = await uploadEditorFile<{ ok: true; url: string }>(kind, file);
  } catch (error) {
    throw new Error(uploadFailureMessage(error, kind));
  }
  if (!result.ok)
    throw new Error(uploadFailureMessage(new Error(result.error), kind));
  return result.url;
}

/** Fonte própria do editor (.woff2, .woff, .ttf, .otf), pela mesma rota de envio. */
export async function uploadSiteFontFile(
  file: File
): Promise<{ name: string; url: string }> {
  const result = await uploadEditorFile<{
    name: string;
    ok: true;
    url: string;
  }>("font", file);
  if (!result.ok) throw new Error(result.error);
  return { name: result.name, url: result.url };
}
