// src/app/(authenticated)/(dashboard)/sites/[domain]/dns/utils.ts

import { cache } from "react";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import type { DnsHostRecordItem } from "@/lib/server/apis/namecheap/types";

/**
 * Parses a domain name into its SLD (Second Level Domain) and TLD (Top Level Domain) parts
 * as expected by the Namecheap API.
 * E.g., "example.com" -> { sld: "example", tld: "com" }
 * E.g., "example.co.uk" -> { sld: "example", tld: "co.uk" }
 */
export function parseDomainForSldTld(domainName: string): {
  sld: string;
  tld: string;
} {
  let sld: string;
  let tld: string;
  const domainParts = domainName.toLowerCase().split(".");
  if (domainParts.length < 2) {
    throw new Error(
      `Formato de domínio inválido: ${domainName}. O domínio deve ter pelo menos duas partes.`
    );
  }

  // List of common TLDs that can have a second-level component (e.g., .co.uk, .com.au)
  // This list might need to be expanded for comprehensive global TLD coverage.
  // For Namecheap, they often treat the full suffix (like "co.uk") as the TLD.
  const commonMultiPartTldSuffixes = [
    "co.uk",
    "com.uk",
    "org.uk",
    "net.uk",
    "me.uk",
    "com.au",
    "net.au",
    "org.au",
    "id.au",
    "com.br",
    "net.br",
    "org.br",
    "co.nz",
    "net.nz",
    "org.nz",
    "co.za",
    "com.za",
    "org.za",
    "net.za",
    // Add more as needed based on typical domains you handle
  ];

  const lastTwo = domainParts.slice(-2).join(".");
  const lastThree =
    domainParts.length > 2 ? domainParts.slice(-3).join(".") : null;

  if (lastThree && commonMultiPartTldSuffixes.includes(lastThree)) {
    tld = lastThree;
    sld = domainParts.slice(0, -3).join(".");
  } else if (commonMultiPartTldSuffixes.includes(lastTwo)) {
    tld = lastTwo;
    sld = domainParts.slice(0, -2).join(".");
  } else {
    tld = domainParts.pop() ?? ""; // Last part is TLD
    sld = domainParts.join("."); // Remainder is SLD
  }

  if (!sld) {
    // This can happen if the original domain was just a TLD itself (e.g. "co.uk")
    // Or if the parsing logic for complex TLDs needs adjustment for an edge case.
    // For a domain like "mydomain.co.uk", sld should be "mydomain".
    // If sld is empty, it implies the input was likely just a TLD or malformed.
    throw new Error(
      `Não é possível determinar o SLD para o domínio: ${domainName}. SLD analisado está vazio.`
    );
  }
  if (!tld) {
    throw new Error(
      `Não é possível determinar o TLD para o domínio: ${domainName}. TLD analisado está vazio.`
    );
  }
  return { sld, tld };
}

export interface CachedDnsData {
  records: DnsHostRecordItem[];
  sld: string;
  tld: string;
  isUsingOurDNS: boolean;
}

export const getCachedDnsRecords = cache(async function getCachedDnsRecords(
  domainName: string
): Promise<CachedDnsData> {
  const { sld, tld } = parseDomainForSldTld(domainName);
  try {
    const dnsInfo = await namecheapApi.getDnsHosts({ SLD: sld, TLD: tld });
    return {
      isUsingOurDNS: dnsInfo.IsUsingOurDNS,
      records: dnsInfo.Hosts || [], // Ensure records is always an array
      sld,
      tld,
    };
  } catch (error) {
    console.error(
      `Erro ao buscar registros DNS via getCachedDnsRecords para ${domainName} (SLD: ${sld}, TLD: ${tld}):`,
      error
    );
    // Rethrow the error so the page can display a generic error message.
    // The error from namecheapApi._makeRequest should be descriptive enough.
    throw error;
  }
});
