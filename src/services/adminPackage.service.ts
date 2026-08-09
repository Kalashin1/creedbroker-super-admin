// src/services/adminPackage.service.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { InvestmentPackage, PackageTier } from "../types/investment.types";

const PACKAGES_COLLECTION = "investmentPackages";

/**
 * Creates a new investment package.
 */
export const createPackage = async (
  data: Omit<InvestmentPackage, "id" | "icon">,
): Promise<string> => {
  const docRef = await addDoc(collection(db, PACKAGES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Updates an existing investment package.
 */
export const updatePackage = async (
  packageId: string,
  data: Partial<Omit<InvestmentPackage, "id" | "icon">>,
): Promise<void> => {
  const docRef = doc(db, PACKAGES_COLLECTION, packageId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Deletes an investment package.
 */
export const deletePackage = async (packageId: string): Promise<void> => {
  await deleteDoc(doc(db, PACKAGES_COLLECTION, packageId));
};

/**
 * Fetches all packages (for admin view — raw data, no icon mapping).
 */
export const fetchAdminPackages = async (): Promise<InvestmentPackage[]> => {
  try {
    const snapshot = await getDocs(collection(db, PACKAGES_COLLECTION));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as InvestmentPackage[];
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
};

/**
 * Toggles the "popular" flag on a package.
 */
export const togglePackagePopular = async (
  packageId: string,
  isPopular: boolean,
): Promise<void> => {
  await updateDoc(doc(db, PACKAGES_COLLECTION, packageId), {
    popular: isPopular,
    updatedAt: serverTimestamp(),
  });
};
