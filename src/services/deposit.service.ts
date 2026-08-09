// src/services/deposit.service.ts
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { DepositRequest, DepositStatus } from "../types/deposit.types";

/**
 * Fetches ALL deposits across the platform (Admin only).
 */
export const fetchAllDeposits = async (): Promise<DepositRequest[]> => {
  try {
    const q = query(collection(db, "deposits"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        network: data.network,
        txHash: data.txHash,
        status: data.status,
        createdAt: data.createdAt || Date.now(),
        confirmedAt: data.confirmedAt,
        userName: data.userName || "Unknown",
        userEmail: data.userEmail || "Unknown",
        rejectionReason: data.rejectionReason,
      } as DepositRequest;
    });
  } catch (error) {
    console.error("Error fetching all deposits:", error);
    return [];
  }
};

export const createAdminTopUpDeposit = async (
  userId: string,
  userName: string,
  userEmail: string,
  amount: number,
  currency: string,
): Promise<string> => {
  const now = Date.now();
  const docRef = await addDoc(collection(db, "deposits"), {
    userId,
    userName,
    userEmail,
    amount,
    currency: currency.toUpperCase(),
    network: "Admin Top-up", // Clearly identifies the source
    status: "confirmed", // Instantly confirmed since the admin is doing it
    createdAt: now,
    confirmedAt: now,
  });
  return docRef.id;
};

/**
 * Updates a deposit's status (e.g., confirm or reject).
 */
export const updateDepositStatus = async (
  depositId: string,
  status: DepositStatus,
  metadata: { rejectionReason?: string } = {},
): Promise<void> => {
  const depositRef = doc(db, "deposits", depositId);

  await updateDoc(depositRef, {
    status,
    confirmedAt: status === "confirmed" ? Date.now() : undefined,
    ...(metadata.rejectionReason && {
      rejectionReason: metadata.rejectionReason,
    }),
  });
};
