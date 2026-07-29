import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { syncCheckoutBoletoPayment } from "@/app/actions";
import { adminNamecheapDetails } from "@/components/domains/DomainResult";
import { db } from "@/lib/db";
import {
  pgInvoice,
  pgOrganization,
  pgUser,
  pgVpsSubscription,
} from "@/lib/db/schema";
import { sendVpsPurchaseNotifications } from "@/lib/notifications/vps-purchase";
import domApi from "@/lib/server/apis/dom";
import type {
  ChargeWebhookPayload,
  PayloadWebhook,
} from "@/lib/server/apis/dom/types";
import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";
import {
  type PaymentDeclinedRepository,
  processPaymentDeclined,
} from "@/lib/server/dom/payment-declined";
import {
  processSignatureCancellation,
  type SignatureCancellationRepository,
} from "@/lib/server/dom/signature-cancellation";
import { registerDomainsFromPaidInvoice } from "@/lib/server/domains/registerFromPaidInvoice";
import { AppLogger } from "@/lib/server/logs";

// Placeholder functions for webhook actions
async function onSignatureCreated(data: PayloadWebhook["data"]): Promise<void> {
  console.log("[Webhook Action] onSignatureCreated called with data:", data);
}

async function onSignatureCancelled(
  data: PayloadWebhook["data"]
): Promise<void> {
  console.log("[Webhook Action] onSignatureCancelled called with data:", data);
  const cancellationRepository: SignatureCancellationRepository = {
    async cancelVpsSubscriptions(invoiceId, cancelledAt) {
      const cancelledSubscriptions = await db
        .update(pgVpsSubscription)
        .set({
          cancelledAt,
          status: "cancelled",
          updatedAt: cancelledAt,
        })
        .where(
          and(
            eq(pgVpsSubscription.lastInvoiceId, invoiceId),
            eq(pgVpsSubscription.status, "active")
          )
        )
        .returning({ id: pgVpsSubscription.id });

      return cancelledSubscriptions.length;
    },
    async clearOrganizationPlan(orgId, planId) {
      const updatedOrganizations = await db
        .update(pgOrganization)
        .set({ planId: null, updatedAt: new Date() })
        .where(
          and(eq(pgOrganization.id, orgId), eq(pgOrganization.planId, planId))
        )
        .returning({ id: pgOrganization.id });

      return updatedOrganizations.length > 0;
    },
    findInvoice: id =>
      db.query.pgInvoice.findFirst({
        where: eq(pgInvoice.id, id),
      }),
  };

  const result = await processSignatureCancellation(
    data.external_reference,
    cancellationRepository
  );
  console.log("[Webhook] SIGNATURE-CANCELLED:", result);
}

async function onPaymentDeclined(
  externalReference: string | undefined
): Promise<void> {
  const paymentDeclinedRepository: PaymentDeclinedRepository = {
    async clearOrganizationPlan(orgId, planId) {
      const updatedOrganizations = await db
        .update(pgOrganization)
        .set({ planId: null, updatedAt: new Date() })
        .where(
          and(eq(pgOrganization.id, orgId), eq(pgOrganization.planId, planId))
        )
        .returning({ id: pgOrganization.id });

      return updatedOrganizations.length > 0;
    },
    async failInvoice(invoiceId) {
      const failedInvoices = await db
        .update(pgInvoice)
        .set({ status: "failed", updatedAt: new Date() })
        .where(
          and(
            eq(pgInvoice.id, invoiceId),
            inArray(pgInvoice.status, ["pending", "processing"])
          )
        )
        .returning({ id: pgInvoice.id });

      return failedInvoices.length > 0;
    },
    async failVpsSubscriptions(invoiceId) {
      const failedSubscriptions = await db
        .update(pgVpsSubscription)
        .set({
          failureCount: sql`${pgVpsSubscription.failureCount} + 1`,
          status: "failed",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(pgVpsSubscription.lastInvoiceId, invoiceId),
            eq(pgVpsSubscription.status, "active")
          )
        )
        .returning({ id: pgVpsSubscription.id });

      return failedSubscriptions.length;
    },
    findInvoice: id =>
      db.query.pgInvoice.findFirst({
        where: eq(pgInvoice.id, id),
      }),
  };

  const result = await processPaymentDeclined(
    externalReference,
    paymentDeclinedRepository
  );
  console.log("[Webhook] Pagamento recusado:", result);
}

