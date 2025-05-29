import axios, { AxiosError, isAxiosError, type AxiosInstance } from "axios";
import { ZohoOAuthManager, zohoOAuthManager } from "./oauth";
import { isBefore } from "date-fns";

export interface ZohoEmailAccount {
  emailAddress: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  quota?: number; // in MB
  isAdmin?: boolean;
}

export interface ZohoEmailAccountResponse {
  emailAddress: string;
  displayName?: string;
  quota: number;
  used: number;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

export interface ZohoDomainInfo {
  domainName: string;
  verified: boolean;
  mxRecords: string[];
  spfRecord?: string;
  dkimRecord?: string;
}

export interface ZohoChildOrgRequest {
  domainName: string;
  orgName: string;
  emailId: string;
  firstName: string;
  lastName: string;
  password: string;
  planName?: string; // basicTrial, professionalTrial, mailPremiumTrial, or free
}

export interface ZohoChildOrgResponse {
  zoid: string; // Organization ID
  domainName: string;
  orgName: string;
  status: string;
}

export interface ZohoSelfClientToken {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
  api_domain: string;
}

export class ZohoMailApi {
  private apiUrl: string;
  private axiosInstance: AxiosInstance;
  private oauthManager: ZohoOAuthManager;
  private selfClientToken: ZohoSelfClientToken | undefined;
  private selfTokenExpiresAt: number | undefined;

