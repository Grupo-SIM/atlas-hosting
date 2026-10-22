import { and, eq, lte } from "drizzle-orm";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgVpsSubscription } from "@/lib/db/schema";

export default async function RenewalPendingBanner() {
  const user = await getUser();
  if (!user) return null;
  const subscriptions = await db.query.pgVpsSubscription.findMany({ where: and(
    eq(pgVpsSubscription.userId, user.id), eq(pgVpsSubscription.status, "active"),
    lte(pgVpsSubscription.nextChargeDate, new Date(Date.now() + 15 * 86_400_000)),
  ) });
  if (!subscriptions.length) return null;
  return <aside className="border border-amber-500 bg-amber-500/10 px-4 py-3 text-sm" role="status">
    <strong>Assinatura pendente de renovação</strong>
    <p>{subscriptions.length} {subscriptions.length === 1 ? "assinatura precisa" : "assinaturas precisam"} de pagamento até o dia seguinte à data de renovação para evitar cancelamento da VPS.</p>
    <Link className="mt-2 inline-block cursor-pointer rounded border border-current px-3 py-1" href="/minhas-assinaturas">Ver assinaturas e pagar</Link>
  </aside>;
}
