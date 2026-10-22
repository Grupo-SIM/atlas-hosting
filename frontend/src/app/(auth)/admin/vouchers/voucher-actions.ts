"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRealUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice, pgVoucher } from "@/lib/db/schema";

export async function toggleVoucher(id: string, currentActive: boolean) {
  const user = await getRealUser();
  if (!user.isAdmin) throw new Error("Acesso restrito a administradores.");
  await db
    .update(pgVoucher)
    .set({ active: !currentActive })
    .where(eq(pgVoucher.id, id));

  revalidatePath("/admin/vouchers");
}

export async function deleteVoucher(id: string) {
  const user = await getRealUser();
  if (!user.isAdmin) throw new Error("Acesso restrito a administradores.");
  const association = await db.query.pgInvoice.findFirst({ where: eq(pgInvoice.voucherId, id), columns: { id: true } });
  if (association) throw new Error("Voucher possui histórico ou reserva em fatura. Desative para impedir novas aplicações.");
  await db.delete(pgVoucher).where(eq(pgVoucher.id, id));

  revalidatePath("/admin/vouchers");
}
