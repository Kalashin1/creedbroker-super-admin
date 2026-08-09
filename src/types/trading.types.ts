// src/types/trading.types.ts
export type TradeDirection = "buy" | "sell";

export type TradeType = "buy" | "sell";
export type TradeStatus = "open" | "closed" | "cancelled";

export interface TradeOrder {
  id: string;
  userId: string;
  pair: string;
  type: TradeType;
  amount: number; // Margin amount in USD
  leverage: number;
  entryPrice: number;
  status: TradeStatus;
  createdAt: Date;
  closedAt?: Date;
  profitLoss?: number;
}

export interface TradingFormData {
  direction: TradeDirection;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  usePercentage: boolean;
}
