// src/types/admin.types.ts
// import { Timestamp } from 'firebase/firestore';

export type AccountStatus = 'active' | 'restricted' | 'blocked' | 'deleted';
export type UserRole = 'admin' | 'client';
export type KYCStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface AdminUser {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  role: UserRole;
  emailVerified: boolean;
  kycStatus: KYCStatus;
  accountStatus: AccountStatus;
  balance: {
    usd: number;
    btc: number;
    eth: number;
    bnb: number;
    sol: number;
  };
  stats: {
    totalInvestments: number;
    totalInvested: number;
    totalProfit: number;
    totalWithdrawals: number;
  };
  createdAt: Date;
  lastLoginAt?: Date;
}

export type UserAction =
  | 'view'
  | 'verify_kyc'
  | 'reject_kyc'
  | 'restrict'
  | 'unrestrict'
  | 'block'
  | 'unblock'
  | 'send_notification'
  | 'delete';

export interface UserFilters {
  search: string;
  role: UserRole | 'all';
  status: AccountStatus | 'all';
  kyc: KYCStatus | 'all';
}