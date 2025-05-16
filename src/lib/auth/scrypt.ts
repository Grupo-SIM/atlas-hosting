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
    SCRYPT_PARAMS,
  );
  return `${bytesToHex(salt)}:${bytesToHex(derivedKey)}`;
}

export async function verify(
  hashedPasswordWithSalt: string,
  passwordPlain: string,
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
    SCRYPT_PARAMS,
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