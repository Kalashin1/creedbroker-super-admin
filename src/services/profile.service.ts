// src/services/adminProfile.service.ts
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  AdminAuditLog,
  AdminAction,
  AdminPreferences,
} from "../types/profile.types";

/**
 * Logs an admin action to the audit trail.
 */
export const logAdminAction = async (params: {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AdminAction;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  metadata?: Record<string, any>;
}): Promise<string> => {
  const docRef = await addDoc(collection(db, "adminAuditLogs"), {
    ...params,
    ip: typeof navigator !== "undefined" ? "" : undefined, // Can be populated via Cloud Function
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Fetches the admin's audit log (actions they've performed).
 */
export const fetchAdminAuditLog = async (
  adminId: string,
  limitCount: number = 50,
): Promise<AdminAuditLog[]> => {
  try {
    const q = query(
      collection(db, "adminAuditLogs"),
      where("adminId", "==", adminId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        adminId: data.adminId,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        action: data.action,
        targetUserId: data.targetUserId,
        targetUserName: data.targetUserName,
        details: data.details,
        metadata: data.metadata,
        ip: data.ip,
        userAgent: data.userAgent,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as AdminAuditLog;
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return [];
  }
};

/**
 * Fetches admin preferences.
 */
export const fetchAdminPreferences = async (
  adminId: string,
): Promise<AdminPreferences> => {
  const docRef = doc(db, "users", adminId, "preferences", "admin");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as AdminPreferences;
  }
  return {
    emailNotifications: true,
    securityAlerts: true,
    kycAlerts: true,
    withdrawalAlerts: true,
    timezone: "UTC",
    language: "en",
  };
};

/**
 * Updates admin preferences.
 */
export const updateAdminPreferences = async (
  adminId: string,
  prefs: Partial<AdminPreferences>,
): Promise<void> => {
  const docRef = doc(db, "users", adminId, "preferences", "admin");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await updateDoc(docRef, prefs);
  } else {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(docRef, {
      emailNotifications: true,
      securityAlerts: true,
      kycAlerts: true,
      withdrawalAlerts: true,
      timezone: "UTC",
      language: "en",
      ...prefs,
    });
  }
};
