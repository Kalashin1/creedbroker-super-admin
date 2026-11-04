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


// ═══════════════════════════════════════════════════════════
// GLOBAL PLATFORM SETTINGS (Affects ALL users)
// ═══════════════════════════════════════════════════════════

export interface GlobalLimits {
  maxAccountBalanceUSD: number;
  maxWithdrawalAmountUSD: number;
  minWithdrawalAmountUSD: number;
  maxDailyWithdrawalAmountUSD: number;
  maxTradeSizeUSD: number;
}

export interface GlobalTrading {
  tradingEnabled: boolean;
  globalMaxLeverage: number;
  defaultLeverage: number;
  tradingFeePercentage: number;
  maintenanceFeePercentage: number;
}

export interface GlobalKYCAndSecurity {
  requireKYCForWithdrawal: boolean;
  requireKYCForTrading: boolean;
  enforce2FAForWithdrawals: boolean;
  sessionTimeoutMinutesGlobal: number;
  maxFailedLoginAttempts: number;
  minAgeForAccount: number;
}

export interface GlobalFees {
  depositFeePercentage: number;
  withdrawalFeeFlatUSD: number;
  withdrawalFeePercentage: number;
}

export interface GlobalPlatformSettings {
  limits: GlobalLimits;
  trading: GlobalTrading;
  kycAndSecurity: GlobalKYCAndSecurity;
  fees: GlobalFees;
  maintenanceMode: boolean;
  updatedAt: Timestamp;
}

// ═══════════════════════════════════════════════════════════
// ADMIN PERSONAL SETTINGS (Affects ONLY this admin)
// ═══════════════════════════════════════════════════════════

export interface AdminAlertPreferences {
  kycSubmissions: boolean;
  largeWithdrawals: boolean;
  systemErrors: boolean;
  userReports: boolean;
  securityBreaches: boolean;
}

export interface AdminPersonalSettings extends Omit<UserSettings, 'emailNotifications' | 'pushNotifications' | 'smsNotifications' | 'trading' | 'privacy'> {
  // Inherits: sessionTimeout, displayName, language, timezone, preferredCurrency, dateFormat, numberFormat
  
  // Admin-specific overrides/additions
  dashboardLayout: 'compact' | 'detailed';
  autoRefreshDashboard: boolean;
  adminAlerts: AdminAlertPreferences;
  
  updatedAt: Timestamp;
  createdAt: Timestamp;
}