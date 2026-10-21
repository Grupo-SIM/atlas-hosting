interface DomainConnectionState {
  active: boolean;
  cloudflareZoneId: string | null;
  connectionStatus: string;
  dnsMode: string;
}

/** Comprados e externos aguardam a mesma confirmação de ativação da zona. */
export function shouldRefreshDomainConnection(domain: DomainConnectionState) {
  return (
    domain.active &&
    domain.dnsMode === "cloudflare" &&
    !!domain.cloudflareZoneId &&
    (domain.connectionStatus === "awaiting_nameservers" ||
      domain.connectionStatus === "awaiting_activation")
  );
}
