import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgLog } from "@/lib/db/schema";
import { conferirTokenPdc, contaMaster, pdcErro } from "@/lib/pdc/auth";
import {
  postPdcSchema,
  publicarNoBuilder,
  type ResultadoPdc,
  subirCapa,
} from "@/lib/pdc/publicar-builder";
import { publicarNoWordPress } from "@/lib/pdc/publicar-wordpress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Republicar o site inteiro (export estático + envio) pode levar alguns minutos.
export const maxDuration = 600;

/**
 * Publica um post da Produção de Conteúdo (PDC) num site da conta master.
 * Reenviar o mesmo `pdcId` atualiza o mesmo post (nunca duplica).
 */
export async function POST(req: Request) {
  const negado = conferirTokenPdc(req);
  if (negado) return negado;

  const corpo = postPdcSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success)
    return pdcErro(
      `Post inválido: ${corpo.error.issues
        .slice(0, 3)
        .map(i => `${i.path.join(".")} ${i.message}`)
        .join("; ")}`,
      400
    );
  const post = corpo.data;

  const conta = await contaMaster();
  if (!conta) return pdcErro("Conta master não encontrada.", 404);

  let resultado: ResultadoPdc;
  try {
    const capaUrl = post.capa ? await subirCapa(post.capa) : null;
    resultado =
      post.destino.tipo === "builder"
        ? await publicarNoBuilder(conta, post.destino.id, post, capaUrl)
        : await publicarNoWordPress(conta, post.destino.id, post, capaUrl);
  } catch (e) {
    console.error("[pdc] Falha ao publicar post:", e);
    resultado = {
      error: e instanceof Error ? e.message : "Falha ao publicar o post.",
      ok: false,
    };
  }

  // Só a falha vira aviso no log da conta (o PDC também mostra o erro na Mesa).
  if (!resultado.ok)
    await db
      .insert(pgLog)
      .values({
        description: `Post ${post.pdcId} (${post.destino.tipo} ${post.destino.id}): ${resultado.error}`,
        severity: "danger",
        title: "Produção de Conteúdo: falha ao publicar post",
        type: "hosting",
        userId: conta.id,
      })
      .catch(() => undefined);

  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 422 });
}
