"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgDomainTransfer, pgOrganizationDomains, pgUserPermission } from "@/lib/db/schema";

export async function deleteDomain(domainId: string) {
  const user = await getUser();
  if (user.impersonatedBy || user.organization.ownerId !== user.id) {
    return { success: false, message: "Somente o dono da organização pode apagar domínios, fora de impersonação." };
  }

  try {
    await db.transaction(async tx => {
      const [domain] = await tx.select().from(pgOrganizationDomains).where(and(
        eq(pgOrganizationDomains.id, domainId),
        eq(pgOrganizationDomains.organizationId, user.organization.id)
      )).for("update");
      if (!domain) throw new Error("Domínio não encontrado na sua organização.");
      if (domain.registrarProvider === "namecheap") {
        throw new Error("Domínios registrados pelo Atlas não podem ser apagados pelo painel.");
      }
      const transfer = await tx.query.pgDomainTransfer.findFirst({ where: eq(pgDomainTransfer.domainId, domain.id) });
      if (transfer) throw new Error("Domínio com histórico de transferência não pode ser apagado.");

      await tx.delete(pgUserPermission).where(eq(pgUserPermission.domainId, domain.id));
      await tx.delete(pgOrganizationDomains).where(and(
        eq(pgOrganizationDomains.id, domain.id),
        eq(pgOrganizationDomains.organizationId, user.organization.id)
      ));
    });
  } catch (error) {
    console.error("Failed to delete domain", error);
    return { success: false, message: error instanceof Error ? error.message : "Não foi possível apagar o domínio." };
  }

  revalidatePath("/domains");
  revalidatePath("/email");
  return { success: true, message: "Domínio removido do painel Atlas." };
}
