/* eslint-disable @typescript-eslint/no-namespace */
export namespace Contabo {
  export namespace Body {
    export interface CreateSecret {
      name: string;
      type: "password" | "ssh";
      value: string;
    }

    export interface CancelInstance {
      cancelDate: string;
      reason:
        | "Bad customer support"
        | "Missing features"
        | "Product not needed anymore"
        | "Other"
        | "Switch to a different Contabo product"
        | "Technical issues / Outages / Performance"
        | "Too expensive / price";
    }

    export interface CreateInstance {
      addOns?: {
        additionalIps?: Record<string, never>;
        backup?: Record<string, never>;
        privateNetworking?: Record<string, never>;
      };
      defaultUser?: "admin" | "administrator" | "root";
      displayName?: string;
      imageId: string;
      license?:
        | "PleskAdmin"
        | "PleskHost"
        | "PleskPro"
        | `cPanel${5 | 30 | 50 | 100 | 150 | 200 | 250 | 300 | 350 | 400 | 450 | 500 | 550 | 600 | 650 | 700 | 750 | 800 | 850 | 900 | 950 | 1000}`;
      period: 1 | 12 | 24;
      productId: string;
      region:
        | "AUS"
        | "EU"
        | "IND"
        | "JPN"
        | "SIN"
        | "UK"
        | "US-central"
        | "US-east"
        | "US-west";
      rootPassword?: number;
    }
  }

  export interface CancelInstanceResponseData {
    cancelDate: string;
    customerId: string;
    instanceId: number;
    tenantId: string;
  }

  export interface SecretResponse {
    createdAt: string;
    customerId: string;
    name: string;
    secretId: number;
    tenantId: string;
    type: "password" | "ssh";
    updatedAt: string | null;
    value: string;
  }
  type SecretResponseWithoutValue = Omit<SecretResponse, "value">;

  export namespace Response {
    interface LinkSelf {
      self: string;
    }
    interface Links extends LinkSelf {
      first?: string;
      last?: string;
      next?: string;
      previous?: string;
    }

    interface Pagination {
      _pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
    }

    export interface AuthToken {
      "not-before-policy": number;
      access_token: string;
      expires_in: number;
      refresh_expires_in: number;
      refresh_token: string;
      scope: string;
      session_state: string;
      token_type: string;
    }

    export interface CancelInstance extends LinkSelf {
      data: CancelInstanceResponseData[];
    }

    export interface CreateInstance extends LinkSelf {
      data: Array<{
        createdDate: string;
        customerId: string;
        imageId: string;
        instanceId: number;
        productId: string;
        region: string;
        status: string;
        tenantId: string;
      }>;
    }

    export interface CreateSecret extends LinkSelf, Pagination {
      data: SecretResponseWithoutValue[];
    }

    export interface GetSecret extends LinkSelf {
      data: SecretResponseWithoutValue[];
    }

    export interface ListSecrets extends Links {
      data: SecretResponseWithoutValue[];
    }
  }
}
