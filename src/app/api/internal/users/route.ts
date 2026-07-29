import { desc, eq, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgAffiliateCommission } from "@/lib/db/schema/tables/affiliate";
import { pgUser } from "@/lib/db/schema/tables/user";

function authError() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const token = request.headers.get("x-internal-token");
  const expected =
    process.env.API_MACHINE_INTERNAL_TOKEN ??
    process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected || token !== expected) return authError();

  const { searchParams } = new URL(request.url);
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10)
  );
  const pageSize = Math.min(
    Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "20", 10)),
    100
  );
  const skip = (page - 1) * pageSize;

  const [countResult, users] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pgUser)
      .where(isNull(pgUser.deletedAt)),
    db
      .select({
        affiliateBalance: sql<number>`COALESCE(SUM(CASE WHEN ${pgAffiliateCommission.status} = 'available' THEN ${pgAffiliateCommission.commissionAmount} ELSE 0 END), 0)`,
        cpf: pgUser.billingDocument,
        createdAt: pgUser.createdAt,
        email: pgUser.email,
        id: pgUser.id,
        name: pgUser.name,
      })
      .from(pgUser)
      .leftJoin(
        pgAffiliateCommission,
        eq(pgAffiliateCommission.affiliateUserId, pgUser.id)
      )
      .where(isNull(pgUser.deletedAt))
      .groupBy(
        pgUser.id,
        pgUser.name,
        pgUser.email,
        pgUser.billingDocument,
        pgUser.createdAt
      )
      .orderBy(desc(pgUser.createdAt))
      .limit(pageSize)
      .offset(skip),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return NextResponse.json({
    data: users.map(u => ({
      balance: Number(u.affiliateBalance),
      cpf: u.cpf ?? "",
      createdAt: u.createdAt,
      email: u.email,
      lockedBalance: 0,
      name: u.name,
    })),
    page,
    pageSize,
    total,
  });
}
