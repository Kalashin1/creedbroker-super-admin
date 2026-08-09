// src/types/settings.types.ts
import { Timestamp } from 'firebase/firestore';

export interface UserSettings {
  sessionTimeout: number;
  // General
  displayName: string;
  language: string;
  timezone: string;
  preferredCurrency: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  numberFormat: "1,234.56" | "1.234,56";

  // Notifications
  emailNotifications: {
    loginAlerts: boolean;
    withdrawalAlerts: boolean;
    depositAlerts: boolean;
    tradeAlerts: boolean;
    marketingEmails: boolean;
    weeklyReport: boolean;
    securityAlerts: boolean;
  };
  pushNotifications: {
    priceAlerts: boolean;
    tradeUpdates: boolean;
    newsUpdates: boolean;
    promotionalOffers: boolean;
  };
  smsNotifications: {
    loginAlerts: boolean;
    withdrawalAlerts: boolean;
    securityAlerts: boolean;
  };

  // Trading
  trading: {
    defaultPair: string;
    orderConfirmation: boolean;
    riskWarnings: boolean;
    oneClickTrading: boolean;
    maxTradeSize: number;
    defaultLeverage: number;
  };

  // Privacy
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showPortfolio: boolean;
    showTradingHistory: boolean;
    allowDataSharing: boolean;
    analyticsTracking: boolean;
  };

  // Metadata
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

export type SettingsSection = 'general' | 'notifications' | 'trading' | 'privacy' | 'data';