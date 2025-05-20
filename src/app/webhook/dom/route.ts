import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PayloadWebhook } from "@/lib/server/apis/dom/types";
import { db } from "@/lib/db";
import { invoiceTable, userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Placeholder functions for webhook actions
async function onSignatureCreated(data: PayloadWebhook["data"]): Promise<void> {
  console.log("[Webhook Action] onSignatureCreated called with data:", data);

  const invoiceId = data.external_reference;

  if (!invoiceId) {
    console.error("Invoice ID not found in the payload.");
    return;
  }

  const updatedInvoice = await db.update(invoiceTable).set({
    status: "processing",
  }).where(eq(invoiceTable.id, invoiceId)).returning();

  if (!updatedInvoice) {
    return;
  }

  await db.update(userTable).set({
    planId: updatedInvoice[0].reference,
  }).where(eq(userTable.id, updatedInvoice[0].userId)).returning();
}

async function onSignatureCancelled(data: PayloadWebhook["data"]): Promise<void> {
  console.log("[Webhook Action] onSignatureCancelled called with data:", data);
  const invoiceId = data.external_reference;
}

async function onInvoiceCreated(data: PayloadWebhook["data"]): Promise<void> {
  console.log("[Webhook Action] onInvoiceCreated called with data:", data);

  const invoiceId = data.external_reference;

  if (!invoiceId) {
    console.error("Invoice ID not found in the payload.");
    return;
  }

  const updatedInvoice = await db.update(invoiceTable).set({
    status: "processing",
  }).where(eq(invoiceTable.id, invoiceId)).returning();

  if (!updatedInvoice) {
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

  const updatedInvoice = await db.update(invoiceTable).set({
    status: "paid",
  }).where(eq(invoiceTable.id, invoiceId)).returning();

  if (!updatedInvoice) {
    return;
  }

  await db.update(userTable).set({
    planId: updatedInvoice[0].reference,
  }).where(eq(userTable.id, updatedInvoice[0].userId)).returning();
}

export async function POST(request: Request) {
  console.log("Handling DOM Webhook");

  let payload: PayloadWebhook | null = null;

  try {
    payload = await request.json();

    if (!payload || !payload.event || !payload.data) {
      console.error("Invalid webhook payload structure:", payload);
      return NextResponse.json({
        success: false,
        message: "Invalid webhook payload structure.",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`[Webhook] Received: ${JSON.stringify(payload)}`);
    console.log(`[Webhook] Type: ${payload.event}`);
    console.log(`[Webhook] Reference: ${payload.data.external_reference} (${payload.data.external_reference})`);

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
        await onInvoicePaid(payload.data);
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

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso.",
      actionTaken,
      webhookType: payload.event,
      details,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Webhook] Erro ao processar: ${error.message}`, error.stack);
        
      const payloadType = payload?.event || "unknown (error before/during payload parsing)";

      return NextResponse.json({
        success: false,
        message: "Falha ao processar webhook.",
        webhookType: payloadType,
        error: {
          message: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        },
        timestamp: new Date().toISOString()
      }, { status: payload ? 400 : 500 }); // 400 if payload was parsed, 500 if error before/during parsing
    }
  }
}