import { and, eq, inArray, ne, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgWalletEntry,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { round2, walletAvailable } from "@/lib/template-exclusivity/rules";

export interface WalletBalance {
  available: number;
  pendingWithdrawals: number;
  /** Comissões de afiliado não canceladas (já sacadas ou não). */
  commissions: number;
  /** Vendas de exclusividade e outros créditos da carteira. */
  sales: number;
}

/**
 * Saldo da carteira do Atlas: comissões de afiliado + créditos de
 * `wallet_entries` (vendas de exclusividade) − saques pendentes ou aprovados.
 *
 * Funciona como razão: não depende de marcar comissões como `withdrawn`, então
 * a sobra de uma comissão sacada pela metade continua no saldo.
 *
 * Não confere sessão: quem chama garante que `userId` é do usuário logado.
 */
export async function getWalletBalance(userId: string): Promise<WalletBalance> {
  const [[commissionRow], [entryRow], [outRow], [pendingRow]] =
    await Promise.all([
      db
        .select({ total: sum(pgAffiliateCommission.commissionAmount) })
        .from(pgAffiliateCommission)
        .where(
          and(
            eq(pgAffiliateCommission.affiliateUserId, userId),
            ne(pgAffiliateCommission.status, "cancelled")
          )
        ),
      db
        .select({ total: sum(pgWalletEntry.amountBrl) })
        .from(pgWalletEntry)
        .where(eq(pgWalletEntry.userId, userId)),
      db
        .select({ total: sum(pgWithdrawalRequests.amount) })
        .from(pgWithdrawalRequests)
        .where(
          and(
            eq(pgWithdrawalRequests.userId, userId),
            inArray(pgWithdrawalRequests.status, ["pending", "approved"])
          )
        ),
      db
        .select({ total: sum(pgWithdrawalRequests.amount) })
        .from(pgWithdrawalRequests)
        .where(
          and(
            eq(pgWithdrawalRequests.userId, userId),
            eq(pgWithdrawalRequests.status, "pending")
          )
        ),
    ]);

  const commissions = Number(commissionRow?.total ?? 0);
  const sales = Number(entryRow?.total ?? 0);
  const pendingWithdrawals = Number(pendingRow?.total ?? 0);

  return {
    available: walletAvailable({
      commissions,
      entries: sales,
      pendingWithdrawals,
      withdrawals: Number(outRow?.total ?? 0),
    }),
    commissions: round2(commissions),
    pendingWithdrawals: round2(pendingWithdrawals),
    sales: round2(sales),
  };
}
