import type {
  DnsRecord,
  DnsRecordRequest,
  DnsRecordRequestTypeEnum,
} from "@/plesk";
import pleskApi from ".";

export interface PleskDnsRecord {
  host: string;
  id: number;
  priority?: number;
  ttl: number;
  type: DnsRecordRequestTypeEnum;
  value: string;
}

export interface PleskDnsRecordInput {
  host: string;
  priority?: number;
  ttl: number;
  type: DnsRecordRequestTypeEnum;
  value: string;
}

export function normalizePleskDnsRecord(record: DnsRecord): PleskDnsRecord {
  if (
    record.id === undefined ||
    !record.host ||
    !record.type ||
    !record.value ||
    record.ttl === undefined
  ) {
    throw new Error("O Plesk retornou um registro DNS incompleto.");
  }
  const priority =
    record.type === "MX" ? Number.parseInt(record.opt || "", 10) : undefined;
  return {
    host: record.host,
    id: record.id,
    ...(priority === undefined || Number.isNaN(priority) ? {} : { priority }),
    ttl: record.ttl,
    type: record.type as unknown as DnsRecordRequestTypeEnum,
    value: record.value,
  };
}

function toPleskRecord(input: PleskDnsRecordInput): DnsRecordRequest {
  return {
    host: input.host,
    ...(input.type === "MX" && input.priority !== undefined
      ? { opt: String(input.priority) }
      : {}),
    ttl: input.ttl,
    type: input.type,
    value: input.value,
  };
}

export async function listPleskDnsRecords(
  domain: string
): Promise<PleskDnsRecord[]> {
  const { data } = await pleskApi.dnsApi.dnsRecordsGet(domain);
  return data.map(normalizePleskDnsRecord);
}

export async function createPleskDnsRecord(
  domain: string,
  input: PleskDnsRecordInput
) {
  const { data } = await pleskApi.dnsApi.dnsRecordsPost(
    toPleskRecord(input),
    domain
  );
  return normalizePleskDnsRecord(data);
}

export async function updatePleskDnsRecord(
  id: number,
  input: PleskDnsRecordInput
) {
  await pleskApi.dnsApi.dnsRecordsIdPut(
    toPleskRecord(input) as unknown as DnsRecord,
    id
  );
}

export async function deletePleskDnsRecord(id: number) {
  await pleskApi.dnsApi.dnsRecordsIdDelete(id);
}
