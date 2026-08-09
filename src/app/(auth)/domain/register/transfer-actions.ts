"use server";

import { lookupTxt } from "dns-query";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { normalizeDomainName } from "@/lib/server/domains/authorization";
import {
  hasPublishedDsRecords,
  provisionCloudflareZone,
} from "@/lib/server/domains/cloudflare-dns";
import {
  createDomainVerificationRecord,
  type DomainVerificationRecord,
  txtEntriesContainToken,
} from "@/lib/server/domains/verification";

export interface ExternalDomainResult {
  isCorrect?: boolean;
  message: string;
  nameservers?: string[];
  status: "error" | "success";
  verification?: DomainVerificationRecord;
}

function verificationFor(domain: string, organizationId: string) {
  const secret =
    process.env.DOMAIN_VERIFICATION_SECRET || process.env.AUTH_SECRET;
  return secret
    ? createDomainVerificationRecord(domain, organizationId, secret)
    : null;
}

function isValidDomain(domain: string) {
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
    domain
  );
}

export async function addExternalDomain(
  _previous: ExternalDomainResult | null,
  formData: FormData
): Promise<ExternalDomainResult> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", status: "error" };

  const domain = normalizeDomainName(String(formData.get("domain") || ""));
  const dnsMode =
    formData.get("dnsMode") === "external" ? "external" : "cloudflare";
  if (!isValidDomain(domain)) {
    return {
      message: "Informe um domínio válido, sem protocolo ou caminho.",
      status: "error",
    };
  }
  const verification = verificationFor(domain, user.organization.id);
  if (!verification) {
    return {
      message:
        "Defina DOMAIN_VERIFICATION_SECRET para habilitar a verificação segura.",
      status: "error",
    };
  }

  const existing = await db.query.pgOrganizationDomains.findFirst({
    where: eq(pgOrganizationDomains.domain, domain),
  });
  if (existing && existing.organizationId !== user.organization.id) {
    return {
      message: "Este domínio já está vinculado a outra organização Atlas.",
      status: "error",
    };
  }
  if (existing?.active)
    return {
      message: "Este domínio já está ativo na sua conta.",
      status: "error",
    };

  const values = {
    active: false,
    connectionStatus: "pending_verification",
    dnsMode,
    domain,
    expectedNameservers: null,
    lastDnsError: null,
    organizationId: user.organization.id,
    registrarProvider: null,
  };
  if (existing) {
    await db
      .update(pgOrganizationDomains)
      .set(values)
      .where(eq(pgOrganizationDomains.id, existing.id));
  } else {
    await db.insert(pgOrganizationDomains).values(values);
  }

  revalidatePath("/domain");
  return {
    message:
      "Domínio adicionado. Crie o registro TXT abaixo e depois clique em Verificar.",
    status: "success",
    verification,
  };
}

export async function verifyExternalDomain(
  _previous: unknown,
  formData: FormData
): Promise<ExternalDomainResult> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", status: "error" };
  const domain = normalizeDomainName(String(formData.get("domain") || ""));
  const pending = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.organizationId, user.organization.id),
      eq(pgOrganizationDomains.domain, domain),
      eq(pgOrganizationDomains.active, false)
    ),
  });
  if (!pending)
    return { message: "Domínio pendente não encontrado.", status: "error" };
  const verification = verificationFor(domain, user.organization.id);
  if (!verification)
    return { message: "Verificação não configurada.", status: "error" };

  try {
    const { entries } = await lookupTxt(verification.host, {
      endpoints: ["1.1.1.1", "8.8.8.8"],
    });
    if (
      !txtEntriesContainToken(
        entries.map(entry => entry.data),
        verification.value
      )
    ) {
      return {
        message:
          "O TXT ainda não foi localizado. Aguarde a propagação e tente novamente.",
        status: "error",
        verification,
      };
    }
  } catch {
    return {
      message: "O TXT ainda não foi localizado. Confira o host e o valor.",
      status: "error",
      verification,
    };
  }

  if (pending.dnsMode === "cloudflare") {
    if (await hasPublishedDsRecords(domain)) {
      return {
        message:
          "A propriedade foi confirmada, mas existe um registro DNSSEC/DS ativo. Remova-o no registrador antes de continuar.",
        status: "error",
      };
    }
    try {
      const zone = await provisionCloudflareZone(domain, true);
      await db
        .update(pgOrganizationDomains)
        .set({
          active: true,
          cloudflareZoneId: zone.id,
          cloudflareZoneStatus: zone.status,
          connectionStatus: "review_records",
          dnsImportStatus: "scanning",
          dnsScanStartedAt: new Date(),
          expectedNameservers: zone.name_servers,
          lastDnsCheckAt: new Date(),
          lastDnsError: null,
          registrarProvider: "external",
          verifiedAt: new Date(),
        })
        .where(eq(pgOrganizationDomains.id, pending.id));
      revalidatePath("/domain");
      revalidatePath(`/domains/${pending.id}`);
      return {
        isCorrect: true,
        message:
          "Propriedade confirmada. Revise os registros encontrados antes de trocar os nameservers.",
        nameservers: zone.name_servers,
        status: "success",
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao criar a zona na Cloudflare.";
      await db
        .update(pgOrganizationDomains)
        .set({
          active: true,
          connectionStatus: "error",
          lastDnsError: message,
          registrarProvider: "external",
          verifiedAt: new Date(),
        })
        .where(eq(pgOrganizationDomains.id, pending.id));
      return { message, status: "error" };
    }
  }

  await db
    .update(pgOrganizationDomains)
    .set({
      active: true,
      connectionStatus: "unmanaged",
      lastDnsError: null,
      registrarProvider: "external",
      verifiedAt: new Date(),
    })
    .where(eq(pgOrganizationDomains.id, pending.id));
  revalidatePath("/domain");
  revalidatePath(`/domains/${pending.id}`);
  return {
    isCorrect: true,
    message: "Propriedade confirmada. O DNS continuará no seu provedor atual.",
    status: "success",
  };
}
