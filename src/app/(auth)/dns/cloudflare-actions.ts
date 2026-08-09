"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import { parseCloudflareRecordForm } from "./cloudflare-record-input";

export interface DnsActionResult {
  errors?: { field?: string; message: string }[];
  message: string;
  success: boolean;
}

async function authorizedDomain(domainId: string) {
  const user = await getUser();
  if (!user) return null;
  return db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.id, domainId),
      eq(pgOrganizationDomains.organizationId, user.organization.id),
      eq(pgOrganizationDomains.active, true),
      eq(pgOrganizationDomains.dnsMode, "cloudflare")
    ),
  });
}

function refresh(domainId: string) {
  revalidatePath("/dns");
  revalidatePath(`/domains/${domainId}`);
}

function failure(error: unknown, fallback: string): DnsActionResult {
  return {
    message: error instanceof Error ? error.message : fallback,
    success: false,
  };
}

export async function addCloudflareDnsRecordAction(
  _state: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const domainId = String(formData.get("domainId") || "");
  const domain = await authorizedDomain(domainId);
  if (!domain?.cloudflareZoneId)
    return { message: "Zona Cloudflare não autorizada.", success: false };
  const parsed = parseCloudflareRecordForm(formData, domain.domain);
  if (!parsed.input)
    return { message: parsed.message || "Registro inválido.", success: false };
  try {
    await cloudflareApi.createDnsRecord(domain.cloudflareZoneId, parsed.input);
    refresh(domain.id);
    return { message: "Registro DNS adicionado.", success: true };
  } catch (error) {
    return failure(error, "Não foi possível adicionar o registro.");
  }
}

export async function updateCloudflareDnsRecordAction(
  _state: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const domainId = String(formData.get("domainId") || "");
  const recordId = String(formData.get("recordId") || "");
  const domain = await authorizedDomain(domainId);
  if (!domain?.cloudflareZoneId || !recordId)
    return { message: "Registro Cloudflare não autorizado.", success: false };
  const parsed = parseCloudflareRecordForm(formData, domain.domain);
  if (!parsed.input)
    return { message: parsed.message || "Registro inválido.", success: false };
  try {
    const belongs = (
      await cloudflareApi.listDnsRecords(domain.cloudflareZoneId)
    ).some(record => record.id === recordId);
    if (!belongs)
      return {
        message: "O registro não pertence a este domínio.",
        success: false,
      };
    await cloudflareApi.updateDnsRecord(
      domain.cloudflareZoneId,
      recordId,
      parsed.input
    );
    refresh(domain.id);
    return { message: "Registro DNS atualizado.", success: true };
  } catch (error) {
    return failure(error, "Não foi possível atualizar o registro.");
  }
}

export async function deleteCloudflareDnsRecordAction(
  _state: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const domainId = String(formData.get("domainId") || "");
  const recordId = String(formData.get("recordId") || "");
  const domain = await authorizedDomain(domainId);
  if (!domain?.cloudflareZoneId || !recordId)
    return { message: "Registro Cloudflare não autorizado.", success: false };
  try {
    const belongs = (
      await cloudflareApi.listDnsRecords(domain.cloudflareZoneId)
    ).some(record => record.id === recordId);
    if (!belongs)
      return {
        message: "O registro não pertence a este domínio.",
        success: false,
      };
    await cloudflareApi.deleteDnsRecord(domain.cloudflareZoneId, recordId);
    refresh(domain.id);
    return { message: "Registro DNS removido.", success: true };
  } catch (error) {
    return failure(error, "Não foi possível remover o registro.");
  }
}

export async function importCloudflareZoneFileAction(
  _state: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const domainId = String(formData.get("domainId") || "");
  const file = formData.get("file");
  const domain = await authorizedDomain(domainId);
  if (!domain?.cloudflareZoneId || !(file instanceof File))
    return { message: "Arquivo ou zona Cloudflare inválidos.", success: false };
  try {
    await cloudflareApi.importZoneFile(domain.cloudflareZoneId, file);
    refresh(domain.id);
    return { message: "Arquivo de zona importado.", success: true };
  } catch (error) {
    return failure(error, "Não foi possível importar o arquivo de zona.");
  }
}
