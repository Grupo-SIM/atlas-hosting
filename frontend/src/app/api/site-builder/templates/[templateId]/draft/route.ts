import { saveTemplateDraft } from "@/app/(auth)/criador-de-sites/template-actions";
import { hasSession } from "@/lib/auth";
import {
  badRequest,
  forbiddenOrigin,
  isSameOrigin,
  sessionExpired,
} from "@/lib/site-builder/editor-route";

export const dynamic = "force-dynamic";

/** Salvamento do rascunho de um template (modo Dev), num endereço fixo como o dos sites. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  if (!isSameOrigin(request.headers)) return forbiddenOrigin();
  if (!(await hasSession())) return sessionExpired();
  const { templateId } = await params;
  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequest("Pedido inválido.");
  }
  return Response.json(await saveTemplateDraft(templateId, body.content));
}
