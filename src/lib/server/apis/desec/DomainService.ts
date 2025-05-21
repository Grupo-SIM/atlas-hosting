// src/services/DomainService.ts

import { DeSECClient } from "./DeSECClient";
import { Domain, CreateDomainPayload } from "./types";

/**
 * Service for managing deSEC DNS domains.
 */
export class DomainService {
  private client: DeSECClient;

  constructor(client: DeSECClient) {
    this.client = client;
  }

  /**
   * Creates a new DNS domain.
   * Requires `perm_create_domain` permission on the token.
   * [3]
   * @param payload The domain creation details, including name and optional zonefile.
   * @returns The created Domain object.
   */
  public async createDomain(payload: CreateDomainPayload): Promise<Domain> {
    return this.client.post<Domain>("/domains/", payload);
  }

  /**
   * Retrieves a list of all domains owned by the user.
   * DNSSEC keys are omitted for performance.
   * [3]
   * @returns An array of Domain objects.
   */
  public async listDomains(): Promise<Domain> {
    return this.client.get<Domain>("/domains/");
  }

  /**
   * Retrieves detailed information about a specific domain by its name.
   * Includes DNSSEC public key information.
   * [3]
   * @param name The name of the domain.
   * @returns The Domain object.
   */
  public async getDomain(name: string): Promise<Domain> {
    return this.client.get<Domain>(`/domains/${name}/`);
  }

  /**
   * Identifies the authoritative zone for a given DNS query name (qname).
   * Useful for ACME DNS challenges.
   * [3]
   * @param qname The DNS query name.
   * @returns An array containing the responsible Domain object, or an empty array if none.
   */
  public async getResponsibleDomain(qname: string): Promise<Domain> {
    return this.client.get<Domain>(`/domains/?owns_qname=${qname}`);
  }

  /**
   * Exports all domain data in a plain-text zonefile format.
   * [3]
   * @param name The name of the domain.
   * @returns The domain data as a plain-text string in zonefile format.
   */
  public async exportZonefile(name: string): Promise<string> {
    // Axios handles text responses correctly, but we need to specify responseType
    const response = await this.client.get<string>(
      `/domains/${name}/zonefile/`,
      { responseType: "text" }
    );
    return response;
  }

  /**
   * Deletes a specific domain.
   * Requires `perm_delete_domain` permission on the token.
   * [3]
   * @param name The name of the domain to delete.
   * @returns A Promise that resolves on successful deletion (204 No Content).
   */
  public async deleteDomain(name: string): Promise<void> {
    await this.client.delete<void>(`/domains/${name}/`);
  }
}
