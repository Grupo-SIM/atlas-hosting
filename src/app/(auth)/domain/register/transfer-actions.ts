"use server";

import { lookupTxt, query } from "dns-query";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { normalizeDomainName } from "@/lib/server/domains/authorization";
import { getAtlasNameservers } from "@/lib/server/domains/dns-config";
import { preparePleskDnsZone } from "@/lib/server/domains/prepare-dns-zone";
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
  const dnsMode = formData.get("dnsMode") === "external" ? "external" : "atlas";
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
    expectedNameservers: dnsMode === "atlas" ? getAtlasNameservers() : null,
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

  let connectionStatus = "unmanaged";
  let lastDnsError: string | null = null;
  if (pending.dnsMode === "atlas") {
    connectionStatus = "awaiting_nameservers";
    try {
      await preparePleskDnsZone(domain);
    } catch (error) {
      connectionStatus = "error";
      lastDnsError =
        error instanceof Error
          ? error.message
          : "Falha ao preparar a zona DNS.";
    }
  }

  await db
    .update(pgOrganizationDomains)
    .set({
      active: true,
      connectionStatus,
      lastDnsError,
      verifiedAt: new Date(),
    })
    .where(eq(pgOrganizationDomains.id, pending.id));
  revalidatePath("/domain");
  revalidatePath(`/domains/${pending.id}`);
  return {
    isCorrect: true,
    message:
      pending.dnsMode === "atlas"
        ? "Propriedade confirmada. Agora troque os nameservers pelos nameservers Atlas."
        : "Propriedade confirmada. O DNS continuará no seu provedor atual.",
    nameservers:
      pending.dnsMode === "atlas" ? getAtlasNameservers() : undefined,
    status: "success",
  };
}

export async function verifyAtlasNameservers(
  domainId: string
): Promise<ExternalDomainResult> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", status: "error" };
  const domain = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.id, domainId),
      eq(pgOrganizationDomains.organizationId, user.organization.id)
    ),
  });
  if (!domain || domain.dnsMode !== "atlas")
    return { message: "Domínio não encontrado.", status: "error" };

  const expected = (
    domain.expectedNameservers?.length
      ? domain.expectedNameservers
      : getAtlasNameservers()
  ).sort();
  try {
    const responses = await Promise.all(
      ["1.1.1.1", "8.8.8.8"].map(endpoint =>
        query(
          { question: { name: domain.domain, type: "NS" } },
          { endpoints: [endpoint] }
        )
      )
    );
    const sets = responses.map(response =>
      (response.answers || [])
        .filter(answer => answer.type === "NS")
        .map(answer => String(answer.data).toLowerCase().replace(/\.$/, ""))
        .sort()
    );
    const connected = sets.every(found =>
      expected.every(ns => found.includes(ns))
    );
    await db
      .update(pgOrganizationDomains)
      .set({
        connectionStatus: connected ? "connected" : "awaiting_nameservers",
        lastDnsCheckAt: new Date(),
        lastDnsError: null,
      })
      .where(eq(pgOrganizationDomains.id, domain.id));
    revalidatePath(`/domains/${domain.id}`);
    return {
      isCorrect: connected,
      message: connected
        ? "Nameservers confirmados. O DNS já é gerenciado pelo Atlas."
        : "A alteração ainda não apareceu nos dois resolvedores. Tente novamente em alguns minutos.",
      nameservers: expected,
      status: connected ? "success" : "error",
    };
  } catch {
    return {
      message: "Não foi possível consultar os nameservers agora.",
      nameservers: expected,
      status: "error",
    };
  }
}
