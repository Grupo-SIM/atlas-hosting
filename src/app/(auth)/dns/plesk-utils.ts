import { cache } from "react";
import { listPleskDnsRecords } from "@/lib/server/apis/plesk/dns";
import type { DnsHostRecordItem } from "@/lib/server/apis/namecheap/types";

export interface CachedPleskDnsData {
  isUsingOurDNS: true;
  records: DnsHostRecordItem[];
  sld: string;
  tld: string;
}

export const getCachedPleskDnsRecords = cache(async function getCachedPleskDnsRecords(
  domainName: string
): Promise<CachedPleskDnsData> {
  const records = await listPleskDnsRecords(domainName);
  return {
    isUsingOurDNS: true,
    records: records.map(record => ({
      Address: record.value,
      HostId: record.id,
      MXPref: record.priority,
      Name: record.host,
      TTL: record.ttl,
      Type: record.type,
    })) as DnsHostRecordItem[],
    sld: "",
    tld: "",
  };
});
