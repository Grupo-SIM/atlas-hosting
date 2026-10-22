import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 16; // Currently not used in this GCM, but good for structure
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;

const getEncryptionKey = (): Buffer => {
  const keyHex = process.env.EMAIL_CREDENTIALS_ENCRYPTION_KEY;
  if (keyHex?.length !== 64) {
    // Expecting a 64-char hex string (32 bytes)
    console.error(
      "CRITICAL: EMAIL_CREDENTIALS_ENCRYPTION_KEY is not set or is not a 64-character hex string. Encryption will fail."
    );
    throw new Error("EMAIL_CREDENTIALS_ENCRYPTION_KEY is missing or invalid.");
  }
  return Buffer.from(keyHex, "hex");
};

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH); // For potential future use with key derivation
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  // Store iv:salt:encrypted_data:auth_tag
  return `${iv.toString("hex")}:${salt.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(":");
  if (parts.length !== 4) {
    console.error("Invalid encrypted text format for decryption.");
    throw new Error("Invalid encrypted text format. Expected iv:salt:data:tag");
  }
  const iv = Buffer.from(parts[0], "hex");
  // const salt = Buffer.from(parts[1], 'hex'); // Salt not used in this GCM decipher, but part of stored format
  const encryptedData = parts[2];
  const tag = Buffer.from(parts[3], "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
