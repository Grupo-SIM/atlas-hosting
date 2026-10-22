import type { DeSECClient } from "./DeSECClient";
import type { DynDNSUpdateResponse } from "./types";

/**
 * Service for interacting with the deSEC DynDNS Update API.
 * This API is separate from the main REST API and has different authentication.
 */
export class DynDNSService {
  private client: DeSECClient;

  constructor(client: DeSECClient) {
    this.client = client;
  }

  /**
   * Updates the IPv4 and/or IPv6 addresses for a domain using the DynDNS API.
   * Uses HTTP Basic Authentication (domain name as username, token secret as password).
   * [5, 6]
   * @param domainName The full domain name to update (e.g., 'yourname.dedyn.io').
   * @param tokenSecret The authentication token secret for the domain.
   * @param ipv4 Optional: IPv4 address(es) to set (e.g., '192.0.2.1' or '192.0.2.1,192.0.2.2').
   *             If not provided and `preserveIpv4` is false, existing IPv4 records will be deleted.
   * @param ipv6 Optional: IPv6 address(es) to set (e.g., '2001:db8::1' or '2001:db8::1,2001:db8::2').
   *             If not provided and `preserveIpv6` is false, existing IPv6 records will be deleted.
   * @param preserveIpv4 Optional: If true, preserves existing IPv4 records if `ipv4` is not provided.
   * @param preserveIpv6 Optional: If true, preserves existing IPv6 records if `ipv6` is not provided.
   * @returns A Promise resolving to 'good' on success, or an error string from the API.
   */
  public async updateIP(
    domainName: string,
    tokenSecret: string,
    ipv4?: string | string,
    ipv6?: string | string,
    preserveIpv4 = false,
    preserveIpv6 = false
  ): Promise<DynDNSUpdateResponse> {
    return this.client.dynDNSUpdate(
      domainName,
      tokenSecret,
      ipv4,
      ipv6,
      false,
      preserveIpv4,
      preserveIpv6
    );
  }

  /**
   * Updates the IPv6 address for a domain using the `update6.dedyn.io` endpoint.
   * Note: Using this endpoint without explicitly providing an IPv4 address will remove existing IPv4 records.
   * [5]
   * @param domainName The full domain name to update.
   * @param tokenSecret The authentication token secret for the domain.
   * @param ipv6 Optional: IPv6 address(es) to set.
   * @param preserveIpv4 Optional: If true, preserves existing IPv4 records (requires explicit `myipv4` param in the underlying call).
   * @param preserveIpv6 Optional: If true, preserves existing IPv6 records if `ipv6` is not provided.
   * @returns A Promise resolving to 'good' on success, or an error string from the API.
   */
  public async updateIPv6(
    domainName: string,
    tokenSecret: string,
    ipv6?: string | string,
    preserveIpv4 = false,
    preserveIpv6 = false
  ): Promise<DynDNSUpdateResponse> {
    // When using update6.dedyn.io, if ipv4 is not explicitly provided, it will be removed.
    // The `dynDNSUpdate` method handles the `myipv4=''` parameter for this case.
    return this.client.dynDNSUpdate(
      domainName,
      tokenSecret,
      undefined,
      ipv6,
      true,
      preserveIpv4,
      preserveIpv6
    );
  }
}
