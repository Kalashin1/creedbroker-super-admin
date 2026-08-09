// src/services/alert.service.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export type AlertType = "login" | "withdrawal" | "security";

/**
 * Triggers a security alert and logs it to Firestore.
 * In production, this should also trigger an email via Cloud Functions.
 */
export const triggerSecurityAlert = async (
  userId: string,
  type: AlertType,
  details: string,
  metadata: Record<string, any> = {},
): Promise<void> => {
  try {
    // Log to Firestore for admin review
    await addDoc(collection(db, "securityAlerts"), {
      userId,
      type,
      details,
      metadata: {
        ...metadata,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        timestamp: Date.now(),
      },
      createdAt: serverTimestamp(),
      read: false,
    });

    // Console log for debugging (replace with email service in production)
    console.log(
      `[SECURITY ALERT] ${type.toUpperCase()} for user ${userId}: ${details}`,
    );
  } catch (error) {
    console.error("Failed to log security alert:", error);
  }
};
