"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgDomainTransfer, pgInvoice, pgOrganizationDomains, pgUserPermission } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { assertDomainDeletionAllowed, canDeleteOrganizationDomain, deleteDnsBeforeDetach } from "@/lib/server/domains/deletion";

export async function deleteDomain(domainId: string) {
  const user = await getUser();
  if (!canDeleteOrganizationDomain(user)) {
    return { success: false, message: "Somente o dono da organização pode apagar domínios, fora de impersonação." };
  }

  try {
    await db.transaction(async tx => {
      const [domain] = await tx.select().from(pgOrganizationDomains).where(and(
        eq(pgOrganizationDomains.id, domainId),
        eq(pgOrganizationDomains.organizationId, user.organization.id)
      )).for("update");
      if (!domain) throw new Error("Domínio não encontrado na sua organização.");
      const transfers = await tx.query.pgDomainTransfer.findMany({ where: eq(pgDomainTransfer.domainId, domain.id) });
      const invoices = await tx.query.pgInvoice.findMany({ where: and(
        eq(pgInvoice.orgId, domain.organizationId),
        eq(pgInvoice.type, "domain"),
        inArray(pgInvoice.status, ["pending", "processing"])
      ) });
      const purchased = domain.registrarProvider === "namecheap";
      // getInfo's AutoRenew is WHOIS privacy renewal, not domain renewal. Use registrar inventory.
      const registrar = purchased ? (await namecheapApi.getList({ Page: 1, PageSize: 100, SearchTerm: domain.domain })).Domains.find(
        item => item.Name.toLowerCase() === domain.domain.toLowerCase()
      ) : null;
      assertDomainDeletionAllowed({
        autoRenew: registrar?.AutoRenew ?? false,
        domain: domain.domain,
        expiresAt: registrar?.Expires ?? null,
        invoices,
        purchased,
        transfers,
      });
      await deleteDnsBeforeDetach(domain.cloudflareZoneId, id => cloudflareApi.deleteZone(id), async () => {
        // Snapshot name before nulling references; invoices already retain names in reference/metadata.
        await tx.update(pgDomainTransfer).set({ domainName: domain.domain, domainId: null }).where(eq(pgDomainTransfer.domainId, domain.id));
        await tx.delete(pgUserPermission).where(eq(pgUserPermission.domainId, domain.id));
        await tx.delete(pgOrganizationDomains).where(and(
          eq(pgOrganizationDomains.id, domain.id),
          eq(pgOrganizationDomains.organizationId, user.organization.id)
        ));
      });
    });
  } catch (error) {
    console.error("Failed to delete domain", error);
    return { success: false, message: error instanceof Error ? error.message : "Não foi possível apagar o domínio." };
  }

  revalidatePath("/email");
  return { success: true, message: "Zona DNS e vínculo Atlas removidos. Hospedagem, registro e histórico financeiro foram preservados." };
}
