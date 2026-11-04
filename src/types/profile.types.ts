// src/types/adminProfile.types.ts
import { Timestamp } from 'firebase/firestore';

export type AdminAction =
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'kyc_revoked'
  | 'user_blocked'
  | 'user_unblocked'
  | 'user_restricted'
  | 'user_unrestricted'
  | 'balance_adjusted'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'deposit_confirmed'
  | 'deposit_rejected'
  | 'recovery_phrase_viewed'
  | 'recovery_phrase_sent'
  | 'wallet_frozen'
  | 'wallet_unfrozen'
  | 'wallet_generated'
  | 'email_sent';

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AdminAction;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AdminPreferences {
  emailNotifications: boolean;
  securityAlerts: boolean;
  kycAlerts: boolean;
  withdrawalAlerts: boolean;
  timezone: string;
  language: string;
}