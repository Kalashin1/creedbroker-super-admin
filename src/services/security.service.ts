// src/services/security.service.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  // where,
} from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  // sendEmailVerification,
} from "firebase/auth";
import { db, auth } from "../lib/firebase";
import type {
  SecuritySettings,
  LoginActivity,
  ActiveSession,
  EmailOTP,
} from "../types/security.types";

const getSecuritySettingsDoc = (userId: string) =>
  doc(db, "users", userId, "security", "settings");
const getLoginActivityCollection = (userId: string) =>
  collection(db, "users", userId, "loginActivity");
const getActiveSessionsCollection = (userId: string) =>
  collection(db, "users", userId, "sessions");
const getEmailOTPDoc = (userId: string) =>
  doc(db, "users", userId, "security", "emailOTP");

// ═══════════════════════════════════════════════════════════
// PASSWORD
// ═══════════════════════════════════════════════════════════

export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No user logged in");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

// ═══════════════════════════════════════════════════════════
// SECURITY SETTINGS
// ═══════════════════════════════════════════════════════════

export const fetchSecuritySettings = async (
  userId: string,
): Promise<SecuritySettings> => {
  const defaultSettings: SecuritySettings = {
    emailNotifications: true,
    loginAlerts: true,
    withdrawalAlerts: true,
    withdrawalWhitelist: false,
    twoFactorEnabled: false,
    sessionTimeout: 30,
  };

  try {
    const docRef = getSecuritySettingsDoc(userId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      await setDoc(docRef, {
        ...defaultSettings,
        updatedAt: serverTimestamp(),
      });
      return defaultSettings;
    }

    const data = snapshot.data();
    return {
      emailNotifications: data.emailNotifications ?? true,
      loginAlerts: data.loginAlerts ?? true,
      withdrawalAlerts: data.withdrawalAlerts ?? true,
      withdrawalWhitelist: data.withdrawalWhitelist ?? false,
      twoFactorEnabled: data.twoFactorEnabled ?? false,
      antiPhishingCode: data.antiPhishingCode,
      sessionTimeout: data.sessionTimeout ?? 30,
    };
  } catch (error) {
    console.error("Error fetching security settings:", error);
    return defaultSettings;
  }
};

export const updateSecuritySettings = async (
  userId: string,
  settings: Partial<SecuritySettings>,
): Promise<void> => {
  const docRef = getSecuritySettingsDoc(userId);
  await updateDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  });
};

// ═══════════════════════════════════════════════════════════
// EMAIL OTP (2FA)
// ═══════════════════════════════════════════════════════════

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendEmailOTP = async (
  userId: string,
  email: string,
): Promise<void> => {
  const code = generateOTP();
  // const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in Firestore
  await setDoc(getEmailOTPDoc(userId), {
    code,
    expiresAt: serverTimestamp(),
    attempts: 0,
    verified: false,
    createdAt: serverTimestamp(),
  });

  // TODO: Send email using your email service (SendGrid, Firebase Extensions, etc.)
  // For now, log to console for testing
  console.log(`🔐 Email OTP for ${email}: ${code}`);

  // In production, use:
  // await sendOTPEmail(email, code);
};

export const verifyEmailOTP = async (
  userId: string,
  code: string,
): Promise<boolean> => {
  const otpRef = getEmailOTPDoc(userId);
  const snapshot = await getDoc(otpRef);

  if (!snapshot.exists()) {
    throw new Error("No OTP found");
  }

  const data = snapshot.data() as EmailOTP;

  // Check if expired (10 minutes)
  const now = new Date();
  const expiresAt = data.expiresAt.toDate();
  if (now > expiresAt) {
    throw new Error("OTP expired");
  }

  // Check attempts (max 5)
  if (data.attempts >= 5) {
    throw new Error("Too many attempts");
  }

  // Verify code
  if (data.code === code) {
    await updateDoc(otpRef, { verified: true });
    return true;
  } else {
    await updateDoc(otpRef, { attempts: data.attempts + 1 });
    return false;
  }
};

export const enable2FAWithEmailOTP = async (
  userId: string,
  code: string,
): Promise<void> => {
  const isValid = await verifyEmailOTP(userId, code);
  if (!isValid) {
    throw new Error("Invalid OTP");
  }
  await updateSecuritySettings(userId, { twoFactorEnabled: true });
};

export const disable2FA = async (userId: string): Promise<void> => {
  await updateSecuritySettings(userId, { twoFactorEnabled: false });
};

// ═══════════════════════════════════════════════════════════
// LOGIN ACTIVITY & SESSIONS
// ═══════════════════════════════════════════════════════════

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const browser = ua.includes("Chrome")
    ? "Chrome"
    : ua.includes("Firefox")
      ? "Firefox"
      : ua.includes("Safari")
        ? "Safari"
        : "Unknown";
  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Mac")
      ? "macOS"
      : ua.includes("Linux")
        ? "Linux"
        : ua.includes("Android")
          ? "Android"
          : ua.includes("iOS")
            ? "iOS"
            : "Unknown";
  const device =
    ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")
      ? "Mobile"
      : "Desktop";

  return { browser, os, device };
};

