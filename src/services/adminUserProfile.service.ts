// src/services/adminUserProfile.service.ts
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { UserProfile } from "../types/user.types";
import type { BankAccount } from "../types/user.types";
import type { UserInvestment } from "../types/investment.types";
import type { TransactionRecord } from "./transaction.service";
import type { LoginActivity, ActiveSession } from "../types/security.types";

export interface UserProfileDetail {
  profile: UserProfile;
  bankAccounts: BankAccount[];
  investments: UserInvestment[];
  transactions: TransactionRecord[];
  loginActivity: LoginActivity[];
  sessions: ActiveSession[];
}

/**
 * Fetches complete user profile with all related data.
 */
export const fetchUserProfileDetail = async (
  userId: string,
): Promise<UserProfileDetail | null> => {
  try {
    // Fetch profile
    const profileRef = doc(db, "users", userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) return null;

    const profile = profileSnap.data() as UserProfile;

    // Fetch all related data in parallel
    const [bankAccounts, investments, transactions, loginActivity, sessions] =
      await Promise.all([
        fetchBankAccounts(userId),
        fetchInvestments(userId),
        fetchTransactions(userId),
        fetchLoginActivity(userId),
        fetchSessions(userId),
      ]);

    return {
      profile,
      bankAccounts,
      investments,
      transactions,
      loginActivity,
      sessions,
    };
  } catch (error) {
    console.error("Error fetching user profile detail:", error);
    return null;
  }
};

const fetchBankAccounts = async (userId: string): Promise<BankAccount[]> => {
  try {
    const q = query(
      collection(db, "users", userId, "bankAccounts"),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BankAccount[];
  } catch {
    return [];
  }
};

const fetchInvestments = async (userId: string): Promise<UserInvestment[]> => {
  try {
    const q = query(
      collection(db, "users", userId, "investments"),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        packageId: data.packageId,
        packageName: data.packageName,
        amount: data.amount,
        duration: data.duration,
        roi: data.roi,
        status: data.status,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch {
    return [];
  }
};

const fetchTransactions = async (
  userId: string,
): Promise<TransactionRecord[]> => {
  try {
    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .filter((doc) => doc.data().userId === userId)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          usdValue: data.usdValue,
          description: data.description,
          status: data.status,
          date: data.createdAt?.toDate() || new Date(),
          fee: data.fee,
          txHash: data.txHash,
        };
      });
  } catch {
    return [];
  }
};

const fetchLoginActivity = async (userId: string): Promise<LoginActivity[]> => {
  try {
    const q = query(
      collection(db, "users", userId, "loginActivity"),
      orderBy("timestamp", "desc"),
      limit(10),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ip: data.ip,
        device: data.device,
        browser: data.browser,
        os: data.os,
        location: data.location,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status,
      };
    });
  } catch {
    return [];
  }
};

const fetchSessions = async (userId: string): Promise<ActiveSession[]> => {
  try {
    const q = query(
      collection(db, "users", userId, "sessions"),
      orderBy("lastActive", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        device: data.device,
        browser: data.browser,
        os: data.os,
        ip: data.ip,
        location: data.location,
        lastActive: data.lastActive?.toDate() || new Date(),
        isCurrent: data.isCurrent || false,
      };
    });
  } catch {
    return [];
  }
};

/**
 * Updates user profile fields (admin override).
 */
export const adminUpdateUserProfile = async (
  userId: string,
  data: Record<string, any>,
): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    ...data,
    updatedAt: serverTimestamp(),
    adminUpdated: true,
    adminUpdatedAt: serverTimestamp(),
  });
};

/**
 * Adjusts user balance (admin override).
 */
export const adminAdjustBalance = async (
  userId: string,
  newBalance: {
    usd?: number;
    btc?: number;
    eth?: number;
    bnb?: number;
    sol?: number;
  },
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  const currentBalance = snap.data()?.balance || {
    usd: 0,
    btc: 0,
    eth: 0,
    bnb: 0,
    sol: 0,
  };

  await updateDoc(userRef, {
    balance: { ...currentBalance, ...newBalance },
    updatedAt: serverTimestamp(),
    adminUpdated: true,
    adminUpdatedAt: serverTimestamp(),
  });
};
