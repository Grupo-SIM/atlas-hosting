export interface DomainAccessRecord {
  active: boolean;
  domain: string;
}

export function normalizeDomainName(domain: string): string {
  return domain.trim().toLowerCase().replace(/\.$/, "");
}

export function hasActiveDomainAccess(
  domains: readonly DomainAccessRecord[],
  domain: string
): boolean {
  const normalizedDomain = normalizeDomainName(domain);
  return domains.some(
    candidate =>
      candidate.active && normalizeDomainName(candidate.domain) === normalizedDomain
  );
}
