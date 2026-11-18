import { NextResponse } from "next/server";
import { conferirTokenPdc, contaMaster, pdcErro } from "@/lib/pdc/auth";
import { sitesBuilder, sitesWordPress } from "@/lib/pdc/sites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sites da conta master em que a Produção de Conteúdo (PDC) pode postar. */
export async function GET(req: Request) {
  const negado = conferirTokenPdc(req);
  if (negado) return negado;
  const conta = await contaMaster();
  if (!conta) return pdcErro("Conta master não encontrada.", 404);

  const [builder, wordpress] = await Promise.all([
    sitesBuilder(conta),
    // Plesk fora do ar não pode esconder os sites do Criador.
    sitesWordPress(conta).catch(e => {
      console.error("[pdc] WordPress do Plesk indisponível:", e);
      return [];
    }),
  ]);
  return NextResponse.json({ ok: true, sites: [...builder, ...wordpress] });
}
