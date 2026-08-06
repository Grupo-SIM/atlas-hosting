"use server";

import { lookupTxt } from "dns-query";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { normalizeDomainName } from "@/lib/server/domains/authorization";
import {
  createDomainVerificationRecord,
  txtEntriesContainToken,
  type DomainVerificationRecord,
} from "@/lib/server/domains/verification";

export interface ExternalDomainTransferResult {
  message: string;
  status: "error" | "success";
  isCorrect?: boolean;
  verification?: DomainVerificationRecord;
}

function getVerificationSecret(): string | null {
  return process.env.DOMAIN_VERIFICATION_SECRET || null;
}

function verificationFor(
  domain: string,
  organizationId: string
): DomainVerificationRecord | null {
  const secret = getVerificationSecret();
  return secret
    ? createDomainVerificationRecord(domain, organizationId, secret)
    : null;
}

export async function addExternalDomainForTransfer(
  _prevState: ExternalDomainTransferResult | null,
  formData: FormData
): Promise<ExternalDomainTransferResult> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", status: "error" };

  const rawDomain = formData.get("domain");
  if (typeof rawDomain !== "string" || !rawDomain.trim()) {
    return { message: "Informe um domínio válido.", status: "error" };
  }

  const domain = normalizeDomainName(rawDomain);
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)) {
    return { message: "Informe um domínio válido, sem protocolo ou caminho.", status: "error" };
  }

  const verification = verificationFor(domain, user.organization.id);
  if (!verification) {
    return {
      message: "A verificação de domínio ainda não está configurada. Contate o suporte.",
      status: "error",
    };
  }

  const existing = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.organizationId, user.organization.id),
      eq(pgOrganizationDomains.domain, domain)
    ),
  });

  if (existing?.active) {
    return { message: "Este domínio já está ativo na sua conta.", status: "success" };
  }

  if (!existing) {
    await db.insert(pgOrganizationDomains).values({
      active: false,
      domain,
      organizationId: user.organization.id,
    });
  }

  revalidatePath("/domain");
  return {
    message: `Domínio adicionado. Crie TXT ${verification.host} com o valor ${verification.value}; não altere A, MX ou nameservers. Depois clique em Verificar.`,
    status: "success",
    verification,
  };
}

export async function verifyExternalDomainTransfer(
  _prevState: unknown,
  formData: FormData
): Promise<ExternalDomainTransferResult> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", status: "error" };

  const rawDomain = formData.get("domain");
  if (typeof rawDomain !== "string" || !rawDomain.trim()) {
    return { message: "Informe um domínio válido.", status: "error" };
  }

  const domain = normalizeDomainName(rawDomain);
  const verification = verificationFor(domain, user.organization.id);
  if (!verification) {
    return { message: "A verificação de domínio ainda não está configurada. Contate o suporte.", status: "error" };
  }

  const pendingDomain = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.organizationId, user.organization.id),
      eq(pgOrganizationDomains.domain, domain),
      eq(pgOrganizationDomains.active, false)
    ),
  });

  if (!pendingDomain) {
    return { message: "Nenhum domínio pendente foi encontrado para esta conta.", status: "error" };
  }

  try {
    const { entries } = await lookupTxt(verification.host, {
      endpoints: ["1.1.1.1", "8.8.8.8"],
    });
    const entriesText = entries.map(entry => entry.data);

    if (!txtEntriesContainToken(entriesText, verification.value)) {
      return {
        message: "O TXT ainda não foi encontrado. Confira o host e o valor e aguarde a propagação.",
        status: "error",
        verification,
      };
    }
  } catch {
    return {
      message: "Não foi possível localizar o TXT ainda. Confira o registro e tente novamente em alguns minutos.",
      status: "error",
      verification,
    };
  }

  await db
    .update(pgOrganizationDomains)
    .set({ active: true })
    .where(eq(pgOrganizationDomains.id, pendingDomain.id));

  revalidatePath("/domain");
  revalidatePath("/dns");
  return {
    isCorrect: true,
    message: "Domínio verificado e ativado. Nenhum registro DNS foi alterado pela Atlas.",
    status: "success",
  };
}



