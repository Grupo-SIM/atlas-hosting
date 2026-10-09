import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pgAffiliateAttribution,
  pgAffiliateCommission,
} from "@/lib/db/schema/tables/affiliate";
import { pgUser } from "@/lib/db/schema/tables/user";

/** Indicados de um afiliado do Atlas, com o valor de comissão gerado por cada um. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-internal-token");
  const expected =
    process.env.API_MACHINE_INTERNAL_TOKEN ??
    process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const referrals = await db
    .select({
      id: pgUser.id,
      name: pgUser.name,
      email: pgUser.email,
      cpf: pgUser.billingDocument,
      generated: sql<number>`COALESCE((
        SELECT SUM(${pgAffiliateCommission.commissionAmount})
        FROM ${pgAffiliateCommission}
        WHERE ${pgAffiliateCommission.buyerUserId} = ${pgUser.id}
          AND ${pgAffiliateCommission.affiliateUserId} = ${id}
          AND ${pgAffiliateCommission.status} <> 'cancelled'
      ), 0)`,
    })
    .from(pgAffiliateAttribution)
    .innerJoin(pgUser, eq(pgUser.id, pgAffiliateAttribution.attributedUserId))
    .where(eq(pgAffiliateAttribution.affiliateUserId, id));

  const [self] = await db
    .select({
      id: pgUser.id,
      name: pgUser.name,
      email: pgUser.email,
      cpf: pgUser.billingDocument,
    })
    .from(pgUser)
    .where(eq(pgUser.id, id))
    .limit(1);

  return NextResponse.json({
    data: {
      affiliate: self ?? null,
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        cpf: r.cpf ?? null,
        generated: Number(r.generated),
      })),
    },
  });
}
