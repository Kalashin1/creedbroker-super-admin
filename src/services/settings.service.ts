// src/services/settings.service.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  deleteUser,
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db } from "../lib/firebase";
import type { UserSettings } from "../types/settings.types";

const getSettingsDoc = (userId: string) =>
  doc(db, "users", userId, "settings", "preferences");

const DEFAULT_SETTINGS: UserSettings = {
  displayName: "",
  language: "en",
  timezone: "UTC",
  preferredCurrency: "USD",
  dateFormat: "MM/DD/YYYY",
  numberFormat: "1,234.56",
  emailNotifications: {
    loginAlerts: true,
    withdrawalAlerts: true,
    depositAlerts: true,
    tradeAlerts: true,
    marketingEmails: false,
    weeklyReport: true,
    securityAlerts: true,
  },
  pushNotifications: {
    priceAlerts: true,
    tradeUpdates: true,
    newsUpdates: false,
    promotionalOffers: false,
  },
  smsNotifications: {
    loginAlerts: true,
    withdrawalAlerts: true,
    securityAlerts: true,
  },
  trading: {
    defaultPair: "BTC/USD",
    orderConfirmation: true,
    riskWarnings: true,
    oneClickTrading: false,
    maxTradeSize: 10000,
    defaultLeverage: 1,
  },
  sessionTimeout: 1000000,
  privacy: {
    profileVisibility: "private",
    showPortfolio: false,
    showTradingHistory: false,
    allowDataSharing: false,
    analyticsTracking: true,
  },
  updatedAt: serverTimestamp() as any,
  createdAt: serverTimestamp() as any,
};

export const fetchUserSettings = async (
  userId: string,
): Promise<UserSettings> => {
  try {
    const snapshot = await getDoc(getSettingsDoc(userId));
    if (!snapshot.exists()) {
      await setDoc(getSettingsDoc(userId), {
        ...DEFAULT_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return DEFAULT_SETTINGS;
    }
    return snapshot.data() as UserSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return DEFAULT_SETTINGS;
  }
};

export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>,
): Promise<void> => {
  const docRef = getSettingsDoc(userId);

  // Ensure document exists before updating
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    await setDoc(docRef, {
      ...DEFAULT_SETTINGS,
      ...settings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  });
};

export const exportUserData = async (userId: string): Promise<void> => {
  const profileRef = doc(db, "users", userId);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) throw new Error("Profile not found");

  const data = snapshot.data();

  // Remove sensitive fields before export
  const safeData = { ...data };
  delete safeData.btcMnemonicEncrypted;
  delete safeData.ethMnemonicEncrypted;
  delete safeData.bnbMnemonicEncrypted;
  delete safeData.solMnemonicEncrypted;

  const blob = new Blob([JSON.stringify(safeData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `creedmarket_data_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const deactivateAccount = async (userId: string): Promise<void> => {
  const profileRef = doc(db, "users", userId);
  await updateDoc(profileRef, {
    accountStatus: "deactivated",
    deactivatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// 🆕 Fixed: Now requires password for re-authentication before deletion
export const deleteAccount = async (
  userId: string,
  password: string,
): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No user logged in");

  // Step 1: Re-authenticate (Firebase requires this for account deletion)
  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } catch (err: any) {
    if (err.code === "auth/wrong-password") {
      throw new Error("Incorrect password. Please try again.");
    }
    throw new Error(
      "Re-authentication failed. Please log out and log back in, then try again.",
    );
  }

  // Step 2: Mark account as deleted in Firestore
  const profileRef = doc(db, "users", userId);
  await updateDoc(profileRef, {
    accountStatus: "deleted",
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Step 3: Delete Firebase Auth account
  await deleteUser(user);
};