async function onChargeDeclined(payload: ChargeWebhookPayload): Promise<void> {
  const decoded = domApi.verifyChargeSignature(payload.signature);
  if (!decoded || decoded.id !== payload.data.id) {
    console.error(
      "[Webhook] Cobrança recusada com assinatura inválida ou inconsistente."
    );
    return;
  }

  await onPaymentDeclined(payload.data.cod_external);
}
async function onInvoiceCreated(data: PayloadWebhook["data"]): Promise<void> {
  console.log("[Webhook Action] onInvoiceCreated called with data:", data);

  const invoiceId = data.external_reference;

  if (!invoiceId) {
    console.error("Invoice ID not found in the payload.");
    return;
  }

  const updatedInvoice = await db
    .update(pgInvoice)
    .set({
      status: "processing",
    })
    .where(and(eq(pgInvoice.id, invoiceId), eq(pgInvoice.status, "pending")))
    .returning();

  if (!updatedInvoice) {
    const oldInvoice = await db.query.pgInvoice.findFirst({
      where: eq(pgInvoice.id, invoiceId),
    });

    if (!oldInvoice) {
      console.error("Invoice not found in the database.", invoiceId);
      return;
    }

    await db.insert(pgInvoice).values({
      amount: oldInvoice.amount,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      orgId: oldInvoice.orgId,
      reference: oldInvoice.reference,
      status: "processing",
      type: oldInvoice.type,
      updatedAt: new Date(),
      userId: oldInvoice.userId,
    });

    return;
  }
}

async function onInvoicePaid(data: PayloadWebhook["data"]): Promise<void> {
  console.log("[Webhook Action] onInvoicePaid called with data:", data);

  const invoiceId = data.external_reference;

  if (!invoiceId) {
    console.error("Invoice ID not found in the payload.");
    return;
  }

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });

  if (!invoice) {
    console.error("Invoice not found in the database.", invoiceId);
    return;
  }

  if (invoice.type === "subscription") {
    await db
      .update(pgOrganization)
      .set({
        planId: invoice.reference,
      })
      .where(eq(pgOrganization.id, invoice.orgId))
      .returning();

    await db
      .update(pgInvoice)
      .set({
        status: "paid",
      })
      .where(eq(pgInvoice.id, invoiceId));
    return;
  }

  if (invoice.type === "domain") {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.organizationId, invoice.orgId),
    });

    if (!user?.email) {
      throw new Error("Usuário não autenticado ou e-mail não encontrado.");
    }

    const logger = new AppLogger(user);

    try {
      const { registered, failed } = await registerDomainsFromPaidInvoice(
        invoice,
        adminNamecheapDetails as NamecheapContactDetails
      );

      if (registered.length === 0) {
        throw new Error(
          `Falha ao registrar domínio(s) via Namecheap: ${failed.join(", ") || "nenhum"}`
        );
      }

      await db
        .update(pgInvoice)
        .set({
          status: "paid",
        })
        .where(eq(pgInvoice.id, invoiceId));

      console.log("Namecheap registration result:", { failed, registered });

      try {
        logger.log({
          description: `Domínios: ${registered.join(", ")}.`,
          severity: "success",
          title: "Novo(s) domínio(s) registrado(s)",
          type: "hosting",
        });
      } catch {
        /* ignore log errors */
      }
    } catch (error) {
      logger.log({
        description: "Erro ao processar fatura de domínio.",
        severity: "danger",
        title: "Erro ao registrar domínio",
        type: "hosting",
      });

      console.error("Erro ao registrar domínio(s) com Namecheap:", error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Falha ao registrar domínio(s). Por favor, tente novamente."
      );
    }
  }

  // VPS invoice — send notifications
  if (invoice.type === "vps") {
    await db
      .update(pgInvoice)
      .set({ status: "paid" })
      .where(eq(pgInvoice.id, invoiceId));

    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, invoice.userId),
    });

    if (user) {
      const meta = invoice.metadata as any;
      const config = meta?.config || {};
      try {
        await sendVpsPurchaseNotifications({
          backup: config.backup === "true",
          duration: Number.parseInt(config.duration || "1", 10),
          guestPassword: meta?.guestPassword,
          image: config.image || "ubuntu",
          invoiceId: invoice.id,
          invoiceRef: invoice.reference,
          ipv4Address: config.ipv4Address,
          isNewAccount: !!meta?.guestPassword,
          location: config.location || "eu",
          management: config.management || "unmanaged",
          monitoring: config.monitoring,
          objectStorage: config.objectStorage,
          planId: meta?.vpsId || "10",
          planName: `Cloud VPS ${meta?.vpsId || "10"}`,
          privateNetwork: config.privateNetwork,
          quantity: Number.parseInt(config.qty || "1", 10),
          storage: config.storage || "ssd-150",
          totalAmount: invoice.amount,
          userAddress: (user as any).billingCity
            ? `${(user as any).billingStreet || ""}, ${(user as any).billingCity} - ${(user as any).billingState || ""}`
            : undefined,
          userDocument: (user as any).billingDocument || undefined,
          userEmail: user.email,
          userName: user.name || "Cliente",
          userPhone: (user as any).billingPhone || undefined,
        });
      } catch (err) {
        console.error("[Webhook] Erro ao enviar notificações VPS:", err);
      }
    }
    return;
  }
}

