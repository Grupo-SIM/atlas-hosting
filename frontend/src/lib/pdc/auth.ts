import "server-only";
import { timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgOrganizationDomains, pgUser } from "@/lib/db/schema";
import { MASTER_ADMIN_EMAIL } from "@/lib/permissions/master";

/**
 * API de máquina da Produção de Conteúdo (PDC, sistema separado).
 *
 * O PDC chama o Atlas com `Authorization: Bearer PDC_API_TOKEN` para listar os sites e
 * publicar posts. Só a conta master (`MASTER_ADMIN_EMAIL` + `isAdmin`) é atendida: o
 * usuário é resolvido aqui, nunca vem na requisição.
 */

export interface PdcFalha {
  error: string;
  ok: false;
}

export const pdcErro = (error: string, status: number) =>
  NextResponse.json({ error, ok: false } satisfies PdcFalha, { status });

/** `null` = autorizado; senão a resposta de erro pronta. */
export function conferirTokenPdc(req: Request): NextResponse | null {
  const esperado = process.env.PDC_API_TOKEN?.trim() ?? "";
  if (esperado.length < 32)
    return pdcErro("Integração com o PDC desligada (PDC_API_TOKEN).", 503);
  const recebido = (req.headers.get("authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return pdcErro("Não autorizado.", 401);
  return null;
}

export interface ContaMaster {
  dominios: string[];
  id: string;
  organizationId: string | null;
}

/** Conta master com os domínios ativos da organização; `null` se não existir ou não for admin. */
export async function contaMaster(): Promise<ContaMaster | null> {
  const [user] = await db
    .select({
      id: pgUser.id,
      isAdmin: pgUser.isAdmin,
      organizationId: pgUser.organizationId,
    })
    .from(pgUser)
    .where(sql`lower(trim(${pgUser.email})) = ${MASTER_ADMIN_EMAIL}`)
    .limit(1);
  if (!user?.isAdmin) return null;
  const dominios = user.organizationId
    ? (
        await db
          .select({ domain: pgOrganizationDomains.domain })
          .from(pgOrganizationDomains)
          .where(
            and(
              eq(pgOrganizationDomains.organizationId, user.organizationId),
              eq(pgOrganizationDomains.active, true)
            )
          )
      ).map(d => d.domain)
    : [];
  return { dominios, id: user.id, organizationId: user.organizationId };
}
