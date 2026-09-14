import { and, eq, lte } from "drizzle-orm";
import { after, NextResponse } from "next/server";
import { cancelVps } from "@/lib/contabo";
import { db } from "@/lib/db";
import {
  pgInvoice,
  pgLog,
  pgOrganization,
  pgVpsServers,
  pgVpsSubscription,
} from "@/lib/db/schema";
import { triggerPurchaseNotifications } from "@/lib/notifications/vps-purchase";
import currencyConversion from "@/lib/server/apis/currency";
import simpayApi from "@/lib/server/apis/simpay";
import { nextRenewalDate } from "@/lib/vps/renewal-date";

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
    // Guardado fora do try para o catch conseguir marcar a fatura como falha.
    let renewalInvoiceId: string | undefined;

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

      // Reserva otimista: avança next_charge_date ANTES de cobrar, condicionada ao
      // valor que acabamos de ler. Se outro processo (segundo agendador, replica,
      // execução sobreposta) já pegou essa assinatura, o UPDATE afeta 0 linhas e
      // pulamos — sem fatura duplicada nem cobrança dupla no cartão do cliente.
      const claimed = await db
        .update(pgVpsSubscription)
        .set({
          nextChargeDate: nextRenewalDate(
            sub.nextChargeDate,
            sub.intervalMonths
          ),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(pgVpsSubscription.id, sub.id),
            eq(pgVpsSubscription.status, "active"),
            eq(pgVpsSubscription.nextChargeDate, sub.nextChargeDate)
          )
        )
        .returning({ id: pgVpsSubscription.id });

      if (claimed.length === 0) {
        console.warn(
          `[VPS-CRON] Assinatura ${sub.id} já reservada por outra execução — pulando.`
        );
        results.push({ id: sub.id, status: "skipped" });
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
      renewalInvoiceId = newInvoice.id;

      // Charge the card
      try {
        await simpayApi.createCardPayment({
          bin: savedCard?.last4 || cardToken.substring(0, 6),
          brand: savedCard?.brand || "unknown",
          description: `HOSTING ${description}`,
          document: user?.billingDocument?.replace(/\D/g, "") || "00000000000",
          document_type: (user?.billingDocument?.replace(/\D/g, "")?.length ===
          14
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
      } catch (e) {
        // SLOT VPS_RENEWAL_PAYMENT_FAILURE: execute aqui a função exclusiva de renovação recusada/falha.
        if (sub.vpsNodeId) {
          const vps = await db.query.pgVpsServers.findFirst({
            columns: {
              externalId: true,
              renewDate: true,
            },
            where: eq(pgVpsServers.id, sub.vpsNodeId),
          });

          if (vps?.externalId && vps.renewDate) {
            await cancelVps(vps.externalId, vps.renewDate);
          }
        }

        throw e;
      }

      // SLOT VPS_RENEWAL_PAYMENT_SUCCESS: execute aqui a função exclusiva de renovação aprovada.
      // Todo: se múltiplas tentativas de renovação forem implementadas, descancelar na Contabo aqui.

      // next_charge_date já foi avançado na reserva acima.
      await db
        .update(pgInvoice)
        .set({ status: "paid" })
        .where(eq(pgInvoice.id, newInvoice.id));

      await db
        .update(pgVpsSubscription)
        .set({
          failureCount: 0,
          lastInvoiceId: newInvoice.id,
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
      const reason = err?.message || "erro desconhecido";

      // A fatura criada nesta tentativa não foi paga: marca como falha em vez de
      // deixar pendente pra sempre, senão cada retentativa deixa uma órfã.
      if (renewalInvoiceId) {
        await db
          .update(pgInvoice)
          .set({ status: "failed" })
          .where(eq(pgInvoice.id, renewalInvoiceId));
      }

      // Registro persistente: sem isso, a falha só existia no stdout do container
      // e sumia no próximo deploy.
      await db
        .insert(pgLog)
        .values({
          description:
            `Tentativa ${newFailures} de 3 falhou: ${reason}. ` +
            `Assinatura ${sub.id}, vencimento ${sub.nextChargeDate.toISOString()}, valor R$ ${sub.amountBrl.toFixed(2)}.` +
            (newStatus === "failed"
              ? " Limite de tentativas atingido — a assinatura foi marcada como falha e não será mais cobrada automaticamente."
              : ""),
          severity: "danger",
          title: `Falha na renovação da VPS ${sub.planId}`,
          type: "hosting",
          userId: sub.userId,
        })
        .catch(logErr =>
          console.error(
            `[VPS-CRON] Não foi possível registrar o log da falha ${sub.id}:`,
            logErr
          )
        );

      // Devolve a reserva: a cobrança não passou, então a assinatura continua
      // vencida e precisa ser retentada na próxima execução.
      await db
        .update(pgVpsSubscription)
        .set({
          failureCount: newFailures,
          nextChargeDate: sub.nextChargeDate,
          status: newStatus as any,
          updatedAt: new Date(),
        })
        .where(eq(pgVpsSubscription.id, sub.id));

      results.push({ error: reason, id: sub.id, status: "error" });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
