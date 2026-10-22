import { query } from "dns-query";
import type {
  DnsHostRecordItem,
  DnsRecordType,
} from "@/lib/server/apis/namecheap/types";

const apexTypes = ["A", "AAAA", "MX", "TXT", "CAA", "NS"] as const;
const commonHosts = ["www", "mail", "autodiscover", "_dmarc"] as const;

export async function discoverPublicDnsRecords(
  domain: string
): Promise<DnsHostRecordItem[]> {
  const questions = [
    ...apexTypes.map(type => ({ name: domain, type })),
    ...commonHosts.flatMap(host =>
      (["A", "AAAA", "CNAME", "TXT"] as const).map(type => ({
        name: `${host}.${domain}`,
        type,
      }))
    ),
  ];
  const responses = await Promise.all(
    questions.map(async (question, index) => {
      try {
        const response = await query(
          { question },
          { endpoints: ["1.1.1.1", "8.8.8.8"] }
        );
        return (response.answers || []).map((answer, answerIndex) => {
          const data =
            typeof answer.data === "string"
              ? answer.data
              : JSON.stringify(answer.data);
          const mx = answer.type === "MX" ? data.match(/^(\d+)\s+(.+)$/) : null;
          return {
            Address: mx?.[2] || data,
            HostId: index * 100 + answerIndex,
            MXPref: mx ? Number.parseInt(mx[1], 10) : undefined,
            Name: answer.name || question.name,
            TTL: answer.ttl || 300,
            Type: answer.type as DnsRecordType,
          };
        });
      } catch {
        return [];
      }
    })
  );
  const seen = new Set<string>();
  return responses.flat().filter(record => {
    const key = `${record.Name}|${record.Type}|${record.Address}|${record.MXPref ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
