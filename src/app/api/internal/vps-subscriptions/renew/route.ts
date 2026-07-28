import { and, eq, lte } from "drizzle-orm";
import { after, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgInvoice, pgOrganization, pgVpsSubscription } from "@/lib/db/schema";
import { triggerPurchaseNotifications } from "@/lib/notifications/vps-purchase";
import currencyConversion from "@/lib/server/apis/currency";
import simpayApi from "@/lib/server/apis/simpay";

function ensureAuthorized(req: Request): boolean {
  // Allow requests from localhost (internal cron)
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const host = req.headers.get("host") || "";
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    forwarded === "";
  if (isLocal) return true;

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  const cronSecret = process.env.CRON_SECRET;
  const internalToken =
    process.env.API_MACHINE_INTERNAL_TOKEN ||
    process.env.INTERNAL_SERVICE_TOKEN;
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
      organization: true,
      user: true,
    },
  });

  if (dueSubscriptions.length === 0) {
    return NextResponse.json({
      message: "Nenhuma assinatura vencida.",
      processed: 0,
    });
  }

  let rate = 5.86;
  try {
    const [fetchedRate] = await currencyConversion.convertMultiple({
      amounts: [1],
      from: "eur",
      to: "brl",
    });
    rate = fetchedRate;
  } catch {
    // use fallback
  }

  const results: { id: string; status: string; error?: string }[] = [];

  for (const sub of dueSubscriptions) {
    try {
      const config = sub.config as any;
      const cardToken: string = config?.cardToken;

      // PIX é pagamento único, sem cobrança recorrente: pausa no vencimento
      // para o cliente/admin renovar manualmente. Não cobra, não marca como falha.
      if (sub.paymentMethod === "pix" || !cardToken) {
        await db
          .update(pgVpsSubscription)
          .set({
            pausedAt: new Date(),
            status: "paused",
            updatedAt: new Date(),
          })
          .where(eq(pgVpsSubscription.id, sub.id));
        results.push({ id: sub.id, status: "paused" });
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
          amount: sub.amountBrl,
          currency: "BRL",
          description,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: {
            config: sub.config,
            isRenewal: true,
            subscriptionId: sub.id,
            vpsId: sub.planId,
          } as any,
          orgId: sub.orgId,
          reference: `VPS-REN-${sub.planId}-${Date.now()}`,
          status: "pending",
          type: "vps",
          userId: sub.userId,
        })
        .returning();

      if (!newInvoice) throw new Error("Falha ao criar fatura de renovação.");

      // Charge the card
      await simpayApi.createCardPayment({
        bin: savedCard?.last4 || cardToken.substring(0, 6),
        brand: savedCard?.brand || "unknown",
        description,
        document: user?.billingDocument?.replace(/\D/g, "") || "00000000000",
        document_type: (user?.billingDocument?.replace(/\D/g, "")?.length === 14
          ? "CNPJ"
          : "CPF") as "CPF" | "CNPJ",
        email: user?.email || "",
        holder_name: savedCard?.holderName || user?.name || "",
        installments: 1,
        mobile_phone: user?.billingPhone?.replace(/\D/g, "") || "00000000000",
        name: user?.name || "",
        price: sub.amountBrl,
        token: cardToken,
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
          failureCount: 0,
          lastInvoiceId: newInvoice.id,
          nextChargeDate,
          updatedAt: new Date(),
        })
        .where(eq(pgVpsSubscription.id, sub.id));

      // Notify (renewal: skip WhatsApp, keep email/etc.)
      after(async () => {
        await triggerPurchaseNotifications(
          newInvoice,
          user,
          { paymentMethod: "credit_card" },
          { isRenewal: true }
        );
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

      results.push({ error: err?.message, id: sub.id, status: "error" });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
