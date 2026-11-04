// src/types/paymentMethod.types.ts
import { Timestamp } from "firebase/firestore";

export type PaymentMethodType = "crypto" | "fiat" | "third_party";

export interface PaymentMethod {
  id: string;
  name: string; // e.g., "Bitcoin", "Bank Wire", "PayPal"
  type: PaymentMethodType;
  iconName: string; // e.g., "Bitcoin", "CreditCard", "Building"
  enabled: boolean;

  // Limits & Fees
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  feeFlat: number;

  // Metadata
  processingTime: string; // e.g., "10-30 mins", "1-3 business days"
  instructions: string; // Custom instructions shown to the user
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CryptoAsset = 'btc' | 'eth' | 'bnb' | 'sol' | 'other';

// export interface PaymentMethod {
//   id: string;
//   name: string; // e.g., "Visa/Mastercard", "Bank Wire", "Bitcoin"
//   category: PaymentCategory;
//   asset?: CryptoAsset; // Required if category is 'crypto'
//   iconName: string; // e.g., "CreditCard", "Building", "Bitcoin"
  
//   enabled: boolean;
//   minAmount: number;
//   maxAmount: number;
//   feePercentage: number;
//   feeFlat: number;
  
//   processingTime: string; // e.g., "Instant", "1-3 business days"
//   instructions: string; // Custom instructions shown to the user
  
//   createdAt: Timestamp;
//   updatedAt: Timestamp;
// }


export type PaymentCategory = 'card' | 'bank' | 'crypto' | 'third_party';

export interface PaymentMethod {
  id: string;
  name: string; // e.g., "Visa/Mastercard", "Bank Wire", "Bitcoin", "PayPal"
  category: PaymentCategory;
  asset?: string; // For crypto: 'btc', 'eth', 'usdt', etc. For third_party: 'paypal', 'apple_pay', etc.
  iconName: string; // Lucide icon name or custom identifier
  
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  feeFlat: number;
  
  processingTime: string;
  instructions: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}