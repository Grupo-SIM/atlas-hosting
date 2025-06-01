// src/app/(authenticated)/(dashboard)/sites/[domain]/dns/actions.ts
"use server";

import { namecheapApi } from "@/lib/server/apis/namecheap";
import type {
  DnsHostRecord,
  DnsHostRecordItem,
  DnsRecordType,
} from "@/lib/server/apis/namecheap/types";
import { revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth";
import { parseDomainForSldTld } from "./utils"; // We'll create this util
import { isError } from "lodash";
import { cookies } from "next/headers";

export interface DnsActionResult {
  success: boolean;
  message: string;
  errors?: { field?: string; message: string }[];
}

// Maps DnsHostRecordItem (from getHosts) to DnsHostRecord (for setHosts)
function mapItemToRecord(item: DnsHostRecordItem): DnsHostRecord {
  return {
    HostName: item.Name,
    RecordType: item.Type as DnsRecordType, // Assuming DnsHostRecordItem.Type is compatible
    Address: item.Address,
    MXPref: item.MXPref,
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

  if (!user) return { success: false, message: "Usuário não autenticado." };

  // Optional: Add a check here to ensure `user` is authorized to manage `domainName`
  // e.g., if (!user.domains.some(d => d.name === domainName)) return { ... }

  let sld: string;
  let tld: string;

  try {
    ({ sld, tld } = parseDomainForSldTld(domainName));
  } catch (e) {
    return {
      success: false,
      message: isError(e) ? e.message : "Formato de nome de domínio inválido.",
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
      SLD: sld,
      TLD: tld,
      Records: recordsForApi,
    });

    if (response.IsSuccess) {
      revalidateTag("dns-records");
      return {
        success: true,
        message: "Registros DNS atualizados com sucesso.",
      };
    }
    // This case might be rare if _makeRequest throws on API errors
    return {
      success: false,
      message: "A API Namecheap relatou um erro ao atualizar os registros DNS.",
    };
  } catch (error) {
    console.error(
      `Erro na operação DNS para ${domainName} (SLD: ${sld}, TLD: ${tld}):`,
      error
    );
    // Errors from namecheapApi._makeRequest are already somewhat formatted
    return {
      success: false,
      message: isError(error)
        ? error.message
        : "Ocorreu um erro inesperado durante a operação DNS.",
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
        success: false,
        message:
          "Campos obrigatórios ausentes: domínio, host, tipo, endereço, TTL.",
      },
    };
  }

  const ttl = Number.parseInt(ttlStr, 10);
  if (Number.isNaN(ttl) || ttl < 60) {
    // Namecheap min TTL is often 60
    return {
      error: {
        success: false,
        message:
          "Valor de TTL inválido. Deve ser um número (por exemplo, 3600 para 1 hora).",
      },
    };
  }

  let mxPref: number | undefined;
  if (recordType === "MX") {
    if (!mxPrefStr || Number.isNaN(Number.parseInt(mxPrefStr, 10))) {
      return {
        error: {
          success: false,
          message: "Registros MX requerem uma Prioridade numérica válida.",
        },
      };
    }
    mxPref = Number.parseInt(mxPrefStr, 10);
  }

  let hostId: number | undefined;
  if (hostIdStr) {
    if (Number.isNaN(Number.parseInt(hostIdStr, 10))) {
      return {
        error: { success: false, message: "HostId inválido para a operação." },
      };
    }
    hostId = Number.parseInt(hostIdStr, 10);
  }

  return {
    data: { domainName, hostName, recordType, address, ttl, mxPref, hostId },
  };
}

export async function addDnsRecordAction(
  _prevState: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const { data, error } = parseAndValidateFormData(formData);
  if (error || !data)
    return (
      error || {
        success: false,
        message: "Dados de formulário inválidos para adicionar registro.",
      }
    );

  return performDnsOperation(data.domainName, (currentItems) => {
    const newRecordItem: DnsHostRecordItem = {
      HostId: 0, // Placeholder, Namecheap assigns this upon creation. Not sent.
      Name: data.hostName,
      Type: data.recordType,
      Address: data.address,
      TTL: data.ttl,
      MXPref: data.recordType === "MX" ? data.mxPref : undefined,
    };
    // Potentially check for duplicate records before adding if Namecheap doesn't handle it gracefully
    return [...currentItems, newRecordItem];
  });
}

export async function updateDnsRecordAction(
  _prevState: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const { data, error } = parseAndValidateFormData(formData);
  if (error || !data)
    return (
      error || {
        success: false,
        message: "Dados de formulário inválidos para atualizar o registro.",
      }
    );
  if (data.hostId === undefined)
    return {
      success: false,
      message: "HostId é obrigatório para a operação de atualização.",
    };

  const hostIdToUpdate = data.hostId;

  return performDnsOperation(data.domainName, (currentItems) => {
    const itemIndex = currentItems.findIndex(
      (item) => item.HostId === hostIdToUpdate
    );
    if (itemIndex === -1) {
      // This error will be caught by performDnsOperation's try/catch
      throw new Error(
        "Registro a ser atualizado não encontrado. Pode ter sido excluído por outro processo."
      );
    }
    const updatedItems = [...currentItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex], // Preserve original HostId and any other non-editable fields
      Name: data.hostName,
      Type: data.recordType,
      Address: data.address,
      TTL: data.ttl,
      MXPref: data.recordType === "MX" ? data.mxPref : undefined, // Ensure MXPref is cleared if type changes from MX
    };
    // If type is not MX, ensure MXPref is removed
    if (updatedItems[itemIndex].Type !== "MX") {
      updatedItems[itemIndex].MXPref = undefined;
    }
    return updatedItems;
  });
}

export async function deleteDnsRecordAction(
  _prevState: DnsActionResult | null,
  formData: FormData
): Promise<DnsActionResult> {
  const domainName = formData.get("domainName") as string;
  const hostIdStr = formData.get("hostId") as string;

  if (!domainName || !hostIdStr) {
    return {
      success: false,
      message: "Nome de domínio e HostId são obrigatórios para exclusão.",
    };
  }
  const hostIdNum = Number.parseInt(hostIdStr, 10);
  if (Number.isNaN(hostIdNum)) {
    return { success: false, message: "Formato de HostId inválido." };
  }

  return performDnsOperation(domainName, (currentItems) => {
    const initialLength = currentItems.length;
    const filteredItems = currentItems.filter(
      (item) => item.HostId !== hostIdNum
    );
    if (filteredItems.length === initialLength) {
      console.warn(
        `Registro com HostId ${hostIdNum} para o domínio ${domainName} não encontrado durante a tentativa de exclusão. Pode já ter sido excluído.`
      );
      // No need to throw an error, just proceed with the (unchanged) list.
      // Namecheap will just set the same records again.
    }
    return filteredItems;
  });
}
