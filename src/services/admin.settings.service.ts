// src/services/adminSettings.service.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  GlobalPlatformSettings,
  AdminPersonalSettings,
} from "../types/settings.types";

const GLOBAL_SETTINGS_DOC = doc(db, "appSettings", "globalPlatform");

// ─── GLOBAL SETTINGS ───

export const getGlobalSettings = async (): Promise<GlobalPlatformSettings> => {
  const snap = await getDoc(GLOBAL_SETTINGS_DOC);
  if (snap.exists()) {
    return snap.data() as GlobalPlatformSettings;
  }
  // Default fallback
  return {
    limits: {
      maxAccountBalanceUSD: 1000000,
      maxWithdrawalAmountUSD: 50000,
      minWithdrawalAmountUSD: 50,
      maxDailyWithdrawalAmountUSD: 100000,
      maxTradeSizeUSD: 100000,
    },
    trading: {
      tradingEnabled: true,
      globalMaxLeverage: 100,
      defaultLeverage: 10,
      tradingFeePercentage: 0.1,
      maintenanceFeePercentage: 0,
    },
    kycAndSecurity: {
      requireKYCForWithdrawal: true,
      requireKYCForTrading: false,
      enforce2FAForWithdrawals: true,
      sessionTimeoutMinutesGlobal: 30,
      maxFailedLoginAttempts: 5,
      minAgeForAccount: 18,
    },
    fees: {
      depositFeePercentage: 0,
      withdrawalFeeFlatUSD: 5,
      withdrawalFeePercentage: 1,
    },
    maintenanceMode: false,
    updatedAt: serverTimestamp() as any,
  };
};

export const updateGlobalSettings = async (
  updates: Partial<GlobalPlatformSettings>,
): Promise<void> => {
  await updateDoc(GLOBAL_SETTINGS_DOC, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ─── ADMIN PERSONAL SETTINGS ───

export const getAdminPersonalSettings = async (
  adminId: string,
): Promise<AdminPersonalSettings> => {
  const docRef = doc(db, "users", adminId, "settings", "adminPersonal");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as AdminPersonalSettings;
  }
  return {
    sessionTimeout: 30,
    displayName: "Admin",
    language: "en",
    timezone: "UTC",
    preferredCurrency: "USD",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "1,234.56",
    dashboardLayout: "detailed",
    autoRefreshDashboard: true,
    adminAlerts: {
      kycSubmissions: true,
      largeWithdrawals: true,
      systemErrors: true,
      userReports: true,
      securityBreaches: true,
    },
    updatedAt: serverTimestamp() as any,
    createdAt: serverTimestamp() as any,
  };
};

export const updateAdminPersonalSettings = async (
  adminId: string,
  updates: Partial<AdminPersonalSettings>,
): Promise<void> => {
  const docRef = doc(db, "users", adminId, "settings", "adminPersonal");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  } else {
    await setDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
};