/**
 * Boleto (e outros pagamentos avulsos via /transactions) são confirmados de forma
 * assíncrona — dias depois do checkout, sem sessão de usuário ativa. Este webhook
 * é a fonte de verdade nesse caso (o polling em syncCheckoutBoletoPayment cobre
 * só enquanto o cliente está com a página de checkout aberta).
 */
async function onChargeApproved(payload: ChargeWebhookPayload): Promise<void> {
  const decoded = domApi.verifyChargeSignature(payload.signature);
  if (!decoded || decoded.id !== payload.data.id) {
    console.error(
      "[Webhook] CHARGE-APPROVED com assinatura inválida ou inconsistente."
    );
    return;
  }

  if (payload.data.payment_method !== "boleto") {
    // Cartão e PIX usam outros fluxos (Simpay) — só boleto passa pelo /transactions da DOM hoje.
    return;
  }

  const invoiceId = payload.data.cod_external;
  if (!invoiceId) {
    console.error("[Webhook] CHARGE-APPROVED sem cod_external.");
    return;
  }

  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });

  if (!invoice) {
    console.error(
      "[Webhook] Fatura não encontrada para CHARGE-APPROVED:",
      invoiceId
    );
    return;
  }

  if (invoice.status === "paid") return;

  const result = await syncCheckoutBoletoPayment(invoice.id);
  console.log(
    `[Webhook] CHARGE-APPROVED processado pra fatura ${invoice.id}: ${result.status}`
  );
}

export async function POST(request: Request) {
  console.log("Handling DOM Webhook");

  let payload: PayloadWebhook | null = null;

  try {
    payload = await request.json();

    if (!payload?.event || !payload.data) {
      console.error("Invalid webhook payload structure:", payload);
      return NextResponse.json(
        {
          message: "Invalid webhook payload structure.",
          success: false,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Received: ${JSON.stringify(payload)}`);
    console.log(`[Webhook] Type: ${payload.event}`);
    console.log(
      `[Webhook] Reference: ${payload.data.external_reference} (${payload.data.external_reference})`
    );

    let actionTaken = "Nenhuma ação específica para este tipo de evento.";
    let details: Record<string, unknown> = {};

    switch (payload.event) {
      case "SIGNATURE-CREATED":
        await onSignatureCreated(payload.data);
        actionTaken = "Processamento de criação de assinatura iniciado.";
        details = payload.data;
        break;
      case "SIGNATURE-CANCELLED":
        await onSignatureCancelled(payload.data);
        actionTaken = "Processamento de cancelamento de assinatura iniciado.";
        details = payload.data;
        break;
      case "SIGNATURE-INVOICE-CREATED":
        await onInvoiceCreated(payload.data);
        actionTaken = "Processamento de criação de fatura iniciado.";
        details = payload.data;
        break;
      case "SIGNATURE-INVOICE-PAID":
        await onInvoicePaid(payload.data);
        actionTaken = "Processamento de pagamento de fatura iniciado.";
        details = payload.data;
        break;
      case "SIGNATURE-INVOICE-FAILED":
        await onPaymentDeclined(payload.data.external_reference);
        actionTaken = "Processamento imediato de fatura recusada iniciado.";
        details = payload.data;
        break;
      case "CHARGE-NOT_AUTHORIZED":
      case "CHARGE-REJECTED_ANTIFRAUD":
        await onChargeDeclined(payload as unknown as ChargeWebhookPayload);
        actionTaken = "Processamento imediato de cobrança recusada iniciado.";
        details = payload.data;
        break;
      case "CHARGE-APPROVED":
        await onChargeApproved(payload as unknown as ChargeWebhookPayload);
        actionTaken = "Evento CHARGE-APPROVED processado.";
        details = payload.data;
        break;
      default:
        console.warn(`[Webhook] Evento não tratado: ${payload.event}`);
        actionTaken = `Evento não tratado: ${payload.event}`;
        break;
    }

    console.log(`[Webhook] Processado com sucesso. Ação: ${actionTaken}`);

    return NextResponse.json(
      {
        actionTaken,
        details,
        message: "Webhook processado com sucesso.",
        success: true,
        timestamp: new Date().toISOString(),
        webhookType: payload.event,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `[Webhook] Erro ao processar: ${error.message}`,
        error.stack
      );

      const payloadType =
        payload?.event || "unknown (error before/during payload parsing)";

      return NextResponse.json(
        {
          error: {
            message: error.message,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          },
          message: "Falha ao processar webhook.",
          success: false,
          timestamp: new Date().toISOString(),
          webhookType: payloadType,
        },
        { status: payload ? 400 : 500 }
      ); // 400 if payload was parsed, 500 if error before/during parsing
    }
  }
}
