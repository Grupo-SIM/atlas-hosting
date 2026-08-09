"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import {
  createPleskDnsRecord,
  deletePleskDnsRecord,
  listPleskDnsRecords,
  updatePleskDnsRecord,
} from "@/lib/server/apis/plesk/dns";
import {
  hasActiveDomainAccess,
  normalizeDomainName,
} from "@/lib/server/domains/authorization";
import type { DnsRecordRequestTypeEnum } from "@/plesk";

export interface DnsActionResult {
  success: boolean;
  message: string;
  errors?: { field?: string; message: string }[];
}

const allowedTypes = new Set([
  "A",
  "AAAA",
  "CAA",
  "CNAME",
  "MX",
  "NS",
  "SRV",
  "TLSA",
  "TXT",
]);

function parseInput(formData: FormData) {
  const domainName = normalizeDomainName(
    String(formData.get("domainName") || "")
  );
  const hostName = String(formData.get("hostName") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const recordType = String(formData.get("recordType") || "").toUpperCase();
  const ttl = Number.parseInt(String(formData.get("ttl") || ""), 10);
  const hostIdRaw = formData.get("hostId");
  const hostId = hostIdRaw ? Number.parseInt(String(hostIdRaw), 10) : undefined;
  const mxPref =
    recordType === "MX"
      ? Number.parseInt(String(formData.get("mxPref") || ""), 10)
      : undefined;
  if (!domainName || !hostName || !address || !allowedTypes.has(recordType))
    return null;
  if (!Number.isInteger(ttl) || ttl < 60) return null;
  if (recordType === "MX" && (!Number.isInteger(mxPref) || (mxPref ?? -1) < 0))
    return null;
  return {
    address,
    domainName,
    hostId,
    hostName,
    mxPref,
    recordType: recordType as DnsRecordRequestTypeEnum,
    ttl,
  };
}

function pleskHost(host: string, domain: string) {
  if (host === "@" || host === domain || host === `${domain}.`)
    return `${domain}.`;
  if (host.endsWith(".")) return host;
  if (host.toLowerCase().endsWith(`.${domain}`)) return `${host}.`;
  return `${host}.${domain}.`;
}

async function authorize(domain: string): Promise<DnsActionResult | null> {
  const user = await getUser();
  if (!user) return { message: "Usuário não autenticado.", success: false };
  if (!hasActiveDomainAccess(user.organization.domains, domain, true)) {
    return {
      message:
        "Este domínio não está habilitado para DNS gerenciado pelo Atlas.",
      success: false,
    };
  }
  return null;
}

async function recordBelongsToDomain(domain: string, id: number) {
  const records = await listPleskDnsRecords(domain);
  return records.find(record => record.id === id);
}

function isProtected(domain: string, record: { host: string; type: string }) {
  const apex = record.host.replace(/\.$/, "").toLowerCase() === domain;
  return record.type === "SOA" || (record.type === "NS" && apex);
}

function refresh(domain: string) {
  revalidatePath("/dns");
  revalidatePath(`/domains/${domain}`);
}

export async function addPleskDnsRecordAction(
  _state: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const input = parseInput(formData);
  if (!input)
    return {
      message: "Revise tipo, host, valor e TTL (mínimo 60).",
      success: false,
    };
  const denied = await authorize(input.domainName);
  if (denied) return denied;
  try {
    await createPleskDnsRecord(input.domainName, {
      ...input,
      host: pleskHost(input.hostName, input.domainName),
      priority: input.mxPref,
      type: input.recordType,
      value: input.address,
    });
    refresh(input.domainName);
    return { message: "Registro DNS adicionado.", success: true };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o registro.",
      success: false,
    };
  }
}

export async function updatePleskDnsRecordAction(
  _state: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const input = parseInput(formData);
  if (!input?.hostId) return { message: "Registro inválido.", success: false };
  const denied = await authorize(input.domainName);
  if (denied) return denied;
  try {
    const current = await recordBelongsToDomain(input.domainName, input.hostId);
    if (!current)
      return {
        message: "O registro não pertence a este domínio.",
        success: false,
      };
    if (isProtected(input.domainName, current))
      return {
        message: "SOA e nameservers principais são gerenciados pelo Atlas.",
        success: false,
      };
    await updatePleskDnsRecord(input.hostId, {
      host: pleskHost(input.hostName, input.domainName),
      priority: input.mxPref,
      ttl: input.ttl,
      type: input.recordType,
      value: input.address,
    });
    refresh(input.domainName);
    return { message: "Registro DNS atualizado.", success: true };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o registro.",
      success: false,
    };
  }
}

export async function deletePleskDnsRecordAction(
  _state: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const domain = normalizeDomainName(String(formData.get("domainName") || ""));
  const id = Number.parseInt(String(formData.get("hostId") || ""), 10);
  if (!domain || !Number.isInteger(id))
    return { message: "Registro inválido.", success: false };
  const denied = await authorize(domain);
  if (denied) return denied;
  try {
    const current = await recordBelongsToDomain(domain, id);
    if (!current)
      return {
        message: "O registro não pertence a este domínio.",
        success: false,
      };
    if (isProtected(domain, current))
      return {
        message: "SOA e nameservers principais são gerenciados pelo Atlas.",
        success: false,
      };
    await deletePleskDnsRecord(id);
    refresh(domain);
    return { message: "Registro DNS removido.", success: true };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível remover o registro.",
      success: false,
    };
  }
}
