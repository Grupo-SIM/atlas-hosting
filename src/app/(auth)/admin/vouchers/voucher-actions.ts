"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pgVoucher } from "@/lib/db/schema";

export async function toggleVoucher(id: string, currentActive: boolean) {
  await db
    .update(pgVoucher)
    .set({ active: !currentActive })
    .where(eq(pgVoucher.id, id));

  revalidatePath("/admin/vouchers");
}

export async function deleteVoucher(id: string) {
  await db.delete(pgVoucher).where(eq(pgVoucher.id, id));

  revalidatePath("/admin/vouchers");
}
