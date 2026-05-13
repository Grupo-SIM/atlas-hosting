import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgUser,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { desc, eq, sum } from "drizzle-orm";
import type { Metadata } from "next";
import { getAffiliateBalance } from "./actions";
import { AffiliateTabs } from "./components/AffiliateTabs";
import type { CommissionRow, WithdrawalRow } from "./components/AffiliateTabs";

export const metadata: Metadata = {
  title: "Afiliado - Atlas Hosting",
  description: "Gerencie suas indicações, comissões e solicite saques",
};

export default async function AffiliatePage() {
  const user = await getUser();

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://atlashosting.com.br";
  const affiliateLink = `${baseUrl}/?ref=${user.affiliateCode}`;

  const minWithdrawal = Number(process.env.AFFILIATE_MIN_WITHDRAWAL) || 100;
  const fee = Number(process.env.AFFILIATE_WITHDRAWAL_FEE) || 2;

  const { available, pendingWithdrawals } = await getAffiliateBalance(user.id);

  const [allTimeRow] = await db
    .select({ total: sum(pgAffiliateCommission.commissionAmount) })
    .from(pgAffiliateCommission)
    .where(eq(pgAffiliateCommission.affiliateUserId, user.id));
  const totalEarnedAllTime = Number(allTimeRow?.total ?? 0);

  const referredUsers = await db.query.pgUser.findMany({
    where: eq(pgUser.referrerId, user.id),
    columns: { id: true, email: true, createdAt: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  const rawCommissions = await db.query.pgAffiliateCommission.findMany({
    where: eq(pgAffiliateCommission.affiliateUserId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
  const commissions: CommissionRow[] = rawCommissions.map((c) => ({
    id: c.id,
    grossAmount: c.grossAmount,
    commissionAmount: c.commissionAmount,
    commissionRate: c.commissionRate,
    status: c.status,
    createdAt: c.createdAt,
  }));

  const rawWithdrawals = await db.query.pgWithdrawalRequests.findMany({
    where: eq(pgWithdrawalRequests.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
  const withdrawals: WithdrawalRow[] = rawWithdrawals.map((w) => ({
    id: w.id,
    amount: w.amount,
    fee: w.fee,
    status: w.status,
    rejectionReason: w.rejectionReason ?? null,
    simpayWithdrawalId: w.simpayWithdrawalId ?? null,
    createdAt: w.createdAt,
  }));

  return (
    <div className="p-6 pb-20 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Programa de Afiliados
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas indicações, comissões e saques
        </p>
      </div>

      <AffiliateTabs
        affiliateLink={affiliateLink}
        availableBalance={available}
        pendingWithdrawals={pendingWithdrawals}
        totalEarnedAllTime={totalEarnedAllTime}
        referrals={referredUsers}
        commissions={commissions}
        withdrawals={withdrawals}
        minWithdrawal={minWithdrawal}
        fee={fee}
      />
    </div>
  );
}
