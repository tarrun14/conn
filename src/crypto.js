// ============================================
// AES-GCM-256 Encryption Utility
// Uses the FREE native Web Crypto API (crypto.subtle)
// Zero third-party packages required
// ============================================

const PASSPHRASE = process.env.REACT_APP_ENCRYPTION_KEY || "superconnect-fallback-key";

// Fixed salt for PBKDF2 key derivation (consistent across all clients)
const SALT = new TextEncoder().encode("superconnect-encryption-salt-v1");

// Cache the derived CryptoKey in memory so we only derive once per session
let cachedKey = null;

/**
 * Derives an AES-GCM-256 CryptoKey from the passphrase using PBKDF2.
 * The key is cached after first derivation for performance.
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey() {
  if (cachedKey) return cachedKey;

  // Import the passphrase as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(PASSPHRASE),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive a 256-bit AES-GCM key using PBKDF2
  cachedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return cachedKey;
}

/**
 * Encrypts a plaintext string using AES-GCM-256.
 * Generates a fresh random 12-byte IV for each message.
 *
 * @param {string} plaintext - The message to encrypt
 * @returns {Promise<{ encryptedContent: string, iv: string }>}
 *          Both values are Base64-encoded strings safe to store in Supabase TEXT columns.
 */
export async function encryptMessage(plaintext) {
  const key = await deriveKey();

  // Generate a random 12-byte IV (recommended size for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the plaintext
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Convert to Base64 strings for storage in Supabase TEXT columns
  const encryptedContent = bufferToBase64(cipherBuffer);
  const ivBase64 = bufferToBase64(iv.buffer);

  return { encryptedContent, iv: ivBase64 };
}

/**
 * Decrypts an AES-GCM-256 encrypted message back to plaintext.
 *
 * @param {string} encryptedBase64 - Base64-encoded ciphertext
 * @param {string} ivBase64 - Base64-encoded initialization vector
 * @returns {Promise<string>} The decrypted plaintext string
 */
export async function decryptMessage(encryptedBase64, ivBase64) {
  const key = await deriveKey();

  const cipherBuffer = base64ToBuffer(encryptedBase64);
  const iv = base64ToBuffer(ivBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBuffer
  );

  return new TextDecoder().decode(decryptedBuffer);
}

// ── Helper: ArrayBuffer ↔ Base64 ──

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
