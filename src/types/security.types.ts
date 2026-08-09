// src/types/security.types.ts
import { Timestamp } from "firebase/firestore";

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

export interface SecuritySettings {
  emailNotifications: boolean;
  loginAlerts: boolean;
  withdrawalAlerts: boolean;
  withdrawalWhitelist: boolean;
  twoFactorEnabled: boolean;
  antiPhishingCode?: string;
  sessionTimeout: number; // in minutes
}

export interface EmailOTP {
  code: string;
  expiresAt: Timestamp;
  attempts: number;
  verified: boolean;
}
