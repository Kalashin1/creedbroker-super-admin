// src/services/admin.service.ts
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  AdminUser,
  AccountStatus,
  KYCStatus,
  UserRole,
} from "../types/admin.types";

const USERS_COLLECTION = "users";

/**
 * Fetches all users from Firestore (admin-only operation).
 */
export const fetchAllUsers = async (): Promise<AdminUser[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        uid: data.uid || docSnap.id,
        fullName: data.fullName || "Unknown",
        email: data.email || "",
        phone: data.phone,
        country: data.country,
        role: (data.role as UserRole) || "client",
        emailVerified: data.emailVerified || false,
        kycStatus: (data.kycStatus as KYCStatus) || "none",
        accountStatus: (data.accountStatus as AccountStatus) || "active",
        balance: data.balance || { usd: 0, btc: 0, eth: 0, bnb: 0, sol: 0 },
        stats: data.stats || {
          totalInvestments: 0,
          totalInvested: 0,
          totalProfit: 0,
          totalWithdrawals: 0,
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
      };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

/**
 * Updates a user's account status.
 */
export const updateUserStatus = async (
  userId: string,
  status: AccountStatus,
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    accountStatus: status,
    statusUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Updates a user's KYC status.
 */
export const updateUserKYC = async (
  userId: string,
  kycStatus: KYCStatus,
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    kycStatus,
    kycUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Updates a user's role.
 */
export const updateUserRole = async (
  userId: string,
  role: UserRole,
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    role,
    updatedAt: serverTimestamp(),
  });
};

export const adminVerifyEmail = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    emailVerified: true,
    updatedAt: serverTimestamp(),
    adminUpdated: true,
    adminUpdatedAt: serverTimestamp(),
  });
};

export const adminMarkProfileComplete = async (
  userId: string,
  isComplete: boolean,
): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    profileComplete: isComplete,
    updatedAt: serverTimestamp(),
    adminUpdated: true,
    adminUpdatedAt: serverTimestamp(),
  });
};

/**
 * Reactivates a deleted/deactivated account.
 */
export const adminReactivateAccount = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    accountStatus: "active",
    updatedAt: serverTimestamp(),
    adminUpdated: true,
    adminUpdatedAt: serverTimestamp(),
  });
};

/**
 * Resets a user's KYC status to 'none' so they can resubmit.
 */
export const adminResetKYC = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    kycStatus: "none",
    updatedAt: serverTimestamp(),
    adminUpdated: true,
    adminUpdatedAt: serverTimestamp(),
  });
};

/**
 * BULK ACTION: Apply a status change to multiple users at once.
 */
export const adminBulkUpdateStatus = async (
  userIds: string[],
  status: "active" | "restricted" | "blocked",
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  // Process in batches of 10 to avoid Firestore write limits
  const batchSize = 10;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const promises = batch.map((uid) =>
      updateDoc(doc(db, "users", uid), {
        accountStatus: status,
        updatedAt: serverTimestamp(),
        adminUpdated: true,
        adminUpdatedAt: serverTimestamp(),
      })
        .then(() => success++)
        .catch(() => failed++),
    );
    await Promise.all(promises);
  }

  return { success, failed };
};