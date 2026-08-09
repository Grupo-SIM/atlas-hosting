import { createHmac } from "node:crypto";
import { normalizeDomainName } from "./authorization";

const verificationPrefix = "atlas-domain-verification=";

export interface DomainVerificationRecord {
  host: string;
  value: string;
}

export function createDomainVerificationRecord(
  domain: string,
  organizationId: string,
  secret: string
): DomainVerificationRecord {
  const normalizedDomain = normalizeDomainName(domain);
  const token = createHmac("sha256", secret)
    .update(`${organizationId}:${normalizedDomain}`)
    .digest("hex")
    .slice(0, 32);

  return {
    host: `_atlas-verification.${normalizedDomain}`,
    value: `${verificationPrefix}${token}`,
  };
}

export function txtEntriesContainToken(
  entries: readonly string[],
  token: string
): boolean {
  return entries.some(entry => entry.replace(/^"|"$/g, "").trim() === token);
}
