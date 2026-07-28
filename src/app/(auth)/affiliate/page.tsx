import { eq, sum } from "drizzle-orm";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgUser,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { getAffiliateBalance } from "./actions";
import type { CommissionRow, WithdrawalRow } from "./components/AffiliateTabs";
import { AffiliateTabs } from "./components/AffiliateTabs";

export const metadata: Metadata = {
  description: "Gerencie suas indicações, comissões e solicite saques",
  title: "Afiliado - Atlas Hosting",
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
    columns: { createdAt: true, email: true, id: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    where: eq(pgUser.referrerId, user.id),
  });

  const rawCommissions = await db.query.pgAffiliateCommission.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    where: eq(pgAffiliateCommission.affiliateUserId, user.id),
  });
  const commissions: CommissionRow[] = rawCommissions.map(c => ({
    commissionAmount: c.commissionAmount,
    commissionRate: c.commissionRate,
    createdAt: c.createdAt,
    grossAmount: c.grossAmount,
    id: c.id,
    status: c.status,
  }));

  const rawWithdrawals = await db.query.pgWithdrawalRequests.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    where: eq(pgWithdrawalRequests.userId, user.id),
  });
  const withdrawals: WithdrawalRow[] = rawWithdrawals.map(w => ({
    amount: w.amount,
    createdAt: w.createdAt,
    fee: w.fee,
    id: w.id,
    rejectionReason: w.rejectionReason ?? null,
    simpayWithdrawalId: w.simpayWithdrawalId ?? null,
    status: w.status,
  }));

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          Programa de Afiliados
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas indicações, comissões e saques
        </p>
      </div>

      <AffiliateTabs
        affiliateLink={affiliateLink}
        availableBalance={available}
        commissions={commissions}
        fee={fee}
        minWithdrawal={minWithdrawal}
        pendingWithdrawals={pendingWithdrawals}
        referrals={referredUsers}
        totalEarnedAllTime={totalEarnedAllTime}
        withdrawals={withdrawals}
      />
    </div>
  );
}
