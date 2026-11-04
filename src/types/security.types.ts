// src/types/security.types.ts
import { Timestamp } from "firebase/firestore";

// ═══════════════════════════════════════════════════════════
// USER-FACING SECURITY TYPES
// ═══════════════════════════════════════════════════════════

export interface LoginActivity {
  id: string;
  ip: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  timestamp: Date;
  status: "success" | "failed";
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
}

export interface UserSecuritySettings {
  emailNotifications: boolean;
  loginAlerts: boolean;
  withdrawalAlerts: boolean;
  withdrawalWhitelist: boolean;
  twoFactorEnabled: boolean;
  antiPhishingCode?: string;
  sessionTimeout: number; // in minutes
}

// Alias for backward compatibility with existing user code
export type SecuritySettings = UserSecuritySettings;

export interface EmailOTP {
  code: string;
  expiresAt: Timestamp;
  attempts: number;
  verified: boolean;
}

// ═══════════════════════════════════════════════════════════
// ADMIN-FACING SECURITY TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Platform-wide security rules configured by the admin.
 */
export interface GlobalSecuritySettings {
  require2FAForWithdrawals: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  minWithdrawalAmountUSD: number;
  maintenanceMode: boolean;
  updatedAt: Timestamp | Date;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  type: "login" | "withdrawal" | "security" | "system";
  details: string;
  metadata?: Record<string, any>;
  createdAt: Date | Timestamp;
  read: boolean;
  reviewed: boolean;
}
