// src/services/adminWallet.service.ts
import {
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  generateBitcoinWallet,
  generateEthereumWallet,
  generateBnbWallet,
  generateSolanaWallet,
} from "./wallet.service";
import { encryptMnemonic } from "../utils/encryption";

/**
 * Generates a new wallet for a user and saves the encrypted mnemonic.
 */
export const adminGenerateWallet = async (
  userId: string,
  network: "btc" | "eth" | "bnb" | "sol",
) => {
  let newWallet: { address: string; mnemonic: string } | null = null;

  if (network === "btc") newWallet = generateBitcoinWallet();
  else if (network === "eth") newWallet = generateEthereumWallet();
  else if (network === "bnb") newWallet = generateBnbWallet();
  else if (network === "sol") newWallet = generateSolanaWallet();

  if (!newWallet) throw new Error("Failed to generate wallet");

  const updatePayload: any = {};
  if (network === "btc") {
    updatePayload.btcAddress = newWallet.address;
    updatePayload.btcMnemonicEncrypted = encryptMnemonic(newWallet.mnemonic);
  } else if (network === "eth") {
    updatePayload.ethAddress = newWallet.address;
    updatePayload.ethMnemonicEncrypted = encryptMnemonic(newWallet.mnemonic);
  } else if (network === "bnb") {
    updatePayload.bnbAddress = newWallet.address;
    updatePayload.bnbMnemonicEncrypted = encryptMnemonic(newWallet.mnemonic);
  } else if (network === "sol") {
    updatePayload.solAddress = newWallet.address;
    updatePayload.solMnemonicEncrypted = encryptMnemonic(newWallet.mnemonic);
  }

  await updateDoc(doc(db, "users", userId), {
    ...updatePayload,
    updatedAt: serverTimestamp(),
  });

  return newWallet.address;
};

/**
 * Freezes or unfreezes a specific wallet network for a user.
 */
export const toggleWalletFreeze = async (
  userId: string,
  network: string,
  freeze: boolean,
) => {
  const userRef = doc(db, "users", userId);
  if (freeze) {
    await updateDoc(userRef, {
      frozenWallets: arrayUnion(network),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      frozenWallets: arrayRemove(network),
      updatedAt: serverTimestamp(),
    });
  }
};
