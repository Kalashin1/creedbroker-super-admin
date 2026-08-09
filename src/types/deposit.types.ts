export type CryptoNetwork = "BTC" | "ETH" | "BNB" | "SOL";
export type DepositStatus = "pending" | "confirmed" | "rejected";

export interface NetworkConfig {
  id: CryptoNetwork;
  name: string;
  fullName: string;
  symbol: string;
  icon: React.ReactNode;
  minDeposit: number;
  confirmations: number;
  accentFrom: string;
  accentTo: string;
  bgColor: string;
  explorerUrl: string;
}

export interface DepositAddress {
  network: CryptoNetwork;
  address: string;
  memo?: string; // For networks like XRP/BNB memo-based deposits
  createdAt: number;
}

export interface Deposit {
  id: string;
  userId: string;
  network: CryptoNetwork;
  amount: number;
  usdValue: number;
  txHash: string;
  status: DepositStatus;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: number;
  confirmedAt?: number;
}


// src/types/deposit.types.ts

// export type DepositStatus = 'pending' | 'confirmed' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  currency: string; // e.g., 'USD', 'BTC', 'ETH'
  network?: string; // e.g., 'Bitcoin', 'Ethereum', 'Bank Transfer'
  txHash?: string;
  status: DepositStatus;
  createdAt: number;
  confirmedAt?: number;
  rejectionReason?: string;
}

export type DepositFilterStatus = DepositStatus | 'all';

export interface DepositFilters {
  search: string;
  status: DepositFilterStatus;
  network: string | 'all';
}