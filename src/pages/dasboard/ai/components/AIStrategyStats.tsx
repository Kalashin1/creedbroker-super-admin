// src/components/admin/ai/AIStrategyStats.tsx
import React from "react";
import { Bot, TrendingUp, Activity, Target } from "lucide-react";
import type { AIStrategy } from "../../../../types/ai.types";

interface Props {
  strategies: AIStrategy[];
}

export const AIStrategyStats: React.FC<Props> = ({ strategies }) => {
  const stats = {
    total: strategies.length,
    active: strategies.filter((s) => s.status === "active").length,
    totalProfit: strategies.reduce((sum, s) => sum + (s.totalProfit || 0), 0),
    avgWinRate:
      strategies.length > 0
        ? strategies.reduce((sum, s) => sum + (s.winRate || 0), 0) /
          strategies.length
        : 0,
  };

  const cards = [
    {
      label: "Total Strategies",
      value: stats.total.toString(),
      icon: Bot,
      color: "violet",
    },
    {
      label: "Active Bots",
      value: stats.active.toString(),
      icon: Activity,
      color: "emerald",
    },
    {
      label: "Total Profit",
      value: `$${stats.totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: "cyan",
    },
    {
      label: "Avg Win Rate",
      value: `${stats.avgWinRate.toFixed(1)}%`,
      icon: Target,
      color: "amber",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      violet: {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/20",
      },
      emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      },
      cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/20",
      },
      amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
      },
    };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const colors = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${colors.text}`} />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
            </div>
            <p className={`text-2xl font-bold ${colors.text} tabular-nums`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};
