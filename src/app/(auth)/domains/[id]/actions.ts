"use server";

import { query } from "dns-query";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { getAtlasNameservers } from "@/lib/server/domains/dns-config";
import { preparePleskDnsZone } from "@/lib/server/domains/prepare-dns-zone";

export interface ModeActionResult {
  success: boolean;
  message: string;
}

async function ownedDomain(id: string) {
  const user = await getUser();
  if (!user) return null;
  return db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.id, id),
      eq(pgOrganizationDomains.organizationId, user.organization.id)
    ),
  });
}

export async function enableAtlasDns(id: string): Promise<ModeActionResult> {
  const domain = await ownedDomain(id);
  if (!domain?.active)
    return { message: "Domínio ativo não encontrado.", success: false };
  try {
    await preparePleskDnsZone(domain.domain);
    await db
      .update(pgOrganizationDomains)
      .set({
        connectionStatus: "awaiting_nameservers",
        dnsMode: "atlas",
        expectedNameservers: getAtlasNameservers(),
        lastDnsError: null,
      })
      .where(eq(pgOrganizationDomains.id, id));
    revalidatePath(`/domains/${id}`);
    return {
      message: "Zona preparada. Troque os nameservers para concluir.",
      success: true,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao preparar a zona DNS.";
    await db
      .update(pgOrganizationDomains)
      .set({ connectionStatus: "error", lastDnsError: message })
      .where(eq(pgOrganizationDomains.id, id));
    return { message, success: false };
  }
}

export async function keepExternalDns(id: string): Promise<ModeActionResult> {
  const domain = await ownedDomain(id);
  if (!domain?.active)
    return { message: "Domínio ativo não encontrado.", success: false };
  if (domain.registrarProvider === "namecheap") {
    return {
      message:
        "Domínios comprados pelo Atlas usam o DNS gerenciado pelo Atlas.",
      success: false,
    };
  }
  const atlasNameservers = getAtlasNameservers();
  try {
    const responses = await Promise.all(
      ["1.1.1.1", "8.8.8.8"].map(endpoint =>
        query(
          { question: { name: domain.domain, type: "NS" } },
          { endpoints: [endpoint] }
        )
      )
    );
    const hasExternalDelegation = responses.every(response => {
      const found = (response.answers || [])
        .filter(answer => answer.type === "NS")
        .map(answer => String(answer.data).toLowerCase().replace(/\.$/, ""));
      return (
        found.length >= 2 &&
        found.every(nameserver => !atlasNameservers.includes(nameserver))
      );
    });
    if (!hasExternalDelegation) {
      return {
        message:
          "Altere primeiro os nameservers no registrador para o novo provedor e aguarde a propagação.",
        success: false,
      };
    }
  } catch {
    return {
      message: "Não foi possível confirmar os nameservers do novo provedor.",
      success: false,
    };
  }
  await db
    .update(pgOrganizationDomains)
    .set({
      connectionStatus: "unmanaged",
      dnsMode: "external",
      lastDnsError: null,
    })
    .where(eq(pgOrganizationDomains.id, id));
  revalidatePath(`/domains/${id}`);
  return {
    message:
      "O DNS continuará no provedor atual. A zona Atlas foi preservada como backup.",
    success: true,
  };
}
