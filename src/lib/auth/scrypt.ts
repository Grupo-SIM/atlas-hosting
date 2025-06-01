import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

// Scrypt parameters
const SCRYPT_PARAMS = {
  N: 16384, // CPU/memory cost factor (2^14)
  r: 8, // Block size
  p: 1, // Parallelization factor
  dkLen: 32, // Derived key length in bytes
};
const SALT_LENGTH = 16; // Salt length in bytes

export async function hash(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const derivedKey = await scryptAsync(
    new TextEncoder().encode(password),
    salt,
    SCRYPT_PARAMS
  );
  return `${bytesToHex(salt)}:${bytesToHex(derivedKey)}`;
}

/**
 * Hashes a password using a provided "encodeKey" as the salt.
 * @param password The password string to hash.
 * @param encodeKey A Uint8Array to be used as the salt for scrypt.
 *                  It's crucial that this key is handled appropriately.
 *                  If it's static or not unique per password, it can weaken security
 *                  compared to a cryptographically random salt.
 * @returns A promise that resolves to a string containing the hex-encoded salt (from encodeKey)
 *          and the hex-encoded derived key, separated by a colon.
 */
export async function hashWithEncodeKey(password: string): Promise<string> {
  const passwordBytes = new TextEncoder().encode(password);
  const derivedKey = await scryptAsync(
    passwordBytes,
    process.env.ENCRYPT_KEY!, // Using the provided encodeKey as the salt
    SCRYPT_PARAMS
  );
  // The encodeKey (acting as salt) is stored with the hash for verification.
  return `${bytesToHex(hexToBytes(process.env.ENCRYPT_KEY!))}:${bytesToHex(derivedKey)}`;
}

export async function verify(
  hashedPasswordWithSalt: string,
  passwordPlain: string
): Promise<boolean> {
  const [saltHex, storedKeyHex] = hashedPasswordWithSalt.split(":");
  if (!saltHex || !storedKeyHex) {
    // Malformed hash string
    return false;
  }
  const salt = hexToBytes(saltHex);
  const storedKey = hexToBytes(storedKeyHex);

  const derivedKey = await scryptAsync(
    new TextEncoder().encode(passwordPlain),
    salt,
    SCRYPT_PARAMS
  );

  // Constant-time comparison (important for security)
  if (derivedKey.length !== storedKey.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < derivedKey.length; i++) {
    diff |= derivedKey[i] ^ storedKey[i];
  }
  return diff === 0;
}
