import { cache } from "react";
import type { DnsHostRecordItem } from "@/lib/server/apis/namecheap/types";
import { listPleskDnsRecords } from "@/lib/server/apis/plesk/dns";

export const getCachedPleskDnsRecords = cache(async (domainName: string) => {
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
