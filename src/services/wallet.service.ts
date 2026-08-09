// src/services/wallet.service.ts
import * as bip39 from "bip39";
import BIP32Factory from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js"; // 🆕 Solana
import { derivePath } from "ed25519-hd-key";

// Initialize BIP32 with the secp256k1 elliptic curve
const bip32 = BIP32Factory(ecc);

export interface GeneratedBtcWallet {
  mnemonic: string;
  address: string;
  publicKey: string;
}

export interface GeneratedEthWallet {
  mnemonic: string;
  address: string;
  privateKey: string; // Note: We will NEVER save this to the database
}

export interface GeneratedBnbWallet {
  mnemonic: string;
  address: string;
  privateKey: string;
}

export interface GeneratedSolWallet {
  // 🆕 Solana interface
  mnemonic: string;
  address: string;
  privateKey: string;
}

/**
 * Generates a new Bitcoin wallet (Native SegWit - bc1...)
 * Uses BIP84 standard derivation path.
 */
export const generateBitcoinWallet = (): GeneratedBtcWallet => {
  // 1. Generate 12-word mnemonic phrase
  const mnemonic = bip39.generateMnemonic();

  // 2. Convert mnemonic to seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // 3. Derive root key from seed
  const root = bip32.fromSeed(seed);

  // 4. Derive child key using BIP84 path for Native SegWit (bc1 addresses)
  // m/84'/0'/0'/0/0
  const path = "m/84'/0'/0'/0/0";
  const child = root.derivePath(path);

  // 5. Generate P2WPKH (Pay to Witness Public Key Hash) address
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.bitcoin,
  });

  if (!address) throw new Error("Failed to generate Bitcoin address");

  return {
    mnemonic,
    address,
    publicKey: child.publicKey.toString(),
  };
};

export const generateEthereumWallet = (): GeneratedEthWallet => {
  // ethers.js handles the BIP39 mnemonic and HD derivation automatically
  const wallet = ethers.Wallet.createRandom();

  if (!wallet.mnemonic || !wallet.mnemonic.phrase) {
    throw new Error("Failed to generate Ethereum mnemonic");
  }

  return {
    mnemonic: wallet.mnemonic.phrase,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

export const generateBnbWallet = (): GeneratedBnbWallet => {
  // BSC is EVM-compatible, so we use ethers.js just like Ethereum
  const wallet = ethers.Wallet.createRandom();

  if (!wallet.mnemonic || !wallet.mnemonic.phrase) {
    throw new Error("Failed to generate BNB mnemonic");
  }

  return {
    mnemonic: wallet.mnemonic.phrase,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

export const generateSolanaWallet = (): GeneratedSolWallet => {
  // 1. Generate mnemonic
  const mnemonic = bip39.generateMnemonic();

  // 2. Derive seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // 3. Derive private key using Solana's specific derivation path (m/44'/501'/0'/0')
  const derivationPath = "m/44'/501'/0'/0'";
  const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;

  // 4. Generate Solana Keypair
  const keypair = Keypair.fromSeed(new Uint8Array(derivedSeed));

  return {
    mnemonic,
    address: keypair.publicKey.toBase58(),
    privateKey: Buffer.from(keypair.secretKey).toString("hex"),
  };
};