// src/types/transaction.types.ts
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "investment"
  | "profit";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "failed"
  | "cancelled"
  | "processing";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  usdValue: number;
  status: TransactionStatus;
  date: Date;
  description: string;
  txHash?: string;
  fee?: number;
}

export interface TransactionFilters {
  type: "all" | TransactionType;
  status: "all" | TransactionStatus;
  search: string;
  sortBy: "date" | "amount" | "status";
  sortOrder: "asc" | "desc";
}

export type WithdrawalMethod = "wire" | "ach" | "sepa";
export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";
export type Currency = "USD" | "EUR" | "GBP";

export interface BankDetails {
  holderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string; // SWIFT/BIC for international
  method: WithdrawalMethod;
}

export interface WithdrawalRequest extends BankDetails {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  fee: number;
  netAmount: number;
  status: WithdrawalStatus;
  notes?: string;
  createdAt: number; // timestamp
  processedAt?: number;

  userName?: string;
  userEmail?: string;
  rejectionReason?: string;
}

export interface WithdrawalFormState extends BankDetails {
  amount: string;
  currency: Currency;
  notes: string;
}

export interface FormErrors {
  amount?: string;
  holderName?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
}

export interface WithdrawalFormState {
  amount: string;
  currency: Currency;
  method: WithdrawalMethod;
  holderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  notes: string;
}

// src/types/transaction.types.ts
// ... keep existing types ...

// export type WithdrawalFilterStatus = WithdrawalStatus | 'all';

export interface WithdrawalFilters {
  search: string;
  status: WithdrawalFilterStatus;
  method: WithdrawalMethod | 'all';
}

export interface BankDetails {
  holderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string; // SWIFT/BIC for international
  method: WithdrawalMethod;
}

export interface WithdrawalRequest extends BankDetails {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  fee: number;
  netAmount: number;
  status: WithdrawalStatus;
  notes?: string;
  createdAt: number; // timestamp
  processedAt?: number;
  
  // 🆕 Optional admin-specific fields (populated during creation or processing)
  userName?: string;
  userEmail?: string;
  rejectionReason?: string;
}

export type WithdrawalFilterStatus = WithdrawalStatus | 'all';

export interface WithdrawalFilters {
  search: string;
  status: WithdrawalFilterStatus;
  method: WithdrawalMethod | 'all';
}

export interface TransactionRecord {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  usdValue: number;
  description: string;
  status: TransactionStatus;
  createdAt: Date; // or number, adjust based on your DB
  txHash?: string;
  fee?: number;
  metadata?: Record<string, any>;
}

export interface AdminTransactionFilters {
  search: string;
  type: TransactionType | 'all';
  status: TransactionStatus | 'all';
}
