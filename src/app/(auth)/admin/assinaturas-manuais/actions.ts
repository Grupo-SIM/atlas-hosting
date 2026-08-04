"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgManualSubscription } from "@/lib/db/schema";

export type ManualPaymentMethod = "pix" | "credit_card" | "boleto" | "other";

export interface ManualSubscriptionRow {
  id: string;
  clientName: string;
  email: string | null;
  phone: string | null;
  startDate: Date;
  endDate: Date;
  paymentMethod: ManualPaymentMethod;
  amountBrl: number | null;
}

async function requireAdmin() {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");
  return admin;
}

export async function getManualSubscriptionsAction(): Promise<
  ManualSubscriptionRow[]
> {
  await requireAdmin();

  const rows = await db.query.pgManualSubscription.findMany({
    limit: 500,
    orderBy: [desc(pgManualSubscription.endDate)],
  });

  return rows.map(r => ({
    amountBrl: r.amountBrl,
    clientName: r.clientName,
    email: r.email,
    endDate: r.endDate,
    id: r.id,
    paymentMethod: r.paymentMethod,
    phone: r.phone,
    startDate: r.startDate,
  }));
}

/** Data vem do input type="date" (yyyy-mm-dd) — vira meia-noite local, não UTC. */
function parseDateInput(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!(year && month && day)) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createManualSubscriptionAction(input: {
  clientName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  paymentMethod: ManualPaymentMethod;
  /** String vazia = sem valor registrado. Vem normalizado com ponto decimal. */
  amountBrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();

  const clientName = input.clientName.trim();
  if (!clientName) return { error: "Informe o nome do cliente.", ok: false };

  const startDate = parseDateInput(input.startDate);
  const endDate = parseDateInput(input.endDate);
  if (!startDate) return { error: "Data de início inválida.", ok: false };
  if (!endDate) return { error: "Data de término inválida.", ok: false };
  if (endDate < startDate) {
    return {
      error: "A data de término não pode ser anterior à de início.",
      ok: false,
    };
  }

  let amountBrl: number | null = null;
  if (input.amountBrl.trim()) {
    const parsed = Number(input.amountBrl);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { error: "Valor inválido.", ok: false };
    }
    amountBrl = parsed;
  }

  await db.insert(pgManualSubscription).values({
    amountBrl,
    clientName,
    createdByAdminId: admin.id,
    email: input.email.trim() || null,
    endDate,
    paymentMethod: input.paymentMethod,
    phone: input.phone.trim() || null,
    startDate,
  });

  revalidatePath("/admin/assinaturas-manuais");
  return { ok: true };
}

export async function deleteManualSubscriptionAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  await db.delete(pgManualSubscription).where(eq(pgManualSubscription.id, id));

  revalidatePath("/admin/assinaturas-manuais");
  return { ok: true };
}
