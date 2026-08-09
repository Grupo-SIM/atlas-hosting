import pleskApi from "@/lib/server/apis/plesk";
import {
  createPleskDnsRecord,
  listPleskDnsRecords,
} from "@/lib/server/apis/plesk/dns";
import { discoverPublicDnsRecords } from "./public-dns";

export async function preparePleskDnsZone(domain: string) {
  // AXFR normally is disabled, so discover common records before delegation and
  // merge them without deleting the Plesk defaults.
  const discovered = await discoverPublicDnsRecords(domain);
  const existingDomain = await pleskApi.getDomain(domain).catch(() => null);
  if (!existingDomain) {
    await pleskApi.domainsApi.domainsPost({
      hosting_type: "none" as never,
      name: domain,
    });
  }
  const current = await listPleskDnsRecords(domain);
  const existing = new Set(
    current.map(
      record => `${record.host.toLowerCase()}|${record.type}|${record.value}`
    )
  );
  const supported = new Set(["A", "AAAA", "CAA", "CNAME", "MX", "TXT"]);
  for (const record of discovered) {
    if (!supported.has(record.Type)) continue;
    const host = record.Name.endsWith(".") ? record.Name : `${record.Name}.`;
    const key = `${host.toLowerCase()}|${record.Type}|${record.Address}`;
    if (existing.has(key)) continue;
    await createPleskDnsRecord(domain, {
      host,
      priority: record.MXPref,
      ttl: Math.max(60, record.TTL || 300),
      type: record.Type as never,
      value: record.Address,
    });
    existing.add(key);
  }
}
