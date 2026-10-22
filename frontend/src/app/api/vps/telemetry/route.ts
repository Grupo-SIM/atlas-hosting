import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgVpsMetrics, pgVpsServers } from "@/lib/db/schema";

// Cache em memória para evitar findFirst no DB a cada POST de telemetria
const tokenCache = new Map<
  string,
  { vps: Record<string, any>; expiresAt: number }
>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function resolveToken(token: string) {
  const masked = `${token.slice(0, 10)}...`;
  const now = Date.now();
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    //    console.log(`[Telemetry] resolveToken: HIT cache for ${masked}, vpsId=${cached.vps.id}`);
    return cached.vps;
  }

  //  console.log(`[Telemetry] resolveToken: MISS cache for ${masked}, querying DB...`);
  const vps = await db.query.pgVpsServers.findFirst({
    where: eq(pgVpsServers.token, token),
  });

  if (vps) {
    //    console.log(`[Telemetry] resolveToken: Found VPS id=${vps.id} name=${(vps as any).name}`);
    tokenCache.set(token, { expiresAt: now + TOKEN_CACHE_TTL, vps });
  } else {
    //    console.log(`[Telemetry] resolveToken: NO VPS found for token ${masked}`);
  }

  return vps ?? null;
}

export async function POST(req: Request) {
  //  console.log(`[Telemetry] ========== POST received ==========`);
  try {
    const body = await req.json();
    const {
      token,
      cpu_usage,
      ram_usage,
      disk_usage,
      uptime,
      process_count,
      processes,
      metadata,
    } = body;

    //    console.log(`[Telemetry] POST body: cpu=${cpu_usage}, ram=${ram_usage}, disk=${disk_usage}, uptime=${uptime}, procs=${processes?.length ?? 0}, pid_count=${process_count}`);

    if (!token) {
      //      console.log(`[Telemetry] POST: token MISSING in body`);
      return NextResponse.json({ error: "Token ausente" }, { status: 400 });
    }

    const vps = await resolveToken(token);
    if (!vps) {
      //      console.log(`[Telemetry] POST: token INVALID`);
      return NextResponse.json(
        { error: "Token inválido ou servidor não registrado" },
        { status: 401 }
      );
    }

    //    console.log(`[Telemetry] POST: Writing metrics + updating server for vpsId=${vps.id}...`);

    // INSERT e UPDATE rodando em paralelo — independentes entre si
    await Promise.all([
      db.insert(pgVpsMetrics).values({
        cpuUsage: cpu_usage ?? 0,
        diskUsage: disk_usage ?? 0,
        metadata: metadata ?? {},
        processCount: process_count ?? 0,
        ramUsage: ram_usage ?? 0,
        uptime: uptime ?? "Desconhecido",
        vpsId: vps.id,
      }),
      db
        .update(pgVpsServers)
        .set({
          isBotInstalled: true,
          lastHeartbeat: new Date(),
          metadata: metadata ?? {},
          status: "active",
          topProcesses: processes ?? [],
          updatedAt: new Date(),
        })
        .where(eq(pgVpsServers.id, vps.id)),
    ]);

    //    console.log(`[Telemetry] POST: SUCCESS — metrics saved, server updated (${processes?.length ?? 0} processes)`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(
      "[Telemetry] POST ERROR:",
      error.message,
      error.stack?.slice(0, 300)
    );
    return NextResponse.json(
      { error: "Falha interna ao processar métricas" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  //  console.log(`[Telemetry] ========== GET received ==========`);

  if (!token) {
    //    console.log(`[Telemetry] GET: token MISSING in query`);
    return NextResponse.json({ error: "Token ausente" }, { status: 400 });
  }

  // Cache é usado apenas para validar o token (auth) — não para ler forceRefresh
  const cachedVps = await resolveToken(token);
  if (!cachedVps) {
    //    console.log(`[Telemetry] GET: token INVALID`);
    return NextResponse.json({ error: "Inválido" }, { status: 401 });
  }

  // Sempre consulta o DB para forceRefresh — o cache guarda valor obsoleto
  // após o server action setar forceRefresh=true
  //  console.log(`[Telemetry] GET: Querying DB for forceRefresh, vpsId=${cachedVps.id}...`);
  const freshVps = await db.query.pgVpsServers.findFirst({
    columns: { forceRefresh: true, id: true },
    where: eq(pgVpsServers.id, cachedVps.id),
  });

  const shouldRefresh = freshVps?.forceRefresh ?? false;
  //  console.log(`[Telemetry] GET: forceRefresh=${freshVps?.forceRefresh}, shouldRefresh=${shouldRefresh}`);

  if (shouldRefresh) {
    // Reseta o flag no DB e invalida o cache
    //    console.log(`[Telemetry] GET: Resetting forceRefresh to false and clearing cache`);
    tokenCache.delete(token);
    await db
      .update(pgVpsServers)
      .set({ forceRefresh: false })
      .where(eq(pgVpsServers.id, cachedVps.id));
    //    console.log(`[Telemetry] GET: forceRefresh reset DONE`);
  }

  //  console.log(`[Telemetry] GET: Responding { refresh: ${shouldRefresh}, interval: 60 }`);
  return NextResponse.json({ interval: 60, refresh: shouldRefresh });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    },
    status: 204,
  });
}