export const logLoginActivity = async (
  userId: string,
  status: "success" | "failed" = "success",
): Promise<void> => {
  const { browser, os, device } = getDeviceInfo();

  // TODO: Get real IP and location from a service like ipapi.co
  const ip = "192.168.1.1"; // Placeholder
  const location = "Unknown"; // Placeholder

  await addDoc(getLoginActivityCollection(userId), {
    ip,
    device,
    browser,
    os,
    location,
    status,
    timestamp: serverTimestamp(),
  });

  // Check if login alerts are enabled
  const settings = await fetchSecuritySettings(userId);
  if (settings.loginAlerts && status === "success") {
    // TODO: Send login alert email
    console.log(`📧 Login alert sent to user ${userId}`);
  }
};

export const createSession = async (userId: string): Promise<string> => {
  const { browser, os, device } = getDeviceInfo();
  const ip = "192.168.1.1"; // TODO: Get real IP
  const location = "Unknown"; // TODO: Get real location

  const docRef = await addDoc(getActiveSessionsCollection(userId), {
    device,
    browser,
    os,
    ip,
    location,
    lastActive: serverTimestamp(),
    isCurrent: true,
  });

  return docRef.id;
};

export const updateSessionActivity = async (
  userId: string,
  sessionId: string,
): Promise<void> => {
  const sessionRef = doc(getActiveSessionsCollection(userId), sessionId);
  await updateDoc(sessionRef, {
    lastActive: serverTimestamp(),
  });
};

export const fetchLoginActivity = async (
  userId: string,
  limitCount: number = 20,
): Promise<LoginActivity[]> => {
  try {
    const q = query(
      getLoginActivityCollection(userId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
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
  } catch (error) {
    console.error("Error fetching login activity:", error);
    return [];
  }
};

export const fetchActiveSessions = async (
  userId: string,
): Promise<ActiveSession[]> => {
  try {
    const q = query(
      getActiveSessionsCollection(userId),
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
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return [];
  }
};

export const revokeSession = async (
  userId: string,
  sessionId: string,
): Promise<void> => {
  await deleteDoc(doc(getActiveSessionsCollection(userId), sessionId));
};

export const revokeAllSessions = async (
  userId: string,
  currentSessionId: string,
): Promise<void> => {
  const sessions = await fetchActiveSessions(userId);
  const promises = sessions
    .filter((s) => s.id !== currentSessionId)
    .map((s) => deleteDoc(doc(getActiveSessionsCollection(userId), s.id)));
  await Promise.all(promises);
};

// ═══════════════════════════════════════════════════════════
// SESSION TIMEOUT CHECK
// ═══════════════════════════════════════════════════════════

export const checkSessionTimeout = async (
  userId: string,
  sessionId: string,
): Promise<boolean> => {
  const settings = await fetchSecuritySettings(userId);
  const sessionRef = doc(getActiveSessionsCollection(userId), sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) return false;

  const lastActive = snapshot.data().lastActive?.toDate();
  if (!lastActive) return false;

  const now = new Date();
  const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);

  return diffMinutes > settings.sessionTimeout;
};

export interface GlobalSecuritySettings {
  require2FAForWithdrawals: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  minWithdrawalAmountUSD: number;
  maintenanceMode: boolean;
  updatedAt: any;
}

export const getGlobalSecuritySettings =
  async (): Promise<GlobalSecuritySettings> => {
    const docRef = doc(db, "appSettings", "security");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as GlobalSecuritySettings;
    }
    // Default fallback settings
    return {
      require2FAForWithdrawals: true,
      sessionTimeoutMinutes: 30,
      maxFailedLoginAttempts: 5,
      minWithdrawalAmountUSD: 50,
      maintenanceMode: false,
      updatedAt: new Date(),
    };
  };

export const updateGlobalSecuritySettings = async (
  settings: Partial<GlobalSecuritySettings>,
) => {
  const docRef = doc(db, "appSettings", "security");
  await updateDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  });
};

export const getSecurityAlerts = async (limitCount: number = 50) => {
  const q = query(
    collection(db, "securityAlerts"),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const markAlertAsReviewed = async (alertId: string) => {
  await updateDoc(doc(db, "securityAlerts", alertId), { reviewed: true });
};

export const getPendingKYCUsers = async (limitCount: number = 50) => {
  const q = query(
    collection(db, "users"),
    where("kycStatus", "==", "pending"),
    orderBy("updatedAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export type KycFilterStatus = "pending" | "verified" | "rejected";

export const getKYCUsers = async (
  status: KycFilterStatus,
  limitCount: number = 50,
) => {
  const q = query(
    collection(db, "users"),
    where("kycStatus", "==", status),
    orderBy("updatedAt", "desc"),
    limit(limitCount),
  );

  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error(`Error fetching ${status} KYC users:`, error);
    return [];
  }
};