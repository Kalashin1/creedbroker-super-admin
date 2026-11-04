// src/services/aiTrader.service.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  // where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  TradingSignal,
  AIStrategy,
  UserAIStats,
} from "../types/ai.types"

// ─── Global Collections ───
const GLOBAL_SIGNALS_COLLECTION = "aiSignals"; // Live signals broadcasted to all users
const GLOBAL_STRATEGIES_COLLECTION = "aiStrategies"; // Marketplace strategies

// ─── User Subcollections ───
const getUserSignalsCollection = (userId: string) =>
  collection(db, "users", userId, "aiSignals");
const getUserStrategiesCollection = (userId: string) =>
  collection(db, "users", userId, "aiStrategies");
const getUserAIStatsDoc = (userId: string) =>
  doc(db, "users", userId, "aiStats", "main");

// ═══════════════════════════════════════════════════════════
// SIGNALS
// ═══════════════════════════════════════════════════════════

/**
 * Subscribes to real-time live trading signals.
 * Returns an unsubscribe function to clean up the listener.
 */
export const subscribeToLiveSignals = (
  _userId: string,
  callback: (signals: TradingSignal[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  try {
    const q = query(
      collection(db, GLOBAL_SIGNALS_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(50),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const signals: TradingSignal[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            pair: data.pair,
            type: data.type,
            confidence: data.confidence,
            entryPrice: data.entryPrice,
            targetPrice: data.targetPrice,
            stopLoss: data.stopLoss,
            timestamp: data.timestamp?.toDate() || new Date(),
            aiModel: data.aiModel,
            reasoning: data.reasoning,
            outcome: data.outcome || "pending",
          };
        });
        callback(signals);
      },
      (error) => {
        console.error("Signal subscription error:", error);
        onError?.(error);
      },
    );
  } catch (error) {
    console.error("Failed to subscribe to signals:", error);
    return () => {};
  }
};

/**
 * Fetches the user's historical signals (past signals they've received).
 */
export const fetchUserSignalHistory = async (
  userId: string,
  limitCount: number = 100,
): Promise<TradingSignal[]> => {
  try {
    const q = query(
      getUserSignalsCollection(userId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        pair: data.pair,
        type: data.type,
        confidence: data.confidence,
        entryPrice: data.entryPrice,
        targetPrice: data.targetPrice,
        stopLoss: data.stopLoss,
        timestamp: data.timestamp?.toDate() || new Date(),
        aiModel: data.aiModel,
        reasoning: data.reasoning,
        outcome: data.outcome || "pending",
      };
    });
  } catch (error) {
    console.error("Error fetching signal history:", error);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════
// STRATEGIES
// ═══════════════════════════════════════════════════════════

/**
 * Fetches all available strategies from the marketplace (global collection).
 */
export const fetchMarketplaceStrategies = async (): Promise<AIStrategy[]> => {
  try {
    const q = query(
      collection(db, GLOBAL_STRATEGIES_COLLECTION),
      orderBy("winRate", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        status: data.status || "stopped",
        riskLevel: data.riskLevel,
        totalProfit: data.totalProfit || 0,
        totalTrades: data.totalTrades || 0,
        winRate: data.winRate || 0,
        activeSince: data.activeSince?.toDate(),
        allocation: data.allocation || 0,
        pairs: data.pairs || [],
      };
    });
  } catch (error) {
    console.error("Error fetching marketplace strategies:", error);
    return [];
  }
};

/**
 * Fetches the user's activated strategies.
 */
