// src/types/notification.types.ts
import { Timestamp } from "firebase/firestore";

export type NotificationCategory =
  | "security"
  | "transaction"
  | "investment"
  | "account"
  | "support"
  | "system"
  | "promo";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  category: NotificationCategory;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
}

export interface NotificationFilters {
  category?: NotificationCategory | "all";
  read?: boolean | "all";
  search?: string;
}
