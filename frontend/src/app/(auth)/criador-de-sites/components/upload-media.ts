"use client";

import { uploadSiteImage, uploadSiteVideo } from "../actions";
import { uploadFailureMessage } from "./upload-errors";

/**
 * Envia a imagem ou o vídeo escolhido no editor e devolve a URL pública. O tipo do arquivo escolhe a ação
 * (anúncios e posts aceitam vídeo); qualquer falha vira uma mensagem que a pessoa entende.
 */
export async function uploadSiteMedia(file: File): Promise<string> {
  const kind = file.type.startsWith("video/") ? "video" : "image";
  try {
    const data = new FormData();
    data.append("file", file);
    const result =
      kind === "video"
        ? await uploadSiteVideo(data)
        : await uploadSiteImage(data);
    if (!result.ok) throw new Error(result.error);
    return result.url;
  } catch (error) {
    throw new Error(uploadFailureMessage(error, kind));
  }
}