export const fetchUserStrategies = async (
  userId: string,
): Promise<AIStrategy[]> => {
  try {
    const q = query(
      getUserStrategiesCollection(userId),
      orderBy("activatedAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        status: data.status,
        riskLevel: data.riskLevel,
        totalProfit: data.totalProfit || 0,
        totalTrades: data.totalTrades || 0,
        winRate: data.winRate || 0,
        activeSince: data.activeSince?.toDate(),
        allocation: data.allocation || 0,
        pairs: data.pairs || [],
        userId: data.userId,
        activatedAt: data.activatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching user strategies:", error);
    return [];
  }
};

/**
 * Activates a strategy from the marketplace for a specific user.
 * Copies the strategy data into the user's subcollection.
 */
export const activateStrategy = async (
  userId: string,
  strategy: AIStrategy,
  allocation: number = 10,
): Promise<string> => {
  const userStrategiesRef = getUserStrategiesCollection(userId);

  const docRef = await addDoc(userStrategiesRef, {
    name: strategy.name,
    description: strategy.description,
    status: "active",
    riskLevel: strategy.riskLevel,
    totalProfit: 0,
    totalTrades: 0,
    winRate: strategy.winRate,
    activeSince: serverTimestamp(),
    allocation,
    pairs: strategy.pairs,
    userId,
    activatedAt: serverTimestamp(),
    sourceStrategyId: strategy.id,
  });

  return docRef.id;
};

/**
 * Toggles a strategy's status (active ↔ paused).
 */
export const toggleStrategyStatus = async (
  userId: string,
  strategyId: string,
): Promise<void> => {
  const strategyRef = doc(getUserStrategiesCollection(userId), strategyId);
  const snapshot = await getDoc(strategyRef);

  if (!snapshot.exists()) throw new Error("Strategy not found");

  const currentStatus = snapshot.data().status;
  const newStatus = currentStatus === "active" ? "paused" : "active";

  await updateDoc(strategyRef, { status: newStatus });
};

/**
 * Deactivates (removes) a strategy from the user's account.
 */
export const deactivateStrategy = async (
  userId: string,
  strategyId: string,
): Promise<void> => {
  const strategyRef = doc(getUserStrategiesCollection(userId), strategyId);
  await deleteDoc(strategyRef);
};

// ═══════════════════════════════════════════════════════════
// AI STATS
// ═══════════════════════════════════════════════════════════

/**
 * Fetches the user's aggregated AI performance stats.
 */
export const fetchUserAIStats = async (
  userId: string,
): Promise<UserAIStats | null> => {
  try {
    const statsRef = getUserAIStatsDoc(userId);
    const snapshot = await getDoc(statsRef);

    if (!snapshot.exists()) {
      // Return default stats if none exist
      return {
        totalProfit: 0,
        totalTrades: 0,
        winRate: 0,
        accuracy: 0,
        signalsReceived: 0,
        lastUpdated: serverTimestamp() as any,
      };
    }

    const data = snapshot.data();
    return {
      totalProfit: data.totalProfit || 0,
      totalTrades: data.totalTrades || 0,
      winRate: data.winRate || 0,
      accuracy: data.accuracy || 0,
      signalsReceived: data.signalsReceived || 0,
      lastUpdated: data.lastUpdated,
    };
  } catch (error) {
    console.error("Error fetching AI stats:", error);
    return null;
  }
};

/**
 * Updates the user's AI stats (called by backend or admin).
 */
export const updateUserAIStats = async (
  userId: string,
  stats: Partial<Omit<UserAIStats, "lastUpdated">>,
): Promise<void> => {
  const statsRef = getUserAIStatsDoc(userId);
  const snapshot = await getDoc(statsRef);

  if (snapshot.exists()) {
    await updateDoc(statsRef, {
      ...stats,
      lastUpdated: serverTimestamp(),
    });
  } else {
    // Create the document if it doesn't exist
    const { setDoc } = await import("firebase/firestore");
    await setDoc(statsRef, {
      totalProfit: 0,
      totalTrades: 0,
      winRate: 0,
      accuracy: 0,
      signalsReceived: 0,
      ...stats,
      lastUpdated: serverTimestamp(),
    });
  }
};

// ═══════════════════════════════════════════════════════════
// PERFORMANCE HISTORY
// ═══════════════════════════════════════════════════════════

/**
 * Fetches the user's AI performance history for charts.
 */
export const fetchAIPerformanceHistory = async (
  userId: string,
  days: number = 30,
): Promise<
  { date: string; profit: number; accuracy: number; signalsGenerated: number }[]
> => {
  try {
    const q = query(
      collection(db, "users", userId, "aiPerformance"),
      orderBy("date", "desc"),
      limit(days),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          date: data.date,
          profit: data.profit || 0,
          accuracy: data.accuracy || 0,
          signalsGenerated: data.signalsGenerated || 0,
        };
      })
      .reverse(); // Oldest first for chart rendering
  } catch (error) {
    console.error("Error fetching AI performance history:", error);
    return [];
  }
};


// Add this to the bottom of src/services/aiTrader.service.ts

/**
 * Creates a new global AI strategy (Admin only).
 */
export const createAIStrategy = async (
  strategy: Omit<AIStrategy, "id" | "activeSince" | "userId" | "activatedAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, GLOBAL_STRATEGIES_COLLECTION), {
    ...strategy,
    activeSince: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Updates an existing global AI strategy (Admin only).
 */
export const updateAIStrategy = async (
  strategyId: string,
  data: Partial<Omit<AIStrategy, "id" | "userId" | "activatedAt">>
): Promise<void> => {
  const strategyRef = doc(db, GLOBAL_STRATEGIES_COLLECTION, strategyId);
  await updateDoc(strategyRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Deletes a global AI strategy (Admin only).
 */
export const deleteAIStrategy = async (strategyId: string): Promise<void> => {
  await deleteDoc(doc(db, GLOBAL_STRATEGIES_COLLECTION, strategyId));
};