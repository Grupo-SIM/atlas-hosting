"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import {
  createPleskDnsRecord,
  deletePleskDnsRecord,
  updatePleskDnsRecord,
} from "@/lib/server/apis/plesk/dns";
import { hasActiveDomainAccess } from "@/lib/server/domains/authorization";
import { DnsRecordRequestTypeEnum } from "@/plesk";

export interface DnsActionResult {
  success: boolean;
  message: string;
  errors?: { field?: string; message: string }[];
}

const allowedRecordTypes = new Set([
  "A", "AAAA", "CAA", "CNAME", "MX", "NS", "SRV", "TLSA", "TXT",
]);

interface DnsRecordInput {
  address: string;
  domainName: string;
  hostId?: number;
  hostName: string;
  mxPref?: number;
  recordType: DnsRecordRequestTypeEnum;
  ttl: number;
}

function parseInput(formData: FormData): DnsRecordInput | DnsActionResult {
  const domainName = String(formData.get("domainName") || "").trim();
  const hostName = String(formData.get("hostName") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const recordType = String(formData.get("recordType") || "").toUpperCase();
  const ttl = Number.parseInt(String(formData.get("ttl") || ""), 10);
  const hostIdRaw = formData.get("hostId");
  const mxPrefRaw = formData.get("mxPref");

  if (!domainName || !hostName || !address || !allowedRecordTypes.has(recordType)) {
    return { message: "Preencha domínio, host, valor e um tipo de registro válido.", success: false };
  }
  if (!Number.isInteger(ttl) || ttl < 60) {
    return { message: "TTL inválido. Use no mínimo 60 segundos.", success: false };
  }

  const mxPref = recordType === "MX" ? Number.parseInt(String(mxPrefRaw || ""), 10) : undefined;
  if (recordType === "MX" && (!Number.isInteger(mxPref) || mxPref === undefined || mxPref < 0)) {
    return { message: "Registros MX exigem uma prioridade válida.", success: false };
  }

  const hostId = hostIdRaw ? Number.parseInt(String(hostIdRaw), 10) : undefined;
  if (hostIdRaw && !Number.isInteger(hostId)) {
    return { message: "Registro DNS inválido.", success: false };
  }

  return { address, domainName, hostId, hostName, mxPref, recordType: recordType as DnsRecordRequestTypeEnum, ttl };
}

function isError(result: DnsRecordInput | DnsActionResult): result is DnsActionResult {
  return "success" in result;
}

function toPleskHost(host: string, domain: string): string {
  if (host === "@") return `${domain}.`;
  if (host.endsWith(".")) return host;
  if (host.toLowerCase().endsWith(`.${domain.toLowerCase()}`)) return `${host}.`;
  return `${host}.${domain}.`;
}

async function authorize(domain: string): Promise<DnsActionResult | null> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", success: false };
  if (!hasActiveDomainAccess(user.organization.domains, domain)) {
    return { message: "Você não tem acesso a um domínio ativo com esse nome.", success: false };
  }
  return null;
}

function refreshDnsPage(domain: string) {
  revalidatePath("/dns");
  revalidatePath(`/dns?domain=${encodeURIComponent(domain)}`);
}

export async function addPleskDnsRecordAction(
  _prevState: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const input = parseInput(formData);
  if (isError(input)) return input;
  const denied = await authorize(input.domainName);
  if (denied) return denied;
  try {
    await createPleskDnsRecord(input.domainName, {
      host: toPleskHost(input.hostName, input.domainName),
      priority: input.mxPref,
      ttl: input.ttl,
      type: input.recordType,
      value: input.address,
    });
    refreshDnsPage(input.domainName);
    return { message: "Registro DNS adicionado com sucesso.", success: true };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Não foi possível adicionar o registro DNS.", success: false };
  }
}

export async function updatePleskDnsRecordAction(
  _prevState: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const input = parseInput(formData);
  if (isError(input)) return input;
  if (input.hostId === undefined) return { message: "Registro DNS inválido.", success: false };
  const denied = await authorize(input.domainName);
  if (denied) return denied;
  try {
    await updatePleskDnsRecord(input.hostId, {
      host: toPleskHost(input.hostName, input.domainName),
      priority: input.mxPref,
      ttl: input.ttl,
      type: input.recordType,
      value: input.address,
    });
    refreshDnsPage(input.domainName);
    return { message: "Registro DNS atualizado com sucesso.", success: true };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Não foi possível atualizar o registro DNS.", success: false };
  }
}

export async function deletePleskDnsRecordAction(
  _prevState: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const domainName = String(formData.get("domainName") || "").trim();
  const hostId = Number.parseInt(String(formData.get("hostId") || ""), 10);
  if (!domainName || !Number.isInteger(hostId)) return { message: "Registro DNS inválido.", success: false };
  const denied = await authorize(domainName);
  if (denied) return denied;
  try {
    await deletePleskDnsRecord(hostId);
    refreshDnsPage(domainName);
    return { message: "Registro DNS removido com sucesso.", success: true };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Não foi possível remover o registro DNS.", success: false };
  }
}





