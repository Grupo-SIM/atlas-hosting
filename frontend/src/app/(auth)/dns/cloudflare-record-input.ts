import type {
  CloudflareDnsRecordInput,
  CloudflareDnsRecordType,
} from "@/lib/server/apis/cloudflare";
import { normalizeDomainName } from "@/lib/server/domains/authorization";

export const editableCloudflareRecordTypes = [
  "A",
  "AAAA",
  "CAA",
  "CNAME",
  "HTTPS",
  "MX",
  "NS",
  "SRV",
  "SVCB",
  "TLSA",
  "TXT",
] as const satisfies readonly CloudflareDnsRecordType[];

function integer(formData: FormData, field: string, fallback?: number) {
  const raw = formData.get(field);
  if ((raw === null || raw === "") && fallback !== undefined) return fallback;
  const value = Number.parseInt(String(raw), 10);
  return Number.isInteger(value) ? value : null;
}

export function absoluteRecordName(host: string, domain: string) {
  const normalizedDomain = normalizeDomainName(domain);
  const normalizedHost = host.trim().toLowerCase().replace(/\.$/, "");
  if (
    !normalizedHost ||
    normalizedHost === "@" ||
    normalizedHost === normalizedDomain
  )
    return normalizedDomain;
  if (normalizedHost.endsWith(`.${normalizedDomain}`)) return normalizedHost;
  return `${normalizedHost}.${normalizedDomain}`;
}

export function parseCloudflareRecordForm(
  formData: FormData,
  domain: string
): { input?: CloudflareDnsRecordInput; message?: string } {
  const type = String(
    formData.get("recordType") || ""
  ).toUpperCase() as CloudflareDnsRecordType;
  if (!(editableCloudflareRecordTypes as readonly string[]).includes(type))
    return { message: "Tipo de registro não suportado pelo editor." };

  const name = absoluteRecordName(
    String(formData.get("hostName") || ""),
    domain
  );
  const content = String(formData.get("content") || "").trim();
  const ttl = integer(formData, "ttl");
  if (!content || ttl === null || (ttl !== 1 && (ttl < 60 || ttl > 86_400)))
    return {
      message: "Informe um valor e um TTL automático ou entre 60 e 86400.",
    };
  if (type === "NS" && name === normalizeDomainName(domain))
    return {
      message: "Os nameservers principais são atribuídos pelo Atlas.",
    };

  const input: CloudflareDnsRecordInput = {
    comment: String(formData.get("comment") || "").trim() || undefined,
    content,
    name,
    proxied:
      ["A", "AAAA", "CNAME"].includes(type) && formData.get("proxied") === "on",
    ttl,
    type,
  };

  if (type === "MX") {
    const priority = integer(formData, "priority");
    if (priority === null || priority < 0 || priority > 65_535)
      return { message: "Informe uma prioridade MX entre 0 e 65535." };
    input.priority = priority;
  }
  if (type === "CAA") {
    const flags = integer(formData, "caaFlags", 0);
    const tag = String(formData.get("caaTag") || "issue").trim();
    if (flags === null || flags < 0 || flags > 255 || !tag)
      return { message: "Informe flags e tag CAA válidos." };
    input.content = `${flags} ${tag} "${content.replace(/^"|"$/g, "")}"`;
    input.data = { flags, tag, value: content.replace(/^"|"$/g, "") };
  }
  if (type === "SRV") {
    const priority = integer(formData, "priority");
    const weight = integer(formData, "srvWeight");
    const port = integer(formData, "srvPort");
    if (
      priority === null ||
      weight === null ||
      port === null ||
      Math.min(priority, weight, port) < 0 ||
      Math.max(priority, weight, port) > 65_535
    )
      return { message: "Informe prioridade, peso e porta SRV válidos." };
    input.content = `${priority} ${weight} ${port} ${content}`;
    input.data = { port, priority, target: content, weight };
  }
  return { input };
}
