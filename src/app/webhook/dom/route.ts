import { adminNamecheapDetails } from "@/components/domains/DomainResult";
import { registerDomainsFromPaidInvoice } from "@/lib/server/domains/registerFromPaidInvoice";
import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";
import { db } from "@/lib/db";
import {
  pgInvoice,
  pgOrganization,
  pgUser,
} from "@/lib/db/schema";
import type { PayloadWebhook } from "@/lib/server/apis/dom/types";
import { AppLogger } from "@/lib/server/logs";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Placeholder functions for webhook actions
async function onSignatureCreated(data: PayloadWebhook["data"]): Promise<void> {
  console.log("[Webhook Action] onSignatureCreated called with data:", data);
}

async function onSignatureCancelled(
  data: PayloadWebhook["data"]
): Promise<void> {
  console.log("[Webhook Action] onSignatureCancelled called with data:", data);
  const invoiceId = data.external_reference;

  if (!invoiceId) {
    console.error("Invoice ID not found in the payload.");
    return;
  }
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
      status: "processing",
      type: oldInvoice.type,
      reference: oldInvoice.reference,
      orgId: oldInvoice.orgId,
      userId: oldInvoice.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      amount: oldInvoice.amount,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
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

    if (!user || !user.email) {
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

      console.log("Namecheap registration result:", { registered, failed });

      try {
        logger.log({
          title: "Novo(s) domínio(s) registrado(s)",
          description: `Domínios: ${registered.join(", ")}.`,
          severity: "success",
          type: "hosting",
        });
      } catch {
        /* ignore log errors */
      }
    } catch (error) {
      logger.log({
        title: "Erro ao registrar domínio",
        description: `Erro ao processar fatura de domínio.`,
        severity: "danger",
        type: "hosting",
      });

      console.error(`Erro ao registrar domínio(s) com Namecheap:`, error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(`Falha ao registrar domínio(s). Por favor, tente novamente.`);
    }
  }
}

export async function POST(request: Request) {
  console.log("Handling DOM Webhook");

  let payload: PayloadWebhook | null = null;

  try {
    payload = await request.json();

    if (!payload || !payload.event || !payload.data) {
      console.error("Invalid webhook payload structure:", payload);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook payload structure.",
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
      case "CHARGE-APPROVED":
        // await onInvoicePaid(payload.data);
        actionTaken = "Processamento de pagamento de fatura iniciado.";
        details = payload.data;
        actionTaken = "Evento CHARGE-APPROVED recebido e processado.";
        console.log("[Webhook] Evento CHARGE-APPROVED processado.");
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
        success: true,
        message: "Webhook processado com sucesso.",
        actionTaken,
        webhookType: payload.event,
        details,
        timestamp: new Date().toISOString(),
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
          success: false,
          message: "Falha ao processar webhook.",
          webhookType: payloadType,
          error: {
            message: error.message,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          },
          timestamp: new Date().toISOString(),
        },
        { status: payload ? 400 : 500 }
      ); // 400 if payload was parsed, 500 if error before/during parsing
    }
  }
}
