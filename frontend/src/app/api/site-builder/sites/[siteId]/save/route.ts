import { saveSite } from "@/app/(auth)/criador-de-sites/actions";
import { hasSession } from "@/lib/auth";
import {
  badRequest,
  forbiddenOrigin,
  isSameOrigin,
  sessionExpired,
} from "@/lib/site-builder/editor-route";

export const dynamic = "force-dynamic";

/**
 * Salvamento do editor de sites. Mesma regra de `saveSite` (dono ou admin liberado; conteúdo consertado e validado),
 * mas num endereço que não muda a cada deploy, e sessão expirada vira aviso em vez de levar para o login.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  if (!isSameOrigin(request.headers)) return forbiddenOrigin();
  if (!(await hasSession())) return sessionExpired();
  const { siteId } = await params;
  let body: { abertoEm?: unknown; content?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequest("Pedido inválido.");
  }
  const result = await saveSite(
    siteId,
    body.content,
    typeof body.abertoEm === "string" ? body.abertoEm : undefined
  );
  return Response.json(result);
}
