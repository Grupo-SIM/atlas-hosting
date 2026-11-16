/**
 * Limites de envio de arquivos do editor. Fonte única: o servidor (server actions de upload) recusa acima disto e a
 * interface avisa antes de enviar, com o mesmo número.
 */
export const UPLOAD_LIMIT_MB = { font: 3, image: 8, video: 25 } as const;

export type UploadKind = keyof typeof UPLOAD_LIMIT_MB;

export const uploadLimitBytes = (kind: UploadKind): number =>
  UPLOAD_LIMIT_MB[kind] * 1024 * 1024;

export const IMAGE_FORMATS = "JPG, PNG, WebP ou SVG";
export const VIDEO_FORMATS = "MP4 ou WebM";

/** "12,4 MB", "340 KB". */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const SUBJECT: Record<UploadKind, string> = {
  font: "Esta fonte",
  image: "Esta imagem",
  video: "Este vídeo",
};

/** Mensagem para a pessoa quando o arquivo passa do limite; `null` se está dentro. */
export function uploadSizeError(
  file: { size: number },
  kind: UploadKind
): string | null {
  if (file.size <= uploadLimitBytes(kind)) return null;
  return `${SUBJECT[kind]} tem ${formatSize(file.size)}; o limite é de ${UPLOAD_LIMIT_MB[kind]} MB. Reduza o tamanho (ou comprima) e envie de novo.`;
}