  constructor(userId?: string | null) {
    this.apiUrl = process.env.ZOHO_API_URL || "https://mail.zoho.com/api";

    // Create an OAuth manager instance - use user-specific if userId is provided
    this.oauthManager = userId
      ? new ZohoOAuthManager(undefined, userId)
      : zohoOAuthManager;

    this.axiosInstance = axios.create({
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Add request interceptor to include access token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          if (
            this.selfClientToken &&
            this.selfTokenExpiresAt &&
            isBefore(Date.now(), this.selfTokenExpiresAt)
          ) {
            config.baseURL = this.apiUrl;
            config.headers["Authorization"] =
              `Zoho-oauthtoken ${this.selfClientToken.access_token}`;
            return config;
          }

          const params = {
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            grant_type: "client_credentials",
            scope: [
              "ZohoMail.organization.ALL",
              "ZohoMail.accounts.ALL",
              "ZohoMail.partner.organization.ALL",
            ].join(","),
          };

          const { data } = await axios.post<ZohoSelfClientToken>(
            "https://accounts.zoho.com/oauth/v2/token?",
            {
              client_id: process.env.ZOHO_CLIENT_ID,
              client_secret: process.env.ZOHO_CLIENT_SECRET,
              grant_type: "client_credentials",
              scope: [
                "ZohoMail.organization.ALL",
                "ZohoMail.accounts.ALL",
                "ZohoMail.partner.organization.ALL",
              ].join(","),
            },
            {
              params,
              headers: {
                Accept: "application/json",
                ContentType: "application/json",
              },
            }
          );

          this.selfClientToken = data;
          this.selfTokenExpiresAt = Date.now() + data.expires_in * 1000;

          config.baseURL = this.apiUrl;
          config.headers["Authorization"] =
            `Zoho-oauthtoken ${data.access_token}`;
          return config;
        } catch (error) {
          console.error(
            "Failed to get access token:",
            (error as AxiosError).response?.data
          );
          throw new Error(
            "OAuth authentication required. Please complete setup first."
          );
        }
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for better error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.error("Unauthorized access - OAuth tokens may be invalid");
          throw new Error(
            "Authentication failed. Please re-authorize your Zoho account."
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if the API is properly configured with OAuth
   */
  async isConfigured(): Promise<boolean> {
    try {
      return await this.oauthManager.hasValidTokens();
    } catch {
      return false;
    }
  }

  /**
   * Get the OAuth authorization URL for initial setup
   */
  getAuthorizationUrl(): string {
    return this.oauthManager.getAuthorizationUrl("setup");
  }

  /**
   * Create a new child organization for a user
   */
  async createChildOrganization(
    request: ZohoChildOrgRequest
  ): Promise<ZohoChildOrgResponse> {
    try {
      const response = await this.axiosInstance.post("/organization", {
        domainName: request.domainName,
        orgName: request.orgName,
        emailId: request.emailId,
        firstName: request.firstName,
        lastName: request.lastName,
        password: request.password,
        planName: request.planName || "free",
      });

      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(
          "Error creating child organization:",
          error.response?.data ?? "No data"
        );
      }
      throw error;
    }
  }

  // Organization API
  async getOrganizationInfo(orgId: string) {
    try {
      const response = await this.axiosInstance.get(`/organization/${orgId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting organization info:", error);
      throw error;
    }
  }

  // Domains API
  async getDomains(orgId: string): Promise<ZohoDomainInfo[]> {
    try {
      const response = await this.axiosInstance.get(
        `/organization/${orgId}/domains`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error getting domains:", error);
      throw error;
    }
  }

  async getDomainInfo(
    orgId: string,
    domainName: string
  ): Promise<ZohoDomainInfo> {
    try {
      const response = await this.axiosInstance.get(
        `/organization/${orgId}/domains/${domainName}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting domain info:", error);
      throw error;
    }
  }

  async verifyDomain(orgId: string, domainName: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post(
        `/organization/${orgId}/domains/${domainName}/verify`
      );
      return response.data.verified === true;
    } catch (error) {
      console.error("Error verifying domain:", error);
      throw error;
    }
  }

  // Users API
  async createEmailAccount(
    orgId: string,
    domainName: string,
    accountData: ZohoEmailAccount
  ): Promise<ZohoEmailAccountResponse> {
    try {
      const response = await this.axiosInstance.post(
        `/organization/${orgId}/domains/${domainName}/users`,
        {
          emailAddress: accountData.emailAddress,
          password: accountData.password,
          firstName:
            accountData.firstName || accountData.emailAddress.split("@")[0],
          lastName: accountData.lastName || "",
          displayName: accountData.displayName || accountData.emailAddress,
          quota: accountData.quota || 1024, // 1GB default
          isAdmin: accountData.isAdmin || false,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating email account:", error);
      throw error;
    }
  }

  async getEmailAccounts(
    orgId: string,
    domainName?: string
  ): Promise<ZohoEmailAccountResponse[]> {
    try {
      const url = domainName
        ? `/organization/${orgId}/domains/${domainName}/users`
        : `/organization/${orgId}/users`;

      const response = await this.axiosInstance.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error("Error getting email accounts:", error);
      throw error;
    }
  }

  async getEmailAccount(
    orgId: string,
    emailAddress: string
  ): Promise<ZohoEmailAccountResponse> {
    try {
      const response = await this.axiosInstance.get(
        `/organization/${orgId}/users/${emailAddress}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting email account:", error);
      throw error;
    }
  }

  async updateEmailAccount(
    orgId: string,
    emailAddress: string,
    updateData: Partial<ZohoEmailAccount>
  ): Promise<ZohoEmailAccountResponse> {
    try {
      const response = await this.axiosInstance.put(
        `/organization/${orgId}/users/${emailAddress}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating email account:", error);
      throw error;
    }
  }

  async deleteEmailAccount(
    orgId: string,
    emailAddress: string
  ): Promise<boolean> {
    try {
      await this.axiosInstance.delete(
        `/organization/${orgId}/users/${emailAddress}`
      );
      return true;
    } catch (error) {
      console.error("Error deleting email account:", error);
      throw error;
    }
  }

  async changeEmailPassword(
    orgId: string,
    emailAddress: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      await this.axiosInstance.put(
        `/organization/${orgId}/users/${emailAddress}/password`,
        {
          password: newPassword,
        }
      );
      return true;
    } catch (error) {
      console.error("Error changing email password:", error);
      throw error;
    }
  }

  // Accounts API
  async getAccountSettings(orgId: string, emailAddress: string) {
    try {
      const response = await this.axiosInstance.get(
        `/organization/${orgId}/users/${emailAddress}/settings`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting account settings:", error);
      throw error;
    }
  }

  async updateAccountSettings(
    orgId: string,
    emailAddress: string,
    settings: any
  ) {
    try {
      const response = await this.axiosInstance.put(
        `/organization/${orgId}/users/${emailAddress}/settings`,
        settings
      );
      return response.data;
    } catch (error) {
      console.error("Error updating account settings:", error);
      throw error;
    }
  }

  // Email forwarding
  async setEmailForwarding(
    orgId: string,
    emailAddress: string,
    forwardTo: string,
    enabled: boolean = true
  ) {
    try {
      const response = await this.axiosInstance.put(
        `/organization/${orgId}/users/${emailAddress}/forward`,
        {
          forwardTo,
          enabled,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error setting email forwarding:", error);
      throw error;
    }
  }

  // Vacation reply
  async setVacationReply(
    orgId: string,
    emailAddress: string,
    message: string,
    enabled: boolean = true,
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      const response = await this.axiosInstance.put(
        `/organization/${orgId}/users/${emailAddress}/vacation`,
        {
          message,
          enabled,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error setting vacation reply:", error);
      throw error;
    }
  }

  // Storage quota
  async getUserQuota(orgId: string, emailAddress: string) {
    try {
      const response = await this.axiosInstance.get(
        `/organization/${orgId}/users/${emailAddress}/quota`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting user quota:", error);
      throw error;
    }
  }

  async updateUserQuota(
    orgId: string,
    emailAddress: string,
    quotaInMB: number
  ) {
    try {
      const response = await this.axiosInstance.put(
        `/organization/${orgId}/users/${emailAddress}/quota`,
        { quota: quotaInMB }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user quota:", error);
      throw error;
    }
  }
}

// Export a singleton instance for global operations
export const zohoMailApi = new ZohoMailApi();

// Helper function to get a user-specific instance
export function getUserZohoMailApi(userId: string): ZohoMailApi {
  return new ZohoMailApi(userId);
}
