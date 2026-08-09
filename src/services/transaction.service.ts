// src/services/transaction.service.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  TransactionRecord,
  TransactionType,
  TransactionStatus,
} from "../types/transaction.types";

/**
 * Maps a deposit document to a unified TransactionRecord.
 */
const mapDepositToTransaction = (doc: any): TransactionRecord => {
  const data = doc.data();

  let status: TransactionStatus = "processing";
  if (data.status === "confirmed") status = "completed";
  else if (data.status === "rejected") status = "failed";
  else if (data.status === "pending") status = "pending";

  return {
    id: doc.id,
    userId: data.userId,
    userName: data.userName || "Unknown",
    userEmail: data.userEmail || "Unknown",
    type: "deposit" as TransactionType,
    amount: data.amount,
    currency: data.currency,
    usdValue: data.amount, // Assuming 1:1 for fiat, adjust if usdValue is stored separately
    description: `Deposit of ${data.amount} ${data.currency} via ${data.network || "Network"}`,
    status,
    createdAt: new Date(data.createdAt),
    txHash: data.txHash,
    fee: 0,
  };
};

/**
 * Maps a withdrawal document to a unified TransactionRecord.
 */
const mapWithdrawalToTransaction = (doc: any): TransactionRecord => {
  const data = doc.data();

  let status: TransactionStatus = "processing";
  if (data.status === "approved") status = "completed";
  else if (data.status === "rejected" || data.status === "cancelled")
    status = "failed";
  else if (data.status === "pending") status = "pending";

  return {
    id: doc.id,
    userId: data.userId,
    userName: data.userName || "Unknown",
    userEmail: data.userEmail || "Unknown",
    type: "withdrawal" as TransactionType,
    amount: data.amount,
    currency: data.currency,
    usdValue: data.netAmount || data.amount,
    description: `Withdrawal of ${data.amount} ${data.currency} to ${data.bankName || data.method}`,
    status,
    createdAt: new Date(data.createdAt),
    fee: data.fee || 0,
  };
};

/**
 * Fetches the latest transactions for a specific user by merging
 * their deposits and withdrawals from their respective collections.
 */
export const fetchUserTransactions = async (
  userId: string,
  limitCount: number = 100,
): Promise<TransactionRecord[]> => {
  try {
    // 1. Fetch user deposits
    const depositsQuery = query(
      collection(db, "deposits"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const depositsSnapshot = await getDocs(depositsQuery);

    // 2. Fetch user withdrawals
    const withdrawalsQuery = query(
      collection(db, "withdrawals"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const withdrawalsSnapshot = await getDocs(withdrawalsQuery);

    // 3. Map to unified format
    const deposits = depositsSnapshot.docs.map(mapDepositToTransaction);
    const withdrawals = withdrawalsSnapshot.docs.map(
      mapWithdrawalToTransaction,
    );

    // 4. Merge and sort by date descending
    const allTransactions = [...deposits, ...withdrawals].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return allTransactions.slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return [];
  }
};

/**
 * Fetches the latest platform-wide transactions by merging
 * the global deposits and withdrawals collections.
 */
export const fetchAllTransactions = async (
  limitCount: number = 500,
): Promise<TransactionRecord[]> => {
  try {
    // Fetch limitCount from both collections to ensure we don't miss recent items
    const depositsQuery = query(
      collection(db, "deposits"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );

    const withdrawalsQuery = query(
      collection(db, "withdrawals"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );

    // Run queries in parallel for performance
    const [depositsSnap, withdrawalsSnap] = await Promise.all([
      getDocs(depositsQuery),
      getDocs(withdrawalsQuery),
    ]);

    const deposits = depositsSnap.docs.map(mapDepositToTransaction);
    const withdrawals = withdrawalsSnap.docs.map(mapWithdrawalToTransaction);

    // Merge and sort by date descending
    const allTransactions = [...deposits, ...withdrawals].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return allTransactions.slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════
// NOTE: updateTransactionStatus has been intentionally removed.
// As requested, all actions should be carried out directly on
// the source collections. Use the dedicated functions instead:
// - For deposits: import { updateDepositStatus } from '@/services/deposit.service'
// - For withdrawals: import { updateWithdrawalStatus } from '@/services/withdrawal.service'
// ═══════════════════════════════════════════════════════════
