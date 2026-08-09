// src/services/withdrawal.service.ts
// ... keep existing createWithdrawalRequest and fetchUserWithdrawals ...

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  WithdrawalRequest,
  WithdrawalStatus,
} from "../types/transaction.types";

export const createWithdrawalRequest = async (
  userId: string,
  data: Omit<WithdrawalRequest, "id" | "userId" | "status" | "createdAt">,
): Promise<string> => {
  let userName = "";
  let userEmail = "";

  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      userName = userDoc.data().fullName || "";
      userEmail = userDoc.data().email || "";
    }
  } catch (err) {
    console.warn("Could not fetch user info for withdrawal:", err);
  }

  const docRef = await addDoc(collection(db, "withdrawals"), {
    ...data,
    userId,
    userName,
    userEmail,
    status: "pending",
    createdAt: Date.now(), // Matches your `number` type
  });

  return docRef.id;
};

export const updateWithdrawalStatus = async (
  withdrawalId: string,
  status: WithdrawalStatus,
  metadata: { rejectionReason?: string } = {},
): Promise<void> => {
  const withdrawalRef = doc(db, "withdrawals", withdrawalId);

  await updateDoc(withdrawalRef, {
    status,
    processedAt: Date.now(),
    ...(metadata.rejectionReason && {
      rejectionReason: metadata.rejectionReason,
    }),
  });
};

export const fetchUserWithdrawals = async (
  userId: string,
): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      collection(db, "withdrawals"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        fee: data.fee,
        netAmount: data.netAmount,
        holderName: data.holderName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
        method: data.method,
        notes: data.notes,
        status: data.status,
        createdAt: data.createdAt || Date.now(),
        processedAt: data.processedAt,
        userName: data.userName,
        userEmail: data.userEmail,
        rejectionReason: data.rejectionReason,
      } as WithdrawalRequest;
    });
  } catch (error) {
    console.error("Error fetching user withdrawals:", error);
    return [];
  }
};

/**
 * Fetches ALL withdrawals across all users (admin-only).
 */
export const fetchAllWithdrawals = async (): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      collection(db, "withdrawals"),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        fee: data.fee,
        netAmount: data.netAmount,
        holderName: data.holderName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
        method: data.method,
        notes: data.notes,
        status: data.status as WithdrawalStatus,
        createdAt: data.createdAt?.toDate() || new Date(),
        // 🆕 Admin-specific fields
        userName: data.userName || "",
        userEmail: data.userEmail || "",
        processedAt: data.processedAt?.toDate(),
        processedBy: data.processedBy,
        rejectionReason: data.rejectionReason,
      };
    });
  } catch (error) {
    console.error("Error fetching all withdrawals:", error);
    return [];
  }
};

/**
 * Updates withdrawal status (approve/reject).
 */
// export const updateWithdrawalStatus = async (
//   withdrawalId: string,
//   status: WithdrawalStatus,
//   adminUserId: string,
//   metadata: { rejectionReason?: string } = {},
// ): Promise<void> => {
//   const withdrawalRef = doc(db, "withdrawals", withdrawalId);

//   await updateDoc(withdrawalRef, {
//     status,
//     processedAt: serverTimestamp(),
//     processedBy: adminUserId,
//     updatedAt: serverTimestamp(),
//     ...(metadata.rejectionReason && {
//       rejectionReason: metadata.rejectionReason,
//     }),
//   });
// };

/**
 * Fetches a single withdrawal by ID (for detail view).
 */
export const fetchWithdrawalById = async (
  withdrawalId: string,
): Promise<WithdrawalRequest | null> => {
  try {
    const docRef = doc(db, "withdrawals", withdrawalId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      fee: data.fee,
      netAmount: data.netAmount,
      holderName: data.holderName,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      routingNumber: data.routingNumber,
      method: data.method,
      notes: data.notes,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      userName: data.userName || "",
      userEmail: data.userEmail || "",
      processedAt: data.processedAt?.toDate(),
      processedBy: data.processedBy,
      rejectionReason: data.rejectionReason,
    } as WithdrawalRequest;
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    return null;
  }
};
