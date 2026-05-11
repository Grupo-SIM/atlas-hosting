import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pgVpsSubscription,
  pgInvoice,
  pgUser,
  pgUserCard,
  pgOrganization,
} from "@/lib/db/schema";
import { eq, lte, and } from "drizzle-orm";
import simpayApi from "@/lib/server/apis/simpay";
import currencyConversion from "@/lib/server/apis/currency";
import { triggerPurchaseNotifications } from "@/lib/notifications/vps-purchase";
import { after } from "next/server";

function ensureAuthorized(req: Request): boolean {
  // Allow requests from localhost (internal cron)
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const host = req.headers.get("host") || "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1") || forwarded === "";
  if (isLocal) return true;

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  const cronSecret = process.env.CRON_SECRET;
  const internalToken =
    process.env.API_MACHINE_INTERNAL_TOKEN || process.env.INTERNAL_SERVICE_TOKEN;
  if (cronSecret && token === cronSecret) return true;
  if (internalToken && token === internalToken) return true;
  return false;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!ensureAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const dueSubscriptions = await db.query.pgVpsSubscription.findMany({
    where: and(
      eq(pgVpsSubscription.status, "active"),
      lte(pgVpsSubscription.nextChargeDate, now)
    ),
    with: {
      user: true,
      organization: true,
    },
  });

  if (dueSubscriptions.length === 0) {
    return NextResponse.json({ processed: 0, message: "Nenhuma assinatura vencida." });
  }

  let rate = 5.86;
  try {
    const [fetchedRate] = await currencyConversion.convertMultiple({ from: "eur", to: "brl", amounts: [1] });
    rate = fetchedRate;
  } catch {
    // use fallback
  }

  const results: { id: string; status: string; error?: string }[] = [];

  for (const sub of dueSubscriptions) {
    try {
      const config = sub.config as any;
      const cardToken: string = config?.cardToken;

      if (!cardToken) {
        await db
          .update(pgVpsSubscription)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(pgVpsSubscription.id, sub.id));
        results.push({ id: sub.id, status: "failed", error: "cardToken ausente" });
        continue;
      }

      // Find user's default card for holder_name/brand/last4
      const wallet = await db.query.pgOrganization.findFirst({
        where: eq(pgOrganization.id, sub.orgId),
        with: { wallet: { with: { cards: true } } },
      });
      const savedCard = (wallet?.wallet as any)?.cards?.find(
        (c: any) => c.cardToken === cardToken || c.isDefault
      );

      const user = sub.user as any;
      const description = `Renovação VPS ${sub.planId} — ${sub.intervalMonths} ${sub.intervalMonths === 1 ? "mês" : "meses"}`;

      // Create renewal invoice
      const [newInvoice] = await db
        .insert(pgInvoice)
        .values({
          orgId: sub.orgId,
          userId: sub.userId,
          type: "vps",
          reference: `VPS-REN-${sub.planId}-${Date.now()}`,
          amount: sub.amountBrl,
          status: "pending",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          currency: "BRL",
          description,
          metadata: {
            vpsId: sub.planId,
            config: sub.config,
            isRenewal: true,
            subscriptionId: sub.id,
          } as any,
        })
        .returning();

      if (!newInvoice) throw new Error("Falha ao criar fatura de renovação.");

      // Charge the card
      await simpayApi.createCardPayment({
        price: sub.amountBrl,
        document: user?.billingDocument?.replace(/\D/g, "") || "00000000000",
        document_type: (user?.billingDocument?.replace(/\D/g, "")?.length === 14 ? "CNPJ" : "CPF") as "CPF" | "CNPJ",
        email: user?.email || "",
        name: user?.name || "",
        mobile_phone: user?.billingPhone?.replace(/\D/g, "") || "00000000000",
        description,
        holder_name: savedCard?.holderName || user?.name || "",
        token: cardToken,
        bin: savedCard?.last4 || cardToken.substring(0, 6),
        brand: savedCard?.brand || "unknown",
        installments: 1,
      });

      // Mark invoice as paid and advance next charge date
      const nextChargeDate = addMonths(sub.nextChargeDate, sub.intervalMonths);
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, newInvoice.id));

      await db
        .update(pgVpsSubscription)
        .set({
          nextChargeDate,
          lastInvoiceId: newInvoice.id,
          failureCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(pgVpsSubscription.id, sub.id));

      // Notify admin via WhatsApp
      after(async () => {
        await triggerPurchaseNotifications(newInvoice, user, { paymentMethod: "credit_card" });
      });

      results.push({ id: sub.id, status: "charged" });
    } catch (err: any) {
      console.error(`[VPS-CRON] Falha ao renovar assinatura ${sub.id}:`, err);

      const newFailures = (sub.failureCount || 0) + 1;
      const newStatus = newFailures >= 3 ? "failed" : "active";

      await db
        .update(pgVpsSubscription)
        .set({
          failureCount: newFailures,
          status: newStatus as any,
          updatedAt: new Date(),
        })
        .where(eq(pgVpsSubscription.id, sub.id));

      results.push({ id: sub.id, status: "error", error: err?.message });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
