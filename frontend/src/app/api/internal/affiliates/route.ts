import { desc, isNull, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pgAffiliateAttribution,
  pgAffiliateCommission,
} from "@/lib/db/schema/tables/affiliate";
import { pgUser } from "@/lib/db/schema/tables/user";

/**
 * Lista afiliados do Atlas (quem tem indicados ou comissões) para o painel
 * master do Sim Int Pay. Somente leitura.
 */
export async function GET(request: Request) {
  const token = request.headers.get("x-internal-token");
  const expected =
    process.env.API_MACHINE_INTERNAL_TOKEN ??
    process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [referrals, commissions, users] = await Promise.all([
    db
      .select({
        affiliateUserId: pgAffiliateAttribution.affiliateUserId,
        referredId: pgAffiliateAttribution.attributedUserId,
      })
      .from(pgAffiliateAttribution)
      .union(
        db
          .select({
            affiliateUserId: pgAffiliateCommission.affiliateUserId,
            referredId: pgAffiliateCommission.buyerUserId,
          })
          .from(pgAffiliateCommission)
          .where(ne(pgAffiliateCommission.status, "cancelled"))
      ),
    db
      .select({
        affiliateUserId: pgAffiliateCommission.affiliateUserId,
        total: sql<number>`COALESCE(SUM(${pgAffiliateCommission.commissionAmount}), 0)`,
        rate: sql<number>`MAX(${pgAffiliateCommission.commissionRate})`,
      })
      .from(pgAffiliateCommission)
      .where(ne(pgAffiliateCommission.status, "cancelled"))
      .groupBy(pgAffiliateCommission.affiliateUserId),
    db
      .select({
        id: pgUser.id,
        name: pgUser.name,
        email: pgUser.email,
        affiliateCode: pgUser.affiliateCode,
        createdAt: pgUser.createdAt,
      })
      .from(pgUser)
      .where(isNull(pgUser.deletedAt))
      .orderBy(desc(pgUser.createdAt)),
  ]);

  // Atribuições expiram/são regravadas; compradores com comissão também contam como indicados.
  const referralMap = new Map<string, number>();
  for (const r of referrals) {
    referralMap.set(r.affiliateUserId, (referralMap.get(r.affiliateUserId) ?? 0) + 1);
  }
  const commissionMap = new Map(
    commissions.map(c => [
      c.affiliateUserId,
      { rate: Number(c.rate ?? 0), total: Number(c.total) },
    ])
  );

  const data = users
    .filter(
      u => referralMap.has(u.id) || commissionMap.has(u.id)
    )
    .map(u => {
      const c = commissionMap.get(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        affiliateCode: u.affiliateCode ?? null,
        commissionPercent: c ? Number((c.rate * 100).toFixed(2)) : null,
        totalReferrals: referralMap.get(u.id) ?? 0,
        totalCommission: c?.total ?? 0,
      };
    });

  return NextResponse.json({ data });
}
