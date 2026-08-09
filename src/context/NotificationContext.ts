// src/contexts/NotificationsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import {
  subscribeToNotifications,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  deleteNotification as deleteNotificationService,
  clearAllNotifications as clearAllService,
  createNotification,
} from '../services/notification.service';
import type {
  Notification,
  CreateNotificationPayload,
  NotificationCategory,
} from '../types/notification.types';
import { toast } from 'react-toastify';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  // Actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  sendNotification: (payload: CreateNotificationPayload) => Promise<string>;
  // Filters
  filterByCategory: (category: NotificationCategory | 'all') => Notification[];
  filterByRead: (read: boolean | 'all') => Notification[];
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined
);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications((prev) => {
          // Show toast for new high/urgent priority notifications
          const newIds = new Set(newNotifications.map((n) => n.id));
          const brandNew = newNotifications.filter(
            (n) => !prev.some((p) => p.id === n.id)
          );

          brandNew.forEach((notification) => {
            // Only toast if user has notifications enabled in settings
            const shouldToast =
              settings?.emailNotifications?.securityAlerts !== false &&
              (notification.priority === 'high' || notification.priority === 'urgent');

            if (shouldToast) {
              const toastType =
                notification.type === 'error'
                  ? toast.error
                  : notification.type === 'warning'
                  ? toast.warning
                  : notification.type === 'success'
                  ? toast.success
                  : toast.info;

              toastType(notification.title, {
                autoClose: 5000,
              });
            }
          });

          return newNotifications;
        });
        setLoading(false);
      },
      (error) => {
        console.error('Notification subscription failed:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, settings?.emailNotifications?.securityAlerts]);

  // Computed unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Actions
  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await markAsReadService(user.uid, id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      await markAllAsReadService(user.uid);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to update notifications');
    }
  }, [user]);

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await deleteNotificationService(user.uid, id);
      } catch (err) {
        console.error('Failed to delete notification:', err);
        toast.error('Failed to delete notification');
      }
    },
    [user]
  );

  const clearAll = useCallback(async () => {
    if (!user) return;
    try {
      await clearAllService(user.uid);
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      toast.error('Failed to clear notifications');
    }
  }, [user]);

  const sendNotification = useCallback(
    async (payload: CreateNotificationPayload): Promise<string> => {
      if (!user) throw new Error('User not authenticated');
      return createNotification(user.uid, payload);
    },
    [user]
  );

  // Filters
  const filterByCategory = useCallback(
    (category: NotificationCategory | 'all') => {
      if (category === 'all') return notifications;
      return notifications.filter((n) => n.category === category);
    },
    [notifications]
  );

  const filterByRead = useCallback(
    (read: boolean | 'all') => {
      if (read === 'all') return notifications;
      return notifications.filter((n) => n.read === read);
    },
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      sendNotification,
      filterByCategory,
      filterByRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      sendNotification,
      filterByCategory,
      filterByRead,
    ]
  );

  return React.createElement(NotificationsContext.Provider, { value}, children)
};

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    );
  }
  return ctx;
};