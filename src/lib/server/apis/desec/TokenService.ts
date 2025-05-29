import type { DeSECClient } from "./DeSECClient";
import type {
  Token,
  CreateTokenPayload,
  ModifyTokenPayload,
  ReplaceTokenPayload,
  TokenPolicy,
  CreateTokenPolicyPayload,
  ModifyTokenPolicyPayload,
  ReplaceTokenPolicyPayload,
} from "./types";

/**
 * Service for managing deSEC authentication tokens and their policies.
 */
export class TokenService {
  private client: DeSECClient;

  constructor(client: DeSECClient) {
    this.client = client;
  }

  /**
   * Creates a new authentication token.
   * The `token` secret is returned only upon creation.
   * [2]
   * @param payload The token creation details.
   * @returns The created Token object, including the secret.
   */
  public async createToken(payload: CreateTokenPayload): Promise<Token> {
    return this.client.post<Token>("/auth/tokens/", payload);
  }

  /**
   * Retrieves a list of all authentication tokens associated with the user's account.
   * [2]
   * @returns An array of Token objects (without the secret).
   */
  public async listTokens(): Promise<Token> {
    return this.client.get<Token>("/auth/tokens/");
  }

  /**
   * Retrieves detailed information about a specific token by its ID.
   * Note: The token's secret value is NOT returned.
   * [2]
   * @param id The ID of the token.
   * @returns The Token object.
   */
  public async getToken(id: string): Promise<Token> {
    return this.client.get<Token>(`/auth/tokens/${id}/`);
  }

  /**
   * Modifies an existing token using a PATCH request.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * [2]
   * @param id The ID of the token to modify.
   * @param updates The fields to update.
   * @returns The updated Token object.
   */
  public async modifyToken(
    id: string,
    updates: ModifyTokenPayload
  ): Promise<Token> {
    return this.client.patch<Token>(`/auth/tokens/${id}/`, updates);
  }

  /**
   * Replaces an existing token's configuration using a PUT request.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * All fields must be provided.
   * [2]
   * @param id The ID of the token to replace.
   * @param tokenData The full token object with desired configuration.
   * @returns The updated Token object.
   */
  public async replaceToken(
    id: string,
    tokenData: ReplaceTokenPayload
  ): Promise<Token> {
    return this.client.put<Token>(`/auth/tokens/${id}/`, tokenData);
  }

  /**
   * Deletes a specific token by its ID.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * [2]
   * @param id The ID of the token to delete.
   * @returns A Promise that resolves on successful deletion (204 No Content).
   */
  public async deleteToken(id: string): Promise<void> {
    await this.client.delete<void>(`/auth/tokens/${id}/`);
  }

  /**
   * Lists all RRset policies associated with a given token.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * [2]
   * @param tokenId The ID of the token.
   * @returns An array of TokenPolicy objects.
   */
  public async listTokenPolicies(tokenId: string): Promise<TokenPolicy> {
    return this.client.get<TokenPolicy>(
      `/auth/tokens/${tokenId}/policies/rrsets/`
    );
  }

  /**
   * Creates a new RRset policy for a token.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * [2]
   * @param tokenId The ID of the token.
   * @param payload The policy details.
   * @returns The created TokenPolicy object.
   */
  public async createTokenPolicy(
    tokenId: string,
    payload: CreateTokenPolicyPayload
  ): Promise<TokenPolicy> {
    return this.client.post<TokenPolicy>(
      `/auth/tokens/${tokenId}/policies/rrsets/`,
      payload
    );
  }

  /**
   * Retrieves a specific token policy by its ID.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * [2]
   * @param tokenId The ID of the token.
   * @param policyId The ID of the policy.
   * @returns The TokenPolicy object.
   */
  public async getTokenPolicy(
    tokenId: string,
    policyId: string
  ): Promise<TokenPolicy> {
    return this.client.get<TokenPolicy>(
      `/auth/tokens/${tokenId}/policies/rrsets/${policyId}/`
    );
  }

  /**
   * Modifies an existing token policy using a PATCH request.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * [2]
   * @param tokenId The ID of the token.
   * @param policyId The ID of the policy to modify.
   * @param updates The fields to update.
   * @returns The updated TokenPolicy object.
   */
  public async modifyTokenPolicy(
    tokenId: string,
    policyId: string,
    updates: ModifyTokenPolicyPayload
  ): Promise<TokenPolicy> {
    return this.client.patch<TokenPolicy>(
      `/auth/tokens/${tokenId}/policies/rrsets/${policyId}/`,
      updates
    );
  }

  /**
   * Replaces an existing token policy's configuration using a PUT request.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * All fields must be provided.
   * [2]
   * @param tokenId The ID of the token.
   * @param policyId The ID of the policy to replace.
   * @param policyData The full policy object with desired configuration.
   * @returns The updated TokenPolicy object.
   */
  public async replaceTokenPolicy(
    tokenId: string,
    policyId: string,
    policyData: ReplaceTokenPolicyPayload
  ): Promise<TokenPolicy> {
    return this.client.put<TokenPolicy>(
      `/auth/tokens/${tokenId}/policies/rrsets/${policyId}/`,
      policyData
    );
  }

  /**
   * Deletes a specific token policy.
   * Requires `perm_manage_tokens` permission on the authorizing token.
   * [2]
   * @param tokenId The ID of the token.
   * @param policyId The ID of the policy to delete.
   * @returns A Promise that resolves on successful deletion (204 No Content).
   */
  public async deleteTokenPolicy(
    tokenId: string,
    policyId: string
  ): Promise<void> {
    await this.client.delete<void>(
      `/auth/tokens/${tokenId}/policies/rrsets/${policyId}/`
    );
  }
}
