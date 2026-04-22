import { db } from "@/lib/db";
import { pgVpsServers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Atualiza o token de autenticação de um servidor VPS.
 * 
 * Body JSON:
 *   - ip: IP do servidor VPS
 *   - newToken: novo token que o bot Sentinel vai usar
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ip, newToken } = body;

    if (!ip || !newToken) {
      return NextResponse.json(
        { error: "Campos obrigatórios: ip, newToken" },
        { status: 400 }
      );
    }

    // Busca o VPS pelo IP
    const vps = await db.query.pgVpsServers.findFirst({
      where: eq(pgVpsServers.ip, ip),
      columns: { id: true, name: true, ip: true, token: true },
    });

    if (!vps) {
      return NextResponse.json(
        { error: `VPS não encontrado com ip=${ip}` },
        { status: 404 }
      );
    }

    console.log(`[fix-token] BEFORE: VPS="${vps.name}" (${vps.ip}), token=${vps.token?.slice(0, 15)}...`);

    // Atualiza o token
    await db.update(pgVpsServers)
      .set({ token: newToken })
      .where(eq(pgVpsServers.id, vps.id));

    // Confirma leitura
    const after = await db.query.pgVpsServers.findFirst({
      where: eq(pgVpsServers.id, vps.id),
      columns: { id: true, token: true, name: true, ip: true },
    });

    console.log(`[fix-token] AFTER: VPS="${after?.name}" (${after?.ip}), token=${after?.token?.slice(0, 15)}...`);

    return NextResponse.json({
      success: true,
      vpsName: vps.name,
      vpsIp: vps.ip,
      oldToken: vps.token,
      newToken: after?.token,
      match: after?.token === newToken,
    });

  } catch (error: any) {
    console.error("[fix-token] ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
