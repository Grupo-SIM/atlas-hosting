// src/services/RRsetService.ts

import type { DeSECClient } from "./DeSECClient";
import type {
  RRset,
  CreateRRsetPayload,
  ModifyRRsetPayload,
  ReplaceRRsetPayload,
  BulkRRsetPayload,
} from "./types";

/**
 * Service for managing deSEC DNS Resource Record Sets (RRsets).
 */
export class RRsetService {
  private client: DeSECClient;

  constructor(client: DeSECClient) {
    this.client = client;
  }

  /**
   * Creates one or more RRsets within a domain.
   * For single RRset, pass a single object. For bulk, pass an array of objects.
   * [4]
   * @param domainName The name of the domain.
   * @param payload A single CreateRRsetPayload or an array of CreateRRsetPayloads.
   * @returns The created RRset(s).
   */
  public async createRRset(
    domainName: string,
    payload: CreateRRsetPayload
  ): Promise<RRset>;
  public async createRRset(
    domainName: string,
    payload: CreateRRsetPayload
  ): Promise<RRset>;
  public async createRRset(
    domainName: string,
    payload: CreateRRsetPayload | CreateRRsetPayload
  ): Promise<RRset | RRset> {
    return this.client.post<RRset | RRset>(
      `/domains/${domainName}/rrsets/`,
      payload
    );
  }

  /**
   * Retrieves all RRsets within a specified domain, with optional filtering and pagination.
   * [4]
   * @param domainName The name of the domain.
   * @param subname Optional: Filter by subdomain (e.g., 'www'). Use '' for zone apex.
   * @param type Optional: Filter by record type (e.g., 'A', 'MX').
   * @param cursor Optional: Pagination cursor for more than 500 items.
   * @returns An array of RRset objects.
   */
  public async listRRsets(
    domainName: string,
    subname?: string,
    type?: string,
    cursor?: string
  ): Promise<RRset> {
    const params = new URLSearchParams();
    if (subname !== undefined) {
      params.append("subname", subname);
    }
    if (type !== undefined) {
      params.append("type", type);
    }
    if (cursor !== undefined) {
      params.append("cursor", cursor);
    }

    const queryString = params.toString();
    const url = `/domains/${domainName}/rrsets/${queryString ? `?${queryString}` : ""}`;
    return this.client.get<RRset>(url);
  }

  /**
   * Retrieves a specific RRset by its domain, subname, and type.
   * Use '@' for subname to access the zone apex.
   * [4]
   * @param domainName The name of the domain.
   * @param subname The subdomain string (e.g., 'www', or '@' for zone apex).
   * @param type The RRset type (e.g., 'A', 'AAAA').
   * @returns The RRset object.
   */
  public async getRRset(
    domainName: string,
    subname: string,
    type: string
  ): Promise<RRset> {
    // Handle zone apex and special characters in subname
    const encodedSubname = subname === "@" ? "@" : encodeURIComponent(subname);
    return this.client.get<RRset>(
      `/domains/${domainName}/rrsets/${encodedSubname}/${type}/`
    );
  }

  /**
   * Modifies an existing RRset using a PATCH request.
   * Only provide the fields to be updated (`records`, `ttl`).
   * [4]
   * @param domainName The name of the domain.
   * @param subname The subdomain string (e.g., 'www', or '@' for zone apex).
   * @param type The RRset type.
   * @param updates The fields to update.
   * @returns The updated RRset object.
   */
  public async modifyRRset(
    domainName: string,
    subname: string,
    type: string,
    updates: ModifyRRsetPayload
  ): Promise<RRset> {
    const encodedSubname = subname === "@" ? "@" : encodeURIComponent(subname);
    return this.client.patch<RRset>(
      `/domains/${domainName}/rrsets/${encodedSubname}/${type}/`,
      updates
    );
  }

  /**
   * Replaces an existing RRset's configuration using a PUT request.
   * All fields (`subname`, `type`, `ttl`, `records`) must be provided.
   * [4]
   * @param domainName The name of the domain.
   * @param subname The subdomain string (e.g., 'www', or '@' for zone apex).
   * @param type The RRset type.
   * @param rrsetData The full RRset object with desired configuration.
   * @returns The updated RRset object.
   */
  public async replaceRRset(
    domainName: string,
    subname: string,
    type: string,
    rrsetData: ReplaceRRsetPayload
  ): Promise<RRset> {
    const encodedSubname = subname === "@" ? "@" : encodeURIComponent(subname);
    return this.client.put<RRset>(
      `/domains/${domainName}/rrsets/${encodedSubname}/${type}/`,
      rrsetData
    );
  }

  /**
   * Performs bulk modification (create, modify, delete) of multiple RRsets using a PATCH request.
   * This operation is atomic.
   * [4]
   * @param domainName The name of the domain.
   * @param rrsetsData An array of RRset objects to create, modify, or delete.
   *                   To delete, include an RRset with an empty `records` array.
   * @returns An array of the processed RRset objects.
   */
  public async bulkModifyRRsets(
    domainName: string,
    rrsetsData: BulkRRsetPayload
  ): Promise<RRset> {
    return this.client.patch<RRset>(
      `/domains/${domainName}/rrsets/`,
      rrsetsData
    );
  }

  /**
   * Performs bulk replacement (create, modify, delete) of multiple RRsets using a PUT request.
   * This operation is atomic.
   * [4]
   * @param domainName The name of the domain.
   * @param rrsetsData An array of RRset objects to create, modify, or delete.
   *                   To delete, include an RRset with an empty `records` array.
   * @returns An array of the processed RRset objects.
   */
  public async bulkReplaceRRsets(
    domainName: string,
    rrsetsData: BulkRRsetPayload
  ): Promise<RRset> {
    return this.client.put<RRset>(`/domains/${domainName}/rrsets/`, rrsetsData);
  }

  /**
   * Deletes a specific RRset.
   * [4]
   * @param domainName The name of the domain.
   * @param subname The subdomain string (e.g., 'www', or '@' for zone apex).
   * @param type The RRset type.
   * @returns A Promise that resolves on successful deletion (204 No Content).
   */
  public async deleteRRset(
    domainName: string,
    subname: string,
    type: string
  ): Promise<void> {
    const encodedSubname = subname === "@" ? "@" : encodeURIComponent(subname);
    await this.client.delete<void>(
      `/domains/${domainName}/rrsets/${encodedSubname}/${type}/`
    );
  }
}
