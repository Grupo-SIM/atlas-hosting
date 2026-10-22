import { and, eq, inArray, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { syncCheckoutPixPayment } from "@/app/actions";
import { db } from "@/lib/db";
import { pgLog, pgOrganization, pgVpsSubscription } from "@/lib/db/schema";
import { triggerPurchaseNotifications } from "@/lib/notifications/vps-purchase";
import simpayApi, { isApprovedPaymentStatus } from "@/lib/server/apis/simpay";
import { ensureRenewalInvoice } from "@/lib/server/subscriptions/renewal-invoice";
import { applyRenewalPayment, notifyPendingCancellationWithdrawals, processRenewal } from "@/lib/server/subscriptions/lifecycle";

function ensureAuthorized(req: Request): boolean {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  return !!token && [process.env.CRON_SECRET, process.env.API_MACHINE_INTERNAL_TOKEN, process.env.INTERNAL_SERVICE_TOKEN].filter(Boolean).includes(token);
}

export async function GET(req: Request) { return POST(req); }

export async function POST(req: Request) {
  if (!ensureAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const endOfToday = new Date(`${now.toLocaleDateString("en-CA", { timeZone: "America/Recife" })}T23:59:59.999-03:00`);
  const subscriptions = await db.query.pgVpsSubscription.findMany({
    where: and(inArray(pgVpsSubscription.status, ["active", "paused"]), lte(pgVpsSubscription.nextChargeDate, endOfToday)),
    with: { user: true },
  });
  const results = [];
  for (const sub of subscriptions) {
    try {
      const invoice = await ensureRenewalInvoice(sub);
      const cardPaymentId = (invoice.metadata as any).renewalCardPaymentId;
      if (cardPaymentId) {
        try {
          const payment = await simpayApi.getPaymentStatus(cardPaymentId);
          if (isApprovedPaymentStatus(payment.status)) await applyRenewalPayment(invoice, "credit_card", (sub.config as any)?.cardToken);
        } catch (error) { console.error(`[VPS-RENEWAL] Conciliação do cartão pendente para ${sub.id}:`, error); }
      }
      if ((invoice.metadata as any).simpayPaymentId) await syncCheckoutPixPayment(invoice.id);
      const status = await processRenewal(sub.id, invoice, async (current, currentInvoice) => {
        const config = current.config as any;
        const organization = await db.query.pgOrganization.findFirst({ where: eq(pgOrganization.id, current.orgId), with: { wallet: { with: { cards: true } } } });
        const card = (organization?.wallet as any)?.cards?.find((card: any) => card.cardToken === config.cardToken);
        const user = sub.user;
        const document = user?.billingDocument?.replace(/\D/g, "") || "";
        await simpayApi.createCardPayment({
          bin: card?.last4 || config.cardToken.substring(0, 6), brand: card?.brand || "unknown",
          description: `HOSTING Renovação ${sub.planType} ${sub.planId}`,
          document, document_type: document.length === 14 ? "CNPJ" : "CPF",
          email: user?.email || "", holder_name: card?.holderName || user?.name || "", installments: 1,
          mobile_phone: user?.billingPhone?.replace(/\D/g, "") || "", name: user?.name || "",
          price: currentInvoice.amount, token: config.cardToken,
        });
      }, now);
      if (status === "charged") {
        try { await triggerPurchaseNotifications(invoice, sub.user, { paymentMethod: "credit_card" }, { isRenewal: true }); }
        catch (error) { console.error(`[VPS-RENEWAL] Falha na notificação de ${sub.id}:`, error); }
      }
      results.push({ id: sub.id, status });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await db.insert(pgLog).values({ userId: sub.userId, type: "hosting", severity: "danger", title: "Falha operacional na renovação VPS", description: `Assinatura ${sub.id}: ${message}` });
      results.push({ id: sub.id, status: "error", error: message });
    }
  }
  await notifyPendingCancellationWithdrawals();
  return NextResponse.json({ processed: results.length, results });
}
