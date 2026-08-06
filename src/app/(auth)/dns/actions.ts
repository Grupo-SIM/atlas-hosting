// src/app/(authenticated)/(dashboard)/sites/[domain]/dns/actions.ts
"use server";

import { isError } from "lodash";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import type {
  DnsHostRecord,
  DnsHostRecordItem,
  DnsRecordType,
} from "@/lib/server/apis/namecheap/types";
import { parseDomainForSldTld } from "./utils"; // We'll create this util

export interface DnsActionResult {
  success: boolean;
  message: string;
  errors?: { field?: string; message: string }[];
}

const dnsEditingDisabled: DnsActionResult = {
  message: "A edição de DNS não está disponível na Atlas. Gerencie os registros no provedor DNS atual.",
  success: false,
};

// Maps DnsHostRecordItem (from getHosts) to DnsHostRecord (for setHosts)
function mapItemToRecord(item: DnsHostRecordItem): DnsHostRecord {
  return {
    Address: item.Address,
    HostName: item.Name,
    MXPref: item.MXPref,
    RecordType: item.Type as DnsRecordType, // Assuming DnsHostRecordItem.Type is compatible
    TTL: item.TTL,
  };
}

// Core logic for DNS operations
async function performDnsOperation(
  domainName: string,
  operation: (
    currentItems: DnsHostRecordItem[]
  ) => DnsHostRecordItem[] | Promise<DnsHostRecordItem[]>
): Promise<DnsActionResult> {
  const user = await getUser();

  if (!user) return { message: "Usuário não autenticado.", success: false };

  // Optional: Add a check here to ensure `user` is authorized to manage `domainName`
  // e.g., if (!user.domains.some(d => d.name === domainName)) return { ... }

  let sld: string;
  let tld: string;

  try {
    ({ sld, tld } = parseDomainForSldTld(domainName));
  } catch (e) {
    return {
      message: isError(e) ? e.message : "Formato de nome de domínio inválido.",
      success: false,
    };
  }

  try {
    const currentDnsInfo = await namecheapApi.getDnsHosts({
      SLD: sld,
      TLD: tld,
    });
    const currentItems = currentDnsInfo.Hosts || [];

    const newItems = await operation(currentItems);
    const recordsForApi = newItems.map(mapItemToRecord);

    const response = await namecheapApi.setHosts({
      Records: recordsForApi,
      SLD: sld,
      TLD: tld,
    });

    if (response.IsSuccess) {
      revalidateTag("dns-records", "default");
      revalidatePath("/dns"); // Ensure the DNS page is revalidated
      return {
        message: "Registros DNS atualizados com sucesso.",
        success: true,
      };
    }
    // This case might be rare if _makeRequest throws on API errors
    return {
      message: "A API Namecheap relatou um erro ao atualizar os registros DNS.",
      success: false,
    };
  } catch (error) {
    console.error(
      `Erro na operação DNS para ${domainName} (SLD: ${sld}, TLD: ${tld}):`,
      error
    );
    // Errors from namecheapApi._makeRequest are already somewhat formatted
    return {
      message: isError(error)
        ? error.message
        : "Ocorreu um erro inesperado durante a operação DNS.",
      success: false,
    };
  }
}

interface DnsRecordClientInput {
  domainName: string;
  hostName: string;
  recordType: DnsRecordType;
  address: string;
  ttl: number;
  mxPref?: number;
  hostId?: number; // For update/delete, this is DnsHostRecordItem.HostId
}

function parseAndValidateFormData(formData: FormData): {
  data?: DnsRecordClientInput;
  error?: DnsActionResult;
} {
  const domainName = formData.get("domainName") as string;
  const hostName = formData.get("hostName") as string;
  const recordType = formData.get("recordType") as DnsRecordType;
  const address = formData.get("address") as string;
  const ttlStr = formData.get("ttl") as string;
  const mxPrefStr = formData.get("mxPref") as string | undefined;
  const hostIdStr = formData.get("hostId") as string | undefined;

  if (!domainName || !hostName || !recordType || !address || !ttlStr) {
    return {
      error: {
        message:
          "Campos obrigatórios ausentes: domínio, host, tipo, endereço, TTL.",
        success: false,
      },
    };
  }

  const ttl = Number.parseInt(ttlStr, 10);
  if (Number.isNaN(ttl) || ttl < 60) {
    // Namecheap min TTL is often 60
    return {
      error: {
        message:
          "Valor de TTL inválido. Deve ser um número (por exemplo, 3600 para 1 hora).",
        success: false,
      },
    };
  }

  let mxPref: number | undefined;
  if (recordType === "MX") {
    if (!mxPrefStr || Number.isNaN(Number.parseInt(mxPrefStr, 10))) {
      return {
        error: {
          message: "Registros MX requerem uma Prioridade numérica válida.",
          success: false,
        },
      };
    }
    mxPref = Number.parseInt(mxPrefStr, 10);
  }

  let hostId: number | undefined;
  if (hostIdStr) {
    if (Number.isNaN(Number.parseInt(hostIdStr, 10))) {
      return {
        error: { message: "HostId inválido para a operação.", success: false },
      };
    }
    hostId = Number.parseInt(hostIdStr, 10);
  }

  return {
    data: { address, domainName, hostId, hostName, mxPref, recordType, ttl },
  };
}

export async function addDnsRecordAction(
  _prevState: DnsActionResult | null,
  _formData: FormData
): Promise<DnsActionResult> {
  return dnsEditingDisabled;
}

export async function updateDnsRecordAction(
  _prevState: DnsActionResult | null,
  _formData: FormData
): Promise<DnsActionResult> {
  return dnsEditingDisabled;
}

export async function deleteDnsRecordAction(
  _prevState: DnsActionResult | null,
  _formData: FormData
): Promise<DnsActionResult> {
  return dnsEditingDisabled;
}
