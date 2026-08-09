// src/types/user.types.ts
import { Timestamp } from "firebase/firestore";

export type UserRole = "client" | "admin";
export type KycStatus = "none" | "pending" | "verified" | "rejected";
export type VerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "rejected";

export interface UserStats {
  totalInvestments: number;
  totalInvested: number;
  totalProfit: number;
  totalWithdrawals: number;
}

export interface VerificationData {
  location: { status: VerificationStatus; date?: string };
  identity: {
    status: VerificationStatus;
    documents?: { govIdUrl?: string; proofOfAddressUrl?: string };
  };
  tax: { status: VerificationStatus; tin?: string; country?: string };
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: string;
  preferredCurrency?: string;
  photoUrl?: string;

  role: UserRole;
  emailVerified: boolean;
  profileComplete: boolean;
  kycStatus: KycStatus;

  balance: {
    usd: number;
    btc: number;
    eth?: number;
    bnb?: number; // 🆕 Added BNB balance
    sol?: number;
  };
  stats?: UserStats; // 🆕 Added stats

  btcAddress: string;
  btcMnemonicEncrypted?: string;

  ethAddress?: string;
  ethMnemonicEncrypted?: string;

  bnbAddress?: string;
  bnbMnemonicEncrypted?: string;

  solAddress?: string;
  solMnemonicEncrypted?: string;

  verification?: VerificationData;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
  accountStatus: string;

  frozenWallets?: string[]; // Add this to the user side later.
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
}

export type UpdateUserPayload = Partial<
  Omit<UserProfile, "uid" | "email" | "createdAt" | "role" | "stats">
>;

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string; // For US/Local transfers
  swiftCode?: string; // For International transfers
  currency: string;
  createdAt: Timestamp;
}

export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export interface CreditCard {
  id: string;
  cardholderName: string;
  last4: string;
  encryptedCardNumber: string;
  encryptedCvv: string;
  expiryMonth: string;
  expiryYear: string;
  brand: CardBrand;
  createdAt: Timestamp;
}