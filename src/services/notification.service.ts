// src/services/notification.service.ts
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from '../lib/firebase';
import type {
  Notification,
  CreateNotificationPayload,
  NotificationFilters,
} from "../types/notification.types";

const RETENTION_DAYS = 90;

const getNotificationsCollection = (userId: string) =>
  collection(db, "users", userId, "notifications");

// ═══════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════

export const createNotification = async (
  userId: string,
  payload: CreateNotificationPayload,
): Promise<string> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + RETENTION_DAYS);

  const docRef = await addDoc(getNotificationsCollection(userId), {
    userId,
    title: payload.title,
    message: payload.message,
    category: payload.category,
    type: payload.type,
    priority: payload.priority || "normal",
    read: false,
    actionUrl: payload.actionUrl || null,
    metadata: payload.metadata || null,
    createdAt: serverTimestamp(),
    expiresAt: expiresAt,
  });

  // 🆕 Email hook (placeholder for Cloud Function trigger)
  if (payload.sendEmail) {
    console.log(
      `[EMAIL HOOK] Would send email to user ${userId}: ${payload.title}`,
    );
    // In production, this triggers a Firestore document in a 'mail' collection
    // that a Cloud Function picks up and sends via SendGrid/Resend
  }

  return docRef.id;
};

// ═══════════════════════════════════════════════════════════
// FETCH
// ═══════════════════════════════════════════════════════════

export const fetchNotifications = async (
  userId: string,
  limitCount: number = 50,
): Promise<Notification[]> => {
  try {
    const q = query(
      getNotificationsCollection(userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => mapNotification(doc.id, doc.data()));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      getNotificationsCollection(userId),
      where("read", "==", false),
      limit(100), // Firestore requires limit for count queries in some cases
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// ═══════════════════════════════════════════════════════════
// REAL-TIME SUBSCRIPTION
// ═══════════════════════════════════════════════════════════

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
  onError?: (error: Error) => void,
  limitCount: number = 50,
): Unsubscribe => {
  try {
    const q = query(
      getNotificationsCollection(userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) =>
          mapNotification(doc.id, doc.data()),
        );
        callback(notifications);
      },
      (error) => {
        console.error("Notification subscription error:", error);
        onError?.(error);
      },
    );
  } catch (error) {
    console.error("Failed to subscribe to notifications:", error);
    return () => {};
  }
};

// ═══════════════════════════════════════════════════════════
// MARK AS READ
// ═══════════════════════════════════════════════════════════

export const markAsRead = async (
  userId: string,
  notificationId: string,
): Promise<void> => {
  const docRef = doc(getNotificationsCollection(userId), notificationId);
  await updateDoc(docRef, { read: true });
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    const q = query(
      getNotificationsCollection(userId),
      where("read", "==", false),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════

export const deleteNotification = async (
  userId: string,
  notificationId: string,
): Promise<void> => {
  await deleteDoc(doc(getNotificationsCollection(userId), notificationId));
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  try {
    const snapshot = await getDocs(getNotificationsCollection(userId));
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════

const mapNotification = (id: string, data: any): Notification => ({
  id,
  userId: data.userId,
  title: data.title,
  message: data.message,
  category: data.category,
  type: data.type,
  priority: data.priority,
  read: data.read || false,
  actionUrl: data.actionUrl,
  metadata: data.metadata,
  createdAt: data.createdAt?.toDate() || new Date(),
  expiresAt: data.expiresAt?.toDate(),
});
