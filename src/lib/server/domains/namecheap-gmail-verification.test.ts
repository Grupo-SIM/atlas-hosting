import { afterEach, describe, expect, test } from "bun:test";
import {
  approvePendingNamecheapVerifications,
  GmailRefreshTokenExpiredError,
  verificationUrlFromNamecheapEmail,
} from "./namecheap-gmail-verification";

const originalFetch = globalThis.fetch;
const gmailEnvironment = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GMAIL_REFRESH_TOKEN,
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.GOOGLE_CLIENT_ID = gmailEnvironment.clientId;
  process.env.GOOGLE_CLIENT_SECRET = gmailEnvironment.clientSecret;
  process.env.GMAIL_REFRESH_TOKEN = gmailEnvironment.refreshToken;
});

const validMessage = {
  body: {
    data: Buffer.from(
      "Confirme: https://raa.namecheap.com/ConfirmProfile.aspx?VerificationKey=token"
    ).toString("base64url"),
  },
  headers: [
    { name: "From", value: "Namecheap <verification@namecheap.com>" },
    {
      name: "Subject",
      value: "Action required: Verify your contact information for your domain(s)",
    },
  ],
  id: "message-1",
};

describe("Namecheap Gmail verification", () => {
  test("accepts a Namecheap confirmation URL", () => {
    expect(verificationUrlFromNamecheapEmail(validMessage)).toBe(
      "https://raa.namecheap.com/ConfirmProfile.aspx?VerificationKey=token"
    );
  });

  test("rejects a confirmation URL from another host", () => {
    expect(
      verificationUrlFromNamecheapEmail({
        ...validMessage,
        body: {
          data: Buffer.from(
            "https://attacker.example/ConfirmProfile.aspx?VerificationKey=token"
          ).toString("base64url"),
        },
      })
    ).toBeNull();
  });

  test("identifies an expired or revoked refresh token", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_CLIENT_SECRET = "client-secret";
    process.env.GMAIL_REFRESH_TOKEN = "refresh-token";
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 });

    await expect(approvePendingNamecheapVerifications()).rejects.toBeInstanceOf(
      GmailRefreshTokenExpiredError
    );
  });
});
