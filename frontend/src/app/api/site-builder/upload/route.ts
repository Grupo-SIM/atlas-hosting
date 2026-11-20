import {
  uploadSiteFont,
  uploadSiteImage,
  uploadSiteVideo,
} from "@/app/(auth)/criador-de-sites/actions";
import { hasSession } from "@/lib/auth";
import {
  badRequest,
  forbiddenOrigin,
  isSameOrigin,
  sessionExpired,
} from "@/lib/site-builder/editor-route";

export const dynamic = "force-dynamic";

const UPLOADERS = {
  font: uploadSiteFont,
  image: uploadSiteImage,
  video: uploadSiteVideo,
} as const;

/**
 * Envio de imagem, vídeo ou fonte do editor (campo `kind` + `file`). As regras (tipo, tamanho, conversão) são as
 * das ações de upload; aqui só muda o endereço, que não muda a cada deploy.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) return forbiddenOrigin();
  if (!(await hasSession())) return sessionExpired();
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Envio inválido. Tente de novo.");
  }
  const kind = form.get("kind");
  const upload =
    typeof kind === "string" && kind in UPLOADERS
      ? UPLOADERS[kind as keyof typeof UPLOADERS]
      : null;
  if (!upload) return badRequest("Tipo de envio inválido.");
  return Response.json(await upload(form));
}
