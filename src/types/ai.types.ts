// src/types/ai-trader.types.ts
import { Timestamp } from "firebase/firestore";

export type SignalType = "buy" | "sell" | "hold";
export type SignalConfidence = "high" | "medium" | "low";
export type StrategyStatus = "active" | "paused" | "stopped";
export type RiskLevel = "conservative" | "moderate" | "aggressive";

export interface TradingSignal {
  id: string;
  pair: string;
  type: SignalType;
  confidence: SignalConfidence;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  timestamp: Date;
  aiModel: string;
  reasoning: string;
  outcome?: "win" | "loss" | "pending"; // Added for tracking
}

export interface AIStrategy {
  id: string;
  name: string;
  description: string;
  status: StrategyStatus;
  riskLevel: RiskLevel;
  totalProfit: number;
  totalTrades: number;
  winRate: number;
  activeSince?: Date;
  allocation: number;
  pairs: string[];
  // 🆕 User-specific fields
  userId?: string;
  activatedAt?: Timestamp;
}

export interface AIModel {
  id: string;
  name: string;
  accuracy: number;
  totalSignals: number;
  avgROI: number;
  specialty: string;
}

export interface AIPerformanceData {
  date: string;
  profit: number;
  accuracy: number;
  signalsGenerated: number;
}

// 🆕 User's AI Stats stored on their profile
export interface UserAIStats {
  totalProfit: number;
  totalTrades: number;
  winRate: number;
  accuracy: number;
  signalsReceived: number;
  lastUpdated: Timestamp;
}


