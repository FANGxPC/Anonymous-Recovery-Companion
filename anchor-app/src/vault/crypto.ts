/**
 * ANCHOR — Crypto Vault
 * =======================
 * Client-side encryption layer. Data never leaves the browser.
 * Uses Argon2id for key derivation and AES-GCM for encryption.
 */

import { argon2id } from 'hash-wasm';

const IV_SIZE = 12;
const KEY_SIZE = 256; // 256-bit AES key

/**
 * Generate a random salt for key derivation or IV for encryption.
 */
export function generateRandomBytes(size: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

/**
 * Derive a strong encryption key from a passphrase using Argon2id.
 * Argon2id is the current recommended standard for password hashing.
 * 
 * @param passphrase The user's master password
 * @param salt A random 16-byte salt (stored in plain text in IndexedDB)
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  // Use hash-wasm's argon2id to generate a 32-byte raw key
  // Recommended params for interactive login: 
  // 64MB memory (65536 KB), 3 iterations, 4 parallelism
  const hash = await argon2id({
    password: passphrase,
    salt: salt,
    parallelism: 4,
    iterations: 3,
    memorySize: 65536,
    hashLength: KEY_SIZE / 8,
    outputType: 'binary',
  });

  // Import the raw key into the WebCrypto API as an AES-GCM key
  return await crypto.subtle.importKey(
    'raw',
    new Uint8Array(hash),
    { name: 'AES-GCM' },
    false, // The key material cannot be extracted
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a JavaScript object to a binary payload.
 * 
 * @param data Any JSON-serializable object
 * @param key The derived CryptoKey
 * @returns An array containing [IV, Ciphertext] packed together
 */
export async function encryptData(data: any, key: CryptoKey): Promise<Uint8Array> {
  const iv = generateRandomBytes(IV_SIZE);
  const jsonStr = JSON.stringify(data);
  const encodedText = new TextEncoder().encode(jsonStr);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    encodedText
  );

  // Pack the IV and Ciphertext together: [IV (12 bytes) | Ciphertext (N bytes)]
  const encryptedPayload = new Uint8Array(iv.length + ciphertext.byteLength);
  encryptedPayload.set(iv, 0);
  encryptedPayload.set(new Uint8Array(ciphertext), iv.length);

  return encryptedPayload;
}

/**
 * Decrypt a binary payload back to a JavaScript object.
 * 
 * @param encryptedPayload The packed [IV | Ciphertext] payload
 * @param key The derived CryptoKey
 * @returns The original object
 */
export async function decryptData<T>(encryptedPayload: Uint8Array, key: CryptoKey): Promise<T> {
  // Extract the IV and the actual ciphertext
  const iv = encryptedPayload.slice(0, IV_SIZE);
  const ciphertext = encryptedPayload.slice(IV_SIZE);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    new Uint8Array(ciphertext)
  );

  const decodedStr = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decodedStr) as T;
}
