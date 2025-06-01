import axios from "axios";
import { db } from "@/lib/db";
import { pgZohoOAuthTokens, pgZohoGlobalConfig } from "@/lib/db/schema";
import { and, eq, desc, isNull } from "drizzle-orm";

export interface ZohoOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number; // Unix timestamp
}

export interface ZohoSelfClientToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ZohoOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  accountsServerUrl: string;
}

export class ZohoOAuthManager {
  private config: ZohoOAuthConfig;
  private tokens: ZohoOAuthTokens | null = null;
  private userId: string | null = null;

  constructor(config?: Partial<ZohoOAuthConfig>, userId?: string | null) {
    this.userId = userId || null;
    this.config = {
      // Get sensitive credentials from environment variables
      clientId: process.env.ZOHO_CLIENT_ID!,
      clientSecret: process.env.ZOHO_CLIENT_SECRET!,
      redirectUri:
        process.env.ZOHO_REDIRECT_URI ||
        "http://localhost:3000/api/auth/zoho/callback",
      scope: [
        "ZohoMail.organization.ALL",
        "ZohoMail.accounts.ALL",
        "ZohoMail.partner.organization.ALL",
      ],
      accountsServerUrl: "https://accounts.zoho.com",
      ...config,
    };
  }

  /**
   * Generate the authorization URL for the OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      scope: this.config.scope.join(","),
      redirect_uri: this.config.redirectUri,
      access_type: "offline", // Required to get refresh token
    });

    if (state) {
      params.append("state", state);
    }

    return `${this.config.accountsServerUrl}/oauth/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code: string): Promise<ZohoOAuthTokens> {
    try {
      const response = await axios.post(
        `${this.config.accountsServerUrl}/oauth/v2/token`,
        {
          grant_type: "authorization_code",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code: code,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const tokens: ZohoOAuthTokens = {
        ...response.data,
        expires_at: Date.now() + response.data.expires_in * 1000,
      };

      await this.saveTokens(tokens);
      this.tokens = tokens;

      return tokens;
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      throw new Error("Failed to exchange authorization code for tokens");
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    // Load tokens if not already loaded
    if (!this.tokens) {
      this.tokens = await this.loadTokens();
    }

    if (!this.tokens) {
      throw new Error(
        "No tokens available. Please complete OAuth authorization first."
      );
    }

    // Check if token is expired (with 5-minute buffer)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (Date.now() + bufferTime >= this.tokens.expires_at) {
      await this.refreshAccessToken();
    }

    return this.tokens.access_token;
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(
        `${this.config.accountsServerUrl}/oauth/v2/token`,
        {
          grant_type: "refresh_token",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.tokens.refresh_token,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const newTokens: ZohoOAuthTokens = {
        ...this.tokens,
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        expires_at: Date.now() + response.data.expires_in * 1000,
      };

      // Some OAuth providers return a new refresh token, others don't
      if (response.data.refresh_token) {
        newTokens.refresh_token = response.data.refresh_token;
      }

      await this.saveTokens(newTokens);
      this.tokens = newTokens;

      console.log("Access token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw new Error("Failed to refresh access token");
    }
  }

  /**
   * Save tokens to database
   */
  private async saveTokens(tokens: ZohoOAuthTokens): Promise<void> {
    try {
      // If a userId is provided, save tokens specific to that user
      if (this.userId) {
        // Check if tokens already exist for this user
        const existingTokens = await db.query.pgZohoOAuthTokens.findFirst({
          where: eq(pgZohoOAuthTokens.userId, this.userId),
        });

        if (existingTokens) {
          // Update existing tokens
          await db
            .update(pgZohoOAuthTokens)
            .set({
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresIn: tokens.expires_in,
              expiresAt: new Date(tokens.expires_at),
              updatedAt: new Date(),
            })
            .where(eq(pgZohoOAuthTokens.userId, this.userId));
        } else {
          // Insert new tokens
          await db.insert(pgZohoOAuthTokens).values({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
            expiresAt: new Date(tokens.expires_at),
          });
        }
      } else {
        // Save global tokens (no user ID)
        const existingTokens = await db.query.pgZohoOAuthTokens.findFirst({
          where: isNull(pgZohoOAuthTokens.userId),
        });

        if (existingTokens) {
          // Update existing tokens
          await db
            .update(pgZohoOAuthTokens)
            .set({
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresIn: tokens.expires_in,
              expiresAt: new Date(tokens.expires_at),
              updatedAt: new Date(),
            })
            .where(isNull(pgZohoOAuthTokens.userId));
        } else {
          // Insert new tokens
          await db.insert(pgZohoOAuthTokens).values({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
            expiresAt: new Date(tokens.expires_at),
          });
        }
      }
    } catch (error) {
      console.error("Error saving tokens:", error);
      throw new Error("Failed to save tokens to database");
    }
  }

  /**
   * Load tokens from database
   */
  private async loadTokens(): Promise<ZohoOAuthTokens | null> {
    try {
      let tokensRecord;

      if (this.userId) {
        // Try to get user-specific tokens
        tokensRecord = await db.query.pgZohoOAuthTokens.findFirst({
          where: eq(pgZohoOAuthTokens.userId, this.userId),
          orderBy: [desc(pgZohoOAuthTokens.updatedAt)],
        });
      }

      // If no user-specific tokens or no userId provided, try to get global tokens
      if (!tokensRecord) {
        tokensRecord = await db.query.pgZohoOAuthTokens.findFirst({
          where: isNull(pgZohoOAuthTokens.userId),
          orderBy: [desc(pgZohoOAuthTokens.updatedAt)],
        });
      }

      if (!tokensRecord) {
        return null;
      }

      return {
        access_token: tokensRecord.accessToken,
        refresh_token: tokensRecord.refreshToken,
        expires_in: tokensRecord.expiresIn,
        expires_at: tokensRecord.expiresAt.getTime(),
      };
    } catch (error) {
      console.error("Error loading tokens:", error);
      return null;
    }
  }

  /**
   * Check if we have valid tokens
   */
  async hasValidTokens(): Promise<boolean> {
    try {
      const tokens = await this.loadTokens();
      return tokens !== null && tokens.refresh_token !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Revoke the refresh token
   */
  async revokeTokens(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      return;
    }

    try {
      await axios.post(
        `${this.config.accountsServerUrl}/oauth/v2/token/revoke`,
        {
          token: this.tokens.refresh_token,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Clear local tokens
      this.tokens = null;

      // Remove tokens from database
      if (this.userId) {
        await db
          .delete(pgZohoOAuthTokens)
          .where(eq(pgZohoOAuthTokens.userId, this.userId));
      } else {
        await db
          .delete(pgZohoOAuthTokens)
          .where(isNull(pgZohoOAuthTokens.userId));
      }
    } catch (error) {
      console.error("Error revoking tokens:", error);
      throw new Error("Failed to revoke tokens");
    }
  }
}

// Export a singleton instance for global access
// Note: For user-specific tokens, create a new instance with the user ID
export const zohoOAuthManager = new ZohoOAuthManager();
