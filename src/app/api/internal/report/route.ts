import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema/tables/invoice";
import { pgAffiliateCommission } from "@/lib/db/schema/tables/affiliate";
import { pgWithdrawalRequests } from "@/lib/db/schema/tables/system";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import type { DomainRegisterInvoiceOptions } from "@/lib/db/schema/tables/invoice";

function authError() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const token = request.headers.get("x-internal-token");
  const expected = process.env.API_MACHINE_INTERNAL_TOKEN ?? process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected || token !== expected) return authError();

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");

  const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
  const endDate = endDateStr ? new Date(endDateStr + "T23:59:59.999Z") : new Date();

  // Domain invoices paid in period (filter by createdAt = purchase date)
  const domainInvoices = await db
    .select({ amount: pgInvoice.amount, metadata: pgInvoice.metadata })
    .from(pgInvoice)
    .where(
      and(
        eq(pgInvoice.type, "domain"),
        eq(pgInvoice.status, "paid"),
        gte(pgInvoice.createdAt, startDate),
        lte(pgInvoice.createdAt, endDate),
      ),
    );

  const domainTotalRevenue = domainInvoices.reduce((s, i) => s + (i.amount ?? 0), 0);
  const domainTotalNamecheapCost = domainInvoices.reduce((s, i) => {
    const meta = i.metadata as DomainRegisterInvoiceOptions | null;
    return s + (meta?.namecheapCostBrl ?? 0);
  }, 0);

  // VPS invoices paid in period
  const vpsInvoices = await db
    .select({ amount: pgInvoice.amount })
    .from(pgInvoice)
    .where(
      and(
        eq(pgInvoice.type, "vps"),
        eq(pgInvoice.status, "paid"),
        gte(pgInvoice.createdAt, startDate),
        lte(pgInvoice.createdAt, endDate),
      ),
    );

  const vpsTotalRevenue = vpsInvoices.reduce((s, i) => s + (i.amount ?? 0), 0);
  const vpsTotalContaboCost = vpsTotalRevenue / 2;

  // Affiliate commissions — current available balance (not period-filtered)
  const availableResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${pgAffiliateCommission.commissionAmount}), 0)` })
    .from(pgAffiliateCommission)
    .where(eq(pgAffiliateCommission.status, "available"));
  const totalAvailable = Number(availableResult[0]?.total ?? 0);

  // Commissions generated in period (custo afiliado)
  const commissionInPeriodResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${pgAffiliateCommission.commissionAmount}), 0)` })
    .from(pgAffiliateCommission)
    .where(
      and(
        gte(pgAffiliateCommission.createdAt, startDate),
        lte(pgAffiliateCommission.createdAt, endDate),
      ),
    );
  const commissionGeneratedInPeriod = Number(commissionInPeriodResult[0]?.total ?? 0);

  // Withdrawal requests
  const pendingCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pgWithdrawalRequests)
    .where(eq(pgWithdrawalRequests.status, "pending"));

  const approvedInPeriod = await db
    .select({
      count: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`COALESCE(SUM(${pgWithdrawalRequests.amount}), 0)`,
      totalFee: sql<number>`COALESCE(SUM(${pgWithdrawalRequests.fee}), 0)`,
    })
    .from(pgWithdrawalRequests)
    .where(
      and(
        eq(pgWithdrawalRequests.status, "approved"),
        gte(pgWithdrawalRequests.updatedAt, startDate),
        lte(pgWithdrawalRequests.updatedAt, endDate),
      ),
    );

  const totalWithdrawn = Number(approvedInPeriod[0]?.totalAmount ?? 0);

  return NextResponse.json({
    domains: {
      totalRevenue: domainTotalRevenue,
      totalNamecheapCost: domainTotalNamecheapCost,
      count: domainInvoices.length,
    },
    vps: {
      totalRevenue: vpsTotalRevenue,
      totalContaboCost: vpsTotalContaboCost,
      count: vpsInvoices.length,
    },
    affiliates: {
      totalAvailable,
      totalWithdrawn,
      commissionGeneratedInPeriod,
    },
    withdrawals: {
      pendingCount: Number(pendingCount[0]?.count ?? 0),
      approvedInPeriodCount: Number(approvedInPeriod[0]?.count ?? 0),
      approvedInPeriodFeeSum: Number(approvedInPeriod[0]?.totalFee ?? 0),
    },
  });
}
