// src/services/adminInvestment.service.ts
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
  AdminInvestment,
  InvestmentStatus,
} from "../types/investment.types";

const USERS_COLLECTION = "users";

/**
 * Fetches all investments from all users (admin-only operation).
 * Iterates through users and their investments subcollections.
 */
export const fetchAllInvestments = async (): Promise<AdminInvestment[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const allInvestments: AdminInvestment[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const investmentsRef = collection(
        db,
        USERS_COLLECTION,
        userDoc.id,
        "investments",
      );

      const investmentsSnapshot = await getDocs(
        query(investmentsRef, orderBy("createdAt", "desc")),
      );

      investmentsSnapshot.docs.forEach((invDoc) => {
        const data = invDoc.data();
        allInvestments.push({
          id: invDoc.id,
          userId: userDoc.id,
          userName: userData.fullName || "Unknown",
          userEmail: userData.email || "",
          packageId: data.packageId || "",
          packageName: data.packageName || "Unknown Package",
          tier: data.tier || "standard",
          amount: data.amount || 0,
          currency: data.currency || "USD",
          duration: data.duration || 0,
          roi: data.roi || 0,
          dailyProfit: data.dailyProfit || 0,
          totalProfit: data.totalProfit || 0,
          status: data.status || "pending",
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
    }

    // Sort by creation date (newest first)
    return allInvestments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } catch (error) {
    console.error("Error fetching investments:", error);
    return [];
  }
};

/**
 * Updates an investment's status.
 */
export const updateInvestmentStatus = async (
  userId: string,
  investmentId: string,
  status: InvestmentStatus,
  additionalData: Record<string, any> = {},
): Promise<void> => {
  const investmentRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    "investments",
    investmentId,
  );

  await updateDoc(investmentRef, {
    status,
    statusUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...additionalData,
  });
};

/**
 * Adjusts an investment's profit manually (admin override).
 */
export const adjustInvestmentProfit = async (
  userId: string,
  investmentId: string,
  newProfit: number,
): Promise<void> => {
  const investmentRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    "investments",
    investmentId,
  );

  await updateDoc(investmentRef, {
    totalProfit: newProfit,
    profitAdjustedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
