import { Timestamp } from "firebase/firestore";

export type PackageTier =
  | "starter"
  | "professional"
  | "premium"
  | "elite"
  | "institutional";
export type InvestmentStatus = "active" | "completed" | "pending" | "cancelled" | "rejected";

// Database-friendly version (what Firestore stores)
export interface DbInvestmentPackage {
  id: string;
  name: string;
  tier: PackageTier;
  minInvestment: number;
  maxInvestment: number;
  duration: number;
  roi: number;
  dailyProfit: number;
  popular?: boolean;
  features: string[];
  accentFrom: string;
  accentTo: string;
  iconName: string; // e.g., "TrendingUp", "Zap", "Crown"
}

// UI version (what your components use)
export interface InvestmentPackage extends Omit<
  DbInvestmentPackage,
  "iconName"
> {
  icon: React.ReactNode;
}

export interface UserInvestment {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  duration: number;
  roi: number;
  status: InvestmentStatus;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}


// ═══════════════════════════════════════════════════════════
// USER-SIDE TYPES (used by clients)
// ═══════════════════════════════════════════════════════════


export interface InvestmentPackage {
  id: string;
  name: string;
  tier: PackageTier;
  minInvestment: number;
  maxInvestment: number;
  duration: number; // days
  roi: number; // percentage
  dailyProfit: number; // percentage
  popular?: boolean;
  features: string[];
  accentFrom: string; // tailwind gradient "from-"
  accentTo: string; // tailwind gradient "to-"
  iconName: string; // Lucide icon name for DB compatibility
}

export interface UserInvestment {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  duration: number;
  roi: number;
  status: InvestmentStatus;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════
// ADMIN-SIDE TYPES (used by admin panel)
// ═══════════════════════════════════════════════════════════

/**
 * Denormalized investment view for admin purposes.
 * Includes user info to avoid N+1 queries in the admin UI.
 */
export interface AdminInvestment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  tier: PackageTier;
  amount: number;
  currency: string;
  duration: number;
  roi: number;
  dailyProfit: number;
  totalProfit: number;
  status: InvestmentStatus;
  startDate: Date;
  endDate?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export type InvestmentAction =
  | 'view'
  | 'approve'
  | 'activate'
  | 'complete'
  | 'cancel'
  | 'reject'
  | 'send_notification'
  | 'adjust_profit';

export interface InvestmentFilters {
  search: string;
  status: InvestmentStatus | 'all';
  tier: PackageTier | 'all';
}

export interface InvestmentStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  totalInvested: number;
  totalProfit: number;
}