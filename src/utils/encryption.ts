// src/utils/encryption.ts
import CryptoJS from "crypto-js";

// Use an environment variable for the key. If not set, it uses a fallback.
// Add VITE_ENCRYPTION_SECRET to your .env file for production!
const SECRET_KEY =
  import.meta.env.VITE_ENCRYPTION_SECRET ||
  "creed-market-super-secret-key-2026-change-me";

/**
 * Encrypts a mnemonic phrase using AES.
 */
export const encryptMnemonic = (mnemonic: string): string => {
  return CryptoJS.AES.encrypt(mnemonic, SECRET_KEY).toString();
};

/**
 * Decrypts an AES encrypted mnemonic phrase.
 */
export const decryptMnemonic = (encryptedMnemonic: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
