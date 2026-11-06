import { timingSafeEqual } from "node:crypto";
import { AiToolError, runAiTool } from "@repo/site-builder";
import { turns } from "@/lib/site-builder/ai/turns";

export const dynamic = "force-dynamic";

/**
 * Chamada pelo worker (ponte MCP) quando o Claude usa uma ferramenta de edição.
 * Não usa sessão: quem autoriza é o token do turno, que só existe durante o chat do usuário.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ turnId: string }> }
) {
  const { turnId } = await params;
  const turn = turns.get(turnId);
  const given = Buffer.from(
    (request.headers.get("authorization") ?? "").replace(/^Bearer /, "")
  );
  const want = Buffer.from(turn?.token ?? "-");
  if (!(turn && given.length === want.length && timingSafeEqual(given, want))) {
    return Response.json({ error: "Turno inválido." }, { status: 401 });
  }

  let body: { input?: Record<string, unknown>; name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const name = String(body.name ?? "");

  const run = turn.chain.then(() => {
    try {
      const outcome = runAiTool(turn.site, name, body.input ?? {});
      if (outcome.site !== turn.site) {
        turn.site = outcome.site;
        turn.emit({ change: outcome.change, site: outcome.site, type: "site" });
      }
      return Response.json({ result: outcome.result });
    } catch (error) {
      if (error instanceof AiToolError) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      console.error("[Atlas IA] erro em ferramenta", name, error);
      return Response.json(
        { error: "Erro interno ao executar a ferramenta." },
        { status: 500 }
      );
    }
  });
  turn.chain = run;
  return run;
}
