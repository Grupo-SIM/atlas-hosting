export interface DomainAccessRecord {
  active: boolean;
  domain: string;
  dnsMode?: string | null;
}

export function normalizeDomainName(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .replace(/\.$/, "");
}

export function hasActiveDomainAccess(
  domains: readonly DomainAccessRecord[],
  domain: string,
  requireAtlasDns = false
): boolean {
  const normalizedDomain = normalizeDomainName(domain);
  return domains.some(
    candidate =>
      candidate.active &&
      normalizeDomainName(candidate.domain) === normalizedDomain &&
      (!requireAtlasDns || candidate.dnsMode === "atlas")
  );
}
