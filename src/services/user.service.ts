// src/services/user.service.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { UserProfile } from "../types/user.types";

const USERS_COLLECTION = "users";

/**
 * Creates a new user profile in Firestore.
 * For admin-created accounts, sets admin flag.
 */
export const createUserProfile = async (
  uid: string,
  payload: {
    fullName: string;
    email: string;
    phone?: string;
    country?: string;
    isAdmin?: boolean;
  },
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);

  const profileData: Partial<UserProfile> = {
    uid,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone || "",
    country: payload.country || "",
    role: "admin",
    emailVerified: false,
    profileComplete: false,
    kycStatus: "none",
    balance: { usd: 0, btc: 0, eth: 0, bnb: 0, sol: 0 },
    stats: {
      totalInvestments: 0,
      totalInvested: 0,
      totalProfit: 0,
      totalWithdrawals: 0,
    },
    verification: {
      location: { status: "not_started" },
      identity: { status: "not_started" },
      tax: { status: "not_started" },
    },
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    lastLoginAt: null,
  };

  await setDoc(userRef, profileData);
};

export const touchLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};


/**
 * Ensures a user profile exists. Creates one if missing.
 */
export const ensureUserProfile = async (
  uid: string,
  email: string,
): Promise<UserProfile | null> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }

  // Create minimal profile
  await createUserProfile(uid, {
    fullName: email.split("@")[0],
    email,
  });

  const newSnapshot = await getDoc(userRef);
  return newSnapshot.data() as UserProfile;
};

/**
 * Fetches a user profile by UID.
 */
export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return null;
    return snapshot.data() as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Updates a user profile with partial data.
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
