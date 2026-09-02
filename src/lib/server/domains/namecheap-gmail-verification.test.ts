import { describe, expect, test } from "bun:test";
import { verificationUrlFromNamecheapEmail } from "./namecheap-gmail-verification";

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
});
