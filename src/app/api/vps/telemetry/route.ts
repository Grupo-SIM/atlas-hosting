import { db } from "@/lib/db";
import { pgVpsMetrics, pgVpsServers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Endpoint para receber telemetria dos bots Python instalados nas VMs.
 * O bot deve enviar um POST JSON com o token e as métricas.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Mapeamos os nomes que vêm do bot para o nosso banco
    const { 
      token, 
      cpu_usage, 
      ram_usage, 
      disk_usage, 
      uptime, 
      process_count,
      processes 
    } = body;

    console.log(`[Telemetry] Recebendo sinal de "${token.substring(0, 10)}...". Processos: ${processes?.length || 0}`);

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 });
    }

    // 1. Validar se o servidor existe com este token
    const vps = await db.query.pgVpsServers.findFirst({
      where: eq(pgVpsServers.token, token),
    });

    if (!vps) {
      console.warn(`[Telemetry] Tentativa de envio com token inválido: ${token}`);
      return NextResponse.json({ error: "Token inválido ou servidor não registrado" }, { status: 401 });
    }

    // 2. Inserir as métricas no histórico
    await db.insert(pgVpsMetrics).values({
      vpsId: vps.id,
      cpuUsage: cpu_usage || 0,
      ramUsage: ram_usage || 0,
      diskUsage: disk_usage || 0,
      uptime: uptime || "Desconhecido",
      processCount: process_count || 0,
    });

    // 3. Atualizar o status do servidor e o último sinal de vida (Heartbeat)
    await db
      .update(pgVpsServers)
      .set({ 
        lastHeartbeat: new Date(),
        isBotInstalled: true,
        status: "active",
        topProcesses: processes || [],
        updatedAt: new Date()
      })
      .where(eq(pgVpsServers.id, vps.id));

    return NextResponse.json({ 
      success: true, 
      message: "Métricas recebidas com sucesso",
      server: vps.name 
    });

  } catch (error: any) {
    console.error("Erro ao receber telemetria da VPS:", error);
    return NextResponse.json({ 
      error: "Falha interna ao processar métricas",
      details: error.message 
    }, { status: 500 });
  }
}

// OPTIONS para permitir chamadas de diferentes origens se necessário (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
